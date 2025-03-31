
import React, { useState } from 'react';
import { useParams } from 'react-router-dom';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Separator } from '@/components/ui/separator';
import { Link, Settings, ExternalLink, Edit2, Save, X } from 'lucide-react';
import { useProfile } from '@/hooks/useProfile';
import { useAuth } from '@/hooks/useAuth';
import { SocialLink, Profile } from '@/types/profile';
import ProfileStats from '@/components/profile/ProfileStats';
import ContentGrid from '@/components/ui/ContentGrid';
import { ItemType } from '@/lib/types';
import { Exercise } from '@/types/exercise';

// Define local type for mock data
type MockItemType = Omit<ItemType, 'difficulty'> & {
  difficulty: 'beginner' | 'intermediate' | 'advanced';
};

const ProfilePage: React.FC = () => {
  const { profileId } = useParams<{ profileId: string }>();
  const { profile, isLoading, isEditing, setIsEditing, updateProfile, isUpdating, isOwnProfile } = useProfile(profileId);
  const [editForm, setEditForm] = useState<Partial<Profile>>({});
  
  // Form handling
  const handleEditStart = () => {
    setEditForm({
      display_name: profile?.display_name || '',
      username: profile?.username || '',
      bio: profile?.bio || '',
      website: profile?.website || '',
    });
    setIsEditing(true);
  };
  
  const handleCancel = () => {
    setIsEditing(false);
    setEditForm({});
  };
  
  const handleSave = () => {
    updateProfile(editForm);
  };
  
  const handleFormChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setEditForm(prev => ({ ...prev, [name]: value }));
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
      <div className="mb-8">
        <Card>
          <CardContent className="pt-6">
            <div className="flex flex-col md:flex-row gap-6 items-center md:items-start">
              {/* Avatar */}
              <div className="w-24 h-24 bg-primary/10 rounded-full flex items-center justify-center text-2xl font-bold text-primary">
                {profile?.display_name?.[0] || profile?.username?.[0] || '?'}
              </div>
              
              {/* Profile Info */}
              <div className="flex-1 text-center md:text-left">
                {isEditing ? (
                  <div className="space-y-4">
                    <div>
                      <label htmlFor="display_name" className="text-sm font-medium">Display Name</label>
                      <Input 
                        id="display_name"
                        name="display_name"
                        value={editForm.display_name || ''}
                        onChange={handleFormChange}
                        className="mt-1"
                      />
                    </div>
                    
                    <div>
                      <label htmlFor="username" className="text-sm font-medium">Username</label>
                      <Input 
                        id="username"
                        name="username"
                        value={editForm.username || ''}
                        onChange={handleFormChange}
                        className="mt-1"
                      />
                    </div>
                    
                    <div>
                      <label htmlFor="bio" className="text-sm font-medium">Bio</label>
                      <Textarea 
                        id="bio"
                        name="bio"
                        value={editForm.bio || ''}
                        onChange={handleFormChange}
                        className="mt-1"
                      />
                    </div>
                    
                    <div>
                      <label htmlFor="website" className="text-sm font-medium">Website</label>
                      <Input 
                        id="website"
                        name="website"
                        value={editForm.website || ''}
                        onChange={handleFormChange}
                        className="mt-1"
                      />
                    </div>
                    
                    <div className="flex gap-2">
                      <Button onClick={handleSave} disabled={isUpdating} className="flex-1">
                        <Save className="mr-2 h-4 w-4" />
                        Save
                      </Button>
                      <Button variant="outline" onClick={handleCancel} className="flex-1">
                        <X className="mr-2 h-4 w-4" />
                        Cancel
                      </Button>
                    </div>
                  </div>
                ) : (
                  <>
                    <div className="flex flex-col md:flex-row md:items-center gap-2 md:gap-4">
                      <h1 className="text-2xl font-bold">{profile?.display_name || profile?.username || 'Anonymous'}</h1>
                      
                      {isOwnProfile && (
                        <Button variant="outline" size="sm" onClick={handleEditStart}>
                          <Edit2 className="mr-2 h-4 w-4" />
                          Edit Profile
                        </Button>
                      )}
                    </div>
                    
                    {profile?.username && (
                      <p className="text-muted-foreground">@{profile.username}</p>
                    )}
                    
                    {profile?.bio && (
                      <p className="mt-2">{profile.bio}</p>
                    )}
                    
                    {profile?.website && (
                      <a 
                        href={profile.website.startsWith('http') ? profile.website : `https://${profile.website}`} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="mt-2 flex items-center text-blue-500 hover:text-blue-700"
                      >
                        <ExternalLink className="h-4 w-4 mr-1" />
                        {profile.website}
                      </a>
                    )}
                    
                    {/* Social Links */}
                    {profile?.social_links && profile.social_links.length > 0 && (
                      <div className="mt-4 flex flex-wrap gap-2">
                        {profile.social_links.map((link, index) => (
                          <Badge key={index} variant="outline" className="flex items-center">
                            <Link className="h-3 w-3 mr-1" />
                            <a href={link.url} target="_blank" rel="noopener noreferrer">
                              {link.platform}
                            </a>
                          </Badge>
                        ))}
                      </div>
                    )}
                  </>
                )}
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
      
      {/* Profile Stats */}
      <ProfileStats 
        workoutsCount={mockWorkouts.length} 
        programsCount={mockPrograms.length}
        savedCount={mockSaved.length}
      />
      
      {/* Profile Content */}
      <Tabs defaultValue="workouts" className="mt-6">
        <TabsList className="w-full md:w-auto mb-2">
          <TabsTrigger value="workouts">Workouts</TabsTrigger>
          <TabsTrigger value="programs">Programs</TabsTrigger>
          <TabsTrigger value="saved">Saved</TabsTrigger>
          {isOwnProfile && <TabsTrigger value="settings">Settings</TabsTrigger>}
        </TabsList>
        
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
    </div>
  );
};

export default ProfilePage;
