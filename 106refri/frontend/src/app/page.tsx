import Link from "next/link"
import { ChefHat, Refrigerator, CalendarDays, ShoppingCart, Star, Database, GitBranch } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"

const features = [
  {
    icon: Refrigerator,
    title: "냉장고 재료 관리",
    desc: "보유 식재료를 등록하고 유통기한을 추적합니다. 일괄 추가와 카테고리 필터로 빠르게 관리하세요.",
  },
  {
    icon: Star,
    title: "레시피 추천",
    desc: "냉장고에 있는 재료를 기준으로 만들 수 있는 레시피를 매칭률 순으로 추천합니다.",
  },
  {
    icon: CalendarDays,
    title: "주간 식단 생성",
    desc: "3일 또는 7일 식단을 자동으로 생성합니다. 유통기한 임박 재료를 우선 활용합니다.",
  },
  {
    icon: ShoppingCart,
    title: "장보기 목록",
    desc: "식단에서 부족한 재료를 자동 계산해 장보기 목록을 만들어 드립니다.",
  },
]

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-[#faf9f5]">
      {/* Navigation */}
      <header className="border-b border-[#e6dfd8] bg-[#faf9f5]/90 backdrop-blur-sm">
        <div className="mx-auto flex h-14 max-w-6xl items-center justify-between px-4">
          <div className="flex items-center gap-2">
            <ChefHat className="h-5 w-5 text-[#cc785c]" />
            <span className="font-serif text-xl font-semibold text-[#141413]">FridgeChef</span>
          </div>
          <div className="flex items-center gap-3">
            <Link href="/login">
              <Button variant="ghost" size="sm" className="text-[#6c6a64]">로그인</Button>
            </Link>
            <Link href="/login">
              <Button size="sm" className="bg-[#cc785c] text-white hover:bg-[#a9583e]">시작하기</Button>
            </Link>
          </div>
        </div>
      </header>

      {/* Hero */}
      <section className="mx-auto max-w-6xl px-4 py-24 text-center">
        <Badge className="mb-6 bg-[#e8e0d2] text-[#cc785c] hover:bg-[#e8e0d2]">
          로컬 SQLite · 결제 없음 · 무료
        </Badge>
        <h1 className="mb-6 font-serif text-5xl font-semibold leading-tight tracking-tight text-[#141413] sm:text-6xl lg:text-7xl">
          냉장고 속 재료로<br />
          <span className="text-[#cc785c]">오늘의 식단</span>을 완성하세요
        </h1>
        <p className="mx-auto mb-10 max-w-2xl text-lg leading-relaxed text-[#6c6a64]">
          FridgeChef는 보유 재료를 기준으로 레시피 추천, 식단 생성, 장보기 목록을 자동으로 만들어주는
          로컬 실행 중심 식단 관리 웹앱입니다.
        </p>
        <div className="flex flex-col items-center gap-3 sm:flex-row sm:justify-center">
          <Link href="/login">
            <Button size="lg" className="h-12 bg-[#cc785c] px-8 text-white hover:bg-[#a9583e]">
              무료로 시작하기
            </Button>
          </Link>
          <a href="http://localhost:8000/docs" target="_blank" rel="noopener noreferrer">
            <Button size="lg" variant="outline" className="h-12 border-[#e6dfd8] px-8 text-[#6c6a64] hover:bg-[#f5f0e8]">
              API 문서 보기
            </Button>
          </a>
        </div>
      </section>

      {/* Dashboard Preview */}
      <section className="mx-auto max-w-6xl px-4 pb-20">
        <div className="overflow-hidden rounded-2xl bg-[#181715] p-8 shadow-2xl">
          <div className="mb-4 flex items-center gap-2">
            <div className="h-3 w-3 rounded-full bg-[#c64545]" />
            <div className="h-3 w-3 rounded-full bg-[#d4a017]" />
            <div className="h-3 w-3 rounded-full bg-[#5db872]" />
            <span className="ml-4 font-mono text-xs text-[#a09d96]">FridgeChef Dashboard</span>
          </div>
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
            {[
              { label: "보유 재료", value: "12", unit: "종", color: "text-[#cc785c]" },
              { label: "유통기한 임박", value: "3", unit: "개", color: "text-[#d4a017]" },
              { label: "추천 레시피", value: "8", unit: "개", color: "text-[#5db872]" },
              { label: "이번 주 식단", value: "21", unit: "끼", color: "text-[#a09d96]" },
            ].map((stat) => (
              <div key={stat.label} className="rounded-xl bg-[#252320] p-4">
                <div className={`text-2xl font-bold ${stat.color}`}>{stat.value}</div>
                <div className="text-xs text-[#a09d96]">{stat.unit}</div>
                <div className="mt-1 text-xs text-[#6c6a64]">{stat.label}</div>
              </div>
            ))}
          </div>
          <div className="mt-4 grid grid-cols-3 gap-3">
            {["계란볶음밥 95%", "된장찌개 80%", "닭가슴살 스테이크 72%"].map((r) => (
              <div key={r} className="rounded-lg bg-[#1f1e1b] px-3 py-2">
                <div className="text-xs text-[#faf9f5]">{r}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="mx-auto max-w-6xl px-4 pb-24">
        <h2 className="mb-12 text-center font-serif text-4xl font-semibold text-[#141413]">주요 기능</h2>
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {features.map((f) => (
            <div key={f.title} className="rounded-xl border border-[#e6dfd8] bg-[#efe9de] p-6">
              <f.icon className="mb-4 h-8 w-8 text-[#cc785c]" />
              <h3 className="mb-2 font-semibold text-[#141413]">{f.title}</h3>
              <p className="text-sm leading-relaxed text-[#6c6a64]">{f.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* How it works */}
      <section className="bg-[#f5f0e8] py-24">
        <div className="mx-auto max-w-6xl px-4">
          <h2 className="mb-12 text-center font-serif text-4xl font-semibold text-[#141413]">사용 방법</h2>
          <div className="grid gap-8 md:grid-cols-3">
            {[
              { step: "01", title: "재료 등록", desc: "냉장고에 있는 식재료를 등록하세요. 공통 식재료 검색으로 빠르게 추가할 수 있습니다." },
              { step: "02", title: "레시피 추천", desc: "보유 재료 기준으로 만들 수 있는 레시피를 확인하고 식단에 추가하세요." },
              { step: "03", title: "장보기 완성", desc: "식단에서 부족한 재료가 자동으로 장보기 목록에 추가됩니다." },
            ].map((s) => (
              <div key={s.step} className="flex gap-4">
                <div className="shrink-0 font-serif text-5xl font-bold text-[#e6dfd8]">{s.step}</div>
                <div>
                  <h3 className="mb-2 font-semibold text-[#141413]">{s.title}</h3>
                  <p className="text-sm leading-relaxed text-[#6c6a64]">{s.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Local SQLite Callout */}
      <section className="mx-auto max-w-6xl px-4 py-24">
        <div className="rounded-2xl bg-[#181715] p-10 text-center">
          <Database className="mx-auto mb-4 h-10 w-10 text-[#cc785c]" />
          <h2 className="mb-4 font-serif text-3xl font-semibold text-[#faf9f5]">
            완전 무료 · 로컬 실행 · 결제 없음
          </h2>
          <p className="mx-auto mb-8 max-w-xl text-[#a09d96]">
            외부 서버, 구독 요금, 결제 정보가 필요 없습니다. SQLite 파일이 자동 생성되어
            로컬 환경에서 바로 실행됩니다.
          </p>
          <div className="flex flex-wrap justify-center gap-3">
            {["SQLite 자동 생성", "로컬 실행", "결제 0원", "Google 로그인 선택사항"].map((tag) => (
              <Badge key={tag} className="bg-[#252320] text-[#a09d96] hover:bg-[#252320]">{tag}</Badge>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="bg-[#cc785c] py-20 text-center">
        <h2 className="mb-4 font-serif text-4xl font-semibold text-white">지금 바로 시작하세요</h2>
        <p className="mb-8 text-white/80">설치 후 바로 사용 가능합니다.</p>
        <Link href="/login">
          <Button size="lg" className="h-12 bg-white px-10 text-[#cc785c] hover:bg-[#faf9f5]">
            시작하기
          </Button>
        </Link>
      </section>

      {/* Footer */}
      <footer className="bg-[#141413] py-10">
        <div className="mx-auto max-w-6xl px-4 text-center">
          <div className="mb-4 flex items-center justify-center gap-2">
            <ChefHat className="h-5 w-5 text-[#cc785c]" />
            <span className="font-serif text-lg text-[#faf9f5]">FridgeChef</span>
          </div>
          <p className="text-sm text-[#6c6a64]">
            로컬 SQLite 기반 식단 관리 웹앱 · 결제 없음 · MIT License
          </p>
          <div className="mt-4 flex justify-center">
            <a
              href="https://github.com/Kimwoojin-pnu/refrigerator-madrake"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-2 text-sm text-[#6c6a64] hover:text-[#a09d96]"
            >
              <GitBranch className="h-4 w-4" /> GitHub
            </a>
          </div>
        </div>
      </footer>
    </div>
  )
}
