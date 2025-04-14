import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Check, Plus } from 'lucide-react';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';

interface Club {
  id: string;
  name: string;
  description?: string;
  logo_url?: string;
}

// Define specific type for club member record
interface ClubMemberRecord {
  club_id: string;
  user_id: string;
  role: string;
  status: string;
  clubs?: Club; // Fix: Use Club directly instead of recursive reference
}

// Define specific type for workout shares
interface WorkoutShareRecord {
  club_id: string;
  shared_by: string;
  workout_id: string;
}

// Define specific type for program shares
interface ProgramShareRecord {
  club_id: string;
  shared_by: string;
  program_id: string;
}

// Use a consistent interface for the component props
export interface ClubShareSelectionProps {
  contentId?: string;
  contentType: 'workout' | 'program';
  // Legacy props - support backwards compatibility
  sharedClubs?: string[];
  onClubsChange?: (clubs: string[]) => void;
  // New consistent prop names
  selectedClubIds?: string[];
  onSelectionChange?: (selectedClubs: string[]) => void;
}

export function ClubShareSelection({ 
  contentId, 
  contentType, 
  sharedClubs = [], 
  onClubsChange,
  onSelectionChange,
  selectedClubIds: initialSelectedClubIds = []
}: ClubShareSelectionProps) {
  const { user } = useAuth();
  const [isOpen, setIsOpen] = useState(false);
  const [clubs, setClubs] = useState<Club[]>([]);
  const [selectedClubIds, setSelectedClubIds] = useState<string[]>(initialSelectedClubIds);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  
  useEffect(() => {
    if (user && isOpen) {
      loadUserClubs();
    }
  }, [user, isOpen]);
  
  // Update local state when the prop changes
  useEffect(() => {
    if (sharedClubs && sharedClubs.length > 0) {
      setSelectedClubIds(sharedClubs);
    } else if (initialSelectedClubIds && initialSelectedClubIds.length > 0) {
      setSelectedClubIds(initialSelectedClubIds);
    }
  }, [sharedClubs, initialSelectedClubIds]);

  const loadUserClubs = async () => {
    if (!user) return;
    
    setIsLoading(true);
    try {
      // Get clubs where the user is admin or owner
      const { data, error } = await supabase
        .from('club_members')
        .select(`
          club_id,
          role,
          clubs:club_id(
            id,
            name,
            description,
            logo_url
          )
        `)
        .eq('user_id', user.id)
        .eq('status', 'active')
        .in('role', ['owner', 'admin']);
      
      if (error) throw error;
      
      // Transform the data to get clubs
      const userClubs = data
        .map(item => item.clubs as Club)
        .filter(Boolean);
      
      setClubs(userClubs);
    } catch (error) {
      console.error("Error loading clubs:", error);
      toast.error("Failed to load your clubs");
    } finally {
      setIsLoading(false);
    }
  };
  
  const toggleClub = (clubId: string) => {
    const newSelection = selectedClubIds.includes(clubId)
      ? selectedClubIds.filter(id => id !== clubId)
      : [...selectedClubIds, clubId];
    
    setSelectedClubIds(newSelection);
    
    // Call appropriate callback handlers
    if (onSelectionChange) {
      onSelectionChange(newSelection);
    }
    if (onClubsChange) {
      onClubsChange(newSelection);
    }
  };
  
  const handleSave = async () => {
    if (!contentId || !user) {
      // If contentId is not provided, just close the dialog
      // This allows the component to be used for selection only
      if (onSelectionChange) {
        onSelectionChange(selectedClubIds);
      }
      if (onClubsChange) {
        onClubsChange(selectedClubIds);
      }
      setIsOpen(false);
      return;
    }
    
    setIsLoading(true);
    try {
      // First, let's delete all existing shared entries
      const tableName = contentType === 'workout' ? 'club_shared_workouts' : 'club_shared_programs';
      const idField = contentType === 'workout' ? 'workout_id' : 'program_id';
      
      const { error: deleteError } = await supabase
        .from(tableName)
        .delete()
        .eq(idField, contentId);
      
      if (deleteError) throw deleteError;
      
      // Now insert new entries if there are any selected clubs
      if (selectedClubIds.length > 0) {
        // Create properly typed arrays for each content type
        if (contentType === 'workout') {
          const sharesToCreate: WorkoutShareRecord[] = selectedClubIds.map(clubId => ({
            workout_id: contentId,
            club_id: clubId,
            shared_by: user.id
          }));
          
          const { error: insertError } = await supabase
            .from('club_shared_workouts')
            .insert(sharesToCreate);
          
          if (insertError) throw insertError;
        } else {
          const sharesToCreate: ProgramShareRecord[] = selectedClubIds.map(clubId => ({
            program_id: contentId,
            club_id: clubId,
            shared_by: user.id
          }));
          
          const { error: insertError } = await supabase
            .from('club_shared_programs')
            .insert(sharesToCreate);
          
          if (insertError) throw insertError;
        }
      }
      
      toast.success(`${contentType.charAt(0).toUpperCase() + contentType.slice(1)} sharing settings updated`);
      if (onClubsChange) {
        onClubsChange(selectedClubIds);
      }
      if (onSelectionChange) {
        onSelectionChange(selectedClubIds);
      }
      setIsOpen(false);
    } catch (error: any) {
      console.error("Error saving club sharing settings:", error);
      toast.error(`Failed to update sharing settings: ${error.message}`);
    } finally {
      setIsLoading(false);
    }
  };
  
  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm" className="gap-1">
          <Plus size={16} />
          Share with Club
          {selectedClubIds.length > 0 && (
            <Badge variant="secondary" className="ml-1">{selectedClubIds.length}</Badge>
          )}
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Share with Clubs</DialogTitle>
          <DialogDescription>
            Select which clubs should have access to this {contentType}.
          </DialogDescription>
        </DialogHeader>
        
        <div className="space-y-2 my-4">
          {isLoading ? (
            <div className="text-center py-4">
              <div className="animate-spin h-5 w-5 border-2 border-primary border-t-transparent rounded-full mx-auto"></div>
              <p className="text-sm text-muted-foreground mt-2">Loading your clubs...</p>
            </div>
          ) : clubs.length === 0 ? (
            <div className="text-center py-4">
              <p className="text-sm text-muted-foreground">
                You don't have any clubs where you are an admin or owner.
              </p>
            </div>
          ) : (
            clubs.map((club) => (
              <div
                key={club.id}
                className={`flex items-center justify-between p-3 rounded-md border cursor-pointer transition-colors ${
                  selectedClubIds.includes(club.id)
                    ? "border-primary bg-primary/10"
                    : "border-border hover:bg-accent"
                }`}
                onClick={() => toggleClub(club.id)}
              >
                <div className="flex items-center gap-3">
                  {club.logo_url ? (
                    <img
                      src={club.logo_url}
                      alt={club.name}
                      className="h-9 w-9 rounded-full object-cover"
                    />
                  ) : (
                    <div className="h-9 w-9 rounded-full bg-primary/20 flex items-center justify-center text-primary font-medium">
                      {club.name.charAt(0)}
                    </div>
                  )}
                  <div>
                    <p className="font-medium">{club.name}</p>
                    {club.description && (
                      <p className="text-xs text-muted-foreground line-clamp-1">
                        {club.description}
                      </p>
                    )}
                  </div>
                </div>
                
                {selectedClubIds.includes(club.id) && (
                  <Check size={18} className="text-primary" />
                )}
              </div>
            ))
          )}
        </div>
        
        <DialogFooter>
          <Button variant="outline" onClick={() => setIsOpen(false)}>
            Cancel
          </Button>
          <Button onClick={handleSave} disabled={isLoading}>
            {isLoading ? "Saving..." : "Save"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}