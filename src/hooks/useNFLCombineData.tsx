
import { useState, useEffect, useCallback } from 'react';
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

  // Function to fetch filter options
  const fetchFilterOptions = useCallback(async () => {
    try {
      console.log('Fetching filter options...');
      // Fetch unique positions - using raw RPC call to work with "NFL_Combine_Database" table
      const { data: posData, error: posError } = await supabase
        .rpc('run_sql_query', { 
          query: `SELECT DISTINCT "Pos" FROM "NFL_Combine_Database" WHERE "Pos" IS NOT NULL ORDER BY "Pos"` 
        });

      if (posError) {
        console.error('Error fetching positions:', posError);
        setError('Failed to load position filters');
      } else if (posData) {
        // Extract unique positions - handle the JSON properly
        const uniquePositions: string[] = [];
        
        // Check if the data is an array and has items
        if (Array.isArray(posData)) {
          posData.forEach((item: any) => {
            if (item && item.Pos) {
              uniquePositions.push(item.Pos);
            }
          });
        }
        
        console.log('Positions loaded:', uniquePositions);
        setPositions(uniquePositions);
      }

      // Fetch unique draft years
      const { data: yearData, error: yearError } = await supabase
        .rpc('run_sql_query', { 
          query: `SELECT DISTINCT "Draft_Year" FROM "NFL_Combine_Database" WHERE "Draft_Year" IS NOT NULL ORDER BY "Draft_Year" DESC` 
        });

      if (yearError) {
        console.error('Error fetching years:', yearError);
        setError('Failed to load year filters');
      } else if (yearData) {
        // Extract unique years - handle the JSON properly
        const uniqueYears: number[] = [];
        
        // Check if the data is an array and has items
        if (Array.isArray(yearData)) {
          yearData.forEach((item: any) => {
            if (item && item.Draft_Year && typeof item.Draft_Year === 'number') {
              uniqueYears.push(item.Draft_Year);
            }
          });
        }
        
        console.log('Years loaded:', uniqueYears);
        setYears(uniqueYears);
      }
    } catch (err) {
      console.error('Unexpected error fetching filter options:', err);
      setError('Failed to load filter options');
    }
  }, []);

  const fetchCombineData = useCallback(async (
    selectedPosition: string | null, 
    selectedYear: number | null,
    sortMetric: string
  ) => {
    setIsLoading(true);
    setError(null);
    
    try {
      console.log('Fetching data with filters:', { selectedPosition, selectedYear, sortMetric });
      
      let query = `SELECT * FROM "NFL_Combine_Database" WHERE 1=1`;

      // Apply position filter if selected
      if (selectedPosition) {
        query += ` AND "Pos" = '${selectedPosition}'`;
      }

      // Apply year filter if selected
      if (selectedYear) {
        query += ` AND "Draft_Year" = ${selectedYear}`;
      }

      // Apply sorting based on the metric
      if (sortMetric) {
        const isAscending = ['40yd', '3Cone', 'Shuttle'].includes(sortMetric);
        query += ` AND "${sortMetric}" IS NOT NULL AND "${sortMetric}" != ''`;
        query += ` ORDER BY "${sortMetric}"::numeric ${isAscending ? 'ASC' : 'DESC'} LIMIT 100`;
        
        const { data: notNullData, error: notNullError } = await supabase
          .rpc('run_sql_query', { query });

        if (notNullError) {
          console.error('Error fetching combine data:', notNullError);
          setError('Failed to load combine data');
          setCombineData([]);
          setIsLoading(false);
          return;
        }

        if (notNullData && Array.isArray(notNullData) && notNullData.length > 0) {
          console.log(`Success: Retrieved ${notNullData.length} records`);
          console.log('Sample data:', notNullData[0]);
          // Properly cast the data to our expected type
          setCombineData(notNullData as unknown as NFLCombineResult[]);
        } else {
          console.log('No data found with current filters');
          setCombineData([]);
        }
      } else {
        // Default to 40yd sorting if no sortMetric provided
        query += ` AND "40yd" IS NOT NULL AND "40yd" != '' ORDER BY "40yd"::numeric ASC LIMIT 100`;
        
        const { data, error } = await supabase
          .rpc('run_sql_query', { query });

        if (error) {
          console.error('Error fetching combine data:', error);
          setError('Failed to load combine data');
          setCombineData([]);
        } else if (data && Array.isArray(data) && data.length > 0) {
          console.log(`Success: Retrieved ${data.length} records`);
          console.log('Sample data:', data[0]);
          // Properly cast the data to our expected type
          setCombineData(data as unknown as NFLCombineResult[]);
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
  }, []);

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
