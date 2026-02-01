'use client';

import { useState } from 'react';

interface SearchMatch {
  line: number;
  content: string;
}

interface SearchResult {
  file: string;
  filename: string;
  matches: SearchMatch[];
}

export default function SearchPanel() {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<SearchResult[]>([]);
  const [loading, setLoading] = useState(false);
  const [searched, setSearched] = useState(false);

  const search = async (e: React.FormEvent) => {
    e.preventDefault();
    if (query.length < 2) return;

    setLoading(true);
    setSearched(true);
    try {
      const res = await fetch(`/api/search?q=${encodeURIComponent(query)}`);
      if (res.ok) {
        const data = await res.json();
        setResults(data.results);
      }
    } catch (err) {
      console.error('Search failed:', err);
    } finally {
      setLoading(false);
    }
  };

  const highlightMatch = (text: string, query: string) => {
    const regex = new RegExp(`(${query})`, 'gi');
    const parts = text.split(regex);
    return parts.map((part, i) =>
      regex.test(part) ? (
        <mark key={i} className="bg-[var(--accent)] text-white px-0.5 rounded">
          {part}
        </mark>
      ) : (
        part
      )
    );
  };

  const totalMatches = results.reduce((sum, r) => sum + r.matches.length, 0);

  return (
    <div className="space-y-4">
      <form onSubmit={search} className="flex gap-2">
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search all files..."
          className="flex-1 px-4 py-2 bg-[var(--background)] border border-[var(--border)] rounded-lg focus:outline-none focus:border-[var(--accent)]"
        />
        <button type="submit" disabled={loading || query.length < 2} className="btn-primary disabled:opacity-50">
          {loading ? 'Searching...' : 'Search'}
        </button>
      </form>

      {searched && (
        <p className="text-sm text-gray-500">
          Found {totalMatches} match{totalMatches !== 1 ? 'es' : ''} in {results.length} file{results.length !== 1 ? 's' : ''}
        </p>
      )}

      <div className="space-y-4 max-h-[500px] overflow-auto">
        {results.map((result, idx) => (
          <div key={idx} className="card p-4">
            <h4 className="font-semibold text-[var(--accent)] mb-2">{result.filename}</h4>
            <div className="space-y-2">
              {result.matches.slice(0, 10).map((match, mIdx) => (
                <div key={mIdx} className="flex gap-3 text-sm">
                  <span className="text-gray-500 font-mono w-8 shrink-0">
                    {match.line}
                  </span>
                  <span className="text-gray-300 truncate">
                    {highlightMatch(match.content, query)}
                  </span>
                </div>
              ))}
              {result.matches.length > 10 && (
                <p className="text-sm text-gray-500 italic">
                  ... and {result.matches.length - 10} more matches
                </p>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
