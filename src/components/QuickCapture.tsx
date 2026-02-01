'use client';

import { useState } from 'react';

export default function QuickCapture() {
  const [note, setNote] = useState('');
  const [saving, setSaving] = useState(false);
  const [success, setSuccess] = useState(false);

  const saveNote = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!note.trim()) return;

    setSaving(true);
    setSuccess(false);
    try {
      const res = await fetch('/api/files/notes', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ content: note, append: true }),
      });
      if (res.ok) {
        setNote('');
        setSuccess(true);
        setTimeout(() => setSuccess(false), 3000);
      }
    } catch (err) {
      console.error('Failed to save note:', err);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="card p-4">
      <h3 className="font-semibold mb-3">Quick Capture</h3>
      <form onSubmit={saveNote} className="space-y-3">
        <textarea
          value={note}
          onChange={(e) => setNote(e.target.value)}
          placeholder="Capture a thought... (will be added to today's notes)"
          rows={3}
          className="w-full p-3 bg-[var(--background)] border border-[var(--border)] rounded-lg text-sm resize-none focus:outline-none focus:border-[var(--accent)]"
        />
        <div className="flex items-center justify-between">
          <button
            type="submit"
            disabled={saving || !note.trim()}
            className="btn-primary text-sm disabled:opacity-50"
          >
            {saving ? 'Saving...' : 'Add to Today'}
          </button>
          {success && (
            <span className="text-[var(--success)] text-sm">Saved!</span>
          )}
        </div>
      </form>
    </div>
  );
}
