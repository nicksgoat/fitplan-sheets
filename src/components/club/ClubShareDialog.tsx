
import React from 'react';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/components/ui/use-toast"
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { Checkbox } from "@/components/ui/checkbox"
import { ScrollArea } from "@/components/ui/scroll-area"

// Define the ContentType explicitly here instead of importing
type ContentType = 'workout' | 'program';

interface ClubShareRecord {
  club_id: string;
  content_id: string;
  content_type: ContentType;
  created_at: string;
}

interface ClubShareDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  contentId: string;
  contentType: ContentType;
}

interface Club {
  id: string;
  name: string;
  description: string;
  created_at: string;
  creator_id: string;
}

export function ClubShareDialog({ open, onOpenChange, contentId, contentType }: ClubShareDialogProps) {
  const { toast } = useToast()
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const [selectedClubIds, setSelectedClubIds] = React.useState<string[]>([]);

  const { data: clubs, isLoading, isError } = useQuery<Club[]>({
    queryKey: ['creator-clubs', user?.id],
    queryFn: async () => {
      if (!user?.id) return [];

      const { data, error } = await supabase
        .from('clubs')
        .select('*')
        .eq('creator_id', user.id);

      if (error) {
        console.error("Error fetching clubs:", error);
        throw error;
      }
      return data || [];
    },
    enabled: !!user?.id
  });

  const shareMutation = useMutation({
    mutationFn: async (sharingRecords: ClubShareRecord[]) => {
      // Use a generic RPC call to avoid the type issue with the function name
      const { data, error } = await supabase
        .from('club_content')
        .insert(sharingRecords);

      if (error) {
        console.error("Error sharing content:", error);
        throw error;
      }
      return data;
    },
    onSuccess: () => {
      toast({
        title: "Content Shared!",
        description: "This content has been successfully shared with the selected clubs.",
      })
      queryClient.invalidateQueries({ queryKey: ['creator-clubs', user?.id] });
      onOpenChange(false);
    },
    onError: (error: any) => {
      toast({
        title: "Sharing Failed",
        description: error.message || "Failed to share content with clubs.",
        variant: "destructive",
      })
    },
  });

  const handleCheckboxChange = (clubId: string) => {
    setSelectedClubIds(prev => {
      if (prev.includes(clubId)) {
        return prev.filter(id => id !== clubId);
      } else {
        return [...prev, clubId];
      }
    });
  };

  const createSharingRecords = (selectedClubIds: string[], contentId: string, contentType: ContentType) => {
    return selectedClubIds.map(clubId => ({
      club_id: clubId,
      content_id: contentId,
      content_type: contentType,
      created_at: new Date().toISOString()
    }));
  };

  const handleShare = async () => {
    if (!selectedClubIds.length) {
      toast({
        title: "No Clubs Selected",
        description: "Please select at least one club to share with.",
        variant: "destructive",
      });
      return;
    }

    const sharingRecords = createSharingRecords(selectedClubIds, contentId, contentType);
    shareMutation.mutate(sharingRecords);
  };

  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Share to Clubs</AlertDialogTitle>
          <AlertDialogDescription>
            Select the clubs you want to share this content with.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <div className="grid gap-4 py-4">
          {isLoading ? (
            <div>Loading clubs...</div>
          ) : isError ? (
            <div>Error loading clubs.</div>
          ) : clubs && clubs.length > 0 ? (
            <ScrollArea className="h-[200px] w-full rounded-md border">
              <div className="p-4">
                {clubs.map((club) => (
                  <div key={club.id} className="flex items-center space-x-2">
                    <Checkbox
                      id={`club-${club.id}`}
                      checked={selectedClubIds.includes(club.id)}
                      onCheckedChange={() => handleCheckboxChange(club.id)}
                    />
                    <Label htmlFor={`club-${club.id}`}>{club.name}</Label>
                  </div>
                ))}
              </div>
            </ScrollArea>
          ) : (
            <div>No clubs found. Create a club to start sharing content.</div>
          )}
        </div>
        <AlertDialogFooter>
          <AlertDialogCancel>Cancel</AlertDialogCancel>
          <AlertDialogAction onClick={handleShare} disabled={shareMutation.isPending}>
            {shareMutation.isPending ? "Sharing..." : "Share"}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  )
}
