import React, { useState, useCallback } from 'react';
import { cn } from '../lib/utils';
import { Check, X, Minus } from 'lucide-react';
import { GoalStatus } from '../types';

interface TriStateToggleProps {
  status: GoalStatus;
  onChange: (status: GoalStatus) => void;
  size?: 'sm' | 'md' | 'lg';
  disabled?: boolean;
  className?: string;
}

const statusConfig = {
  neutral: {
    icon: Minus,
    label: 'Not Started',
    bgClass: 'bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700',
    textClass: 'text-gray-600 dark:text-gray-300',
    iconClass: 'text-gray-400 dark:text-gray-500',
  },
  done: {
    icon: Check,
    label: 'Completed',
    bgClass: 'bg-green-100 dark:bg-green-900 hover:bg-green-200 dark:hover:bg-green-800',
    textClass: 'text-green-800 dark:text-green-200',
    iconClass: 'text-green-600 dark:text-green-400',
  },
  not_done: {
    icon: X,
    label: 'Not Completed',
    bgClass: 'bg-red-100 dark:bg-red-900 hover:bg-red-200 dark:hover:bg-red-800',
    textClass: 'text-red-800 dark:text-red-200',
    iconClass: 'text-red-600 dark:text-red-400',
  },
};

const sizeConfig = {
  sm: {
    button: 'p-1.5',
    icon: 'w-3 h-3',
    text: 'text-xs',
  },
  md: {
    button: 'p-2',
    icon: 'w-4 h-4',
    text: 'text-sm',
  },
  lg: {
    button: 'p-3',
    icon: 'w-5 h-5',
    text: 'text-base',
  },
};

export const TriStateToggle: React.FC<TriStateToggleProps> = ({
  status,
  onChange,
  size = 'md',
  disabled = false,
  className,
}) => {
  const [longPressTimer, setLongPressTimer] = useState<NodeJS.Timeout | null>(null);
  const [isPressed, setIsPressed] = useState(false);

  const handleClick = useCallback(() => {
    if (disabled) return;

    const statusCycle: GoalStatus[] = ['neutral', 'done', 'not_done'];
    const currentIndex = statusCycle.indexOf(status);
    const nextIndex = (currentIndex + 1) % statusCycle.length;
    onChange(statusCycle[nextIndex]);
  }, [status, onChange, disabled]);

  const handleMouseDown = useCallback(() => {
    if (disabled) return;

    setIsPressed(true);
    const timer = setTimeout(() => {
      // Long press - reset to neutral
      onChange('neutral');
      setIsPressed(false);
    }, 1000); // 1 second long press

    setLongPressTimer(timer);
  }, [onChange, disabled]);

  const handleMouseUp = useCallback(() => {
    setIsPressed(false);
    if (longPressTimer) {
      clearTimeout(longPressTimer);
      setLongPressTimer(null);
      handleClick();
    }
  }, [longPressTimer, handleClick]);

  const handleMouseLeave = useCallback(() => {
    setIsPressed(false);
    if (longPressTimer) {
      clearTimeout(longPressTimer);
      setLongPressTimer(null);
    }
  }, [longPressTimer]);

  const handleTouchStart = useCallback((e: React.TouchEvent) => {
    e.preventDefault();
    handleMouseDown();
  }, [handleMouseDown]);

  const handleTouchEnd = useCallback((e: React.TouchEvent) => {
    e.preventDefault();
    handleMouseUp();
  }, [handleMouseUp]);

  const currentConfig = statusConfig[status];
  const currentSizeConfig = sizeConfig[size];
  const Icon = currentConfig.icon;

  return (
    <div className={cn('inline-flex flex-col items-center gap-1', className)}>
      <button
        type="button"
        disabled={disabled}
        onMouseDown={handleMouseDown}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseLeave}
        onTouchStart={handleTouchStart}
        onTouchEnd={handleTouchEnd}
        className={cn(
          'inline-flex items-center justify-center rounded-lg border transition-all duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2',
          'active:scale-95',
          isPressed && 'scale-95',
          currentConfig.bgClass,
          currentConfig.textClass,
          'border-current',
          currentSizeConfig.button,
          disabled && 'opacity-50 cursor-not-allowed',
          !disabled && 'cursor-pointer'
        )}
        aria-label={`Toggle status: ${currentConfig.label}. Click to cycle through states, long press to reset to neutral.`}
        title={`${currentConfig.label} - Click to change, long press to reset`}
      >
        <Icon
          className={cn(
            currentConfig.iconClass,
            currentSizeConfig.icon
          )}
        />
      </button>
      
      {/* Status indicator dots */}
      <div className="flex space-x-1">
        {(['neutral', 'done', 'not_done'] as GoalStatus[]).map((statusType) => {
          const config = statusConfig[statusType];
          const isActive = statusType === status;
          return (
            <div
              key={statusType}
              className={cn(
                'w-2 h-2 rounded-full border transition-all duration-200',
                isActive
                  ? cn(
                      'border-transparent',
                      statusType === 'done' && 'bg-green-500',
                      statusType === 'not_done' && 'bg-red-500',
                      statusType === 'neutral' && 'bg-gray-400'
                    )
                  : 'border-gray-300 dark:border-gray-600 bg-transparent'
              )}
            />
          );
        })}
      </div>
      
      {/* Screen reader text */}
      <span className="sr-only">{currentConfig.label}</span>
    </div>
  );
};

export default TriStateToggle;
