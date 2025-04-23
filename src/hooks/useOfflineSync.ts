
import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { toast } from 'sonner';

// Define valid table names to avoid TypeScript errors
type ValidTableName = 'workouts' | 'exercises' | 'exercise_sets' | 'programs' | 'weeks' | 
  'workout_logs' | 'exercise_library' | 'club_shared_workouts' | 'club_shared_programs';

interface SyncableItem {
  id: string;
  updated_at?: string;
  [key: string]: any;
}

// Define specific typed operations for each table to ensure type safety
type SyncOperation = {
  table: ValidTableName;
  type: 'insert' | 'update' | 'delete';
  data: Record<string, any>; // Using Record to ensure it matches supabase expectations
}

interface SyncStatus {
  lastSynced: string | null;
  isSyncing: boolean;
  error: string | null;
}

/**
 * Hook for managing offline data synchronization
 */
export function useOfflineSync() {
  const { user } = useAuth();
  const [syncStatus, setSyncStatus] = useState<SyncStatus>({
    lastSynced: null,
    isSyncing: false,
    error: null,
  });

  // Retrieve the last sync time from local storage
  useEffect(() => {
    if (user) {
      const lastSynced = localStorage.getItem(`lastSync_${user.id}`);
      if (lastSynced) {
        setSyncStatus(prev => ({ ...prev, lastSynced }));
      }
    }
  }, [user]);

  // Function to sync local changes with the server
  const syncData = useCallback(async (forceSync = false) => {
    if (!user) return;
    
    try {
      setSyncStatus(prev => ({ ...prev, isSyncing: true, error: null }));
      
      console.log('[useOfflineSync] Starting data synchronization');
      
      // Get pending changes from IndexedDB or localStorage
      const pendingChanges = getPendingChanges();
      
      if (pendingChanges.length === 0 && !forceSync) {
        console.log('[useOfflineSync] No pending changes to sync');
        setSyncStatus(prev => ({ 
          ...prev, 
          isSyncing: false,
          lastSynced: new Date().toISOString()
        }));
        return;
      }
      
      // Process each change
      for (const change of pendingChanges) {
        await processSyncChange(change);
      }
      
      // Update last sync time
      const now = new Date().toISOString();
      localStorage.setItem(`lastSync_${user.id}`, now);
      setSyncStatus({ 
        isSyncing: false, 
        lastSynced: now,
        error: null 
      });
      
      console.log('[useOfflineSync] Synchronization completed successfully');
      
    } catch (error: any) {
      console.error('[useOfflineSync] Sync error:', error);
      setSyncStatus(prev => ({ 
        ...prev, 
        isSyncing: false,
        error: error.message || 'Synchronization failed' 
      }));
      toast.error('Failed to sync data. Please try again.');
    }
  }, [user]);

  // Helper to get pending changes (this would be implemented using IndexedDB in a real app)
  const getPendingChanges = (): SyncOperation[] => {
    // This is a simplified version. In a real app, you'd retrieve from IndexedDB
    return [];
  };

  // Process a single sync change
  const processSyncChange = async (change: SyncOperation) => {
    try {
      const { table, type, data } = change;
      
      console.log(`[useOfflineSync] Processing ${type} operation for ${table}`, data);
      
      switch (type) {
        case 'insert':
          // Cast the data to any to bypass TypeScript's type checking
          // since we know the data structure matches what the table expects
          await supabase.from(table).insert(data as any);
          break;
        case 'update':
          await supabase.from(table).update(data as any).eq('id', data.id);
          break;
        case 'delete':
          await supabase.from(table).delete().eq('id', data.id);
          break;
        default:
          console.warn('[useOfflineSync] Unknown sync operation type:', type);
      }
    } catch (error) {
      console.error('[useOfflineSync] Error processing sync change:', error);
      throw error; // Rethrow to handle in the main sync function
    }
  };

  return {
    syncStatus,
    syncData,
    isOnline: typeof navigator !== 'undefined' ? navigator.onLine : true,
  };
}

// Function to store data locally for offline use
export async function storeForOffline<T extends SyncableItem>(
  table: ValidTableName, 
  data: T
): Promise<void> {
  // This would be implemented with IndexedDB in a real app
  console.log(`[storeForOffline] Storing ${table} data for offline use:`, data);
  
  // For now, just store an indicator in localStorage that we have offline data
  localStorage.setItem('hasOfflineData', 'true');
}
