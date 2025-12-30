'use client'
import { BookOpen, Menu, X, LogOut } from 'lucide-react'
import Link from 'next/link'
import { useState, useEffect } from 'react'
import { createBrowserClient } from '@supabase/ssr'
import { useRouter, usePathname } from 'next/navigation'

export default function NavBar() {
  const [isOpen, setIsOpen] = useState(false)
  const [isScrolled, setIsScrolled] = useState(false)
  const [user, setUser] = useState<any>(null)
  const [isLoading, setIsLoading] = useState(true)
  const router = useRouter()
  const pathname = usePathname()

  const supabase = createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  )

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 10)
    }

    const getUser = async () => {
      const { data: { session } } = await supabase.auth.getSession()
      setUser(session?.user || null)
      setIsLoading(false)
    }

    window.addEventListener('scroll', handleScroll)
    getUser()

    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  const handleLogout = async () => {
    await supabase.auth.signOut()
    setUser(null)
    router.push('/')
    router.refresh()
  }

  // Determine if we're on a public page (landing, pricing preview, auth)
  const isPublicPage = pathname === '/' || pathname === '/auth'
  
  // Show logged-in nav only if user exists AND we're not on a public page
  const showLoggedInNav = user && !isPublicPage

  return (
    <nav className={`fixed top-0 left-0 right-0 z-50 transition-all duration-200 ${
      isScrolled 
        ? 'bg-white/95 backdrop-blur-sm border-b border-gray-200 shadow-sm' 
        : 'bg-white border-b border-gray-200'
    }`}>
      <div className="max-w-6xl mx-auto px-6">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2.5 group">
            <div className="w-9 h-9 bg-blue-600 rounded-lg flex items-center justify-center group-hover:bg-blue-700 transition-colors">
              <BookOpen className="w-5 h-5 text-white" strokeWidth={2.5} />
            </div>
            <span className="text-xl font-bold text-gray-900">Studly</span>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center gap-8">
            {!showLoggedInNav ? (
              <>
                <Link 
                  href="/#how-it-works" 
                  className="text-gray-700 hover:text-gray-900 font-medium transition-colors text-sm"
                >
                  How it works
                </Link>
                <Link 
                  href="/#pricing" 
                  className="text-gray-700 hover:text-gray-900 font-medium transition-colors text-sm"
                >
                  Pricing
                </Link>
                <Link 
                  href="/auth" 
                  className="px-5 py-2 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700 transition-colors text-sm"
                >
                  Open app
                </Link>
              </>
            ) : (
              <>
                <Link 
                  href="/dashboard" 
                  className="text-gray-700 hover:text-gray-900 font-medium transition-colors text-sm"
                >
                  Dashboard
                </Link>
                <Link 
                  href="/record" 
                  className="text-gray-700 hover:text-gray-900 font-medium transition-colors text-sm"
                >
                  Record
                </Link>
                <Link 
                  href="/notes" 
                  className="text-gray-700 hover:text-gray-900 font-medium transition-colors text-sm"
                >
                  My notes
                </Link>
                <Link 
                  href="/settings" 
                  className="text-gray-700 hover:text-gray-900 font-medium transition-colors text-sm"
                >
                  Settings
                </Link>
                <button
                  onClick={handleLogout}
                  className="flex items-center gap-2 px-5 py-2 bg-gray-100 text-gray-900 font-semibold rounded-lg hover:bg-gray-200 transition-colors text-sm"
                >
                  <LogOut className="w-4 h-4" />
                  Sign out
                </button>
              </>
            )}
          </div>

          {/* Mobile Menu Button */}
          <button 
            onClick={() => setIsOpen(!isOpen)}
            className="md:hidden p-2 text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
          >
            {isOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>

        {/* Mobile Menu */}
        {isOpen && (
          <div className="md:hidden border-t border-gray-200 py-4 bg-white">
            <div className="flex flex-col gap-1">
              {!showLoggedInNav ? (
                <>
                  <Link 
                    href="/#how-it-works" 
                    className="text-gray-700 hover:text-gray-900 hover:bg-gray-50 font-medium transition-colors px-4 py-2.5 rounded-lg text-sm"
                    onClick={() => setIsOpen(false)}
                  >
                    How it works
                  </Link>
                  <Link 
                    href="/#pricing" 
                    className="text-gray-700 hover:text-gray-900 hover:bg-gray-50 font-medium transition-colors px-4 py-2.5 rounded-lg text-sm"
                    onClick={() => setIsOpen(false)}
                  >
                    Pricing
                  </Link>
                  <Link 
                    href="/auth" 
                    className="mt-2 mx-4 px-5 py-2.5 bg-blue-600 text-white font-semibold rounded-lg text-center hover:bg-blue-700 transition-colors text-sm"
                    onClick={() => setIsOpen(false)}
                  >
                    Open app
                  </Link>
                </>
              ) : (
                <>
                  <Link 
                    href="/dashboard" 
                    className="text-gray-700 hover:text-gray-900 hover:bg-gray-50 font-medium transition-colors px-4 py-2.5 rounded-lg text-sm"
                    onClick={() => setIsOpen(false)}
                  >
                    Dashboard
                  </Link>
                  <Link 
                    href="/record" 
                    className="text-gray-700 hover:text-gray-900 hover:bg-gray-50 font-medium transition-colors px-4 py-2.5 rounded-lg text-sm"
                    onClick={() => setIsOpen(false)}
                  >
                    Record
                  </Link>
                  <Link 
                    href="/notes" 
                    className="text-gray-700 hover:text-gray-900 hover:bg-gray-50 font-medium transition-colors px-4 py-2.5 rounded-lg text-sm"
                    onClick={() => setIsOpen(false)}
                  >
                    My notes
                  </Link>
                  <Link 
                    href="/settings" 
                    className="text-gray-700 hover:text-gray-900 hover:bg-gray-50 font-medium transition-colors px-4 py-2.5 rounded-lg text-sm"
                    onClick={() => setIsOpen(false)}
                  >
                    Settings
                  </Link>
                  <button
                    onClick={() => {
                      handleLogout()
                      setIsOpen(false)
                    }}
                    className="mt-2 mx-4 flex items-center justify-center gap-2 px-5 py-2.5 bg-gray-100 text-gray-900 font-semibold rounded-lg text-center hover:bg-gray-200 transition-colors text-sm"
                  >
                    <LogOut className="w-4 h-4" />
                    Sign out
                  </button>
                </>
              )}
            </div>
          </div>
        )}
      </div>
    </nav>
  )
}
