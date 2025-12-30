'use client'
import { useEffect, useState } from 'react'
import { createBrowserClient } from '@supabase/ssr'
import { FileText, Clock, CheckCircle, Loader, Search } from 'lucide-react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'

export default function NotesPage() {
  const [notes, setNotes] = useState<any[]>([])
  const [recordings, setRecordings] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const router = useRouter()

  const supabase = createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  )

  useEffect(() => {
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
  }, [])

  const filteredRecordings = recordings.filter(rec =>
    rec.title?.toLowerCase().includes(searchTerm.toLowerCase())
  )

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <Loader className="w-8 h-8 text-blue-600 animate-spin" />
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 pt-24 pb-12 px-6">
      <div className="max-w-6xl mx-auto">
        <div className="flex items-center justify-between mb-8">
          <h1 className="text-4xl font-bold text-gray-900">My Notes</h1>
          <Link
            href="/record"
            className="px-6 py-3 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700 transition-colors"
          >
            New Recording
          </Link>
        </div>

        {/* Search Bar */}
        <div className="mb-6">
          <div className="relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="text"
              placeholder="Search notes..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-12 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-600 focus:border-transparent outline-none"
            />
          </div>
        </div>

        {/* Notes List */}
        {filteredRecordings.length === 0 ? (
          <div className="bg-white border border-gray-200 rounded-xl p-12 text-center">
            <FileText className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-xl font-bold text-gray-900 mb-2">No recordings yet</h3>
            <p className="text-gray-600 mb-6">Start by recording your first lecture</p>
            <Link
              href="/record"
              className="inline-flex items-center gap-2 px-6 py-3 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700 transition-colors"
            >
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
                  className="bg-white border border-gray-200 rounded-xl p-6 hover:shadow-md transition-all"
                >
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <FileText className="w-5 h-5 text-blue-600" />
                        <h3 className="text-xl font-bold text-gray-900">
                          {recording.title || 'Untitled Recording'}
                        </h3>
                      </div>
                      
                      <div className="flex items-center gap-4 text-sm text-gray-600 mb-3">
                        <span className="flex items-center gap-1">
                          <Clock className="w-4 h-4" />
                          {new Date(recording.created_at).toLocaleDateString()}
                        </span>
                        {recording.duration && (
                          <span>{Math.round(recording.duration / 60)} min</span>
                        )}
                      </div>

                      {note && (
                        <p className="text-gray-700 line-clamp-2 mb-3">
                          {note.summary}
                        </p>
                      )}
                    </div>

                    <div className="flex items-center gap-3">
                      <span className={`px-3 py-1 rounded-full text-xs font-medium whitespace-nowrap ${
                        recording.status === 'completed' 
                          ? 'bg-green-100 text-green-700'
                          : recording.status === 'processing'
                          ? 'bg-orange-100 text-orange-700'
                          : recording.status === 'failed'
                          ? 'bg-red-100 text-red-700'
                          : 'bg-gray-100 text-gray-700'
                      }`}>
                        {recording.status}
                      </span>

                      {recording.status === 'completed' && note && (
                        <Link
                          href={`/notes/${recording.id}`}
                          className="px-4 py-2 bg-blue-600 text-white text-sm font-semibold rounded-lg hover:bg-blue-700 transition-colors"
                        >
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
    </div>
  )
}
