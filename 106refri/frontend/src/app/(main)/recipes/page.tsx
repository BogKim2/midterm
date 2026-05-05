"use client"
import { useEffect, useState } from "react"
import { Clock, Flame, ChefHat, Heart, AlertCircle } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Skeleton } from "@/components/ui/skeleton"
import { recipesApi } from "@/lib/api"
import type { Recipe, RecipeWithMatchRate } from "@/types"

const MEAL_TYPES = ["전체", "한식", "양식", "중식", "일식", "기타"]

export default function RecipesPage() {
  const [recipes, setRecipes] = useState<Recipe[]>([])
  const [recommendations, setRecommendations] = useState<RecipeWithMatchRate[]>([])
  const [tab, setTab] = useState("recommendations")
  const [category, setCategory] = useState("전체")
  const [selected, setSelected] = useState<Recipe | RecipeWithMatchRate | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function load() {
      try {
        const [recipeRes, recRes] = await Promise.all([
          recipesApi.list(),
          recipesApi.recommendations(),
        ])
        setRecipes(recipeRes.data)
        setRecommendations(recRes.data)
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [])

  const displayList = tab === "recommendations" ? recommendations : recipes
  const filtered = displayList.filter((r) => category === "전체" || r.category === category)

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-serif text-3xl font-semibold text-[#141413]">레시피</h1>
        <p className="text-[#6c6a64]">냉장고 재료 기반 추천과 전체 레시피를 확인하세요.</p>
      </div>

      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <Tabs value={tab} onValueChange={setTab}>
          <TabsList className="bg-[#f5f0e8]">
            <TabsTrigger value="recommendations" className="data-[state=active]:bg-[#cc785c] data-[state=active]:text-white">
              추천 레시피
            </TabsTrigger>
            <TabsTrigger value="all" className="data-[state=active]:bg-[#cc785c] data-[state=active]:text-white">
              전체 레시피
            </TabsTrigger>
          </TabsList>
        </Tabs>

        <Tabs value={category} onValueChange={setCategory}>
          <TabsList className="flex-wrap h-auto bg-[#f5f0e8]">
            {MEAL_TYPES.map((c) => (
              <TabsTrigger key={c} value={c} className="data-[state=active]:bg-white data-[state=active]:text-[#141413]">
                {c}
              </TabsTrigger>
            ))}
          </TabsList>
        </Tabs>
      </div>

      {loading ? (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 6 }).map((_, i) => <Skeleton key={i} className="h-40 rounded-xl" />)}
        </div>
      ) : filtered.length === 0 ? (
        <div className="py-16 text-center">
          <ChefHat className="mx-auto mb-4 h-12 w-12 text-[#e6dfd8]" />
          <p className="text-[#6c6a64]">레시피가 없습니다.</p>
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {filtered.map((recipe) => {
            const isRec = "match_rate" in recipe
            return (
              <Card
                key={recipe.id}
                className="cursor-pointer border-[#e6dfd8] bg-white transition-all hover:shadow-md hover:-translate-y-0.5"
                onClick={() => setSelected(recipe)}
              >
                <CardHeader className="pb-2">
                  <div className="flex items-start justify-between gap-2">
                    <CardTitle className="text-base text-[#141413]">{recipe.name}</CardTitle>
                    <Badge className="shrink-0 bg-[#f5f0e8] text-[#6c6a64] hover:bg-[#f5f0e8]">{recipe.category}</Badge>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center gap-4 text-sm text-[#6c6a64]">
                    <span className="flex items-center gap-1"><Clock className="h-3.5 w-3.5" />{recipe.cooking_time}분</span>
                    <span className="flex items-center gap-1"><Flame className="h-3.5 w-3.5" />{recipe.calories}kcal</span>
                    <span className="flex items-center gap-1"><Heart className="h-3.5 w-3.5" />{recipe.likes}</span>
                  </div>
                  {isRec && (
                    <div className="mt-3 space-y-1">
                      <div className="flex items-center justify-between text-xs">
                        <span className="text-[#6c6a64]">재료 매칭률</span>
                        <span className="font-medium text-[#cc785c]">{(recipe as RecipeWithMatchRate).match_rate}%</span>
                      </div>
                      <div className="h-1.5 w-full rounded-full bg-[#e6dfd8]">
                        <div
                          className="h-full rounded-full bg-[#cc785c] transition-all"
                          style={{ width: `${(recipe as RecipeWithMatchRate).match_rate}%` }}
                        />
                      </div>
                      {(recipe as RecipeWithMatchRate).missing_ingredients.length > 0 && (
                        <div className="flex items-start gap-1 text-xs text-[#d4a017]">
                          <AlertCircle className="mt-0.5 h-3 w-3 shrink-0" />
                          <span>부족: {(recipe as RecipeWithMatchRate).missing_ingredients.slice(0, 3).join(", ")}</span>
                        </div>
                      )}
                    </div>
                  )}
                </CardContent>
              </Card>
            )
          })}
        </div>
      )}

      {/* Recipe Detail Dialog */}
      <Dialog open={!!selected} onOpenChange={() => setSelected(null)}>
        {selected && (
          <DialogContent className="max-h-[80vh] overflow-y-auto bg-[#faf9f5]">
            <DialogHeader>
              <DialogTitle className="font-serif text-xl">{selected.name}</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div className="flex gap-3 flex-wrap">
                <Badge className="bg-[#f5f0e8] text-[#6c6a64]">{selected.category}</Badge>
                <Badge className="bg-[#f5f0e8] text-[#6c6a64]">{selected.cooking_time}분</Badge>
                <Badge className="bg-[#f5f0e8] text-[#6c6a64]">{selected.calories}kcal</Badge>
              </div>

              {"match_rate" in selected && (
                <div className="rounded-lg bg-[#efe9de] p-4">
                  <div className="text-sm font-medium text-[#141413]">재료 매칭률: {(selected as RecipeWithMatchRate).match_rate}%</div>
                  {(selected as RecipeWithMatchRate).missing_ingredients.length > 0 && (
                    <div className="mt-2 text-sm text-[#d4a017]">
                      부족한 재료: {(selected as RecipeWithMatchRate).missing_ingredients.join(", ")}
                    </div>
                  )}
                </div>
              )}

              <div>
                <h3 className="mb-2 font-semibold text-[#141413]">재료</h3>
                <div className="space-y-1">
                  {selected.ingredients.map((ing) => (
                    <div key={ing.id} className="flex items-center justify-between text-sm">
                      <span className="text-[#3d3d3a]">{ing.custom_name}</span>
                      <span className="text-[#6c6a64]">{ing.quantity}{ing.unit}</span>
                    </div>
                  ))}
                </div>
              </div>

              <div>
                <h3 className="mb-2 font-semibold text-[#141413]">조리 방법</h3>
                <div className="space-y-2">
                  {selected.instructions.split("\n").map((line, i) => (
                    <p key={i} className="text-sm text-[#3d3d3a]">{line}</p>
                  ))}
                </div>
              </div>
            </div>
          </DialogContent>
        )}
      </Dialog>
    </div>
  )
}
