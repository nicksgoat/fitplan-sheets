
import React, { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { toast } from 'sonner';
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from '@/components/ui/table';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { AlertCircle, Plus, Trash2 } from 'lucide-react';
import { ClubSharingStatus } from '@/types/clubSharing';
import { useAuth } from '@/hooks/useAuth';
import { ClubSelection } from '@/components/ClubShareSelection';

interface ClubSharingManagementProps {
  contentId: string;
  contentType: 'workout' | 'program';
  contentName: string;
  onClose?: () => void;
}

export const ClubSharingManagement: React.FC<ClubSharingManagementProps> = ({
  contentId,
  contentType,
  contentName,
  onClose
}) => {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const [selectedClubId, setSelectedClubId] = useState<string | null>(null);

  // Fix the TypeScript error by explicitly typing the query key tuple
  const queryKey = [`${contentType}-clubs-sharing`, contentId] as const;

  // Get clubs that this content is shared with
  const { data: sharedClubs, isLoading } = useQuery({
    queryKey,
    queryFn: async () => {
      const tableName = contentType === 'workout' ? 'club_shared_workouts' : 'club_shared_programs';
      const columnName = contentType === 'workout' ? 'workout_id' : 'program_id';
      
      const { data, error } = await supabase
        .from(tableName)
        .select(`
          id,
          club_id,
          created_at,
          clubs (
            id,
            name,
            description,
            logo_url
          )
        `)
        .eq(columnName, contentId)
        .eq('shared_by', user?.id || '');
      
      if (error) throw error;
      
      return data || [];
    },
    enabled: !!user && !!contentId
  });
  
  // Share with club mutation
  const shareWithClub = useMutation({
    mutationFn: async (clubId: string) => {
      const tableName = contentType === 'workout' ? 'club_shared_workouts' : 'club_shared_programs';
      const columnName = contentType === 'workout' ? 'workout_id' : 'program_id';
      
      const { error } = await supabase
        .from(tableName)
        .insert({
          club_id: clubId,
          [columnName]: contentId,
          shared_by: user?.id
        });
      
      if (error) {
        if (error.code === '23505') { // Unique violation
          throw new Error('This content is already shared with this club');
        }
        throw error;
      }
      
      return { success: true };
    },
    onSuccess: () => {
      toast.success(`${contentType === 'workout' ? 'Workout' : 'Program'} shared with club successfully`);
      queryClient.invalidateQueries({ queryKey });
      setSelectedClubId(null);
    },
    onError: (error: any) => {
      toast.error(`Failed to share: ${error.message}`);
    }
  });
  
  // Remove share mutation
  const removeShare = useMutation({
    mutationFn: async (shareId: string) => {
      const tableName = contentType === 'workout' ? 'club_shared_workouts' : 'club_shared_programs';
      
      const { error } = await supabase
        .from(tableName)
        .delete()
        .eq('id', shareId);
      
      if (error) throw error;
      
      return { success: true };
    },
    onSuccess: () => {
      toast.success(`Removed ${contentType} from club`);
      queryClient.invalidateQueries({ queryKey });
    },
    onError: (error: any) => {
      toast.error(`Failed to remove share: ${error.message}`);
    }
  });
  
  const handleShareWithClub = () => {
    if (selectedClubId) {
      shareWithClub.mutate(selectedClubId);
    }
  };
  
  const handleRemoveShare = (shareId: string) => {
    if (confirm('Are you sure you want to remove this share?')) {
      removeShare.mutate(shareId);
    }
  };
  
  return (
    <div className="space-y-4">
      <div>
        <h2 className="text-xl font-bold mb-2">Share {contentType === 'workout' ? 'Workout' : 'Program'}</h2>
        <p className="text-gray-400 text-sm mb-4">
          Share "{contentName}" with your clubs
        </p>
      </div>
      
      <div className="space-y-4">
        <div className="flex gap-2">
          <ClubSelection onClubSelect={setSelectedClubId} selectedClubId={selectedClubId} />
          <Button 
            onClick={handleShareWithClub} 
            disabled={!selectedClubId || shareWithClub.isPending}
            size="sm"
          >
            <Plus className="h-4 w-4 mr-1" />
            Share
          </Button>
        </div>
        
        {shareWithClub.isError && (
          <Alert variant="destructive" className="mt-2">
            <AlertCircle className="h-4 w-4" />
            <AlertTitle>Error</AlertTitle>
            <AlertDescription>
              {shareWithClub.error.message}
            </AlertDescription>
          </Alert>
        )}
      </div>
      
      <div>
        <h3 className="text-sm font-medium mb-2">Shared with clubs</h3>
        {isLoading ? (
          <div className="text-center py-4">Loading...</div>
        ) : sharedClubs && sharedClubs.length > 0 ? (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Club Name</TableHead>
                <TableHead>Shared On</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {sharedClubs.map((share: any) => (
                <TableRow key={share.id}>
                  <TableCell>{share.clubs?.name || 'Unknown club'}</TableCell>
                  <TableCell>{new Date(share.created_at).toLocaleDateString()}</TableCell>
                  <TableCell className="text-right">
                    <Button 
                      variant="ghost" 
                      size="sm"
                      onClick={() => handleRemoveShare(share.id)}
                      disabled={removeShare.isPending}
                    >
                      <Trash2 className="h-4 w-4 text-red-500" />
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        ) : (
          <div className="text-center py-4 border border-dashed border-gray-700 rounded-md">
            <p className="text-gray-400">Not shared with any clubs yet</p>
          </div>
        )}
      </div>
      
      {onClose && (
        <div className="flex justify-end mt-4">
          <Button 
            variant="outline" 
            onClick={onClose}
          >
            Close
          </Button>
        </div>
      )}
    </div>
  );
};
