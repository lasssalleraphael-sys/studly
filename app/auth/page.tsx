'use client'

import { Suspense, useState, useEffect } from 'react'
import { createBrowserClient } from '@supabase/ssr'
import { BookOpen, Mail, Lock, ArrowRight, Sparkles } from 'lucide-react'
import Link from 'next/link'
import { useSearchParams } from 'next/navigation'

function AuthContent() {
  const [isSignUp, setIsSignUp] = useState(false)
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [checkingSession, setCheckingSession] = useState(true)
  const searchParams = useSearchParams()

  const supabase = createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  )

  useEffect(() => {
    const checkSession = async () => {
      const { data: { session } } = await supabase.auth.getSession()

      if (session) {
        const { data: subscription } = await supabase
          .from('subscriptions')
          .select('status')
          .eq('user_id', session.user.id)
          .in('status', ['active', 'trialing'])
          .single()

        const redirectTo = searchParams.get('redirect')
        if (redirectTo) {
          window.location.href = redirectTo
        } else if (subscription) {
          window.location.href = '/dashboard'
        } else {
          window.location.href = '/pricing'
        }
      } else {
        setCheckingSession(false)
      }
    }

    checkSession()
  }, [supabase, searchParams])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')

    try {
      if (isSignUp) {
        const { error } = await supabase.auth.signUp({
          email,
          password,
          options: {
            emailRedirectTo: `${window.location.origin}/pricing`,
          },
        })
        if (error) throw error

        window.location.href = '/pricing'
      } else {
        const { data, error } = await supabase.auth.signInWithPassword({
          email,
          password,
        })
        if (error) throw error

        const { data: subscription } = await supabase
          .from('subscriptions')
          .select('status')
          .eq('user_id', data.session?.user.id)
          .in('status', ['active', 'trialing'])
          .single()

        const redirectTo = searchParams.get('redirect')
        if (redirectTo) {
          window.location.href = redirectTo
        } else if (subscription) {
          window.location.href = '/dashboard'
        } else {
          window.location.href = '/pricing'
        }
      }
    } catch (err: any) {
      setError(err.message || 'Authentication failed')
    } finally {
      setLoading(false)
    }
  }

  if (checkingSession) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center">
        <div className="text-center">
          <div className="w-8 h-8 border-2 border-violet-500 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-slate-400">Loading...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-slate-950 flex items-center justify-center px-6 py-24">
      {/* Background gradient */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-violet-500/10 rounded-full blur-3xl" />
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-fuchsia-500/10 rounded-full blur-3xl" />
      </div>

      <div className="w-full max-w-md relative z-10">
        <Link href="/" className="flex items-center gap-2.5 justify-center mb-8">
          <div className="w-11 h-11 bg-gradient-to-br from-violet-500 to-fuchsia-500 rounded-xl flex items-center justify-center shadow-lg shadow-violet-500/20">
            <BookOpen className="w-6 h-6 text-white" strokeWidth={2.5} />
          </div>
          <span className="text-2xl font-bold text-white">Studly</span>
        </Link>

        <div className="glass-card p-8">
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold text-white mb-2">
              {isSignUp ? 'Create your account' : 'Welcome back'}
            </h1>
            <p className="text-slate-400">
              {isSignUp
                ? 'Start your free 7-day trial today'
                : 'Sign in to continue studying'}
            </p>
          </div>

          {error && (
            <div className="mb-6 p-4 glass-card border-red-500/30 bg-red-500/10">
              <p className="text-sm text-red-400">{error}</p>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label htmlFor="email" className="block text-sm font-semibold text-slate-300 mb-2">
                Email address
              </label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                <input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="you@example.com"
                  required
                  className="w-full pl-11 pr-4 py-3 bg-slate-800/50 border border-slate-700/50 rounded-xl text-white placeholder-slate-500 focus:ring-2 focus:ring-violet-500 focus:border-transparent outline-none transition-all"
                />
              </div>
            </div>

            <div>
              <label htmlFor="password" className="block text-sm font-semibold text-slate-300 mb-2">
                Password
              </label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                <input
                  id="password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  required
                  minLength={6}
                  className="w-full pl-11 pr-4 py-3 bg-slate-800/50 border border-slate-700/50 rounded-xl text-white placeholder-slate-500 focus:ring-2 focus:ring-violet-500 focus:border-transparent outline-none transition-all"
                />
              </div>
              {isSignUp && (
                <p className="mt-2 text-xs text-slate-500">
                  Must be at least 6 characters
                </p>
              )}
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full btn-primary flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? (
                <span className="flex items-center gap-2">
                  <span className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  Loading...
                </span>
              ) : (
                <>
                  {isSignUp ? 'Create account' : 'Sign in'}
                  <ArrowRight className="w-5 h-5" />
                </>
              )}
            </button>
          </form>

          {isSignUp && (
            <div className="mt-6 flex items-center justify-center gap-2 text-sm text-slate-400">
              <Sparkles className="w-4 h-4 text-violet-400" />
              <span>7-day free trial included</span>
            </div>
          )}

          <div className="mt-6 text-center">
            <button
              onClick={() => {
                setIsSignUp(!isSignUp)
                setError('')
              }}
              className="text-sm text-slate-400 hover:text-white transition-colors"
            >
              {isSignUp
                ? 'Already have an account? Sign in'
                : "Don't have an account? Sign up"}
            </button>
          </div>

          {isSignUp && (
            <p className="mt-6 text-xs text-center text-slate-500">
              By signing up, you agree to our{' '}
              <Link href="#" className="text-violet-400 hover:text-violet-300">
                Terms of Service
              </Link>{' '}
              and{' '}
              <Link href="#" className="text-violet-400 hover:text-violet-300">
                Privacy Policy
              </Link>
            </p>
          )}
        </div>

        <div className="mt-6 text-center">
          <Link
            href="/"
            className="text-sm text-slate-500 hover:text-slate-300 transition-colors"
          >
            ← Back to home
          </Link>
        </div>
      </div>
    </div>
  )
}

function AuthLoading() {
  return (
    <div className="min-h-screen bg-slate-950 flex items-center justify-center">
      <div className="text-center">
        <div className="w-8 h-8 border-2 border-violet-500 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
        <p className="text-slate-400">Loading...</p>
      </div>
    </div>
  )
}

export default function AuthPage() {
  return (
    <Suspense fallback={<AuthLoading />}>
      <AuthContent />
    </Suspense>
  )
}
