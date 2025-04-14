
// Define shared types for club sharing functionality
export interface Club {
  id: string;
  name: string;
  description?: string;
  logo_url?: string;
}

// Define specific types for workout and program shares
export interface WorkoutShareRecord {
  club_id: string;
  shared_by: string;
  workout_id: string;
}

export interface ProgramShareRecord {
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

// Define the props interface for the ClubShareDialog component
export interface ClubShareDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  contentId: string;
  contentType: 'workout' | 'program';
  selectedClubIds?: string[];
  onSelectionChange?: (clubIds: string[]) => void;
}
