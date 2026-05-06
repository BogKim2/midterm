import { useMemo } from 'react';
import BottomNav from '../components/BottomNav';
import { useApp } from '../contexts/AppContext';
import { formatDate, sumNutrition } from '../utils/calculations';

export default function HistoryPage() {
  const { getAllMeals } = useApp();
  const meals = getAllMeals();

  const grouped = useMemo(() => {
    return Object.entries(
      meals.reduce((acc, meal) => {
        if (!acc[meal.date]) {
          acc[meal.date] = [];
        }
        acc[meal.date].push(meal);
        return acc;
      }, {}),
    ).sort((a, b) => b[0].localeCompare(a[0]));
  }, [meals]);

  return (
    <div className="min-h-svh bg-[#fff8f8] px-5 pb-28 pt-6">
      <p className="text-xs uppercase tracking-[0.22em] text-[#FF85A1]">History</p>
      <h1 className="mt-2 text-2xl font-black text-slate-900">식사 히스토리</h1>

      <div className="mt-6 space-y-4">
        {grouped.length === 0 ? (
          <div className="rounded-3xl border bg-white p-6 text-sm text-slate-500" style={{ borderColor: '#FCE4EC' }}>
            저장된 식사 기록이 없습니다.
          </div>
        ) : (
          grouped.map(([date, dayMeals]) => {
            const total = sumNutrition(dayMeals.flatMap((meal) => meal.foods));
            return (
              <section key={date} className="rounded-3xl border bg-white p-5" style={{ borderColor: '#FCE4EC' }}>
                <div className="flex items-center justify-between">
                  <div>
                    <h2 className="text-lg font-bold text-slate-900">{formatDate(date)}</h2>
                    <p className="text-sm text-slate-500">{dayMeals.length}개 식사 기록</p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-semibold text-[#FF85A1]">{Math.round(total.calorie)} kcal</p>
                    <p className="text-xs text-slate-400">총 섭취</p>
                  </div>
                </div>

                <div className="mt-4 space-y-3">
                  {dayMeals.map((meal) => (
                    <div key={meal.id} className="rounded-2xl bg-[#fff8f8] px-4 py-3">
                      <div className="flex items-center justify-between">
                        <p className="font-semibold text-slate-900">{meal.mealType}</p>
                        <p className="text-sm text-slate-500">{Math.round(meal.total.calorie)} kcal</p>
                      </div>
                      <p className="mt-1 text-sm text-slate-500">
                        {meal.foods.map((food) => food.name_ko).join(', ')}
                      </p>
                    </div>
                  ))}
                </div>
              </section>
            );
          })
        )}
      </div>

      <BottomNav />
    </div>
  );
}
