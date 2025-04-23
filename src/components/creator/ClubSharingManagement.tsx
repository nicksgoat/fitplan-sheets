
import React, { useState } from 'react';
import { useClubSelection } from '@/hooks/useClubSelection';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ClubList } from '@/components/club/ClubList';
import { useShareWithClubs } from '@/hooks/useClubSharing';
import { toast } from 'sonner';
import { Club } from '@/types/club';

interface ClubSharingManagementProps {
  contentId: string;
  contentType: 'workout' | 'program';
  initialSharedClubs?: string[];
  contentName?: string;
  onSave?: (selectedClubIds: string[]) => void;
  onClose?: () => void;
}

export function ClubSharingManagement({
  contentId,
  contentType,
  contentName,
  initialSharedClubs = [],
  onSave,
  onClose
}: ClubSharingManagementProps) {
  const {
    clubs,
    selectedClubIds,
    setSelectedClubIds,
    isLoading,
    toggleClub
  } = useClubSelection(initialSharedClubs);

  const [isSubmitting, setIsSubmitting] = useState(false);
  const shareWithClubs = useShareWithClubs();

  const handleSaveSharing = async () => {
    setIsSubmitting(true);
    try {
      await shareWithClubs.mutate({ 
        contentId,
        contentType, 
        clubIds: selectedClubIds 
      });
      
      toast.success(`${contentType === 'workout' ? 'Workout' : 'Program'} sharing updated successfully`);
      
      if (onSave) {
        onSave(selectedClubIds);
      }
      
      if (onClose) {
        onClose();
      }
    } catch (error) {
      console.error('Error updating sharing:', error);
      toast.error('Failed to update sharing. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle>Share with Your Clubs</CardTitle>
        <CardDescription>
          Select clubs where you want to share this {contentName || contentType}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <ClubList 
          clubs={clubs as Club[] || []} 
          selectedIds={selectedClubIds}
          onToggle={toggleClub}
          isLoading={isLoading}
        />
        
        <div className="flex justify-end mt-4">
          <Button 
            onClick={handleSaveSharing} 
            disabled={isSubmitting}
            className="bg-fitbloom-purple hover:bg-fitbloom-purple/90"
          >
            {isSubmitting ? 'Saving...' : 'Save Changes'}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
