'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import KanbanBoard from '@/components/KanbanBoard';
import MemoryViewer from '@/components/MemoryViewer';
import DailyNotes from '@/components/DailyNotes';
import ConfigEditor from '@/components/ConfigEditor';
import TimelineView from '@/components/TimelineView';
import SearchPanel from '@/components/SearchPanel';
import QuickCapture from '@/components/QuickCapture';

type Tab = 'kanban' | 'memory' | 'notes' | 'config' | 'timeline' | 'search';

const TABS: { id: Tab; label: string; icon: string }[] = [
  { id: 'kanban', label: 'Kanban', icon: '📋' },
  { id: 'memory', label: 'Memory', icon: '🧠' },
  { id: 'notes', label: 'Daily Notes', icon: '📝' },
  { id: 'config', label: 'Config', icon: '⚙️' },
  { id: 'timeline', label: 'Timeline', icon: '📅' },
  { id: 'search', label: 'Search', icon: '🔍' },
];

export default function DashboardPage() {
  const [activeTab, setActiveTab] = useState<Tab>('kanban');
  const [username, setUsername] = useState<string>('');
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    checkAuth();
  }, []);

  const checkAuth = async () => {
    try {
      const res = await fetch('/api/auth/check');
      if (res.ok) {
        const data = await res.json();
        setUsername(data.username);
      } else {
        router.push('/login');
      }
    } catch {
      router.push('/login');
    } finally {
      setLoading(false);
    }
  };

  const logout = async () => {
    await fetch('/api/auth/logout', { method: 'POST' });
    router.push('/login');
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-lg">Loading...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col">
      {/* Header */}
      <header className="border-b border-[var(--border)] px-6 py-4">
        <div className="flex items-center justify-between">
          <h1 className="text-xl font-bold">Life Dashboard</h1>
          <div className="flex items-center gap-4">
            <span className="text-gray-400 text-sm">Hey, {username}</span>
            <button onClick={logout} className="btn-secondary text-sm">
              Logout
            </button>
          </div>
        </div>
      </header>

      <div className="flex flex-1 overflow-hidden">
        {/* Sidebar */}
        <aside className="w-56 border-r border-[var(--border)] p-4 flex flex-col gap-4">
          {/* Navigation */}
          <nav className="space-y-1">
            {TABS.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg text-left transition-colors ${
                  activeTab === tab.id
                    ? 'bg-[var(--accent)] text-white'
                    : 'hover:bg-[var(--border)]'
                }`}
              >
                <span>{tab.icon}</span>
                <span className="text-sm">{tab.label}</span>
              </button>
            ))}
          </nav>

          {/* Quick Capture in sidebar */}
          <div className="mt-auto">
            <QuickCapture />
          </div>
        </aside>

        {/* Main Content */}
        <main className="flex-1 p-6 overflow-auto">
          {activeTab === 'kanban' && (
            <div>
              <h2 className="text-lg font-semibold mb-4">Task Board</h2>
              <KanbanBoard />
            </div>
          )}
          {activeTab === 'memory' && (
            <div className="h-full">
              <h2 className="text-lg font-semibold mb-4">Long-Term Memory</h2>
              <div className="h-[calc(100%-2rem)]">
                <MemoryViewer />
              </div>
            </div>
          )}
          {activeTab === 'notes' && (
            <div className="h-full">
              <h2 className="text-lg font-semibold mb-4">Daily Notes</h2>
              <div className="h-[calc(100%-2rem)]">
                <DailyNotes />
              </div>
            </div>
          )}
          {activeTab === 'config' && (
            <div className="h-full">
              <h2 className="text-lg font-semibold mb-4">Configuration Files</h2>
              <div className="h-[calc(100%-2rem)]">
                <ConfigEditor />
              </div>
            </div>
          )}
          {activeTab === 'timeline' && (
            <div>
              <h2 className="text-lg font-semibold mb-4">Timeline</h2>
              <TimelineView />
            </div>
          )}
          {activeTab === 'search' && (
            <div>
              <h2 className="text-lg font-semibold mb-4">Search</h2>
              <SearchPanel />
            </div>
          )}
        </main>
      </div>
    </div>
  );
}
