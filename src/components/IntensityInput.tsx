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
      return value.toLowerCase().includes('rpe') ? value : `RPE ${value}`;
    case 'arpe':
      return value.toLowerCase().includes('arpe') ? value : `aRPE ${value}`;
    case 'percent':
      return value.includes('%') ? value : `${value}%`;
    case 'velocity':
      return value.includes('m/s') ? value : `${value} m/s`;
    default:
      return value;
  }
};

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

const convertIntensity = (value: string, fromType: IntensityType, toType: IntensityType): string => {
  const numericValue = parseFloat(value.replace(/[^\d.]/g, ''));
  if (isNaN(numericValue)) return value;
  
  if (fromType === toType) {
    return formatValue(value, toType);
  }

  if ((fromType === 'rpe' && toType === 'arpe') || (fromType === 'arpe' && toType === 'rpe')) {
    return formatValue(numericValue.toString(), toType);
  }
  
  if (fromType === 'rpe' && toType === 'percent') {
    const percent = Math.round((numericValue - 1) * 10 + 5);
    const cappedPercent = Math.min(percent, 100);
    return `${cappedPercent}%`;
  }
  
  if (fromType === 'percent' && toType === 'rpe') {
    const percent = numericValue;
    const rpe = (percent - 5) / 10 + 1;
    const roundedRpe = Math.round(rpe * 2) / 2;
    const cappedRpe = Math.max(1, Math.min(10, roundedRpe));
    return `RPE ${cappedRpe}`;
  }
  
  if (fromType === 'percent' && toType === 'arpe') {
    const percent = numericValue;
    const rpe = (percent - 5) / 10 + 1;
    const roundedRpe = Math.round(rpe * 2) / 2;
    const cappedRpe = Math.max(1, Math.min(10, roundedRpe));
    return `aRPE ${cappedRpe}`;
  }
  
  if (fromType === 'arpe' && toType === 'percent') {
    const percent = Math.round((numericValue - 1) * 10 + 5);
    const cappedPercent = Math.min(percent, 100);
    return `${cappedPercent}%`;
  }
  
  if ((fromType === 'absolute' || toType === 'absolute') && fromType !== toType) {
    return formatValue('', toType);
  }
  
  if ((fromType === 'velocity' || toType === 'velocity') && fromType !== toType) {
    return formatValue('', toType);
  }
  
  return formatValue(value, toType);
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
  const [prevIntensityType, setPrevIntensityType] = useState<IntensityType>(intensityType);
  
  useEffect(() => {
    if (isFocused && inputRef.current) {
      inputRef.current.focus();
    }
  }, [isFocused]);
  
  useEffect(() => {
    if (prevIntensityType !== intensityType && value) {
      const convertedValue = convertIntensity(value, prevIntensityType, intensityType);
      onChange(convertedValue);
      setPrevIntensityType(intensityType);
    } else if (prevIntensityType !== intensityType) {
      setPrevIntensityType(intensityType);
    }
  }, [intensityType, prevIntensityType, value, onChange]);
  
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    let newValue = e.target.value;
    
    if (intensityType === 'rpe' || intensityType === 'arpe') {
      const hasPrefix = newValue.toLowerCase().includes('rpe') || newValue.toLowerCase().includes('arpe');
      
      if (!hasPrefix) {
        newValue = newValue.replace(/[^0-9.]/g, '');
        const numValue = parseFloat(newValue);
        if (!isNaN(numValue) && numValue > 10) {
          newValue = '10';
        }
      }
    } else if (intensityType === 'percent') {
      newValue = newValue.replace(/[^0-9%]/g, '').replace(/%+/g, '%');
      if (newValue.indexOf('%') !== newValue.length - 1 && newValue.includes('%')) {
        newValue = newValue.replace(/%/g, '') + '%';
      }
      const numValue = parseInt(newValue.replace('%', ''));
      if (!isNaN(numValue) && numValue > 100) {
        newValue = '100%';
      }
    } else if (intensityType === 'velocity') {
      newValue = newValue.replace(/[^0-9.\s/m/s]/g, '');
      if (newValue.includes('m/s') && newValue.indexOf('m/s') !== newValue.length - 3) {
        newValue = newValue.replace(/m\/s/g, '') + 'm/s';
      }
    }
    
    onChange(newValue);
  };
  
  const handleIntensityTypeChange = (newType: IntensityType) => {
    setPrevIntensityType(intensityType);
    onIntensityTypeChange(newType);
  };
  
  const handleBlur = () => {
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
                onChange={handleIntensityTypeChange}
                variant="minimal"
              />
            </button>
          </PopoverTrigger>
          <PopoverContent className="w-[250px] p-0 z-50" align="start">
            <IntensityTypeSelector
              value={intensityType}
              onChange={handleIntensityTypeChange}
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

export default IntensityInput;
