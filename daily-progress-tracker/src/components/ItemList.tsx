import React, { useState } from 'react';
import { cn } from '../lib/utils';
import { Plus, ChevronUp, ChevronDown, Trash2, Flag } from 'lucide-react';
import { PriorityItem } from '../types';
import TriStateToggle from './TriStateToggle';
import { generateId, isValidTitle } from '../lib/utils';
import { MAX_TITLE_LENGTH } from '../constants';

interface ItemListProps {
  items: PriorityItem[];
  onItemsChange: (items: PriorityItem[]) => void;
  onDeleteItem: (itemId: string) => void;
  onMoveItem: (itemId: string, direction: 'up' | 'down') => void;
  type: 'priority' | 'other';
  disabled?: boolean;
}

const typeConfig = {
  priority: {
    title: 'Priorities',
    icon: Flag,
    emptyMessage: 'No priorities set for today yet.',
    addButtonText: 'Add New Priority',
  },
  other: {
    title: 'Other Items',
    icon: Plus,
    emptyMessage: 'No additional items yet.',
    addButtonText: 'Add New Item',
  },
};

export const ItemList: React.FC<ItemListProps> = ({
  items,
  onItemsChange,
  onDeleteItem,
  onMoveItem,
  type,
  disabled = false,
}) => {
  const [editingId, setEditingId] = useState<string | null>(null);
  const [newItemTitle, setNewItemTitle] = useState('');
  const config = typeConfig[type];
  const Icon = config.icon;

  const handleAddItem = () => {
    if (!newItemTitle.trim() || disabled) return;
    
    const newItem: PriorityItem = {
      id: generateId(),
      title: newItemTitle.trim(),
      status: 'neutral',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    onItemsChange([...items, newItem]);
    setNewItemTitle('');
    setEditingId(null);
  };

  const handleItemTitleChange = (itemId: string, newTitle: string) => {
    if (!isValidTitle(newTitle)) return;

    const updatedItems = items.map(item => 
      item.id === itemId 
        ? { ...item, title: newTitle, updatedAt: new Date().toISOString() }
        : item
    );
    onItemsChange(updatedItems);
  };

  const handleItemStatusChange = (itemId: string, newStatus: 'neutral' | 'done' | 'not_done') => {
    const updatedItems = items.map(item => 
      item.id === itemId 
        ? { ...item, status: newStatus, updatedAt: new Date().toISOString() }
        : item
    );
    onItemsChange(updatedItems);
  };

  const getItemProgress = (item: PriorityItem) => {
    switch (item.status) {
      case 'done':
        return 100;
      case 'not_done':
        return 0;
      default:
        return 50;
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 flex items-center gap-2">
          <Icon className="w-5 h-5" />
          {config.title} ({items.length})
        </h3>
      </div>

      {/* Add new item */}
      <div className="space-y-2">
        {editingId === 'new' ? (
          <div className="space-y-2">
            <input
              type="text"
              value={newItemTitle}
              onChange={(e) => setNewItemTitle(e.target.value)}
              placeholder={`Enter ${type} title...`}
              maxLength={MAX_TITLE_LENGTH}
              className="w-full px-3 py-2 text-sm bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              autoFocus
              onKeyDown={(e) => {
                if (e.key === 'Enter') handleAddItem();
                if (e.key === 'Escape') {
                  setNewItemTitle('');
                  setEditingId(null);
                }
              }}
            />
            <div className="flex gap-2">
              <button
                type="button"
                onClick={handleAddItem}
                disabled={!newItemTitle.trim() || disabled}
                className="px-3 py-1 text-xs bg-blue-100 text-blue-700 rounded hover:bg-blue-200 disabled:opacity-50"
              >
                Add {type === 'priority' ? 'Priority' : 'Item'}
              </button>
              <button
                type="button"
                onClick={() => {
                  setNewItemTitle('');
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
            {config.addButtonText}
          </button>
        )}
      </div>

      {/* Items list */}
      <div className="space-y-3">
        {items.map((item, index) => {
          const progress = getItemProgress(item);

          return (
            <div
              key={item.id}
              className={cn(
                'p-4 border rounded-lg bg-white dark:bg-gray-800 transition-all',
                item.status === 'done' && 'border-green-200 bg-green-50 dark:bg-green-900/20',
                item.status === 'not_done' && 'border-red-200 bg-red-50 dark:bg-red-900/20',
                disabled && 'opacity-75'
              )}
            >
              {/* Item header */}
              <div className="flex items-start justify-between gap-3">
                <div className="flex-1 min-w-0">
                  <input
                    type="text"
                    value={item.title}
                    onChange={(e) => handleItemTitleChange(item.id, e.target.value)}
                    disabled={disabled}
                    className="w-full px-2 py-1 text-sm font-medium bg-transparent border-none focus:outline-none focus:ring-1 focus:ring-blue-500 rounded disabled:cursor-not-allowed"
                    placeholder={`${type} title...`}
                  />
                  
                  {/* Progress indicator */}
                  <div className="mt-2 flex items-center gap-2">
                    <div className="flex-1 bg-gray-200 dark:bg-gray-700 rounded-full h-1.5">
                      <div
                        className={cn(
                          'h-1.5 rounded-full transition-all',
                          item.status === 'done' && 'bg-green-500',
                          item.status === 'not_done' && 'bg-red-500',
                          item.status === 'neutral' && 'bg-yellow-500'
                        )}
                        style={{ width: `${progress}%` }}
                      />
                    </div>
                    <span className="text-xs text-gray-500 dark:text-gray-400">
                      {item.status === 'done' && 'Completed'}
                      {item.status === 'not_done' && 'Not Done'}
                      {item.status === 'neutral' && 'In Progress'}
                    </span>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  {/* Item status toggle */}
                  <TriStateToggle
                    status={item.status}
                    onChange={(status) => handleItemStatusChange(item.id, status)}
                    disabled={disabled}
                    size="sm"
                  />

                  {/* Move buttons */}
                  <div className="flex flex-col">
                    <button
                      type="button"
                      onClick={() => onMoveItem(item.id, 'up')}
                      disabled={disabled || index === 0}
                      className="p-1 text-gray-400 hover:text-gray-600 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      <ChevronUp className="w-3 h-3" />
                    </button>
                    <button
                      type="button"
                      onClick={() => onMoveItem(item.id, 'down')}
                      disabled={disabled || index === items.length - 1}
                      className="p-1 text-gray-400 hover:text-gray-600 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      <ChevronDown className="w-3 h-3" />
                    </button>
                  </div>

                  {/* Delete button */}
                  <button
                    type="button"
                    onClick={() => onDeleteItem(item.id)}
                    disabled={disabled}
                    className="p-1 text-red-400 hover:text-red-600 disabled:opacity-50"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {items.length === 0 && (
        <div className="text-center py-8 text-gray-500 dark:text-gray-400">
          <Icon className="w-8 h-8 mx-auto mb-2 opacity-50" />
          <p>{config.emptyMessage}</p>
          <p className="text-sm">Add your first {type} to get started!</p>
        </div>
      )}
    </div>
  );
};

export default ItemList;
