"use client"
import { useEffect, useState } from "react"
import { Plus, Trash2, Package } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Textarea } from "@/components/ui/textarea"
import { Skeleton } from "@/components/ui/skeleton"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { useFridgeStore } from "@/stores/fridgeStore"
import { fridgeApi } from "@/lib/api"
import type { FridgeItem } from "@/types"

const CATEGORIES = ["전체", "단백질", "채소", "유제품", "곡류", "조미료", "가공식품", "기타"]

function getDaysUntilExpiry(expiresAt: string) {
  return Math.ceil((new Date(expiresAt).getTime() - Date.now()) / (1000 * 60 * 60 * 24))
}

function ExpiryBadge({ expiresAt }: { expiresAt: string | null }) {
  if (!expiresAt) return null
  const days = getDaysUntilExpiry(expiresAt)
  if (days < 0) return <Badge className="bg-[#c64545]/10 text-[#c64545]">만료됨</Badge>
  if (days <= 1) return <Badge className="bg-[#c64545]/10 text-[#c64545]">오늘 만료</Badge>
  if (days <= 3) return <Badge className="bg-[#d4a017]/10 text-[#d4a017]">D-{days}</Badge>
  return <Badge className="bg-[#5db872]/10 text-[#5db872]">D-{days}</Badge>
}

