import React, { useState, useEffect, useCallback } from 'react';
import { cn } from '../lib/utils';
import { FileText, Save } from 'lucide-react';
import { countWords } from '../lib/utils';

interface JournalEditorProps {
  content: string;
  wordCount: number;
  onChange: (content: string) => void;
  placeholder?: string;
  disabled?: boolean;
  className?: string;
  autoSave?: boolean;
  maxLength?: number;
}

export const JournalEditor: React.FC<JournalEditorProps> = ({
  content,
  wordCount,
  onChange,
  placeholder = "Write about your day, thoughts, or anything that's on your mind...",
  disabled = false,
  className,
  autoSave = true,
  maxLength = 10000,
}) => {
  const [localContent, setLocalContent] = useState(content);
  const [isAutoSaving, setIsAutoSaving] = useState(false);
  const [lastSaved, setLastSaved] = useState<Date | null>(null);

  // Update local content when prop changes
  useEffect(() => {
    setLocalContent(content);
  }, [content]);

  // Auto-save with debouncing
  useEffect(() => {
    if (!autoSave || disabled || localContent === content) return;

    const timeoutId = setTimeout(() => {
      setIsAutoSaving(true);
      onChange(localContent);
      setLastSaved(new Date());
      setTimeout(() => setIsAutoSaving(false), 500);
    }, 1000); // 1 second debounce

    return () => clearTimeout(timeoutId);
  }, [localContent, content, onChange, autoSave, disabled]);

  const handleInputChange = useCallback((e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const newContent = e.target.value;
    if (newContent.length <= maxLength) {
      setLocalContent(newContent);
    }
  }, [maxLength]);

  const handleManualSave = useCallback(() => {
    if (localContent !== content && !disabled) {
      setIsAutoSaving(true);
      onChange(localContent);
      setLastSaved(new Date());
      setTimeout(() => setIsAutoSaving(false), 500);
    }
  }, [localContent, content, onChange, disabled]);

  // Calculate word count
  const actualWordCount = localContent.trim() ? countWords(localContent) : 0;
  const characterCount = localContent.length;
  const isNearLimit = characterCount > maxLength * 0.9;

  return (
    <div className={cn('space-y-3', className)}>
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <FileText className="w-4 h-4 text-gray-500 dark:text-gray-400" />
          <h3 className="text-sm font-medium text-gray-900 dark:text-gray-100">
            Journal Entry
          </h3>
        </div>
        
        <div className="flex items-center gap-2 text-xs text-gray-500 dark:text-gray-400">
          {isAutoSaving && (
            <div className="flex items-center gap-1">
              <div className="w-3 h-3 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" />
              <span>Saving...</span>
            </div>
          )}
          {lastSaved && !isAutoSaving && (
            <div className="flex items-center gap-1">
              <Save className="w-3 h-3" />
              <span>Saved {lastSaved.toLocaleTimeString()}</span>
            </div>
          )}
          {!autoSave && (
            <button
              type="button"
              onClick={handleManualSave}
              disabled={disabled || localContent === content}
              className="px-2 py-1 text-xs bg-blue-100 text-blue-700 rounded hover:bg-blue-200 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Save
            </button>
          )}
        </div>
      </div>

      <div className="relative">
        <textarea
          value={localContent}
          onChange={handleInputChange}
          placeholder={placeholder}
          disabled={disabled}
          rows={8}
          className={cn(
            'w-full px-4 py-3 text-sm bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg',
            'resize-none focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500',
            'placeholder-gray-400 dark:placeholder-gray-500',
            'disabled:bg-gray-100 disabled:text-gray-500 disabled:cursor-not-allowed',
            'dark:text-gray-100 dark:placeholder-gray-400',
            isNearLimit && 'border-red-500 focus:ring-red-500 focus:border-red-500'
          )}
        />
        
        {/* Character/word count overlay */}
        <div className="absolute bottom-3 right-3 flex items-center gap-2">
          <div className={cn(
            'text-xs px-2 py-1 rounded',
            isNearLimit
              ? 'bg-red-100 text-red-700 dark:bg-red-900 dark:text-red-200'
              : 'bg-gray-100 text-gray-600 dark:bg-gray-700 dark:text-gray-300'
          )}>
            {characterCount}/{maxLength} chars
          </div>
          <div className="text-xs text-gray-500 dark:text-gray-400">
            {actualWordCount} words
          </div>
        </div>
      </div>

      {/* Progress bar for character limit */}
      <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-1">
        <div
          className={cn(
            'h-1 rounded-full transition-all duration-300',
            isNearLimit ? 'bg-red-500' : 'bg-blue-500'
          )}
          style={{ width: `${Math.min((characterCount / maxLength) * 100, 100)}%` }}
        />
      </div>

      {/* Writing suggestions */}
      {localContent.trim() === '' && !disabled && (
        <div className="text-xs text-gray-500 dark:text-gray-400 bg-gray-50 dark:bg-gray-800 p-3 rounded-lg">
          <p className="font-medium mb-1">💡 Journaling tips:</p>
          <ul className="space-y-1 text-xs">
            <li>• Start with how you're feeling right now</li>
            <li>• Write about something you're grateful for</li>
            <li>• Reflect on your progress today</li>
            <li>• Note any insights or learnings</li>
          </ul>
        </div>
      )}

      {/* Warning for exceeding limits */}
      {characterCount > maxLength && (
        <div className="text-xs text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-900/20 p-2 rounded">
          Maximum character limit reached. Please reduce your entry.
        </div>
      )}
    </div>
  );
};

export default JournalEditor;
