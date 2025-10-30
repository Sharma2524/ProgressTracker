import { clsx, ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';
import { format, parseISO, isValid, addDays, subDays, startOfMonth, endOfMonth, eachDayOfInterval } from 'date-fns';
import { GoalItem, PriorityItem, OverdueTaskItem, DailyRecord, IDBDailyRecord, IDBGoalItem, IDBPriorityItem, IDBOverdueTaskItem, TimeSlot, IDBTimeSlot } from '../types';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

// Date utilities
export const formatDate = (date: string | Date, formatString: string = 'yyyy-MM-dd'): string => {
  try {
    const dateObj = typeof date === 'string' ? parseISO(date) : date;
    if (!isValid(dateObj)) {
      throw new Error('Invalid date');
    }
    return format(dateObj, formatString);
  } catch (error) {
    console.error('Error formatting date:', error);
    return new Date().toISOString().split('T')[0];
  }
};

export const getTodayDate = (): string => {
  return new Date().toISOString().split('T')[0];
};

export const getDateFromNow = (days: number): string => {
  const date = addDays(new Date(), days);
  return formatDate(date);
};

export const getPreviousDate = (date: string): string => {
  return formatDate(subDays(parseISO(date), 1));
};

export const getNextDate = (date: string): string => {
  return formatDate(addDays(parseISO(date), 1));
};

export const getMonthDateRange = (date: string): { start: string; end: string } => {
  const dateObj = parseISO(date);
  return {
    start: formatDate(startOfMonth(dateObj)),
    end: formatDate(endOfMonth(dateObj))
  };
};

export const getDaysInMonth = (date: string): string[] => {
  const { start, end } = getMonthDateRange(date);
  const days = eachDayOfInterval({
    start: parseISO(start),
    end: parseISO(end)
  });
  return days.map(day => formatDate(day));
};

// IDB conversion utilities
export const convertToIDB = (record: DailyRecord): IDBDailyRecord => {
  return {
    id: record.id,
    date: record.date,
    goals: record.goals.map(convertGoalToIDB),
    priorities: record.priorities.map(convertPriorityToIDB),
    overdue_tasks: record.overdue_tasks.map(convertOverdueTaskToIDB),
    journal: {
      content: record.journal.content,
      wordCount: record.journal.wordCount,
      lastModified: record.journal.lastModified
    },
    createdAt: record.createdAt,
    updatedAt: record.updatedAt
  };
};

export const convertFromIDB = (idbRecord: IDBDailyRecord): DailyRecord => {
  return {
    id: idbRecord.id,
    date: idbRecord.date,
    goals: idbRecord.goals.map(convertGoalFromIDB),
    priorities: idbRecord.priorities.map(convertPriorityFromIDB),
    overdue_tasks: idbRecord.overdue_tasks ? idbRecord.overdue_tasks.map(convertOverdueTaskFromIDB) : [],
    journal: {
      content: idbRecord.journal.content,
      wordCount: idbRecord.journal.wordCount,
      lastModified: idbRecord.journal.lastModified
    },
    createdAt: idbRecord.createdAt,
    updatedAt: idbRecord.updatedAt
  };
};

const convertGoalToIDB = (goal: GoalItem): IDBGoalItem => {
  return {
    id: goal.id,
    title: goal.title,
    timeSlots: goal.timeSlots.map(convertTimeSlotToIDB),
    status: goal.status,
    createdAt: goal.createdAt,
    updatedAt: goal.updatedAt
  };
};

const convertGoalFromIDB = (idbGoal: IDBGoalItem): GoalItem => {
  return {
    id: idbGoal.id,
    title: idbGoal.title,
    timeSlots: idbGoal.timeSlots.map(convertTimeSlotFromIDB),
    status: idbGoal.status,
    createdAt: idbGoal.createdAt,
    updatedAt: idbGoal.updatedAt
  };
};

const convertTimeSlotToIDB = (slot: TimeSlot): IDBTimeSlot => {
  return {
    id: slot.id,
    startTime: slot.startTime,
    endTime: slot.endTime,
    status: slot.status
  };
};

const convertTimeSlotFromIDB = (idbSlot: IDBTimeSlot): TimeSlot => {
  return {
    id: idbSlot.id,
    startTime: idbSlot.startTime,
    endTime: idbSlot.endTime,
    status: idbSlot.status
  };
};

const convertPriorityToIDB = (priority: PriorityItem): IDBPriorityItem => {
  return {
    id: priority.id,
    title: priority.title,
    status: priority.status,
    createdAt: priority.createdAt,
    updatedAt: priority.updatedAt
  };
};

const convertPriorityFromIDB = (idbPriority: IDBPriorityItem): PriorityItem => {
  return {
    id: idbPriority.id,
    title: idbPriority.title,
    status: idbPriority.status,
    createdAt: idbPriority.createdAt,
    updatedAt: idbPriority.updatedAt
  };
};

const convertOverdueTaskToIDB = (task: OverdueTaskItem): IDBOverdueTaskItem => {
  return {
    id: task.id,
    title: task.title,
    status: task.status,
    createdAt: task.createdAt,
    updatedAt: task.updatedAt,
    originalDate: task.originalDate,
    originalType: task.originalType,
    originalId: task.originalId,
    source: task.source
  };
};

const convertOverdueTaskFromIDB = (idbTask: IDBOverdueTaskItem): OverdueTaskItem => {
  return {
    id: idbTask.id,
    title: idbTask.title,
    status: idbTask.status,
    createdAt: idbTask.createdAt,
    updatedAt: idbTask.updatedAt,
    originalDate: idbTask.originalDate,
    originalType: idbTask.originalType,
    originalId: idbTask.originalId,
    source: idbTask.source
  };
};

// Record creation utilities
export const createEmptyRecord = (date: string): DailyRecord => {
  const now = new Date().toISOString();
  return {
    id: `record-${date}`,
    date,
    goals: [],
    priorities: [],
    overdue_tasks: [],
    journal: {
      content: '',
      wordCount: 0,
      lastModified: now
    },
    createdAt: now,
    updatedAt: now
  };
};

export const generateId = (): string => {
  return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
};

// Text utilities
export const countWords = (text: string): number => {
  if (!text.trim()) return 0;
  return text.trim().split(/\s+/).length;
};

export const truncateText = (text: string, maxLength: number): string => {
  if (text.length <= maxLength) return text;
  return text.substring(0, maxLength).trim() + '...';
};

// Validation utilities
export const isValidTitle = (title: string): boolean => {
  return title.trim().length >= 1 && title.trim().length <= 100;
};

export const isValidDate = (date: string): boolean => {
  try {
    const dateObj = parseISO(date);
    return isValid(dateObj);
  } catch {
    return false;
  }
};

// Search utilities
export const searchRecords = (records: DailyRecord[], query: string): DailyRecord[] => {
  if (!query.trim()) return records;
  
  const searchTerm = query.toLowerCase();
  return records.filter(record => {
    // Search in goals
    const goalsMatch = record.goals.some(goal => 
      goal.title.toLowerCase().includes(searchTerm)
    );
    
    // Search in priorities
    const prioritiesMatch = record.priorities.some(priority => 
      priority.title.toLowerCase().includes(searchTerm)
    );
    
    // Search in overdue tasks
    const overdueTasksMatch = record.overdue_tasks.some(task => 
      task.title.toLowerCase().includes(searchTerm)
    );
    
    // Search in journal
    const journalMatch = record.journal.content.toLowerCase().includes(searchTerm);
    
    return goalsMatch || prioritiesMatch || overdueTasksMatch || journalMatch;
  });
};

// Time utilities
export const getTimeSlotFrom24Hour = (time24: string): { label: string; nextSlot: string | null } => {
  // Convert 24-hour format to next 30-minute slot
  const [hours, minutes] = time24.split(':').map(Number);
  const totalMinutes = hours * 60 + minutes;
  
  // Add 30 minutes
  const nextTotalMinutes = totalMinutes + 30;
  const nextHours = Math.floor(nextTotalMinutes / 60) % 24;
  const nextMins = nextTotalMinutes % 60;
  
  const nextSlot = `${nextHours.toString().padStart(2, '0')}:${nextMins.toString().padStart(2, '0')}`;
  
  return {
    label: time24,
    nextSlot: nextTotalMinutes >= (24 * 60) ? null : nextSlot
  };
};

// Debounce utility
export const debounce = <T extends (...args: any[]) => any>(
  func: T,
  delay: number
): (...args: Parameters<T>) => void => {
  let timeoutId: NodeJS.Timeout;
  
  return (...args: Parameters<T>) => {
    clearTimeout(timeoutId);
    timeoutId = setTimeout(() => func(...args), delay);
  };
};

// Local storage utilities
export const saveToLocalStorage = <T>(key: string, data: T): void => {
  try {
    localStorage.setItem(key, JSON.stringify(data));
  } catch (error) {
    console.error('Error saving to localStorage:', error);
  }
};

export const loadFromLocalStorage = <T>(key: string, defaultValue: T): T => {
  try {
    const item = localStorage.getItem(key);
    return item ? JSON.parse(item) : defaultValue;
  } catch (error) {
    console.error('Error loading from localStorage:', error);
    return defaultValue;
  }
};

// Array utilities
export const moveItem = <T>(array: T[], fromIndex: number, toIndex: number): T[] => {
  if (fromIndex < 0 || fromIndex >= array.length || toIndex < 0 || toIndex >= array.length) {
    return array;
  }
  
  const result = [...array];
  const [movedItem] = result.splice(fromIndex, 1);
  result.splice(toIndex, 0, movedItem);
  
  return result;
};

export const removeItem = <T>(array: T[], index: number): T[] => {
  if (index < 0 || index >= array.length) {
    return array;
  }
  
  return array.filter((_, i) => i !== index);
};

// Color utilities for status indicators
export const getStatusColor = (status: 'neutral' | 'done' | 'not_done', isDark: boolean = false): string => {
  const base = isDark ? 'dark' : 'light';
  switch (status) {
    case 'done':
      return `bg-green-500 text-white`;
    case 'not_done':
      return `bg-red-500 text-white`;
    default:
      return isDark ? 'bg-gray-700 text-gray-200' : 'bg-gray-200 text-gray-700';
  }
};

// Overdue task utilities
export interface OverdueSource {
  date: string;
  type: 'goal' | 'priority' | 'overdue';
  id: string;
  title: string;
}

/**
 * Generate overdue tasks from incomplete items in previous days
 */
export const generateOverdueTasks = (
  currentDate: string,
  allRecords: DailyRecord[],
  existingOverdueTasks: OverdueTaskItem[]
): OverdueTaskItem[] => {
  const overdueTasks: OverdueTaskItem[] = [];
  const existingAutoOverdueReferences = new Set(
    existingOverdueTasks
      .filter(task => task.source === 'auto')
      .map(task => `${task.originalDate}-${task.originalType}-${task.originalId}`)
  );

  // Find all incomplete items from previous dates
  for (const record of allRecords) {
    if (record.date >= currentDate) continue; // Skip current and future dates

    // Check incomplete goals
    for (const goal of record.goals) {
      const reference = `${record.date}-goal-${goal.id}`;
      if (goal.status !== 'done' && !existingAutoOverdueReferences.has(reference)) {
        overdueTasks.push({
          id: generateId(),
          title: goal.title,
          status: goal.status,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
          originalDate: record.date,
          originalType: 'goal',
          originalId: goal.id,
          source: 'auto'
        });
        existingAutoOverdueReferences.add(reference);
      }
    }

    // Check incomplete priorities
    for (const priority of record.priorities) {
      const reference = `${record.date}-priority-${priority.id}`;
      if (priority.status !== 'done' && !existingAutoOverdueReferences.has(reference)) {
        overdueTasks.push({
          id: generateId(),
          title: priority.title,
          status: priority.status,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
          originalDate: record.date,
          originalType: 'priority',
          originalId: priority.id,
          source: 'auto'
        });
        existingAutoOverdueReferences.add(reference);
      }
    }

    // Check incomplete overdue tasks from previous days
    for (const task of record.overdue_tasks) {
      const reference = `${record.date}-overdue-${task.id}`;
      if (task.status !== 'done' && !existingAutoOverdueReferences.has(reference)) {
        overdueTasks.push({
          id: generateId(),
          title: task.title,
          status: task.status,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
          originalDate: record.date,
          originalType: 'overdue',
          originalId: task.id,
          source: 'auto'
        });
        existingAutoOverdueReferences.add(reference);
      }
    }
  }

  return overdueTasks;
};

/**
 * Update original item when an auto-generated overdue task is completed
 */
export const updateOriginalItem = (
  overdueTask: OverdueTaskItem,
  allRecords: DailyRecord[],
  newStatus: 'neutral' | 'done' | 'not_done'
): DailyRecord[] => {
  if (!overdueTask.source || overdueTask.source !== 'auto' || !overdueTask.originalDate || !overdueTask.originalId) {
    return allRecords;
  }

  return allRecords.map(record => {
    if (record.date !== overdueTask.originalDate) {
      return record;
    }

    let updatedRecord = { ...record };

    switch (overdueTask.originalType) {
      case 'goal':
        updatedRecord.goals = record.goals.map(goal => 
          goal.id === overdueTask.originalId
            ? { ...goal, status: newStatus, updatedAt: new Date().toISOString() }
            : goal
        );
        break;
      case 'priority':
        updatedRecord.priorities = record.priorities.map(priority => 
          priority.id === overdueTask.originalId
            ? { ...priority, status: newStatus, updatedAt: new Date().toISOString() }
            : priority
        );
        break;
      case 'overdue':
        updatedRecord.overdue_tasks = record.overdue_tasks.map(task => 
          task.id === overdueTask.originalId
            ? { ...task, status: newStatus, updatedAt: new Date().toISOString() }
            : task
        );
        break;
    }

    updatedRecord.updatedAt = new Date().toISOString();
    return updatedRecord;
  });
};

/**
 * Format overdue task source for display
 */
export const formatOverdueSource = (overdueTask: OverdueTaskItem): string => {
  if (!overdueTask.originalDate) return '';
  
  const originalDate = new Date(overdueTask.originalDate);
  const isSameMonth = originalDate.getMonth() === new Date().getMonth();
  
  if (isSameMonth) {
    return `From ${originalDate.toLocaleDateString('en-US', { day: 'numeric', weekday: 'short' })}`;
  } else {
    return `From ${originalDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}`;
  }
};
