import React, { useState, useEffect, useCallback } from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Moon, Sun, Menu, X } from 'lucide-react';
import { ThemeProvider, useTheme } from './lib/theme-provider';
import Calendar from './components/Calendar';
import DailyRecordView from './components/DailyRecordView';
import { useDailyRecord, useSaveDailyRecord, useRecordsSummary } from './hooks/useRecords';
import { formatDate, getTodayDate, isValidDate, createEmptyRecord } from './lib/utils';
import { APP_NAME } from './constants';
import { DailyRecord } from './types';
import { cn } from './lib/utils';

// Create Query Client
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60 * 5, // 5 minutes
      gcTime: 1000 * 60 * 30, // 30 minutes
    },
  },
});

// Theme toggle component
function ThemeToggle() {
  const { theme, setTheme } = useTheme();

  const toggleTheme = useCallback(() => {
    setTheme(theme === 'light' ? 'dark' : 'light');
  }, [theme, setTheme]);

  return (
    <button
      onClick={toggleTheme}
      className="p-2 rounded-lg bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
      title={`Switch to ${theme === 'light' ? 'dark' : 'light'} mode`}
    >
      {theme === 'light' ? <Moon className="w-5 h-5" /> : <Sun className="w-5 h-5" />}
    </button>
  );
}

