
import React, { useState } from 'react';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Trophy, Medal, Award, ArrowUp, ArrowDown } from 'lucide-react';
import {
  NavigationMenu,
  NavigationMenuContent,
  NavigationMenuItem,
  NavigationMenuLink,
  NavigationMenuList,
  NavigationMenuTrigger,
} from "@/components/ui/navigation-menu";
import { cn } from '@/lib/utils';

interface LeaderboardEntry {
  id: string;
  rank: number;
  name: string;
  avatar?: string;
  score: number;
  change?: 'up' | 'down' | 'none';
  position: string;
}

// Mock data for the leaderboard
const nflCombineData: LeaderboardEntry[] = [
  { id: '1', rank: 1, name: 'Alex Johnson', score: 980, change: 'up', position: 'WR' },
  { id: '2', rank: 2, name: 'Jamie Smith', score: 945, change: 'none', position: 'RB' },
  { id: '3', rank: 3, name: 'Taylor Doe', score: 910, change: 'up', position: 'QB' },
  { id: '4', rank: 4, name: 'Jordan Clark', score: 890, change: 'down', position: 'LB' },
  { id: '5', rank: 5, name: 'Casey Wilson', score: 875, change: 'down', position: 'WR' },
  { id: '6', rank: 6, name: 'Riley Thompson', score: 860, change: 'up', position: 'DB' },
  { id: '7', rank: 7, name: 'Morgan White', score: 845, change: 'none', position: 'TE' },
  { id: '8', rank: 8, name: 'Drew Garcia', score: 830, change: 'down', position: 'OL' },
  { id: '9', rank: 9, name: 'Avery Martin', score: 810, change: 'up', position: 'DL' },
  { id: '10', rank: 10, name: 'Cameron Lee', score: 800, change: 'none', position: 'S' },
];

// Data for different leaderboard types
const localLeaderboardData: LeaderboardEntry[] = [
  { id: '1', rank: 1, name: 'Sam Johnson', score: 850, change: 'up', position: 'WR' },
  { id: '2', rank: 2, name: 'Pat Williams', score: 830, change: 'none', position: 'RB' },
  // ... more entries
];

// Function to get the rank icon
const getRankIcon = (rank: number) => {
  switch (rank) {
    case 1:
      return <Trophy className="h-5 w-5 text-yellow-500" />;
    case 2:
      return <Medal className="h-5 w-5 text-slate-400" />;
    case 3:
      return <Award className="h-5 w-5 text-amber-700" />;
    default:
      return <span className="font-semibold text-gray-500">{rank}</span>;
  }
};

// Function to get the change icon
const getChangeIcon = (change?: 'up' | 'down' | 'none') => {
  switch (change) {
    case 'up':
      return <ArrowUp className="h-4 w-4 text-green-500" />;
    case 'down':
      return <ArrowDown className="h-4 w-4 text-red-500" />;
    default:
      return null;
  }
};

