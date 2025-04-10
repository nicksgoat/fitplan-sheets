
import React from 'react';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Trophy, Medal, Award, ArrowUp, ArrowDown } from 'lucide-react';

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
const leaderboardData: LeaderboardEntry[] = [
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

const LeaderboardTab: React.FC = () => {
  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-bold">NFL Combine Leaderboard</h2>
        <Badge variant="outline" className="bg-fitbloom-purple text-white">
          Weekly
        </Badge>
      </div>

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
            {leaderboardData.map((entry) => (
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

      <div className="text-center mt-6">
        <p className="text-sm text-gray-400">
          Compare your performance with NFL athletes and see where you rank!
        </p>
      </div>
    </div>
  );
};

export default LeaderboardTab;
