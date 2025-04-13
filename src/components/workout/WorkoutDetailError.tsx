
import React from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { useNavigate } from 'react-router-dom';
import MetaTags from '@/components/meta/MetaTags';
import { Search, Home } from 'lucide-react';

interface WorkoutDetailErrorProps {
  error: string;
}

const WorkoutDetailError: React.FC<WorkoutDetailErrorProps> = ({ error }) => {
  const navigate = useNavigate();
  
  // Format error message to ensure usernames are shown with @ prefix
  const formatErrorMessage = (message: string) => {
    // Replace email patterns with @username format
    let formattedMessage = message.replace(/'([^']+@[^']+\.[^']+)'/g, '"@$1"');
    
    // Make sure all username references have @ prefix
    formattedMessage = formattedMessage.replace(/"@([^"]+)"/g, '"@$1"');
    
    // If the username is missing the @ symbol, add it
    return formattedMessage.replace(/"([^"@][^"]+)"/g, (match, p1) => {
      if (p1.includes('@')) return match; // Don't modify if it already has @ inside
      return `"@${p1}"`; // Otherwise add @ prefix
    });
  };
  
  return (
    <div className="container max-w-4xl mx-auto p-4">
      <MetaTags 
        title="Workout Not Found" 
        description="The workout you're looking for doesn't exist or has been removed."
        type="website"
      />
      <Card className="bg-dark-200 border-dark-300 text-center py-8">
        <CardContent className="flex flex-col items-center justify-center">
          <h2 className="text-2xl font-semibold mb-2">Workout Not Found</h2>
          <p className="text-gray-400 mb-6 max-w-md">
            {formatErrorMessage(error) || "The workout you're looking for doesn't exist or has been removed."}
          </p>
          
          <div className="flex flex-col sm:flex-row gap-3">
            <Button 
              className="bg-fitbloom-purple hover:bg-fitbloom-purple/90"
              onClick={() => navigate('/explore')}
            >
              <Search className="h-4 w-4 mr-2" />
              Browse Workouts
            </Button>
            
            <Button 
              variant="outline"
              onClick={() => navigate('/')}
            >
              <Home className="h-4 w-4 mr-2" />
              Go to Home
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default WorkoutDetailError;
