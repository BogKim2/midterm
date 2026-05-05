"use client"
import Link from "next/link"
import { usePathname, useRouter } from "next/navigation"
import { useAuthStore } from "@/stores/authStore"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet"
import { Menu, ChefHat } from "lucide-react"

const navLinks = [
  { href: "/dashboard", label: "대시보드" },
  { href: "/fridge", label: "냉장고" },
  { href: "/recipes", label: "레시피" },
  { href: "/meal-plan", label: "식단" },
  { href: "/shopping", label: "장보기" },
]

export function Navbar() {
  const pathname = usePathname()
  const router = useRouter()
  const { user, logout } = useAuthStore()

  function handleLogout() {
    logout()
    router.push("/")
  }

  return (
    <header className="sticky top-0 z-50 border-b border-[#e6dfd8] bg-[#faf9f5]/90 backdrop-blur-sm">
      <div className="mx-auto flex h-14 max-w-6xl items-center justify-between px-4">
        <Link href="/dashboard" className="flex items-center gap-2 font-semibold text-[#141413]">
          <ChefHat className="h-5 w-5 text-[#cc785c]" />
          <span className="text-xl font-semibold">FridgeChef</span>
        </Link>

        {/* Desktop nav */}
        <nav className="hidden items-center gap-1 md:flex">
          {navLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className={`rounded-md px-3 py-1.5 text-sm transition-colors ${
                pathname === link.href
                  ? "bg-[#e8e0d2] font-medium text-[#141413]"
                  : "text-[#6c6a64] hover:bg-[#f5f0e8] hover:text-[#141413]"
              }`}
            >
              {link.label}
            </Link>
          ))}
        </nav>

        <div className="flex items-center gap-2">
          {user && (
            <DropdownMenu>
              <DropdownMenuTrigger className="inline-flex items-center gap-2 rounded-md px-2.5 py-1.5 text-sm text-[#6c6a64] hover:bg-[#f5f0e8]">
                <span className="hidden sm:inline">{user.name ?? user.email}</span>
                <span className="sm:hidden">메뉴</span>
              </DropdownMenuTrigger>
              <DropdownMenuContent>
                <DropdownMenuItem onClick={() => router.push("/settings")}>
                  설정
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={handleLogout}>
                  로그아웃
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          )}

          {/* Mobile menu */}
          <Sheet>
            <SheetTrigger className="inline-flex items-center justify-center rounded-md p-1.5 text-[#6c6a64] hover:bg-[#f5f0e8] md:hidden">
              <Menu className="h-5 w-5" />
            </SheetTrigger>
            <SheetContent side="right" className="bg-[#faf9f5]">
              <nav className="mt-8 flex flex-col gap-2">
                {navLinks.map((link) => (
                  <Link
                    key={link.href}
                    href={link.href}
                    className={`rounded-md px-3 py-2 text-sm font-medium transition-colors ${
                      pathname === link.href
                        ? "bg-[#e8e0d2] text-[#141413]"
                        : "text-[#6c6a64] hover:bg-[#f5f0e8]"
                    }`}
                  >
                    {link.label}
                  </Link>
                ))}
              </nav>
            </SheetContent>
          </Sheet>
        </div>
      </div>
    </header>
  )
}
