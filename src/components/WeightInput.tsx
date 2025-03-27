
import React from "react";
import { WeightType } from "@/types/workout";
import WeightTypeSelector from "./WeightTypeSelector";
import { ChevronDown } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
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

const WeightInput: React.FC<WeightInputProps> = ({
  value,
  weightType,
  onChange,
  onWeightTypeChange,
  placeholder = "Weight",
  isFocused = false,
  hideSelector = false,
}) => {
  const getPlaceholder = () => {
    switch (weightType) {
      case 'pounds':
        return "135 lbs";
      case 'kilos':
        return "60 kg";
      case 'distance':
        return "100m";
      default:
        return placeholder;
    }
  };

  const getSuffix = () => {
    switch (weightType) {
      case 'pounds':
        return "lbs";
      case 'kilos':
        return "kg";
      case 'distance':
        return "m";
      default:
        return "";
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = e.target.value;
    // Strip any units from the input if they exist
    const cleanValue = newValue
      .replace(/lbs|kg|m/gi, '')
      .trim();
    
    onChange(cleanValue);
  };

  const getDisplayValue = () => {
    if (!value) return '';
    
    // Ensure we're not duplicating the suffix if it's already there
    const hasUnit = /lbs|kg|m$/i.test(value);
    return hasUnit ? value : value;
  };
  
  return (
    <div className={cn(
      "flex items-center",
      isFocused && "ring-2 ring-primary ring-offset-1"
    )}>
      <input
        type="text"
        className="cell-input w-full h-full bg-transparent outline-none px-2 py-1"
        value={getDisplayValue()}
        onChange={handleInputChange}
        placeholder={getPlaceholder()}
      />
      
      {!hideSelector && (
        <Popover>
          <PopoverTrigger asChild>
            <Button 
              variant="ghost" 
              size="sm" 
              className="h-7 px-2 text-xs flex items-center hover:bg-muted"
            >
              <span className="text-xs text-muted-foreground font-normal">{getSuffix()}</span>
              <ChevronDown className="h-3 w-3 text-muted-foreground ml-1" />
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-[200px] p-0" align="end" side="right">
            <WeightTypeSelector
              value={weightType}
              onChange={onWeightTypeChange}
              onClose={() => {}}
            />
          </PopoverContent>
        </Popover>
      )}
      
      {hideSelector && (
        <span className="text-xs text-muted-foreground mr-2">{getSuffix()}</span>
      )}
    </div>
  );
};

export default WeightInput;
