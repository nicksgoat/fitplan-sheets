
import React from "react";
import { Check } from "lucide-react";
import { WeightType } from "@/types/workout";
import { cn } from "@/lib/utils";

interface WeightTypeSelectorProps {
  value: WeightType;
  onChange: (type: WeightType) => void;
  onClose?: () => void;
  variant?: "default" | "minimal";
}

const weightTypes: { type: WeightType; label: string; description: string }[] = [
  {
    type: "pounds",
    label: "Pounds (lbs)",
    description: "Weight in pounds (e.g., 135 lbs)",
  },
  {
    type: "kilos",
    label: "Kilograms (kg)",
    description: "Weight in kilograms (e.g., 60 kg)",
  },
  {
    type: "distance",
    label: "Distance (m)",
    description: "Distance measurement (e.g., 100m)",
  },
];

const WeightTypeSelector: React.FC<WeightTypeSelectorProps> = ({
  value,
  onChange,
  onClose,
  variant = "default",
}) => {
  return (
    <div className="weight-type-selector w-full p-1">
      {variant === "default" && (
        <div className="px-3 py-2 text-sm font-medium border-b">
          Weight Type
        </div>
      )}
      
      <div className="py-1">
        {weightTypes.map((weightType) => (
          <button
            key={weightType.type}
            className={cn(
              "flex items-center w-full text-left px-3 py-2 text-sm hover:bg-muted/80 rounded-sm",
              value === weightType.type && "bg-muted"
            )}
            onClick={() => {
              onChange(weightType.type);
              if (onClose) onClose();
            }}
          >
            <div className="flex-1">
              <div className="font-medium">{weightType.label}</div>
              {variant === "default" && (
                <div className="text-xs text-muted-foreground">
                  {weightType.description}
                </div>
              )}
            </div>
            {value === weightType.type && (
              <Check className="h-4 w-4 text-primary" />
            )}
          </button>
        ))}
      </div>
    </div>
  );
};

export default WeightTypeSelector;
