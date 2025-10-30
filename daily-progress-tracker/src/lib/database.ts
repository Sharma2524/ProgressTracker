import { DB_NAME, DB_VERSION, STORE_NAME } from '../constants';
import { DailyRecord, IDBDailyRecord } from '../types';
import { convertToIDB, convertFromIDB } from './utils';

// IndexedDB database connection
let dbInstance: IDBDatabase | null = null;

export const getDB = async (): Promise<IDBDatabase> => {
  if (dbInstance) {
    return dbInstance;
  }

  return new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, DB_VERSION);

    request.onerror = () => {
      reject(new Error('Failed to open IndexedDB'));
    };

    request.onsuccess = () => {
      dbInstance = request.result;
      resolve(dbInstance);
    };

    request.onupgradeneeded = (event) => {
      const db = (event.target as IDBOpenDBRequest).result;
      
      // Create object store for daily records
      if (!db.objectStoreNames.contains(STORE_NAME)) {
        const store = db.createObjectStore(STORE_NAME, { keyPath: 'id' });
        store.createIndex('date', 'date', { unique: true });
        store.createIndex('updatedAt', 'updatedAt', { unique: false });
      }
    };
  });
};

// General database operations
export const getAllRecords = async (): Promise<DailyRecord[]> => {
  try {
    const db = await getDB();
    return new Promise((resolve, reject) => {
      const transaction = db.transaction([STORE_NAME], 'readonly');
      const store = transaction.objectStore(STORE_NAME);
      const request = store.getAll();

      request.onsuccess = () => {
        const records = request.result.map((idbRecord: IDBDailyRecord) => 
          convertFromIDB(idbRecord)
        );
        resolve(records);
      };

      request.onerror = () => {
        reject(new Error('Failed to fetch records'));
      };
    });
  } catch (error) {
    console.error('Error getting all records:', error);
    return [];
  }
};

export const getRecordById = async (id: string): Promise<DailyRecord | null> => {
  try {
    const db = await getDB();
    return new Promise((resolve, reject) => {
      const transaction = db.transaction([STORE_NAME], 'readonly');
      const store = transaction.objectStore(STORE_NAME);
      const request = store.get(id);

      request.onsuccess = () => {
        const result = request.result;
        resolve(result ? convertFromIDB(result) : null);
      };

      request.onerror = () => {
        reject(new Error('Failed to fetch record'));
      };
    });
  } catch (error) {
    console.error('Error getting record by ID:', error);
    return null;
  }
};

export const getRecordByDate = async (date: string): Promise<DailyRecord | null> => {
  try {
    const db = await getDB();
    return new Promise((resolve, reject) => {
      const transaction = db.transaction([STORE_NAME], 'readonly');
      const store = transaction.objectStore(STORE_NAME);
      const index = store.index('date');
      const request = index.get(date);

      request.onsuccess = () => {
        const result = request.result;
        resolve(result ? convertFromIDB(result) : null);
      };

      request.onerror = () => {
        reject(new Error('Failed to fetch record by date'));
      };
    });
  } catch (error) {
    console.error('Error getting record by date:', error);
    return null;
  }
};

export const saveRecord = async (record: DailyRecord): Promise<void> => {
  try {
    const db = await getDB();
    const idbRecord = convertToIDB(record);
    
    return new Promise((resolve, reject) => {
      const transaction = db.transaction([STORE_NAME], 'readwrite');
      const store = transaction.objectStore(STORE_NAME);
      const request = store.put(idbRecord);

      request.onsuccess = () => {
        resolve();
      };

      request.onerror = () => {
        reject(new Error('Failed to save record'));
      };
    });
  } catch (error) {
    console.error('Error saving record:', error);
    throw error;
  }
};

export const deleteRecord = async (id: string): Promise<void> => {
  try {
    const db = await getDB();
    
    return new Promise((resolve, reject) => {
      const transaction = db.transaction([STORE_NAME], 'readwrite');
      const store = transaction.objectStore(STORE_NAME);
      const request = store.delete(id);

      request.onsuccess = () => {
        resolve();
      };

      request.onerror = () => {
        reject(new Error('Failed to delete record'));
      };
    });
  } catch (error) {
    console.error('Error deleting record:', error);
    throw error;
  }
};

export const searchRecords = async (query: string): Promise<DailyRecord[]> => {
  try {
    const allRecords = await getAllRecords();
    if (!query.trim()) return allRecords;
    
    const searchTerm = query.toLowerCase();
    return allRecords.filter(record => {
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
  } catch (error) {
    console.error('Error searching records:', error);
    return [];
  }
};

export const getRecordsInRange = async (startDate: string, endDate: string): Promise<DailyRecord[]> => {
  try {
    const allRecords = await getAllRecords();
    return allRecords.filter(record => 
      record.date >= startDate && record.date <= endDate
    );
  } catch (error) {
    console.error('Error getting records in range:', error);
    return [];
  }
};

export const batchImportRecords = async (records: DailyRecord[]): Promise<void> => {
  try {
    const db = await getDB();
    
    return new Promise((resolve, reject) => {
      const transaction = db.transaction([STORE_NAME], 'readwrite');
      const store = transaction.objectStore(STORE_NAME);
      
      let completed = 0;
      const total = records.length;
      
      if (total === 0) {
        resolve();
        return;
      }
      
      records.forEach(record => {
        const idbRecord = convertToIDB(record);
        const request = store.put(idbRecord);
        
        request.onsuccess = () => {
          completed++;
          if (completed === total) {
            resolve();
          }
        };
        
        request.onerror = () => {
          reject(new Error('Failed to import record'));
        };
      });
    });
  } catch (error) {
    console.error('Error batch importing records:', error);
    throw error;
  }
};

export const exportAllRecords = async (): Promise<DailyRecord[]> => {
  try {
    return await getAllRecords();
  } catch (error) {
    console.error('Error exporting records:', error);
    return [];
  }
};

export const clearAllRecords = async (): Promise<void> => {
  try {
    const db = await getDB();
    
    return new Promise((resolve, reject) => {
      const transaction = db.transaction([STORE_NAME], 'readwrite');
      const store = transaction.objectStore(STORE_NAME);
      const request = store.clear();

      request.onsuccess = () => {
        resolve();
      };

      request.onerror = () => {
        reject(new Error('Failed to clear records'));
      };
    });
  } catch (error) {
    console.error('Error clearing all records:', error);
    throw error;
  }
};

// Database initialization check
export const checkDatabase = async (): Promise<boolean> => {
  try {
    await getDB();
    return true;
  } catch (error) {
    console.error('Database check failed:', error);
    return false;
  }
};
