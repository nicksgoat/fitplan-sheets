
import React, { useState, useRef, useEffect } from "react";
import { RepType } from "@/types/workout";
import RepTypeSelector from "./RepTypeSelector";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import { ChevronDown } from "lucide-react";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { Button } from "@/components/ui/button";

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

const repTypeLabels: Record<RepType, string> = {
  'fixed': 'Fixed',
  'range': 'Range',
  'descending': 'Descending',
  'time': 'Time',
  'each-side': 'Each Side',
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
  const selectorRef = useRef<HTMLDivElement>(null);
  const triggerRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        selectorRef.current && 
        !selectorRef.current.contains(event.target as Node) &&
        triggerRef.current && 
        !triggerRef.current.contains(event.target as Node)
      ) {
        setShowSelector(false);
      }
    };
    
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);
  
  useEffect(() => {
    if (isFocused && inputRef.current) {
      inputRef.current.focus();
    }
  }, [isFocused]);
  
  const handleInputFocus = () => {
    if (!isFocused) {
      setShowSelector(false);
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
  
  const handleCloseSelector = () => {
    setShowSelector(false);
  };
  
  const handleOpenSelector = (e: React.MouseEvent) => {
    e.stopPropagation();
    setShowSelector(!showSelector);
  };
  
  return (
    <div className={cn("relative", className)}>
      <div className="flex items-center gap-1">
        <div className="relative flex-grow">
          <Input
            ref={inputRef}
            value={value}
            onChange={handleChange}
            onFocus={handleInputFocus}
            placeholder={repTypePlaceholders[repType] || placeholder}
            className={cn(
              "h-9 pr-20",
              repType === 'amrap' && "text-amber-600 font-medium"
            )}
          />
          <div 
            ref={triggerRef}
            className="absolute right-0 top-0 h-full flex items-center pr-2"
          >
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    className="h-7 px-2 text-xs flex items-center gap-1"
                    onClick={handleOpenSelector}
                  >
                    <span className="text-muted-foreground">{repTypeLabels[repType]}</span>
                    <ChevronDown className="h-3 w-3 text-muted-foreground" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent>
                  <p>{getHelpText()}</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          </div>
        </div>
      </div>
      
      {showSelector && (
        <div 
          ref={selectorRef}
          className="absolute top-full left-0 right-0 mt-1 z-10 bg-background border rounded-md shadow-md"
        >
          <RepTypeSelector
            value={repType}
            onChange={onRepTypeChange}
            onClose={handleCloseSelector}
          />
        </div>
      )}
    </div>
  );
};

export default RepInput;
