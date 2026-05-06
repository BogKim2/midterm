import { useNavigate } from 'react-router-dom';
import BottomNav from '../components/BottomNav';
import NutritionBar from '../components/NutritionBar';
import { useApp } from '../contexts/AppContext';
import { calcExercise, MEAL_TYPES, sumNutrition, todayStr } from '../utils/calculations';

export default function HomePage() {
  const { activeProfile, getMealsForDate } = useApp();
  const navigate = useNavigate();
  const todayMeals = getMealsForDate(todayStr());
  const nutrition = sumNutrition(todayMeals.flatMap((meal) => meal.foods));
  const exercise = calcExercise(activeProfile.weight_kg, nutrition.calorie);
  const caloriePct = Math.min((nutrition.calorie / activeProfile.target_calories) * 100, 100);

  return (
    <div className="min-h-svh bg-[#fff8f8] pb-28">
      <div className="px-5 pb-4 pt-6">
        <div className="flex items-start justify-between">
          <div>
            <p className="text-xs uppercase tracking-[0.22em] text-[#FF85A1]">Today</p>
            <h1 className="mt-2 text-2xl font-black text-slate-900">{activeProfile.name}님의 식단</h1>
            <p className="mt-1 text-sm text-slate-500">
              목표 {activeProfile.target_calories} kcal · 단백질 {activeProfile.target_protein_g}g
            </p>
          </div>
          <button
            onClick={() => navigate('/profile')}
            className="rounded-2xl border bg-white px-4 py-3 text-sm font-semibold text-slate-600"
            style={{ borderColor: '#FCE4EC' }}
          >
            프로필 전환
          </button>
        </div>
      </div>

      <div className="space-y-4 px-5">
        <section className="rounded-[28px] bg-gradient-to-br from-[#ff8faa] to-[#ffc6d0] p-5 text-white">
          <p className="text-sm text-white/75">오늘 섭취 칼로리</p>
          <h2 className="mt-2 text-4xl font-black">{Math.round(nutrition.calorie)} kcal</h2>
          <div className="mt-5 h-3 rounded-full bg-white/30">
            <div className="h-3 rounded-full bg-white" style={{ width: `${caloriePct}%` }} />
          </div>
          <p className="mt-2 text-right text-sm text-white/85">{Math.round(caloriePct)}% 달성</p>
        </section>

        <section className="rounded-3xl border bg-white p-5" style={{ borderColor: '#FCE4EC' }}>
          <h3 className="mb-4 text-sm font-bold text-slate-800">오늘 영양 요약</h3>
          <NutritionBar
            label="탄수화물"
            current={nutrition.carbs_g}
            target={activeProfile.target_carbs_g}
            color="#60A5FA"
          />
          <NutritionBar
            label="단백질"
            current={nutrition.protein_g}
            target={activeProfile.target_protein_g}
            color="#34D399"
          />
          <NutritionBar
            label="지방"
            current={nutrition.fat_g}
            target={activeProfile.target_fat_g}
            color="#F59E0B"
          />
        </section>

        <button
          onClick={() => navigate('/upload')}
          className="w-full rounded-3xl bg-[#111827] px-5 py-4 text-base font-semibold text-white"
        >
          음식 사진 업로드
        </button>

        <section className="grid grid-cols-3 gap-3">
          <div className="rounded-3xl border bg-white p-4 text-center" style={{ borderColor: '#FCE4EC' }}>
            <p className="text-xs text-slate-400">러닝</p>
            <p className="mt-2 text-xl font-black text-[#FF85A1]">{exercise.running_km}km</p>
          </div>
          <div className="rounded-3xl border bg-white p-4 text-center" style={{ borderColor: '#FCE4EC' }}>
            <p className="text-xs text-slate-400">걷기</p>
            <p className="mt-2 text-xl font-black text-[#FF85A1]">{exercise.walking_min}분</p>
          </div>
          <div className="rounded-3xl border bg-white p-4 text-center" style={{ borderColor: '#FCE4EC' }}>
            <p className="text-xs text-slate-400">자전거</p>
            <p className="mt-2 text-xl font-black text-[#FF85A1]">{exercise.cycling_min}분</p>
          </div>
        </section>

        <section className="rounded-3xl border bg-white p-5" style={{ borderColor: '#FCE4EC' }}>
          <div className="mb-4 flex items-center justify-between">
            <h3 className="text-sm font-bold text-slate-800">오늘 기록</h3>
            <button className="text-sm font-semibold text-[#FF85A1]" onClick={() => navigate('/history')}>
              전체 보기
            </button>
          </div>
          {todayMeals.length === 0 ? (
            <p className="text-sm leading-6 text-slate-500">아직 기록이 없습니다. 첫 끼를 업로드해보세요.</p>
          ) : (
            <div className="space-y-3">
              {MEAL_TYPES.map((type) => {
                const items = todayMeals.filter((meal) => meal.mealType === type);
                if (items.length === 0) {
                  return null;
                }
                const total = sumNutrition(items.flatMap((meal) => meal.foods));
                return (
                  <div key={type} className="rounded-2xl bg-[#fff8f8] px-4 py-3">
                    <div className="flex items-center justify-between">
                      <p className="font-semibold text-slate-800">{type}</p>
                      <p className="text-sm font-semibold text-[#FF85A1]">{Math.round(total.calorie)} kcal</p>
                    </div>
                    <p className="mt-1 text-sm text-slate-500">
                      {items.flatMap((meal) => meal.foods).map((food) => food.name_ko).join(', ')}
                    </p>
                  </div>
                );
              })}
            </div>
          )}
        </section>
      </div>

      <BottomNav />
    </div>
  );
}
