
import { useState, useEffect } from 'react';
import { useWorkout } from '@/contexts/WorkoutContext';
import { WeightType } from '@/types/workout';
import { extractNumericWeight } from '@/utils/maxWeightUtils';

interface UseWeightCalculatorProps {
  exerciseName: string;
  initialWeight: string;
  weightType: WeightType;
}

interface UseWeightCalculatorReturn {
  weight: string;
  percentage: string;
  updateWeight: (newWeight: string) => void;
  updatePercentage: (newPercentage: string) => void;
  hasMaxWeight: boolean;
  maxWeight: string;
  setMaxWeight: (newMaxWeight: string) => void;
}

export const useWeightCalculator = ({
  exerciseName,
  initialWeight,
  weightType
}: UseWeightCalculatorProps): UseWeightCalculatorReturn => {
  const { 
    getMaxWeightForExercise, 
    convertWeightToPercentage, 
    convertPercentageToWeight,
    setMaxWeight: contextSetMaxWeight
  } = useWorkout();
  
  const [weight, setWeight] = useState<string>(initialWeight);
  const [percentage, setPercentage] = useState<string>('');
  
  const maxWeightData = getMaxWeightForExercise(exerciseName);
  const hasMaxWeight = !!maxWeightData;
  const maxWeight = maxWeightData?.weight || '';
  
  // Calculate percentage when weight changes
  useEffect(() => {
    if (hasMaxWeight && weight) {
      const newPercentage = convertWeightToPercentage(weight, exerciseName);
      setPercentage(newPercentage);
    }
  }, [weight, exerciseName, hasMaxWeight, convertWeightToPercentage]);
  
  // Functions to update values
  const updateWeight = (newWeight: string) => {
    setWeight(newWeight);
    if (hasMaxWeight) {
      const newPercentage = convertWeightToPercentage(newWeight, exerciseName);
      setPercentage(newPercentage);
    }
  };
  
  const updatePercentage = (newPercentage: string) => {
    setPercentage(newPercentage);
    if (hasMaxWeight) {
      const newWeight = convertPercentageToWeight(newPercentage, exerciseName, weightType);
      setWeight(newWeight);
    }
  };
  
  const setNewMaxWeight = (newMaxWeight: string) => {
    if (newMaxWeight) {
      contextSetMaxWeight(exerciseName, newMaxWeight, weightType);
    }
  };
  
  return {
    weight,
    percentage,
    updateWeight,
    updatePercentage,
    hasMaxWeight,
    maxWeight,
    setMaxWeight: setNewMaxWeight
  };
};

export default useWeightCalculator;
