
import React from "react";
import { CheckIcon, TargetIcon, ArrowDownIcon, ClockIcon, FlipHorizontalIcon, TimerIcon } from "lucide-react";
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
}

const repTypeOptions: { value: RepType; label: string; description: string; icon: React.ReactNode }[] = [
  {
    value: 'fixed',
    label: 'Fixed reps',
    description: 'Apply the same value across all sets.',
    icon: <TargetIcon className="h-4 w-4 text-muted-foreground" />
  },
  {
    value: 'range',
    label: 'Rep range',
    description: 'Enter a range of values for flexibility.',
    icon: <ArrowDownIcon className="h-4 w-4 text-muted-foreground" />
  },
  {
    value: 'descending',
    label: 'Comma-separated reps',
    description: 'Apply different reps or time per set using commas.',
    icon: <ArrowDownIcon className="h-4 w-4 text-muted-foreground" />
  },
  {
    value: 'time',
    label: 'Time-based reps',
    description: 'Specify a duration with "s" or "m".',
    icon: <ClockIcon className="h-4 w-4 text-muted-foreground" />
  },
  {
    value: 'each-side',
    label: 'Each-side',
    description: 'Specify "each-side" with reps or time.',
    icon: <FlipHorizontalIcon className="h-4 w-4 text-muted-foreground" />
  },
  {
    value: 'amrap',
    label: 'AMRAP',
    description: 'Specify "As many reps as possible".',
    icon: <TimerIcon className="h-4 w-4 text-muted-foreground" />
  },
];

const RepTypeSelector: React.FC<RepTypeSelectorProps> = ({ 
  value, 
  onChange,
  onClose
}) => {
  const handleSelect = (selectedValue: RepType) => {
    onChange(selectedValue);
    if (onClose) {
      onClose();
    }
  };
  
  // Direct list mode (used in RepInput dropdown)
  if (onClose) {
    return (
      <div className="w-full p-2">
        <CommandGroup className="mb-1">
          <div className="px-2 mb-1 text-sm font-medium">Select Rep Type</div>
          {repTypeOptions.map((option) => (
            <CommandItem
              key={option.value}
              onSelect={() => handleSelect(option.value)}
              className="flex items-center gap-2 cursor-pointer py-2"
            >
              {option.icon}
              <div className="ml-2 flex-1">
                <p className="text-sm font-medium">{option.label}</p>
                <p className="text-xs text-muted-foreground">{option.description}</p>
              </div>
              {value === option.value && (
                <CheckIcon className="ml-auto h-4 w-4" />
              )}
            </CommandItem>
          ))}
        </CommandGroup>
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
      <PopoverContent className="w-[250px] p-0">
        <Command>
          <CommandInput placeholder="Search rep type..." />
          <CommandEmpty>No rep type found.</CommandEmpty>
          <CommandGroup>
            {repTypeOptions.map((option) => (
              <CommandItem
                key={option.value}
                value={option.value}
                onSelect={() => handleSelect(option.value)}
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
