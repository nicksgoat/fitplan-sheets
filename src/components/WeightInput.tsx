import React, { useRef, useEffect, useState } from "react";
import { cn } from "@/lib/utils";
import { WeightType } from "@/types/workout";
import WeightTypeSelector from "./WeightTypeSelector";
import { useWorkout } from "@/contexts/WorkoutContext";
import { extractNumericWeight } from "@/utils/maxWeightUtils";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";

interface WeightInputProps {
  value: string;
  weightType: WeightType;
  onChange: (value: string) => void;
  onWeightTypeChange: (type: WeightType) => void;
  placeholder?: string;
  isFocused?: boolean;
  hideSelector?: boolean;
  exerciseName?: string;
}

const getPlaceholder = (weightType: WeightType): string => {
  switch (weightType) {
    case 'pounds':
      return '135 lbs';
    case 'kilos':
      return '60 kg';
    case 'distance-m':
      return '100m';
    case 'distance-ft':
      return '50ft';
    case 'distance-yd':
      return '25yd';
    case 'distance-mi':
      return '0.5mi';
    default:
      return 'Weight';
  }
};

const formatValue = (value: string, weightType: WeightType): string => {
  if (!value) return value;

  const numericValue = parseFloat(value.replace(/[^\d.]/g, ''));
  if (isNaN(numericValue)) return value;

  switch (weightType) {
    case 'pounds':
      return `${numericValue} lbs`;
    case 'kilos':
      return `${numericValue} kg`;
    case 'distance-m':
      return `${numericValue}m`;
    case 'distance-ft':
      return `${numericValue}ft`;
    case 'distance-yd':
      return `${numericValue}yd`;
    case 'distance-mi':
      return `${numericValue}mi`;
    default:
      return value;
  }
};

const getWeightStyle = (type: WeightType) => {
  switch (type) {
    case 'pounds':
      return 'text-blue-600';
    case 'kilos':
      return 'text-green-600';
    case 'distance-m':
    case 'distance-ft':
    case 'distance-yd':
    case 'distance-mi':
      return 'text-purple-600';
    default:
      return '';
  }
};

const isDistanceType = (type: WeightType): boolean => {
  return type === 'distance-m' || type === 'distance-ft' || 
         type === 'distance-yd' || type === 'distance-mi';
};

