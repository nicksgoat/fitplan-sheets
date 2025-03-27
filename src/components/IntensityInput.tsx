
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
      return 'RPE (1-10)';
    case 'arpe':
      return 'aRPE (1-10)';
    case 'percent':
      return '% of max';
    case 'absolute':
      return 'Weight';
    case 'velocity':
      return 'm/s';
    default:
      return 'Intensity';
  }
};

const formatValue = (value: string, intensityType: IntensityType): string => {
  if (!value) return value;

  switch (intensityType) {
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
      // Allow only numbers and decimal point, max value 10
      newValue = newValue.replace(/[^0-9.]/g, '');
      const numValue = parseFloat(newValue);
      if (!isNaN(numValue) && numValue > 10) {
        newValue = '10';
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
    // Format the value on blur
    onChange(formatValue(value, intensityType));
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
      
      <input
        ref={inputRef}
        type="text"
        className={cn(
          "cell-input w-full h-full bg-transparent outline-none px-2 py-1 font-medium",
          intensityType && getIntensityStyle(intensityType)
        )}
        value={value}
        onChange={handleChange}
        onBlur={handleBlur}
        placeholder={placeholder || getPlaceholder(intensityType)}
      />
    </div>
  );
};

export default IntensityInput;
