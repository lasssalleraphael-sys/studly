'use client'
import { useState, useRef, useEffect } from 'react'
import { createBrowserClient } from '@supabase/ssr'
import { Mic, Square, Upload, CheckCircle, AlertCircle, ArrowLeft } from 'lucide-react'
import Link from 'next/link'

const PLAN_LIMITS: Record<string, number> = {
  starter: 7,
  pro: 18,
  elite: 37,
  basic: 7,
}

export default function RecordPage() {
  const [isRecording, setIsRecording] = useState(false)
  const [isProcessing, setIsProcessing] = useState(false)
  const [recordingTime, setRecordingTime] = useState(0)
  const [error, setError] = useState('')
  const [title, setTitle] = useState('')
  
  const [monthlyUsage, setMonthlyUsage] = useState(0)
  const [planLimit, setPlanLimit] = useState(7)
  const [planName, setPlanName] = useState('starter')
  const [checkingUsage, setCheckingUsage] = useState(true)
  
  const mediaRecorder = useRef<MediaRecorder | null>(null)
  const audioChunks = useRef<Blob[]>([])
  const timerInterval = useRef<NodeJS.Timeout | null>(null)

  const supabase = createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  )

  useEffect(() => {
    const checkUsage = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession()
        if (!session) {
          window.location.href = '/auth'
          return
        }

        const { data: sub } = await supabase
          .from('subscriptions')
          .select('plan_name')
          .eq('user_id', session.user.id)
          .single()

        const userPlanName = sub?.plan_name || 'starter'
        const userPlanLimit = PLAN_LIMITS[userPlanName.toLowerCase()] || 7
        setPlanName(userPlanName)
        setPlanLimit(userPlanLimit)

        const startOfMonth = new Date()
        startOfMonth.setDate(1)
        startOfMonth.setHours(0, 0, 0, 0)
        
        const { count } = await supabase
          .from('recordings')
          .select('*', { count: 'exact', head: true })
          .eq('user_id', session.user.id)
          .gte('created_at', startOfMonth.toISOString())
        
        setMonthlyUsage(count || 0)
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
    }
  }, [])

  const isAtLimit = monthlyUsage >= planLimit
  const remaining = Math.max(0, planLimit - monthlyUsage)

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`
  }

  const startRecording = async () => {
    if (isAtLimit) {
      setError('You have reached your monthly recording limit. Please upgrade your plan or wait until next month.')
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
    }
  }

  const uploadAndProcess = async (audioBlob: Blob) => {
    try {
      const { data: { session } } = await supabase.auth.getSession()
      if (!session) {
        setError('Please sign in to continue')
        setIsProcessing(false)
        return
      }

      const startOfMonth = new Date()
      startOfMonth.setDate(1)
      startOfMonth.setHours(0, 0, 0, 0)
      
      const { count } = await supabase
        .from('recordings')
        .select('*', { count: 'exact', head: true })
        .eq('user_id', session.user.id)
        .gte('created_at', startOfMonth.toISOString())

      if ((count || 0) >= planLimit) {
        setError('Monthly limit reached. Please upgrade your plan.')
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
        })
        .select()
        .single()

      if (recordingError) throw recordingError

      const response = await fetch('/api/process-recording', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ recordingId: recording.id }),
      })

      if (!response.ok) throw new Error('Processing failed to start')

      window.location.href = '/dashboard?success=recording-uploaded'
    } catch (err: any) {
      console.error('Upload error:', err)
      setError(err.message || 'Failed to upload recording')
      setIsProcessing(false)
    }
  }

  if (checkingUsage) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-blue-50 to-white pt-24 pb-12 px-6 flex items-center justify-center">
        <div className="text-center">
          <div className="w-8 h-8 border-2 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Checking usage...</p>
        </div>
      </div>
    )
  }

  if (isAtLimit && !isRecording && !isProcessing) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-blue-50 to-white pt-24 pb-12 px-6">
        <div className="max-w-2xl mx-auto text-center">
          <div className="bg-white border border-red-200 rounded-2xl p-12 shadow-sm">
            <div className="w-20 h-20 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <AlertCircle className="w-10 h-10 text-red-600" />
            </div>
            <h1 className="text-3xl font-bold text-gray-900 mb-3">Monthly limit reached</h1>
            <p className="text-gray-600 mb-2">
              You've used all <strong>{planLimit} recordings</strong> included in your <span className="capitalize">{planName}</span> plan this month.
            </p>
            <p className="text-gray-500 text-sm mb-8">
              Your limit resets on the 1st of next month.
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link 
                href="/pricing"
                className="px-8 py-3 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700 transition-colors"
              >
                Upgrade plan
              </Link>
              <Link 
                href="/dashboard"
                className="px-8 py-3 bg-gray-100 text-gray-900 font-semibold rounded-lg hover:bg-gray-200 transition-colors flex items-center justify-center gap-2"
              >
                <ArrowLeft className="w-4 h-4" />
                Back to dashboard
              </Link>
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 to-white pt-24 pb-12 px-6">
      <div className="max-w-2xl mx-auto">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-3">Record your lecture</h1>
          <p className="text-gray-600">
            Click the button below to start recording. We'll handle the rest.
          </p>
          <p className="text-sm text-blue-600 mt-2 font-medium">
            {remaining} recording{remaining !== 1 ? 's' : ''} remaining this month
          </p>
        </div>

        {error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg flex items-start gap-3">
            <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
            <p className="text-sm text-red-800">{error}</p>
          </div>
        )}

        {!isRecording && !isProcessing && (
          <div className="mb-6">
            <label htmlFor="title" className="block text-sm font-semibold text-gray-900 mb-2">
              Recording title (optional)
            </label>
            <input
              id="title"
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g., Biology Lecture - Chapter 3"
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-600 focus:border-transparent outline-none transition-all"
            />
          </div>
        )}

        <div className="bg-white border border-gray-200 rounded-2xl p-12 text-center shadow-sm">
          {!isRecording && !isProcessing && (
            <div>
              <button
                onClick={startRecording}
                className="w-32 h-32 bg-red-500 rounded-full hover:bg-red-600 transition-all shadow-lg hover:shadow-xl mx-auto mb-6 flex items-center justify-center group"
              >
                <Mic className="w-14 h-14 text-white group-hover:scale-110 transition-transform" strokeWidth={2} />
              </button>
              <p className="text-lg font-semibold text-gray-900 mb-2">Ready to record</p>
              <p className="text-sm text-gray-600">Click the button to start</p>
            </div>
          )}

          {isRecording && (
            <div>
              <div className="w-32 h-32 bg-red-500 rounded-full animate-pulse mx-auto mb-6 flex items-center justify-center">
                <Mic className="w-14 h-14 text-white" strokeWidth={2} />
              </div>
              <p className="text-3xl font-bold text-gray-900 mb-2">{formatTime(recordingTime)}</p>
              <p className="text-sm text-gray-600 mb-6">Recording in progress...</p>
              <button
                onClick={stopRecording}
                className="px-8 py-3 bg-gray-900 text-white font-semibold rounded-lg hover:bg-gray-800 transition-colors inline-flex items-center gap-2"
              >
                <Square className="w-5 h-5" />
                Stop recording
              </button>
            </div>
          )}

          {isProcessing && (
            <div>
              <div className="w-32 h-32 bg-blue-100 rounded-full mx-auto mb-6 flex items-center justify-center">
                <Upload className="w-14 h-14 text-blue-600 animate-bounce" strokeWidth={2} />
              </div>
              <p className="text-xl font-bold text-gray-900 mb-2">Uploading recording...</p>
              <p className="text-sm text-gray-600">This may take a moment</p>
            </div>
          )}
        </div>

        {!isRecording && !isProcessing && (
          <div className="mt-8 grid md:grid-cols-3 gap-4">
            <div className="bg-white border border-gray-200 rounded-lg p-4 text-center">
              <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center mx-auto mb-3">
                <Mic className="w-5 h-5 text-blue-600" />
              </div>
              <p className="text-sm font-semibold text-gray-900 mb-1">Clear audio</p>
              <p className="text-xs text-gray-600">Find a quiet space for best results</p>
            </div>
            
            <div className="bg-white border border-gray-200 rounded-lg p-4 text-center">
              <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center mx-auto mb-3">
                <CheckCircle className="w-5 h-5 text-purple-600" />
              </div>
              <p className="text-sm font-semibold text-gray-900 mb-1">Automatic processing</p>
              <p className="text-xs text-gray-600">We'll generate your notes in minutes</p>
            </div>
            
            <div className="bg-white border border-gray-200 rounded-lg p-4 text-center">
              <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center mx-auto mb-3">
                <Upload className="w-5 h-5 text-green-600" />
              </div>
              <p className="text-sm font-semibold text-gray-900 mb-1">Instant access</p>
              <p className="text-xs text-gray-600">Find your notes in the dashboard</p>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
