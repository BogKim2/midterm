"use client"
import { useState } from "react"
import { useRouter } from "next/navigation"
import { ChefHat, Loader2, LogIn } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { useAuthStore } from "@/stores/authStore"
import { authApi } from "@/lib/api"

export default function LoginPage() {
  const router = useRouter()
  const { setAuth } = useAuthStore()
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState("")

  async function handleDemo() {
    setIsLoading(true)
    setError("")
    try {
      const { data } = await authApi.demo()
      setAuth(data.access_token, data.user)
      router.push("/dashboard")
    } catch {
      setError("로그인에 실패했습니다. 백엔드 서버가 실행 중인지 확인하세요.")
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-[#faf9f5] p-4">
      <div className="w-full max-w-4xl">
        <div className="grid gap-8 lg:grid-cols-2">
          {/* Left: Info Card */}
          <div className="hidden rounded-2xl bg-[#181715] p-10 lg:flex lg:flex-col lg:justify-between">
            <div className="flex items-center gap-2">
              <ChefHat className="h-6 w-6 text-[#cc785c]" />
              <span className="font-serif text-xl text-[#faf9f5]">FridgeChef</span>
            </div>
            <div>
              <h2 className="mb-4 font-serif text-4xl font-semibold leading-tight text-[#faf9f5]">
                냉장고 속 재료로<br />
                <span className="text-[#cc785c]">식단을 완성</span>하세요
              </h2>
              <p className="mb-8 text-[#a09d96]">
                보유 재료 기반 레시피 추천, 주간 식단 생성, 장보기 목록 자동화.
                결제 없이 로컬에서 바로 사용하세요.
              </p>
              <div className="flex flex-wrap gap-2">
                {["결제 없음", "로컬 SQLite", "레시피 추천", "식단 생성"].map((tag) => (
                  <span key={tag} className="rounded-full bg-[#252320] px-3 py-1 text-xs text-[#a09d96]">
                    {tag}
                  </span>
                ))}
              </div>
            </div>
            <p className="text-xs text-[#6c6a64]">MIT License · 로컬 실행 중심</p>
          </div>

          {/* Right: Login Card */}
          <Card className="border-[#e6dfd8] bg-white shadow-sm">
            <CardHeader className="pb-4">
              <div className="mb-4 flex items-center gap-2 lg:hidden">
                <ChefHat className="h-5 w-5 text-[#cc785c]" />
                <span className="font-serif text-lg font-semibold">FridgeChef</span>
              </div>
              <CardTitle className="text-2xl text-[#141413]">로그인</CardTitle>
              <CardDescription className="text-[#6c6a64]">
                데모 계정으로 바로 시작하거나 Google 계정으로 로그인하세요.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {error && (
                <Alert className="border-[#c64545]/20 bg-[#c64545]/10">
                  <AlertDescription className="text-[#c64545]">{error}</AlertDescription>
                </Alert>
              )}

              <Button
                onClick={handleDemo}
                disabled={isLoading}
                className="w-full bg-[#cc785c] text-white hover:bg-[#a9583e]"
                size="lg"
              >
                {isLoading ? (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                ) : (
                  <LogIn className="mr-2 h-4 w-4" />
                )}
                데모 계정으로 시작하기
              </Button>

              <div className="relative">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-[#e6dfd8]" />
                </div>
                <div className="relative flex justify-center text-xs">
                  <span className="bg-white px-2 text-[#8e8b82]">또는</span>
                </div>
              </div>

              <Button
                variant="outline"
                size="lg"
                className="w-full border-[#e6dfd8] text-[#6c6a64] hover:bg-[#f5f0e8]"
                disabled
              >
                <svg className="mr-2 h-4 w-4" viewBox="0 0 24 24">
                  <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
                  <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
                  <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
                  <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
                </svg>
                Google로 로그인 (설정 필요)
              </Button>

              <p className="text-center text-xs text-[#8e8b82]">
                Google 로그인은 <code className="rounded bg-[#f5f0e8] px-1">.env.local</code>에
                CLIENT_ID 설정 후 사용 가능합니다.
              </p>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
