
import React, { useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import NFLCombineTab from '@/components/leaderboard/NFLCombineTab';
import LeaderboardTab from '@/components/leaderboard/LeaderboardTab';
import UserCombineComparison from '@/components/leaderboard/UserCombineComparison';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { CircleDashed, Database } from 'lucide-react';
import { toast } from 'sonner';
import { useAuth } from '@/hooks/useAuth';

const Leaderboards = () => {
  const [activeTab, setActiveTab] = useState("nfl-combine");
  const [isInitializing, setIsInitializing] = useState(false);
  const { user } = useAuth();

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
            <h1 className="text-2xl font-bold mb-2">Leaderboards</h1>
            <p className="text-muted-foreground">
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
            <TabsTrigger value="nfl-combine">NFL Combine</TabsTrigger>
            <TabsTrigger value="your-combine">Your Stats</TabsTrigger>
            <TabsTrigger value="local">Local</TabsTrigger>
            <TabsTrigger value="friends">Friends</TabsTrigger>
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
