
import React, { useState } from 'react';
import { useParams } from 'react-router-dom';
import { useProfile } from '@/hooks/useProfile';
import { useAuth } from '@/hooks/useAuth';
import ProfileHeader from '@/components/profile/ProfileHeader';
import SocialLinks from '@/components/profile/SocialLinks';
import ProfileStats from '@/components/profile/ProfileStats';
import ProfileTabs from '@/components/profile/ProfileTabs';
import EditProfileForm from '@/components/profile/EditProfileForm';
import { Button } from '@/components/ui/button';
import { Edit } from 'lucide-react';
import { Separator } from '@/components/ui/separator';

// Mock data for display - in a real app, you'd fetch these from your API
// TODO: Replace with real data once backend integration is complete
const mockWorkouts = [
  {
    id: '1',
    title: 'Full Body Workout',
    type: 'workout',
    creator: 'Me',
    imageUrl: 'https://placehold.co/600x400?text=Full+Body',
    tags: ['strength', 'full-body'],
    difficulty: 'intermediate',
    isFavorite: false,
    duration: '45 min',
    description: 'A comprehensive full body workout routine'
  },
  {
    id: '2',
    title: 'HIIT Cardio',
    type: 'workout',
    creator: 'Me',
    imageUrl: 'https://placehold.co/600x400?text=HIIT',
    tags: ['cardio', 'hiit'],
    difficulty: 'advanced',
    isFavorite: true,
    duration: '30 min',
    description: 'High intensity interval training'
  }
];

const mockPrograms = [
  {
    id: '3',
    title: '30 Day Challenge',
    type: 'program',
    creator: 'Me',
    imageUrl: 'https://placehold.co/600x400?text=30+Day',
    tags: ['challenge', 'beginner'],
    difficulty: 'beginner',
    isFavorite: false,
    duration: '30 days',
    description: 'A 30 day workout challenge for beginners'
  }
];

const mockSaved = [
  {
    id: '4',
    title: 'Yoga Flow',
    type: 'workout',
    creator: 'YogaInstructor',
    imageUrl: 'https://placehold.co/600x400?text=Yoga',
    tags: ['yoga', 'flexibility'],
    difficulty: 'beginner',
    isFavorite: true,
    duration: '20 min',
    description: 'A calming yoga flow to improve flexibility'
  }
];

const Profile = () => {
  const { profileId } = useParams<{ profileId: string }>();
  const { user, loading: authLoading } = useAuth();
  const { profile, loading, isCurrentUser, updateProfile } = useProfile(profileId);
  const [isEditingProfile, setIsEditingProfile] = useState(false);
  
  const handleEditProfile = () => {
    setIsEditingProfile(true);
  };
  
  const handleCloseEditProfile = () => {
    setIsEditingProfile(false);
  };
  
  const handleSaveProfile = async (updates: any) => {
    return await updateProfile(updates);
  };
  
  // Show loading state
  if (loading || authLoading) {
    return (
      <div className="flex justify-center items-center min-h-[70vh]">
        <p>Loading profile...</p>
      </div>
    );
  }
  
  // Show not found state
  if (!profile && !loading) {
    return (
      <div className="text-center py-12">
        <h1 className="text-2xl font-bold mb-4">Profile Not Found</h1>
        <p className="text-muted-foreground mb-6">The profile you're looking for doesn't exist or you don't have permission to view it.</p>
        <Button asChild>
          <a href="/">Go Home</a>
        </Button>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto pb-16">
      {/* Mobile edit button for current user */}
      {isCurrentUser && (
        <div className="flex justify-end p-4 md:hidden">
          <Button 
            variant="outline" 
            size="sm" 
            className="flex items-center gap-1" 
            onClick={handleEditProfile}
          >
            <Edit className="h-4 w-4" />
            Edit Profile
          </Button>
        </div>
      )}
      
      {/* Profile header with avatar, name and bio */}
      <ProfileHeader 
        profile={profile} 
        isCurrentUser={isCurrentUser} 
        onEdit={handleEditProfile} 
      />
      
      {/* Social links section */}
      {profile?.social_links && profile.social_links.length > 0 && (
        <SocialLinks 
          links={profile.social_links} 
          className="mb-6" 
        />
      )}
      
      {/* Desktop edit button for current user */}
      {isCurrentUser && (
        <div className="hidden md:flex justify-center mb-6">
          <Button 
            variant="outline" 
            className="flex items-center gap-2" 
            onClick={handleEditProfile}
          >
            <Edit className="h-4 w-4" />
            Edit Profile
          </Button>
        </div>
      )}
      
      <Separator className="mb-6" />
      
      {/* Profile stats */}
      <ProfileStats 
        workoutsCount={mockWorkouts.length} 
        programsCount={mockPrograms.length} 
        savedCount={mockSaved.length} 
      />
      
      {/* Content tabs */}
      <ProfileTabs 
        workouts={mockWorkouts} 
        programs={mockPrograms} 
        savedContent={mockSaved} 
      />
      
      {/* Edit profile dialog */}
      <EditProfileForm 
        profile={profile} 
        isOpen={isEditingProfile} 
        onClose={handleCloseEditProfile} 
        onSave={handleSaveProfile} 
      />
    </div>
  );
};

export default Profile;
