
// Define shared types for club sharing functionality
export interface Club {
  id: string;
  name: string;
  description?: string;
  logo_url?: string;
}

// Define specific type for workout shares
export interface WorkoutShareRecord {
  club_id: string;
  shared_by: string;
  workout_id: string;
}

// Define specific type for program shares
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
