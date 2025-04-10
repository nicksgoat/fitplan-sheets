
import React from 'react';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { ArrowUpDown, Star } from 'lucide-react';

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
  // Helper to determine if user beats the NFL player's score
  const userBeatsStat = (player: NFLCombineResult, metric: string): boolean => {
    if (!userEstimation || userEstimation.drill_name !== metric) return false;
    
    const userScore = parseFloat(userEstimation.estimated_score);
    const playerScore = parseFloat(player[metric as keyof NFLCombineResult] as string);
    
    if (isNaN(userScore) || isNaN(playerScore)) return false;
    
    // For 40yd, 3Cone, Shuttle - lower is better; for others higher is better
    if (['40yd', '3Cone', 'Shuttle'].includes(metric)) {
      return userScore < playerScore;
    } else {
      return userScore > playerScore;
    }
  };

  return (
    <div className="rounded-md border border-gray-800 overflow-hidden">
      <Table>
        <TableHeader className="bg-gray-900 sticky top-0">
          <TableRow className="border-b border-gray-800">
            <TableHead className="whitespace-nowrap">Player</TableHead>
            <TableHead className="text-center whitespace-nowrap">Position</TableHead>
            <TableHead className="whitespace-nowrap">School</TableHead>
            <TableHead className="text-center whitespace-nowrap">
              <div className="flex items-center justify-center gap-1">
                40-Yard
                {sortMetric === '40yd' && <ArrowUpDown className="h-3 w-3" />}
              </div>
            </TableHead>
            <TableHead className="text-center whitespace-nowrap">
              <div className="flex items-center justify-center gap-1">
                Vertical
                {sortMetric === 'Vertical' && <ArrowUpDown className="h-3 w-3" />}
              </div>
            </TableHead>
            <TableHead className="text-center whitespace-nowrap">
              <div className="flex items-center justify-center gap-1">
                Bench
                {sortMetric === 'Bench' && <ArrowUpDown className="h-3 w-3" />}
              </div>
            </TableHead>
            <TableHead className="text-center whitespace-nowrap">
              <div className="flex items-center justify-center gap-1">
                Broad Jump
                {sortMetric === 'Broad Jump' && <ArrowUpDown className="h-3 w-3" />}
              </div>
            </TableHead>
            <TableHead className="text-center whitespace-nowrap">
              <div className="flex items-center justify-center gap-1">
                3-Cone
                {sortMetric === '3Cone' && <ArrowUpDown className="h-3 w-3" />}
              </div>
            </TableHead>
            <TableHead className="text-center whitespace-nowrap">
              <div className="flex items-center justify-center gap-1">
                Shuttle
                {sortMetric === 'Shuttle' && <ArrowUpDown className="h-3 w-3" />}
              </div>
            </TableHead>
            <TableHead className="whitespace-nowrap">Drafted By</TableHead>
            <TableHead className="text-center whitespace-nowrap">Year</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {isLoading ? (
            <TableRow>
              <TableCell colSpan={11} className="h-24 text-center">
                Loading combine data...
              </TableCell>
            </TableRow>
          ) : error ? (
            <TableRow>
              <TableCell colSpan={11} className="h-24 text-center text-red-400">
                {error}. Please try adjusting filters or try again later.
              </TableCell>
            </TableRow>
          ) : combineData.length === 0 ? (
            <TableRow>
              <TableCell colSpan={11} className="h-24 text-center">
                No combine data found. Try adjusting filters or selecting a different sort metric.
              </TableCell>
            </TableRow>
          ) : (
            combineData.map((player) => (
              <TableRow 
                key={player.id} 
                className="border-b border-gray-800 hover:bg-gray-900/50 even:bg-gray-900/20"
              >
                <TableCell className="font-medium">{player.Player || '-'}</TableCell>
                <TableCell className="text-center">
                  <Badge variant="outline" className="bg-gray-800 text-gray-300">
                    {player.Pos || '-'}
                  </Badge>
                </TableCell>
                <TableCell>{player.School || '-'}</TableCell>
                <TableCell className={`text-center ${userBeatsStat(player, '40yd') ? 'text-green-400' : ''}`}>
                  <div className="flex items-center justify-center">
                    {userBeatsStat(player, '40yd') && <Star className="h-3 w-3 mr-1 text-yellow-500" />}
                    {player["40yd"] || '-'}
                  </div>
                </TableCell>
                <TableCell className={`text-center ${userBeatsStat(player, 'Vertical') ? 'text-green-400' : ''}`}>
                  <div className="flex items-center justify-center">
                    {userBeatsStat(player, 'Vertical') && <Star className="h-3 w-3 mr-1 text-yellow-500" />}
                    {player.Vertical || '-'}
                  </div>
                </TableCell>
                <TableCell className={`text-center ${userBeatsStat(player, 'Bench') ? 'text-green-400' : ''}`}>
                  <div className="flex items-center justify-center">
                    {userBeatsStat(player, 'Bench') && <Star className="h-3 w-3 mr-1 text-yellow-500" />}
                    {player.Bench || '-'}
                  </div>
                </TableCell>
                <TableCell className={`text-center ${userBeatsStat(player, 'Broad Jump') ? 'text-green-400' : ''}`}>
                  <div className="flex items-center justify-center">
                    {userBeatsStat(player, 'Broad Jump') && <Star className="h-3 w-3 mr-1 text-yellow-500" />}
                    {player["Broad Jump"] || '-'}
                  </div>
                </TableCell>
                <TableCell className={`text-center ${userBeatsStat(player, '3Cone') ? 'text-green-400' : ''}`}>
                  <div className="flex items-center justify-center">
                    {userBeatsStat(player, '3Cone') && <Star className="h-3 w-3 mr-1 text-yellow-500" />}
                    {player["3Cone"] || '-'}
                  </div>
                </TableCell>
                <TableCell className={`text-center ${userBeatsStat(player, 'Shuttle') ? 'text-green-400' : ''}`}>
                  <div className="flex items-center justify-center">
                    {userBeatsStat(player, 'Shuttle') && <Star className="h-3 w-3 mr-1 text-yellow-500" />}
                    {player.Shuttle || '-'}
                  </div>
                </TableCell>
                <TableCell>{player.Draft_Team || '-'}</TableCell>
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