const Leaderboards: React.FC = () => {
  const [leaderboardType, setLeaderboardType] = useState<'nfl' | 'local' | 'friends'>('nfl');
  const [positionFilter, setPositionFilter] = useState<string | null>(null);

  // Get leaderboard data based on selected type
  const getLeaderboardData = () => {
    switch (leaderboardType) {
      case 'nfl':
        return nflCombineData;
      case 'local':
        return localLeaderboardData;
      case 'friends':
        return nflCombineData.slice(0, 5); // Just for demonstration
      default:
        return nflCombineData;
    }
  };

  // Filter by position if needed
  const filteredData = positionFilter 
    ? getLeaderboardData().filter(entry => entry.position === positionFilter)
    : getLeaderboardData();

  // Get unique positions for filter
  const positions = Array.from(new Set(getLeaderboardData().map(entry => entry.position)));

  return (
    <div className="container max-w-6xl mx-auto pb-safe">
      <div className="flex flex-col gap-6 p-4">
        <div>
          <h1 className="text-2xl font-bold mb-2">Leaderboards</h1>
          <p className="text-muted-foreground">
            Compare yourself with NFL athletes and see where you rank
          </p>
        </div>
        
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          {/* Leaderboard Type Selection */}
          <div className="flex space-x-2">
            <Badge 
              variant={leaderboardType === 'nfl' ? 'default' : 'outline'} 
              className={`cursor-pointer ${leaderboardType === 'nfl' ? 'bg-fitbloom-purple hover:bg-fitbloom-purple/90' : ''}`}
              onClick={() => setLeaderboardType('nfl')}
            >
              NFL Combine
            </Badge>
            <Badge 
              variant={leaderboardType === 'local' ? 'default' : 'outline'} 
              className={`cursor-pointer ${leaderboardType === 'local' ? 'bg-fitbloom-purple hover:bg-fitbloom-purple/90' : ''}`}
              onClick={() => setLeaderboardType('local')}
            >
              Local
            </Badge>
            <Badge 
              variant={leaderboardType === 'friends' ? 'default' : 'outline'} 
              className={`cursor-pointer ${leaderboardType === 'friends' ? 'bg-fitbloom-purple hover:bg-fitbloom-purple/90' : ''}`}
              onClick={() => setLeaderboardType('friends')}
            >
              Friends
            </Badge>
          </div>

          {/* Position Filter */}
          <NavigationMenu>
            <NavigationMenuList>
              <NavigationMenuItem>
                <NavigationMenuTrigger className="bg-transparent hover:bg-gray-900">
                  {positionFilter ? `Position: ${positionFilter}` : 'Filter by Position'}
                </NavigationMenuTrigger>
                <NavigationMenuContent>
                  <ul className="grid w-[200px] gap-1 p-2 bg-gray-900 border border-gray-800 rounded-md">
                    <li className="row-span-1">
                      <NavigationMenuLink asChild>
                        <a
                          className={cn(
                            "block select-none space-y-1 rounded-md p-2 leading-none no-underline outline-none transition-colors hover:bg-gray-800 hover:text-accent-foreground focus:bg-gray-800 focus:text-accent-foreground",
                            !positionFilter && "bg-gray-800"
                          )}
                          onClick={() => setPositionFilter(null)}
                        >
                          <div className="text-sm font-medium leading-none">All Positions</div>
                        </a>
                      </NavigationMenuLink>
                    </li>
                    {positions.map((position) => (
                      <li key={position} className="row-span-1">
                        <NavigationMenuLink asChild>
                          <a
                            className={cn(
                              "block select-none space-y-1 rounded-md p-2 leading-none no-underline outline-none transition-colors hover:bg-gray-800 hover:text-accent-foreground focus:bg-gray-800 focus:text-accent-foreground",
                              positionFilter === position && "bg-gray-800"
                            )}
                            onClick={() => setPositionFilter(position)}
                          >
                            <div className="text-sm font-medium leading-none">{position}</div>
                          </a>
                        </NavigationMenuLink>
                      </li>
                    ))}
                  </ul>
                </NavigationMenuContent>
              </NavigationMenuItem>
            </NavigationMenuList>
          </NavigationMenu>
        </div>

        {/* Leaderboard Table */}
        <div className="rounded-md border border-gray-800 overflow-hidden">
          <Table>
            <TableHeader className="bg-gray-900">
              <TableRow className="border-b border-gray-800">
                <TableHead className="w-12 text-center">Rank</TableHead>
                <TableHead>Player</TableHead>
                <TableHead className="text-center">Position</TableHead>
                <TableHead className="text-right">Score</TableHead>
                <TableHead className="w-12 text-center">Change</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredData.map((entry) => (
                <TableRow 
                  key={entry.id} 
                  className="border-b border-gray-800 hover:bg-gray-900/50"
                >
                  <TableCell className="text-center">
                    {getRankIcon(entry.rank)}
                  </TableCell>
                  <TableCell className="font-medium">{entry.name}</TableCell>
                  <TableCell className="text-center">
                    <Badge variant="outline" className="bg-gray-800 text-gray-300">
                      {entry.position}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-right font-semibold">{entry.score}</TableCell>
                  <TableCell className="text-center">
                    {getChangeIcon(entry.change)}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>

        {/* Explanatory Text */}
        <div className="p-4 bg-gray-900/30 border border-gray-800 rounded-lg">
          <h3 className="text-lg font-semibold mb-2">About NFL Combine Scoring</h3>
          <p className="text-gray-300">
            Our combine scoring system evaluates athletic performance across various drills including the 40-yard dash, 
            vertical jump, broad jump, 3-cone drill, and bench press. Scores are normalized across positions to 
            provide meaningful comparisons.
          </p>
          <div className="mt-4">
            <h4 className="font-medium mb-1">How it works:</h4>
            <ul className="list-disc pl-5 space-y-1 text-sm text-gray-400">
              <li>Track your performance in FitBloom workouts</li>
              <li>We'll estimate your combine metrics based on your exercise results</li>
              <li>See how you compare to NFL athletes at your position</li>
              <li>Follow your progress over time with detailed analytics</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Leaderboards;
