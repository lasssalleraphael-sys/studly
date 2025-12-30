'use client';

import React, { useState, useRef } from 'react';
import { createSupabaseBrowserClient } from '../lib/supabaseClient';
import { User } from '@supabase/supabase-js';

interface AudioRecorderProps {
  user: User;
}

const AudioRecorder: React.FC<AudioRecorderProps> = ({ user }) => {
  const [isRecording, setIsRecording] = useState<boolean>(false);
  const [audioBlob, setAudioBlob] = useState<Blob | null>(null);
  const [transcriptId, setTranscriptId] = useState<string | null>(null);
  const [transcriptionText, setTranscriptionText] = useState<string | null>(null);
  const [isLoadingTranscription, setIsLoadingTranscription] = useState<boolean>(false);
  const [summary, setSummary] = useState<string | null>(null);
  const [mainPoints, setMainPoints] = useState<string[]>([]);
  const [actionItems, setActionItems] = useState<string[]>([]);
  const [isLoadingNotes, setIsLoadingNotes] = useState<boolean>(false);
  const [isSavingNotes, setIsSavingNotes] = useState<boolean>(false);

  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      mediaRecorderRef.current = new MediaRecorder(stream);

      mediaRecorderRef.current.ondataavailable = (event) => {
        audioChunksRef.current.push(event.data);
      };

      mediaRecorderRef.current.onstop = () => {
        const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/webm' });
        setAudioBlob(audioBlob);
        audioChunksRef.current = [];
      };

      mediaRecorderRef.current.start();
      setIsRecording(true);
    } catch (err) {
      console.error('Error accessing microphone:', err);
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
    }
  };

  const uploadAudio = async () => {
    if (!audioBlob) return;

    const formData = new FormData();
    formData.append('audio', audioBlob, 'recording.webm');

    try {
      const response = await fetch('/api/upload-audio', {
        method: 'POST',
        body: formData,
      });

      const data = await response.json();
      console.log('Upload successful:', data);

      if (data.transcriptId) {
        setTranscriptId(data.transcriptId);
        setIsLoadingTranscription(true);
        pollForTranscription(data.transcriptId);
      }
    } catch (err) {
      console.error('Error uploading audio:', err);
    }
  };

  const pollForTranscription = async (id: string) => {
    let attempts = 0;
    const maxAttempts = 20;
    const interval = 5000;

    while (attempts < maxAttempts) {
      attempts++;

      try {
        const response = await fetch(`/api/get-transcription?transcriptId=${id}`);
        const data = await response.json();

        if (data.status === 'completed') {
          setTranscriptionText(data.text);
          setIsLoadingTranscription(false);
          setIsLoadingNotes(true);

          try {
            const notesResponse = await fetch('/api/generate-notes', {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
              },
              body: JSON.stringify({ transcriptionText: data.text }),
            });

            const notesData = await notesResponse.json();

            if (notesData) {
              setSummary(notesData.summary);
              setMainPoints(notesData.mainPoints || []);
              setActionItems(notesData.actionItems || []);

              await saveNotesToSupabase({
                user_id: user.id,
                transcription_text: data.text,
                summary: notesData.summary,
                main_points: notesData.mainPoints || [],
                action_items: notesData.actionItems || [],
              });
            }
          } catch (notesErr) {
            console.error('Error generating notes:', notesErr);
          } finally {
            setIsLoadingNotes(false);
          }

          break;
        } else if (data.status === 'error') {
          console.error('Transcription error:', data.error);
          setTranscriptionText('Transcription failed.');
          setIsLoadingTranscription(false);
          break;
        }
      } catch (err) {
        console.error('Error polling for transcription:', err);
        setTranscriptionText('Failed to retrieve transcription.');
        setIsLoadingTranscription(false);
        break;
      }

      await new Promise(resolve => setTimeout(resolve, interval));
    }

    if (attempts === maxAttempts) {
      console.warn('Max polling attempts reached.');
      setTranscriptionText('Transcription timed out.');
      setIsLoadingTranscription(false);
    }
  };

  const saveNotesToSupabase = async (notes: {
    user_id: string;
    transcription_text: string;
    summary: string;
    main_points: string[];
    action_items: string[];
  }) => {
    setIsSavingNotes(true);
    const supabase = createSupabaseBrowserClient();

    try {
      const { data, error } = await supabase.from('notes').insert([notes]);

      if (error) {
        console.error('Error saving notes to Supabase:', error);
      } else {
        console.log('Notes saved to Supabase:', data);
      }
    } catch (err) {
      console.error('Error saving notes:', err);
    } finally {
      setIsSavingNotes(false);
    }
  };

  return (
    <div className="flex flex-col items-center justify-center p-4">
      <h2 className="text-2xl font-bold mb-4">Audio Recorder</h2>
      <div className="space-x-4">
        <button
          onClick={isRecording ? stopRecording : startRecording}
          className={`px-4 py-2 rounded-md text-white ${isRecording ? 'bg-red-500' : 'bg-blue-500'}`}
        >
          {isRecording ? 'Stop Recording' : 'Start Recording'}
        </button>
        <button
          onClick={uploadAudio}
          disabled={!audioBlob || isLoadingTranscription || isSavingNotes}
          className="px-4 py-2 rounded-md text-white bg-green-500 disabled:opacity-50"
        >
          {isLoadingTranscription ? 'Transcribing...' : isSavingNotes ? 'Saving Notes...' : 'Upload Audio'}
        </button>
      </div>

      {audioBlob && (
        <audio src={URL.createObjectURL(audioBlob)} controls className="mt-4" />
      )}

      {isLoadingTranscription && <p className="mt-4">Transcription in progress...</p>}

      {transcriptionText && (
        <div className="mt-4 p-4 border rounded-md w-full max-w-md">
          <h3 className="text-xl font-semibold mb-2">Transcription:</h3>
          <p>{transcriptionText}</p>
        </div>
      )}

      {isLoadingNotes && <p className="mt-4">Generating notes...</p>}

      {(summary || mainPoints.length > 0 || actionItems.length > 0) && !isLoadingNotes && (
        <div className="mt-4 p-4 border rounded-md w-full max-w-md text-left">
          <h3 className="text-xl font-semibold mb-2">Generated Notes:</h3>

          {summary && (
            <div className="mb-4">
              <h4 className="text-lg font-medium">Summary:</h4>
              <p>{summary}</p>
            </div>
          )}

          {mainPoints.length > 0 && (
            <div className="mb-4">
              <h4 className="text-lg font-medium">Main Points:</h4>
              <ul className="list-disc list-inside">
                {mainPoints.map((point, index) => (
                  <li key={index}>{point}</li>
                ))}
              </ul>
            </div>
          )}

          {actionItems.length > 0 && (
            <div>
              <h4 className="text-lg font-medium">Action Items:</h4>
              <ul className="list-disc list-inside">
                {actionItems.map((item, index) => (
                  <li key={index}>{item}</li>
                ))}
              </ul>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default AudioRecorder;
