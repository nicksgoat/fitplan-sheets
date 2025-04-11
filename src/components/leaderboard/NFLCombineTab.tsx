import React, { useState, useEffect } from 'react';
import CombineFilters from './filters/CombineFilters';
import CombineDataTable from './tables/CombineDataTable';
import CombineInfoSection from './info/CombineInfoSection';
import { useNFLCombineData } from '@/hooks/useNFLCombineData';
import { useUserCombineData } from '@/hooks/useUserCombineData';
import { useAuth } from '@/hooks/useAuth';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ArrowRight, Info, Trophy, Activity } from 'lucide-react';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { Separator } from '@/components/ui/separator';

const NFLCombineTab: React.FC = () => {
  const [selectedPosition, setSelectedPosition] = useState<string | null>(null);
  const [selectedYear, setSelectedYear] = useState<number | null>(null);
  const [sortMetric, setSortMetric] = useState<string>("40yd");
  const { user } = useAuth();
  
  const { 
    combineData,
    positions,
    years,
    isLoading,
    error,
    fetchCombineData,
    fetchFilterOptions
  } = useNFLCombineData();

  const {
    userEstimations,
    nflAverages,
    loading: loadingUserData,
    calculatePercentile
  } = useUserCombineData();

  const getUserEstimationForMetric = () => {
    if (!sortMetric || !userEstimations || userEstimations.length === 0) return null;
    
    return userEstimations.find(est => est.drill_name === sortMetric);
  };
  
  useEffect(() => {
    fetchFilterOptions();
  }, []);

  useEffect(() => {
    if (selectedPosition) localStorage.setItem('nfl_combine_position', selectedPosition);
    if (selectedYear) localStorage.setItem('nfl_combine_year', selectedYear.toString());
    localStorage.setItem('nfl_combine_sort', sortMetric);

    fetchCombineData(selectedPosition, selectedYear, sortMetric);
  }, [selectedPosition, selectedYear, sortMetric]);

  useEffect(() => {
    const savedPosition = localStorage.getItem('nfl_combine_position');
    const savedYear = localStorage.getItem('nfl_combine_year');
    const savedSort = localStorage.getItem('nfl_combine_sort');

    if (savedPosition) setSelectedPosition(savedPosition);
    if (savedYear) setSelectedYear(parseInt(savedYear));
    if (savedSort) setSortMetric(savedSort);
  }, []);

  const handlePositionChange = (value: string) => {
    setSelectedPosition(value === 'all' ? null : value);
  };

  const handleYearChange = (value: string) => {
    setSelectedYear(value === 'all' ? null : parseInt(value));
  };

  const clearFilters = () => {
    setSelectedPosition(null);
    setSelectedYear(null);
    localStorage.removeItem('nfl_combine_position');
    localStorage.removeItem('nfl_combine_year');
  };

  const userEstimation = getUserEstimationForMetric();
  
  const getNFLAverageForMetric = () => {
    if (!sortMetric || !nflAverages || nflAverages.length === 0) return null;
    return nflAverages.find(avg => avg.drill_name === sortMetric);
  };
  
  const nflAverage = getNFLAverageForMetric();

  const navigateToYourCombine = (e: React.MouseEvent) => {
    e.preventDefault();
    const yourCombineTab = document.querySelector('[data-value="your-combine"]');
    if (yourCombineTab && 'click' in yourCombineTab) {
      (yourCombineTab as HTMLElement).click();
    }
  };

  const getMetricDisplayName = (metric: string): string => {
    const metricNames = {
      '40yd': '40-Yard Dash',
      'Vertical': 'Vertical Jump',
      'Bench': 'Bench Press',
      'Broad Jump': 'Broad Jump',
      '3Cone': '3-Cone Drill',
      'Shuttle': 'Shuttle'
    };
    return metricNames[metric as keyof typeof metricNames] || metric;
  };

  const isLowerValueBetter = (metric: string): boolean => {
    return ['40yd', '3Cone', 'Shuttle'].includes(metric);
  };

  return (
    <div className="space-y-6">
      <Card className="p-4 bg-gray-900/50 border border-gray-700">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Activity className="h-5 w-5 text-fitbloom-purple" />
            <h2 className="text-lg font-semibold">
              {getMetricDisplayName(sortMetric)}
            </h2>
          </div>
          
          {nflAverage && (
            <Badge variant="outline" className="font-mono">
              NFL Avg: {nflAverage.avg_score}
              {isLowerValueBetter(sortMetric) ? ' (lower is better)' : ' (higher is better)'}
            </Badge>
          )}
        </div>
        
        <Separator className="my-3" />
        
        <p className="text-sm text-gray-300">
          {sortMetric === '40yd' && 'The 40-yard dash measures a player\'s straight-line speed. Lower times indicate faster players.'}
          {sortMetric === 'Vertical' && 'The vertical jump measures a player\'s lower-body explosiveness and leaping ability.'}
          {sortMetric === 'Bench' && 'The bench press (225 lbs) tests upper body strength and endurance.'}
          {sortMetric === 'Broad Jump' && 'The broad jump measures a player\'s lower-body explosiveness and horizontal power.'}
          {sortMetric === '3Cone' && 'The 3-cone drill tests a player\'s ability to change directions at high speeds.'}
          {sortMetric === 'Shuttle' && 'The shuttle run measures short-area quickness, acceleration and lateral movement.'}
        </p>
      </Card>

      <CombineFilters 
        positions={positions}
        years={years}
        selectedPosition={selectedPosition}
        selectedYear={selectedYear}
        sortMetric={sortMetric}
        onPositionChange={handlePositionChange}
        onYearChange={handleYearChange}
        onSortChange={setSortMetric}
        onClearFilters={clearFilters}
      />

      {user && userEstimation && (
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
              onClick={navigateToYourCombine}
              className="flex items-center text-sm text-blue-400 hover:text-blue-300"
            >
              View all your stats <ArrowRight className="h-3 w-3 ml-1" />
            </a>
          </div>
        </Card>
      )}

      {error && (
        <div className="p-4 text-center text-red-400 bg-red-900/20 border border-red-800 rounded-lg">
          {error}. Please try adjusting filters or try again later.
        </div>
      )}

      <CombineDataTable 
        combineData={combineData}
        userEstimation={userEstimation}
        isLoading={isLoading}
        error={error}
        sortMetric={sortMetric}
      />

      <CombineInfoSection />
    </div>
  );
};

export default NFLCombineTab;
