'use client';

import { useState, useEffect } from 'react';
import MarkdownRenderer from './MarkdownRenderer';

interface FileContent {
  name: string;
  path: string;
  content: string;
  modifiedAt: string;
}

export default function MemoryViewer() {
  const [file, setFile] = useState<FileContent | null>(null);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(false);
  const [editContent, setEditContent] = useState('');
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    fetchMemory();
  }, []);

  const fetchMemory = async () => {
    try {
      const res = await fetch('/api/files');
      if (res.ok) {
        const data = await res.json();
        const memoryFile = data.files.find((f: FileContent) => f.name === 'MEMORY.md');
        if (memoryFile) {
          setFile(memoryFile);
          setEditContent(memoryFile.content);
        }
      }
    } catch (err) {
      console.error('Failed to fetch memory:', err);
    } finally {
      setLoading(false);
    }
  };

  const saveContent = async () => {
    setSaving(true);
    try {
      const res = await fetch('/api/files', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ filename: 'MEMORY.md', content: editContent }),
      });
      if (res.ok) {
        const data = await res.json();
        setFile(data.file);
        setEditing(false);
      }
    } catch (err) {
      console.error('Failed to save:', err);
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return <div className="card p-6">Loading memory...</div>;
  }

  if (!file) {
    return <div className="card p-6">MEMORY.md not found</div>;
  }

  return (
    <div className="card p-4 h-full flex flex-col">
      <div className="flex justify-between items-center mb-4">
        <h3 className="font-semibold">MEMORY.md</h3>
        <div className="flex gap-2">
          {editing ? (
            <>
              <button
                onClick={() => {
                  setEditing(false);
                  setEditContent(file.content);
                }}
                className="btn-secondary text-sm"
              >
                Cancel
              </button>
              <button
                onClick={saveContent}
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
          <MarkdownRenderer content={file.content} className="text-sm" />
        </div>
      )}

      <p className="text-xs text-gray-500 mt-2">
        Last modified: {new Date(file.modifiedAt).toLocaleString()}
      </p>
    </div>
  );
}
