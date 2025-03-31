
import React from 'react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Profile } from '@/types/profile';
import { Edit } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { profileAvatarStyles } from '@/styles/AssetLibrary';

interface ProfileHeaderProps {
  profile: Profile | null;
  isCurrentUser: boolean;
  onEdit?: () => void;
}

const ProfileHeader = ({ profile, isCurrentUser, onEdit }: ProfileHeaderProps) => {
  if (!profile) return null;

  // Get initials for avatar fallback
  const getInitials = () => {
    if (profile.display_name) {
      return profile.display_name
        .split(' ')
        .map(n => n[0])
        .join('')
        .toUpperCase()
        .substring(0, 2);
    }
    
    if (profile.username) {
      return profile.username.substring(0, 2).toUpperCase();
    }
    
    return 'U';
  };

  return (
    <div className="flex flex-col items-center text-center">
      <div className="relative mb-4">
        <Avatar className={profileAvatarStyles()}>
          <AvatarImage src={profile.avatar_url || undefined} alt={profile.display_name || 'User'} />
          <AvatarFallback className="text-xl bg-primary/10 text-primary">
            {getInitials()}
          </AvatarFallback>
        </Avatar>
        
        {isCurrentUser && onEdit && (
          <Button 
            variant="outline" 
            size="icon" 
            className="absolute bottom-0 right-0 bg-background h-8 w-8 rounded-full"
            onClick={onEdit}
          >
            <Edit className="h-4 w-4" />
          </Button>
        )}
      </div>
      
      <h1 className="text-xl font-bold md:text-2xl mb-1">
        {profile.display_name || profile.username || 'User'}
      </h1>
      
      {profile.username && profile.display_name && (
        <h2 className="text-sm text-muted-foreground mb-2">@{profile.username}</h2>
      )}
      
      {profile.bio && (
        <p className="text-sm md:text-base max-w-md mt-2">
          {profile.bio}
        </p>
      )}
    </div>
  );
};

export default ProfileHeader;
