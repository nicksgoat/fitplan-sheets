
import { Club as ClubBase } from '@/types/club';

// We're defining a simplified Club type that's compatible with the full Club type
export interface Club {
  id: string;
  name: string;
  description?: string;
  logo_url?: string;
  // Adding the required fields from ClubBase to make it compatible
  created_at: string;
  created_by?: string; // Making this optional as it might not be in the DB schema
  club_type: 'fitness' | 'sports' | 'wellness' | 'nutrition' | 'other';
  membership_type: 'free' | 'premium' | 'vip';
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
