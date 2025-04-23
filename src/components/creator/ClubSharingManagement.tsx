
import React, { useState, useEffect } from 'react';
import { useClubSelection } from '@/hooks/useClubSelection';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ClubList } from '@/components/club/ClubList';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { useAuth } from '@/hooks/useAuth';

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
  initialSharedClubs = [],
  contentName,
  onSave,
  onClose
}: ClubSharingManagementProps) {
  const {
    clubs,
    selectedClubIds,
    setSelectedClubIds,
    isLoading,
    toggleClub
  } = useClubSelection(initialSharedClubs, contentId, contentType);

  const [isSubmitting, setIsSubmitting] = useState(false);
  const { user } = useAuth();

  // Load existing shares
  useEffect(() => {
    const loadShares = async () => {
      if (!contentId) return;
      
      try {
        const { data: sharedWith, error } = await supabase
          .from(contentType === 'workout' ? 'club_shared_workouts' : 'club_shared_programs')
          .select('club_id')
          .eq(contentType === 'workout' ? 'workout_id' : 'program_id', contentId);
          
        if (error) throw error;
        
        if (sharedWith && sharedWith.length > 0) {
          const clubIds = sharedWith.map(share => share.club_id);
          setSelectedClubIds(clubIds);
        }
      } catch (error) {
        console.error(`Error loading shared ${contentType}s:`, error);
      }
    };
    
    loadShares();
  }, [contentId, contentType, setSelectedClubIds]);

  const handleSaveSharing = async () => {
    if (!contentId || !user?.id) return;
    
    setIsSubmitting(true);
    
    try {
      const table = contentType === 'workout' ? 'club_shared_workouts' : 'club_shared_programs';
      const idField = contentType === 'workout' ? 'workout_id' : 'program_id';
      
      // Delete existing shares
      const { error: deleteError } = await supabase
        .from(table)
        .delete()
        .eq(idField, contentId);
        
      if (deleteError) throw deleteError;
      
      // Add new shares
      if (selectedClubIds.length > 0) {
        if (contentType === 'workout') {
          // Create array of workout shares
          const workoutShares = selectedClubIds.map(clubId => ({
            club_id: clubId,
            workout_id: contentId,
            shared_by: user.id
          }));
          
          // Insert all workout shares at once
          const { error: insertError } = await supabase
            .from('club_shared_workouts')
            .insert(workoutShares);
            
          if (insertError) throw insertError;
        } else {
          // Create array of program shares
          const programShares = selectedClubIds.map(clubId => ({
            club_id: clubId,
            program_id: contentId,
            shared_by: user.id
          }));
          
          // Insert all program shares at once
          const { error: insertError } = await supabase
            .from('club_shared_programs')
            .insert(programShares);
            
          if (insertError) throw insertError;
        }
      }
      
      toast.success(`${contentType === 'workout' ? 'Workout' : 'Program'} sharing updated successfully`);
      
      if (onSave) {
        onSave(selectedClubIds);
      }
      
      if (onClose) {
        onClose();
      }
    } catch (error) {
      console.error(`Error updating ${contentType} sharing:`, error);
      toast.error(`Failed to update sharing. Please try again.`);
    } finally {
      setIsSubmitting(false);
    }
  };

  const title = contentName 
    ? `Share ${contentName} with Your Clubs`
    : `Share with Your Clubs`;

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle>{title}</CardTitle>
        <CardDescription>
          Select clubs where you want to share this {contentType}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <ClubList 
          clubs={clubs || []} 
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
