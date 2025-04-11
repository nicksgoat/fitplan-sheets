
import React, { useState, useEffect } from 'react';
import CombineFilters from './filters/CombineFilters';
import CombineDataTable from './tables/CombineDataTable';
import CombineInfoSection from './info/CombineInfoSection';
import { useNFLCombineData } from '@/hooks/useNFLCombineData';
import { useUserCombineData } from '@/hooks/useUserCombineData';
import { useAuth } from '@/hooks/useAuth';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ArrowRight, Info } from 'lucide-react';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';

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

  // Get user estimation for the current sort metric
  const getUserEstimationForMetric = () => {
    if (!sortMetric || !userEstimations || userEstimations.length === 0) return null;
    
    return userEstimations.find(est => est.drill_name === sortMetric);
  };
  
  // Load filter options on component mount
  useEffect(() => {
    fetchFilterOptions();
  }, []);

  // Fetch data with filters
  useEffect(() => {
    // Save filters to localStorage
    if (selectedPosition) localStorage.setItem('nfl_combine_position', selectedPosition);
    if (selectedYear) localStorage.setItem('nfl_combine_year', selectedYear.toString());
    localStorage.setItem('nfl_combine_sort', sortMetric);

    fetchCombineData(selectedPosition, selectedYear, sortMetric);
  }, [selectedPosition, selectedYear, sortMetric]);

  // Load saved preferences on mount
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
  
  // Get NFL average for the current sort metric
  const getNFLAverageForMetric = () => {
    if (!sortMetric || !nflAverages || nflAverages.length === 0) return null;
    return nflAverages.find(avg => avg.drill_name === sortMetric);
  };
  
  const nflAverage = getNFLAverageForMetric();

  // Handle navigation to "your-combine" tab safely
  const navigateToYourCombine = (e: React.MouseEvent) => {
    e.preventDefault();
    // Find the tab element and trigger a click event safely
    const yourCombineTab = document.querySelector('[data-value="your-combine"]');
    if (yourCombineTab && 'click' in yourCombineTab) {
      (yourCombineTab as HTMLElement).click();
    }
  };

  return (
    <div className="space-y-6">
      {/* Filters */}
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

      {/* User Estimation Summary (if available) */}
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

      {/* Error Message */}
      {error && (
        <div className="p-4 text-center text-red-400 bg-red-900/20 border border-red-800 rounded-lg">
          {error}. Please try adjusting filters or try again later.
        </div>
      )}

      {/* Table */}
      <CombineDataTable 
        combineData={combineData}
        userEstimation={userEstimation}
        isLoading={isLoading}
        error={error}
        sortMetric={sortMetric}
      />

      {/* Explanatory Section */}
      <CombineInfoSection />
    </div>
  );
};

export default NFLCombineTab;
