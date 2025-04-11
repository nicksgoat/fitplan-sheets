
import React, { useState, useEffect } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import NFLCombineTab from '@/components/leaderboard/NFLCombineTab';
import LeaderboardTab from '@/components/leaderboard/LeaderboardTab';
import UserCombineComparison from '@/components/leaderboard/UserCombineComparison';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { CircleDashed, Database, Award } from 'lucide-react';
import { toast } from 'sonner';
import { useAuth } from '@/hooks/useAuth';

const Leaderboards = () => {
  const [activeTab, setActiveTab] = useState("nfl-combine");
  const [isInitializing, setIsInitializing] = useState(false);
  const { user } = useAuth();

  // Check if we have combine data on mount
  useEffect(() => {
    const checkCombineData = async () => {
      try {
        const { count, error } = await supabase
          .from('NFL Combine Database')
          .select('*', { count: 'exact', head: true });
        
        if (error) {
          console.error("Error checking combine data:", error);
          return;
        }
        
        if (count === 0) {
          toast.info("No combine data found. Please initialize data to see NFL combine statistics.", {
            duration: 5000,
          });
        }
      } catch (err) {
        console.error("Failed to check combine data:", err);
      }
    };
    
    checkCombineData();
  }, []);

  // Function to initialize sample data
  const initializeCombineData = async () => {
    if (!user) {
      toast.error("Please sign in to initialize combine data");
      return;
    }
    
    setIsInitializing(true);
    toast.info("Setting up combine correlations...");

    try {
      // Call our edge function to set up sample correlations
      const { data, error } = await supabase.functions.invoke('setup-combine-correlations');

      if (error) {
        throw error;
      }

      toast.success("Combine correlations initialized successfully!");
      // Switch to the user's combine tab to see the results
      setActiveTab("your-combine");
    } catch (error) {
      console.error("Error initializing combine data:", error);
      toast.error("Failed to initialize combine data");
    } finally {
      setIsInitializing(false);
    }
  };

  return (
    <div className="container max-w-6xl mx-auto pb-safe">
      <div className="flex flex-col gap-6 p-4">
        <div className="flex justify-between items-center">
          <div>
            <div className="flex items-center gap-2">
              <Award className="h-6 w-6 text-fitbloom-purple" />
              <h1 className="text-2xl font-bold">Performance Stats</h1>
            </div>
            <p className="text-muted-foreground mt-2">
              Compare yourself with athletes and see where you rank
            </p>
          </div>
          
          {user && (
            <Button
              variant="outline"
              size="sm"
              onClick={initializeCombineData}
              disabled={isInitializing}
              className="flex items-center gap-1"
            >
              {isInitializing ? (
                <>
                  <CircleDashed className="h-4 w-4 animate-spin" /> Initializing...
                </>
              ) : (
                <>
                  <Database className="h-4 w-4" /> Initialize Data
                </>
              )}
            </Button>
          )}
        </div>
        
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid grid-cols-4 md:w-[500px]">
            <TabsTrigger value="nfl-combine" data-value="nfl-combine">NFL Combine</TabsTrigger>
            <TabsTrigger value="your-combine" data-value="your-combine">Your Stats</TabsTrigger>
            <TabsTrigger value="local" data-value="local">Local</TabsTrigger>
            <TabsTrigger value="friends" data-value="friends">Friends</TabsTrigger>
          </TabsList>
          
          <TabsContent value="nfl-combine" className="mt-6">
            <NFLCombineTab />
          </TabsContent>
          
          <TabsContent value="your-combine" className="mt-6">
            <UserCombineComparison />
          </TabsContent>
          
          <TabsContent value="local" className="mt-6">
            <LeaderboardTab />
          </TabsContent>
          
          <TabsContent value="friends" className="mt-6">
            <div className="flex flex-col items-center justify-center min-h-[200px] p-8 text-center border border-dashed border-gray-800 rounded-lg">
              <h3 className="text-xl font-semibold mb-2">Friends Leaderboard</h3>
              <p className="text-gray-400">
                Connect with friends to see how your performance compares to theirs.
              </p>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default Leaderboards;
