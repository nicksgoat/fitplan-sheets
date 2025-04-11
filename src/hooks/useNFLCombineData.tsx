
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';

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

interface UseNFLCombineDataResult {
  combineData: NFLCombineResult[];
  positions: string[];
  years: number[];
  isLoading: boolean;
  error: string | null;
  fetchCombineData: (position: string | null, year: number | null, sortMetric: string) => Promise<void>;
  fetchFilterOptions: () => Promise<void>;
}

export function useNFLCombineData(): UseNFLCombineDataResult {
  const [combineData, setCombineData] = useState<NFLCombineResult[]>([]);
  const [positions, setPositions] = useState<string[]>([]);
  const [years, setYears] = useState<number[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchFilterOptions = async () => {
    try {
      console.log('Fetching filter options...');
      // Fetch unique positions
      const { data: posData, error: posError } = await supabase
        .from('NFL Combine Database')
        .select('Pos')
        .not('Pos', 'is', null)
        .order('Pos');

      if (posError) {
        console.error('Error fetching positions:', posError);
        setError('Failed to load position filters');
      } else if (posData) {
        // Extract unique positions
        const uniquePositions = Array.from(new Set(posData.map(item => item.Pos))).filter(Boolean);
        console.log('Positions loaded:', uniquePositions);
        setPositions(uniquePositions);
      }

      // Fetch unique draft years
      const { data: yearData, error: yearError } = await supabase
        .from('NFL Combine Database')
        .select('Draft_Year')
        .not('Draft_Year', 'is', null)
        .order('Draft_Year', { ascending: false });

      if (yearError) {
        console.error('Error fetching years:', yearError);
        setError('Failed to load year filters');
      } else if (yearData) {
        // Extract unique years
        const uniqueYears = Array.from(new Set(yearData.map(item => item.Draft_Year))).filter(Boolean);
        console.log('Years loaded:', uniqueYears);
        setYears(uniqueYears);
      }
    } catch (err) {
      console.error('Unexpected error fetching filter options:', err);
      setError('Failed to load filter options');
    }
  };

  const fetchCombineData = async (
    selectedPosition: string | null, 
    selectedYear: number | null,
    sortMetric: string
  ) => {
    setIsLoading(true);
    setError(null);
    
    try {
      console.log('Fetching data with filters:', { selectedPosition, selectedYear, sortMetric });
      
      let query = supabase
        .from('NFL Combine Database')
        .select('*');

      // Apply position filter if selected
      if (selectedPosition) {
        query = query.eq('Pos', selectedPosition);
      }

      // Apply year filter if selected
      if (selectedYear) {
        query = query.eq('Draft_Year', selectedYear);
      }

      // Apply sorting based on the metric
      // Make sure to properly handle the case where the field might be null
      if (sortMetric) {
        // First, get rows where the sort metric is not null
        const { data: notNullData, error: notNullError } = await query
          .not(sortMetric, 'is', null)
          .order(sortMetric, { 
            ascending: ['40yd', '3Cone', 'Shuttle'].includes(sortMetric), 
            nullsFirst: false 
          })
          .limit(100);

        if (notNullError) {
          console.error('Error fetching combine data:', notNullError);
          setError('Failed to load combine data');
          setCombineData([]);
          setIsLoading(false);
          return;
        }

        if (notNullData && notNullData.length > 0) {
          console.log(`Success: Retrieved ${notNullData.length} records`);
          console.log('Sample data:', notNullData[0]);
          setCombineData(notNullData);
        } else {
          console.log('No data found with current filters');
          setCombineData([]);
        }
      } else {
        // Default to 40yd sorting if no sortMetric provided
        const { data, error } = await query
          .not('40yd', 'is', null)
          .order('40yd', { ascending: true, nullsFirst: false })
          .limit(100);

        if (error) {
          console.error('Error fetching combine data:', error);
          setError('Failed to load combine data');
          setCombineData([]);
        } else if (data && data.length > 0) {
          console.log(`Success: Retrieved ${data.length} records`);
          console.log('Sample data:', data[0]);
          setCombineData(data);
        } else {
          console.log('No data found with current filters');
          setCombineData([]);
        }
      }
    } catch (err) {
      console.error('Unexpected error:', err);
      setError('An unexpected error occurred');
      setCombineData([]);
    } finally {
      setIsLoading(false);
    }
  };

  return {
    combineData,
    positions,
    years,
    isLoading,
    error,
    fetchCombineData,
    fetchFilterOptions
  };
}
