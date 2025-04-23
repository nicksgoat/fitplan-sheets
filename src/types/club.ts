
export interface ClubPost {
  id: string;
  club_id: string;
  user_id: string;
  content: string;
  created_at: string;
  updated_at?: string;
  profile?: {
    display_name?: string;
    avatar_url?: string;
  };
  image_url?: string;
  workout_id?: string;
  workout?: {
    id: string;
    name: string;
    description?: string;
  } | null;
  comments?: ClubPostComment[];
}
