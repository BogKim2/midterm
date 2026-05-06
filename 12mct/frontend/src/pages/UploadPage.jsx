import { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useApp } from '../contexts/AppContext';
import { MEAL_TYPES, todayStr } from '../utils/calculations';

const API = import.meta.env.VITE_API_URL || 'http://localhost:8000';

export default function UploadPage() {
  const { pendingItems, setPendingItems, setPendingMeta } = useApp();
  const navigate = useNavigate();
  const galleryRef = useRef(null);
  const cameraRef = useRef(null);
  const [date, setDate] = useState(todayStr());
  const [mealType, setMealType] = useState('점심');
  const [phase, setPhase] = useState('ready');
  const [imageFile, setImageFile] = useState(null);
  const [previewUrl, setPreviewUrl] = useState('');
  const [prediction, setPrediction] = useState(null);
  const [categories, setCategories] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState('');
  const [manualFoods, setManualFoods] = useState([]);
  const [error, setError] = useState('');

  useEffect(() => {
    fetch(`${API}/api/categories`)
      .then((res) => res.json())
      .then((data) => setCategories(data.categories || []))
      .catch(() => setCategories([]));
  }, []);

  async function runPredict(file) {
    setError('');
    setPhase('predicting');
    const body = new FormData();
    body.append('file', file);

    try {
      const response = await fetch(`${API}/api/predict`, { method: 'POST', body });
      if (!response.ok) {
        throw new Error(`예측 요청 실패: ${response.status}`);
      }
      const data = await response.json();
      setPrediction(data);
      setPhase('confirm');
    } catch (err) {
      setError(err.message);
      setPhase('ready');
    }
  }

  async function runPredictWithHint(category) {
    if (!imageFile) {
      return;
    }
    setSelectedCategory(category);
    setError('');
    setPhase('predicting');
    const body = new FormData();
    body.append('file', imageFile);
    body.append('category', category);
    body.append('top_k', '1');

    try {
      const response = await fetch(`${API}/api/predict-with-hint`, { method: 'POST', body });
      if (!response.ok) {
        throw new Error(`힌트 예측 실패: ${response.status}`);
      }
      const data = await response.json();
      const top = data.top_predictions[0];
      setPrediction({
        predicted_class: top.food_class,
        confidence: top.confidence,
        nutrition: top.nutrition,
        insight: top.insight ?? prediction?.insight ?? null,
      });
      setPhase('confirm');
    } catch (err) {
      setError(err.message);
      setPhase('hint');
    }
  }

  async function loadManualFoods(category) {
    setSelectedCategory(category);
    const response = await fetch(`${API}/api/foods?category=${encodeURIComponent(category)}`);
    const data = await response.json();
    setManualFoods(Object.entries(data.foods || {}).map(([foodClass, food]) => ({ food_class: foodClass, ...food })));
  }

  function handleImage(file) {
    if (!file) {
      return;
    }
    setImageFile(file);
    setPreviewUrl(URL.createObjectURL(file));
    runPredict(file);
  }

  function addPending(food) {
    setPendingMeta({ date, mealType });
    setPendingItems((items) => [
      ...items,
      {
        id: crypto.randomUUID(),
        ...food,
        insight: prediction?.insight ?? null,
      },
    ]);
    setPrediction(null);
    setPhase('ready');
    setPreviewUrl('');
    setImageFile(null);
    setError('');
  }

  return (
    <div className="min-h-svh bg-[#fff8f8] px-5 pb-20 pt-6">
      <div className="mb-5 flex items-center justify-between">
        <div>
          <p className="text-xs uppercase tracking-[0.22em] text-[#FF85A1]">Upload</p>
          <h1 className="mt-2 text-2xl font-black text-slate-900">음식 사진 업로드</h1>
        </div>
        {pendingItems.length > 0 && (
          <button
            onClick={() => navigate('/result')}
            className="rounded-2xl bg-[#111827] px-4 py-3 text-sm font-semibold text-white"
          >
            결과 보기 {pendingItems.length}
          </button>
        )}
      </div>

      <div className="mb-4 grid grid-cols-2 gap-3">
        <label className="block">
          <span className="mb-2 block text-sm font-semibold text-slate-700">날짜</span>
          <input
            type="date"
            value={date}
            max={todayStr()}
            onChange={(event) => setDate(event.target.value)}
            className="w-full rounded-2xl border bg-white px-4 py-3 outline-none"
            style={{ borderColor: '#FCE4EC' }}
          />
        </label>
        <label className="block">
          <span className="mb-2 block text-sm font-semibold text-slate-700">식사 종류</span>
          <select
            value={mealType}
            onChange={(event) => setMealType(event.target.value)}
            className="w-full rounded-2xl border bg-white px-4 py-3 outline-none"
            style={{ borderColor: '#FCE4EC' }}
          >
            {MEAL_TYPES.map((item) => (
              <option key={item}>{item}</option>
            ))}
          </select>
        </label>
      </div>

      {phase === 'ready' && (
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-3">
            <button
              onClick={() => galleryRef.current?.click()}
              className="rounded-3xl border-2 border-dashed bg-white px-4 py-10 text-sm font-semibold text-slate-600"
              style={{ borderColor: '#FCE4EC' }}
            >
              사진 보관함
            </button>
            <button
              onClick={() => cameraRef.current?.click()}
              className="rounded-3xl border-2 border-dashed bg-white px-4 py-10 text-sm font-semibold text-slate-600"
              style={{ borderColor: '#FCE4EC' }}
            >
              카메라 촬영
            </button>
          </div>

          <input ref={galleryRef} type="file" accept="image/*" hidden onChange={(event) => handleImage(event.target.files?.[0])} />
          <input
            ref={cameraRef}
            type="file"
            accept="image/*"
            capture="environment"
            hidden
            onChange={(event) => handleImage(event.target.files?.[0])}
          />

          <div className="rounded-3xl border bg-white p-5" style={{ borderColor: '#FCE4EC' }}>
            <p className="text-sm font-semibold text-slate-800">직접 선택</p>
            <p className="mt-1 text-sm text-slate-500">AI가 계속 틀릴 때는 카테고리와 음식명을 직접 고를 수 있습니다.</p>
            <button
              onClick={() => setPhase('manual')}
              className="mt-4 rounded-2xl border px-4 py-3 text-sm font-semibold text-slate-700"
              style={{ borderColor: '#FCE4EC' }}
            >
              직접 고르기
            </button>
          </div>
        </div>
      )}

      {phase === 'predicting' && (
        <div className="rounded-3xl border bg-white p-6 text-center" style={{ borderColor: '#FCE4EC' }}>
          {previewUrl && <img src={previewUrl} alt="preview" className="mx-auto mb-4 h-52 w-full rounded-3xl object-cover" />}
          <div className="mx-auto mb-4 h-10 w-10 animate-spin rounded-full border-4 border-[#FCE4EC] border-t-[#FF85A1]" />
          <p className="text-sm font-semibold text-slate-800">AI가 음식과 영양 정보를 분석 중입니다.</p>
          <p className="mt-1 text-sm text-slate-500">
            {selectedCategory ? `${selectedCategory} 카테고리로 다시 분류 중` : 'Food-101 분류 + LM Studio 코멘트 생성'}
          </p>
        </div>
      )}

      {phase === 'confirm' && prediction && (
        <div className="space-y-4">
          {previewUrl && <img src={previewUrl} alt="preview" className="h-56 w-full rounded-[28px] object-cover" />}
          <div className="rounded-[28px] border bg-white p-5" style={{ borderColor: '#FCE4EC' }}>
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="text-xs uppercase tracking-[0.22em] text-[#FF85A1]">Prediction</p>
                <h2 className="mt-2 text-2xl font-black text-slate-900">{prediction.nutrition.name_ko}</h2>
                <p className="mt-1 text-sm text-slate-500">{prediction.nutrition.category}</p>
              </div>
              <div className="rounded-2xl bg-[#fff1f4] px-3 py-2 text-sm font-semibold text-[#FF85A1]">
                {Math.round((prediction.confidence || 0) * 100)}%
              </div>
            </div>

            <div className="mt-5 grid grid-cols-4 gap-3 text-center">
              {[
                ['칼로리', prediction.nutrition.calorie, 'kcal'],
                ['탄수화물', prediction.nutrition.carbs_g, 'g'],
                ['단백질', prediction.nutrition.protein_g, 'g'],
                ['지방', prediction.nutrition.fat_g, 'g'],
              ].map(([label, value, unit]) => (
                <div key={label} className="rounded-2xl bg-[#fff8f8] px-2 py-3">
                  <p className="text-base font-black text-slate-900">{value}{unit}</p>
                  <p className="mt-1 text-xs text-slate-500">{label}</p>
                </div>
              ))}
            </div>

            {prediction.insight && (
              <div className="mt-5 rounded-3xl bg-[#111827] p-5 text-white">
                <p className="text-xs uppercase tracking-[0.22em] text-white/60">LM Studio Insight</p>
                <p className="mt-2 text-lg font-bold">{prediction.insight.title}</p>
                <p className="mt-2 text-sm leading-6 text-white/80">{prediction.insight.summary}</p>
                <ul className="mt-3 space-y-2 text-sm text-white/80">
                  {(prediction.insight.tips || []).map((tip) => (
                    <li key={tip}>• {tip}</li>
                  ))}
                </ul>
              </div>
            )}
          </div>

          <div className="grid grid-cols-2 gap-3">
            <button
              onClick={() => addPending(prediction.nutrition)}
              className="rounded-2xl bg-[#10B981] px-4 py-4 text-sm font-semibold text-white"
            >
              이 결과로 추가
            </button>
            <button
              onClick={() => setPhase('hint')}
              className="rounded-2xl border px-4 py-4 text-sm font-semibold text-red-500"
              style={{ borderColor: '#FCA5A5', backgroundColor: '#fff' }}
            >
              다른 음식이에요
            </button>
          </div>
        </div>
      )}

      {phase === 'hint' && (
        <div className="space-y-4">
          <div className="rounded-3xl border bg-white p-5" style={{ borderColor: '#FCE4EC' }}>
            <h3 className="text-lg font-bold text-slate-900">카테고리 힌트</h3>
            <p className="mt-2 text-sm text-slate-500">비슷한 음식군을 고르면 그 범위 안에서 다시 분류합니다.</p>
          </div>
          <div className="grid grid-cols-2 gap-3">
            {categories.map((category) => (
              <button
                key={category}
                onClick={() => runPredictWithHint(category)}
                className="rounded-2xl border bg-white px-4 py-4 text-sm font-semibold text-slate-700"
                style={{ borderColor: selectedCategory === category ? '#FF85A1' : '#FCE4EC' }}
              >
                {category}
              </button>
            ))}
          </div>
          <button
            onClick={() => setPhase('manual')}
            className="w-full rounded-2xl border px-4 py-4 text-sm font-semibold text-slate-700"
            style={{ borderColor: '#FCE4EC', backgroundColor: '#fff' }}
          >
            직접 음식 선택
          </button>
        </div>
      )}

      {phase === 'manual' && (
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-3">
            {categories.map((category) => (
              <button
                key={category}
                onClick={() => loadManualFoods(category)}
                className="rounded-2xl border bg-white px-4 py-3 text-sm font-semibold text-slate-700"
                style={{ borderColor: selectedCategory === category ? '#FF85A1' : '#FCE4EC' }}
              >
                {category}
              </button>
            ))}
          </div>
          <div className="space-y-3">
            {manualFoods.map((food) => (
              <button
                key={food.food_class}
                onClick={() => addPending(food)}
                className="w-full rounded-3xl border bg-white p-4 text-left"
                style={{ borderColor: '#FCE4EC' }}
              >
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-semibold text-slate-900">{food.name_ko}</p>
                    <p className="mt-1 text-sm text-slate-500">{food.category}</p>
                  </div>
                  <p className="text-sm font-semibold text-[#FF85A1]">{food.calorie} kcal</p>
                </div>
              </button>
            ))}
          </div>
        </div>
      )}

      {error && <div className="mt-4 rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-600">{error}</div>}
    </div>
  );
}