const convertWeight = (value: string, fromType: WeightType, toType: WeightType): string => {
  const numericValue = parseFloat(value.replace(/[^\d.]/g, ''));
  if (isNaN(numericValue)) return value;
  
  if (fromType === toType) {
    return formatValue(value, toType);
  }

  if (fromType === 'pounds' && toType === 'kilos') {
    const inKilos = Math.round(numericValue * 0.453592);
    return `${inKilos} kg`;
  } else if (fromType === 'kilos' && toType === 'pounds') {
    const inPounds = Math.round(numericValue * 2.20462);
    return `${inPounds} lbs`;
  }
  
  if (isDistanceType(fromType) && isDistanceType(toType)) {
    let inMeters: number;
    
    switch (fromType) {
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
    
    let convertedValue: number;
    switch (toType) {
      case 'distance-m':
        convertedValue = inMeters;
        return `${Math.round(convertedValue)}m`;
      case 'distance-ft':
        convertedValue = inMeters / 0.3048;
        return `${Math.round(convertedValue)}ft`;
      case 'distance-yd':
        convertedValue = inMeters / 0.9144;
        return `${Math.round(convertedValue)}yd`;
      case 'distance-mi':
        convertedValue = inMeters / 1609.34;
        return `${parseFloat(convertedValue.toFixed(2))}mi`;
      default:
        return formatValue(value, toType);
    }
  }
  
  if ((fromType === 'pounds' || fromType === 'kilos') && isDistanceType(toType)) {
    return formatValue('', toType);
  } else if (isDistanceType(fromType) && (toType === 'pounds' || toType === 'kilos')) {
    return formatValue('', toType);
  }
  
  return formatValue(value, toType);
};

const WeightInput: React.FC<WeightInputProps> = ({
  value,
  weightType,
  onChange,
  onWeightTypeChange,
  placeholder = "",
  isFocused = false,
  hideSelector = false,
  exerciseName = "",
}) => {
  const inputRef = useRef<HTMLInputElement>(null);
  const [isTypePickerOpen, setIsTypePickerOpen] = useState(false);
  const [prevWeightType, setPrevWeightType] = useState<WeightType>(weightType);
  const { getMaxWeightForExercise, convertPercentageToWeight, convertWeightToPercentage } = useWorkout();
  
  const maxWeightData = exerciseName ? getMaxWeightForExercise(exerciseName) : null;
  const hasMaxWeight = !!maxWeightData;
  
  useEffect(() => {
    if (isFocused && inputRef.current) {
      inputRef.current.focus();
    }
  }, [isFocused]);
  
  useEffect(() => {
    if (prevWeightType !== weightType && value) {
      if (value.includes('%') && hasMaxWeight && exerciseName) {
        const newWeight = convertPercentageToWeight(value, exerciseName, weightType);
        onChange(newWeight);
      } else {
        const convertedValue = convertWeight(value, prevWeightType, weightType);
        onChange(convertedValue);
      }
      setPrevWeightType(weightType);
    } else if (prevWeightType !== weightType) {
      setPrevWeightType(weightType);
    }
  }, [weightType, prevWeightType, value, onChange, hasMaxWeight, exerciseName, convertPercentageToWeight]);
  
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    let newValue = e.target.value;
    
    if (newValue.includes('%')) {
      newValue = newValue.replace(/[^0-9%]/g, '').replace(/%+/g, '%');
      if (newValue.indexOf('%') !== newValue.length - 1 && newValue.includes('%')) {
        newValue = newValue.replace(/%/g, '') + '%';
      }
      
      if (hasMaxWeight && exerciseName) {
        const weightValue = convertPercentageToWeight(newValue, exerciseName, weightType);
        onChange(weightValue);
      } else {
        onChange(newValue);
      }
    } else {
      if (weightType === 'pounds') {
        newValue = newValue.replace(/[^0-9.\s/lbs]/g, '');
        if (newValue.includes('lbs') && newValue.indexOf('lbs') !== newValue.length - 3) {
          newValue = newValue.replace(/lbs/g, '') + 'lbs';
        }
      } else if (weightType === 'kilos') {
        newValue = newValue.replace(/[^0-9.\s/kg]/g, '');
        if (newValue.includes('kg') && newValue.indexOf('kg') !== newValue.length - 2) {
          newValue = newValue.replace(/kg/g, '') + 'kg';
        }
      } else if (weightType === 'distance-m') {
        newValue = newValue.replace(/[^0-9.\s/m]/g, '');
        if (newValue.includes('m') && newValue.indexOf('m') !== newValue.length - 1) {
          newValue = newValue.replace(/m/g, '') + 'm';
        }
      } else if (weightType === 'distance-ft') {
        newValue = newValue.replace(/[^0-9.\s/ft]/g, '');
        if (newValue.includes('ft') && newValue.indexOf('ft') !== newValue.length - 2) {
          newValue = newValue.replace(/ft/g, '') + 'ft';
        }
      } else if (weightType === 'distance-yd') {
        newValue = newValue.replace(/[^0-9.\s/yd]/g, '');
        if (newValue.includes('yd') && newValue.indexOf('yd') !== newValue.length - 2) {
          newValue = newValue.replace(/yd/g, '') + 'yd';
        }
      } else if (weightType === 'distance-mi') {
        newValue = newValue.replace(/[^0-9.\s/mi]/g, '');
        if (newValue.includes('mi') && newValue.indexOf('mi') !== newValue.length - 2) {
          newValue = newValue.replace(/mi/g, '') + 'mi';
        }
      }
      
      onChange(newValue);
    }
  };
  
  const handleWeightTypeChange = (newType: WeightType) => {
    setPrevWeightType(weightType);
    onWeightTypeChange(newType);
  };
  
  const handleBlur = () => {
    if (value) {
      if (!value.includes('%')) {
        onChange(formatValue(value, weightType));
      }
    }
  };
  
  const currentPlaceholder = placeholder || getPlaceholder(weightType);
  const placeholderStyle = getWeightStyle(weightType);
  
  return (
    <div className="flex items-center w-full h-full">
      {!hideSelector && (
        <Popover open={isTypePickerOpen} onOpenChange={setIsTypePickerOpen}>
          <PopoverTrigger asChild>
            <button 
              type="button"
              className="flex items-center mr-1.5 p-1 rounded hover:bg-accent"
              aria-label="Change weight type"
            >
              <WeightTypeSelector
                value={weightType}
                onChange={handleWeightTypeChange}
                variant="minimal"
              />
            </button>
          </PopoverTrigger>
          <PopoverContent className="w-[250px] p-0 z-50" align="start">
            <WeightTypeSelector
              value={weightType}
              onChange={handleWeightTypeChange}
              onClose={() => setIsTypePickerOpen(false)}
            />
          </PopoverContent>
        </Popover>
      )}
      
      <div className="relative w-full h-full">
        <input
          ref={inputRef}
          type="text"
          className={cn(
            "cell-input w-full h-full bg-transparent outline-none px-2 py-1 font-medium",
            value ? getWeightStyle(weightType) : ""
          )}
          value={value}
          onChange={handleChange}
          onBlur={handleBlur}
          placeholder=""
        />
        
        {!value && (
          <div className={cn(
            "absolute inset-0 flex items-center pointer-events-none px-2 py-1",
            placeholderStyle
          )}>
            {currentPlaceholder}
          </div>
        )}
      </div>
    </div>
  );
};

export default WeightInput;
