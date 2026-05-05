"use client"
import { useEffect, useState } from "react"
import { ShoppingCart, Plus, Trash2, RefreshCw, Loader2, Check } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { Skeleton } from "@/components/ui/skeleton"
import { shoppingApi } from "@/lib/api"
import type { ShoppingItem } from "@/types"

function AddItemDialog({ onAdd }: { onAdd: () => void }) {
  const [open, setOpen] = useState(false)
  const [form, setForm] = useState({ name: "", quantity: "1", unit: "개" })
  const [loading, setLoading] = useState(false)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    try {
      await shoppingApi.add({ name: form.name, quantity: parseFloat(form.quantity) || 1, unit: form.unit })
      setOpen(false)
      setForm({ name: "", quantity: "1", unit: "개" })
      onAdd()
    } finally {
      setLoading(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger className="inline-flex items-center gap-1.5 rounded-lg border border-[#e6dfd8] bg-white px-2.5 py-1.5 text-sm font-medium text-[#3d3d3a] hover:bg-[#f5f0e8]">
        <Plus className="h-4 w-4" />항목 추가
      </DialogTrigger>
      <DialogContent className="bg-[#faf9f5]">
        <DialogHeader>
          <DialogTitle>항목 추가</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-1.5">
            <Label>이름 *</Label>
            <Input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} required placeholder="재료명" />
          </div>
          <div className="flex gap-2">
            <div className="flex-1 space-y-1.5">
              <Label>수량</Label>
              <Input type="number" value={form.quantity} onChange={(e) => setForm({ ...form, quantity: e.target.value })} min="0" step="0.1" />
            </div>
            <div className="w-20 space-y-1.5">
              <Label>단위</Label>
              <Input value={form.unit} onChange={(e) => setForm({ ...form, unit: e.target.value })} />
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

export default function ShoppingPage() {
  const [items, setItems] = useState<ShoppingItem[]>([])
  const [loading, setLoading] = useState(true)
  const [generating, setGenerating] = useState(false)

  async function load() {
    const { data } = await shoppingApi.list()
    setItems(data)
  }

  useEffect(() => {
    load().finally(() => setLoading(false))
  }, [])

  async function handleGenerate() {
    setGenerating(true)
    try {
      await shoppingApi.generate()
      await load()
    } finally {
      setGenerating(false)
    }
  }

  async function handleToggle(item: ShoppingItem) {
    const { data } = await shoppingApi.update(item.id, { checked: !item.checked })
    setItems(items.map((i) => (i.id === item.id ? data : i)))
  }

  async function handleDelete(id: number) {
    await shoppingApi.remove(id)
    setItems(items.filter((i) => i.id !== id))
  }

  const grouped = items.reduce<Record<string, ShoppingItem[]>>((acc, item) => {
    const cat = item.category || "기타"
    if (!acc[cat]) acc[cat] = []
    acc[cat].push(item)
    return acc
  }, {})

  const unchecked = items.filter((i) => !i.checked).length
  const total = items.length

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="font-serif text-3xl font-semibold text-[#141413]">장보기 목록</h1>
          <p className="text-[#6c6a64]">{unchecked}/{total}개 항목 남음</p>
        </div>
        <div className="flex gap-2">
          <Button onClick={handleGenerate} disabled={generating} className="bg-[#cc785c] text-white hover:bg-[#a9583e]">
            {generating ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <RefreshCw className="mr-2 h-4 w-4" />}
            식단 기반 생성
          </Button>
          <AddItemDialog onAdd={load} />
        </div>
      </div>

      {loading ? (
        <div className="space-y-4">
          {Array.from({ length: 3 }).map((_, i) => <Skeleton key={i} className="h-32 rounded-xl" />)}
        </div>
      ) : items.length === 0 ? (
        <div className="py-16 text-center">
          <ShoppingCart className="mx-auto mb-4 h-12 w-12 text-[#e6dfd8]" />
          <p className="mb-4 text-[#6c6a64]">장보기 목록이 비어있습니다.</p>
          <Button onClick={handleGenerate} className="bg-[#cc785c] text-white hover:bg-[#a9583e]">
            식단 기반으로 생성하기
          </Button>
        </div>
      ) : (
        <div className="space-y-4">
          {Object.entries(grouped).map(([cat, catItems]) => (
            <Card key={cat} className="border-[#e6dfd8] bg-white">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-[#6c6a64]">{cat}</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2 pt-0">
                {catItems.map((item) => (
                  <div key={item.id} className="flex items-center gap-3">
                    <button
                      onClick={() => handleToggle(item)}
                      className={`flex h-5 w-5 shrink-0 items-center justify-center rounded border transition-colors ${
                        item.checked
                          ? "bg-[#5db872] border-[#5db872] text-white"
                          : "border-[#e6dfd8] hover:border-[#cc785c]"
                      }`}
                    >
                      {item.checked && <Check className="h-3 w-3" />}
                    </button>
                    <span className={`flex-1 text-sm ${item.checked ? "line-through text-[#8e8b82]" : "text-[#3d3d3a]"}`}>
                      {item.name}
                    </span>
                    <Badge className="bg-[#f5f0e8] text-[#6c6a64] text-xs hover:bg-[#f5f0e8]">
                      {item.quantity}{item.unit}
                    </Badge>
                    {item.source === "auto" && (
                      <Badge className="bg-[#cc785c]/10 text-[#cc785c] text-xs hover:bg-[#cc785c]/10">자동</Badge>
                    )}
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleDelete(item.id)}
                      className="h-7 w-7 p-0 text-[#8e8b82] hover:text-[#c64545]"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </Button>
                  </div>
                ))}
              </CardContent>
            </Card>
          ))}

          {items.some((i) => i.checked) && (
            <Button
              variant="ghost"
              onClick={async () => {
                const checkedIds = items.filter((i) => i.checked).map((i) => i.id)
                await Promise.all(checkedIds.map((id) => shoppingApi.remove(id)))
                await load()
              }}
              className="text-sm text-[#8e8b82] hover:text-[#c64545]"
            >
              완료된 항목 모두 삭제
            </Button>
          )}
        </div>
      )}
    </div>
  )
}
