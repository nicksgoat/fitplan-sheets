
import React from "react";
import { CheckIcon, Target, ArrowDown, Clock, FlipHorizontal, Timer } from "lucide-react";
import { RepType } from "@/types/workout";
import { Button } from "@/components/ui/button";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
} from "@/components/ui/command";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { cn } from "@/lib/utils";

interface RepTypeSelectorProps {
  value: RepType;
  onChange: (value: RepType) => void;
  onClose?: () => void;
  variant?: "default" | "minimal";
}

const repTypeOptions: { value: RepType; label: string; description: string; icon: React.ReactNode }[] = [
  {
    value: 'fixed',
    label: 'Fixed reps',
    description: 'Apply the same value across all sets.',
    icon: <Target className="h-4 w-4 text-muted-foreground" />
  },
  {
    value: 'range',
    label: 'Rep range',
    description: 'Enter a range of values for flexibility.',
    icon: <ArrowDown className="h-4 w-4 text-muted-foreground" />
  },
  {
    value: 'descending',
    label: 'Comma-separated reps',
    description: 'Apply different reps or time per set using commas.',
    icon: <ArrowDown className="h-4 w-4 text-muted-foreground" />
  },
  {
    value: 'time',
    label: 'Time-based reps',
    description: 'Specify a duration with "s" or "m".',
    icon: <Clock className="h-4 w-4 text-muted-foreground" />
  },
  {
    value: 'each-side',
    label: 'Each-side',
    description: 'Specify "each-side" with reps or time.',
    icon: <FlipHorizontal className="h-4 w-4 text-muted-foreground" />
  },
  {
    value: 'amrap',
    label: 'AMRAP',
    description: 'Specify "As many reps as possible".',
    icon: <Timer className="h-4 w-4 text-muted-foreground" />
  },
];

const RepTypeSelector: React.FC<RepTypeSelectorProps> = ({ 
  value, 
  onChange,
  onClose,
  variant = "default"
}) => {
  const handleSelect = (selectedValue: RepType) => {
    onChange(selectedValue);
    if (onClose) {
      onClose();
    }
  };
  
  // Minimal variant (used in the main exercise row)
  if (variant === "minimal") {
    const selectedOption = repTypeOptions.find(option => option.value === value);
    
    return (
      <div className="flex items-center gap-1.5 text-sm text-muted-foreground">
        {selectedOption?.icon}
        <span className="text-xs">{selectedOption?.label}</span>
      </div>
    );
  }
  
  // Direct list mode (used in RepInput dropdown)
  if (onClose) {
    return (
      <div className="w-full p-1">
        <div className="mb-1">
          <div className="px-2 mb-1 text-sm font-semibold">Select Rep Type</div>
          {repTypeOptions.map((option) => (
            <div
              key={option.value}
              onClick={() => handleSelect(option.value)}
              className={cn(
                "flex flex-col gap-1 cursor-pointer py-2 px-3 hover:bg-accent rounded-md mb-1",
                value === option.value && "bg-accent/50"
              )}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-1.5">
                  {option.icon}
                  <p className="text-sm font-medium">{option.label}</p>
                </div>
                {value === option.value && (
                  <CheckIcon className="h-4 w-4" />
                )}
              </div>
              <p className="text-xs text-muted-foreground">{option.description}</p>
              
              {/* Example input display based on rep type */}
              {option.value === 'fixed' && (
                <div className="mt-1 bg-background/80 rounded px-2 py-1 text-xs border border-dashed">
                  12
                </div>
              )}
              {option.value === 'range' && (
                <div className="mt-1 bg-background/80 rounded px-2 py-1 text-xs border border-dashed">
                  8-12
                </div>
              )}
              {option.value === 'descending' && (
                <div className="mt-1 bg-background/80 rounded px-2 py-1 text-xs border border-dashed">
                  12, 10, 8
                </div>
              )}
              {option.value === 'time' && (
                <div className="mt-1 bg-background/80 rounded px-2 py-1 text-xs border border-dashed">
                  30s
                </div>
              )}
              {option.value === 'each-side' && (
                <div className="mt-1 bg-background/80 rounded px-2 py-1 text-xs border border-dashed">
                  12 e/s
                </div>
              )}
              {option.value === 'amrap' && (
                <div className="mt-1 bg-background/80 rounded px-2 py-1 text-xs border border-dashed text-amber-600 font-medium">
                  AMRAP
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    );
  }
  
  // Popover mode (used elsewhere)
  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          role="combobox"
          className="w-full justify-between border-dashed border-muted h-8"
        >
          <div className="flex items-center gap-2">
            {repTypeOptions.find(option => option.value === value)?.icon}
            <span className="text-xs">{repTypeOptions.find(option => option.value === value)?.label}</span>
          </div>
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-[300px] p-0">
        <Command>
          <CommandInput placeholder="Search rep type..." />
          <CommandEmpty>No rep type found.</CommandEmpty>
          <CommandGroup>
            {repTypeOptions.map((option) => (
              <CommandItem
                key={option.value}
                value={option.value}
                onSelect={() => handleSelect(option.value)}
                className="py-2"
              >
                <div className="flex items-center">
                  {option.icon}
                  <div className="ml-2">
                    <p className="text-sm font-medium">{option.label}</p>
                    <p className="text-xs text-muted-foreground">{option.description}</p>
                  </div>
                </div>
                <CheckIcon
                  className={cn(
                    "ml-auto h-4 w-4",
                    value === option.value ? "opacity-100" : "opacity-0"
                  )}
                />
              </CommandItem>
            ))}
          </CommandGroup>
        </Command>
      </PopoverContent>
    </Popover>
  );
};

export default RepTypeSelector;
