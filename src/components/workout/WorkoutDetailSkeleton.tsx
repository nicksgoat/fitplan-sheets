
import React from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { ArrowLeft } from 'lucide-react';
import MetaTags from '@/components/meta/MetaTags';

interface WorkoutDetailSkeletonProps {
  onBack: () => void;
}

const WorkoutDetailSkeleton: React.FC<WorkoutDetailSkeletonProps> = ({ onBack }) => {
  return (
    <div className="container max-w-4xl mx-auto p-4">
      <MetaTags 
        title="Loading Workout..." 
        description="Loading workout details"
        type="product"
      />
      <div className="flex items-center mb-6">
        <Button variant="ghost" size="sm" onClick={onBack}>
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back
        </Button>
      </div>
      <Card className="bg-dark-200 border-dark-300">
        <CardHeader>
          <Skeleton className="h-8 w-2/3 bg-dark-300" />
          <Skeleton className="h-4 w-1/2 mt-2 bg-dark-300" />
        </CardHeader>
        <CardContent>
          <div className="space-y-6">
            <div className="grid grid-cols-2 gap-4">
              {[1, 2, 3, 4].map((i) => (
                <Skeleton key={i} className="h-12 bg-dark-300" />
              ))}
            </div>
            
            <div className="space-y-3">
              <Skeleton className="h-6 w-1/3 bg-dark-300" />
              <Skeleton className="h-24 w-full bg-dark-300" />
            </div>
            
            <div className="space-y-3">
              <Skeleton className="h-6 w-1/3 bg-dark-300" />
              <div className="space-y-2">
                {[1, 2, 3, 4].map((i) => (
                  <Skeleton key={i} className="h-5 w-full bg-dark-300" />
                ))}
              </div>
            </div>
            
            <Skeleton className="h-36 w-full bg-dark-300" />
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default WorkoutDetailSkeleton;
