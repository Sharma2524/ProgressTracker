import React, { useState, useCallback } from 'react';
import { cn } from '../lib/utils';
import { Plus, ChevronUp, ChevronDown, Trash2, Clock, Target } from 'lucide-react';
import { GoalItem } from '../types';
import TriStateToggle from './TriStateToggle';
import TimeSelect from './TimeSelect';
import { generateId, isValidTitle } from '../lib/utils';
import { MAX_TITLE_LENGTH } from '../constants';

interface GoalsListProps {
  goals: GoalItem[];
  onGoalsChange: (goals: GoalItem[]) => void;
  onDeleteGoal: (goalId: string) => void;
  onMoveGoal: (goalId: string, direction: 'up' | 'down') => void;
  availableTimeSlots: string[];
  disabled?: boolean;
}

export const GoalsList: React.FC<GoalsListProps> = ({
  goals,
  onGoalsChange,
  onDeleteGoal,
  onMoveGoal,
  availableTimeSlots,
  disabled = false,
}) => {
  const [editingId, setEditingId] = useState<string | null>(null);
  const [newGoalTitle, setNewGoalTitle] = useState('');

  const handleAddGoal = useCallback(() => {
    if (!newGoalTitle.trim() || disabled) return;
    
    const newGoal: GoalItem = {
      id: generateId(),
      title: newGoalTitle.trim(),
      timeSlots: [],
      status: 'neutral',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    onGoalsChange([...goals, newGoal]);
    setNewGoalTitle('');
    setEditingId(null);
  }, [newGoalTitle, goals, onGoalsChange, disabled]);

  const handleGoalTitleChange = useCallback((goalId: string, newTitle: string) => {
    if (!isValidTitle(newTitle)) return;

    const updatedGoals = goals.map(goal => 
      goal.id === goalId 
        ? { ...goal, title: newTitle, updatedAt: new Date().toISOString() }
        : goal
    );
    onGoalsChange(updatedGoals);
  }, [goals, onGoalsChange]);

  const handleGoalStatusChange = useCallback((goalId: string, newStatus: 'neutral' | 'done' | 'not_done') => {
    const updatedGoals = goals.map(goal => 
      goal.id === goalId 
        ? { ...goal, status: newStatus, updatedAt: new Date().toISOString() }
        : goal
    );
    onGoalsChange(updatedGoals);
  }, [goals, onGoalsChange]);

  const handleAddTimeSlot = useCallback((goalId: string) => {
    const updatedGoals = goals.map(goal => {
      if (goal.id === goalId) {
        const selectedTimes = goal.timeSlots.map(slot => slot.startTime);
        const availableTimes = availableTimeSlots.filter(time => !selectedTimes.includes(time));
        
        if (availableTimes.length === 0) return goal;

        const firstAvailable = availableTimes[0];
        const timeSlot = {
          id: generateId(),
          startTime: firstAvailable,
          endTime: '23:59', // Will be calculated properly
          status: 'neutral' as const,
        };

        return {
          ...goal,
          timeSlots: [...goal.timeSlots, timeSlot],
          updatedAt: new Date().toISOString(),
        };
      }
      return goal;
    });
    onGoalsChange(updatedGoals);
  }, [goals, onGoalsChange, availableTimeSlots]);

  const handleTimeSlotChange = useCallback((goalId: string, slotId: string, newTime: string) => {
    const updatedGoals = goals.map(goal => {
      if (goal.id === goalId) {
        const updatedTimeSlots = goal.timeSlots.map(slot => 
          slot.id === slotId 
            ? { ...slot, startTime: newTime, updatedAt: new Date().toISOString() }
            : slot
        );
        return {
          ...goal,
          timeSlots: updatedTimeSlots,
          updatedAt: new Date().toISOString(),
        };
      }
      return goal;
    });
    onGoalsChange(updatedGoals);
  }, [goals, onGoalsChange]);

  const handleTimeSlotStatusChange = useCallback((goalId: string, slotId: string, newStatus: 'neutral' | 'done' | 'not_done') => {
    const updatedGoals = goals.map(goal => {
      if (goal.id === goalId) {
        const updatedTimeSlots = goal.timeSlots.map(slot => 
          slot.id === slotId 
            ? { ...slot, status: newStatus }
            : slot
        );
        return {
          ...goal,
          timeSlots: updatedTimeSlots,
          updatedAt: new Date().toISOString(),
        };
      }
      return goal;
    });
    onGoalsChange(updatedGoals);
  }, [goals, onGoalsChange]);

  const handleDeleteTimeSlot = useCallback((goalId: string, slotId: string) => {
    const updatedGoals = goals.map(goal => {
      if (goal.id === goalId) {
        return {
          ...goal,
          timeSlots: goal.timeSlots.filter(slot => slot.id !== slotId),
          updatedAt: new Date().toISOString(),
        };
      }
      return goal;
    });
    onGoalsChange(updatedGoals);
  }, [goals, onGoalsChange]);

  const getGoalProgress = (goal: GoalItem) => {
    if (goal.timeSlots.length === 0) return 0;
    const completedSlots = goal.timeSlots.filter(slot => slot.status === 'done').length;
    return Math.round((completedSlots / goal.timeSlots.length) * 100);
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 flex items-center gap-2">
          <Target className="w-5 h-5" />
          Goals ({goals.length})
        </h3>
      </div>

      {/* Add new goal */}
      <div className="space-y-2">
        {editingId === 'new' ? (
          <div className="space-y-2">
            <input
              type="text"
              value={newGoalTitle}
              onChange={(e) => setNewGoalTitle(e.target.value)}
              placeholder="Enter goal title..."
              maxLength={MAX_TITLE_LENGTH}
              className="w-full px-3 py-2 text-sm bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              autoFocus
              onKeyDown={(e) => {
                if (e.key === 'Enter') handleAddGoal();
                if (e.key === 'Escape') {
                  setNewGoalTitle('');
                  setEditingId(null);
                }
              }}
            />
            <div className="flex gap-2">
              <button
                type="button"
                onClick={handleAddGoal}
                disabled={!newGoalTitle.trim() || disabled}
                className="px-3 py-1 text-xs bg-blue-100 text-blue-700 rounded hover:bg-blue-200 disabled:opacity-50"
              >
                Add Goal
              </button>
              <button
                type="button"
                onClick={() => {
                  setNewGoalTitle('');
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
            className="w-full p-3 border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg text-gray-500 dark:text-gray-400 hover:border-blue-400 hover:text-blue-500 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
          >
            <Plus className="w-4 h-4" />
            Add New Goal
          </button>
        )}
      </div>

      {/* Goals list */}
      <div className="space-y-3">
        {goals.map((goal, index) => {
          const progress = getGoalProgress(goal);
          const selectedTimes = goal.timeSlots.map(slot => slot.startTime);
          const availableTimes = availableTimeSlots.filter(time => !selectedTimes.includes(time));

          return (
            <div
              key={goal.id}
              className={cn(
                'p-4 border rounded-lg bg-white dark:bg-gray-800 transition-all',
                goal.status === 'done' && 'border-green-200 bg-green-50 dark:bg-green-900/20',
                goal.status === 'not_done' && 'border-red-200 bg-red-50 dark:bg-red-900/20',
                disabled && 'opacity-75'
              )}
            >
              {/* Goal header */}
              <div className="flex items-start justify-between gap-3">
                <div className="flex-1 min-w-0">
                  <input
                    type="text"
                    value={goal.title}
                    onChange={(e) => handleGoalTitleChange(goal.id, e.target.value)}
                    disabled={disabled}
                    className="w-full px-2 py-1 text-sm font-medium bg-transparent border-none focus:outline-none focus:ring-1 focus:ring-blue-500 rounded disabled:cursor-not-allowed"
                    placeholder="Goal title..."
                  />
                  
                  {/* Progress indicator */}
                  {goal.timeSlots.length > 0 && (
                    <div className="mt-2 flex items-center gap-2">
                      <div className="flex-1 bg-gray-200 dark:bg-gray-700 rounded-full h-1.5">
                        <div
                          className="h-1.5 bg-blue-500 rounded-full transition-all"
                          style={{ width: `${progress}%` }}
                        />
                      </div>
                      <span className="text-xs text-gray-500 dark:text-gray-400">
                        {goal.timeSlots.filter(slot => slot.status === 'done').length}/{goal.timeSlots.length} completed
                      </span>
                    </div>
                  )}
                </div>

                <div className="flex items-center gap-2">
                  {/* Goal status toggle */}
                  <TriStateToggle
                    status={goal.status}
                    onChange={(status) => handleGoalStatusChange(goal.id, status)}
                    disabled={disabled}
                    size="sm"
                  />

                  {/* Move buttons */}
                  <div className="flex flex-col">
                    <button
                      type="button"
                      onClick={() => onMoveGoal(goal.id, 'up')}
                      disabled={disabled || index === 0}
                      className="p-1 text-gray-400 hover:text-gray-600 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      <ChevronUp className="w-3 h-3" />
                    </button>
                    <button
                      type="button"
                      onClick={() => onMoveGoal(goal.id, 'down')}
                      disabled={disabled || index === goals.length - 1}
                      className="p-1 text-gray-400 hover:text-gray-600 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      <ChevronDown className="w-3 h-3" />
                    </button>
                  </div>

                  {/* Delete button */}
                  <button
                    type="button"
                    onClick={() => onDeleteGoal(goal.id)}
                    disabled={disabled}
                    className="p-1 text-red-400 hover:text-red-600 disabled:opacity-50"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>

              {/* Time slots */}
              <div className="mt-3 space-y-2">
                {goal.timeSlots.map((timeSlot) => (
                  <div
                    key={timeSlot.id}
                    className="flex items-center gap-3 p-2 bg-gray-50 dark:bg-gray-700 rounded"
                  >
                    <Clock className="w-4 h-4 text-gray-500" />
                    <TimeSelect
                      selectedTime={timeSlot.startTime}
                      onTimeChange={(time) => handleTimeSlotChange(goal.id, timeSlot.id, time)}
                      disabled={disabled}
                    />
                    <TriStateToggle
                      status={timeSlot.status}
                      onChange={(status) => handleTimeSlotStatusChange(goal.id, timeSlot.id, status)}
                      disabled={disabled}
                      size="sm"
                    />
                    <button
                      type="button"
                      onClick={() => handleDeleteTimeSlot(goal.id, timeSlot.id)}
                      disabled={disabled}
                      className="p-1 text-red-400 hover:text-red-600 disabled:opacity-50"
                    >
                      <Trash2 className="w-3 h-3" />
                    </button>
                  </div>
                ))}

                {/* Add time slot button */}
                <button
                  type="button"
                  onClick={() => handleAddTimeSlot(goal.id)}
                  disabled={disabled || availableTimes.length === 0}
                  className="w-full p-2 text-sm text-blue-600 dark:text-blue-400 border border-blue-200 dark:border-blue-700 rounded hover:bg-blue-50 dark:hover:bg-blue-900/20 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                >
                  <Plus className="w-3 h-3" />
                  Add Time Slot
                  {availableTimes.length === 0 && '(All times used)'}
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {goals.length === 0 && (
        <div className="text-center py-8 text-gray-500 dark:text-gray-400">
          <Target className="w-8 h-8 mx-auto mb-2 opacity-50" />
          <p>No goals set for today yet.</p>
          <p className="text-sm">Add your first goal to get started!</p>
        </div>
      )}
    </div>
  );
};

export default GoalsList;
