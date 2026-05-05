export interface User {
  id: number
  email: string
  name: string | null
  image_url: string | null
  provider: string
  default_servings: number
  preferences_json: Record<string, unknown>
  created_at: string
}

export interface FridgeItem {
  id: number
  user_id: number
  common_ingredient_id: number | null
  name: string
  category: string
  quantity: number
  unit: string
  expires_at: string | null
  is_condiment: boolean
  memo: string
  created_at: string
  updated_at: string
}

export interface CommonIngredient {
  id: number
  name: string
  category: string
  default_unit: string
  is_condiment: boolean
}

export interface RecipeIngredient {
  id: number
  custom_name: string
  quantity: number
  unit: string
  is_condiment: boolean
  common_ingredient_id: number | null
}

export interface Recipe {
  id: number
  name: string
  category: string
  cooking_time: number
  calories: number
  instructions: string
  is_public: boolean
  likes: number
  ingredients: RecipeIngredient[]
  created_at: string
}

export interface RecipeWithMatchRate extends Recipe {
  match_rate: number
  missing_ingredients: string[]
}

export interface MealPlan {
  id: number
  user_id: number
  date: string
  meal_type: string
  recipe_id: number | null
  servings: number
  created_at: string
}

export interface ShoppingItem {
  id: number
  user_id: number
  name: string
  category: string
  quantity: number
  unit: string
  checked: boolean
  source: string
  created_at: string
}

export interface AuthToken {
  access_token: string
  token_type: string
  user: User
}
