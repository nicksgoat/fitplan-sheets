
import React from "react";
import { CheckIcon, Scale, MoveVertical, Ruler } from "lucide-react";
import { WeightType } from "@/types/workout";
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

interface WeightTypeSelectorProps {
  value: WeightType;
  onChange: (value: WeightType) => void;
  onClose?: () => void;
  variant?: "default" | "minimal";
}

const weightTypeOptions: { value: WeightType; label: string; description: string; icon: React.ReactNode }[] = [
  {
    value: 'pounds',
    label: 'Pounds (lbs)',
    description: 'Weight in pounds (e.g., 135 lbs)',
    icon: <Scale className="h-4 w-4 text-muted-foreground" />
  },
  {
    value: 'kilos',
    label: 'Kilograms (kg)',
    description: 'Weight in kilograms (e.g., 60 kg)',
    icon: <MoveVertical className="h-4 w-4 text-muted-foreground" />
  },
  {
    value: 'distance-m',
    label: 'Meters (m)',
    description: 'Distance in meters (e.g., 100m)',
    icon: <Ruler className="h-4 w-4 text-muted-foreground" />
  },
  {
    value: 'distance-ft',
    label: 'Feet (ft)',
    description: 'Distance in feet (e.g., 50ft)',
    icon: <Ruler className="h-4 w-4 text-muted-foreground" />
  },
  {
    value: 'distance-yd',
    label: 'Yards (yd)',
    description: 'Distance in yards (e.g., 25yd)',
    icon: <Ruler className="h-4 w-4 text-muted-foreground" />
  },
  {
    value: 'distance-mi',
    label: 'Miles (mi)',
    description: 'Distance in miles (e.g., 0.5mi)',
    icon: <Ruler className="h-4 w-4 text-muted-foreground" />
  },
];

const WeightTypeSelector: React.FC<WeightTypeSelectorProps> = ({ 
  value, 
  onChange,
  onClose,
  variant = "default"
}) => {
  const handleSelect = (selectedValue: WeightType) => {
    console.log("WeightTypeSelector: Selected weight type:", selectedValue);
    onChange(selectedValue);
    if (onClose) {
      onClose();
    }
  };
  
  // Minimal variant (used in the main exercise row)
  if (variant === "minimal") {
    const selectedOption = weightTypeOptions.find(option => option.value === value);
    
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
          <div className="px-2 mb-1 text-sm font-semibold">Select Weight Type</div>
          {weightTypeOptions.map((option) => (
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
              
              {/* Example input display based on weight type */}
              {option.value === 'pounds' && (
                <div className="mt-1 ml-7 bg-background/80 rounded px-2 py-1 text-xs border border-dashed text-blue-600">
                  135 lbs
                </div>
              )}
              {option.value === 'kilos' && (
                <div className="mt-1 ml-7 bg-background/80 rounded px-2 py-1 text-xs border border-dashed text-green-600">
                  60 kg
                </div>
              )}
              {option.value === 'distance-m' && (
                <div className="mt-1 ml-7 bg-background/80 rounded px-2 py-1 text-xs border border-dashed text-purple-600">
                  100m
                </div>
              )}
              {option.value === 'distance-ft' && (
                <div className="mt-1 ml-7 bg-background/80 rounded px-2 py-1 text-xs border border-dashed text-purple-600">
                  50ft
                </div>
              )}
              {option.value === 'distance-yd' && (
                <div className="mt-1 ml-7 bg-background/80 rounded px-2 py-1 text-xs border border-dashed text-purple-600">
                  25yd
                </div>
              )}
              {option.value === 'distance-mi' && (
                <div className="mt-1 ml-7 bg-background/80 rounded px-2 py-1 text-xs border border-dashed text-purple-600">
                  0.5mi
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
            {weightTypeOptions.find(option => option.value === value)?.icon}
            <span className="text-xs">{weightTypeOptions.find(option => option.value === value)?.label}</span>
          </div>
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-[250px] p-0" align="start" side="bottom">
        <Command>
          <CommandInput placeholder="Search weight type..." />
          <CommandEmpty>No weight type found.</CommandEmpty>
          <CommandGroup>
            {weightTypeOptions.map((option) => (
              <CommandItem
                key={option.value}
                value={option.value}
                onSelect={() => handleSelect(option.value as WeightType)}
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

export default WeightTypeSelector;
