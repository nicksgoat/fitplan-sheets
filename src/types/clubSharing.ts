
import { ClubType, MembershipType } from './club';

// We're defining a simplified Club type compatible with the main Club type
export interface Club {
  id: string;
  name: string;
  description?: string | null;
  logo_url?: string | null;
  // Making these fields match the main Club type
  created_at: string;
  club_type: ClubType;
  membership_type: MembershipType;
  creator_id: string;
  updated_at: string;
  banner_url?: string | null;
  premium_price?: number | null;
  created_by?: string; // For compatibility with API
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
  initialSelectedClubs?: string[];
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
