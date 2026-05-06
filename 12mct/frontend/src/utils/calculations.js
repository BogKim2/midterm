export const ACTIVITY_FACTORS = {
  low: 1.2,
  medium: 1.55,
  high: 1.725,
};

export const ACTIVITY_LABELS = {
  low: '낮음',
  medium: '보통',
  high: '높음',
};

export const MEAL_TYPES = ['아침', '점심', '저녁', '간식'];

export function calcBMR(gender, weight, height, age) {
  if (gender === 'female') {
    return 10 * weight + 6.25 * height - 5 * age - 161;
  }
  return 10 * weight + 6.25 * height - 5 * age + 5;
}

export function calcTDEE(bmr, activity) {
  return bmr * (ACTIVITY_FACTORS[activity] ?? ACTIVITY_FACTORS.medium);
}

export function calcTargets(tdee, weight) {
  return {
    target_calories: Math.round(tdee),
    target_carbs_g: Math.round((tdee * 0.5) / 4),
    target_protein_g: Math.round(Math.max(weight * 1.1, 60)),
    target_fat_g: Math.round((tdee * 0.25) / 9),
  };
}

export function calcExercise(weight, calories) {
  if (!calories || calories <= 0) {
    return { running_km: 0, walking_min: 0, cycling_min: 0 };
  }
  return {
    running_km: +(calories / (weight * 1.036)).toFixed(1),
    walking_min: Math.round(calories / (weight * 0.067)),
    cycling_min: Math.round(calories / (weight * 0.133)),
  };
}

export function sumNutrition(foods) {
  return foods.reduce(
    (acc, food) => ({
      calorie: acc.calorie + Number(food.calorie || 0),
      carbs_g: acc.carbs_g + Number(food.carbs_g || 0),
      protein_g: acc.protein_g + Number(food.protein_g || 0),
      fat_g: acc.fat_g + Number(food.fat_g || 0),
    }),
    { calorie: 0, carbs_g: 0, protein_g: 0, fat_g: 0 },
  );
}

export function todayStr() {
  return new Date().toISOString().slice(0, 10);
}

export function formatDate(dateStr) {
  return new Date(dateStr).toLocaleDateString('ko-KR', {
    month: 'short',
    day: 'numeric',
  });
}
