// Core data types for the Daily Progress Tracker

export type GoalStatus = 'neutral' | 'done' | 'not_done';

export interface GoalItem {
  id: string;
  title: string;
  timeSlots: TimeSlot[];
  status: GoalStatus;
  createdAt: string;
  updatedAt: string;
}

export interface TimeSlot {
  id: string;
  startTime: string; // Format: "HH:mm" (24-hour format)
  endTime: string;   // Format: "HH:mm" (24-hour format)
  status: GoalStatus;
}

export interface PriorityItem {
  id: string;
  title: string;
  status: GoalStatus;
  createdAt: string;
  updatedAt: string;
}

export interface OverdueTaskItem {
  id: string;
  title: string;
  status: GoalStatus;
  createdAt: string;
  updatedAt: string;
  // Auto-generated overdue task tracking
  originalDate?: string;
  originalType?: 'goal' | 'priority' | 'overdue';
  originalId?: string;
  source?: 'auto' | 'manual';
}

export interface JournalEntry {
  content: string;
  wordCount: number;
  lastModified: string;
}

export interface DailyRecord {
  id: string;
  date: string; // Format: "YYYY-MM-DD"
  goals: GoalItem[];
  priorities: PriorityItem[];
  overdue_tasks: OverdueTaskItem[];
  journal: JournalEntry;
  createdAt: string;
  updatedAt: string;
}

export interface BackupData {
  records: DailyRecord[];
  exportDate: string;
  version: string;
}

// Hook return types
export interface UseDailyRecordReturn {
  record: DailyRecord | null;
  isLoading: boolean;
  error: Error | null;
  refetch: () => void;
}

export interface UseSaveDailyRecordReturn {
  isSaving: boolean;
  saveRecord: (record: DailyRecord) => Promise<void>;
  lastSaved: Date | null;
}

// IndexedDB types
export interface IDBGoalItem {
  id: string;
  title: string;
  timeSlots: IDBTimeSlot[];
  status: GoalStatus;
  createdAt: string;
  updatedAt: string;
}

export interface IDBTimeSlot {
  id: string;
  startTime: string;
  endTime: string;
  status: GoalStatus;
}

export interface IDBPriorityItem {
  id: string;
  title: string;
  status: GoalStatus;
  createdAt: string;
  updatedAt: string;
}

export interface IDBOverdueTaskItem {
  id: string;
  title: string;
  status: GoalStatus;
  createdAt: string;
  updatedAt: string;
  // Auto-generated overdue task tracking
  originalDate?: string;
  originalType?: 'goal' | 'priority' | 'overdue';
  originalId?: string;
  source?: 'auto' | 'manual';
}

export interface IDBJournalEntry {
  content: string;
  wordCount: number;
  lastModified: string;
}

export interface IDBDailyRecord {
  id: string;
  date: string;
  goals: IDBGoalItem[];
  priorities: IDBPriorityItem[];
  overdue_tasks: IDBOverdueTaskItem[];
  journal: IDBJournalEntry;
  createdAt: string;
  updatedAt: string;
}

// Component prop types
export interface TriStateToggleProps {
  status: GoalStatus;
  onChange: (status: GoalStatus) => void;
  size?: 'sm' | 'md' | 'lg';
  disabled?: boolean;
}

export interface TimeSelectProps {
  selectedTime: string;
  onTimeChange: (time: string) => void;
  disabled?: boolean;
  className?: string;
}

export interface GoalsListProps {
  goals: GoalItem[];
  onGoalsChange: (goals: GoalItem[]) => void;
  onDeleteGoal: (goalId: string) => void;
  onMoveGoal: (goalId: string, direction: 'up' | 'down') => void;
  availableTimeSlots: string[];
}

export interface ItemListProps {
  items: PriorityItem[];
  onItemsChange: (items: PriorityItem[]) => void;
  onDeleteItem: (itemId: string) => void;
  onMoveItem: (itemId: string, direction: 'up' | 'down') => void;
  type: 'priority' | 'other';
}

export interface OverdueTasksListProps {
  tasks: OverdueTaskItem[];
  onTasksChange: (tasks: OverdueTaskItem[]) => void;
  onDeleteTask: (taskId: string) => void;
  onMoveTask: (taskId: string, direction: 'up' | 'down') => void;
  disabled?: boolean;
}

export interface JournalEditorProps {
  content: string;
  wordCount: number;
  onChange: (content: string) => void;
  placeholder?: string;
  disabled?: boolean;
  className?: string;
}

export interface DailyRecordViewProps {
  record: DailyRecord;
  onRecordChange: (record: DailyRecord) => void;
  isReadOnly?: boolean;
}

export interface CalendarProps {
  selectedDate: string;
  onDateChange: (date: string) => void;
  recordsMap: Record<string, DailyRecord | undefined>;
  className?: string;
}

// Utility types
export type TimeSlotLabel = '6:00 AM' | '6:30 AM' | '7:00 AM' | '7:30 AM' | '8:00 AM' | '8:30 AM' | '9:00 AM' | '9:30 AM' | '10:00 AM' | '10:30 AM' | '11:00 AM' | '11:30 AM' | '12:00 PM' | '12:30 PM' | '1:00 PM' | '1:30 PM' | '2:00 PM' | '2:30 PM' | '3:00 PM' | '3:30 PM' | '4:00 PM' | '4:30 PM' | '5:00 PM' | '5:30 PM' | '6:00 PM' | '6:30 PM' | '7:00 PM' | '7:30 PM' | '8:00 PM' | '8:30 PM' | '9:00 PM' | '9:30 PM' | '10:00 PM' | '10:30 PM' | '11:00 PM' | '11:30 PM' | '12:00 AM' | '12:30 AM' | '1:00 AM' | '1:30 AM' | '2:00 AM' | '2:30 AM' | '3:00 AM';

export interface DateNavigationProps {
  currentDate: string;
  onDateChange: (date: string) => void;
  className?: string;
}

// Theme and UI types
export interface ThemeContextType {
  theme: 'light' | 'dark' | 'system';
  setTheme: (theme: 'light' | 'dark' | 'system') => void;
  actualTheme: 'light' | 'dark';
}

// Error types
export interface AppError {
  code: string;
  message: string;
  details?: any;
}
