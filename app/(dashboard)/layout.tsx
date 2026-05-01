import Link from 'next/link'
import { redirect } from 'next/navigation'
import {
  LayoutDashboard,
  Briefcase,
  ArrowLeftRight,
  BarChart2,
  FileText,
  LogOut,
  TrendingUp,
} from 'lucide-react'
import { getSession } from '@/lib/session'
import { db } from '@/lib/db'
import { logout } from '@/server/actions/auth'
import { Button } from '@/components/ui/button'
import { Separator } from '@/components/ui/separator'

const navItems = [
  { href: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { href: '/assets', label: 'Assets', icon: Briefcase },
  { href: '/transactions', label: 'Transactions', icon: ArrowLeftRight },
  { href: '/analytics', label: 'Analytics', icon: BarChart2 },
  { href: '/reports', label: 'Reports', icon: FileText },
]

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const session = await getSession()
  if (!session?.userId) redirect('/login')

  const user = await db.user.findUnique({
    where: { id: session.userId },
    select: { email: true, name: true },
  })

  return (
    <div className="flex h-screen overflow-hidden bg-background">
      {/* Sidebar */}
      <aside className="w-60 flex-shrink-0 border-r border-border flex flex-col">
        {/* Logo */}
        <div className="px-4 py-5 flex items-center gap-2">
          <TrendingUp className="h-5 w-5 text-emerald-400" />
          <span className="font-semibold text-base tracking-tight">Portfolio</span>
        </div>

        <Separator />

        {/* Navigation */}
        <nav className="flex-1 overflow-y-auto py-4 px-2 space-y-1">
          {navItems.map((item) => {
            const Icon = item.icon
            return (
              <Link
                key={item.href}
                href={item.href}
                className="flex items-center gap-3 px-3 py-2 rounded-md text-sm text-muted-foreground hover:text-foreground hover:bg-accent transition-colors"
              >
                <Icon className="h-4 w-4 flex-shrink-0" />
                {item.label}
              </Link>
            )
          })}
        </nav>

        <Separator />

        {/* User section */}
        <div className="p-3 space-y-2">
          <div className="px-3 py-1">
            <p className="text-sm font-medium truncate">{user?.name || 'User'}</p>
            <p className="text-xs text-muted-foreground truncate">{user?.email}</p>
          </div>
          <form action={logout}>
            <Button
              type="submit"
              variant="ghost"
              size="sm"
              className="w-full justify-start gap-2 text-muted-foreground hover:text-foreground"
            >
              <LogOut className="h-4 w-4" />
              Sign out
            </Button>
          </form>
        </div>
      </aside>

      {/* Main content */}
      <main className="flex-1 overflow-y-auto">
        <div className="max-w-6xl mx-auto px-6 py-8">
          {children}
        </div>
      </main>
    </div>
  )
}
