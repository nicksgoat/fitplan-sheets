
import React, { useRef, useEffect, useState } from "react";
import { cn } from "@/lib/utils";
import { IntensityType } from "@/types/workout";
import IntensityTypeSelector from "./IntensityTypeSelector";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";

interface IntensityInputProps {
  value: string;
  intensityType: IntensityType;
  onChange: (value: string) => void;
  onIntensityTypeChange: (type: IntensityType) => void;
  placeholder?: string;
  isFocused?: boolean;
  hideSelector?: boolean;
}

const getPlaceholder = (intensityType: IntensityType): string => {
  switch (intensityType) {
    case 'rpe':
      return 'RPE 8';
    case 'arpe':
      return 'aRPE 7';
    case 'percent':
      return '75%';
    case 'absolute':
      return '135';
    case 'velocity':
      return '0.8 m/s';
    default:
      return 'Intensity';
  }
};

const formatValue = (value: string, intensityType: IntensityType): string => {
  if (!value) return value;

  switch (intensityType) {
    case 'rpe':
      // Add RPE if not already there
      return value.toLowerCase().includes('rpe') ? value : `RPE ${value}`;
    case 'arpe':
      // Add aRPE if not already there
      return value.toLowerCase().includes('arpe') ? value : `aRPE ${value}`;
    case 'percent':
      // Add % if not already there
      return value.includes('%') ? value : `${value}%`;
    case 'velocity':
      // Add m/s if not already there
      return value.includes('m/s') ? value : `${value} m/s`;
    default:
      return value;
  }
};

// Get visual style based on intensity type
const getIntensityStyle = (type: IntensityType) => {
  switch (type) {
    case 'rpe':
      return 'text-amber-600';
    case 'arpe':
      return 'text-orange-600';
    case 'percent':
      return 'text-blue-600';
    case 'absolute':
      return 'text-green-600';
    case 'velocity':
      return 'text-purple-600';
    default:
      return '';
  }
};

const IntensityInput: React.FC<IntensityInputProps> = ({
  value,
  intensityType,
  onChange,
  onIntensityTypeChange,
  placeholder = "",
  isFocused = false,
  hideSelector = false,
}) => {
  const inputRef = useRef<HTMLInputElement>(null);
  const [isTypePickerOpen, setIsTypePickerOpen] = useState(false);
  
  useEffect(() => {
    if (isFocused && inputRef.current) {
      inputRef.current.focus();
    }
  }, [isFocused]);
  
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    let newValue = e.target.value;
    
    // Basic validation based on intensity type
    if (intensityType === 'rpe' || intensityType === 'arpe') {
      // Check if already has prefix
      const hasPrefix = newValue.toLowerCase().includes('rpe') || newValue.toLowerCase().includes('arpe');
      
      if (!hasPrefix) {
        // Allow only numbers and decimal point, max value 10
        newValue = newValue.replace(/[^0-9.]/g, '');
        const numValue = parseFloat(newValue);
        if (!isNaN(numValue) && numValue > 10) {
          newValue = '10';
        }
      }
    } else if (intensityType === 'percent') {
      // Allow only numbers and % symbol
      newValue = newValue.replace(/[^0-9%]/g, '').replace(/%+/g, '%');
      // Remove any non-trailing % symbols
      if (newValue.indexOf('%') !== newValue.length - 1 && newValue.includes('%')) {
        newValue = newValue.replace(/%/g, '') + '%';
      }
      // Ensure percentage doesn't exceed 100%
      const numValue = parseInt(newValue.replace('%', ''));
      if (!isNaN(numValue) && numValue > 100) {
        newValue = '100%';
      }
    } else if (intensityType === 'velocity') {
      // For velocity, allow numbers, decimal point, and m/s
      newValue = newValue.replace(/[^0-9.\s/m/s]/g, '');
      if (newValue.includes('m/s') && newValue.indexOf('m/s') !== newValue.length - 3) {
        newValue = newValue.replace(/m\/s/g, '') + 'm/s';
      }
    }
    
    onChange(newValue);
  };
  
  const handleBlur = () => {
    // Format the value on blur if it's not empty
    if (value) {
      onChange(formatValue(value, intensityType));
    }
  };
  
  const currentPlaceholder = placeholder || getPlaceholder(intensityType);
  const placeholderStyle = getIntensityStyle(intensityType);
  
  return (
    <div className="flex items-center w-full h-full">
      {!hideSelector && (
        <Popover open={isTypePickerOpen} onOpenChange={setIsTypePickerOpen}>
          <PopoverTrigger asChild>
            <button 
              type="button"
              className="flex items-center mr-1.5 p-1 rounded hover:bg-accent"
              aria-label="Change intensity type"
            >
              <IntensityTypeSelector
                value={intensityType}
                onChange={(type) => {
                  onIntensityTypeChange(type);
                  setIsTypePickerOpen(false);
                }}
                variant="minimal"
              />
            </button>
          </PopoverTrigger>
          <PopoverContent className="w-[250px] p-0 z-50" align="start">
            <IntensityTypeSelector
              value={intensityType}
              onChange={(type) => {
                onIntensityTypeChange(type);
                setIsTypePickerOpen(false);
              }}
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
            value ? getIntensityStyle(intensityType) : ""
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
            placeholderStyle,
            "opacity-40"
          )}>
            {currentPlaceholder}
          </div>
        )}
      </div>
    </div>
  );
};

export default IntensityInput;
