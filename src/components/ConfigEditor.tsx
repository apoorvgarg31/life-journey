'use client';

import { useState, useEffect } from 'react';
import MarkdownRenderer from './MarkdownRenderer';

interface FileContent {
  name: string;
  path: string;
  content: string;
  modifiedAt: string;
}

const CONFIG_FILES = ['SOUL.md', 'AGENTS.md', 'HEARTBEAT.md', 'USER.md', 'IDENTITY.md', 'TOOLS.md'];

export default function ConfigEditor() {
  const [files, setFiles] = useState<FileContent[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedFile, setSelectedFile] = useState<FileContent | null>(null);
  const [editing, setEditing] = useState(false);
  const [editContent, setEditContent] = useState('');
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    fetchFiles();
  }, []);

  const fetchFiles = async () => {
    try {
      const res = await fetch('/api/files');
      if (res.ok) {
        const data = await res.json();
        const configFiles = data.files.filter((f: FileContent) => CONFIG_FILES.includes(f.name));
        setFiles(configFiles);
        if (configFiles.length > 0) {
          setSelectedFile(configFiles[0]);
          setEditContent(configFiles[0].content);
        }
      }
    } catch (err) {
      console.error('Failed to fetch files:', err);
    } finally {
      setLoading(false);
    }
  };

  const saveFile = async () => {
    if (!selectedFile) return;
    setSaving(true);
    try {
      const res = await fetch('/api/files', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ filename: selectedFile.name, content: editContent }),
      });
      if (res.ok) {
        const data = await res.json();
        setFiles(files.map(f => f.name === selectedFile.name ? data.file : f));
        setSelectedFile(data.file);
        setEditing(false);
      }
    } catch (err) {
      console.error('Failed to save:', err);
    } finally {
      setSaving(false);
    }
  };

  const selectFile = (file: FileContent) => {
    setSelectedFile(file);
    setEditContent(file.content);
    setEditing(false);
  };

  if (loading) {
    return <div className="card p-6">Loading config files...</div>;
  }

  return (
    <div className="flex gap-4 h-full">
      {/* Files list */}
      <div className="w-48 space-y-2 overflow-auto">
        <h3 className="font-semibold text-sm uppercase tracking-wide mb-3">Config Files</h3>
        {files.map((file) => (
          <button
            key={file.name}
            onClick={() => selectFile(file)}
            className={`w-full text-left px-3 py-2 rounded-lg text-sm transition-colors ${
              selectedFile?.name === file.name
                ? 'bg-[var(--accent)] text-white'
                : 'hover:bg-[var(--border)]'
            }`}
          >
            {file.name}
          </button>
        ))}
      </div>

      {/* File content */}
      <div className="flex-1 card p-4 flex flex-col">
        {selectedFile ? (
          <>
            <div className="flex justify-between items-center mb-4">
              <h3 className="font-semibold">{selectedFile.name}</h3>
              <div className="flex gap-2">
                {editing ? (
                  <>
                    <button
                      onClick={() => {
                        setEditing(false);
                        setEditContent(selectedFile.content);
                      }}
                      className="btn-secondary text-sm"
                    >
                      Cancel
                    </button>
                    <button
                      onClick={saveFile}
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
                <MarkdownRenderer content={selectedFile.content} className="text-sm" />
              </div>
            )}

            <p className="text-xs text-gray-500 mt-2">
              Last modified: {new Date(selectedFile.modifiedAt).toLocaleString()}
            </p>
          </>
        ) : (
          <p className="text-gray-500">Select a file to view</p>
        )}
      </div>
    </div>
  );
}
