'use client'

import { usePathname } from 'next/navigation'
import Link from 'next/link'
import {
  LayoutDashboard,
  Mic,
  FileText,
  Clock,
  Settings,
  LogOut,
  Sparkles,
  ChevronRight
} from 'lucide-react'
import { createBrowserClient } from '@supabase/ssr'
import { useRouter } from 'next/navigation'

interface SidebarProps {
  user: {
    email?: string
  } | null
  subscription?: {
    plan_name: string
    status: string
  } | null
}

const navigation = [
  { name: 'Dashboard', href: '/dashboard', icon: LayoutDashboard },
  { name: 'Record', href: '/record', icon: Mic },
  { name: 'My Notes', href: '/notes', icon: FileText },
  { name: 'History', href: '/notes', icon: Clock },
]

export default function Sidebar({ user, subscription }: SidebarProps) {
  const pathname = usePathname()
  const router = useRouter()

  const supabase = createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  )

  const handleLogout = async () => {
    await supabase.auth.signOut()
    router.push('/')
    router.refresh()
  }

  const firstName = user?.email?.split('@')[0] || 'User'

  return (
    <aside className="fixed left-0 top-0 h-screen w-64 bg-slate-900/95 backdrop-blur-xl border-r border-slate-800 flex flex-col z-50">
      {/* Logo */}
      <div className="p-6 border-b border-slate-800">
        <Link href="/dashboard" className="flex items-center gap-3">
          <div className="w-10 h-10 bg-gradient-to-br from-violet-600 to-purple-600 rounded-xl flex items-center justify-center shadow-lg shadow-violet-600/25">
            <Sparkles className="w-5 h-5 text-white" />
          </div>
          <span className="text-xl font-bold text-white">Studly</span>
        </Link>
      </div>

      {/* Navigation */}
      <nav className="flex-1 p-4 space-y-1">
        {navigation.map((item) => {
          const isActive = pathname === item.href ||
            (item.href !== '/dashboard' && pathname.startsWith(item.href))

          return (
            <Link
              key={item.name}
              href={item.href}
              className={`nav-item ${isActive ? 'active' : ''}`}
            >
              <item.icon className="w-5 h-5" />
              <span className="font-medium">{item.name}</span>
              {isActive && (
                <ChevronRight className="w-4 h-4 ml-auto text-violet-400" />
              )}
            </Link>
          )
        })}
      </nav>

      {/* Subscription Card */}
      {subscription && (
        <div className="p-4">
          <div className="glass-card p-4">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-medium text-slate-400 uppercase tracking-wider">
                Current Plan
              </span>
              <span className="badge-success capitalize">
                {subscription.status}
              </span>
            </div>
            <p className="text-lg font-bold text-white capitalize">
              {subscription.plan_name}
            </p>
            <Link
              href="/pricing"
              className="mt-3 block text-center py-2 px-4 bg-violet-600/20 hover:bg-violet-600/30 text-violet-400 text-sm font-medium rounded-lg transition-colors"
            >
              Upgrade Plan
            </Link>
          </div>
        </div>
      )}

      {/* User Section */}
      <div className="p-4 border-t border-slate-800">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-10 h-10 bg-gradient-to-br from-slate-700 to-slate-800 rounded-full flex items-center justify-center">
            <span className="text-sm font-bold text-white uppercase">
              {firstName.charAt(0)}
            </span>
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-white truncate">
              {firstName}
            </p>
            <p className="text-xs text-slate-500 truncate">
              {user?.email}
            </p>
          </div>
        </div>

        <div className="space-y-1">
          <Link href="/settings" className="nav-item">
            <Settings className="w-5 h-5" />
            <span className="font-medium">Settings</span>
          </Link>
          <button onClick={handleLogout} className="nav-item w-full text-left hover:text-red-400">
            <LogOut className="w-5 h-5" />
            <span className="font-medium">Sign Out</span>
          </button>
        </div>
      </div>
    </aside>
  )
}
