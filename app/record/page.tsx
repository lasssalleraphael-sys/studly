'use client'

export const dynamic = 'force-dynamic'

import { useState, useRef, useEffect, useCallback, useMemo } from 'react'
import { createBrowserClient } from '@supabase/ssr'
import { Mic, Square, Upload, CheckCircle, AlertCircle, ArrowLeft, Loader, AudioLines, BookOpen } from 'lucide-react'
import Link from 'next/link'
import DashboardLayout from '@/components/DashboardLayout'

const PLAN_LIMITS: Record<string, number> = {
  starter: 5,
  pro: 15,
  elite: 30,
  basic: 5,
}

const SUBJECTS = [
  { value: '', label: 'Select subject (optional)' },
  { value: 'biology', label: 'Biology' },
  { value: 'chemistry', label: 'Chemistry' },
  { value: 'physics', label: 'Physics' },
  { value: 'maths', label: 'Mathematics' },
  { value: 'history', label: 'History' },
  { value: 'english', label: 'English' },
  { value: 'economics', label: 'Economics' },
  { value: 'psychology', label: 'Psychology' },
  { value: 'geography', label: 'Geography' },
  { value: 'computer_science', label: 'Computer Science' },
  { value: 'other', label: 'Other' },
]

const EXAM_BOARDS = [
  { value: '', label: 'Select exam board (optional)' },
  { value: 'IB', label: 'IB (International Baccalaureate)' },
  { value: 'A-Level', label: 'A-Level' },
  { value: 'GCSE', label: 'GCSE' },
  { value: 'AP', label: 'AP (Advanced Placement)' },
  { value: 'other', label: 'Other' },
]

