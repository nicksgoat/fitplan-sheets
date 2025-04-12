
import React from 'react';
import { Button } from '@/components/ui/button';
import { CardTitle, CardDescription } from '@/components/ui/card';
import { ArrowLeft } from 'lucide-react';
import EnhancedShareButton from '@/components/share/EnhancedShareButton';

interface WorkoutDetailHeaderProps {
  title: string;
  description: string;
  shareUrl: string;
  shareTitle: string;
  shareDescription: string;
  onBack: () => void;
}

const WorkoutDetailHeader: React.FC<WorkoutDetailHeaderProps> = ({
  title,
  description,
  shareUrl,
  shareTitle,
  shareDescription,
  onBack
}) => {
  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <Button variant="ghost" size="sm" onClick={onBack}>
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back
        </Button>
        
        <EnhancedShareButton 
          url={shareUrl}
          title={shareTitle}
          description={shareDescription}
        />
      </div>
      
      <div className="flex items-start justify-between">
        <div>
          <CardTitle className="text-2xl font-bold">{title}</CardTitle>
          <CardDescription className="mt-2">
            {description}
          </CardDescription>
        </div>
      </div>
    </div>
  );
};

export default WorkoutDetailHeader;
