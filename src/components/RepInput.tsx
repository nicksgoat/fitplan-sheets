
import React, { useState } from "react";
import { RepType } from "@/types/workout";
import RepTypeSelector from "./RepTypeSelector";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import { InfoIcon } from "lucide-react";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

interface RepInputProps {
  value: string;
  repType: RepType;
  onChange: (value: string) => void;
  onRepTypeChange: (type: RepType) => void;
  className?: string;
  placeholder?: string;
  isFocused: boolean;
}

const repTypePlaceholders: Record<RepType, string> = {
  'fixed': '12',
  'range': '8-12',
  'descending': '12, 10, 8',
  'time': '30s or 1m',
  'each-side': '12e/s or 30s e/s',
  'amrap': 'AMRAP'
};

const RepInput: React.FC<RepInputProps> = ({
  value,
  repType,
  onChange,
  onRepTypeChange,
  className,
  placeholder,
  isFocused
}) => {
  const [showSelector, setShowSelector] = useState(false);
  
  const handleInputFocus = () => {
    if (!isFocused) {
      setShowSelector(true);
    }
  };
  
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    onChange(e.target.value);
  };
  
  const getHelpText = () => {
    switch (repType) {
      case 'fixed':
        return 'Fixed number of reps';
      case 'range':
        return 'Enter a rep range (e.g., 8-12)';
      case 'descending':
        return 'Enter comma-separated values (e.g., 12, 10, 8)';
      case 'time':
        return 'Enter time with "s" or "m" (e.g., 30s, 1m)';
      case 'each-side':
        return 'Add "e/s" after reps or time (e.g., 12e/s, 30s e/s)';
      case 'amrap':
        return 'As Many Reps As Possible';
      default:
        return '';
    }
  };
  
  return (
    <div className={cn("relative", className)}>
      <div className="flex items-center gap-1">
        <Input
          value={value}
          onChange={handleChange}
          onFocus={handleInputFocus}
          placeholder={repTypePlaceholders[repType] || placeholder}
          className={cn(
            "h-9",
            repType === 'amrap' && "text-amber-600 font-medium"
          )}
        />
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <InfoIcon className="h-4 w-4 text-muted-foreground cursor-help" onClick={() => setShowSelector(true)} />
            </TooltipTrigger>
            <TooltipContent>
              <p>{getHelpText()}</p>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
      </div>
      
      {showSelector && (
        <div className="absolute top-full left-0 right-0 mt-1 z-10 bg-background border rounded-md shadow-md p-2">
          <RepTypeSelector
            value={repType}
            onChange={onRepTypeChange}
            onClose={() => setShowSelector(false)}
          />
        </div>
      )}
    </div>
  );
};

export default RepInput;
