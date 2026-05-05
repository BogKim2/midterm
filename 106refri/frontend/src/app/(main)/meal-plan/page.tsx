"use client"
import { useEffect, useState } from "react"
import { CalendarDays, RefreshCw, Trash2, Loader2 } from "lucide-react"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Label } from "@/components/ui/label"
import { Skeleton } from "@/components/ui/skeleton"
import { mealPlanApi, recipesApi } from "@/lib/api"
import type { MealPlan, Recipe } from "@/types"

const MEAL_TYPE_LABELS: Record<string, string> = {
  breakfast: "아침",
  lunch: "점심",
  dinner: "저녁",
}

export default function MealPlanPage() {
  const [plans, setPlans] = useState<MealPlan[]>([])
  const [recipes, setRecipes] = useState<Recipe[]>([])
  const [loading, setLoading] = useState(true)
  const [generating, setGenerating] = useState(false)
  const [days, setDays] = useState("7")
  const [mealTypes, setMealTypes] = useState(["breakfast", "lunch", "dinner"])

  useEffect(() => {
    async function load() {
      const [planRes, recRes] = await Promise.all([mealPlanApi.list(), recipesApi.list()])
      setPlans(planRes.data)
      setRecipes(recRes.data)
      setLoading(false)
    }
    load()
  }, [])

  async function handleGenerate() {
    setGenerating(true)
    try {
      const startDate = new Date().toISOString().split("T")[0]
      const res = await mealPlanApi.generate({ days: parseInt(days), meal_types: mealTypes, start_date: startDate })
      setPlans(res.data)
    } finally {
      setGenerating(false)
    }
  }

  async function handleDelete(id: number) {
    await mealPlanApi.remove(id)
    setPlans(plans.filter((p) => p.id !== id))
  }

  function getRecipeName(recipeId: number | null) {
    if (!recipeId) return "미정"
    return recipes.find((r) => r.id === recipeId)?.name ?? "미정"
  }

  const grouped = plans.reduce<Record<string, MealPlan[]>>((acc, plan) => {
    if (!acc[plan.date]) acc[plan.date] = []
    acc[plan.date].push(plan)
    return acc
  }, {})

  const sortedDates = Object.keys(grouped).sort()

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-serif text-3xl font-semibold text-[#141413]">식단 계획</h1>
        <p className="text-[#6c6a64]">냉장고 재료 기반으로 식단을 자동 생성합니다.</p>
      </div>

      <Card className="border-[#e6dfd8] bg-[#efe9de]">
        <CardContent className="p-6">
          <div className="grid gap-4 sm:grid-cols-3">
            <div className="space-y-1.5">
              <Label>기간</Label>
              <Select value={days} onValueChange={(v) => setDays(v ?? "7")}>
                <SelectTrigger className="bg-white border-[#e6dfd8]">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="3">3일</SelectItem>
                  <SelectItem value="7">7일</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1.5">
              <Label>식사 유형</Label>
              <div className="flex gap-2">
                {[["breakfast", "아침"], ["lunch", "점심"], ["dinner", "저녁"]].map(([key, label]) => (
                  <button
                    key={key}
                    onClick={() =>
                      setMealTypes((prev) =>
                        prev.includes(key) ? prev.filter((m) => m !== key) : [...prev, key]
                      )
                    }
                    className={`rounded-md px-3 py-1.5 text-sm transition-colors ${
                      mealTypes.includes(key)
                        ? "bg-[#cc785c] text-white"
                        : "bg-white text-[#6c6a64] border border-[#e6dfd8]"
                    }`}
                  >
                    {label}
                  </button>
                ))}
              </div>
            </div>
            <div className="flex items-end">
              <Button
                onClick={handleGenerate}
                disabled={generating || mealTypes.length === 0}
                className="w-full bg-[#cc785c] text-white hover:bg-[#a9583e]"
              >
                {generating ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <RefreshCw className="mr-2 h-4 w-4" />}
                식단 생성
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {loading ? (
        <div className="space-y-4">
          {Array.from({ length: 3 }).map((_, i) => <Skeleton key={i} className="h-32 rounded-xl" />)}
        </div>
      ) : sortedDates.length === 0 ? (
        <div className="py-16 text-center">
          <CalendarDays className="mx-auto mb-4 h-12 w-12 text-[#e6dfd8]" />
          <p className="text-[#6c6a64]">식단이 없습니다. 위에서 생성하세요!</p>
        </div>
      ) : (
        <div className="space-y-6">
          {sortedDates.map((date) => (
            <div key={date}>
              <h3 className="mb-3 font-semibold text-[#141413]">
                {new Date(date).toLocaleDateString("ko-KR", { month: "long", day: "numeric", weekday: "short" })}
              </h3>
              <div className="grid gap-3 sm:grid-cols-3">
                {(["breakfast", "lunch", "dinner"] as const).map((mealType) => {
                  const plan = grouped[date]?.find((p) => p.meal_type === mealType)
                  return (
                    <Card key={mealType} className={`border-[#e6dfd8] ${plan ? "bg-white" : "bg-[#f5f0e8]"}`}>
                      <CardContent className="p-4">
                        <div className="flex items-start justify-between">
                          <div>
                            <Badge className="mb-2 bg-[#f5f0e8] text-[#6c6a64] text-xs hover:bg-[#f5f0e8]">
                              {MEAL_TYPE_LABELS[mealType]}
                            </Badge>
                            <div className="text-sm font-medium text-[#141413]">
                              {plan ? getRecipeName(plan.recipe_id) : "—"}
                            </div>
                            {plan && (
                              <div className="mt-0.5 text-xs text-[#8e8b82]">{plan.servings}인분</div>
                            )}
                          </div>
                          {plan && (
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleDelete(plan.id)}
                              className="h-7 w-7 p-0 text-[#8e8b82] hover:text-[#c64545]"
                            >
                              <Trash2 className="h-3.5 w-3.5" />
                            </Button>
                          )}
                        </div>
                      </CardContent>
                    </Card>
                  )
                })}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
