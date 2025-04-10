
import React from 'react';
import { Card } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { ArrowDown, ArrowUp, BarChart, Medal, Trophy } from 'lucide-react';
import { useUserCombineData } from '@/hooks/useUserCombineData';
import { useAuth } from '@/hooks/useAuth';

const UserCombineComparison: React.FC = () => {
  const { user } = useAuth();
  const { 
    userEstimations, 
    nflAverages, 
    loading, 
    error, 
    calculatePercentile 
  } = useUserCombineData();

  // Helper to determine if lower value is better (40yd, 3Cone, Shuttle)
  const isLowerBetter = (drill: string) => {
    return ['40yd', '3Cone', 'Shuttle'].includes(drill);
  };

  // Helper to render the percentile badge with appropriate styling
  const renderPercentileBadge = (percentile: number | null, drill: string) => {
    if (percentile === null) return null;
    
    let color = 'bg-gray-600';
    
    if (percentile > 90) color = 'bg-green-600';
    else if (percentile > 70) color = 'bg-green-500/80';
    else if (percentile > 50) color = 'bg-yellow-600';
    else if (percentile > 30) color = 'bg-orange-600';
    else color = 'bg-red-600';
    
    const icon = isLowerBetter(drill) ? 
      <ArrowDown className="h-3 w-3 mr-1" /> : 
      <ArrowUp className="h-3 w-3 mr-1" />;
    
    return (
      <Badge className={`flex items-center ${color} border-none`}>
        {icon} Top {100 - percentile}%
      </Badge>
    );
  };

  // Helper to get the NFL average for a specific drill
  const getNFLAverage = (drill: string) => {
    const average = nflAverages.find(avg => avg.drill_name === drill);
    return average ? average.avg_score : '—';
  };

  // Helper to get the top 10% score for a specific drill
  const getTopScore = (drill: string) => {
    const average = nflAverages.find(avg => avg.drill_name === drill);
    return average ? average.top_score : '—';
  };

  if (!user) {
    return (
      <Card className="p-6 text-center">
        <h3 className="text-lg font-semibold mb-3">Compare Your Combine Stats</h3>
        <p className="text-gray-400">Sign in to see how your performance compares to NFL Combine athletes.</p>
      </Card>
    );
  }

  if (loading) {
    return (
      <Card className="p-6">
        <h3 className="text-lg font-semibold mb-3">Loading Your Combine Data...</h3>
        <div className="space-y-2">
          {[1, 2, 3].map(i => (
            <div key={i} className="h-10 bg-gray-800 animate-pulse rounded" />
          ))}
        </div>
      </Card>
    );
  }

  if (error) {
    return (
      <Card className="p-6">
        <h3 className="text-lg font-semibold mb-3">Error Loading Your Data</h3>
        <p className="text-red-400">{error}</p>
      </Card>
    );
  }

  if (userEstimations.length === 0) {
    return (
      <Card className="p-6">
        <h3 className="text-lg font-semibold mb-3">No Combine Data Available</h3>
        <p className="text-gray-400 mb-4">
          Track your workouts to get estimated NFL Combine scores based on your performance.
        </p>
        <ul className="list-disc pl-5 text-sm text-gray-400 space-y-1">
          <li>Record sprints to estimate your 40yd dash</li>
          <li>Log your bench press to compare against NFL athletes</li>
          <li>Track your vertical jump to see how you stack up</li>
        </ul>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="p-4 bg-gray-900/50">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-400">Best Performance</p>
              <h4 className="text-lg font-bold">Vertical Jump</h4>
            </div>
            <Trophy className="h-10 w-10 text-yellow-500/70" />
          </div>
          <p className="text-sm mt-2">Top 15% of NFL athletes</p>
        </Card>
        
        <Card className="p-4 bg-gray-900/50">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-400">Average Percentile</p>
              <h4 className="text-lg font-bold">62%</h4>
            </div>
            <BarChart className="h-10 w-10 text-blue-500/70" />
          </div>
          <p className="text-sm mt-2">Across all combine metrics</p>
        </Card>
        
        <Card className="p-4 bg-gray-900/50">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-400">NFL Ready</p>
              <h4 className="text-lg font-bold">2 Metrics</h4>
            </div>
            <Medal className="h-10 w-10 text-purple-500/70" />
          </div>
          <p className="text-sm mt-2">Match or exceed NFL averages</p>
        </Card>
      </div>

      {/* Detailed Comparison Table */}
      <Card className="overflow-hidden">
        <Table>
          <TableHeader className="bg-gray-900">
            <TableRow className="border-b border-gray-800">
              <TableHead>Drill</TableHead>
              <TableHead className="text-right">Your Score</TableHead>
              <TableHead className="text-right">NFL Avg</TableHead>
              <TableHead className="text-right">Top 10%</TableHead>
              <TableHead className="text-right">Percentile</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {userEstimations.map((estimation) => {
              const percentile = calculatePercentile(
                estimation.estimated_score, 
                estimation.drill_name
              );
              
              return (
                <TableRow 
                  key={estimation.id} 
                  className="border-b border-gray-800 hover:bg-gray-900/50"
                >
                  <TableCell className="font-medium">{estimation.drill_name}</TableCell>
                  <TableCell className="text-right">
                    <div className="flex items-center justify-end space-x-2">
                      <span>{estimation.estimated_score}</span>
                      <Badge variant="outline" className="text-[10px]">
                        {estimation.estimation_type}
                      </Badge>
                    </div>
                  </TableCell>
                  <TableCell className="text-right">{getNFLAverage(estimation.drill_name)}</TableCell>
                  <TableCell className="text-right">{getTopScore(estimation.drill_name)}</TableCell>
                  <TableCell className="text-right">
                    {renderPercentileBadge(percentile, estimation.drill_name)}
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </Card>

      {/* Visualization */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {userEstimations.map((estimation) => {
          const percentile = calculatePercentile(
            estimation.estimated_score, 
            estimation.drill_name
          ) || 50;
          
          return (
            <Card key={estimation.id} className="p-4 bg-gray-900/30">
              <div className="flex justify-between items-center mb-2">
                <h4 className="font-medium">{estimation.drill_name}</h4>
                <span className="text-sm text-gray-400">
                  {estimation.estimated_score} ({estimation.estimation_type})
                </span>
              </div>
              
              <div className="mb-2">
                <Progress value={percentile} className="h-2" />
              </div>
              
              <div className="text-sm text-gray-400 flex justify-between">
                <span>NFL Avg: {getNFLAverage(estimation.drill_name)}</span>
                <span>
                  {isLowerBetter(estimation.drill_name) ? 'Faster' : 'Better'} than {percentile}% of athletes
                </span>
              </div>
            </Card>
          );
        })}
      </div>
    </div>
  );
};

export default UserCombineComparison;
