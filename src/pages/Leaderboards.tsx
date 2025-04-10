
import React, { useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import NFLCombineTab from '@/components/leaderboard/NFLCombineTab';
import LeaderboardTab from '@/components/leaderboard/LeaderboardTab';
import UserCombineComparison from '@/components/leaderboard/UserCombineComparison';

const Leaderboards = () => {
  const [activeTab, setActiveTab] = useState("nfl-combine");

  return (
    <div className="container max-w-6xl mx-auto pb-safe">
      <div className="flex flex-col gap-6 p-4">
        <div>
          <h1 className="text-2xl font-bold mb-2">Leaderboards</h1>
          <p className="text-muted-foreground">
            Compare yourself with athletes and see where you rank
          </p>
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
