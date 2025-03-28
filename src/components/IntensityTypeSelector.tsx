
import React from "react";
import { CheckIcon, Target, ArrowDown, Percent, Dumbbell, Zap } from "lucide-react";
import { IntensityType } from "@/types/workout";
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

interface IntensityTypeSelectorProps {
  value: IntensityType;
  onChange: (value: IntensityType) => void;
  onClose?: () => void;
  variant?: "default" | "minimal";
}

const intensityTypeOptions: { value: IntensityType; label: string; description: string; icon: React.ReactNode }[] = [
  {
    value: 'rpe',
    label: 'RPE',
    description: 'Rate of Perceived Exertion (e.g., 8.5)',
    icon: <Target className="h-4 w-4 text-muted-foreground" />
  },
  {
    value: 'arpe',
    label: 'aRPE',
    description: 'Adjusted RPE (e.g., 7.5)',
    icon: <ArrowDown className="h-4 w-4 text-muted-foreground" />
  },
  {
    value: 'percent',
    label: '% of Max',
    description: 'Percentage of max (e.g., 75%)',
    icon: <Percent className="h-4 w-4 text-muted-foreground" />
  },
  {
    value: 'absolute',
    label: 'Absolute Weight',
    description: 'Fixed weight value (e.g., 185 lbs)',
    icon: <Dumbbell className="h-4 w-4 text-muted-foreground" />
  },
  {
    value: 'velocity',
    label: 'Velocity',
    description: 'Speed-based training (e.g., 0.8 m/s)',
    icon: <Zap className="h-4 w-4 text-muted-foreground" />
  },
];

const IntensityTypeSelector: React.FC<IntensityTypeSelectorProps> = ({ 
  value, 
  onChange,
  onClose,
  variant = "default"
}) => {
  const handleSelect = (selectedValue: IntensityType) => {
    console.log("IntensityTypeSelector: Selected intensity type:", selectedValue);
    onChange(selectedValue);
    if (onClose) {
      onClose();
    }
  };
  
  // Minimal variant (used in the main exercise row)
  if (variant === "minimal") {
    const selectedOption = intensityTypeOptions.find(option => option.value === value);
    
    return (
      <div className="flex items-center gap-1.5 text-sm text-muted-foreground">
        {selectedOption?.icon}
        <span className="text-xs">{selectedOption?.label}</span>
      </div>
    );
  }
  
  // Direct list mode (used in dropdown)
  if (onClose) {
    return (
      <div className="w-full p-1">
        <div className="mb-1">
          <div className="px-2 mb-1 text-sm font-semibold">Select Intensity Type</div>
          {intensityTypeOptions.map((option) => (
            <div
              key={option.value}
              onClick={() => handleSelect(option.value)}
              className={cn(
                "flex flex-col gap-1 cursor-pointer py-1.5 px-3 hover:bg-accent rounded-md mb-1",
                value === option.value && "bg-accent/50"
              )}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-1.5">
                  <div className="flex items-center justify-center h-5 w-5 rounded-full border border-muted-foreground/30">
                    {option.icon}
                  </div>
                  <p className="text-sm font-medium">{option.label}</p>
                </div>
                {value === option.value && (
                  <CheckIcon className="h-4 w-4" />
                )}
              </div>
              <p className="text-xs text-muted-foreground ml-7">{option.description}</p>
              
              {/* Example input displays based on intensity type */}
              {option.value === 'rpe' && (
                <div className="mt-1 ml-7 bg-background/80 rounded px-2 py-1 text-xs border border-dashed text-amber-600">
                  8.5
                </div>
              )}
              {option.value === 'arpe' && (
                <div className="mt-1 ml-7 bg-background/80 rounded px-2 py-1 text-xs border border-dashed text-orange-600">
                  7.5
                </div>
              )}
              {option.value === 'percent' && (
                <div className="mt-1 ml-7 bg-background/80 rounded px-2 py-1 text-xs border border-dashed text-blue-600">
                  75%
                </div>
              )}
              {option.value === 'absolute' && (
                <div className="mt-1 ml-7 bg-background/80 rounded px-2 py-1 text-xs border border-dashed text-green-600">
                  185 lbs
                </div>
              )}
              {option.value === 'velocity' && (
                <div className="mt-1 ml-7 bg-background/80 rounded px-2 py-1 text-xs border border-dashed text-purple-600">
                  0.8 m/s
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    );
  }
  
  // Popover mode
  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          role="combobox"
          className="w-full justify-between border-dashed border-muted h-8"
        >
          <div className="flex items-center gap-2">
            {intensityTypeOptions.find(option => option.value === value)?.icon}
            <span className="text-xs">{intensityTypeOptions.find(option => option.value === value)?.label}</span>
          </div>
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-[250px] p-0" align="start" side="bottom">
        <Command>
          <CommandInput placeholder="Search intensity type..." />
          <CommandEmpty>No intensity type found.</CommandEmpty>
          <CommandGroup>
            {intensityTypeOptions.map((option) => (
              <CommandItem
                key={option.value}
                value={option.value}
                onSelect={() => handleSelect(option.value as IntensityType)}
                className="py-1.5"
              >
                <div className="flex items-center">
                  <div className="flex items-center justify-center h-5 w-5 rounded-full border border-muted-foreground/30">
                    {option.icon}
                  </div>
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

export default IntensityTypeSelector;
