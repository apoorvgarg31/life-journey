'use client';

import { useState, useEffect } from 'react';
import MarkdownRenderer from './MarkdownRenderer';

interface DailyNote {
  date: string;
  filename: string;
  content: string;
  modifiedAt: string;
}

export default function TimelineView() {
  const [notes, setNotes] = useState<DailyNote[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchNotes();
  }, []);

  const fetchNotes = async () => {
    try {
      const res = await fetch('/api/files/notes');
      if (res.ok) {
        const data = await res.json();
        setNotes(data.notes);
      }
    } catch (err) {
      console.error('Failed to fetch notes:', err);
    } finally {
      setLoading(false);
    }
  };

  const extractSections = (content: string): { time: string; text: string }[] => {
    const sections: { time: string; text: string }[] = [];
    const lines = content.split('\n');
    let currentSection: { time: string; text: string } | null = null;

    for (const line of lines) {
      const timeMatch = line.match(/^##\s*(\d{1,2}:\d{2})/);
      if (timeMatch) {
        if (currentSection) {
          sections.push(currentSection);
        }
        currentSection = { time: timeMatch[1], text: '' };
      } else if (currentSection) {
        currentSection.text += line + '\n';
      }
    }
    if (currentSection) {
      sections.push(currentSection);
    }
    return sections;
  };

  if (loading) {
    return <div className="card p-6">Loading timeline...</div>;
  }

  return (
    <div className="space-y-6 max-h-[600px] overflow-auto">
      {notes.length === 0 ? (
        <p className="text-gray-500">No daily notes found</p>
      ) : (
        notes.map((note) => {
          const sections = extractSections(note.content);
          return (
            <div key={note.date} className="card p-4">
              <h3 className="font-semibold text-lg mb-4 text-[var(--accent)]">
                {note.date}
              </h3>
              {sections.length > 0 ? (
                <div className="relative border-l-2 border-[var(--border)] ml-2 pl-4 space-y-4">
                  {sections.map((section, idx) => (
                    <div key={idx} className="relative">
                      <div className="absolute -left-[21px] top-1 w-3 h-3 bg-[var(--accent)] rounded-full" />
                      <div className="text-sm font-mono text-gray-400 mb-1">
                        {section.time}
                      </div>
                      <div className="text-sm text-gray-300">
                        <MarkdownRenderer content={section.text.trim()} />
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-sm text-gray-400">
                  <MarkdownRenderer content={note.content.slice(0, 500) + (note.content.length > 500 ? '...' : '')} />
                </div>
              )}
            </div>
          );
        })
      )}
    </div>
  );
}
