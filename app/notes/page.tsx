'use client'

export const dynamic = 'force-dynamic'

import { useEffect, useState, useMemo } from 'react'
import { createBrowserClient } from '@supabase/ssr'
import { FileText, Clock, Search, Mic, Play } from 'lucide-react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import DashboardLayout from '@/components/DashboardLayout'
import { SkeletonNotes } from '@/components/Skeleton'

export default function NotesPage() {
  const [notes, setNotes] = useState<any[]>([])
  const [recordings, setRecordings] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const router = useRouter()

  const supabase = useMemo(() => {
    if (typeof window === 'undefined') return null
    return createBrowserClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    )
  }, [])

  useEffect(() => {
    if (!supabase) return
    const loadNotes = async () => {
      const { data: { session } } = await supabase.auth.getSession()
      if (!session) {
        router.push('/auth')
        return
      }

      const { data: recs } = await supabase
        .from('recordings')
        .select('*')
        .eq('user_id', session.user.id)
        .order('created_at', { ascending: false })

      const { data: notesData } = await supabase
        .from('study_notes')
        .select('*')
        .eq('user_id', session.user.id)
        .order('created_at', { ascending: false })

      setRecordings(recs || [])
      setNotes(notesData || [])
      setLoading(false)
    }
    loadNotes()
  }, [supabase, router])

  const filteredRecordings = recordings.filter(rec =>
    rec.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    rec.subject?.toLowerCase().includes(searchTerm.toLowerCase())
  )

  if (loading) {
    return (
      <DashboardLayout>
        <div className="space-y-6 fade-in">
          <div className="flex items-center justify-between">
            <div className="skeleton h-10 w-40 rounded" />
            <div className="skeleton h-12 w-36 rounded-xl" />
          </div>
          <div className="skeleton h-12 w-full rounded-xl" />
          <SkeletonNotes />
        </div>
      </DashboardLayout>
    )
  }

  return (
    <DashboardLayout>
      <div className="space-y-6 fade-in">
        {/* Header */}
        <div className="flex items-center justify-between">
          <h1 className="text-4xl font-bold text-white">
            My <span className="text-gradient">Notes</span>
          </h1>
          <Link
            href="/record"
            className="btn-primary inline-flex items-center gap-2"
          >
            <Mic className="w-5 h-5" />
            New Recording
          </Link>
        </div>

        {/* Search Bar */}
        <div className="relative">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
          <input
            type="text"
            placeholder="Search notes..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-12 pr-4 py-3 bg-slate-800/50 border border-slate-700/50 rounded-xl text-white placeholder-slate-400 focus:ring-2 focus:ring-violet-500 focus:border-transparent outline-none transition-all"
          />
        </div>

        {/* Notes List */}
        {filteredRecordings.length === 0 ? (
          <div className="glass-card p-12 text-center">
            <div className="w-16 h-16 bg-slate-700/50 rounded-full flex items-center justify-center mx-auto mb-4">
              <FileText className="w-8 h-8 text-slate-500" />
            </div>
            <h3 className="text-xl font-bold text-white mb-2">No recordings yet</h3>
            <p className="text-slate-400 mb-6">Start by recording your first lecture</p>
            <Link
              href="/record"
              className="btn-primary inline-flex items-center gap-2"
            >
              <Mic className="w-5 h-5" />
              Record Now
            </Link>
          </div>
        ) : (
          <div className="space-y-4">
            {filteredRecordings.map((recording) => {
              const note = notes.find(n => n.recording_id === recording.id)

              return (
                <div
                  key={recording.id}
                  className="glass-card p-6 hover:border-violet-500/30 transition-all group"
                >
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <div className="w-10 h-10 bg-violet-500/20 rounded-lg flex items-center justify-center">
                          <FileText className="w-5 h-5 text-violet-400" />
                        </div>
                        <h3 className="text-xl font-bold text-white group-hover:text-violet-300 transition-colors">
                          {recording.title || 'Untitled Recording'}
                        </h3>
                      </div>

                      <div className="flex items-center gap-4 text-sm text-slate-400 mb-3 ml-13">
                        <span className="flex items-center gap-1.5">
                          <Clock className="w-4 h-4" />
                          {new Date(recording.created_at).toLocaleDateString()}
                        </span>
                        {recording.duration && (
                          <span>{Math.round(recording.duration / 60)} min</span>
                        )}
                        {recording.subject && (
                          <span className="text-violet-400">{recording.subject}</span>
                        )}
                        {recording.exam_board && (
                          <span className="text-fuchsia-400">{recording.exam_board}</span>
                        )}
                      </div>

                      {note && note.summary && (
                        <p className="text-slate-400 line-clamp-2 ml-13">
                          {note.summary}
                        </p>
                      )}
                    </div>

                    <div className="flex items-center gap-3">
                      <span className={`px-3 py-1 rounded-full text-xs font-medium whitespace-nowrap ${
                        recording.status === 'completed'
                          ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                          : recording.status === 'processing'
                          ? 'bg-amber-500/20 text-amber-400 border border-amber-500/30 animate-pulse'
                          : recording.status === 'failed'
                          ? 'bg-red-500/20 text-red-400 border border-red-500/30'
                          : 'bg-slate-500/20 text-slate-400 border border-slate-500/30'
                      }`}>
                        {recording.status === 'processing' && (
                          <span className="inline-flex items-center gap-1">
                            <span className="w-1.5 h-1.5 bg-amber-400 rounded-full animate-pulse" />
                            Processing
                          </span>
                        )}
                        {recording.status !== 'processing' && recording.status}
                      </span>

                      {recording.status === 'completed' && note && (
                        <Link
                          href={`/notes/${recording.id}`}
                          className="btn-primary text-sm py-2 px-4 inline-flex items-center gap-2"
                        >
                          <Play className="w-4 h-4" />
                          View Notes
                        </Link>
                      )}
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </div>
    </DashboardLayout>
  )
}
