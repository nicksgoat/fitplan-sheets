
import React from 'react';
import { Card, CardContent } from '@/components/ui/card';

interface ProfileStatsProps {
  workoutsCount: number;
  programsCount: number;
  savedCount: number;
}

const ProfileStats = ({ workoutsCount, programsCount, savedCount }: ProfileStatsProps) => {
  return (
    <div className="grid grid-cols-3 gap-2 mb-6 max-w-sm mx-auto">
      <StatCard label="Workouts" value={workoutsCount} />
      <StatCard label="Programs" value={programsCount} />
      <StatCard label="Saved" value={savedCount} />
    </div>
  );
};

interface StatCardProps {
  label: string;
  value: number;
}

const StatCard = ({ label, value }: StatCardProps) => (
  <Card className="text-center overflow-hidden">
    <CardContent className="p-4">
      <p className="text-lg font-bold">{value}</p>
      <p className="text-xs text-muted-foreground">{label}</p>
    </CardContent>
  </Card>
);

export default ProfileStats;