export default function RecordPage() {
  const [isRecording, setIsRecording] = useState(false)
  const [isProcessing, setIsProcessing] = useState(false)
  const [processingStep, setProcessingStep] = useState('')
  const [recordingTime, setRecordingTime] = useState(0)
  const [error, setError] = useState('')
  const [title, setTitle] = useState('')
  const [subject, setSubject] = useState('')
  const [examBoard, setExamBoard] = useState('')
  const [currentRecordingId, setCurrentRecordingId] = useState<string | null>(null)

  const [hoursUsed, setHoursUsed] = useState(0)
  const [hoursLimit, setHoursLimit] = useState(5)
  const [planName, setPlanName] = useState('starter')
  const [checkingUsage, setCheckingUsage] = useState(true)

  const mediaRecorder = useRef<MediaRecorder | null>(null)
  const audioChunks = useRef<Blob[]>([])
  const timerInterval = useRef<NodeJS.Timeout | null>(null)
  const pollingInterval = useRef<NodeJS.Timeout | null>(null)

  const supabase = useMemo(() => {
    if (typeof window === 'undefined') return null
    return createBrowserClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    )
  }, [])

  const pollProcessingStatus = useCallback(async (recordingId: string) => {
    try {
      const response = await fetch(`/api/processing-status?recordingId=${recordingId}`)
      if (!response.ok) {
        throw new Error('Failed to check processing status')
      }

      const data = await response.json()

      if (data.status === 'completed') {
        if (pollingInterval.current) {
          clearInterval(pollingInterval.current)
        }
        window.location.href = `/notes/${recordingId}`
        return
      }

      if (data.status === 'failed') {
        if (pollingInterval.current) {
          clearInterval(pollingInterval.current)
        }
        setError(data.error || 'Processing failed. Please try again.')
        setIsProcessing(false)
        return
      }

      // Update step message with premium copy
      if (data.step === 'transcription') {
        setProcessingStep('Transcribing your lecture...')
      } else if (data.step === 'note_generation') {
        setProcessingStep('AI is generating your study notes...')
      } else {
        setProcessingStep('Processing your recording...')
      }
    } catch (err) {
      console.error('Polling error:', err)
    }
  }, [])

  useEffect(() => {
    if (!supabase) return
    const checkUsage = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession()
        if (!session) {
          window.location.href = '/auth'
          return
        }

        const { data: sub } = await supabase
          .from('subscriptions')
          .select('plan_name, hours_used, monthly_hours_limit')
          .eq('user_id', session.user.id)
          .single()

        const userPlanName = sub?.plan_name || 'starter'
        const userHoursLimit = sub?.monthly_hours_limit || PLAN_LIMITS[userPlanName.toLowerCase()] || 5
        const userHoursUsed = sub?.hours_used || 0

        setPlanName(userPlanName)
        setHoursLimit(userHoursLimit)
        setHoursUsed(userHoursUsed)
      } catch (err) {
        console.error('Error checking usage:', err)
      } finally {
        setCheckingUsage(false)
      }
    }

    checkUsage()

    return () => {
      if (timerInterval.current) {
        clearInterval(timerInterval.current)
      }
      if (pollingInterval.current) {
        clearInterval(pollingInterval.current)
      }
    }
  }, [supabase])

  const isAtLimit = hoursUsed >= hoursLimit
  const remainingHours = Math.max(0, hoursLimit - hoursUsed)

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`
  }

  const formatHours = (hours: number) => {
    if (hours < 1) {
      return `${Math.round(hours * 60)} minutes`
    }
    return `${hours.toFixed(1)} hours`
  }

  const startRecording = async () => {
    if (isAtLimit) {
      setError('You have reached your monthly hours limit. Please upgrade your plan or wait until next month.')
      return
    }

    try {
      setError('')
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true })
      mediaRecorder.current = new MediaRecorder(stream)
      audioChunks.current = []

      mediaRecorder.current.ondataavailable = (event) => {
        audioChunks.current.push(event.data)
      }

      mediaRecorder.current.onstop = async () => {
        const audioBlob = new Blob(audioChunks.current, { type: 'audio/webm' })
        await uploadAndProcess(audioBlob)
      }

      mediaRecorder.current.start()
      setIsRecording(true)
      setRecordingTime(0)

      timerInterval.current = setInterval(() => {
        setRecordingTime(prev => prev + 1)
      }, 1000)
    } catch (err) {
      console.error('Error accessing microphone:', err)
      setError('Please allow microphone access to record')
    }
  }

  const stopRecording = () => {
    if (mediaRecorder.current && isRecording) {
      mediaRecorder.current.stop()
      mediaRecorder.current.stream.getTracks().forEach(track => track.stop())
      setIsRecording(false)

      if (timerInterval.current) {
        clearInterval(timerInterval.current)
      }

      setIsProcessing(true)
      setProcessingStep('Uploading your recording...')
    }
  }

  const uploadAndProcess = async (audioBlob: Blob) => {
    if (!supabase) {
      setError('Application not ready. Please refresh.')
      setIsProcessing(false)
      return
    }
    try {
      const { data: { session } } = await supabase.auth.getSession()
      if (!session) {
        setError('Please sign in to continue')
        setIsProcessing(false)
        return
      }

      // Check if adding this recording would exceed the limit
      const recordingHours = recordingTime / 3600
      if ((hoursUsed + recordingHours) > hoursLimit) {
        setError('This recording would exceed your monthly limit. Please upgrade your plan.')
        setIsProcessing(false)
        return
      }

      const fileName = `${session.user.id}/${Date.now()}.webm`
      const { data: uploadData, error: uploadError } = await supabase.storage
        .from('recordings')
        .upload(fileName, audioBlob)

      if (uploadError) throw uploadError

      const { data: recording, error: recordingError } = await supabase
        .from('recordings')
        .insert({
          user_id: session.user.id,
          title: title || `Recording ${new Date().toLocaleDateString()}`,
          audio_url: uploadData.path,
          status: 'pending',
          file_size: audioBlob.size,
          duration: recordingTime,
          subject: subject || null,
          exam_board: examBoard || null,
        })
        .select()
        .single()

      if (recordingError) throw recordingError

      setCurrentRecordingId(recording.id)
      setProcessingStep('Starting transcription...')

      const response = await fetch('/api/process-recording', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ recordingId: recording.id }),
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Processing failed to start')
      }

      // Start polling for status
      pollingInterval.current = setInterval(() => {
        pollProcessingStatus(recording.id)
      }, 3000)

      // Also do an immediate poll
      pollProcessingStatus(recording.id)

    } catch (err: unknown) {
      console.error('Upload error:', err)
      setError(err instanceof Error ? err.message : 'Failed to upload recording')
      setIsProcessing(false)
    }
  }

  if (checkingUsage) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center min-h-[60vh]">
          <div className="text-center">
            <div className="w-8 h-8 border-2 border-violet-500 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
            <p className="text-slate-400">Checking usage...</p>
          </div>
        </div>
      </DashboardLayout>
    )
  }

  if (isAtLimit && !isRecording && !isProcessing) {
    return (
      <DashboardLayout>
        <div className="max-w-2xl mx-auto">
          <div className="glass-card p-12 text-center border-red-500/20 bg-red-500/5">
            <div className="w-20 h-20 bg-red-500/20 rounded-full flex items-center justify-center mx-auto mb-6">
              <AlertCircle className="w-10 h-10 text-red-400" />
            </div>
            <h1 className="text-3xl font-bold text-white mb-3">Monthly limit reached</h1>
            <p className="text-slate-400 mb-2">
              You've used all <strong className="text-white">{formatHours(hoursLimit)}</strong> included in your{' '}
              <span className="capitalize text-violet-400">{planName}</span> plan this month.
            </p>
            <p className="text-slate-500 text-sm mb-8">
              Your limit resets on the 1st of next month.
            </p>

            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link
                href="/pricing"
                className="btn-primary"
              >
                Upgrade plan
              </Link>
              <Link
                href="/dashboard"
                className="px-8 py-3 bg-slate-700 text-white font-semibold rounded-xl hover:bg-slate-600 transition-colors flex items-center justify-center gap-2"
              >
                <ArrowLeft className="w-4 h-4" />
                Back to dashboard
              </Link>
            </div>
          </div>
        </div>
      </DashboardLayout>
    )
  }

  return (
    <DashboardLayout>
      <div className="max-w-2xl mx-auto fade-in">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-white mb-3">
            Record your <span className="text-gradient">lecture</span>
          </h1>
          <p className="text-slate-400">
            Click the button below to start recording. We'll handle the rest.
          </p>
          <p className="text-sm text-violet-400 mt-2 font-medium">
            {formatHours(remainingHours)} remaining this month
          </p>
        </div>

        {/* Error Message */}
        {error && (
          <div className="mb-6 p-4 glass-card border-red-500/30 bg-red-500/10 flex items-start gap-3">
            <AlertCircle className="w-5 h-5 text-red-400 flex-shrink-0 mt-0.5" />
            <p className="text-sm text-red-300">{error}</p>
          </div>
        )}

        {/* Form Fields */}
        {!isRecording && !isProcessing && (
          <div className="space-y-4 mb-6">
            <div>
              <label htmlFor="title" className="block text-sm font-semibold text-slate-300 mb-2">
                Recording title (optional)
              </label>
              <input
                id="title"
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="e.g., Biology Lecture - Chapter 3"
                className="w-full px-4 py-3 bg-slate-800/50 border border-slate-700/50 rounded-xl text-white placeholder-slate-500 focus:ring-2 focus:ring-violet-500 focus:border-transparent outline-none transition-all"
              />
            </div>

            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <label htmlFor="subject" className="block text-sm font-semibold text-slate-300 mb-2">
                  Subject
                </label>
                <select
                  id="subject"
                  value={subject}
                  onChange={(e) => setSubject(e.target.value)}
                  className="w-full px-4 py-3 bg-slate-800/50 border border-slate-700/50 rounded-xl text-white focus:ring-2 focus:ring-violet-500 focus:border-transparent outline-none transition-all appearance-none cursor-pointer"
                >
                  {SUBJECTS.map((s) => (
                    <option key={s.value} value={s.value} className="bg-slate-800">{s.label}</option>
                  ))}
                </select>
              </div>

              <div>
                <label htmlFor="examBoard" className="block text-sm font-semibold text-slate-300 mb-2">
                  Exam Board
                </label>
                <select
                  id="examBoard"
                  value={examBoard}
                  onChange={(e) => setExamBoard(e.target.value)}
                  className="w-full px-4 py-3 bg-slate-800/50 border border-slate-700/50 rounded-xl text-white focus:ring-2 focus:ring-violet-500 focus:border-transparent outline-none transition-all appearance-none cursor-pointer"
                >
                  {EXAM_BOARDS.map((e) => (
                    <option key={e.value} value={e.value} className="bg-slate-800">{e.label}</option>
                  ))}
                </select>
              </div>
            </div>
          </div>
        )}

        {/* Recording Card */}
        <div className="glass-card p-12 text-center">
          {/* Ready State */}
          {!isRecording && !isProcessing && (
            <div>
              <button
                onClick={startRecording}
                className="w-32 h-32 bg-gradient-to-br from-red-500 to-rose-600 rounded-full hover:from-red-600 hover:to-rose-700 transition-all shadow-lg shadow-red-500/30 hover:shadow-xl hover:shadow-red-500/40 mx-auto mb-6 flex items-center justify-center group"
              >
                <Mic className="w-14 h-14 text-white group-hover:scale-110 transition-transform" strokeWidth={2} />
              </button>
              <p className="text-lg font-semibold text-white mb-2">Ready to record</p>
              <p className="text-sm text-slate-400">Click the button to start</p>
            </div>
          )}

          {/* Recording State */}
          {isRecording && (
            <div>
              <div className="relative w-32 h-32 mx-auto mb-6">
                {/* Pulse rings */}
                <div className="absolute inset-0 bg-red-500/20 rounded-full animate-ping" />
                <div className="absolute inset-2 bg-red-500/30 rounded-full animate-pulse" />
                {/* Main button */}
                <div className="absolute inset-0 bg-gradient-to-br from-red-500 to-rose-600 rounded-full flex items-center justify-center">
                  <Mic className="w-14 h-14 text-white" strokeWidth={2} />
                </div>
              </div>
              <p className="text-4xl font-bold text-white mb-2 font-mono">{formatTime(recordingTime)}</p>
              <p className="text-sm text-slate-400 mb-6 flex items-center justify-center gap-2">
                <span className="w-2 h-2 bg-red-500 rounded-full animate-pulse" />
                Recording in progress...
              </p>
              <button
                onClick={stopRecording}
                className="px-8 py-3 bg-slate-700 text-white font-semibold rounded-xl hover:bg-slate-600 transition-colors inline-flex items-center gap-2"
              >
                <Square className="w-5 h-5" />
                Stop recording
              </button>
            </div>
          )}

          {/* Processing State */}
          {isProcessing && (
            <div>
              <div className="w-32 h-32 bg-violet-500/20 rounded-full mx-auto mb-6 flex items-center justify-center relative">
                <div className="absolute inset-0 border-4 border-violet-500/30 rounded-full" />
                <div className="absolute inset-0 border-4 border-transparent border-t-violet-500 rounded-full animate-spin" />
                <Loader className="w-14 h-14 text-violet-400" strokeWidth={2} />
              </div>
              <p className="text-xl font-bold text-white mb-2">{processingStep || 'Processing...'}</p>
              <p className="text-sm text-slate-400">This usually takes 1-2 minutes</p>

              {/* Progress Steps */}
              <div className="mt-8 space-y-3 text-left max-w-xs mx-auto">
                <div className={`flex items-center gap-3 ${processingStep.includes('Upload') ? 'text-violet-400' : 'text-slate-500'}`}>
                  <div className={`w-6 h-6 rounded-full flex items-center justify-center ${processingStep.includes('Upload') ? 'bg-violet-500/20' : 'bg-slate-700'}`}>
                    {processingStep.includes('Transcrib') || processingStep.includes('AI') ? (
                      <CheckCircle className="w-4 h-4 text-emerald-400" />
                    ) : (
                      <Upload className="w-3 h-3" />
                    )}
                  </div>
                  <span className="text-sm">Uploading recording</span>
                </div>
                <div className={`flex items-center gap-3 ${processingStep.includes('Transcrib') ? 'text-violet-400' : 'text-slate-500'}`}>
                  <div className={`w-6 h-6 rounded-full flex items-center justify-center ${processingStep.includes('Transcrib') ? 'bg-violet-500/20' : 'bg-slate-700'}`}>
                    {processingStep.includes('AI') ? (
                      <CheckCircle className="w-4 h-4 text-emerald-400" />
                    ) : processingStep.includes('Transcrib') ? (
                      <Loader className="w-3 h-3 animate-spin" />
                    ) : (
                      <AudioLines className="w-3 h-3" />
                    )}
                  </div>
                  <span className="text-sm">Transcribing audio</span>
                </div>
                <div className={`flex items-center gap-3 ${processingStep.includes('AI') ? 'text-violet-400' : 'text-slate-500'}`}>
                  <div className={`w-6 h-6 rounded-full flex items-center justify-center ${processingStep.includes('AI') ? 'bg-violet-500/20' : 'bg-slate-700'}`}>
                    {processingStep.includes('AI') ? (
                      <Loader className="w-3 h-3 animate-spin" />
                    ) : (
                      <BookOpen className="w-3 h-3" />
                    )}
                  </div>
                  <span className="text-sm">Generating study notes</span>
                </div>
              </div>

              {currentRecordingId && (
                <p className="text-xs text-slate-500 mt-6">
                  You can close this page - we'll save your notes automatically
                </p>
              )}
            </div>
          )}
        </div>

        {/* Tips */}
        {!isRecording && !isProcessing && (
          <div className="mt-8 grid md:grid-cols-3 gap-4">
            <div className="glass-card p-4 text-center">
              <div className="w-10 h-10 bg-violet-500/20 rounded-lg flex items-center justify-center mx-auto mb-3">
                <Mic className="w-5 h-5 text-violet-400" />
              </div>
              <p className="text-sm font-semibold text-white mb-1">Clear audio</p>
              <p className="text-xs text-slate-400">Find a quiet space for best results</p>
            </div>

            <div className="glass-card p-4 text-center">
              <div className="w-10 h-10 bg-fuchsia-500/20 rounded-lg flex items-center justify-center mx-auto mb-3">
                <CheckCircle className="w-5 h-5 text-fuchsia-400" />
              </div>
              <p className="text-sm font-semibold text-white mb-1">Automatic processing</p>
              <p className="text-xs text-slate-400">We'll generate your notes in minutes</p>
            </div>

            <div className="glass-card p-4 text-center">
              <div className="w-10 h-10 bg-emerald-500/20 rounded-lg flex items-center justify-center mx-auto mb-3">
                <Upload className="w-5 h-5 text-emerald-400" />
              </div>
              <p className="text-sm font-semibold text-white mb-1">Instant access</p>
              <p className="text-xs text-slate-400">Find your notes in the dashboard</p>
            </div>
          </div>
        )}
      </div>
    </DashboardLayout>
  )
}
