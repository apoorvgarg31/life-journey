'use client';

import { useState, useEffect } from 'react';

interface Task {
  id: string;
  title: string;
  description?: string;
  status: 'planned' | 'in-progress' | 'done';
  createdAt: string;
  updatedAt: string;
}

const COLUMNS = [
  { id: 'planned', label: 'Planned', class: 'kanban-planned' },
  { id: 'in-progress', label: 'In Progress', class: 'kanban-in-progress' },
  { id: 'done', label: 'Done', class: 'kanban-done' },
] as const;

export default function KanbanBoard() {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);
  const [newTaskTitle, setNewTaskTitle] = useState('');
  const [draggedTask, setDraggedTask] = useState<string | null>(null);

  useEffect(() => {
    fetchTasks();
  }, []);

  const fetchTasks = async () => {
    try {
      const res = await fetch('/api/tasks');
      if (res.ok) {
        const data = await res.json();
        setTasks(data.tasks);
      }
    } catch (err) {
      console.error('Failed to fetch tasks:', err);
    } finally {
      setLoading(false);
    }
  };

  const createTask = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTaskTitle.trim()) return;

    try {
      const res = await fetch('/api/tasks', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ title: newTaskTitle }),
      });
      if (res.ok) {
        const data = await res.json();
        setTasks([...tasks, data.task]);
        setNewTaskTitle('');
      }
    } catch (err) {
      console.error('Failed to create task:', err);
    }
  };

  const updateTaskStatus = async (taskId: string, status: Task['status']) => {
    try {
      const res = await fetch('/api/tasks', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: taskId, status }),
      });
      if (res.ok) {
        const data = await res.json();
        setTasks(tasks.map(t => t.id === taskId ? data.task : t));
      }
    } catch (err) {
      console.error('Failed to update task:', err);
    }
  };

  const deleteTask = async (taskId: string) => {
    try {
      const res = await fetch('/api/tasks', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: taskId }),
      });
      if (res.ok) {
        setTasks(tasks.filter(t => t.id !== taskId));
      }
    } catch (err) {
      console.error('Failed to delete task:', err);
    }
  };

  const handleDragStart = (taskId: string) => {
    setDraggedTask(taskId);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
  };

  const handleDrop = (e: React.DragEvent, status: Task['status']) => {
    e.preventDefault();
    if (draggedTask) {
      updateTaskStatus(draggedTask, status);
      setDraggedTask(null);
    }
  };

  if (loading) {
    return <div className="card p-6">Loading tasks...</div>;
  }

  return (
    <div className="space-y-4">
      <form onSubmit={createTask} className="flex gap-2">
        <input
          type="text"
          value={newTaskTitle}
          onChange={(e) => setNewTaskTitle(e.target.value)}
          placeholder="New task..."
          className="flex-1 px-4 py-2 bg-[var(--background)] border border-[var(--border)] rounded-lg focus:outline-none focus:border-[var(--accent)]"
        />
        <button type="submit" className="btn-primary">Add</button>
      </form>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {COLUMNS.map((column) => (
          <div
            key={column.id}
            className={`card ${column.class} p-4 min-h-[300px]`}
            onDragOver={handleDragOver}
            onDrop={(e) => handleDrop(e, column.id)}
          >
            <h3 className="font-semibold mb-4 text-sm uppercase tracking-wide">
              {column.label}
              <span className="ml-2 text-gray-500">
                ({tasks.filter(t => t.status === column.id).length})
              </span>
            </h3>
            <div className="space-y-2">
              {tasks
                .filter((t) => t.status === column.id)
                .map((task) => (
                  <div
                    key={task.id}
                    draggable
                    onDragStart={() => handleDragStart(task.id)}
                    className="bg-[var(--background)] border border-[var(--border)] rounded-lg p-3 cursor-move hover:border-[var(--accent)] transition-colors group"
                  >
                    <div className="flex justify-between items-start">
                      <p className="font-medium text-sm">{task.title}</p>
                      <button
                        onClick={() => deleteTask(task.id)}
                        className="text-gray-500 hover:text-[var(--error)] opacity-0 group-hover:opacity-100 transition-opacity"
                      >
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                      </button>
                    </div>
                    {task.description && (
                      <p className="text-xs text-gray-500 mt-1">{task.description}</p>
                    )}
                  </div>
                ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
