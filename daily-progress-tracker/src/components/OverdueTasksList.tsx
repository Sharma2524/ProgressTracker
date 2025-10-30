import React, { useState } from 'react';
import { cn } from '../lib/utils';
import { Plus, ChevronUp, ChevronDown, Trash2, AlertCircle, Clock, CheckCircle2 } from 'lucide-react';
import { OverdueTaskItem } from '../types';
import TriStateToggle from './TriStateToggle';
import { generateId, isValidTitle, formatOverdueSource } from '../lib/utils';
import { MAX_TITLE_LENGTH } from '../constants';

interface OverdueTasksListProps {
  tasks: OverdueTaskItem[];
  onTasksChange: (tasks: OverdueTaskItem[]) => void;
  onDeleteTask: (taskId: string) => void;
  onMoveTask: (taskId: string, direction: 'up' | 'down') => void;
  onCompleteTask?: (taskId: string, status: 'neutral' | 'done' | 'not_done') => void;
  onClearCompleted?: () => void;
  disabled?: boolean;
}

export const OverdueTasksList: React.FC<OverdueTasksListProps> = ({
  tasks,
  onTasksChange,
  onDeleteTask,
  onMoveTask,
  onCompleteTask,
  onClearCompleted,
  disabled = false,
}) => {
  const [editingId, setEditingId] = useState<string | null>(null);
  const [newTaskTitle, setNewTaskTitle] = useState('');

  // Calculate overdue task statistics
  const stats = {
    total: tasks.length,
    auto: tasks.filter(task => task.source === 'auto').length,
    manual: tasks.filter(task => task.source === 'manual').length,
    completed: tasks.filter(task => task.status === 'done').length
  };

  const handleAddTask = () => {
    if (!newTaskTitle.trim() || disabled) return;
    
    const newTask: OverdueTaskItem = {
      id: generateId(),
      title: newTaskTitle.trim(),
      status: 'neutral',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      source: 'manual'
    };

    onTasksChange([...tasks, newTask]);
    setNewTaskTitle('');
    setEditingId(null);
  };

  const handleTaskTitleChange = (taskId: string, newTitle: string) => {
    if (!isValidTitle(newTitle)) return;

    const updatedTasks = tasks.map(task => 
      task.id === taskId 
        ? { ...task, title: newTitle, updatedAt: new Date().toISOString() }
        : task
    );
    onTasksChange(updatedTasks);
  };

  const handleTaskStatusChange = (taskId: string, newStatus: 'neutral' | 'done' | 'not_done') => {
    if (onCompleteTask) {
      onCompleteTask(taskId, newStatus);
    } else {
      // Fallback to local update if no completion callback provided
      const updatedTasks = tasks.map(task => 
        task.id === taskId 
          ? { ...task, status: newStatus, updatedAt: new Date().toISOString() }
          : task
      );
      onTasksChange(updatedTasks);
    }
  };

  const getTaskProgress = (task: OverdueTaskItem) => {
    switch (task.status) {
      case 'done':
        return 100;
      case 'not_done':
        return 0;
      default:
        return 50;
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 flex items-center gap-2">
            <AlertCircle className="w-5 h-5 text-orange-500" />
            Overdue Tasks ({stats.total})
          </h3>
          
          {stats.auto > 0 && (
            <div className="flex items-center gap-2 text-sm">
              <Clock className="w-4 h-4 text-blue-500" />
              <span className="text-blue-600 dark:text-blue-400">
                {stats.auto} auto
              </span>
            </div>
          )}
          
          {stats.completed > 0 && (
            <div className="flex items-center gap-2 text-sm">
              <CheckCircle2 className="w-4 h-4 text-green-500" />
              <span className="text-green-600 dark:text-green-400">
                {stats.completed} done
              </span>
            </div>
          )}
        </div>
        
        {stats.completed > 0 && onClearCompleted && (
          <button
            type="button"
            onClick={onClearCompleted}
            disabled={disabled}
            className="px-3 py-1 text-xs bg-green-100 text-green-700 rounded hover:bg-green-200 disabled:opacity-50 transition-colors"
          >
            Clear Completed
          </button>
        )}
      </div>

      {/* Add new task */}
      <div className="space-y-2">
        {editingId === 'new' ? (
          <div className="space-y-2">
            <input
              type="text"
              value={newTaskTitle}
              onChange={(e) => setNewTaskTitle(e.target.value)}
              placeholder="Enter overdue task title..."
              maxLength={MAX_TITLE_LENGTH}
              className="w-full px-3 py-2 text-sm bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              autoFocus
              onKeyDown={(e) => {
                if (e.key === 'Enter') handleAddTask();
                if (e.key === 'Escape') {
                  setNewTaskTitle('');
                  setEditingId(null);
                }
              }}
            />
            <div className="flex gap-2">
              <button
                type="button"
                onClick={handleAddTask}
                disabled={!newTaskTitle.trim() || disabled}
                className="px-3 py-1 text-xs bg-orange-100 text-orange-700 rounded hover:bg-orange-200 disabled:opacity-50"
              >
                Add Overdue Task
              </button>
              <button
                type="button"
                onClick={() => {
                  setNewTaskTitle('');
                  setEditingId(null);
                }}
                className="px-3 py-1 text-xs bg-gray-100 text-gray-700 rounded hover:bg-gray-200"
              >
                Cancel
              </button>
            </div>
          </div>
        ) : (
          <button
            type="button"
            onClick={() => setEditingId('new')}
            disabled={disabled}
            className="w-full p-3 border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg text-gray-500 dark:text-gray-400 hover:border-orange-400 hover:text-orange-500 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
          >
            <Plus className="w-4 h-4" />
            Add New Overdue Task
          </button>
        )}
      </div>

      {/* Tasks list */}
      <div className="space-y-3">
        {tasks.map((task, index) => {
          const progress = getTaskProgress(task);

          return (
            <div
              key={task.id}
              className={cn(
                'p-4 border rounded-lg bg-white dark:bg-gray-800 transition-all',
                task.status === 'done' && 'border-green-200 bg-green-50 dark:bg-green-900/20',
                task.status === 'not_done' && 'border-red-200 bg-red-50 dark:bg-red-900/20',
                task.status === 'neutral' && 'border-orange-200 bg-orange-50 dark:bg-orange-900/20',
                task.source === 'auto' && 'ring-1 ring-blue-100 dark:ring-blue-900/30',
                task.source === 'manual' && 'ring-1 ring-gray-100 dark:ring-gray-900/30',
                disabled && 'opacity-75'
              )}
            >
              {/* Task header */}
              <div className="flex items-start justify-between gap-3">
                <div className="flex-1 min-w-0">
                  <input
                    type="text"
                    value={task.title}
                    onChange={(e) => handleTaskTitleChange(task.id, e.target.value)}
                    disabled={disabled}
                    className="w-full px-2 py-1 text-sm font-medium bg-transparent border-none focus:outline-none focus:ring-1 focus:ring-orange-500 rounded disabled:cursor-not-allowed"
                    placeholder="Overdue task title..."
                  />
                  
                  {/* Source information and progress */}
                  <div className="mt-2 space-y-1">
                    {/* Source info for auto-generated tasks */}
                    {task.source === 'auto' && task.originalDate && (
                      <div className="flex items-center gap-2 text-xs">
                        <Clock className="w-3 h-3 text-blue-500" />
                        <span className="text-blue-600 dark:text-blue-400 font-medium">
                          {formatOverdueSource(task)}
                        </span>
                        <span className="text-gray-400">•</span>
                        <span className="text-gray-500 dark:text-gray-400 capitalize">
                          {task.originalType}
                        </span>
                      </div>
                    )}
                    
                    {/* Progress indicator */}
                    <div className="flex items-center gap-2">
                      <div className="flex-1 bg-gray-200 dark:bg-gray-700 rounded-full h-1.5">
                        <div
                          className={cn(
                            'h-1.5 rounded-full transition-all',
                            task.status === 'done' && 'bg-green-500',
                            task.status === 'not_done' && 'bg-red-500',
                            task.status === 'neutral' && 'bg-orange-500'
                          )}
                          style={{ width: `${progress}%` }}
                        />
                      </div>
                      <span className="text-xs text-gray-500 dark:text-gray-400">
                        {task.status === 'done' && 'Completed'}
                        {task.status === 'not_done' && 'Not Done'}
                        {task.status === 'neutral' && 'In Progress'}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  {/* Task status toggle */}
                  <TriStateToggle
                    status={task.status}
                    onChange={(status) => handleTaskStatusChange(task.id, status)}
                    disabled={disabled}
                    size="sm"
                  />

                  {/* Move buttons */}
                  <div className="flex flex-col">
                    <button
                      type="button"
                      onClick={() => onMoveTask(task.id, 'up')}
                      disabled={disabled || index === 0}
                      className="p-1 text-gray-400 hover:text-gray-600 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      <ChevronUp className="w-3 h-3" />
                    </button>
                    <button
                      type="button"
                      onClick={() => onMoveTask(task.id, 'down')}
                      disabled={disabled || index === tasks.length - 1}
                      className="p-1 text-gray-400 hover:text-gray-600 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      <ChevronDown className="w-3 h-3" />
                    </button>
                  </div>

                  {/* Delete button */}
                  <button
                    type="button"
                    onClick={() => onDeleteTask(task.id)}
                    disabled={disabled}
                    className="p-1 text-red-400 hover:text-red-600 disabled:opacity-50"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {tasks.length === 0 && (
        <div className="text-center py-8 text-gray-500 dark:text-gray-400">
          <AlertCircle className="w-8 h-8 mx-auto mb-2 opacity-50 text-orange-500" />
          <p>No overdue tasks for today yet.</p>
          <p className="text-sm">Add your first overdue task to track what needs to be done!</p>
        </div>
      )}
    </div>
  );
};

export default OverdueTasksList;