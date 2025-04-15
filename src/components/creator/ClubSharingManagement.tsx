
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ClubShareSelection } from '@/components/ClubShareSelection';
import { Button } from '@/components/ui/button';
import { useShareWithClubs } from '@/hooks/useClubSharing';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { Loader2 } from 'lucide-react';

interface ClubSharingManagementProps {
  contentId: string;
  contentType: 'workout' | 'program';
  contentName: string;
  onClose: () => void;
}

// Define a simplified interface for content shares
interface ContentShare {
  club_id: string;
  club?: {
    name?: string;
  };
}

export function ClubSharingManagement({
  contentId,
  contentType,
  contentName,
  onClose
}: ClubSharingManagementProps) {
  const [selectedClubs, setSelectedClubs] = useState<string[]>([]);
  const shareWithClubsMutation = useShareWithClubs();
  
  // Fetch existing shares
  const { data: existingShares, isLoading } = useQuery({
    queryKey: ['content-shares', contentId, contentType],
    queryFn: async () => {
      const tableName = contentType === 'workout' ? 'club_shared_workouts' : 'club_shared_programs';
      const idField = contentType === 'workout' ? 'workout_id' : 'program_id';
      
      const { data, error } = await supabase
        .from(tableName)
        .select('club_id, club:clubs(name)')
        .eq(idField, contentId);
      
      if (error) {
        console.error(`Error fetching ${contentType} shares:`, error);
        return [] as ContentShare[];
      }
      
      return (data || []) as ContentShare[];
    }
  });
  
  // Initialize selected clubs from existing shares when data loads
  useEffect(() => {
    if (existingShares && existingShares.length > 0) {
      setSelectedClubs(existingShares.map(share => share.club_id));
    }
  }, [existingShares]);
  
  const handleSaveSharing = async () => {
    try {
      await shareWithClubsMutation.mutateAsync({
        contentId,
        contentType,
        clubIds: selectedClubs
      });
      
      toast.success(`${contentType === 'workout' ? 'Workout' : 'Program'} sharing updated`);
      onClose();
    } catch (error) {
      console.error('Error updating sharing:', error);
    }
  };
  
  return (
    <Card className="w-full bg-dark-100 border border-dark-300">
      <CardHeader>
        <CardTitle className="text-lg font-medium">
          Share "{contentName}" with Clubs
        </CardTitle>
      </CardHeader>
      
      <CardContent className="space-y-4">
        {isLoading ? (
          <div className="flex justify-center items-center py-8">
            <Loader2 className="h-6 w-6 animate-spin text-gray-400" />
          </div>
        ) : (
          <>
            <ClubShareSelection
              contentId={contentId}
              contentType={contentType}
              selectedClubIds={selectedClubs}
              onSelectionChange={setSelectedClubs}
            />
            
            <div className="flex justify-end gap-2 pt-4">
              <Button
                variant="outline"
                onClick={onClose}
              >
                Cancel
              </Button>
              <Button
                onClick={handleSaveSharing}
                disabled={shareWithClubsMutation.isPending}
                className="bg-fitbloom-purple hover:bg-fitbloom-purple/90"
              >
                {shareWithClubsMutation.isPending ? "Saving..." : "Save Sharing Settings"}
              </Button>
            </div>
          </>
        )}
      </CardContent>
    </Card>
  );
}
