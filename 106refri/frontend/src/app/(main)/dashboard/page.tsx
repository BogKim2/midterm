"use client"
import { useEffect, useState } from "react"
import Link from "next/link"
import { Refrigerator, Star, CalendarDays, ShoppingCart, AlertTriangle, Clock } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Skeleton } from "@/components/ui/skeleton"
import { useAuthStore } from "@/stores/authStore"
import { fridgeApi, recipesApi, mealPlanApi, shoppingApi } from "@/lib/api"
import type { FridgeItem, RecipeWithMatchRate, ShoppingItem } from "@/types"

function getDaysUntilExpiry(expiresAt: string) {
  const now = new Date()
  const expiry = new Date(expiresAt)
  return Math.ceil((expiry.getTime() - now.getTime()) / (1000 * 60 * 60 * 24))
}

export default function DashboardPage() {
  const { user } = useAuthStore()
  const [fridgeItems, setFridgeItems] = useState<FridgeItem[]>([])
  const [recommendations, setRecommendations] = useState<RecipeWithMatchRate[]>([])
  const [shoppingItems, setShoppingItems] = useState<ShoppingItem[]>([])
  const [mealCount, setMealCount] = useState(0)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function load() {
      try {
        const [fridgeRes, recipeRes, mealRes, shopRes] = await Promise.all([
          fridgeApi.list(),
          recipesApi.recommendations(),
          mealPlanApi.list(),
          shoppingApi.list(),
        ])
        setFridgeItems(fridgeRes.data)
        setRecommendations(recipeRes.data.slice(0, 3))
        setMealCount(mealRes.data.length)
        setShoppingItems(shopRes.data.slice(0, 5))
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [])

  const expiringItems = fridgeItems.filter((item) => {
    if (!item.expires_at) return false
    const days = getDaysUntilExpiry(item.expires_at)
    return days >= 0 && days <= 3
  })

  const stats = [
    { label: "보유 재료", value: fridgeItems.length, unit: "종", icon: Refrigerator, color: "text-[#cc785c]", href: "/fridge" },
    { label: "유통기한 임박", value: expiringItems.length, unit: "개", icon: AlertTriangle, color: "text-[#d4a017]", href: "/fridge" },
    { label: "추천 레시피", value: recommendations.length, unit: "개", icon: Star, color: "text-[#5db872]", href: "/recipes" },
    { label: "저장된 식단", value: mealCount, unit: "끼", icon: CalendarDays, color: "text-[#6c6a64]", href: "/meal-plan" },
  ]

  return (
    <div className="space-y-8">
      <div>
        <h1 className="font-serif text-3xl font-semibold text-[#141413]">
          안녕하세요, {user?.name ?? "Chef"} 님
        </h1>
        <p className="mt-1 text-[#6c6a64]">오늘의 냉장고 상태를 확인하세요.</p>
      </div>

      {/* Stats */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {loading
          ? Array.from({ length: 4 }).map((_, i) => <Skeleton key={i} className="h-28 rounded-xl" />)
          : stats.map((stat) => (
              <Link key={stat.label} href={stat.href}>
                <Card className="border-[#e6dfd8] bg-[#efe9de] transition-colors hover:bg-[#e8e0d2]">
                  <CardContent className="p-6">
                    <div className="flex items-start justify-between">
                      <div>
                        <div className={`text-3xl font-bold ${stat.color}`}>{stat.value}</div>
                        <div className="text-xs text-[#8e8b82]">{stat.unit}</div>
                        <div className="mt-1 text-sm text-[#6c6a64]">{stat.label}</div>
                      </div>
                      <stat.icon className={`h-6 w-6 ${stat.color}`} />
                    </div>
                  </CardContent>
                </Card>
              </Link>
            ))}
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        {/* Recommendations */}
        <Card className="border-[#e6dfd8] bg-white">
          <CardHeader className="flex flex-row items-center justify-between pb-4">
            <CardTitle className="text-lg text-[#141413]">오늘 추천 레시피</CardTitle>
            <Link href="/recipes">
              <Button variant="ghost" size="sm" className="text-[#cc785c]">전체 보기</Button>
            </Link>
          </CardHeader>
          <CardContent className="space-y-3">
            {loading
              ? Array.from({ length: 3 }).map((_, i) => <Skeleton key={i} className="h-16 rounded-lg" />)
              : recommendations.length === 0
                ? <p className="text-sm text-[#8e8b82]">냉장고에 재료를 추가하면 레시피를 추천해 드립니다.</p>
                : recommendations.map((recipe) => (
                    <Link key={recipe.id} href="/recipes">
                      <div className="flex items-center justify-between rounded-lg bg-[#f5f0e8] p-3 hover:bg-[#efe9de] transition-colors">
                        <div>
                          <div className="font-medium text-[#141413]">{recipe.name}</div>
                          <div className="flex items-center gap-2 mt-0.5">
                            <Clock className="h-3 w-3 text-[#8e8b82]" />
                            <span className="text-xs text-[#8e8b82]">{recipe.cooking_time}분</span>
                          </div>
                        </div>
                        <Badge className="bg-[#cc785c]/10 text-[#cc785c] hover:bg-[#cc785c]/10">
                          {recipe.match_rate}%
                        </Badge>
                      </div>
                    </Link>
                  ))}
          </CardContent>
        </Card>

        {/* Shopping preview */}
        <Card className="border-[#e6dfd8] bg-white">
          <CardHeader className="flex flex-row items-center justify-between pb-4">
            <CardTitle className="text-lg text-[#141413]">장보기 목록</CardTitle>
            <Link href="/shopping">
              <Button variant="ghost" size="sm" className="text-[#cc785c]">전체 보기</Button>
            </Link>
          </CardHeader>
          <CardContent className="space-y-2">
            {loading
              ? Array.from({ length: 5 }).map((_, i) => <Skeleton key={i} className="h-8 rounded" />)
              : shoppingItems.length === 0
                ? (
                    <div className="space-y-2">
                      <p className="text-sm text-[#8e8b82]">장보기 목록이 비어있습니다.</p>
                      <Link href="/shopping">
                        <Button size="sm" className="bg-[#cc785c] text-white hover:bg-[#a9583e]">
                          <ShoppingCart className="mr-2 h-4 w-4" />목록 생성
                        </Button>
                      </Link>
                    </div>
                  )
                : shoppingItems.map((item) => (
                    <div key={item.id} className="flex items-center justify-between text-sm">
                      <span className={item.checked ? "line-through text-[#8e8b82]" : "text-[#3d3d3a]"}>
                        {item.name}
                      </span>
                      <span className="text-xs text-[#8e8b82]">{item.quantity}{item.unit}</span>
                    </div>
                  ))}
          </CardContent>
        </Card>
      </div>

      {/* Quick actions */}
      <div className="flex flex-wrap gap-3">
        <Link href="/fridge">
          <Button className="bg-[#cc785c] text-white hover:bg-[#a9583e]">
            <Refrigerator className="mr-2 h-4 w-4" />재료 추가
          </Button>
        </Link>
        <Link href="/meal-plan">
          <Button variant="outline" className="border-[#e6dfd8] hover:bg-[#f5f0e8]">
            <CalendarDays className="mr-2 h-4 w-4" />식단 생성
          </Button>
        </Link>
        <Link href="/shopping">
          <Button variant="outline" className="border-[#e6dfd8] hover:bg-[#f5f0e8]">
            <ShoppingCart className="mr-2 h-4 w-4" />장보기 목록
          </Button>
        </Link>
      </div>
    </div>
  )
}
