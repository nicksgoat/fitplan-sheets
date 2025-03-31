
export interface SocialLink {
  platform: string;
  url: string;
  icon?: string;
}

export interface Profile {
  id: string;
  username?: string | null;
  display_name?: string | null;
  bio?: string | null;
  avatar_url?: string | null;
  website?: string | null;
  social_links?: SocialLink[];
  created_at: string;
  updated_at?: string | null;
}
