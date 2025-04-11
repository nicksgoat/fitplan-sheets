
import React from 'react';
import { Info, ArrowRight } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';

interface UserCombineEstimation {
  id: string;
  user_id: string;
  drill_name: string;
  estimated_score: string;
  estimation_type: 'estimated' | 'actual' | 'placeholder';
  percentile?: number;
  position_percentile?: number;
}

interface NFLAverage {
  drill_name: string;
  avg_score: string;
}

interface UserStatsCardProps {
  userEstimation: UserCombineEstimation | null;
  nflAverage: NFLAverage | null;
  sortMetric: string;
  onNavigateToYourCombine: (e: React.MouseEvent) => void;
}

const UserStatsCard: React.FC<UserStatsCardProps> = ({
  userEstimation,
  nflAverage,
  sortMetric,
  onNavigateToYourCombine
}) => {
  if (!userEstimation) return null;

  return (
    <Card className="p-3 bg-gray-900/30 border border-gray-700 flex items-center justify-between">
      <div className="flex items-center space-x-3">
        <Badge className="mr-1 bg-fitbloom-purple">Your {sortMetric}</Badge>
        <span className="font-semibold">{userEstimation.estimated_score}</span>
        
        <Badge variant="outline" className="text-xs">
          {userEstimation.estimation_type}
        </Badge>
        
        {userEstimation.percentile !== undefined && (
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Badge className={`${
                  userEstimation.percentile > 75 ? 'bg-green-600' : 
                  userEstimation.percentile > 50 ? 'bg-blue-600' : 
                  userEstimation.percentile > 25 ? 'bg-yellow-600' : 
                  'bg-red-600'
                } text-white`}>
                  Top {100 - userEstimation.percentile}%
                </Badge>
              </TooltipTrigger>
              <TooltipContent>
                <p>You're better than {userEstimation.percentile}% of NFL players in this drill</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        )}
      </div>
      
      <div className="flex items-center">
        {nflAverage && (
          <div className="mr-4 flex items-center">
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <div className="flex items-center text-sm text-gray-400">
                    <Info className="h-3 w-3 mr-1" />
                    NFL Avg: <span className="font-medium ml-1 text-white">{nflAverage.avg_score}</span>
                  </div>
                </TooltipTrigger>
                <TooltipContent>
                  <p>Average score for NFL athletes in this drill</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          </div>
        )}
        
        <a 
          href="#" 
          onClick={onNavigateToYourCombine}
          className="flex items-center text-sm text-blue-400 hover:text-blue-300"
        >
          View all your stats <ArrowRight className="h-3 w-3 ml-1" />
        </a>
      </div>
    </Card>
  );
};

export default UserStatsCard;
