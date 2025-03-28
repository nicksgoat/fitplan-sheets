import React, { useRef, useEffect, useState } from "react";
import { cn } from "@/lib/utils";
import { WeightType, CalculationDirection } from "@/types/workout";
import WeightTypeSelector from "./WeightTypeSelector";
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
  maxWeight?: string;
  usePercentage?: boolean;
  onCalculationDirectionChange?: (direction: CalculationDirection) => void;
  calculationDirection?: CalculationDirection;
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

const extractNumericWeight = (value: string): number => {
  if (!value) return 0;
  return parseFloat(value.replace(/[^\d.]/g, '')) || 0;
};

const calculatePercentage = (weight: string, maxWeight: string): number => {
  const weightValue = extractNumericWeight(weight);
  const maxWeightValue = extractNumericWeight(maxWeight);
  
  if (!maxWeightValue) return 0;
  return (weightValue / maxWeightValue) * 100;
};

const calculateWeight = (percentage: number, maxWeight: string): string => {
  const maxWeightValue = extractNumericWeight(maxWeight);
  if (!maxWeightValue) return '';
  
  const calculatedWeight = (percentage / 100) * maxWeightValue;
  return calculatedWeight.toString();
};

const WeightInput: React.FC<WeightInputProps> = ({
  value,
  weightType,
  onChange,
  onWeightTypeChange,
  placeholder = "",
  isFocused = false,
  hideSelector = false,
  maxWeight = "",
  usePercentage = false,
  onCalculationDirectionChange,
  calculationDirection = "weight-to-percentage",
}) => {
  const inputRef = useRef<HTMLInputElement>(null);
  const [isTypePickerOpen, setIsTypePickerOpen] = useState(false);
  const [prevWeightType, setPrevWeightType] = useState<WeightType>(weightType);
  const [percentageMode, setPercentageMode] = useState<boolean>(false);
  const [percentage, setPercentage] = useState<number>(
    maxWeight ? calculatePercentage(value, maxWeight) : 0
  );
  
  useEffect(() => {
    if (isFocused && inputRef.current) {
      inputRef.current.focus();
    }
  }, [isFocused]);
  
  useEffect(() => {
    if (maxWeight && calculationDirection === "weight-to-percentage") {
      const newPercentage = calculatePercentage(value, maxWeight);
      setPercentage(newPercentage);
    }
  }, [value, maxWeight, calculationDirection]);
  
  useEffect(() => {
    if (maxWeight && percentageMode && calculationDirection === "percentage-to-weight") {
      const newWeight = calculateWeight(percentage, maxWeight);
      const formattedWeight = formatValue(newWeight, weightType);
      onChange(formattedWeight);
    }
  }, [percentage, maxWeight, percentageMode, calculationDirection, weightType, onChange]);
  
  useEffect(() => {
    if (prevWeightType !== weightType && value) {
      const convertedValue = convertWeight(value, prevWeightType, weightType);
      onChange(convertedValue);
      setPrevWeightType(weightType);
    } else if (prevWeightType !== weightType) {
      setPrevWeightType(weightType);
    }
  }, [weightType, prevWeightType, value, onChange]);
  
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    let newValue = e.target.value;
    
    if (percentageMode) {
      newValue = newValue.replace(/[^0-9.]/g, '');
      const newPercentage = parseFloat(newValue);
      
      if (!isNaN(newPercentage)) {
        setPercentage(newPercentage);
        
        if (calculationDirection === "percentage-to-weight" && maxWeight) {
          const calculatedWeight = calculateWeight(newPercentage, maxWeight);
          onChange(formatValue(calculatedWeight, weightType));
        }
      }
    } else {
      newValue = newValue.replace(/[^0-9.\s/lbs]/g, '');
      if (newValue.includes('lbs') && newValue.indexOf('lbs') !== newValue.length - 3) {
        newValue = newValue.replace(/lbs/g, '') + 'lbs';
      }
      if (newValue.includes('kg') && newValue.indexOf('kg') !== newValue.length - 2) {
        newValue = newValue.replace(/kg/g, '') + 'kg';
      }
      if (newValue.includes('m') && newValue.indexOf('m') !== newValue.length - 1) {
        newValue = newValue.replace(/m/g, '') + 'm';
      }
      if (newValue.includes('ft') && newValue.indexOf('ft') !== newValue.length - 2) {
        newValue = newValue.replace(/ft/g, '') + 'ft';
      }
      if (newValue.includes('yd') && newValue.indexOf('yd') !== newValue.length - 2) {
        newValue = newValue.replace(/yd/g, '') + 'yd';
      }
      if (newValue.includes('mi') && newValue.indexOf('mi') !== newValue.length - 2) {
        newValue = newValue.replace(/mi/g, '') + 'mi';
      }
      
      onChange(newValue);
      
      if (maxWeight && calculationDirection === "weight-to-percentage") {
        const newPercentage = calculatePercentage(newValue, maxWeight);
        setPercentage(newPercentage);
      }
    }
  };
  
  const togglePercentageMode = () => {
    const newPercentageMode = !percentageMode;
    setPercentageMode(newPercentageMode);
    
    if (onCalculationDirectionChange) {
      onCalculationDirectionChange(
        newPercentageMode ? "percentage-to-weight" : "weight-to-percentage"
      );
    }
  };
  
  const handleWeightTypeChange = (newType: WeightType) => {
    setPrevWeightType(weightType);
    onWeightTypeChange(newType);
  };
  
  const handleBlur = () => {
    if (value && !percentageMode) {
      onChange(formatValue(value, weightType));
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
      
      {usePercentage && maxWeight && (
        <button 
          type="button" 
          onClick={togglePercentageMode}
          className={cn(
            "px-1.5 py-0.5 text-xs rounded mr-1",
            percentageMode 
              ? "bg-primary text-primary-foreground" 
              : "bg-muted text-muted-foreground hover:bg-muted/80"
          )}
          title={`Switch to ${percentageMode ? 'weight' : 'percentage'} input`}
        >
          {percentageMode ? '%' : '#'}
        </button>
      )}
      
      <div className="relative w-full h-full flex items-center">
        <input
          ref={inputRef}
          type="text"
          className={cn(
            "cell-input w-full h-full bg-transparent outline-none px-2 py-1 font-medium",
            value ? getWeightStyle(weightType) : ""
          )}
          value={percentageMode ? `${percentage.toFixed(1)}%` : value}
          onChange={handleChange}
          onBlur={handleBlur}
          placeholder=""
        />
        
        {!value && !percentageMode && (
          <div className={cn(
            "absolute inset-0 flex items-center pointer-events-none px-2 py-1",
            placeholderStyle
          )}>
            {currentPlaceholder}
          </div>
        )}
        
        {maxWeight && value && !percentageMode && (
          <div className="text-xs text-muted-foreground absolute right-2">
            {percentage.toFixed(0)}%
          </div>
        )}
      </div>
    </div>
  );
};

export default WeightInput;
