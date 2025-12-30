'use client';

import React, { useEffect, useState } from 'react';
import { createSupabaseBrowserClient } from '../lib/supabaseClient';
import { User } from '@supabase/supabase-js';

interface NotesListProps {
  user: User;
}

interface Note {
  id: string;
  created_at: string;
  transcription_text: string;
  summary: string;
  main_points: string[];
  action_items: string[];
}

const NotesList: React.FC<NotesListProps> = ({ user }) => {
  const [notes, setNotes] = useState<Note[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchNotes();
  }, [user]);

  const fetchNotes = async () => {
    setIsLoading(true);
    setError(null);
    const supabase = createSupabaseBrowserClient();

    try {
      const { data, error } = await supabase
        .from('notes')
        .select('id, created_at, transcription_text, summary, main_points, action_items')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (error) {
        throw error;
      }

      setNotes(data || []);
    } catch (err: any) {
      console.error('Error fetching notes:', err);
      setError(err.message || 'Failed to fetch notes');
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) {
    return <p className="text-center mt-8">Loading notes...</p>;
  }

  if (error) {
    return <p className="text-center mt-8 text-red-500">Error: {error}</p>;
  }

  if (notes.length === 0) {
    return <p className="text-center mt-8">No notes recorded yet. Start recording!</p>;
  }

  return (
    <div className="w-full max-w-2xl mt-8">
      <h2 className="text-3xl font-bold mb-6 text-center">Your Recorded Notes</h2>
      <div className="space-y-6">
        {notes.map((note) => (
          <div key={note.id} className="bg-white shadow-md rounded-lg p-6 border border-gray-200">
            <p className="text-gray-500 text-sm mb-2">
              {new Date(note.created_at).toLocaleString()}
            </p>
            
            <h3 className="text-xl font-semibold mb-3">Transcription:</h3>
            <p className="text-gray-700 mb-4">{note.transcription_text}</p>

            {note.summary && (
              <div className="mt-4 border-t pt-4">
                <h4 className="text-lg font-medium">Summary:</h4>
                <p className="text-gray-700">{note.summary}</p>
              </div>
            )}

            {note.main_points && note.main_points.length > 0 && (
              <div className="mt-4 border-t pt-4">
                <h4 className="text-lg font-medium">Main Points:</h4>
                <ul className="list-disc list-inside text-gray-700">
                  {note.main_points.map((point, index) => (
                    <li key={index}>{point}</li>
                  ))}
                </ul>
              </div>
            )}

            {note.action_items && note.action_items.length > 0 && (
              <div className="mt-4 border-t pt-4">
                <h4 className="text-lg font-medium">Action Items:</h4>
                <ul className="list-disc list-inside text-gray-700">
                  {note.action_items.map((item, index) => (
                    <li key={index}>{item}</li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

export default NotesList;