// Main app component
function App() {
  const [selectedDate, setSelectedDate] = useState(getTodayDate());
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  // Get current date record and save functionality
  const { data: record = createEmptyRecord(selectedDate), isLoading } = useDailyRecord(selectedDate);
  const { saveRecord, isSaving, lastSaved } = useSaveDailyRecord();
  const { summary: recordsSummary } = useRecordsSummary();

  // Handle date change
  const handleDateChange = useCallback((date: string) => {
    if (isValidDate(date)) {
      setSelectedDate(date);
      setIsMobileMenuOpen(false);
    }
  }, []);

  // Auto-save when record changes
  const handleRecordChange = useCallback((newRecord: DailyRecord) => {
    saveRecord(newRecord);
  }, [saveRecord]);

  // Navigation handlers
  const goToPreviousDay = useCallback(() => {
    const currentDate = new Date(selectedDate);
    const previousDate = new Date(currentDate);
    previousDate.setDate(previousDate.getDate() - 1);
    setSelectedDate(formatDate(previousDate));
  }, [selectedDate]);

  const goToNextDay = useCallback(() => {
    const currentDate = new Date(selectedDate);
    const nextDate = new Date(currentDate);
    nextDate.setDate(nextDate.getDate() + 1);
    setSelectedDate(formatDate(nextDate));
  }, [selectedDate]);

  const goToToday = useCallback(() => {
    setSelectedDate(getTodayDate());
  }, []);

  // Keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.altKey || e.ctrlKey || e.metaKey) return;
      
      switch (e.key) {
        case 'ArrowLeft':
          e.preventDefault();
          goToPreviousDay();
          break;
        case 'ArrowRight':
          e.preventDefault();
          goToNextDay();
          break;
        case 't':
        case 'T':
          e.preventDefault();
          goToToday();
          break;
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [goToPreviousDay, goToNextDay, goToToday]);

  // Prepare calendar data
  const calendarData = React.useMemo(() => {
    return recordsSummary;
  }, [recordsSummary]);

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 transition-colors">
      {/* Header */}
      <header className="sticky top-0 z-50 bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            {/* Logo and title */}
            <div className="flex items-center gap-4">
              <button
                onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                className="p-2 rounded-lg md:hidden text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
              >
                {isMobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
              </button>
              
              <div>
                <h1 className="text-xl font-bold text-gray-900 dark:text-gray-100">
                  {APP_NAME}
                </h1>
                <p className="text-xs text-gray-500 dark:text-gray-400 hidden sm:block">
                  Track your daily progress and achieve your goals
                </p>
              </div>
            </div>

            {/* Navigation and actions */}
            <div className="flex items-center gap-2">
              {/* Date navigation */}
              <div className="hidden md:flex items-center gap-2">
                <button
                  onClick={goToPreviousDay}
                  className="px-3 py-2 text-sm bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
                  title="Previous day (←)"
                >
                  ←
                </button>
                
                <button
                  onClick={goToToday}
                  className="px-3 py-2 text-sm bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-300 rounded-lg hover:bg-blue-200 dark:hover:bg-blue-800 transition-colors"
                  title="Go to today (T)"
                >
                  Today
                </button>
                
                <button
                  onClick={goToNextDay}
                  className="px-3 py-2 text-sm bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
                  title="Next day (→)"
                >
                  →
                </button>
              </div>

              {/* Current date display */}
              <div className="hidden sm:block px-4 py-2 bg-gray-100 dark:bg-gray-700 rounded-lg">
                <div className="text-sm font-medium text-gray-900 dark:text-gray-100">
                  {formatDate(selectedDate, 'MMM dd, yyyy')}
                </div>
                <div className="text-xs text-gray-500 dark:text-gray-400">
                  {formatDate(selectedDate, 'EEEE')}
                </div>
              </div>

              {/* Theme toggle */}
              <ThemeToggle />
            </div>
          </div>
        </div>

        {/* Mobile navigation */}
        {isMobileMenuOpen && (
          <div className="md:hidden border-t border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800">
            <div className="px-4 py-3 space-y-3">
              <div className="text-center text-sm font-medium text-gray-900 dark:text-gray-100">
                {formatDate(selectedDate, 'MMM dd, yyyy')} ({formatDate(selectedDate, 'EEEE')})
              </div>
              
              <div className="flex justify-center gap-2">
                <button
                  onClick={goToPreviousDay}
                  className="px-3 py-2 text-sm bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600"
                >
                  Previous
                </button>
                
                <button
                  onClick={goToToday}
                  className="px-3 py-2 text-sm bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-300 rounded-lg"
                >
                  Today
                </button>
                
                <button
                  onClick={goToNextDay}
                  className="px-3 py-2 text-sm bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600"
                >
                  Next
                </button>
              </div>

              <div className="text-xs text-gray-500 dark:text-gray-400 text-center">
                Use arrow keys (← →) or 'T' for today
              </div>
            </div>
          </div>
        )}
      </header>

      {/* Main content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="grid grid-cols-1 xl:grid-cols-4 gap-6">
          {/* Calendar sidebar */}
          <div className="xl:col-span-1">
            <div className="sticky top-20">
              <Calendar
                selectedDate={selectedDate}
                onDateChange={handleDateChange}
                recordsMap={calendarData}
              />
            </div>
          </div>

          {/* Main content area */}
          <div className="xl:col-span-3">
            {isLoading ? (
              <div className="flex items-center justify-center py-12">
                <div className="flex items-center gap-3">
                  <div className="w-6 h-6 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" />
                  <span className="text-gray-600 dark:text-gray-300">
                    Loading daily record...
                  </span>
                </div>
              </div>
            ) : (
              <DailyRecordView
                record={record}
                onRecordChange={handleRecordChange}
                onSave={() => saveRecord(record)}
                isSaving={isSaving}
                lastSaved={lastSaved}
              />
            )}
          </div>
        </div>
      </main>

      {/* Keyboard shortcuts help */}
      <div className="fixed bottom-4 right-4 hidden lg:block">
        <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-lg p-3 text-xs text-gray-600 dark:text-gray-300">
          <div className="font-medium mb-1">Keyboard Shortcuts:</div>
          <div className="space-y-1">
            <div>← → Navigate days</div>
            <div>T Go to today</div>
          </div>
        </div>
      </div>
    </div>
  );
}

// Root route component
function RootComponent() {
  return (
    <ThemeProvider defaultTheme="system" storageKey="daily-progress-theme">
      <QueryClientProvider client={queryClient}>
        <App />
      </QueryClientProvider>
    </ThemeProvider>
  );
}

export default RootComponent;
