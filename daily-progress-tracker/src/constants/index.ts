import { TimeSlotLabel, DailyRecord } from '../types';

// Time slots configuration
export const TIME_SLOTS: TimeSlotLabel[] = [
  '6:00 AM', '6:30 AM', '7:00 AM', '7:30 AM', '8:00 AM', '8:30 AM',
  '9:00 AM', '9:30 AM', '10:00 AM', '10:30 AM', '11:00 AM', '11:30 AM',
  '12:00 PM', '12:30 PM', '1:00 PM', '1:30 PM', '2:00 PM', '2:30 PM',
  '3:00 PM', '3:30 PM', '4:00 PM', '4:30 PM', '5:00 PM', '5:30 PM',
  '6:00 PM', '6:30 PM', '7:00 PM', '7:30 PM', '8:00 PM', '8:30 PM',
  '9:00 PM', '9:30 PM', '10:00 PM', '10:30 PM', '11:00 PM', '11:30 PM',
  '12:00 AM', '12:30 AM', '1:00 AM', '1:30 AM', '2:00 AM', '2:30 AM', '3:00 AM'
];

// Time slot labels (12-hour format with AM/PM)
export const TIME_SLOT_LABELS: Record<string, string> = {
  '06:00': '6:00 AM',
  '06:30': '6:30 AM',
  '07:00': '7:00 AM',
  '07:30': '7:30 AM',
  '08:00': '8:00 AM',
  '08:30': '8:30 AM',
  '09:00': '9:00 AM',
  '09:30': '9:30 AM',
  '10:00': '10:00 AM',
  '10:30': '10:30 AM',
  '11:00': '11:00 AM',
  '11:30': '11:30 AM',
  '12:00': '12:00 PM',
  '12:30': '12:30 PM',
  '13:00': '1:00 PM',
  '13:30': '1:30 PM',
  '14:00': '2:00 PM',
  '14:30': '2:30 PM',
  '15:00': '3:00 PM',
  '15:30': '3:30 PM',
  '16:00': '4:00 PM',
  '16:30': '4:30 PM',
  '17:00': '5:00 PM',
  '17:30': '5:30 PM',
  '18:00': '6:00 PM',
  '18:30': '6:30 PM',
  '19:00': '7:00 PM',
  '19:30': '7:30 PM',
  '20:00': '8:00 PM',
  '20:30': '8:30 PM',
  '21:00': '9:00 PM',
  '21:30': '9:30 PM',
  '22:00': '10:00 PM',
  '22:30': '10:30 PM',
  '23:00': '11:00 PM',
  '23:30': '11:30 PM',
  '00:00': '12:00 AM',
  '00:30': '12:30 AM',
  '01:00': '1:00 AM',
  '01:30': '1:30 AM',
  '02:00': '2:00 AM',
  '02:30': '2:30 AM',
  '03:00': '3:00 AM'
};

// Application constants
export const APP_NAME = 'Daily Progress Tracker';
export const APP_VERSION = '1.0.0';
export const STORAGE_KEY = 'daily-progress-tracker';
export const BACKUP_FILENAME = `daily-progress-backup-${new Date().toISOString().split('T')[0]}.json`;

// Database configuration
export const DB_NAME = 'DailyProgressDB';
export const DB_VERSION = 1;
export const STORE_NAME = 'dailyRecords';

// Default values
export const DEFAULT_RECORD: Partial<DailyRecord> = {
  goals: [],
  priorities: [],
  journal: {
    content: '',
    wordCount: 0,
    lastModified: new Date().toISOString()
  }
};

// UI configuration
export const THEME_STORAGE_KEY = 'daily-progress-theme';
export const CALENDAR_PAGE_SIZE = 10;
export const AUTOSAVE_DELAY = 2000; // 2 seconds

// Input limits
export const MAX_TITLE_LENGTH = 100;
export const MAX_JOURNAL_LENGTH = 10000;
export const MIN_TITLE_LENGTH = 1;

// Status colors for theming
export const STATUS_COLORS = {
  neutral: {
    light: 'bg-gray-100 text-gray-800 border-gray-300',
    dark: 'bg-gray-800 text-gray-200 border-gray-600'
  },
  done: {
    light: 'bg-green-100 text-green-800 border-green-300',
    dark: 'bg-green-900 text-green-100 border-green-700'
  },
  not_done: {
    light: 'bg-red-100 text-red-800 border-red-300',
    dark: 'bg-red-900 text-red-100 border-red-700'
  }
} as const;

// Animation durations
export const ANIMATIONS = {
  fast: 150,
  normal: 250,
  slow: 350
} as const;
