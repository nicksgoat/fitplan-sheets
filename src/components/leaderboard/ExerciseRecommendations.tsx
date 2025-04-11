
import React from 'react';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Dumbbell, Target, ArrowRight, Trophy } from 'lucide-react';
import { ExerciseRecommendation } from '@/hooks/useUserCombineData';

interface ExerciseRecommendationsProps {
  recommendations: ExerciseRecommendation[];
  isLoading: boolean;
}

const ExerciseRecommendations: React.FC<ExerciseRecommendationsProps> = ({ 
  recommendations,
  isLoading
}) => {
  if (isLoading) {
    return (
      <Card className="p-4 space-y-4">
        <h3 className="text-lg font-semibold">Loading Recommendations...</h3>
        <div className="space-y-2">
          {[1, 2, 3].map(i => (
            <div key={i} className="h-20 bg-gray-800 animate-pulse rounded" />
          ))}
        </div>
      </Card>
    );
  }

  if (recommendations.length === 0) {
    return (
      <Card className="p-6 text-center">
        <h3 className="text-lg font-semibold mb-3">Exercise Recommendations</h3>
        <p className="text-gray-400">
          Complete more workouts to get personalized exercise recommendations that can help improve your combine scores.
        </p>
      </Card>
    );
  }

  // Sort recommendations by lowest percentile first (areas that need most improvement)
  const sortedRecommendations = [...recommendations].sort((a, b) => a.percentile - b.percentile);

  return (
    <Card className="p-4">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold">Exercise Recommendations</h3>
        <Badge variant="outline" className="bg-fitbloom-purple text-white">
          Performance-Based
        </Badge>
      </div>

      <div className="space-y-4">
        {sortedRecommendations.map((rec) => (
          <Card key={rec.drill_name} className="p-3 bg-gray-900/30 border border-gray-800">
            <div className="flex items-start justify-between mb-2">
              <div>
                <div className="flex items-center gap-2">
                  <Trophy className="h-4 w-4 text-yellow-500" />
                  <h4 className="font-medium">{rec.drill_name}</h4>
                </div>
                <p className="text-sm text-gray-400">
                  Current: {rec.current_score} (Top {100 - rec.percentile}%)
                </p>
              </div>

              <Target className="h-5 w-5 text-fitbloom-purple" />
            </div>

            <div className="mt-3">
              <p className="text-xs text-gray-400 mb-2">Recommended exercises to improve:</p>
              <div className="grid grid-cols-1 gap-2">
                {rec.recommended_exercises && rec.recommended_exercises.map((exercise, index) => (
                  <div key={index} className="flex items-center gap-2 bg-gray-800/50 p-2 rounded">
                    <Dumbbell className="h-3 w-3 text-fitbloom-purple" />
                    <span className="text-sm flex-1">{exercise.exercise_name}</span>
                    <Badge 
                      variant="outline" 
                      className="text-[10px] bg-gray-900"
                    >
                      {exercise.category}
                    </Badge>
                  </div>
                ))}
              </div>
            </div>

            <div className="mt-3 text-xs text-blue-400 flex items-center cursor-pointer">
              View exercise details <ArrowRight className="ml-1 h-3 w-3" />
            </div>
          </Card>
        ))}
      </div>
    </Card>
  );
};

export default ExerciseRecommendations;
