'use client'
import { useEffect, useState } from 'react'
import { createBrowserClient } from '@supabase/ssr'
import { ArrowLeft, Loader, Clock, FileText, BookOpen, Lightbulb, Copy, Check } from 'lucide-react'
import Link from 'next/link'
import { useRouter, useParams } from 'next/navigation'

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
  }, [params.id])

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
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <Loader className="w-8 h-8 text-blue-600 animate-spin" />
      </div>
    )
  }

  if (recording?.status === 'processing') {
    return (
      <div className="min-h-screen bg-gray-50 pt-24 pb-12 px-6">
        <div className="max-w-4xl mx-auto text-center">
          <Loader className="w-16 h-16 text-purple-600 animate-spin mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Processing your recording</h2>
          <p className="text-gray-600 mb-6">This usually takes 1-2 minutes.</p>
          <Link href="/notes" className="text-blue-600 hover:text-blue-700 font-medium">
            ← Back to all notes
          </Link>
        </div>
      </div>
    )
  }

  if (recording?.status === 'failed') {
    return (
      <div className="min-h-screen bg-gray-50 pt-24 pb-12 px-6">
        <div className="max-w-4xl mx-auto text-center">
          <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <FileText className="w-8 h-8 text-red-600" />
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Processing failed</h2>
          <p className="text-gray-600 mb-6">Something went wrong. Please try again.</p>
          <Link href="/record" className="text-blue-600 hover:text-blue-700 font-medium">
            Try recording again →
          </Link>
        </div>
      </div>
    )
  }

  if (!note) {
    return (
      <div className="min-h-screen bg-gray-50 pt-24 pb-12 px-6">
        <div className="max-w-4xl mx-auto text-center">
          <FileText className="w-16 h-16 text-gray-300 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Notes not ready yet</h2>
          <p className="text-gray-600 mb-6">Check back in a few minutes.</p>
          <Link href="/notes" className="text-blue-600 hover:text-blue-700 font-medium">
            ← Back to all notes
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 pt-24 pb-12 px-6">
      <div className="max-w-4xl mx-auto">
        <div className="mb-8">
          <Link 
            href="/notes"
            className="inline-flex items-center gap-2 text-blue-600 hover:text-blue-700 font-medium mb-4"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to all notes
          </Link>
          
          <h1 className="text-4xl font-bold text-gray-900 mb-2">
            {note.title || recording.title || 'Untitled Notes'}
          </h1>
          <div className="flex items-center gap-4 text-sm text-gray-600">
            <span className="flex items-center gap-1">
              <Clock className="w-4 h-4" />
              {new Date(recording.created_at).toLocaleDateString()}
            </span>
          </div>
        </div>

        {note.summary && (
          <div className="bg-gradient-to-r from-blue-50 to-purple-50 border border-blue-200 rounded-xl p-6 mb-6">
            <div className="flex items-center gap-2 mb-3">
              <Lightbulb className="w-5 h-5 text-blue-600" />
              <h2 className="text-lg font-bold text-gray-900">Summary</h2>
            </div>
            <p className="text-gray-700 leading-relaxed whitespace-pre-wrap">{note.summary}</p>
          </div>
        )}

        {note.key_concepts && note.key_concepts.length > 0 && (
          <div className="bg-white border border-gray-200 rounded-xl p-6 mb-6">
            <h2 className="text-lg font-bold text-gray-900 mb-4">Key Concepts</h2>
            <div className="flex flex-wrap gap-2">
              {note.key_concepts.map((concept: string, i: number) => (
                <span key={i} className="px-3 py-1.5 bg-purple-100 text-purple-700 rounded-full text-sm font-medium">
                  {concept}
                </span>
              ))}
            </div>
          </div>
        )}

        {note.exam_tips && note.exam_tips.length > 0 && (
          <div className="bg-gradient-to-r from-green-50 to-emerald-50 border border-green-200 rounded-xl p-6 mb-6">
            <h2 className="text-lg font-bold text-gray-900 mb-4">Exam Tips</h2>
            <ul className="space-y-2">
              {note.exam_tips.map((tip: string, i: number) => (
                <li key={i} className="flex items-start gap-2">
                  <span className="text-green-600 mt-0.5">•</span>
                  <span className="text-gray-700">{tip}</span>
                </li>
              ))}
            </ul>
          </div>
        )}

        <div className="bg-white border border-gray-200 rounded-xl overflow-hidden mb-6">
          <div className="flex border-b border-gray-200">
            <button
              onClick={() => setActiveTab('notes')}
              className={`flex-1 px-6 py-4 text-sm font-semibold transition-colors ${
                activeTab === 'notes' ? 'text-blue-600 bg-blue-50 border-b-2 border-blue-600' : 'text-gray-600 hover:bg-gray-50'
              }`}
            >
              <BookOpen className="w-4 h-4 inline mr-2" />
              Notes
            </button>
            <button
              onClick={() => setActiveTab('flashcards')}
              className={`flex-1 px-6 py-4 text-sm font-semibold transition-colors ${
                activeTab === 'flashcards' ? 'text-blue-600 bg-blue-50 border-b-2 border-blue-600' : 'text-gray-600 hover:bg-gray-50'
              }`}
            >
              <FileText className="w-4 h-4 inline mr-2" />
              Flashcards ({note.flashcards?.length || 0})
            </button>
            <button
              onClick={() => setActiveTab('transcript')}
              className={`flex-1 px-6 py-4 text-sm font-semibold transition-colors ${
                activeTab === 'transcript' ? 'text-blue-600 bg-blue-50 border-b-2 border-blue-600' : 'text-gray-600 hover:bg-gray-50'
              }`}
            >
              <FileText className="w-4 h-4 inline mr-2" />
              Transcript
            </button>
          </div>

          <div className="p-6">
            {activeTab === 'notes' && (
              <div className="prose prose-gray max-w-none">
                {note.content ? (
                  <div className="whitespace-pre-wrap text-gray-700 leading-relaxed">{note.content}</div>
                ) : (
                  <p className="text-gray-500 italic">No detailed notes available</p>
                )}
              </div>
            )}

            {activeTab === 'flashcards' && (
              <div>
                {note.flashcards && note.flashcards.length > 0 ? (
                  <div className="grid md:grid-cols-2 gap-4">
                    {note.flashcards.map((card: any, i: number) => (
                      <div 
                        key={i} 
                        onClick={() => toggleCard(i)}
                        className="border border-gray-200 rounded-lg p-5 hover:shadow-md transition-all cursor-pointer min-h-[120px] flex flex-col justify-center"
                      >
                        {!flippedCards.has(i) ? (
                          <div>
                            <div className="text-xs text-gray-500 mb-2">QUESTION</div>
                            <div className="font-semibold text-gray-900">{card.front}</div>
                            <div className="text-xs text-gray-400 mt-3">Click to reveal answer</div>
                          </div>
                        ) : (
                          <div>
                            <div className="text-xs text-green-600 mb-2">ANSWER</div>
                            <div className="text-gray-700">{card.back}</div>
                            <div className="text-xs text-gray-400 mt-3">Click to see question</div>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-gray-500 italic text-center py-8">No flashcards available</p>
                )}
              </div>
            )}

            {activeTab === 'transcript' && (
              <div>
                {note.transcription_text ? (
                  <div className="relative">
                    <button
                      onClick={() => copyToClipboard(note.transcription_text, -1)}
                      className="absolute top-0 right-0 p-2 text-gray-500 hover:text-gray-700"
                    >
                      {copiedId === -1 ? <Check className="w-5 h-5 text-green-600" /> : <Copy className="w-5 h-5" />}
                    </button>
                    <div className="whitespace-pre-wrap text-gray-700 leading-relaxed bg-gray-50 p-4 rounded-lg">
                      {note.transcription_text}
                    </div>
                  </div>
                ) : (
                  <p className="text-gray-500 italic text-center py-8">No transcript available</p>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
