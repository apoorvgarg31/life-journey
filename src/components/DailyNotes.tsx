'use client';

import { useState, useEffect } from 'react';
import MarkdownRenderer from './MarkdownRenderer';

interface DailyNote {
  date: string;
  filename: string;
  content: string;
  modifiedAt: string;
}

export default function DailyNotes() {
  const [notes, setNotes] = useState<DailyNote[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedNote, setSelectedNote] = useState<DailyNote | null>(null);
  const [editing, setEditing] = useState(false);
  const [editContent, setEditContent] = useState('');
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    fetchNotes();
  }, []);

  const fetchNotes = async () => {
    try {
      const res = await fetch('/api/files/notes');
      if (res.ok) {
        const data = await res.json();
        setNotes(data.notes);
        if (data.notes.length > 0) {
          setSelectedNote(data.notes[0]);
          setEditContent(data.notes[0].content);
        }
      }
    } catch (err) {
      console.error('Failed to fetch notes:', err);
    } finally {
      setLoading(false);
    }
  };

  const saveNote = async () => {
    if (!selectedNote) return;
    setSaving(true);
    try {
      const res = await fetch('/api/files/notes', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ date: selectedNote.date, content: editContent }),
      });
      if (res.ok) {
        const data = await res.json();
        setNotes(notes.map(n => n.date === selectedNote.date ? data.note : n));
        setSelectedNote(data.note);
        setEditing(false);
      }
    } catch (err) {
      console.error('Failed to save:', err);
    } finally {
      setSaving(false);
    }
  };

  const selectNote = (note: DailyNote) => {
    setSelectedNote(note);
    setEditContent(note.content);
    setEditing(false);
  };

  if (loading) {
    return <div className="card p-6">Loading notes...</div>;
  }

  return (
    <div className="flex gap-4 h-full">
      {/* Notes list */}
      <div className="w-48 space-y-2 overflow-auto">
        <h3 className="font-semibold text-sm uppercase tracking-wide mb-3">Daily Notes</h3>
        {notes.length === 0 ? (
          <p className="text-gray-500 text-sm">No notes yet</p>
        ) : (
          notes.map((note) => (
            <button
              key={note.date}
              onClick={() => selectNote(note)}
              className={`w-full text-left px-3 py-2 rounded-lg text-sm transition-colors ${
                selectedNote?.date === note.date
                  ? 'bg-[var(--accent)] text-white'
                  : 'hover:bg-[var(--border)]'
              }`}
            >
              {note.date}
            </button>
          ))
        )}
      </div>

      {/* Note content */}
      <div className="flex-1 card p-4 flex flex-col">
        {selectedNote ? (
          <>
            <div className="flex justify-between items-center mb-4">
              <h3 className="font-semibold">{selectedNote.filename}</h3>
              <div className="flex gap-2">
                {editing ? (
                  <>
                    <button
                      onClick={() => {
                        setEditing(false);
                        setEditContent(selectedNote.content);
                      }}
                      className="btn-secondary text-sm"
                    >
                      Cancel
                    </button>
                    <button
                      onClick={saveNote}
                      disabled={saving}
                      className="btn-primary text-sm"
                    >
                      {saving ? 'Saving...' : 'Save'}
                    </button>
                  </>
                ) : (
                  <button
                    onClick={() => setEditing(true)}
                    className="btn-secondary text-sm"
                  >
                    Edit
                  </button>
                )}
              </div>
            </div>

            {editing ? (
              <textarea
                value={editContent}
                onChange={(e) => setEditContent(e.target.value)}
                className="flex-1 w-full p-4 bg-[var(--background)] border border-[var(--border)] rounded-lg font-mono text-sm resize-none focus:outline-none focus:border-[var(--accent)]"
              />
            ) : (
              <div className="flex-1 overflow-auto p-4 bg-[var(--background)] rounded-lg">
                <MarkdownRenderer content={selectedNote.content} className="text-sm" />
              </div>
            )}

            <p className="text-xs text-gray-500 mt-2">
              Last modified: {new Date(selectedNote.modifiedAt).toLocaleString()}
            </p>
          </>
        ) : (
          <p className="text-gray-500">Select a note to view</p>
        )}
      </div>
    </div>
  );
}
