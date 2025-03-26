
import React, { useState } from "react";
import { CheckIcon, ChevronsUpDown, TargetIcon, ClockIcon, FlipHorizontalIcon, TimerIcon, ArrowDownIcon } from "lucide-react";
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
  const [open, setOpen] = useState(false);
  
  const handleSelect = (selectedValue: RepType) => {
    onChange(selectedValue);
    setOpen(false);
    onClose?.();
  };
  
  const selectedOption = repTypeOptions.find(option => option.value === value);
  
  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          role="combobox"
          aria-expanded={open}
          className="w-full justify-between border-dashed border-muted h-8"
        >
          <div className="flex items-center gap-2">
            {selectedOption?.icon}
            <span className="text-xs">{selectedOption?.label || "Select rep type"}</span>
          </div>
          <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
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
