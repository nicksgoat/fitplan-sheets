
import React from 'react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Trophy, Medal, Award } from 'lucide-react';

interface LeaderboardTabProps {
  itemTitle: string;
  itemType: 'exercise' | 'workout' | 'program' | 'collection';
}

// Mock data for the leaderboard
const leaderboardData = [
  { id: 1, name: 'Alex Johnson', avatar: '/avatars/alex.jpg', score: 980, completions: 12 },
  { id: 2, name: 'Jamie Smith', avatar: '/avatars/jamie.jpg', score: 840, completions: 10 },
  { id: 3, name: 'Taylor Doe', avatar: '/avatars/taylor.jpg', score: 810, completions: 9 },
  { id: 4, name: 'Jordan Clark', avatar: '/avatars/jordan.jpg', score: 765, completions: 8 },
  { id: 5, name: 'Casey Wilson', avatar: '/avatars/casey.jpg', score: 720, completions: 8 },
];

const LeaderboardTab: React.FC<LeaderboardTabProps> = ({ itemTitle, itemType }) => {
  // Function to get the proper label based on the item type
  const getCompletionLabel = () => {
    switch (itemType) {
      case 'exercise':
        return 'Times Performed';
      case 'workout':
        return 'Workouts Completed';
      case 'program':
        return 'Days Completed';
      case 'collection':
        return 'Items Completed';
      default:
        return 'Completions';
    }
  };

  // Function to get the icon for a rank
  const getRankIcon = (rank: number) => {
    switch (rank) {
      case 1:
        return <Trophy className="h-6 w-6 text-yellow-500" />;
      case 2:
        return <Medal className="h-6 w-6 text-slate-400" />;
      case 3:
        return <Award className="h-6 w-6 text-amber-700" />;
      default:
        return <span className="flex items-center justify-center h-6 w-6 font-semibold text-gray-500">{rank}</span>;
    }
  };

  return (
    <div className="space-y-4">
      <div className="mb-6">
        <h2 className="text-lg font-semibold mb-1">Leaderboard</h2>
        <p className="text-sm text-gray-400">See who's leading the way with {itemTitle}</p>
      </div>
      
      <div className="space-y-3">
        {leaderboardData.map((user, index) => (
          <Card key={user.id} className="p-3 flex items-center bg-gray-900 border-gray-800">
            <div className="flex items-center justify-center w-8 mr-3">
              {getRankIcon(index + 1)}
            </div>
            
            <Avatar className="h-10 w-10 border border-gray-700">
              <AvatarImage src={user.avatar} alt={user.name} />
              <AvatarFallback className="bg-fitbloom-purple text-white">
                {user.name.split(' ').map(n => n[0]).join('')}
              </AvatarFallback>
            </Avatar>
            
            <div className="ml-3 flex-grow">
              <p className="font-medium text-sm">{user.name}</p>
              <div className="flex items-center mt-1">
                <Badge variant="outline" className="mr-2 text-[10px] py-0 px-1.5 bg-gray-800">
                  {user.score} pts
                </Badge>
                <span className="text-xs text-gray-400">{user.completions} {getCompletionLabel()}</span>
              </div>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
};

export default LeaderboardTab;
