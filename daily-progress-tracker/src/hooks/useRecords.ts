import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useState, useEffect, useCallback } from 'react';
import { DailyRecord } from '../types';
import { 
  getRecordByDate, 
  getAllRecords, 
  searchRecords as searchRecordsInDB,
  saveRecord as saveRecordToDB,
  deleteRecord as deleteRecordFromDB,
  getRecordsInRange
} from '../lib/database';
import { createEmptyRecord, getTodayDate, generateOverdueTasks, updateOriginalItem } from '../lib/utils';
import { debounce } from '../lib/utils';

const QUERY_KEYS = {
  dailyRecord: (date: string) => ['dailyRecord', date] as const,
  allRecords: () => ['allRecords'] as const,
  searchRecords: (query: string) => ['searchRecords', query] as const,
  recordsInRange: (start: string, end: string) => ['recordsInRange', start, end] as const,
};

// Hook for managing a single daily record
export const useDailyRecord = (date: string) => {
  return useQuery({
    queryKey: QUERY_KEYS.dailyRecord(date),
    queryFn: async () => {
      const record = await getRecordByDate(date);
      if (!record) {
        return createEmptyRecord(date);
      }
      return record;
    },
    staleTime: 1000 * 60 * 5, // 5 minutes
    enabled: !!date && date.length === 10, // Valid date format
  });
};

// Hook for saving a daily record
export const useSaveDailyRecord = () => {
  const queryClient = useQueryClient();
  const [isSaving, setIsSaving] = useState(false);
  const [lastSaved, setLastSaved] = useState<Date | null>(null);

  const saveMutation = useMutation({
    mutationFn: async (record: DailyRecord) => {
      const updatedRecord = {
        ...record,
        updatedAt: new Date().toISOString(),
      };
      await saveRecordToDB(updatedRecord);
      return updatedRecord;
    },
    onSuccess: (savedRecord) => {
      // Update the specific daily record query
      queryClient.setQueryData(QUERY_KEYS.dailyRecord(savedRecord.date), savedRecord);
      // Invalidate all records to ensure consistency
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.allRecords() });
      queryClient.invalidateQueries({ queryKey: ['allRecords'] });
      setLastSaved(new Date());
    },
    onSettled: () => {
      setIsSaving(false);
    },
  });

  const debouncedSave = useCallback(
    debounce((record: DailyRecord) => {
      setIsSaving(true);
      saveMutation.mutate(record);
    }, 2000), // 2 second debounce
    [saveMutation]
  );

  return {
    isSaving: isSaving || saveMutation.isPending,
    saveRecord: debouncedSave,
    lastSaved,
    saveRecordSync: saveMutation.mutate, // For immediate saves
  };
};

// Hook for getting all records
export const useAllRecords = () => {
  return useQuery({
    queryKey: QUERY_KEYS.allRecords(),
    queryFn: getAllRecords,
    staleTime: 1000 * 60 * 5, // 5 minutes
  });
};

// Hook for searching records
export const useSearchRecords = (query: string) => {
  return useQuery({
    queryKey: QUERY_KEYS.searchRecords(query),
    queryFn: () => searchRecordsInDB(query),
    enabled: query.length > 0,
    staleTime: 1000 * 60 * 2, // 2 minutes
  });
};

// Hook for getting records in a date range
export const useRecordsInRange = (startDate: string, endDate: string) => {
  return useQuery({
    queryKey: QUERY_KEYS.recordsInRange(startDate, endDate),
    queryFn: () => getRecordsInRange(startDate, endDate),
    enabled: !!(startDate && endDate),
    staleTime: 1000 * 60 * 5, // 5 minutes
  });
};

// Hook for managing today's record
export const useTodayRecord = () => {
  const today = getTodayDate();
  return useDailyRecord(today);
};

