
import React from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { ArrowLeft, Share2 } from 'lucide-react';
import MetaTags from '@/components/meta/MetaTags';

interface WorkoutDetailSkeletonProps {
  onBack: () => void;
}

const WorkoutDetailSkeleton: React.FC<WorkoutDetailSkeletonProps> = ({ onBack }) => {
  return (
    <div className="container max-w-md mx-auto p-3">
      <MetaTags 
        title="Loading Workout..." 
        description="Loading workout details"
        type="product"
      />
      
      <div className="flex justify-between items-center mb-4">
        <Button variant="ghost" size="icon" onClick={onBack} className="p-1 h-8 w-8">
          <ArrowLeft className="h-5 w-5" />
        </Button>
        <Button variant="ghost" size="icon" disabled className="p-1 h-8 w-8">
          <Share2 className="h-5 w-5" />
        </Button>
      </div>
      
      <Skeleton className="h-8 w-2/3 bg-dark-300 mb-2" />
      <Skeleton className="h-4 w-1/2 bg-dark-300 mb-4" />
      
      <Card className="bg-dark-200 border-dark-300">
        <CardContent className="p-4">
          <div className="space-y-4">
            <div className="grid grid-cols-3 gap-2">
              {[1, 2, 3].map((i) => (
                <Skeleton key={i} className="h-12 bg-dark-300" />
              ))}
            </div>
            
            <div className="space-y-2">
              <Skeleton className="h-5 w-1/3 bg-dark-300" />
              <Skeleton className="h-16 w-full bg-dark-300" />
              <Skeleton className="h-16 w-full bg-dark-300" />
            </div>
            
            <Skeleton className="h-12 w-full bg-dark-300" />
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default WorkoutDetailSkeleton;
