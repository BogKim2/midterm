export interface User {
  id: string
  email: string
  display_name: string | null
  avatar_url: string | null
  is_admin: boolean
}

export interface Ingredient {
  id: string
  name: string
  original_name: string | null
  quantity: number | null
  unit: string | null
  expiry_date: string | null
  category: string
  source: 'manual' | 'ai_analysis'
  created_at: string
}

export interface Refrigerator {
  id: string
  name: string
  ingredients: Ingredient[]
}

export interface QuotaStatus {
  year_month: string
  plan_type: 'free' | 'premium'
  reset_date: string
  analysis_usage: number
  analysis_limit: number
  analysis_remaining: number
  recipe_usage: number
  recipe_limit: number
  recipe_remaining: number
}

export interface DetectedIngredient {
  name: string
  quantity: number | null
  unit: string | null
  confidence: number
}

export interface RecipeCandidate {
  dish: string
  description: string
  difficulty: '쉬움' | '보통' | '어려움'
}

export interface RecipeDetail {
  title: string
  ingredients: { name: string; amount: string }[]
  steps: string[]
  cooking_time: string
  difficulty: string
  tips: string
  missing_ingredients: string[]
  nutrition?: {
    calories?: number
    protein?: number
    carbs?: number
    fat?: number
  }
}

export interface LmStudioHealth {
  status: 'ok' | 'error'
  models: string[]
  vision_models: string[]
  has_vision: boolean
  message?: string
}
