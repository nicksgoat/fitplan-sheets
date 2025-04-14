
import React from 'react';
import { Button } from '@/components/ui/button';
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
    <div className="mb-4">
      <div className="flex justify-between items-center mb-4">
        <Button variant="ghost" size="icon" onClick={onBack} className="p-1 h-8 w-8">
          <ArrowLeft className="h-5 w-5" />
        </Button>
        <EnhancedShareButton 
          url={shareUrl}
          title={shareTitle}
          description={shareDescription}
          size="icon"
        />
      </div>
      
      <h1 className="text-2xl font-bold mb-1">{title}</h1>
      <p className="text-gray-400 text-sm mb-4">{description}</p>
    </div>
  );
};

export default WorkoutDetailHeader;
