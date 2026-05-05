"use client"
import { useState } from "react"
import { useRouter } from "next/navigation"
import { LogOut, Save, Loader2, User, Settings, AlertTriangle } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Separator } from "@/components/ui/separator"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { useAuthStore } from "@/stores/authStore"
import { authApi } from "@/lib/api"

export default function SettingsPage() {
  const { user, setAuth, logout } = useAuthStore()
  const router = useRouter()
  const [servings, setServings] = useState(user?.default_servings?.toString() ?? "2")
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)

  async function handleSave() {
    setSaving(true)
    try {
      const { data } = await authApi.updatePreferences({ default_servings: parseInt(servings) || 2 })
      const token = localStorage.getItem("fridgechef_token") ?? ""
      setAuth(token, data)
      setSaved(true)
      setTimeout(() => setSaved(false), 2000)
    } finally {
      setSaving(false)
    }
  }

  function handleLogout() {
    logout()
    router.push("/")
  }

  return (
    <div className="mx-auto max-w-2xl space-y-6">
      <div>
        <h1 className="font-serif text-3xl font-semibold text-[#141413]">설정</h1>
        <p className="text-[#6c6a64]">계정 및 앱 환경 설정</p>
      </div>

      {/* Profile */}
      <Card className="border-[#e6dfd8] bg-white">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-[#141413]">
            <User className="h-4 w-4" />프로필
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-1.5">
            <Label className="text-[#6c6a64]">이메일</Label>
            <Input value={user?.email ?? ""} disabled className="bg-[#f5f0e8] text-[#6c6a64]" />
          </div>
          <div className="space-y-1.5">
            <Label className="text-[#6c6a64]">이름</Label>
            <Input value={user?.name ?? ""} disabled className="bg-[#f5f0e8] text-[#6c6a64]" />
          </div>
          <div className="space-y-1.5">
            <Label className="text-[#6c6a64]">로그인 방식</Label>
            <Input value={user?.provider ?? ""} disabled className="bg-[#f5f0e8] text-[#6c6a64]" />
          </div>
        </CardContent>
      </Card>

      {/* Preferences */}
      <Card className="border-[#e6dfd8] bg-white">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-[#141413]">
            <Settings className="h-4 w-4" />앱 설정
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-1.5">
            <Label>기본 인원 수</Label>
            <Input
              type="number"
              min="1"
              max="10"
              value={servings}
              onChange={(e) => setServings(e.target.value)}
              className="w-32 border-[#e6dfd8]"
            />
            <p className="text-xs text-[#8e8b82]">식단 생성 시 기본으로 사용되는 인원 수입니다.</p>
          </div>

          {saved && (
            <Alert className="border-[#5db872]/20 bg-[#5db872]/10">
              <AlertDescription className="text-[#5db872]">저장되었습니다.</AlertDescription>
            </Alert>
          )}

          <Button onClick={handleSave} disabled={saving} className="bg-[#cc785c] text-white hover:bg-[#a9583e]">
            {saving ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Save className="mr-2 h-4 w-4" />}
            저장
          </Button>
        </CardContent>
      </Card>

      <Separator className="bg-[#e6dfd8]" />

      {/* Danger Zone */}
      <Card className="border-[#c64545]/20 bg-white">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-[#c64545]">
            <AlertTriangle className="h-4 w-4" />위험 영역
          </CardTitle>
          <CardDescription className="text-[#6c6a64]">아래 작업은 되돌릴 수 없습니다.</CardDescription>
        </CardHeader>
        <CardContent>
          <Button
            variant="outline"
            onClick={handleLogout}
            className="border-[#c64545]/40 text-[#c64545] hover:bg-[#c64545]/10"
          >
            <LogOut className="mr-2 h-4 w-4" />로그아웃
          </Button>
        </CardContent>
      </Card>
    </div>
  )
}
