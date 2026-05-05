"use client"
import { useEffect } from "react"
import { useRouter } from "next/navigation"
import { useAuthStore } from "@/stores/authStore"
import { AuthProvider } from "@/components/auth/AuthProvider"
import { Navbar } from "@/components/layout/Navbar"

function MainLayoutInner({ children }: { children: React.ReactNode }) {
  const { user, isLoading } = useAuthStore()
  const router = useRouter()

  useEffect(() => {
    if (!isLoading && !user) {
      router.push("/login")
    }
  }, [user, isLoading, router])

  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#faf9f5]">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-[#e6dfd8] border-t-[#cc785c]" />
      </div>
    )
  }

  if (!user) return null

  return (
    <div className="min-h-screen bg-[#faf9f5]">
      <Navbar />
      <main className="mx-auto max-w-6xl px-4 py-8">{children}</main>
    </div>
  )
}

export default function MainLayout({ children }: { children: React.ReactNode }) {
  return (
    <AuthProvider>
      <MainLayoutInner>{children}</MainLayoutInner>
    </AuthProvider>
  )
}
