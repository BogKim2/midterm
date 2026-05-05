import axios from "axios"
import type { AuthToken, FridgeItem, Recipe, RecipeWithMatchRate, MealPlan, ShoppingItem, CommonIngredient, User } from "@/types"

const API_BASE = process.env.NEXT_PUBLIC_API_BASE_URL ?? "http://localhost:8000"

const client = axios.create({ baseURL: API_BASE })

client.interceptors.request.use((config) => {
  if (typeof window !== "undefined") {
    const token = localStorage.getItem("fridgechef_token")
    if (token) config.headers.Authorization = `Bearer ${token}`
  }
  return config
})

export function setAuthToken(token: string) {
  if (typeof window !== "undefined") {
    localStorage.setItem("fridgechef_token", token)
  }
}

export function clearAuthToken() {
  if (typeof window !== "undefined") {
    localStorage.removeItem("fridgechef_token")
    localStorage.removeItem("fridgechef_user")
  }
}

export function getStoredUser(): User | null {
  if (typeof window === "undefined") return null
  const raw = localStorage.getItem("fridgechef_user")
  return raw ? JSON.parse(raw) : null
}

export function setStoredUser(user: User) {
  if (typeof window !== "undefined") {
    localStorage.setItem("fridgechef_user", JSON.stringify(user))
  }
}

// Auth
export const authApi = {
  demo: () => client.post<AuthToken>("/v1/auth/demo"),
  google: (token: string) => client.post<AuthToken>("/v1/auth/google", { token }),
  me: () => client.get<User>("/v1/auth/me"),
  updatePreferences: (data: { default_servings?: number; preferences_json?: Record<string, unknown> }) =>
    client.patch<User>("/v1/auth/me/preferences", data),
}

// Fridge
export const fridgeApi = {
  list: () => client.get<FridgeItem[]>("/v1/fridge/items"),
  add: (item: Omit<FridgeItem, "id" | "user_id" | "created_at" | "updated_at">) =>
    client.post<FridgeItem>("/v1/fridge/items", item),
  update: (id: number, data: Partial<FridgeItem>) =>
    client.patch<FridgeItem>(`/v1/fridge/items/${id}`, data),
  remove: (id: number) => client.delete(`/v1/fridge/items/${id}`),
  bulk: (items: Array<Omit<FridgeItem, "id" | "user_id" | "created_at" | "updated_at">>) =>
    client.post<FridgeItem[]>("/v1/fridge/items/bulk", { items }),
}

// Ingredients
export const ingredientsApi = {
  common: () => client.get<CommonIngredient[]>("/v1/ingredients/common"),
  search: (q: string) => client.get<CommonIngredient[]>(`/v1/ingredients/search?q=${encodeURIComponent(q)}`),
}

// Recipes
export const recipesApi = {
  list: () => client.get<Recipe[]>("/v1/recipes"),
  get: (id: number) => client.get<Recipe>(`/v1/recipes/${id}`),
  recommendations: () => client.get<RecipeWithMatchRate[]>("/v1/recipes/recommendations"),
  like: (id: number) => client.post(`/v1/recipes/${id}/like`),
  unlike: (id: number) => client.delete(`/v1/recipes/${id}/like`),
}

// Meal Plan
export const mealPlanApi = {
  list: () => client.get<MealPlan[]>("/v1/meal-plan"),
  generate: (data: { days: number; meal_types: string[]; start_date: string }) =>
    client.post<MealPlan[]>("/v1/meal-plan/generate", data),
  save: (data: { date: string; meal_type: string; recipe_id?: number; servings: number }) =>
    client.post<MealPlan>("/v1/meal-plan", data),
  remove: (id: number) => client.delete(`/v1/meal-plan/${id}`),
}

// Shopping
export const shoppingApi = {
  list: () => client.get<ShoppingItem[]>("/v1/shopping"),
  generate: () => client.post<ShoppingItem[]>("/v1/shopping/generate"),
  add: (item: { name: string; category?: string; quantity?: number; unit?: string }) =>
    client.post<ShoppingItem>("/v1/shopping/items", item),
  update: (id: number, data: { checked?: boolean; quantity?: number; name?: string }) =>
    client.patch<ShoppingItem>(`/v1/shopping/items/${id}`, data),
  remove: (id: number) => client.delete(`/v1/shopping/items/${id}`),
}

export default client