function AddItemDialog({ onAdd }: { onAdd: () => void }) {
  const [open, setOpen] = useState(false)
  const [form, setForm] = useState({ name: "", category: "기타", quantity: "1", unit: "개", expires_at: "", memo: "" })
  const [loading, setLoading] = useState(false)
  const { add } = useFridgeStore()

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    try {
      await add({
        name: form.name,
        category: form.category,
        quantity: parseFloat(form.quantity) || 1,
        unit: form.unit,
        expires_at: form.expires_at || null,
        is_condiment: form.category === "조미료",
        memo: form.memo,
        common_ingredient_id: null,
      })
      setOpen(false)
      setForm({ name: "", category: "기타", quantity: "1", unit: "개", expires_at: "", memo: "" })
      onAdd()
    } finally {
      setLoading(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger className="inline-flex items-center gap-1.5 rounded-lg bg-[#cc785c] px-2.5 py-1.5 text-sm font-medium text-white hover:bg-[#a9583e]">
        <Plus className="h-4 w-4" />재료 추가
      </DialogTrigger>
      <DialogContent className="bg-[#faf9f5]">
        <DialogHeader>
          <DialogTitle>재료 추가</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="col-span-2 space-y-1.5">
              <Label>재료명 *</Label>
              <Input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} required placeholder="예: 달걀" />
            </div>
            <div className="space-y-1.5">
              <Label>카테고리</Label>
              <Select value={form.category} onValueChange={(v) => setForm({ ...form, category: v ?? "기타" })}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  {CATEGORIES.filter(c => c !== "전체").map((c) => <SelectItem key={c} value={c}>{c}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1.5">
              <Label>수량</Label>
              <div className="flex gap-2">
                <Input type="number" value={form.quantity} onChange={(e) => setForm({ ...form, quantity: e.target.value })} min="0" step="0.1" />
                <Input value={form.unit} onChange={(e) => setForm({ ...form, unit: e.target.value })} placeholder="개" className="w-16" />
              </div>
            </div>
            <div className="col-span-2 space-y-1.5">
              <Label>유통기한</Label>
              <Input type="date" value={form.expires_at} onChange={(e) => setForm({ ...form, expires_at: e.target.value })} />
            </div>
            <div className="col-span-2 space-y-1.5">
              <Label>메모</Label>
              <Textarea value={form.memo} onChange={(e) => setForm({ ...form, memo: e.target.value })} placeholder="선택사항" rows={2} />
            </div>
          </div>
          <Button type="submit" disabled={loading} className="w-full bg-[#cc785c] text-white hover:bg-[#a9583e]">
            {loading ? "추가 중..." : "추가"}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  )
}

function BulkAddDialog({ onAdd }: { onAdd: () => void }) {
  const [open, setOpen] = useState(false)
  const [text, setText] = useState("")
  const [loading, setLoading] = useState(false)

  async function handleBulk() {
    const lines = text.split("\n").filter(Boolean)
    const items = lines.map((line) => {
      const parts = line.trim().split(/\s+/)
      return { name: parts[0] || line.trim(), category: "기타", quantity: parseFloat(parts[1]) || 1, unit: parts[2] || "개", is_condiment: false, memo: "", expires_at: null, common_ingredient_id: null }
    })
    if (items.length === 0) return
    setLoading(true)
    try {
      await fridgeApi.bulk(items)
      setOpen(false)
      setText("")
      onAdd()
    } finally {
      setLoading(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger className="inline-flex items-center gap-1.5 rounded-lg border border-[#e6dfd8] bg-white px-2.5 py-1.5 text-sm font-medium text-[#3d3d3a] hover:bg-[#f5f0e8]">
        <Package className="h-4 w-4" />일괄 추가
      </DialogTrigger>
      <DialogContent className="bg-[#faf9f5]">
        <DialogHeader>
          <DialogTitle>여러 재료 한번에 추가</DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          <p className="text-sm text-[#6c6a64]">한 줄에 하나씩 입력하세요. (예: 달걀 10 개)</p>
          <Textarea
            value={text}
            onChange={(e) => setText(e.target.value)}
            placeholder={"달걀 10 개\n우유 1 L\n양파 3 개\n마늘 1 통"}
            rows={8}
            className="font-mono text-sm"
          />
          <Button onClick={handleBulk} disabled={loading || !text.trim()} className="w-full bg-[#cc785c] text-white hover:bg-[#a9583e]">
            {loading ? "추가 중..." : `${text.split("\n").filter(Boolean).length}개 추가`}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}

export default function FridgePage() {
  const { items, isLoading, error, fetch, remove } = useFridgeStore()
  const [category, setCategory] = useState("전체")
  const [search, setSearch] = useState("")

  useEffect(() => { fetch() }, [fetch])

  const filtered = items.filter((item) => {
    const matchCat = category === "전체" || item.category === category
    const matchSearch = item.name.toLowerCase().includes(search.toLowerCase())
    return matchCat && matchSearch
  })

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="font-serif text-3xl font-semibold text-[#141413]">냉장고</h1>
          <p className="text-[#6c6a64]">{items.length}개 재료 보유</p>
        </div>
        <div className="flex gap-2">
          <BulkAddDialog onAdd={fetch} />
          <AddItemDialog onAdd={fetch} />
        </div>
      </div>

      {error && (
        <Alert className="border-[#c64545]/20 bg-[#c64545]/10">
          <AlertDescription className="text-[#c64545]">{error}</AlertDescription>
        </Alert>
      )}

      <div className="flex flex-col gap-3 sm:flex-row">
        <Input
          placeholder="재료 검색..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="border-[#e6dfd8] bg-white"
        />
      </div>

      <Tabs value={category} onValueChange={setCategory}>
        <TabsList className="flex-wrap h-auto bg-[#f5f0e8]">
          {CATEGORIES.map((c) => (
            <TabsTrigger key={c} value={c} className="data-[state=active]:bg-[#cc785c] data-[state=active]:text-white">
              {c}
            </TabsTrigger>
          ))}
        </TabsList>
      </Tabs>

      {isLoading ? (
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 6 }).map((_, i) => <Skeleton key={i} className="h-24 rounded-xl" />)}
        </div>
      ) : filtered.length === 0 ? (
        <div className="py-16 text-center">
          <Package className="mx-auto mb-4 h-12 w-12 text-[#e6dfd8]" />
          <p className="text-[#6c6a64]">재료가 없습니다. 추가해 보세요!</p>
        </div>
      ) : (
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {filtered.map((item) => (
            <Card key={item.id} className="border-[#e6dfd8] bg-white hover:bg-[#faf9f5] transition-colors">
              <CardContent className="p-4">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="font-medium text-[#141413]">{item.name}</span>
                      {item.is_condiment && <Badge className="bg-[#f5f0e8] text-[#8e8b82] text-xs hover:bg-[#f5f0e8]">상비</Badge>}
                      {item.expires_at && <ExpiryBadge expiresAt={item.expires_at} />}
                    </div>
                    <div className="mt-1 text-sm text-[#6c6a64]">
                      {item.quantity}{item.unit} · {item.category}
                    </div>
                    {item.memo && <div className="mt-1 text-xs text-[#8e8b82]">{item.memo}</div>}
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => remove(item.id)}
                    className="ml-2 h-8 w-8 p-0 text-[#8e8b82] hover:text-[#c64545]"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}
