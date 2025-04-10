
// Just importing the types - this is a shadcn/ui component that we can't modify
// But we're exporting the types for our own use

import { ReactNode } from 'react';

export interface Goal {
  id: string;
  title: string;
  isCompleted: boolean;
}

export interface Metric {
  label: string;
  value: string;
  trend: number;
  unit: string;
}

export interface ActivityCardProps {
  title: string;
  category: string;
  metrics: ReactNode | Metric[];
  dailyGoals: ReactNode | Goal[];
  onToggleGoal: (id: string) => void;
  onAddGoal?: () => void;
  onViewDetails?: () => void;
}

// No actual implementation needed as we're just exporting the types from this file
// We're not modifying the component itself
