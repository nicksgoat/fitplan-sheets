import React from 'react';
import { useParams } from 'react-router-dom';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { ExternalLink, Edit2 } from 'lucide-react';
import { useProfile } from '@/hooks/useProfile';
import ProfileStats from '@/components/profile/ProfileStats';
import ContentGrid from '@/components/ui/ContentGrid';
import { ItemType } from '@/lib/types';
import { Exercise } from '@/types/exercise';
import EditProfileForm from '@/components/profile/EditProfileForm';
import ProfileHeader from '@/components/profile/ProfileHeader';
import SocialLinksDisplay from '@/components/profile/SocialLinksDisplay';
import { profileCardStyles } from '@/styles/AssetLibrary';

// Define local type for mock data
type MockItemType = Omit<ItemType, 'difficulty'> & {
  difficulty: 'beginner' | 'intermediate' | 'advanced';
};

const ProfilePage: React.FC = () => {
  const { profileId } = useParams<{ profileId: string }>();
  const { 
    profile, 
    isLoading, 
    isEditing, 
    setIsEditing, 
    updateProfile, 
    isUpdating, 
    isOwnProfile 
  } = useProfile(profileId);
  
  // Handle edit modal
  const handleEditStart = () => {
    setIsEditing(true);
  };
  
  const handleEditClose = () => {
    setIsEditing(false);
  };
  
  const handleProfileUpdate = async (updates) => {
    try {
      await updateProfile(updates);
      return { success: true };
    } catch (err) {
      console.error("Error updating profile:", err);
      return { success: false };
    }
  };
  
  if (isLoading) {
    return (
      <div className="container mx-auto py-6 px-4">
        <div className="flex flex-col items-center justify-center min-h-[40vh]">
          <div className="w-24 h-24 rounded-full bg-gray-200 animate-pulse mb-4"></div>
          <div className="h-8 w-48 bg-gray-200 animate-pulse mb-2"></div>
          <div className="h-4 w-64 bg-gray-200 animate-pulse"></div>
        </div>
      </div>
    );
  }
  
  // Mock data for workouts, programs, etc.
  const mockWorkouts: MockItemType[] = [
    {
      id: '1',
      title: 'Full Body Strength',
      type: 'workout',
      creator: 'John Fitness',
      imageUrl: '/placeholder.svg',
      tags: ['strength', 'full-body'],
      difficulty: 'intermediate',
      isFavorite: true,
      duration: '45 min',
      description: 'A complete full body workout targeting all major muscle groups.'
    },
    {
      id: '2',
      title: 'HIIT Cardio Burn',
      type: 'workout',
      creator: 'Sarah Cardio',
      imageUrl: '/placeholder.svg',
      tags: ['cardio', 'hiit'],
      difficulty: 'advanced',
      isFavorite: false,
      duration: '30 min',
      description: 'High intensity interval training to maximize calorie burn and endurance.'
    },
  ];
  
  const mockPrograms: MockItemType[] = [
    {
      id: '3',
      title: '8-Week Muscle Builder',
      type: 'program',
      creator: 'Mike Gains',
      imageUrl: '/placeholder.svg',
      tags: ['hypertrophy', 'strength'],
      difficulty: 'intermediate',
      isFavorite: true,
      duration: '8 weeks',
      description: 'Progressive program designed to build muscle mass and strength.'
    },
  ];
  
  const mockSaved: MockItemType[] = [
    {
      id: '4',
      title: 'Yoga Flow',
      type: 'workout',
      creator: 'Yogi Master',
      imageUrl: '/placeholder.svg',
      tags: ['yoga', 'flexibility'],
      difficulty: 'beginner',
      isFavorite: true,
      duration: '60 min',
      description: 'Flowing yoga sequence to improve flexibility and mindfulness.'
    },
  ];
  
  // Convert mock data to the expected type for ContentGrid
  const workoutsForGrid: (ItemType | Exercise)[] = mockWorkouts as unknown as ItemType[];
  const programsForGrid: (ItemType | Exercise)[] = mockPrograms as unknown as ItemType[];
  const savedForGrid: (ItemType | Exercise)[] = mockSaved as unknown as ItemType[];
  
  return (
    <div className="container mx-auto py-6 px-4">
      {/* Profile Header */}
      <Card className={profileCardStyles()}>
        <CardContent className="pt-6">
          <div className="flex flex-col md:flex-row gap-6 items-center md:items-start">
            <ProfileHeader 
              profile={profile}
              isCurrentUser={isOwnProfile}
              onEdit={handleEditStart}
            />
            
            <div className="md:ml-6 flex-1 text-center md:text-left">
              {profile?.website && (
                <a 
                  href={profile.website.startsWith('http') ? profile.website : `https://${profile.website}`} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="mt-2 flex items-center gap-1 text-blue-500 hover:text-blue-700"
                >
                  <ExternalLink className="h-4 w-4" />
                  {profile.website}
                </a>
              )}
              
              {/* Social Links */}
              <SocialLinksDisplay socialLinks={profile?.social_links} />
              
              {isOwnProfile && (
                <Button 
                  variant="outline" 
                  size="sm" 
                  onClick={handleEditStart}
                  className="mt-4"
                >
                  <Edit2 className="mr-2 h-4 w-4" />
                  Edit Profile
                </Button>
              )}
            </div>
          </div>
        </CardContent>
      </Card>
      
      {/* Profile Stats */}
      <ProfileStats 
        workoutsCount={workoutsForGrid.length} 
        programsCount={programsForGrid.length}
        savedCount={savedForGrid.length}
      />
      
      {/* Profile Content */}
      <Tabs defaultValue="workouts" className="mt-6">
        <TabsList className="w-full md:w-auto mb-2">
          <TabsTrigger value="workouts">Workouts</TabsTrigger>
          <TabsTrigger value="programs">Programs</TabsTrigger>
          <TabsTrigger value="saved">Saved</TabsTrigger>
          {isOwnProfile && <TabsTrigger value="settings">Settings</TabsTrigger>}
        </TabsList>
        
        {/* Workouts Tab */}
        <TabsContent value="workouts">
          <h2 className="text-xl font-semibold mb-4">My Workouts</h2>
          {workoutsForGrid.length > 0 ? (
            <ContentGrid items={workoutsForGrid} />
          ) : (
            <div className="text-center py-12 bg-muted/20 rounded-lg">
              <p>No workouts created yet</p>
              {isOwnProfile && (
                <Button className="mt-4">Create Workout</Button>
              )}
            </div>
          )}
        </TabsContent>
        
        {/* Programs Tab */}
        <TabsContent value="programs">
          <h2 className="text-xl font-semibold mb-4">My Programs</h2>
          {programsForGrid.length > 0 ? (
            <ContentGrid items={programsForGrid} />
          ) : (
            <div className="text-center py-12 bg-muted/20 rounded-lg">
              <p>No programs created yet</p>
              {isOwnProfile && (
                <Button className="mt-4">Create Program</Button>
              )}
            </div>
          )}
        </TabsContent>
        
        {/* Saved Tab */}
        <TabsContent value="saved">
          <h2 className="text-xl font-semibold mb-4">Saved Items</h2>
          {savedForGrid.length > 0 ? (
            <ContentGrid items={savedForGrid} />
          ) : (
            <div className="text-center py-12 bg-muted/20 rounded-lg">
              <p>No saved items yet</p>
            </div>
          )}
        </TabsContent>
        
        {/* Settings Tab */}
        {isOwnProfile && (
          <TabsContent value="settings">
            <h2 className="text-xl font-semibold mb-4">Account Settings</h2>
            <Card>
              <CardContent className="pt-6">
                <div className="space-y-4">
                  <div>
                    <h3 className="text-lg font-medium mb-2">Social Links</h3>
                    <Separator className="mb-4" />
                    {/* Add social links section here */}
                    <p className="text-muted-foreground">Add your social media profiles</p>
                  </div>
                  
                  <div>
                    <h3 className="text-lg font-medium mb-2">Privacy Settings</h3>
                    <Separator className="mb-4" />
                    {/* Add privacy settings here */}
                    <p className="text-muted-foreground">Manage your profile privacy settings</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        )}
      </Tabs>
      
      {/* Edit Profile Form Dialog */}
      <EditProfileForm
        profile={profile}
        isOpen={isEditing}
        onClose={handleEditClose}
        onSave={handleProfileUpdate}
      />
    </div>
  );
};

export default ProfilePage;
