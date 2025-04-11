
import React from 'react';
import { Activity } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';

interface MetricInfoCardProps {
  sortMetric: string;
  nflAverage: { avg_score: string } | null;
}

const MetricInfoCard: React.FC<MetricInfoCardProps> = ({ sortMetric, nflAverage }) => {
  // Helper function to get the display name for a metric
  const getMetricDisplayName = (metric: string): string => {
    const metricNames = {
      '40yd': '40-Yard Dash',
      'Vertical': 'Vertical Jump',
      'Bench': 'Bench Press',
      'Broad Jump': 'Broad Jump',
      '3Cone': '3-Cone Drill',
      'Shuttle': 'Shuttle'
    };
    return metricNames[metric as keyof typeof metricNames] || metric;
  };

  // Helper function to determine if lower values are better for a metric
  const isLowerValueBetter = (metric: string): boolean => {
    return ['40yd', '3Cone', 'Shuttle'].includes(metric);
  };

  // Get the description for the current metric
  const getMetricDescription = (metric: string): string => {
    switch (metric) {
      case '40yd': 
        return 'The 40-yard dash measures a player\'s straight-line speed. Lower times indicate faster players.';
      case 'Vertical': 
        return 'The vertical jump measures a player\'s lower-body explosiveness and leaping ability.';
      case 'Bench': 
        return 'The bench press (225 lbs) tests upper body strength and endurance.';
      case 'Broad Jump': 
        return 'The broad jump measures a player\'s lower-body explosiveness and horizontal power.';
      case '3Cone': 
        return 'The 3-cone drill tests a player\'s ability to change directions at high speeds.';
      case 'Shuttle': 
        return 'The shuttle run measures short-area quickness, acceleration and lateral movement.';
      default: 
        return '';
    }
  };

  return (
    <Card className="p-4 bg-gray-900/50 border border-gray-700">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Activity className="h-5 w-5 text-fitbloom-purple" />
          <h2 className="text-lg font-semibold">
            {getMetricDisplayName(sortMetric)}
          </h2>
        </div>
        
        {nflAverage && (
          <Badge variant="outline" className="font-mono">
            NFL Avg: {nflAverage.avg_score}
            {isLowerValueBetter(sortMetric) ? ' (lower is better)' : ' (higher is better)'}
          </Badge>
        )}
      </div>
      
      <Separator className="my-3" />
      
      <p className="text-sm text-gray-300">
        {getMetricDescription(sortMetric)}
      </p>
    </Card>
  );
};

export default MetricInfoCard;
