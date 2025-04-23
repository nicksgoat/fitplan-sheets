
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { FileText, Calendar, MessageSquare, Users, Dumbbell, ArrowLeft, PlusCircle } from 'lucide-react';
import { toast } from 'sonner';
import { useAuth } from '@/hooks/useAuth';
import { useClub } from '@/contexts/ClubContext';
import ClubDetailHeader from './ClubDetailHeader';
import ClubFeedTab from './ClubFeedTab';
import ClubEventsTab from './ClubEventsTab';
import ClubSharedContent from './ClubSharedContent';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import ClubChannel from './ClubChannel';
import ClubMembersTab from './ClubMembersTab';
import ClubSettings from './ClubSettings';
import ClubMobileNav from './ClubMobileNav';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { supabase } from '@/integrations/supabase/client';
import { fetchClubChannels, uploadPostImage } from './ClubDetailPageUtils';

const ClubDetailPage: React.FC = () => {
  const [activeTab, setActiveTab] = useState('feed');
  const [showCreatePostDialog, setShowCreatePostDialog] = useState(false);
  const [newPostContent, setNewPostContent] = useState('');
  const [postingStatus, setPostingStatus] = useState(false);
  const [joiningClub, setJoiningClub] = useState(false);
  const [postImage, setPostImage] = useState<File | null>(null);
  const [channels, setChannels] = useState<any[]>([]);
  const [activeChannel, setActiveChannel] = useState<any>(null);
  
  const navigate = useNavigate();
  const { user } = useAuth();
  const { 
    currentClub,
    members,
    events,
    posts,
    isUserClubMember,
    joinCurrentClub,
    loadingMembers,
    loadingEvents,
    loadingPosts,
    refreshMembers,
    refreshEvents,
    refreshPosts,
    createNewPost,
    getUserClubRole
  } = useClub();

  useEffect(() => {
    if (currentClub?.id) {
      const fetchChannels = async () => {
        const channelData = await fetchClubChannels(currentClub.id);
        setChannels(channelData);
      };
      
      fetchChannels();
    }
  }, [currentClub?.id]);

  const userClubRole = currentClub ? getUserClubRole(currentClub.id) : 'member';
  const isAdmin = userClubRole === 'admin' || userClubRole === 'moderator' || userClubRole === 'owner';

  const handleJoinClub = async () => {
    if (!user) {
      toast.error('You need to be logged in to join a club');
      navigate('/auth');
      return;
    }
    
    try {
      setJoiningClub(true);
      await joinCurrentClub();
      toast.success(`You've joined ${currentClub!.name}`);
      refreshMembers();
    } catch (error) {
      console.error('Error joining club:', error);
      toast.error('Failed to join the club. Please try again.');
    } finally {
      setJoiningClub(false);
    }
  };

  const handleCreatePost = async () => {
    if (!newPostContent.trim() || !user) {
      toast.error('Please enter content for your post');
      return;
    }
    
    try {
      setPostingStatus(true);
      
      let imageUrl = null;
      
      // Upload image if one is selected
      if (postImage) {
        imageUrl = await uploadPostImage(postImage);
      }
      
      await createNewPost({
        club_id: currentClub!.id,
        content: newPostContent.trim(),
        image_url: imageUrl
      });
      
      setShowCreatePostDialog(false);
      setNewPostContent('');
      setPostImage(null);
      refreshPosts();
      toast.success('Post created successfully');
    } catch (error) {
      console.error('Error creating post:', error);
      toast.error('Failed to create post');
    } finally {
      setPostingStatus(false);
    }
  };

  if (!currentClub) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
      </div>
    );
  }

  return (
    <div className="container mx-auto max-w-4xl px-4 py-6">
      <div className="md:block hidden mb-6">
        <Button
          variant="ghost"
          onClick={() => navigate('/clubs')}
          className="flex items-center mb-4"
        >
          <ArrowLeft size={18} className="mr-2" />
          Back to Clubs
        </Button>
      </div>
      
      <ClubMobileNav 
        club={currentClub}
        activeTab={activeTab}
        onChangeTab={setActiveTab}
      />
      
      <div className="bg-card rounded-lg shadow overflow-hidden">
        <ClubDetailHeader
          club={currentClub}
          isUserClubMember={isUserClubMember(currentClub.id)}
          onJoinClub={handleJoinClub}
          joiningClub={joiningClub}
        />
        
        <div className="px-6 pb-6">
          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="grid w-full grid-cols-3 md:grid-cols-6 mb-6">
              <TabsTrigger value="feed" className="flex items-center gap-2">
                <FileText size={16} />
                <span className="hidden md:inline">Feed</span>
              </TabsTrigger>
              <TabsTrigger value="events" className="flex items-center gap-2">
                <Calendar size={16} />
                <span className="hidden md:inline">Events</span>
              </TabsTrigger>
              <TabsTrigger value="channels" className="flex items-center gap-2">
                <MessageSquare size={16} />
                <span className="hidden md:inline">Channels</span>
              </TabsTrigger>
              <TabsTrigger value="members" className="flex items-center gap-2">
                <Users size={16} />
                <span className="hidden md:inline">Members</span>
              </TabsTrigger>
              <TabsTrigger value="shared" className="flex items-center gap-2">
                <Dumbbell size={16} />
                <span className="hidden md:inline">Shared</span>
              </TabsTrigger>
              {isAdmin && (
                <TabsTrigger value="settings" className="flex items-center gap-2">
                  <Dumbbell size={16} />
                  <span className="hidden md:inline">Settings</span>
                </TabsTrigger>
              )}
            </TabsList>
            
            <TabsContent value="feed">
              <ClubFeedTab
                posts={posts}
                isUserClubMember={isUserClubMember(currentClub.id)}
                loadingPosts={loadingPosts}
                clubId={currentClub.id}
                onCreatePost={() => setShowCreatePostDialog(true)}
                onRefresh={refreshPosts}
              />
            </TabsContent>
            
            <TabsContent value="events">
              <ClubEventsTab
                clubId={currentClub.id}
                events={events}
                isUserClubMember={isUserClubMember(currentClub.id)}
                loadingEvents={loadingEvents}
              />
            </TabsContent>
            
            <TabsContent value="channels">
              <div>
                {isUserClubMember(currentClub.id!) && (
                  <div className="mb-6">
                    <Button
                      onClick={() => navigate(`/clubs/${currentClub!.id}/channels/create`)}
                      variant="outline"
                      className="w-full flex items-center gap-2 h-auto py-3 justify-start"
                    >
                      <PlusCircle size={20} />
                      <span>Create Channel</span>
                    </Button>
                  </div>
                )}
                
                {channels.length === 0 ? (
                  <div className="flex flex-col items-center justify-center py-12 text-muted-foreground">
                    <MessageSquare size={64} className="mb-4" />
                    <h3 className="text-lg font-medium">No channels yet</h3>
                    <p>Channels will appear here when created</p>
                  </div>
                ) : (
                  <div className="space-y-2">
                    {channels.map(channel => (
                      <ClubChannel
                        key={channel.id}
                        channel={channel}
                        onClick={() => setActiveChannel(channel)}
                      />
                    ))}
                  </div>
                )}
              </div>
            </TabsContent>
            
            <TabsContent value="members">
              <ClubMembersTab
                members={members}
                loadingMembers={loadingMembers}
                isAdmin={isAdmin}
                currentUserRole={userClubRole}
                clubId={currentClub.id}
                onRefresh={refreshMembers}
              />
            </TabsContent>

            <TabsContent value="shared">
              <ClubSharedContent clubId={currentClub.id!} />
            </TabsContent>
            
            {isAdmin && (
              <TabsContent value="settings">
                <ClubSettings clubId={currentClub.id} />
              </TabsContent>
            )}
          </Tabs>
        </div>
      </div>
      
      <Dialog open={showCreatePostDialog} onOpenChange={setShowCreatePostDialog}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Create Post</DialogTitle>
          </DialogHeader>
          
          <div className="py-4 space-y-4">
            <Textarea
              placeholder="What's on your mind?"
              value={newPostContent}
              onChange={(e) => setNewPostContent(e.target.value)}
              rows={5}
              className="resize-none"
            />
            
            <div className="space-y-2">
              <Label htmlFor="post-image">Add Image (optional)</Label>
              <Input
                id="post-image"
                type="file"
                accept="image/*"
                onChange={(e) => setPostImage(e.target.files?.[0] || null)}
              />
            </div>
            
            {postImage && (
              <div className="relative">
                <img 
                  src={URL.createObjectURL(postImage)} 
                  alt="Post preview" 
                  className="w-full h-auto rounded-md max-h-[200px] object-contain"
                />
                <Button
                  variant="destructive"
                  size="icon"
                  className="absolute top-2 right-2 h-6 w-6"
                  onClick={() => setPostImage(null)}
                >
                  ×
                </Button>
              </div>
            )}
          </div>
          
          <DialogFooter>
            <Button
              onClick={handleCreatePost}
              disabled={!newPostContent.trim() || postingStatus}
            >
              {postingStatus ? 'Posting...' : 'Post'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default ClubDetailPage;
