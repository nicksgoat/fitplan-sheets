
import React, { useState, useMemo, useEffect } from 'react';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Trophy } from 'lucide-react';

// Types for metrics and records
type MetricType = 'Weight' | 'Reps' | 'Sets' | 'Time' | 'Distance' | 'Calories' | 'Completion' | 'Volume';
type LeaderboardRecord = {
  id: number;
  rank: number;
  user: {
    name: string;
    avatar?: string;
  };
  value: string;
  unit: string;
  change?: number;
};

interface LeaderboardTabProps {
  itemTitle: string;
  itemType: 'exercise' | 'workout' | 'program';
}

const LeaderboardTab: React.FC<LeaderboardTabProps> = ({ itemTitle, itemType }) => {
  // Define relevant metrics based on item type
  const relevantMetrics = useMemo(() => {
    if (itemType === 'exercise') {
      // Different exercises have different relevant metrics
      if (itemTitle.toLowerCase().includes('press') || 
          itemTitle.toLowerCase().includes('lift') || 
          itemTitle.toLowerCase().includes('curl') ||
          itemTitle.toLowerCase().includes('squat')) {
        return ['Weight', 'Reps', 'Sets'] as MetricType[];
      } else if (itemTitle.toLowerCase().includes('run') || 
                itemTitle.toLowerCase().includes('sprint') || 
                itemTitle.toLowerCase().includes('jog')) {
        return ['Distance', 'Time', 'Calories'] as MetricType[];
      } else if (itemTitle.toLowerCase().includes('plank') || 
                itemTitle.toLowerCase().includes('hold')) {
        return ['Time', 'Sets'] as MetricType[];
      } else {
        return ['Reps', 'Sets', 'Weight'] as MetricType[];
      }
    } else if (itemType === 'workout') {
      return ['Time', 'Calories', 'Reps'] as MetricType[];
    } else {
      // Program - added Volume for total weight lifted
      return ['Volume', 'Calories', 'Time', 'Completion'] as MetricType[];
    }
  }, [itemTitle, itemType]);
  
  const [activeMetric, setActiveMetric] = useState<MetricType>('Weight');
  
  // Set the first relevant metric as active when the component mounts or when relevantMetrics changes
  useEffect(() => {
    if (relevantMetrics.length > 0) {
      setActiveMetric(relevantMetrics[0]);
    }
  }, [relevantMetrics]);

  // Sample leaderboard data based on metrics
  const leaderboardData: Record<MetricType, LeaderboardRecord[]> = {
    'Weight': [
      { id: 1, rank: 1, user: { name: 'AlexStrong' }, value: '315', unit: 'lbs', change: 2 },
      { id: 2, rank: 2, user: { name: 'PowerLifter' }, value: '305', unit: 'lbs', change: 0 },
      { id: 3, rank: 3, user: { name: 'GymRat' }, value: '285', unit: 'lbs', change: 1 },
    ],
    'Reps': [
      { id: 1, rank: 1, user: { name: 'RepMaster' }, value: '32', unit: 'reps', change: 1 },
      { id: 2, rank: 2, user: { name: 'EndurancePro' }, value: '28', unit: 'reps', change: -1 },
      { id: 3, rank: 3, user: { name: 'FitnessFan' }, value: '25', unit: 'reps', change: 0 },
    ],
    'Sets': [
      { id: 1, rank: 1, user: { name: 'VolumeKing' }, value: '8', unit: 'sets', change: 0 },
      { id: 2, rank: 2, user: { name: 'WorkoutBeast' }, value: '7', unit: 'sets', change: 2 },
      { id: 3, rank: 3, user: { name: 'SetMaster' }, value: '6', unit: 'sets', change: -1 },
    ],
    'Time': [
      { id: 1, rank: 1, user: { name: 'SpeedDemon' }, value: '1:45', unit: 'min', change: 0 },
      { id: 2, rank: 2, user: { name: 'QuickRunner' }, value: '1:52', unit: 'min', change: 1 },
      { id: 3, rank: 3, user: { name: 'FastPacer' }, value: '2:05', unit: 'min', change: -1 },
    ],
    'Distance': [
      { id: 1, rank: 1, user: { name: 'MarathonMan' }, value: '26.2', unit: 'miles', change: 0 },
      { id: 2, rank: 2, user: { name: 'LongRunner' }, value: '23.5', unit: 'miles', change: 0 },
      { id: 3, rank: 3, user: { name: 'DistanceKing' }, value: '21.8', unit: 'miles', change: 2 },
    ],
    'Calories': [
      { id: 1, rank: 1, user: { name: 'BurnMaster' }, value: '950', unit: 'kcal', change: 1 },
      { id: 2, rank: 2, user: { name: 'CalorieKiller' }, value: '875', unit: 'kcal', change: -1 },
      { id: 3, rank: 3, user: { name: 'FatBurner' }, value: '820', unit: 'kcal', change: 0 },
    ],
    'Completion': [
      { id: 1, rank: 1, user: { name: 'DedicatedUser' }, value: '100', unit: '%', change: 0 },
      { id: 2, rank: 2, user: { name: 'ConsistentOne' }, value: '95', unit: '%', change: 1 },
      { id: 3, rank: 3, user: { name: 'RegularAthlete' }, value: '90', unit: '%', change: -1 },
    ],
    'Volume': [
      { id: 1, rank: 1, user: { name: 'WeightCrusher' }, value: '28,500', unit: 'lbs', change: 1 },
      { id: 2, rank: 2, user: { name: 'HeavyLifter' }, value: '24,720', unit: 'lbs', change: 0 },
      { id: 3, rank: 3, user: { name: 'IronWarrior' }, value: '22,150', unit: 'lbs', change: 2 },
    ],
  };

  return (
    <div className="space-y-4">
      <div className="space-y-2">
        <h2 className="text-lg font-semibold">{itemTitle} Leaderboard</h2>
        <p className="text-sm text-fitbloom-text-medium">See who's leading in this {itemType}</p>
      </div>

      <div className="flex flex-wrap gap-2">
        {relevantMetrics.map((metric) => (
          <Badge
            key={metric}
            variant={activeMetric === metric ? "default" : "outline"}
            className={`cursor-pointer ${activeMetric === metric ? 'bg-fitbloom-purple' : ''}`}
            onClick={() => setActiveMetric(metric)}
          >
            {metric}
          </Badge>
        ))}
      </div>

      <div className="bg-gray-900 rounded-lg">
        <Table>
          <TableHeader>
            <TableRow className="border-gray-800">
              <TableHead className="w-16 text-center">Rank</TableHead>
              <TableHead>User</TableHead>
              <TableHead className="text-right">Record</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {leaderboardData[activeMetric]?.map((record) => (
              <TableRow key={record.id} className="border-gray-800">
                <TableCell className="text-center">
                  {record.rank === 1 ? (
                    <div className="flex justify-center">
                      <Trophy className="h-5 w-5 text-yellow-500" />
                    </div>
                  ) : (
                    record.rank
                  )}
                </TableCell>
                <TableCell>
                  <div className="flex items-center gap-2">
                    <div className="w-6 h-6 rounded-full bg-gray-700"></div>
                    <span>{record.user.name}</span>
                  </div>
                </TableCell>
                <TableCell className="text-right">
                  <div className="flex items-center justify-end gap-2">
                    <span className="font-medium">{record.value} {record.unit}</span>
                    {record.change !== undefined && record.change !== 0 && (
                      <span className={`text-xs ${record.change > 0 ? 'text-green-500' : 'text-red-500'}`}>
                        {record.change > 0 ? `↑${record.change}` : `↓${Math.abs(record.change)}`}
                      </span>
                    )}
                  </div>
                </TableCell>
              </TableRow>
            ))}
            {!leaderboardData[activeMetric] && (
              <TableRow>
                <TableCell colSpan={3} className="text-center py-8 text-fitbloom-text-medium">
                  No data available for this metric
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
};

export default LeaderboardTab;
