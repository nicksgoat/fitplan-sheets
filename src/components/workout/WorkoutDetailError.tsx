
import React from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { useNavigate } from 'react-router-dom';
import MetaTags from '@/components/meta/MetaTags';

interface WorkoutDetailErrorProps {
  error: string;
}

const WorkoutDetailError: React.FC<WorkoutDetailErrorProps> = ({ error }) => {
  const navigate = useNavigate();
  
  return (
    <div className="container max-w-4xl mx-auto p-4">
      <MetaTags 
        title="Workout Not Found" 
        description="The workout you're looking for doesn't exist or has been removed."
        type="website"
      />
      <Card className="bg-dark-200 border-dark-300 text-center py-8">
        <CardContent>
          <h2 className="text-2xl font-semibold">Workout Not Found</h2>
          <p className="text-gray-400 mt-2">
            {error || "The workout you're looking for doesn't exist or has been removed."}
          </p>
          <Button 
            className="mt-6 bg-fitbloom-purple hover:bg-fitbloom-purple/90"
            onClick={() => navigate('/explore')}
          >
            Browse Workouts
          </Button>
        </CardContent>
      </Card>
    </div>
  );
};

export default WorkoutDetailError;