// Hook for getting records summary (for calendar view)
export const useRecordsSummary = () => {
  const { data: records = [], isLoading } = useAllRecords();
  
  const summary = records.reduce((acc, record) => {
    acc[record.date] = {
      goals: record.goals.length,
      priorities: record.priorities.length,
      overdue_tasks: record.overdue_tasks.length,
      hasJournal: record.journal.content.length > 0,
      completedGoals: record.goals.filter(goal => goal.status === 'done').length,
      completedPriorities: record.priorities.filter(priority => priority.status === 'done').length,
      completedOverdueTasks: record.overdue_tasks.filter(task => task.status === 'done').length,
    };
    return acc;
  }, {} as Record<string, {
    goals: number;
    priorities: number;
    overdue_tasks: number;
    hasJournal: boolean;
    completedGoals: number;
    completedPriorities: number;
    completedOverdueTasks: number;
  }>);

  return { summary, isLoading };
};

// Hook for deleting a record
export const useDeleteRecord = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (recordId: string) => {
      await deleteRecordFromDB(recordId);
      return recordId;
    },
    onSuccess: (deletedId) => {
      // Remove from all queries
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.allRecords() });
      queryClient.removeQueries({ queryKey: ['dailyRecord'] });
      queryClient.removeQueries({ queryKey: ['searchRecords'] });
      queryClient.removeQueries({ queryKey: ['recordsInRange'] });
    },
  });
};

// Hook for batch operations
export const useBatchOperation = () => {
  const queryClient = useQueryClient();
  const [isBatchProcessing, setIsBatchProcessing] = useState(false);

  const importRecords = useMutation({
    mutationFn: async (records: DailyRecord[]) => {
      setIsBatchProcessing(true);
      for (const record of records) {
        const updatedRecord = {
          ...record,
          updatedAt: new Date().toISOString(),
        };
        await saveRecordToDB(updatedRecord);
      }
      return records;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.allRecords() });
    },
    onSettled: () => {
      setIsBatchProcessing(false);
    },
  });

  return {
    isBatchProcessing,
    importRecords: importRecords.mutate,
    isImporting: importRecords.isPending,
  };
};

// Hook for auto-saving with local storage fallback
export const useAutoSave = (record: DailyRecord | null, enabled: boolean = true) => {
  const { saveRecord, isSaving, lastSaved } = useSaveDailyRecord();

  useEffect(() => {
    if (!enabled || !record) return;

    // Auto-save after a delay
    const timeoutId = setTimeout(() => {
      saveRecord(record);
    }, 2000);

    return () => clearTimeout(timeoutId);
  }, [record, saveRecord, enabled]);

  return { isSaving, lastSaved };
};

// Hook for managing record state with optimistic updates
export const useOptimisticRecord = (initialRecord: DailyRecord | null) => {
  const [optimisticRecord, setOptimisticRecord] = useState<DailyRecord | null>(initialRecord);
  const { saveRecord, isSaving } = useSaveDailyRecord();

  useEffect(() => {
    setOptimisticRecord(initialRecord);
  }, [initialRecord]);

  const updateRecord = useCallback((updates: Partial<DailyRecord>) => {
    if (!optimisticRecord) return;

    const updatedRecord = {
      ...optimisticRecord,
      ...updates,
      updatedAt: new Date().toISOString(),
    };

    setOptimisticRecord(updatedRecord);
    saveRecord(updatedRecord);
  }, [optimisticRecord, saveRecord]);

  const updateGoals = useCallback((goals: DailyRecord['goals']) => {
    updateRecord({ goals });
  }, [updateRecord]);

  const updatePriorities = useCallback((priorities: DailyRecord['priorities']) => {
    updateRecord({ priorities });
  }, [updateRecord]);

  const updateOverdueTasks = useCallback((overdue_tasks: DailyRecord['overdue_tasks']) => {
    updateRecord({ overdue_tasks });
  }, [updateRecord]);

  const updateJournal = useCallback((journal: DailyRecord['journal']) => {
    updateRecord({ journal });
  }, [updateRecord]);

  return {
    record: optimisticRecord,
    isSaving,
    updateRecord,
    updateGoals,
    updatePriorities,
    updateOverdueTasks,
    updateJournal,
  };
};

