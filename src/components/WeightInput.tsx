
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
    case 'distance':
      return '100m';
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
    case 'distance':
      return `${numericValue}m`;
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
    case 'distance':
      return 'text-purple-600';
    default:
      return '';
  }
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

  let convertedValue: number;
  
  // Convert to common unit (kilos) first
  let inKilos: number;
  if (fromType === 'pounds') {
    inKilos = numericValue * 0.453592; // pounds to kilos
  } else if (fromType === 'kilos') {
    inKilos = numericValue;
  } else {
    // Can't convert distance to weight
    return formatValue(value, toType);
  }
  
  // Convert from common unit to target unit
  if (toType === 'pounds') {
    convertedValue = Math.round(inKilos / 0.453592); // kilos to pounds
    return `${convertedValue} lbs`;
  } else if (toType === 'kilos') {
    convertedValue = Math.round(inKilos);
    return `${convertedValue} kg`;
  } else {
    // Can't convert weight to distance
    return formatValue('', toType);
  }
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
    } else if (weightType === 'distance') {
      // Allow only numbers and m
      newValue = newValue.replace(/[^0-9.\s/m]/g, '');
      if (newValue.includes('m') && newValue.indexOf('m') !== newValue.length - 1) {
        newValue = newValue.replace(/m/g, '') + 'm';
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
