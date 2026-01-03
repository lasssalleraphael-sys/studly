'use client'

export const dynamic = 'force-dynamic'

import { useEffect, useState } from 'react'
import { createBrowserClient } from '@supabase/ssr'
import { ArrowLeft, Loader, Clock, FileText, BookOpen, Lightbulb, Copy, Check, Sparkles, GraduationCap } from 'lucide-react'
import Link from 'next/link'
import { useRouter, useParams } from 'next/navigation'
import DashboardLayout from '@/components/DashboardLayout'

export default function NotePage() {
  const [note, setNote] = useState<any>(null)
  const [recording, setRecording] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState<'notes' | 'flashcards' | 'transcript'>('notes')
  const [flippedCards, setFlippedCards] = useState<Set<number>>(new Set())
  const [copiedId, setCopiedId] = useState<number | null>(null)
  const router = useRouter()
  const params = useParams()

  const supabase = createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  )

  useEffect(() => {
    const loadNote = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) {
        router.push('/auth')
        return
      }

      const recordingId = params.id as string

      const { data: rec } = await supabase
        .from('recordings')
        .select('*')
        .eq('id', recordingId)
        .eq('user_id', user.id)
        .single()

      if (!rec) {
        router.push('/notes')
        return
      }

      const { data: noteData } = await supabase
        .from('study_notes')
        .select('*')
        .eq('recording_id', recordingId)
        .eq('user_id', user.id)
        .single()

      setRecording(rec)
      setNote(noteData)
      setLoading(false)
    }
    loadNote()
  }, [params.id, supabase, router])

  const toggleCard = (index: number) => {
    const newFlipped = new Set(flippedCards)
    if (newFlipped.has(index)) {
      newFlipped.delete(index)
    } else {
      newFlipped.add(index)
    }
    setFlippedCards(newFlipped)
  }

  const copyToClipboard = async (text: string, index: number) => {
    await navigator.clipboard.writeText(text)
    setCopiedId(index)
    setTimeout(() => setCopiedId(null), 2000)
  }

  if (loading) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center min-h-[60vh]">
          <div className="w-8 h-8 border-2 border-violet-500 border-t-transparent rounded-full animate-spin" />
        </div>
      </DashboardLayout>
    )
  }

  if (recording?.status === 'processing') {
    return (
      <DashboardLayout>
        <div className="max-w-4xl mx-auto text-center py-20">
          <div className="w-20 h-20 bg-violet-500/20 rounded-full flex items-center justify-center mx-auto mb-6">
            <Loader className="w-10 h-10 text-violet-400 animate-spin" />
          </div>
          <h2 className="text-2xl font-bold text-white mb-2">Processing your recording</h2>
          <p className="text-slate-400 mb-6">This usually takes 1-2 minutes.</p>
          <Link href="/notes" className="text-violet-400 hover:text-violet-300 font-medium inline-flex items-center gap-2">
            <ArrowLeft className="w-4 h-4" />
            Back to all notes
          </Link>
        </div>
      </DashboardLayout>
    )
  }

  if (recording?.status === 'failed') {
    return (
      <DashboardLayout>
        <div className="max-w-4xl mx-auto text-center py-20">
          <div className="w-20 h-20 bg-red-500/20 rounded-full flex items-center justify-center mx-auto mb-6">
            <FileText className="w-10 h-10 text-red-400" />
          </div>
          <h2 className="text-2xl font-bold text-white mb-2">Processing failed</h2>
          <p className="text-slate-400 mb-6">Something went wrong. Please try again.</p>
          <Link href="/record" className="text-violet-400 hover:text-violet-300 font-medium">
            Try recording again →
          </Link>
        </div>
      </DashboardLayout>
    )
  }

  if (!note) {
    return (
      <DashboardLayout>
        <div className="max-w-4xl mx-auto text-center py-20">
          <div className="w-20 h-20 bg-slate-700/50 rounded-full flex items-center justify-center mx-auto mb-6">
            <FileText className="w-10 h-10 text-slate-500" />
          </div>
          <h2 className="text-2xl font-bold text-white mb-2">Notes not ready yet</h2>
          <p className="text-slate-400 mb-6">Check back in a few minutes.</p>
          <Link href="/notes" className="text-violet-400 hover:text-violet-300 font-medium inline-flex items-center gap-2">
            <ArrowLeft className="w-4 h-4" />
            Back to all notes
          </Link>
        </div>
      </DashboardLayout>
    )
  }

  return (
    <DashboardLayout>
      <div className="max-w-4xl mx-auto fade-in">
        {/* Header */}
        <div className="mb-8">
          <Link
            href="/notes"
            className="inline-flex items-center gap-2 text-violet-400 hover:text-violet-300 font-medium mb-4 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to all notes
          </Link>

          <h1 className="text-4xl font-bold text-white mb-3">
            {note.title || recording.title || 'Untitled Notes'}
          </h1>
          <div className="flex items-center gap-4 text-sm text-slate-400">
            <span className="flex items-center gap-1.5">
              <Clock className="w-4 h-4" />
              {new Date(recording.created_at).toLocaleDateString()}
            </span>
            {recording.subject && (
              <span className="text-violet-400">{recording.subject}</span>
            )}
            {recording.exam_board && (
              <span className="text-fuchsia-400">{recording.exam_board}</span>
            )}
          </div>
        </div>

        {/* Summary */}
        {note.summary && (
          <div className="glass-card p-6 mb-6 border-violet-500/20 bg-gradient-to-r from-violet-500/5 to-fuchsia-500/5">
            <div className="flex items-center gap-2 mb-3">
              <div className="w-8 h-8 bg-violet-500/20 rounded-lg flex items-center justify-center">
                <Lightbulb className="w-4 h-4 text-violet-400" />
              </div>
              <h2 className="text-lg font-bold text-white">Summary</h2>
            </div>
            <p className="text-slate-300 leading-relaxed whitespace-pre-wrap">{note.summary}</p>
          </div>
        )}

        {/* Key Concepts */}
        {note.key_concepts && note.key_concepts.length > 0 && (
          <div className="glass-card p-6 mb-6">
            <div className="flex items-center gap-2 mb-4">
              <div className="w-8 h-8 bg-fuchsia-500/20 rounded-lg flex items-center justify-center">
                <Sparkles className="w-4 h-4 text-fuchsia-400" />
              </div>
              <h2 className="text-lg font-bold text-white">Key Concepts</h2>
            </div>
            <div className="flex flex-wrap gap-2">
              {note.key_concepts.map((concept: string, i: number) => (
                <span key={i} className="px-3 py-1.5 bg-violet-500/20 text-violet-300 rounded-full text-sm font-medium border border-violet-500/30">
                  {concept}
                </span>
              ))}
            </div>
          </div>
        )}

        {/* Exam Tips */}
        {note.exam_tips && note.exam_tips.length > 0 && (
          <div className="glass-card p-6 mb-6 border-emerald-500/20 bg-gradient-to-r from-emerald-500/5 to-green-500/5">
            <div className="flex items-center gap-2 mb-4">
              <div className="w-8 h-8 bg-emerald-500/20 rounded-lg flex items-center justify-center">
                <GraduationCap className="w-4 h-4 text-emerald-400" />
              </div>
              <h2 className="text-lg font-bold text-white">Exam Tips</h2>
            </div>
            <ul className="space-y-2">
              {note.exam_tips.map((tip: string, i: number) => (
                <li key={i} className="flex items-start gap-3">
                  <span className="w-5 h-5 bg-emerald-500/20 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                    <Check className="w-3 h-3 text-emerald-400" />
                  </span>
                  <span className="text-slate-300">{tip}</span>
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* Tabs */}
        <div className="glass-card overflow-hidden mb-6">
          <div className="flex border-b border-slate-700/50">
            <button
              onClick={() => setActiveTab('notes')}
              className={`flex-1 px-6 py-4 text-sm font-semibold transition-colors flex items-center justify-center gap-2 ${
                activeTab === 'notes'
                  ? 'text-violet-400 bg-violet-500/10 border-b-2 border-violet-500'
                  : 'text-slate-400 hover:bg-slate-800/50'
              }`}
            >
              <BookOpen className="w-4 h-4" />
              Notes
            </button>
            <button
              onClick={() => setActiveTab('flashcards')}
              className={`flex-1 px-6 py-4 text-sm font-semibold transition-colors flex items-center justify-center gap-2 ${
                activeTab === 'flashcards'
                  ? 'text-violet-400 bg-violet-500/10 border-b-2 border-violet-500'
                  : 'text-slate-400 hover:bg-slate-800/50'
              }`}
            >
              <FileText className="w-4 h-4" />
              Flashcards ({note.flashcards?.length || 0})
            </button>
            <button
              onClick={() => setActiveTab('transcript')}
              className={`flex-1 px-6 py-4 text-sm font-semibold transition-colors flex items-center justify-center gap-2 ${
                activeTab === 'transcript'
                  ? 'text-violet-400 bg-violet-500/10 border-b-2 border-violet-500'
                  : 'text-slate-400 hover:bg-slate-800/50'
              }`}
            >
              <FileText className="w-4 h-4" />
              Transcript
            </button>
          </div>

          <div className="p-6">
            {/* Notes Tab */}
            {activeTab === 'notes' && (
              <div>
                {note.content ? (
                  <div className="whitespace-pre-wrap text-slate-300 leading-relaxed">{note.content}</div>
                ) : (
                  <p className="text-slate-500 italic text-center py-8">No detailed notes available</p>
                )}
              </div>
            )}

            {/* Flashcards Tab */}
            {activeTab === 'flashcards' && (
              <div>
                {note.flashcards && note.flashcards.length > 0 ? (
                  <div className="grid md:grid-cols-2 gap-4">
                    {note.flashcards.map((card: any, i: number) => (
                      <div
                        key={i}
                        onClick={() => toggleCard(i)}
                        className={`glass-card p-5 cursor-pointer min-h-[140px] flex flex-col justify-center transition-all hover:border-violet-500/30 ${
                          flippedCards.has(i) ? 'bg-emerald-500/5 border-emerald-500/30' : ''
                        }`}
                      >
                        {!flippedCards.has(i) ? (
                          <div>
                            <div className="text-xs text-violet-400 font-semibold mb-2">QUESTION</div>
                            <div className="font-semibold text-white">{card.front}</div>
                            <div className="text-xs text-slate-500 mt-4">Click to reveal answer</div>
                          </div>
                        ) : (
                          <div>
                            <div className="text-xs text-emerald-400 font-semibold mb-2">ANSWER</div>
                            <div className="text-slate-300">{card.back}</div>
                            <div className="text-xs text-slate-500 mt-4">Click to see question</div>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-slate-500 italic text-center py-8">No flashcards available</p>
                )}
              </div>
            )}

            {/* Transcript Tab */}
            {activeTab === 'transcript' && (
              <div>
                {note.transcription_text ? (
                  <div className="relative">
                    <button
                      onClick={() => copyToClipboard(note.transcription_text, -1)}
                      className="absolute top-2 right-2 p-2 text-slate-400 hover:text-white transition-colors bg-slate-800/50 rounded-lg"
                    >
                      {copiedId === -1 ? <Check className="w-5 h-5 text-emerald-400" /> : <Copy className="w-5 h-5" />}
                    </button>
                    <div className="whitespace-pre-wrap text-slate-300 leading-relaxed bg-slate-800/30 p-4 rounded-xl border border-slate-700/50 max-h-[500px] overflow-y-auto">
                      {note.transcription_text}
                    </div>
                  </div>
                ) : (
                  <p className="text-slate-500 italic text-center py-8">No transcript available</p>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </DashboardLayout>
  )
}