// Hook for automatic overdue task management
export const useOverdueTasks = (currentDate: string) => {
  const { data: allRecords = [] } = useAllRecords();
  const { data: currentRecord, refetch: refetchCurrent } = useDailyRecord(currentDate);
  const { saveRecord } = useSaveDailyRecord();

  // Auto-generate overdue tasks when current record changes
  const generateAutoOverdueTasks = useCallback(() => {
    if (!currentRecord) return;

    const autoOverdueTasks = generateOverdueTasks(currentDate, allRecords, currentRecord.overdue_tasks);
    
    // Filter out overdue tasks that already exist manually and ensure they have source field
    const manualOverdueTasks = currentRecord.overdue_tasks
      .filter(task => task.source === 'manual')
      .map(task => ({ ...task, source: task.source || 'manual' }));
    const combinedOverdueTasks = [...manualOverdueTasks, ...autoOverdueTasks];

    // Update current record with combined overdue tasks
    const updatedRecord = {
      ...currentRecord,
      overdue_tasks: combinedOverdueTasks,
      updatedAt: new Date().toISOString()
    };

    saveRecord(updatedRecord);
    refetchCurrent();
  }, [currentRecord, currentDate, allRecords, saveRecord, refetchCurrent]);

  // Mark overdue task as complete and update original item
  const completeOverdueTask = useCallback((overdueTaskId: string, newStatus: 'neutral' | 'done' | 'not_done') => {
    if (!currentRecord) return;
    
    const overdueTask = currentRecord.overdue_tasks.find(task => task.id === overdueTaskId);
    if (!overdueTask) return;

    // Update current record's overdue task status
    const updatedCurrentRecord = {
      ...currentRecord,
      overdue_tasks: currentRecord.overdue_tasks.map(task => 
        task.id === overdueTaskId
          ? { ...task, status: newStatus, updatedAt: new Date().toISOString() }
          : task
      ),
      updatedAt: new Date().toISOString()
    };

    // If it's an auto-generated overdue task, update the original item
    if (overdueTask.source === 'auto') {
      const updatedAllRecords = updateOriginalItem(overdueTask, allRecords, newStatus);
      
      // Save all updated records
      updatedAllRecords.forEach(record => {
        if (record.date !== currentDate) {
          saveRecord(record);
        }
      });
    }

    // Save updated current record
    saveRecord(updatedCurrentRecord);
    refetchCurrent();
  }, [currentRecord, currentDate, allRecords, saveRecord, refetchCurrent]);

  // Clear completed overdue tasks
  const clearCompletedOverdueTasks = useCallback(() => {
    if (!currentRecord) return;

    const updatedCurrentRecord = {
      ...currentRecord,
      overdue_tasks: currentRecord.overdue_tasks.filter(task => task.status !== 'done'),
      updatedAt: new Date().toISOString()
    };

    saveRecord(updatedCurrentRecord);
    refetchCurrent();
  }, [currentRecord, saveRecord, refetchCurrent]);

  // Get overdue task statistics
  const getOverdueStats = useCallback(() => {
    if (!currentRecord) return { total: 0, auto: 0, manual: 0, completed: 0 };

    const total = currentRecord.overdue_tasks.length;
    const auto = currentRecord.overdue_tasks.filter(task => task.source === 'auto').length;
    const manual = currentRecord.overdue_tasks.filter(task => task.source === 'manual').length;
    const completed = currentRecord.overdue_tasks.filter(task => task.status === 'done').length;

    return { total, auto, manual, completed };
  }, [currentRecord]);

  return {
    currentRecord,
    generateAutoOverdueTasks,
    completeOverdueTask,
    clearCompletedOverdueTasks,
    getOverdueStats,
  };
};
