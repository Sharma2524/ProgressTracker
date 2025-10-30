import React from 'react';
import { cn } from '../lib/utils';
import { Clock } from 'lucide-react';
import { TIME_SLOT_LABELS } from '../constants';

interface TimeSelectProps {
  selectedTime: string;
  onTimeChange: (time: string) => void;
  disabled?: boolean;
  className?: string;
}

export const TimeSelect: React.FC<TimeSelectProps> = ({
  selectedTime,
  onTimeChange,
  disabled = false,
  className,
}) => {
  const timeOptions = Object.keys(TIME_SLOT_LABELS).sort();

  return (
    <div className={cn('relative', className)}>
      <div className="flex items-center gap-2">
        <Clock className="w-4 h-4 text-gray-500 dark:text-gray-400" />
        <select
          value={selectedTime}
          onChange={(e) => onTimeChange(e.target.value)}
          disabled={disabled}
          className={cn(
            'flex-1 min-w-0 px-3 py-2 text-sm bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-md',
            'focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500',
            'disabled:bg-gray-100 disabled:text-gray-500 disabled:cursor-not-allowed',
            'dark:text-gray-100 dark:placeholder-gray-400'
          )}
        >
          <option value="">Select time</option>
          {timeOptions.map((time) => (
            <option key={time} value={time}>
              {TIME_SLOT_LABELS[time]}
            </option>
          ))}
        </select>
      </div>
      
      {/* Quick time preset buttons */}
      <div className="mt-2 flex flex-wrap gap-1">
        {['06:00', '09:00', '12:00', '15:00', '18:00', '21:00'].map((time) => (
          <button
            key={time}
            type="button"
            disabled={disabled}
            onClick={() => onTimeChange(time)}
            className={cn(
              'px-2 py-1 text-xs rounded border transition-colors',
              selectedTime === time
                ? 'bg-blue-100 border-blue-300 text-blue-800 dark:bg-blue-900 dark:border-blue-700 dark:text-blue-200'
                : 'bg-gray-50 border-gray-200 text-gray-600 hover:bg-gray-100 dark:bg-gray-700 dark:border-gray-600 dark:text-gray-300 dark:hover:bg-gray-600',
              'disabled:cursor-not-allowed disabled:opacity-50'
            )}
          >
            {TIME_SLOT_LABELS[time]}
          </button>
        ))}
      </div>
    </div>
  );
};

export default TimeSelect;
