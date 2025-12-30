'use client';

import React, { useState, useRef, useEffect } from 'react';
import { Mic, Square, Upload, Loader2, CheckCircle, AlertCircle } from 'lucide-react';

interface RecordingInterfaceProps {
  userId: string;
  userEmail: string;
  subscription: {
    status: string;
    plan_id: string;
  };
}

export default function RecordingInterface({ userId, userEmail, subscription }: RecordingInterfaceProps) {
  const [isRecording, setIsRecording] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [audioBlob, setAudioBlob] = useState<Blob | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [recordingTime, setRecordingTime] = useState(0);
  const [processingJobId, setProcessingJobId] = useState<string | null>(null);

  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
      if (mediaRecorderRef.current && mediaRecorderRef.current.state === 'recording') {
        mediaRecorderRef.current.stop();
      }
    };
  }, []);

  const startRecording = async () => {
    try {
      setError(null);
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      
      const mediaRecorder = new MediaRecorder(stream, {
        mimeType: 'audio/webm;codecs=opus'
      });
      
      mediaRecorderRef.current = mediaRecorder;
      audioChunksRef.current = [];

      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          audioChunksRef.current.push(event.data);
        }
      };

      mediaRecorder.onstop = () => {
        const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/webm' });
        setAudioBlob(audioBlob);
        stream.getTracks().forEach(track => track.stop());
      };

      mediaRecorder.start();
      setIsRecording(true);
      setRecordingTime(0);

      // Start timer
      timerRef.current = setInterval(() => {
        setRecordingTime(prev => prev + 1);
      }, 1000);

    } catch (err) {
      console.error('Error starting recording:', err);
      setError('Failed to access microphone. Please grant permission.');
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && mediaRecorderRef.current.state === 'recording') {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
      if (timerRef.current) clearInterval(timerRef.current);
    }
  };

  const uploadAndProcess = async () => {
    if (!audioBlob) return;

    setIsUploading(true);
    setError(null);

    try {
      // Step 1: Upload audio to storage
      const formData = new FormData();
      formData.append('audio', audioBlob, `recording-${Date.now()}.webm`);
      formData.append('userId', userId);
      formData.append('duration', recordingTime.toString());

      const uploadResponse = await fetch('/api/upload-audio', {
        method: 'POST',
        body: formData,
      });

      if (!uploadResponse.ok) {
        throw new Error('Failed to upload audio');
      }

      const { audioUrl, recordingId } = await uploadResponse.json();

      setIsUploading(false);
      setIsProcessing(true);

      // Step 2: Send to AI processing
      const processResponse = await fetch('/api/process-recording', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          recordingId,
          audioUrl,
          userId,
          planId: subscription.plan_id,
        }),
      });

      if (!processResponse.ok) {
        throw new Error('Failed to start AI processing');
      }

      const { jobId } = await processResponse.json();
      setProcessingJobId(jobId);

      // Step 3: Poll for completion
      await pollProcessingStatus(jobId);

    } catch (err) {
      console.error('Upload/Process error:', err);
      setError(err instanceof Error ? err.message : 'Failed to process recording');
      setIsUploading(false);
      setIsProcessing(false);
    }
  };

  const pollProcessingStatus = async (jobId: string) => {
    const maxAttempts = 60; // 5 minutes (5 second intervals)
    let attempts = 0;

    const poll = async () => {
      try {
        const response = await fetch(`/api/processing-status?jobId=${jobId}`);
        const { status, result, error: apiError } = await response.json();

        if (status === 'completed') {
          setIsProcessing(false);
          setSuccess(true);
          
          // Redirect to dashboard after 2 seconds
          setTimeout(() => {
            window.location.href = '/dashboard';
          }, 2000);
          
          return;
        }

        if (status === 'failed') {
          throw new Error(apiError || 'Processing failed');
        }

        // Continue polling if still processing
        if (status === 'processing' && attempts < maxAttempts) {
          attempts++;
          setTimeout(poll, 5000); // Poll every 5 seconds
        } else if (attempts >= maxAttempts) {
          throw new Error('Processing timeout');
        }
      } catch (err) {
        console.error('Polling error:', err);
        setError(err instanceof Error ? err.message : 'Failed to check processing status');
        setIsProcessing(false);
      }
    };

    poll();
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const resetRecording = () => {
    setAudioBlob(null);
    setRecordingTime(0);
    setError(null);
    setSuccess(false);
    setIsUploading(false);
    setIsProcessing(false);
  };

  return (
    <div className="bg-white rounded-3xl shadow-2xl p-8 md:p-12">
      {/* Recording Controls */}
      <div className="flex flex-col items-center">
        {/* Mascot Companion */}
        <div className="mb-8">
          <div className="w-24 h-24 bg-gradient-to-br from-blue-600 to-purple-600 rounded-full flex items-center justify-center shadow-lg">
            <span className="text-4xl">🎓</span>
          </div>
          <p className="text-center mt-4 text-gray-600 font-medium">
            {isRecording ? "I'm listening..." : "Ready when you are!"}
          </p>
        </div>

        {/* Timer */}
        {(isRecording || audioBlob) && (
          <div className="mb-8">
            <div className="text-6xl font-bold text-gray-900 tabular-nums">
              {formatTime(recordingTime)}
            </div>
          </div>
        )}

        {/* Recording Button */}
        {!audioBlob && !isUploading && !isProcessing && (
          <div className="mb-8">
            {!isRecording ? (
              <button
                onClick={startRecording}
                className="w-20 h-20 bg-gradient-to-r from-red-500 to-red-600 text-white rounded-full flex items-center justify-center hover:shadow-2xl hover:scale-110 active:scale-95 transition-all duration-200"
              >
                <Mic className="w-8 h-8" />
              </button>
            ) : (
              <button
                onClick={stopRecording}
                className="w-20 h-20 bg-gray-900 text-white rounded-lg flex items-center justify-center hover:shadow-2xl hover:scale-110 active:scale-95 transition-all duration-200"
              >
                <Square className="w-8 h-8" />
              </button>
            )}
          </div>
        )}

        {/* Upload Controls */}
        {audioBlob && !isUploading && !isProcessing && !success && (
          <div className="flex gap-4 mb-8">
            <button
              onClick={uploadAndProcess}
              className="px-8 py-4 bg-gradient-to-r from-blue-600 to-purple-600 text-white font-bold rounded-xl hover:shadow-xl hover:scale-105 active:scale-95 transition-all duration-200 flex items-center gap-2"
            >
              <Upload className="w-5 h-5" />
              Process Recording
            </button>
            <button
              onClick={resetRecording}
              className="px-8 py-4 bg-gray-200 text-gray-900 font-semibold rounded-xl hover:bg-gray-300 hover:scale-105 active:scale-95 transition-all duration-200"
            >
              Re-record
            </button>
          </div>
        )}

        {/* Status Messages */}
        {isUploading && (
          <div className="flex flex-col items-center gap-4">
            <Loader2 className="w-12 h-12 text-blue-600 animate-spin" />
            <p className="text-lg font-semibold text-gray-900">Uploading your recording...</p>
          </div>
        )}

        {isProcessing && (
          <div className="flex flex-col items-center gap-4">
            <Loader2 className="w-12 h-12 text-purple-600 animate-spin" />
            <p className="text-lg font-semibold text-gray-900">Studly is processing your lecture...</p>
            <p className="text-sm text-gray-600">This may take 1-2 minutes</p>
          </div>
        )}

        {success && (
          <div className="flex flex-col items-center gap-4">
            <CheckCircle className="w-12 h-12 text-green-600" />
            <p className="text-lg font-semibold text-gray-900">Processing complete!</p>
            <p className="text-sm text-gray-600">Redirecting to your dashboard...</p>
          </div>
        )}

        {error && (
          <div className="flex flex-col items-center gap-4 p-6 bg-red-50 rounded-xl">
            <AlertCircle className="w-12 h-12 text-red-600" />
            <p className="text-lg font-semibold text-red-900">{error}</p>
            <button
              onClick={resetRecording}
              className="px-6 py-2 bg-red-600 text-white font-semibold rounded-lg hover:bg-red-700 transition-all duration-200"
            >
              Try Again
            </button>
          </div>
        )}

        {/* Instructions */}
        {!audioBlob && !isRecording && (
          <div className="mt-8 text-center max-w-md">
            <p className="text-gray-600 leading-relaxed">
              Click the microphone to start recording your lecture. 
              Studly will transcribe, analyze, and create comprehensive study notes automatically.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
