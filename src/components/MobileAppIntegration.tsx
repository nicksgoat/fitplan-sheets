
import React, { useEffect, useState } from 'react';
import { mobileApi } from '@/lib/mobileApiClient';
import { useAuth } from '@/hooks/useAuth';
import { useOfflineSync } from '@/hooks/useOfflineSync';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Loader2, Wifi, WifiOff, RefreshCw, CheckCircle } from 'lucide-react';
import { toast } from 'sonner';

interface MobileAppStats {
  workoutsCount: number;
  programsCount: number;
  syncStatus: 'synced' | 'pending' | 'error';
  lastSynced: string | null;
}

export function MobileAppIntegration() {
  const { user } = useAuth();
  const [isInitializing, setIsInitializing] = useState(true);
  const [stats, setStats] = useState<MobileAppStats>({
    workoutsCount: 0,
    programsCount: 0,
    syncStatus: 'pending',
    lastSynced: null,
  });
  const { syncStatus, syncData, isOnline } = useOfflineSync();
  
  useEffect(() => {
    async function initializeApi() {
      try {
        setIsInitializing(true);
        const initialized = await mobileApi.initialize();
        
        if (initialized) {
          await loadUserData();
        }
      } catch (error) {
        console.error('Failed to initialize mobile API:', error);
        toast.error('Failed to connect to mobile services');
      } finally {
        setIsInitializing(false);
      }
    }
    
    if (user) {
      initializeApi();
    }
  }, [user]);
  
  const loadUserData = async () => {
    try {
      // Load workouts count
      const workoutsResponse = await mobileApi.getWorkouts(1, 0);
      // The server returns total count in headers or response metadata
      const workoutsCount = workoutsResponse.data.length || 0;
      
      // Load programs count
      const programsResponse = await mobileApi.getPrograms(1, 0);
      const programsCount = programsResponse.data.length || 0;
      
      setStats({
        workoutsCount,
        programsCount,
        syncStatus: syncStatus.error ? 'error' : syncStatus.lastSynced ? 'synced' : 'pending',
        lastSynced: syncStatus.lastSynced,
      });
      
    } catch (error) {
      console.error('Error loading user data for mobile:', error);
    }
  };
  
  const handleSync = async () => {
    try {
      await syncData(true);
      await loadUserData();
      toast.success('Data synchronized successfully');
    } catch (error) {
      console.error('Sync failed:', error);
      toast.error('Failed to synchronize data');
    }
  };
  
  if (!user) {
    return null;
  }
  
  return (
    <Card className="border border-gray-800 bg-gray-900 text-white">
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <span>Mobile App Integration</span>
          {isOnline ? (
            <Wifi className="h-5 w-5 text-green-500" />
          ) : (
            <WifiOff className="h-5 w-5 text-yellow-500" />
          )}
        </CardTitle>
      </CardHeader>
      
      <CardContent>
        {isInitializing ? (
          <div className="flex items-center justify-center py-6">
            <Loader2 className="h-6 w-6 animate-spin text-gray-400" />
          </div>
        ) : (
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <span>Available Workouts:</span>
              <span className="font-bold">{stats.workoutsCount}</span>
            </div>
            <div className="flex justify-between items-center">
              <span>Available Programs:</span>
              <span className="font-bold">{stats.programsCount}</span>
            </div>
            <div className="flex justify-between items-center">
              <span>Sync Status:</span>
              <div className="flex items-center gap-1">
                {stats.syncStatus === 'synced' && (
                  <CheckCircle className="h-4 w-4 text-green-500" />
                )}
                {stats.syncStatus === 'pending' && (
                  <RefreshCw className="h-4 w-4 text-yellow-500" />
                )}
                {stats.syncStatus === 'error' && (
                  <span className="text-red-500">⚠️</span>
                )}
                <span>{stats.syncStatus}</span>
              </div>
            </div>
            {stats.lastSynced && (
              <div className="text-xs text-gray-400">
                Last synced: {new Date(stats.lastSynced).toLocaleString()}
              </div>
            )}
          </div>
        )}
      </CardContent>
      
      <CardFooter>
        <Button 
          variant="outline"
          size="sm"
          className="w-full"
          onClick={handleSync}
          disabled={syncStatus.isSyncing || !isOnline}
        >
          {syncStatus.isSyncing ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Syncing...
            </>
          ) : (
            <>
              <RefreshCw className="mr-2 h-4 w-4" />
              Sync Data
            </>
          )}
        </Button>
      </CardFooter>
    </Card>
  );
}

export default MobileAppIntegration;
