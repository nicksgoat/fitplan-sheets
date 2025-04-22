
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { toast } from 'sonner';

type SyncableEntity = {
  id: string;
  [key: string]: any;
};

type PendingChange<T extends SyncableEntity> = {
  id: string;
  type: 'create' | 'update' | 'delete';
  entity: T;
  timestamp: number;
};

// Define allowed table names to ensure type safety with Supabase
type AllowedTableName = 
  | 'workouts'
  | 'programs'
  | 'exercises'
  | 'workout_logs'
  | 'profiles';

/**
 * A hook that provides offline sync capabilities for mobile apps
 */
export function useOfflineSync<T extends SyncableEntity>(
  tableName: AllowedTableName,
  localStorageKey: string
) {
  const { user } = useAuth();
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [isSyncing, setIsSyncing] = useState(false);
  const [pendingChanges, setPendingChanges] = useState<PendingChange<T>[]>([]);
  
  // Load pending changes from localStorage on mount
  useEffect(() => {
    if (user) {
      const userSyncKey = `${localStorageKey}_${user.id}`;
      const storedChanges = localStorage.getItem(userSyncKey);
      if (storedChanges) {
        try {
          setPendingChanges(JSON.parse(storedChanges));
        } catch (e) {
          console.error('Error parsing stored changes', e);
          localStorage.removeItem(userSyncKey);
        }
      }
    }
  }, [user, localStorageKey]);
  
  // Update online status
  useEffect(() => {
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);
    
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);
    
    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);
  
  // Save changes to localStorage whenever pendingChanges updates
  useEffect(() => {
    if (user && pendingChanges.length > 0) {
      const userSyncKey = `${localStorageKey}_${user.id}`;
      localStorage.setItem(userSyncKey, JSON.stringify(pendingChanges));
    }
  }, [pendingChanges, user, localStorageKey]);
  
  // Add a change to the pending queue
  const addChange = (type: 'create' | 'update' | 'delete', entity: T) => {
    setPendingChanges(prev => [
      ...prev.filter(change => change.id !== entity.id), // Remove any previous change for this entity
      {
        id: entity.id,
        type,
        entity,
        timestamp: Date.now()
      }
    ]);
    
    // If online, try to sync immediately
    if (isOnline) {
      syncChanges();
    } else {
      toast.info('Change saved locally. Will sync when back online.');
    }
  };
  
  // Try to sync all pending changes
  const syncChanges = async () => {
    if (!user || pendingChanges.length === 0 || isSyncing) return;
    
    setIsSyncing(true);
    const successfulChanges: string[] = [];
    
    try {
      // Process each change in order of timestamp
      const sortedChanges = [...pendingChanges].sort((a, b) => a.timestamp - b.timestamp);
      
      for (const change of sortedChanges) {
        try {
          switch (change.type) {
            case 'create':
              await supabase
                .from(tableName)
                .insert(change.entity);
              break;
              
            case 'update':
              const { id, ...updateData } = change.entity;
              await supabase
                .from(tableName)
                .update(updateData)
                .eq('id', id);
              break;
              
            case 'delete':
              await supabase
                .from(tableName)
                .delete()
                .eq('id', change.id);
              break;
          }
          
          // If successful, add to the list of changes to remove
          successfulChanges.push(change.id);
        } catch (error) {
          console.error(`Error syncing change for ${change.id}:`, error);
          // We continue with the next change
        }
      }
      
      // Remove successful changes from pendingChanges
      if (successfulChanges.length > 0) {
        setPendingChanges(prev => 
          prev.filter(change => !successfulChanges.includes(change.id))
        );
        
        toast.success(`Synced ${successfulChanges.length} changes`);
      }
    } catch (error) {
      console.error('Error during sync:', error);
      toast.error('Error syncing changes');
    } finally {
      setIsSyncing(false);
    }
  };
  
  // Try to sync whenever we come online
  useEffect(() => {
    if (isOnline && pendingChanges.length > 0) {
      syncChanges();
    }
  }, [isOnline]);
  
  return {
    isOnline,
    isSyncing,
    pendingChanges,
    addChange,
    syncChanges,
    // Helper methods for common operations
    create: (entity: T) => addChange('create', entity),
    update: (entity: T) => addChange('update', entity),
    delete: (entity: T) => addChange('delete', entity),
  };
}
