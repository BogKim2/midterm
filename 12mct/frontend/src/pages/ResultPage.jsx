import { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import BottomNav from '../components/BottomNav';
import NutritionBar from '../components/NutritionBar';
import { useApp } from '../contexts/AppContext';
import { calcExercise, sumNutrition, todayStr } from '../utils/calculations';

const API = import.meta.env.VITE_API_URL || 'http://localhost:8000';

export default function ResultPage() {
  const { activeProfile, pendingItems, pendingMeta, clearPending, getMealsForDate, saveMealEntry } = useApp();
  const navigate = useNavigate();
  const [insight, setInsight] = useState(null);
  const [loading, setLoading] = useState(false);

  const mealTotal = useMemo(() => sumNutrition(pendingItems), [pendingItems]);
  const savedToday = getMealsForDate(pendingMeta?.date || todayStr());
  const savedTotal = sumNutrition(savedToday.flatMap((meal) => meal.foods));
  const todayTotal = {
    calorie: savedTotal.calorie + mealTotal.calorie,
    carbs_g: savedTotal.carbs_g + mealTotal.carbs_g,
    protein_g: savedTotal.protein_g + mealTotal.protein_g,
    fat_g: savedTotal.fat_g + mealTotal.fat_g,
  };
  const exercise = calcExercise(activeProfile.weight_kg, mealTotal.calorie);

  useEffect(() => {
    if (pendingItems.length === 0) {
      navigate('/upload', { replace: true });
      return;
    }
    setLoading(true);
    fetch(`${API}/api/meal-insight`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        foods: pendingItems,
        target_calories: activeProfile.target_calories,
        remaining_calories: Math.max(activeProfile.target_calories - todayTotal.calorie, 0),
      }),
    })
      .then((res) => res.json())
      .then((data) => setInsight(data))
      .catch(() =>
        setInsight({
          source: 'fallback',
          title: '한 끼 분석',
          summary: '로컬 AI 응답을 가져오지 못했습니다. 영양 정보는 정상적으로 저장할 수 있습니다.',
          tips: ['백엔드와 LM Studio 설정을 확인해주세요.'],
        }),
      )
      .finally(() => setLoading(false));
  }, [activeProfile.target_calories, navigate, pendingItems, todayTotal.calorie]);

  function handleSave() {
    saveMealEntry({
      id: crypto.randomUUID(),
      date: pendingMeta?.date || todayStr(),
      mealType: pendingMeta?.mealType || '점심',
      foods: pendingItems,
      total: mealTotal,
      insight,
      savedAt: new Date().toISOString(),
    });
    clearPending();
    navigate('/');
  }

  return (
    <div className="min-h-svh bg-[#fff8f8] pb-28">
      <div className="px-5 pb-4 pt-6">
        <div className="flex items-start justify-between">
          <div>
            <p className="text-xs uppercase tracking-[0.22em] text-[#FF85A1]">Result</p>
            <h1 className="mt-2 text-2xl font-black text-slate-900">식사 결과</h1>
            <p className="mt-1 text-sm text-slate-500">
              {pendingMeta?.date} · {pendingMeta?.mealType}
            </p>
          </div>
          <button
            onClick={() => navigate('/upload')}
            className="rounded-2xl border bg-white px-4 py-3 text-sm font-semibold text-slate-600"
            style={{ borderColor: '#FCE4EC' }}
          >
            계속 추가
          </button>
        </div>
      </div>

      <div className="space-y-4 px-5">
        <section className="rounded-[28px] bg-gradient-to-br from-[#111827] to-[#374151] p-5 text-white">
          <p className="text-sm text-white/70">이번 식사 총합</p>
          <h2 className="mt-2 text-4xl font-black">{Math.round(mealTotal.calorie)} kcal</h2>
          <div className="mt-5 grid grid-cols-3 gap-3 text-center">
            <div className="rounded-2xl bg-white/10 px-3 py-3">
              <div className="text-lg font-black">{Math.round(mealTotal.carbs_g)}g</div>
              <div className="text-xs text-white/60">탄수화물</div>
            </div>
            <div className="rounded-2xl bg-white/10 px-3 py-3">
              <div className="text-lg font-black">{Math.round(mealTotal.protein_g)}g</div>
              <div className="text-xs text-white/60">단백질</div>
            </div>
            <div className="rounded-2xl bg-white/10 px-3 py-3">
              <div className="text-lg font-black">{Math.round(mealTotal.fat_g)}g</div>
              <div className="text-xs text-white/60">지방</div>
            </div>
          </div>
        </section>

        <section className="rounded-3xl border bg-white p-5" style={{ borderColor: '#FCE4EC' }}>
          <h3 className="mb-4 text-sm font-bold text-slate-800">추가된 음식</h3>
          <div className="space-y-3">
            {pendingItems.map((food) => (
              <div key={food.id} className="rounded-2xl bg-[#fff8f8] px-4 py-3">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-semibold text-slate-900">{food.name_ko}</p>
                    <p className="mt-1 text-sm text-slate-500">{food.category}</p>
                  </div>
                  <p className="text-sm font-semibold text-[#FF85A1]">{food.calorie} kcal</p>
                </div>
              </div>
            ))}
          </div>
        </section>

        <section className="rounded-3xl border bg-white p-5" style={{ borderColor: '#FCE4EC' }}>
          <h3 className="mb-4 text-sm font-bold text-slate-800">오늘 누적 영양</h3>
          <NutritionBar label="탄수화물" current={todayTotal.carbs_g} target={activeProfile.target_carbs_g} color="#60A5FA" />
          <NutritionBar label="단백질" current={todayTotal.protein_g} target={activeProfile.target_protein_g} color="#34D399" />
          <NutritionBar label="지방" current={todayTotal.fat_g} target={activeProfile.target_fat_g} color="#F59E0B" />
        </section>

        <section className="rounded-3xl border bg-white p-5" style={{ borderColor: '#FCE4EC' }}>
          <h3 className="mb-4 text-sm font-bold text-slate-800">운동 환산</h3>
          <div className="grid grid-cols-3 gap-3 text-center">
            <div className="rounded-2xl bg-[#fff8f8] px-3 py-3">
              <div className="text-lg font-black text-[#FF85A1]">{exercise.running_km}km</div>
              <div className="text-xs text-slate-500">러닝</div>
            </div>
            <div className="rounded-2xl bg-[#fff8f8] px-3 py-3">
              <div className="text-lg font-black text-[#FF85A1]">{exercise.walking_min}분</div>
              <div className="text-xs text-slate-500">걷기</div>
            </div>
            <div className="rounded-2xl bg-[#fff8f8] px-3 py-3">
              <div className="text-lg font-black text-[#FF85A1]">{exercise.cycling_min}분</div>
              <div className="text-xs text-slate-500">자전거</div>
            </div>
          </div>
        </section>

        <section className="rounded-3xl bg-[#111827] p-5 text-white">
          <p className="text-xs uppercase tracking-[0.22em] text-white/60">LM Studio</p>
          <h3 className="mt-2 text-lg font-bold">{insight?.title || '한 끼 분석'}</h3>
          <p className="mt-2 text-sm leading-6 text-white/80">
            {loading ? 'AI 코멘트를 생성 중입니다.' : insight?.summary}
          </p>
          <ul className="mt-4 space-y-2 text-sm text-white/80">
            {(insight?.tips || []).map((tip) => (
              <li key={tip}>• {tip}</li>
            ))}
          </ul>
        </section>
      </div>

      <div className="fixed bottom-0 left-1/2 w-full -translate-x-1/2 bg-[#fff8f8] px-5 pb-6 pt-3" style={{ maxWidth: 480 }}>
        <button onClick={handleSave} className="w-full rounded-3xl bg-[#FF85A1] px-5 py-4 text-base font-semibold text-white">
          기록 저장
        </button>
      </div>

      <BottomNav />
    </div>
  );
}
