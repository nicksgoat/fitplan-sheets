import React from 'react';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { ArrowUpDown, Star, Trophy, TrendingUp, TrendingDown, Loader2, AlertCircle } from 'lucide-react';

interface NFLCombineResult {
  id: number;
  Player: string;
  Pos: string;
  School: string;
  "40yd": string;
  Vertical: string;
  Bench: string;
  "Broad Jump": string;
  "3Cone": string;
  Shuttle: string;
  Draft_Team: string;
  Draft_Year: number;
  Height_in: number;
  Weight_lb: number;
}

interface UserCombineEstimation {
  id: string;
  user_id: string;
  drill_name: string;
  estimated_score: string;
  estimation_type: 'estimated' | 'actual' | 'placeholder';
  percentile?: number;
  position_percentile?: number;
}

interface CombineDataTableProps {
  combineData: NFLCombineResult[];
  userEstimation?: UserCombineEstimation | null;
  isLoading: boolean;
  error: string | null;
  sortMetric: string;
}

const CombineDataTable: React.FC<CombineDataTableProps> = ({
  combineData,
  userEstimation,
  isLoading,
  error,
  sortMetric
}) => {
  console.log('CombineDataTable props:', {
    combineDataLength: combineData?.length,
    sortMetric,
    isLoading,
    hasError: !!error,
    sampleData: combineData?.length > 0 ? combineData[0] : null
  });

  // Helper to determine if user beats the NFL player's score
  const userBeatsStat = (player: NFLCombineResult): boolean => {
    if (!userEstimation || userEstimation.drill_name !== sortMetric) return false;
    
    const userScore = parseFloat(userEstimation.estimated_score);
    const playerScore = parseFloat(player[sortMetric as keyof NFLCombineResult] as string);
    
    if (isNaN(userScore) || isNaN(playerScore)) return false;
    
    // For 40yd, 3Cone, Shuttle - lower is better; for others higher is better
    if (['40yd', '3Cone', 'Shuttle'].includes(sortMetric)) {
      return userScore < playerScore;
    } else {
      return userScore > playerScore;
    }
  };

  // Get display name for the current metric
  const getMetricDisplayName = (metric: string): string => {
    switch (metric) {
      case '40yd': return '40-Yard Dash (seconds)';
      case 'Vertical': return 'Vertical Jump (inches)';
      case 'Bench': return 'Bench Press (reps)';
      case 'Broad Jump': return 'Broad Jump (inches)';
      case '3Cone': return '3-Cone Drill (seconds)';
      case 'Shuttle': return 'Shuttle (seconds)';
      default: return metric;
    }
  };

  // Determine if lower values are better for this metric
  const isLowerBetter = (metric: string): string => {
    return ['40yd', '3Cone', 'Shuttle'].includes(metric);
  };

  // Get the actual metric value from the player record
  const getPlayerMetricValue = (player: NFLCombineResult): string => {
    const value = player[sortMetric as keyof NFLCombineResult];
    return value?.toString() || '-';
  };

  return (
    <div className="rounded-md border border-gray-800 overflow-hidden">
      <Table>
        <TableHeader className="bg-gray-900 sticky top-0">
          <TableRow className="border-b border-gray-800">
            <TableHead className="whitespace-nowrap">Rank</TableHead>
            <TableHead className="whitespace-nowrap">Player</TableHead>
            <TableHead className="text-center whitespace-nowrap">Position</TableHead>
            <TableHead className="whitespace-nowrap">School</TableHead>
            <TableHead className="text-center whitespace-nowrap">
              <div className="flex items-center justify-center gap-1">
                {getMetricDisplayName(sortMetric)}
                <ArrowUpDown className="h-3 w-3" />
              </div>
            </TableHead>
            <TableHead className="text-center whitespace-nowrap">Draft Year</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {isLoading ? (
            <TableRow>
              <TableCell colSpan={6} className="h-24 text-center">
                <div className="flex items-center justify-center">
                  <Loader2 className="h-6 w-6 animate-spin mr-2" />
                  Loading combine data...
                </div>
              </TableCell>
            </TableRow>
          ) : error ? (
            <TableRow>
              <TableCell colSpan={6} className="h-24">
                <div className="flex flex-col items-center justify-center text-center text-red-400 p-4">
                  <AlertCircle className="h-6 w-6 mb-2" />
                  <p className="font-semibold">{error}</p>
                  <p className="text-sm mt-1">Please try adjusting filters or initialize the data.</p>
                </div>
              </TableCell>
            </TableRow>
          ) : combineData.length === 0 ? (
            <TableRow>
              <TableCell colSpan={6} className="h-24">
                <div className="flex flex-col items-center justify-center text-center p-4">
                  <p className="font-semibold">No combine data found</p>
                  <p className="text-sm mt-1">Try initializing data using the button on the top right.</p>
                </div>
              </TableCell>
            </TableRow>
          ) : (
            combineData.map((player, index) => (
              <TableRow 
                key={index} 
                className={`border-b border-gray-800 hover:bg-gray-900/50 ${index % 2 === 0 ? 'bg-gray-900/20' : ''} ${userBeatsStat(player) ? 'bg-green-900/10' : ''}`}
              >
                <TableCell className="font-medium text-center">
                  {index + 1}
                </TableCell>
                <TableCell className="font-medium">{player.Player || '-'}</TableCell>
                <TableCell className="text-center">
                  <Badge variant="outline" className="bg-gray-800 text-gray-300">
                    {player.Pos || '-'}
                  </Badge>
                </TableCell>
                <TableCell>{player.School || '-'}</TableCell>
                <TableCell className={`text-center font-semibold ${userBeatsStat(player) ? 'text-green-400' : ''}`}>
                  <div className="flex items-center justify-center">
                    {userBeatsStat(player) && <Star className="h-3 w-3 mr-1 text-yellow-500" />}
                    <span className="text-lg">{getPlayerMetricValue(player)}</span>
                    
                    {/* Show trend icon for first 5 places */}
                    {index < 5 && (
                      isLowerBetter(sortMetric) 
                        ? <TrendingDown className="h-3 w-3 ml-1 text-green-500" /> 
                        : <TrendingUp className="h-3 w-3 ml-1 text-green-500" />
                    )}
                    
                    {/* Show trophy for first place */}
                    {index === 0 && <Trophy className="h-3 w-3 ml-1 text-yellow-500" />}
                  </div>
                </TableCell>
                <TableCell className="text-center">{player.Draft_Year || '-'}</TableCell>
              </TableRow>
            ))
          )}
        </TableBody>
      </Table>
    </div>
  );
};

export default CombineDataTable;
