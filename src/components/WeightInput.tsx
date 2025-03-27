
import React, { useRef, useEffect, useState } from "react";
import { cn } from "@/lib/utils";
import { WeightType } from "@/types/workout";
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

  // Strip any existing unit
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

// Get visual style based on weight type
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

// Check if a weight type is a distance type
const isDistanceType = (type: WeightType): boolean => {
  return type === 'distance-m' || type === 'distance-ft' || 
         type === 'distance-yd' || type === 'distance-mi';
};

// Convert weight between units
const convertWeight = (value: string, fromType: WeightType, toType: WeightType): string => {
  // Extract numeric value
  const numericValue = parseFloat(value.replace(/[^\d.]/g, ''));
  if (isNaN(numericValue)) return value;
  
  // If types are the same, no conversion needed
  if (fromType === toType) {
    return formatValue(value, toType);
  }

  // Handle weight conversions (pounds and kilos)
  if (fromType === 'pounds' && toType === 'kilos') {
    // pounds to kilos: 1 lb = 0.453592 kg
    const inKilos = Math.round(numericValue * 0.453592);
    return `${inKilos} kg`;
  } else if (fromType === 'kilos' && toType === 'pounds') {
    // kilos to pounds: 1 kg = 2.20462 lbs
    const inPounds = Math.round(numericValue * 2.20462);
    return `${inPounds} lbs`;
  }
  
  // Handle distance conversions
  if (isDistanceType(fromType) && isDistanceType(toType)) {
    // Convert to meters first (our base unit for distances)
    let inMeters: number;
    
    // Convert from the original distance type to meters
    switch (fromType) {
      case 'distance-m':
        inMeters = numericValue;
        break;
      case 'distance-ft':
        inMeters = numericValue * 0.3048; // 1 ft = 0.3048 m
        break;
      case 'distance-yd':
        inMeters = numericValue * 0.9144; // 1 yd = 0.9144 m
        break;
      case 'distance-mi':
        inMeters = numericValue * 1609.34; // 1 mi = 1609.34 m
        break;
      default:
        inMeters = 0;
    }
    
    // Convert from meters to the target distance type
    let convertedValue: number;
    switch (toType) {
      case 'distance-m':
        convertedValue = inMeters;
        return `${Math.round(convertedValue)}m`;
      case 'distance-ft':
        convertedValue = inMeters / 0.3048; // m to ft
        return `${Math.round(convertedValue)}ft`;
      case 'distance-yd':
        convertedValue = inMeters / 0.9144; // m to yd
        return `${Math.round(convertedValue)}yd`;
      case 'distance-mi':
        convertedValue = inMeters / 1609.34; // m to mi
        // Use toFixed(2) for miles to show decimal places, then remove trailing zeros
        return `${parseFloat(convertedValue.toFixed(2))}mi`;
      default:
        return formatValue(value, toType);
    }
  }
  
  // If converting between weight and distance (not possible), just format
  // the value according to the new type but don't attempt conversion
  if ((fromType === 'pounds' || fromType === 'kilos') && isDistanceType(toType)) {
    return formatValue('', toType);
  } else if (isDistanceType(fromType) && (toType === 'pounds' || toType === 'kilos')) {
    return formatValue('', toType);
  }
  
  // Default fallback
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
}) => {
  const inputRef = useRef<HTMLInputElement>(null);
  const [isTypePickerOpen, setIsTypePickerOpen] = useState(false);
  const [prevWeightType, setPrevWeightType] = useState<WeightType>(weightType);
  
  useEffect(() => {
    if (isFocused && inputRef.current) {
      inputRef.current.focus();
    }
  }, [isFocused]);
  
  // Handle weight type change and convert values
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
    
    // Basic validation based on weight type
    if (weightType === 'pounds') {
      // Allow only numbers and lbs
      newValue = newValue.replace(/[^0-9.\s/lbs]/g, '');
      if (newValue.includes('lbs') && newValue.indexOf('lbs') !== newValue.length - 3) {
        newValue = newValue.replace(/lbs/g, '') + 'lbs';
      }
    } else if (weightType === 'kilos') {
      // Allow only numbers and kg
      newValue = newValue.replace(/[^0-9.\s/kg]/g, '');
      if (newValue.includes('kg') && newValue.indexOf('kg') !== newValue.length - 2) {
        newValue = newValue.replace(/kg/g, '') + 'kg';
      }
    } else if (weightType === 'distance-m') {
      // Allow only numbers and m
      newValue = newValue.replace(/[^0-9.\s/m]/g, '');
      if (newValue.includes('m') && newValue.indexOf('m') !== newValue.length - 1) {
        newValue = newValue.replace(/m/g, '') + 'm';
      }
    } else if (weightType === 'distance-ft') {
      // Allow only numbers and ft
      newValue = newValue.replace(/[^0-9.\s/ft]/g, '');
      if (newValue.includes('ft') && newValue.indexOf('ft') !== newValue.length - 2) {
        newValue = newValue.replace(/ft/g, '') + 'ft';
      }
    } else if (weightType === 'distance-yd') {
      // Allow only numbers and yd
      newValue = newValue.replace(/[^0-9.\s/yd]/g, '');
      if (newValue.includes('yd') && newValue.indexOf('yd') !== newValue.length - 2) {
        newValue = newValue.replace(/yd/g, '') + 'yd';
      }
    } else if (weightType === 'distance-mi') {
      // Allow only numbers and mi
      newValue = newValue.replace(/[^0-9.\s/mi]/g, '');
      if (newValue.includes('mi') && newValue.indexOf('mi') !== newValue.length - 2) {
        newValue = newValue.replace(/mi/g, '') + 'mi';
      }
    }
    
    onChange(newValue);
  };
  
  const handleWeightTypeChange = (newType: WeightType) => {
    setPrevWeightType(weightType);
    onWeightTypeChange(newType);
  };
  
  const handleBlur = () => {
    // Format the value on blur if it's not empty
    if (value) {
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
        
        {/* Background placeholder that shows when there's no value */}
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
