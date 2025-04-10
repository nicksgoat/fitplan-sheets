
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';

export interface UserCombineEstimation {
  id: string;
  user_id: string;
  drill_name: string;
  estimated_score: string;
  estimation_type: 'estimated' | 'actual' | 'placeholder';
  percentile?: number;
  position_percentile?: number;
  created_at: string;
  updated_at: string;
}

export interface NFLAverage {
  drill_name: string;
  avg_score: string;
  top_score: string;
}

interface UseUserCombineDataResult {
  userEstimations: UserCombineEstimation[];
  nflAverages: NFLAverage[];
  loading: boolean;
  error: string | null;
  fetchUserEstimations: () => Promise<void>;
  calculatePercentile: (userScore: string, drill: string, position?: string) => number | null;
}

export function useUserCombineData(): UseUserCombineDataResult {
  const { user } = useAuth();
  const [userEstimations, setUserEstimations] = useState<UserCombineEstimation[]>([]);
  const [nflAverages, setNFLAverages] = useState<NFLAverage[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Function to fetch user's combine estimations
  const fetchUserEstimations = async () => {
    if (!user) {
      setError("User not authenticated");
      return;
    }
    
    setLoading(true);
    setError(null);
    
    try {
      // Fetch user's combine estimations - using a different approach to avoid type issues
      const { data: estimationsData, error: estimationsError } = await supabase
        .from('user_combine_estimations')
        .select('*')
        .eq('user_id', user.id);
        
      if (estimationsError) {
        throw estimationsError;
      }
      
      if (estimationsData) {
        // Explicitly cast the data to ensure type safety
        setUserEstimations(estimationsData as unknown as UserCombineEstimation[]);
      }
      
      // Fetch NFL averages for each drill
      // Call the custom function using the SQL query approach
      const { data: nflData, error: nflError } = await supabase
        .rpc('run_sql_query', {
          query: 'SELECT * FROM get_nfl_combine_averages()'
        });
        
      if (nflError) {
        console.warn('Error fetching NFL averages:', nflError);
        // Still allow the component to function even if we can't get the averages
        await calculateNFLAverages();
      }
      
      if (nflData && Array.isArray(nflData)) {
        setNFLAverages(nflData as unknown as NFLAverage[]);
      } else {
        // Fallback to calculate averages from raw data
        await calculateNFLAverages();
      }
    } catch (err) {
      console.error('Error fetching user combine data:', err);
      setError('Failed to load your combine data');
    } finally {
      setLoading(false);
    }
  };

  // Helper function to calculate NFL averages if the RPC isn't available
  const calculateNFLAverages = async () => {
    try {
      const drills = ['40yd', 'Vertical', 'Bench', 'Broad Jump', '3Cone', 'Shuttle'];
      const averages: NFLAverage[] = [];
      
      for (const drill of drills) {
        const { data, error } = await supabase
          .from('NFL Combine Database')
          .select(drill)
          .not(drill, 'is', null)
          .order(drill, { ascending: true });
          
        if (error) {
          console.error(`Error calculating averages for ${drill}:`, error);
          continue;
        }
        
        if (data && data.length > 0) {
          // Extract numeric values
          const values = data
            .map(item => parseFloat(item[drill]))
            .filter(val => !isNaN(val));
            
          if (values.length > 0) {
            // Calculate average
            const avg = values.reduce((sum, val) => sum + val, 0) / values.length;
            
            // Get top 10% score
            const sortedValues = [...values].sort((a, b) => {
              // For 40yd, 3Cone, and Shuttle, lower is better
              if (['40yd', '3Cone', 'Shuttle'].includes(drill)) {
                return a - b;
              }
              // For others, higher is better
              return b - a;
            });
            
            const topIndex = Math.floor(sortedValues.length * 0.1);
            const topScore = sortedValues[topIndex];
            
            averages.push({
              drill_name: drill,
              avg_score: avg.toFixed(2),
              top_score: topScore.toFixed(2)
            });
          }
        }
      }
      
      setNFLAverages(averages);
    } catch (err) {
      console.error('Error calculating NFL averages:', err);
    }
  };

  // Function to calculate percentile for a given score
  const calculatePercentile = (userScore: string, drill: string, position?: string): number | null => {
    try {
      const score = parseFloat(userScore);
      if (isNaN(score)) return null;
      
      // This is a placeholder implementation
      // In a real implementation, you would compare to actual NFL data
      // For now, we'll return a random percentile between 30 and 95
      return Math.floor(Math.random() * (95 - 30 + 1)) + 30;
    } catch (err) {
      console.error('Error calculating percentile:', err);
      return null;
    }
  };

  // Fetch data on mount if user is authenticated
  useEffect(() => {
    if (user) {
      fetchUserEstimations();
    }
  }, [user]);

  return {
    userEstimations,
    nflAverages,
    loading,
    error,
    fetchUserEstimations,
    calculatePercentile
  };
}
