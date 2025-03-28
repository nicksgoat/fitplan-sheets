
import { UserMaxWeights, WeightType } from "@/types/workout";

// Extract numeric value from weight string
export const extractNumericWeight = (weightString: string): number => {
  if (!weightString) return 0;
  
  // Extract numeric part from the weight string
  const numericValue = parseFloat(weightString.replace(/[^\d.]/g, ''));
  return isNaN(numericValue) ? 0 : numericValue;
};

// Format weight with the appropriate unit
export const formatWeight = (value: number, weightType: WeightType): string => {
  if (value <= 0) return "";
  
  switch (weightType) {
    case 'pounds':
      return `${value} lbs`;
    case 'kilos':
      return `${value} kg`;
    case 'distance-m':
      return `${value}m`;
    case 'distance-ft':
      return `${value}ft`;
    case 'distance-yd':
      return `${value}yd`;
    case 'distance-mi':
      return `${value}mi`;
    default:
      return `${value}`;
  }
};

// Convert weight between different units
export const convertWeight = (
  value: number, 
  fromType: WeightType, 
  toType: WeightType
): number => {
  if (fromType === toType) return value;
  
  // First convert to a standard unit (kg)
  let valueInKg: number;
  
  switch (fromType) {
    case 'pounds':
      valueInKg = value * 0.453592; // 1 lb = 0.453592 kg
      break;
    case 'kilos':
      valueInKg = value;
      break;
    case 'distance-m':
    case 'distance-ft':
    case 'distance-yd':
    case 'distance-mi':
      return 0; // Distance types cannot be converted to weight
    default:
      return 0;
  }
  
  // Then convert from kg to target unit
  switch (toType) {
    case 'pounds':
      return valueInKg / 0.453592; // 1 kg = 2.20462 lbs
    case 'kilos':
      return valueInKg;
    case 'distance-m':
    case 'distance-ft':
    case 'distance-yd':
    case 'distance-mi':
      return 0; // Weight types cannot be converted to distance
    default:
      return 0;
  }
};

// Calculate weight based on percentage of max
export const calculateWeightFromPercentage = (
  maxWeight: number,
  percentage: number,
  weightType: WeightType
): string => {
  if (maxWeight <= 0 || percentage <= 0) return "";
  
  const calculatedWeight = (maxWeight * percentage) / 100;
  // Round to nearest 2.5 for pounds or 1 for kg (common weight increments)
  const rounded = weightType === 'pounds' 
    ? Math.round(calculatedWeight / 2.5) * 2.5 
    : Math.round(calculatedWeight);
    
  return formatWeight(rounded, weightType);
};

// Calculate percentage based on current weight and max weight
export const calculatePercentageFromWeight = (
  currentWeight: number,
  maxWeight: number
): number => {
  if (currentWeight <= 0 || maxWeight <= 0) return 0;
  
  const percentage = (currentWeight / maxWeight) * 100;
  return Math.round(percentage);
};

// Get the max weight for a specific exercise
export const getMaxWeight = (
  exerciseName: string,
  maxWeights?: UserMaxWeights
): { weight: string; weightType: WeightType } | null => {
  if (!maxWeights || !maxWeights[exerciseName]) return null;
  return maxWeights[exerciseName];
};

// Update the max weight for a specific exercise
export const updateMaxWeights = (
  maxWeights: UserMaxWeights | undefined,
  exerciseName: string,
  weight: string,
  weightType: WeightType
): UserMaxWeights => {
  const newMaxWeights = { ...(maxWeights || {}) };
  
  newMaxWeights[exerciseName] = {
    weight,
    weightType
  };
  
  return newMaxWeights;
};

// Convert weight to percentage of max
export const weightToPercentage = (
  weight: string,
  exerciseName: string,
  maxWeights?: UserMaxWeights
): string => {
  const maxWeightData = getMaxWeight(exerciseName, maxWeights);
  if (!maxWeightData) return "";
  
  const currentWeight = extractNumericWeight(weight);
  const maxWeight = extractNumericWeight(maxWeightData.weight);
  
  if (currentWeight <= 0 || maxWeight <= 0) return "";
  
  // Convert weights to the same unit if needed
  const currentWeightType: WeightType = 
    weight.includes('kg') ? 'kilos' : 
    weight.includes('m') && !weight.includes('mi') ? 'distance-m' :
    weight.includes('ft') ? 'distance-ft' :
    weight.includes('yd') ? 'distance-yd' :
    weight.includes('mi') ? 'distance-mi' :
    'pounds';
  
  let normalizedCurrentWeight = currentWeight;
  if (currentWeightType !== maxWeightData.weightType) {
    normalizedCurrentWeight = convertWeight(
      currentWeight, 
      currentWeightType, 
      maxWeightData.weightType
    );
  }
  
  const percentage = calculatePercentageFromWeight(normalizedCurrentWeight, maxWeight);
  return `${percentage}%`;
};

// Convert percentage to actual weight
export const percentageToWeight = (
  percentage: string,
  exerciseName: string,
  targetWeightType: WeightType,
  maxWeights?: UserMaxWeights
): string => {
  const maxWeightData = getMaxWeight(exerciseName, maxWeights);
  if (!maxWeightData) return "";
  
  const percentValue = parseInt(percentage.replace('%', ''));
  const maxWeight = extractNumericWeight(maxWeightData.weight);
  
  if (isNaN(percentValue) || percentValue <= 0 || maxWeight <= 0) return "";
  
  // Convert max weight to target weight type if different
  let normalizedMaxWeight = maxWeight;
  if (maxWeightData.weightType !== targetWeightType) {
    normalizedMaxWeight = convertWeight(
      maxWeight, 
      maxWeightData.weightType, 
      targetWeightType
    );
  }
  
  return calculateWeightFromPercentage(normalizedMaxWeight, percentValue, targetWeightType);
};
