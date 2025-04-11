// src/pages/NFLCombinePage.jsx or similar
import { useState, useEffect } from 'react';
import CombineDataTable from '@/components/CombineDataTable';
import { useNFLCombineData } from '@/hooks/useNFLCombineData';
import { supabase } from '@/integrations/supabase/client';

export default function NFLCombinePage() {
  const [selectedPosition, setSelectedPosition] = useState(null);
  const [selectedYear, setSelectedYear] = useState(null);
  const [sortMetric, setSortMetric] = useState('40yd');
  const {
    combineData,
    positions,
    years,
    isLoading,
    error,
    fetchCombineData,
    fetchFilterOptions
  } = useNFLCombineData();

  // On initial load, fetch filter options and data
  useEffect(() => {
    // Verify Supabase connection first
    async function checkConnection() {
      try {
        // Simple test query to verify database connection
        const { data, error } = await supabase
          .from('NFL Combine Database')
          .select('count(*)')
          .limit(1);
        
        console.log('Supabase connection test:', { data, error });
        
        if (error) {
          console.error('Supabase connection error:', error);
        } else {
          // If connection works, load our data
          fetchFilterOptions();
          fetchCombineData(selectedPosition, selectedYear, sortMetric);
        }
      } catch (err) {
        console.error('Failed to connect to Supabase:', err);
      }
    }
    
    checkConnection();
  }, []);

  // Fetch data when filters change
  useEffect(() => {
    fetchCombineData(selectedPosition, selectedYear, sortMetric);
  }, [selectedPosition, selectedYear, sortMetric]);

  // Handle position selection
  const handlePositionChange = (position) => {
    setSelectedPosition(position === 'All Positions' ? null : position);
  };

  // Handle year selection
  const handleYearChange = (year) => {
    setSelectedYear(year === 'All Years' ? null : parseInt(year));
  };

  // Handle sort metric change
  const handleSortMetricChange = (metric) => {
    setSortMetric(metric);
  };

  // Debug output
  console.log('Rendering page with:', {
    dataCount: combineData?.length || 0,
    hasPositions: positions?.length || 0,
    hasYears: years?.length || 0,
    currentFilters: {
      position: selectedPosition,
      year: selectedYear,
      sortMetric
    }
  });

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">NFL Combine Results</h1>
      
      {/* Filter Controls */}
      <div className="flex flex-wrap gap-4 mb-6">
        <div className="flex-1 min-w-[200px]">
          <label className="block mb-2 text-sm font-medium">Position</label>
          <select
            className="w-full p-2 border rounded bg-gray-900 text-white"
            onChange={(e) => handlePositionChange(e.target.value)}
            value={selectedPosition || 'All Positions'}
          >
            <option value="All Positions">All Positions</option>
            {positions.map((pos) => (
              <option key={pos} value={pos}>
                {pos}
              </option>
            ))}
          </select>
        </div>
        
        <div className="flex-1 min-w-[200px]">
          <label className="block mb-2 text-sm font-medium">Draft Year</label>
          <select
            className="w-full p-2 border rounded bg-gray-900 text-white"
            onChange={(e) => handleYearChange(e.target.value)}
            value={selectedYear || 'All Years'}
          >
            <option value="All Years">All Years</option>
            {years.map((year) => (
              <option key={year} value={year}>
                {year}
              </option>
            ))}
          </select>
        </div>
        
        <div className="flex-1 min-w-[200px]">
          <label className="block mb-2 text-sm font-medium">Sort By</label>
          <select
            className="w-full p-2 border rounded bg-gray-900 text-white"
            onChange={(e) => handleSortMetricChange(e.target.value)}
            value={sortMetric}
          >
            <option value="40yd">40-Yard Dash</option>
            <option value="Vertical">Vertical Jump</option>
            <option value="Bench">Bench Press</option>
            <option value="Broad Jump">Broad Jump</option>
            <option value="3Cone">3-Cone Drill</option>
            <option value="Shuttle">Shuttle</option>
          </select>
        </div>
      </div>
      
      {/* Debug Info - Remove in production */}
      {error && (
        <div className="bg-red-800 text-white p-3 rounded mb-4">
          Error: {error}
        </div>
      )}
      
      {/* Table Component */}
      <CombineDataTable
        combineData={combineData}
        isLoading={isLoading}
        error={error}
        sortMetric={sortMetric}
      />
    </div>
  );
}