import React, { useCallback, useEffect } from 'react';
import { cn } from '../lib/utils';
import { Save, Download, Upload, RotateCcw } from 'lucide-react';
import { DailyRecord } from '../types';
import GoalsList from './GoalsList';
import ItemList from './ItemList';
import OverdueTasksList from './OverdueTasksList';
import JournalEditor from './JournalEditor';
import { TIME_SLOTS } from '../constants';
import { moveItem, removeItem, countWords } from '../lib/utils';
import { useOverdueTasks } from '../hooks/useRecords';

interface DailyRecordViewProps {
  record: DailyRecord;
  onRecordChange: (record: DailyRecord) => void;
  isReadOnly?: boolean;
  onSave?: () => void;
  isSaving?: boolean;
  lastSaved?: Date | null;
}

export const DailyRecordView: React.FC<DailyRecordViewProps> = ({
  record,
  onRecordChange,
  isReadOnly = false,
  onSave,
  isSaving = false,
  lastSaved = null,
}) => {
  // Overdue tasks management
  const {
    generateAutoOverdueTasks,
    completeOverdueTask,
    clearCompletedOverdueTasks
  } = useOverdueTasks(record.date);

  // Auto-generate overdue tasks when component mounts or record changes
  useEffect(() => {
    if (!isReadOnly) {
      // Debounce the auto-generation to avoid excessive calls
      const timeoutId = setTimeout(() => {
        generateAutoOverdueTasks();
      }, 1000);

      return () => clearTimeout(timeoutId);
    }
  }, [record.date, isReadOnly, generateAutoOverdueTasks]);
  // Goals management
  const handleGoalsChange = useCallback((goals: DailyRecord['goals']) => {
    onRecordChange({ ...record, goals });
  }, [record, onRecordChange]);

  const handleDeleteGoal = useCallback((goalId: string) => {
    const updatedGoals = record.goals.filter(goal => goal.id !== goalId);
    handleGoalsChange(updatedGoals);
  }, [record.goals, handleGoalsChange]);

  const handleMoveGoal = useCallback((goalId: string, direction: 'up' | 'down') => {
    const goalIndex = record.goals.findIndex(goal => goal.id === goalId);
    if (goalIndex === -1) return;

    const newIndex = direction === 'up' ? goalIndex - 1 : goalIndex + 1;
    if (newIndex < 0 || newIndex >= record.goals.length) return;

    const updatedGoals = moveItem(record.goals, goalIndex, newIndex);
    handleGoalsChange(updatedGoals);
  }, [record.goals, handleGoalsChange]);

  // Priorities management
  const handlePrioritiesChange = useCallback((priorities: DailyRecord['priorities']) => {
    onRecordChange({ ...record, priorities });
  }, [record, onRecordChange]);

  const handleDeletePriority = useCallback((priorityId: string) => {
    const updatedPriorities = record.priorities.filter(priority => priority.id !== priorityId);
    handlePrioritiesChange(updatedPriorities);
  }, [record.priorities, handlePrioritiesChange]);

  const handleMovePriority = useCallback((priorityId: string, direction: 'up' | 'down') => {
    const priorityIndex = record.priorities.findIndex(priority => priority.id === priorityId);
    if (priorityIndex === -1) return;

    const newIndex = direction === 'up' ? priorityIndex - 1 : priorityIndex + 1;
    if (newIndex < 0 || newIndex >= record.priorities.length) return;

    const updatedPriorities = moveItem(record.priorities, priorityIndex, newIndex);
    handlePrioritiesChange(updatedPriorities);
  }, [record.priorities, handlePrioritiesChange]);

  // Overdue tasks management
  const handleOverdueTasksChange = useCallback((overdue_tasks: DailyRecord['overdue_tasks']) => {
    onRecordChange({ ...record, overdue_tasks });
  }, [record, onRecordChange]);

  const handleDeleteOverdueTask = useCallback((taskId: string) => {
    const updatedTasks = record.overdue_tasks.filter(task => task.id !== taskId);
    handleOverdueTasksChange(updatedTasks);
  }, [record.overdue_tasks, handleOverdueTasksChange]);

  const handleMoveOverdueTask = useCallback((taskId: string, direction: 'up' | 'down') => {
    const taskIndex = record.overdue_tasks.findIndex(task => task.id === taskId);
    if (taskIndex === -1) return;

    const newIndex = direction === 'up' ? taskIndex - 1 : taskIndex + 1;
    if (newIndex < 0 || newIndex >= record.overdue_tasks.length) return;

    const updatedTasks = moveItem(record.overdue_tasks, taskIndex, newIndex);
    handleOverdueTasksChange(updatedTasks);
  }, [record.overdue_tasks, handleOverdueTasksChange]);

  const handleCompleteOverdueTask = useCallback((taskId: string, status: 'neutral' | 'done' | 'not_done') => {
    completeOverdueTask(taskId, status);
  }, [completeOverdueTask]);

  const handleClearCompletedOverdueTasks = useCallback(() => {
    clearCompletedOverdueTasks();
  }, [clearCompletedOverdueTasks]);

  // Other items management (same as priorities but for the other items section)
  const handleOtherItemsChange = useCallback((items: DailyRecord['priorities']) => {
    // For now, we'll store other items in the priorities array with a different type
    // In a real app, you'd want a separate field
    const otherItems = items.filter(item => !record.priorities.includes(item));
    const updatedPriorities = [...record.priorities, ...otherItems];
    onRecordChange({ ...record, priorities: updatedPriorities });
  }, [record, onRecordChange]);

  const handleDeleteOtherItem = useCallback((itemId: string) => {
    const updatedItems = record.priorities.filter(item => item.id !== itemId);
    handleOtherItemsChange(updatedItems);
  }, [record.priorities, handleOtherItemsChange]);

  const handleMoveOtherItem = useCallback((itemId: string, direction: 'up' | 'down') => {
    const itemIndex = record.priorities.findIndex(item => item.id === itemId);
    if (itemIndex === -1) return;

    const newIndex = direction === 'up' ? itemIndex - 1 : itemIndex + 1;
    if (newIndex < 0 || newIndex >= record.priorities.length) return;

    const updatedItems = moveItem(record.priorities, itemIndex, newIndex);
    handleOtherItemsChange(updatedItems);
  }, [record.priorities, handleOtherItemsChange]);

  // Journal management
  const handleJournalChange = useCallback((content: string) => {
    const wordCount = countWords(content);
    onRecordChange({
      ...record,
      journal: {
        content,
        wordCount,
        lastModified: new Date().toISOString(),
      },
    });
  }, [record, onRecordChange]);

  // Export/Import functionality
  const handleExport = useCallback(() => {
    const dataToExport = {
      record,
      exportDate: new Date().toISOString(),
      version: '1.0.0',
    };

    const blob = new Blob([JSON.stringify(dataToExport, null, 2)], {
      type: 'application/json',
    });

    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `daily-record-${record.date}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  }, [record]);

  const handleReset = useCallback(() => {
    if (window.confirm('Are you sure you want to reset all data for this day? This action cannot be undone.')) {
      onRecordChange({
        ...record,
        goals: [],
        priorities: [],
        overdue_tasks: [],
        journal: {
          content: '',
          wordCount: 0,
          lastModified: new Date().toISOString(),
        },
      });
    }
  }, [record, onRecordChange]);

  // Calculate progress
  const totalGoals = record.goals.length;
  const completedGoals = record.goals.filter(goal => goal.status === 'done').length;
  const totalPriorities = record.priorities.length;
  const completedPriorities = record.priorities.filter(priority => priority.status === 'done').length;
  const totalOverdueTasks = record.overdue_tasks.length;
  const completedOverdueTasks = record.overdue_tasks.filter(task => task.status === 'done').length;
  const hasJournal = record.journal.content.length > 0;

  const progressPercentage = totalGoals + totalPriorities + totalOverdueTasks > 0
    ? Math.round(((completedGoals + completedPriorities + completedOverdueTasks) / (totalGoals + totalPriorities + totalOverdueTasks)) * 100)
    : hasJournal ? 50 : 0;

  return (
    <div className="space-y-6">
      {/* Header with save status and actions */}
      <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100">
              Daily Progress
            </h2>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              {record.date}
            </p>
          </div>

          <div className="flex items-center gap-3">
            {/* Progress indicator */}
            <div className="flex items-center gap-2">
              <div className="text-sm text-gray-500 dark:text-gray-400">Progress:</div>
              <div className="flex items-center gap-2">
                <div className="w-16 bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                  <div
                    className="h-2 bg-blue-500 rounded-full transition-all"
                    style={{ width: `${progressPercentage}%` }}
                  />
                </div>
                <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                  {progressPercentage}%
                </span>
              </div>
            </div>

            {/* Action buttons */}
            <div className="flex items-center gap-2">
              {onSave && !isReadOnly && (
                <button
                  onClick={onSave}
                  disabled={isSaving}
                  className={cn(
                    'flex items-center gap-1 px-3 py-2 text-sm rounded-lg transition-colors',
                    isSaving
                      ? 'bg-yellow-100 text-yellow-700 cursor-wait'
                      : 'bg-blue-100 text-blue-700 hover:bg-blue-200'
                  )}
                >
                  <Save className="w-4 h-4" />
                  {isSaving ? 'Saving...' : 'Save'}
                </button>
              )}

              <button
                onClick={handleExport}
                className="p-2 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
                title="Export record"
              >
                <Download className="w-4 h-4" />
              </button>

              <button
                onClick={handleReset}
                disabled={isReadOnly}
                className="p-2 text-red-500 hover:text-red-700 disabled:opacity-50 disabled:cursor-not-allowed"
                title="Reset all data"
              >
                <RotateCcw className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>

        {/* Status indicators */}
        <div className="mt-4 grid grid-cols-5 gap-4 text-center">
          <div className="p-2 bg-gray-50 dark:bg-gray-700 rounded">
            <div className="text-lg font-semibold text-gray-900 dark:text-gray-100">
              {totalGoals}
            </div>
            <div className="text-xs text-gray-500 dark:text-gray-400">Total Goals</div>
          </div>
          <div className="p-2 bg-green-50 dark:bg-green-900/20 rounded">
            <div className="text-lg font-semibold text-green-700 dark:text-green-300">
              {completedGoals}
            </div>
            <div className="text-xs text-green-600 dark:text-green-400">Goals Done</div>
          </div>
          <div className="p-2 bg-blue-50 dark:bg-blue-900/20 rounded">
            <div className="text-lg font-semibold text-blue-700 dark:text-blue-300">
              {totalPriorities}
            </div>
            <div className="text-xs text-blue-600 dark:text-blue-400">Total Priorities</div>
          </div>
          <div className="p-2 bg-orange-50 dark:bg-orange-900/20 rounded">
            <div className="text-lg font-semibold text-orange-700 dark:text-orange-300">
              {totalOverdueTasks}
            </div>
            <div className="text-xs text-orange-600 dark:text-orange-400">Overdue Tasks</div>
          </div>
          <div className="p-2 bg-yellow-50 dark:bg-yellow-900/20 rounded">
            <div className="text-lg font-semibold text-yellow-700 dark:text-yellow-300">
              {record.journal.wordCount}
            </div>
            <div className="text-xs text-yellow-600 dark:text-yellow-400">Journal Words</div>
          </div>
        </div>

        {/* Last saved indicator */}
        {lastSaved && (
          <div className="mt-3 text-xs text-gray-500 dark:text-gray-400 text-center">
            Last saved: {lastSaved.toLocaleString()}
          </div>
        )}
      </div>

      {/* Main content */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Left column */}
        <div className="space-y-6">
          <GoalsList
            goals={record.goals}
            onGoalsChange={handleGoalsChange}
            onDeleteGoal={handleDeleteGoal}
            onMoveGoal={handleMoveGoal}
            availableTimeSlots={TIME_SLOTS.map(time => time)}
            disabled={isReadOnly}
          />
        </div>

        {/* Right column */}
        <div className="space-y-6">
          <ItemList
            items={record.priorities}
            onItemsChange={handlePrioritiesChange}
            onDeleteItem={handleDeletePriority}
            onMoveItem={handleMovePriority}
            type="priority"
            disabled={isReadOnly}
          />

          <OverdueTasksList
            tasks={record.overdue_tasks}
            onTasksChange={handleOverdueTasksChange}
            onDeleteTask={handleDeleteOverdueTask}
            onMoveTask={handleMoveOverdueTask}
            onCompleteTask={handleCompleteOverdueTask}
            onClearCompleted={handleClearCompletedOverdueTasks}
            disabled={isReadOnly}
          />

          <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-4">
            <JournalEditor
              content={record.journal.content}
              wordCount={record.journal.wordCount}
              onChange={handleJournalChange}
              disabled={isReadOnly}
              autoSave={!isReadOnly}
            />
          </div>
        </div>
      </div>

      {/* Additional section for "Other Items" if needed */}
      {record.priorities.filter(item => !record.goals.some(goal => goal.id === item.id)).length > 0 && (
        <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-4">
          <ItemList
            items={record.priorities}
            onItemsChange={handleOtherItemsChange}
            onDeleteItem={handleDeleteOtherItem}
            onMoveItem={handleMoveOtherItem}
            type="other"
            disabled={isReadOnly}
          />
        </div>
      )}
    </div>
  );
};

export default DailyRecordView;
