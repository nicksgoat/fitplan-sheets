
import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { toast } from 'sonner';

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

export interface ExerciseRecommendation {
  drill_name: string;
  current_score: string;
  percentile: number;
  recommended_exercises: Array<{
    exercise_name: string;
    correlation_strength: number;
    category: string;
  }>;
}

interface UseUserCombineDataResult {
  userEstimations: UserCombineEstimation[];
  nflAverages: NFLAverage[];
  recommendations: ExerciseRecommendation[];
  loading: boolean;
  error: string | null;
  fetchUserEstimations: () => Promise<void>;
  calculatePercentile: (userScore: string, drill: string, position?: string) => Promise<number | null>;
  refreshData: () => Promise<void>;
}

export function useUserCombineData(): UseUserCombineDataResult {
  const { user } = useAuth();
  const [userEstimations, setUserEstimations] = useState<UserCombineEstimation[]>([]);
  const [nflAverages, setNFLAverages] = useState<NFLAverage[]>([]);
  const [recommendations, setRecommendations] = useState<ExerciseRecommendation[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Function to fetch user's combine estimations
  const fetchUserEstimations = useCallback(async () => {
    if (!user) {
      setError("User not authenticated");
      return;
    }
    
    setLoading(true);
    setError(null);
    
    try {
      // Generate combine data for the current user using our improved function
      if (user.id) {
        const { data: generatedData, error: genError } = await supabase.rpc('generate_user_combine_data', {
          user_id_param: user.id
        });
        
        if (genError) {
          console.error("Error generating user combine data:", genError);
        }

        // Now fetch the user's data using run_sql_query to bypass type constraints
        const { data: userData, error: fetchError } = await supabase.rpc('run_sql_query', {
          query: `SELECT * FROM user_combine_estimations WHERE user_id = '${user.id}'`
        });
        
        if (fetchError) {
          throw fetchError;
        }
        
        if (userData) {
          // Explicit type casting with the 'as' keyword
          const typedData = (userData as any[]).map(item => {
            return {
              id: item.id,
              user_id: item.user_id,
              drill_name: item.drill_name,
              estimated_score: item.estimated_score,
              estimation_type: item.estimation_type,
              percentile: item.percentile,
              position_percentile: item.position_percentile,
              created_at: item.created_at,
              updated_at: item.updated_at
            } as UserCombineEstimation;
          });
          
          setUserEstimations(typedData);
        } else {
          setUserEstimations([]);
        }
      }
      
      // Fetch NFL averages
      await fetchNFLAverages();
      
      // Fetch exercise recommendations
      if (user.id) {
        await fetchRecommendations();
      }
    } catch (err) {
      console.error('Error fetching user combine data:', err);
      setError('Failed to load your combine data');
    } finally {
      setLoading(false);
    }
  }, [user]);

  // Function to fetch NFL averages
  const fetchNFLAverages = async () => {
    try {
      // Use our improved database function to get NFL averages through run_sql_query
      const { data, error } = await supabase.rpc('run_sql_query', {
        query: 'SELECT * FROM get_nfl_combine_averages()'
      });
        
      if (error) {
        console.warn('Error fetching NFL averages:', error);
        return;
      }
      
      if (data) {
        // Properly type the returned data
        const typedData = (data as any[]).map(item => {
          return {
            drill_name: item.drill_name,
            avg_score: item.avg_score,
            top_score: item.top_score
          } as NFLAverage;
        });
        
        setNFLAverages(typedData);
      } else {
        setNFLAverages([]);
      }
    } catch (err) {
      console.error('Error fetching NFL averages:', err);
    }
  };
  
  // Function to fetch exercise recommendations
  const fetchRecommendations = async () => {
    if (!user?.id) return;
    
    try {
      // Use run_sql_query to get recommendations to bypass type constraints
      const { data, error } = await supabase.rpc('run_sql_query', {
        query: `SELECT * FROM recommend_combine_exercises('${user.id}')`
      });
      
      if (error) {
        console.warn('Error fetching recommendations:', error);
        return;
      }
      
      if (data) {
        // Properly cast the data to our expected type
        const typedData = (data as any[]).map(item => {
          return {
            drill_name: item.drill_name,
            current_score: item.current_score,
            percentile: item.percentile,
            recommended_exercises: item.recommended_exercises || []
          } as ExerciseRecommendation;
        });
        
        setRecommendations(typedData);
      } else {
        setRecommendations([]);
      }
    } catch (err) {
      console.error('Error fetching exercise recommendations:', err);
    }
  };

  // Function to calculate percentile for a given score
  const calculatePercentile = async (userScore: string, drill: string, position?: string): Promise<number | null> => {
    try {
      const score = parseFloat(userScore);
      if (isNaN(score)) return null;
      
      // Use run_sql_query for the calculation to bypass type constraints
      const { data, error } = await supabase.rpc('run_sql_query', {
        query: `SELECT * FROM calculate_combine_percentiles('${userScore}', '${drill}', ${position ? `'${position}'` : 'NULL'})`
      });
      
      if (error) {
        console.error('Error calculating percentile:', error);
        return null;
      }
      
      if (data && Array.isArray(data) && data.length > 0) {
        // Properly access the percentile value from the returned data
        const result = data[0] as any;
        return result.percentile;
      }
      
      return null;
    } catch (err) {
      console.error('Error calculating percentile:', err);
      return null;
    }
  };
  
  // Function to refresh all data
  const refreshData = async () => {
    toast.info("Refreshing combine data...");
    await fetchUserEstimations();
    toast.success("Combine data refreshed");
  };

  // Fetch data on mount if user is authenticated
  useEffect(() => {
    if (user) {
      fetchUserEstimations();
    }
  }, [user, fetchUserEstimations]);

  return {
    userEstimations,
    nflAverages,
    recommendations,
    loading,
    error,
    fetchUserEstimations,
    calculatePercentile,
    refreshData
  };
}
