
import React, { createContext, useContext, useState, useEffect } from 'react';
import { UserMaxWeights, MaxWeightRecord, WeightType } from '@/types/workout';

interface MaxWeightContextType {
  userMaxWeights: UserMaxWeights;
  getMaxWeight: (exerciseName: string) => MaxWeightRecord | undefined;
  setMaxWeight: (exerciseName: string, maxWeight: string, weightType: WeightType) => void;
  removeMaxWeight: (exerciseName: string) => void;
  convertMaxWeight: (record: MaxWeightRecord, targetType: WeightType) => string;
}

const MaxWeightContext = createContext<MaxWeightContextType | undefined>(undefined);

const STORAGE_KEY = 'user-max-weights';

export const MaxWeightProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [userMaxWeights, setUserMaxWeights] = useState<UserMaxWeights>({ records: {} });

  // Load user max weights from localStorage on mount
  useEffect(() => {
    const storedData = localStorage.getItem(STORAGE_KEY);
    if (storedData) {
      try {
        const parsedData = JSON.parse(storedData) as UserMaxWeights;
        setUserMaxWeights(parsedData);
      } catch (error) {
        console.error('Failed to parse saved max weights', error);
      }
    }
  }, []);

  // Save to localStorage when userMaxWeights changes
  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(userMaxWeights));
  }, [userMaxWeights]);

  const getMaxWeight = (exerciseName: string): MaxWeightRecord | undefined => {
    return userMaxWeights.records[exerciseName.toLowerCase()];
  };

  const setMaxWeight = (exerciseName: string, maxWeight: string, weightType: WeightType) => {
    const key = exerciseName.toLowerCase();
    
    setUserMaxWeights(prev => ({
      records: {
        ...prev.records,
        [key]: {
          exerciseName,
          maxWeight,
          weightType,
          date: new Date().toISOString()
        }
      }
    }));
  };

  const removeMaxWeight = (exerciseName: string) => {
    const key = exerciseName.toLowerCase();
    
    setUserMaxWeights(prev => {
      const { [key]: _, ...rest } = prev.records;
      return { records: rest };
    });
  };

  // Extract numeric value from weight string
  const extractNumericWeight = (value: string): number => {
    if (!value) return 0;
    return parseFloat(value.replace(/[^\d.]/g, '')) || 0;
  };

  // Convert max weight between different units
  const convertMaxWeight = (record: MaxWeightRecord, targetType: WeightType): string => {
    const numericValue = extractNumericWeight(record.maxWeight);
    
    if (record.weightType === targetType) {
      return record.maxWeight;
    }
    
    // Convert between pounds and kilos
    if (record.weightType === 'pounds' && targetType === 'kilos') {
      const inKilos = Math.round(numericValue * 0.453592);
      return `${inKilos} kg`;
    } 
    else if (record.weightType === 'kilos' && targetType === 'pounds') {
      const inPounds = Math.round(numericValue * 2.20462);
      return `${inPounds} lbs`;
    }
    
    // Handle distance conversions
    if (
      (record.weightType.startsWith('distance-') && targetType.startsWith('distance-'))
    ) {
      // Convert to meters first as our base unit
      let inMeters: number;
      
      switch (record.weightType) {
        case 'distance-m':
          inMeters = numericValue;
          break;
        case 'distance-ft':
          inMeters = numericValue * 0.3048;
          break;
        case 'distance-yd':
          inMeters = numericValue * 0.9144;
          break;
        case 'distance-mi':
          inMeters = numericValue * 1609.34;
          break;
        default:
          inMeters = 0;
      }
      
      // Convert from meters to target unit
      switch (targetType) {
        case 'distance-m':
          return `${Math.round(inMeters)}m`;
        case 'distance-ft':
          return `${Math.round(inMeters / 0.3048)}ft`;
        case 'distance-yd':
          return `${Math.round(inMeters / 0.9144)}yd`;
        case 'distance-mi':
          return `${(inMeters / 1609.34).toFixed(2)}mi`;
        default:
          return record.maxWeight;
      }
    }
    
    // If units are incompatible, return original format
    return record.maxWeight;
  };

  return (
    <MaxWeightContext.Provider 
      value={{ 
        userMaxWeights, 
        getMaxWeight, 
        setMaxWeight, 
        removeMaxWeight,
        convertMaxWeight
      }}
    >
      {children}
    </MaxWeightContext.Provider>
  );
};

export const useMaxWeight = () => {
  const context = useContext(MaxWeightContext);
  if (context === undefined) {
    throw new Error('useMaxWeight must be used within a MaxWeightProvider');
  }
  return context;
};
