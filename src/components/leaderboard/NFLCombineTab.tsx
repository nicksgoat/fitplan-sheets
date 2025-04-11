
import React, { useState, useEffect } from 'react';
import CombineFilters from './filters/CombineFilters';
import CombineDataTable from './tables/CombineDataTable';
import CombineInfoSection from './info/CombineInfoSection';
import { useNFLCombineData } from '@/hooks/useNFLCombineData';
import { useUserCombineData } from '@/hooks/useUserCombineData';
import { useAuth } from '@/hooks/useAuth';
import MetricInfoCard from './cards/MetricInfoCard';
import UserStatsCard from './cards/UserStatsCard';

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

  return (
    <div className="space-y-6">
      <MetricInfoCard 
        sortMetric={sortMetric} 
        nflAverage={nflAverage} 
      />

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
        <UserStatsCard 
          userEstimation={userEstimation}
          nflAverage={nflAverage}
          sortMetric={sortMetric}
          onNavigateToYourCombine={navigateToYourCombine}
        />
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
