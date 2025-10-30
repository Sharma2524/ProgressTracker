import React, { useState, useCallback } from 'react';
import { format, startOfMonth, endOfMonth, startOfWeek, endOfWeek, addDays, isSameMonth, isSameDay, parseISO } from 'date-fns';
import { ChevronLeft, ChevronRight, Calendar as CalendarIcon } from 'lucide-react';
import { cn } from '../lib/utils';

interface CalendarProps {
  selectedDate: string;
  onDateChange: (date: string) => void;
  recordsMap: Record<string, { goals: number; priorities: number; hasJournal: boolean }>;
  className?: string;
}

export const Calendar: React.FC<CalendarProps> = ({
  selectedDate,
  onDateChange,
  recordsMap,
  className,
}) => {
  const [currentMonth, setCurrentMonth] = useState(parseISO(selectedDate));
  const [viewMode, setViewMode] = useState<'month' | 'week'>('month');

  const getMonthDays = useCallback((date: Date) => {
    const monthStart = startOfMonth(date);
    const monthEnd = endOfMonth(date);
    const calendarStart = startOfWeek(monthStart);
    const calendarEnd = endOfWeek(monthEnd);

    const days = [];
    let current = calendarStart;

    while (current <= calendarEnd) {
      days.push(current);
      current = addDays(current, 1);
    }

    return days;
  }, []);

  const getWeekDays = useCallback((date: Date) => {
    const weekStart = startOfWeek(date);
    const days = [];
    for (let i = 0; i < 7; i++) {
      days.push(addDays(weekStart, i));
    }
    return days;
  }, []);

  const navigateMonth = useCallback((direction: 'prev' | 'next') => {
    setCurrentMonth(prev => {
      const newDate = new Date(prev);
      newDate.setMonth(newDate.getMonth() + (direction === 'next' ? 1 : -1));
      return newDate;
    });
  }, []);

  const handleDateClick = useCallback((date: Date) => {
    const dateString = format(date, 'yyyy-MM-dd');
    onDateChange(dateString);
  }, [onDateChange]);

  const navigateToPreviousMonth = useCallback(() => {
    navigateMonth('prev');
  }, [navigateMonth]);

  const navigateToNextMonth = useCallback(() => {
    navigateMonth('next');
  }, [navigateMonth]);

  const goToToday = useCallback(() => {
    const today = new Date();
    setCurrentMonth(today);
    onDateChange(format(today, 'yyyy-MM-dd'));
  }, [onDateChange]);

  const monthDays = viewMode === 'month' ? getMonthDays(currentMonth) : getWeekDays(currentMonth);
  const selectedDateObj = parseISO(selectedDate);

  const getDayRecord = (date: Date) => {
    const dateString = format(date, 'yyyy-MM-dd');
    return recordsMap[dateString];
  };

  const getDayIndicators = (date: Date) => {
    const record = getDayRecord(date);
    if (!record) return { hasGoals: false, hasPriorities: false, hasJournal: false };

    return {
      hasGoals: record.goals > 0,
      hasPriorities: record.priorities > 0,
      hasJournal: record.hasJournal,
    };
  };

  return (
    <div className={cn('bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700', className)}>
      {/* Header */}
      <div className="p-4 border-b border-gray-200 dark:border-gray-700">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <CalendarIcon className="w-5 h-5 text-gray-500" />
            <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
              {format(currentMonth, 'MMMM yyyy')}
            </h2>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setViewMode(viewMode === 'month' ? 'week' : 'month')}
              className="px-3 py-1 text-sm bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 rounded hover:bg-gray-200 dark:hover:bg-gray-600"
            >
              {viewMode === 'month' ? 'Week' : 'Month'}
            </button>
            <button
              onClick={goToToday}
              className="px-3 py-1 text-sm bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-300 rounded hover:bg-blue-200 dark:hover:bg-blue-800"
            >
              Today
            </button>
          </div>
        </div>

        {/* Navigation */}
        <div className="flex items-center justify-between mt-3">
          <button
            onClick={navigateToPreviousMonth}
            className="p-2 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>

          <div className="flex gap-1">
            {/* Week day headers */}
            {viewMode === 'month' && (
              <div className="grid grid-cols-7 gap-1 w-full">
                {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
                  <div key={day} className="p-2 text-center text-xs font-medium text-gray-500 dark:text-gray-400">
                    {day}
                  </div>
                ))}
              </div>
            )}
          </div>

          <button
            onClick={navigateToNextMonth}
            className="p-2 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
          >
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Calendar grid */}
      <div className="p-4">
        {viewMode === 'month' ? (
          <div className="grid grid-cols-7 gap-1">
            {monthDays.map((date) => {
              const isCurrentMonth = isSameMonth(date, currentMonth);
              const isSelected = isSameDay(date, selectedDateObj);
              const isToday = isSameDay(date, new Date());
              const indicators = getDayIndicators(date);
              const record = getDayRecord(date);

              return (
                <button
                  key={date.toISOString()}
                  onClick={() => handleDateClick(date)}
                  className={cn(
                    'relative p-2 text-sm border rounded-lg transition-all hover:bg-gray-50 dark:hover:bg-gray-700',
                    isSelected && 'ring-2 ring-blue-500 border-blue-500 bg-blue-50 dark:bg-blue-900/20',
                    isToday && !isSelected && 'border-blue-400 bg-blue-50 dark:bg-blue-900/20',
                    !isCurrentMonth && 'text-gray-400 dark:text-gray-600 opacity-50',
                    !isSelected && !isToday && 'border-gray-200 dark:border-gray-600',
                    'min-h-[40px]'
                  )}
                >
                  <div className="font-medium">
                    {format(date, 'd')}
                  </div>
                  
                  {/* Indicators */}
                  <div className="absolute bottom-1 left-1 right-1 flex justify-center gap-1">
                    {record && (
                      <>
                        {indicators.hasGoals && (
                          <div className="w-1.5 h-1.5 bg-green-500 rounded-full" />
                        )}
                        {indicators.hasPriorities && (
                          <div className="w-1.5 h-1.5 bg-blue-500 rounded-full" />
                        )}
                        {indicators.hasJournal && (
                          <div className="w-1.5 h-1.5 bg-yellow-500 rounded-full" />
                        )}
                      </>
                    )}
                  </div>

                  {/* Progress indicator */}
                  {record && record.goals + record.priorities > 0 && (
                    <div className="absolute top-1 right-1">
                      <div className="w-2 h-2 bg-green-500 rounded-full opacity-80" />
                    </div>
                  )}
                </button>
              );
            })}
          </div>
        ) : (
          // Week view
          <div className="space-y-2">
            {getWeekDays(currentMonth).map((date) => {
              const isCurrentMonth = isSameMonth(date, currentMonth);
              const isSelected = isSameDay(date, selectedDateObj);
              const isToday = isSameDay(date, new Date());
              const record = getDayRecord(date);
              const indicators = getDayIndicators(date);

              return (
                <button
                  key={date.toISOString()}
                  onClick={() => handleDateClick(date)}
                  className={cn(
                    'w-full p-3 text-left border rounded-lg transition-all hover:bg-gray-50 dark:hover:bg-gray-700',
                    isSelected && 'ring-2 ring-blue-500 border-blue-500 bg-blue-50 dark:bg-blue-900/20',
                    isToday && !isSelected && 'border-blue-400 bg-blue-50 dark:bg-blue-900/20',
                    !isCurrentMonth && 'opacity-50',
                    !isSelected && !isToday && 'border-gray-200 dark:border-gray-600'
                  )}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="text-sm font-medium">
                        {format(date, 'EEEE, MMM d')}
                      </div>
                      {isToday && (
                        <span className="px-2 py-1 text-xs bg-blue-100 text-blue-700 rounded">
                          Today
                        </span>
                      )}
                    </div>

                    <div className="flex items-center gap-2">
                      {record && (
                        <>
                          {indicators.hasGoals && (
                            <div className="flex items-center gap-1 text-xs text-gray-600 dark:text-gray-300">
                              <div className="w-2 h-2 bg-green-500 rounded-full" />
                              <span>{record.goals} goals</span>
                            </div>
                          )}
                          {indicators.hasPriorities && (
                            <div className="flex items-center gap-1 text-xs text-gray-600 dark:text-gray-300">
                              <div className="w-2 h-2 bg-blue-500 rounded-full" />
                              <span>{record.priorities} priorities</span>
                            </div>
                          )}
                          {indicators.hasJournal && (
                            <div className="w-2 h-2 bg-yellow-500 rounded-full" />
                          )}
                        </>
                      )}
                    </div>
                  </div>
                </button>
              );
            })}
          </div>
        )}
      </div>

      {/* Legend */}
      <div className="p-4 border-t border-gray-200 dark:border-gray-700">
        <div className="flex items-center justify-center gap-4 text-xs text-gray-500 dark:text-gray-400">
          <div className="flex items-center gap-1">
            <div className="w-2 h-2 bg-green-500 rounded-full" />
            <span>Goals</span>
          </div>
          <div className="flex items-center gap-1">
            <div className="w-2 h-2 bg-blue-500 rounded-full" />
            <span>Priorities</span>
          </div>
          <div className="flex items-center gap-1">
            <div className="w-2 h-2 bg-yellow-500 rounded-full" />
            <span>Journal</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Calendar;
