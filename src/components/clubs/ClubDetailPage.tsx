
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { 
  Tabs, 
  TabsContent, 
  TabsList, 
  TabsTrigger 
} from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Avatar } from "@/components/ui/avatar";
import { AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Card } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { 
  Calendar,
  MessageSquare,
  Users,
  FileText,
  PlusCircle,
  Heart,
  MessageCircle,
  Share2,
  ArrowLeft
} from 'lucide-react';
import { format, formatDistance } from 'date-fns';
import { toast } from 'sonner';
import { useAuth } from '@/hooks/useAuth';
import { useClub } from '@/contexts/ClubContext';
import ClubChannel from './ClubChannel';
import ClubChat from './ClubChat';

const ClubDetailPage = () => {
  const params = useParams();
  const navigate = useNavigate();
  const clubId = params.clubId;
  const { user } = useAuth();
  
  const { 
    currentClub,
    members,
    events,
    posts,
    messages,
    channels,
    isUserClubMember,
    isUserClubAdmin,
    isUserClubCreator,
    joinCurrentClub,
    leaveCurrentClub,
    loadingMembers,
    loadingEvents,
    loadingPosts,
    loadingMessages,
    refreshMembers,
    refreshEvents,
    refreshPosts,
    refreshMessages,
    createNewPost,
    sendNewMessage
  } = useClub();

  // State
  const [activeTab, setActiveTab] = useState('feed');
  const [joiningClub, setJoiningClub] = useState(false);
  const [activeChannel, setActiveChannel] = useState<any>(null);
  const [messageText, setMessageText] = useState('');
  const [sendingMessage, setSendingMessage] = useState(false);
  const [showCreatePostDialog, setShowCreatePostDialog] = useState(false);
  const [newPostContent, setNewPostContent] = useState('');
  const [postingStatus, setPostingStatus] = useState(false);
  
  // Load data when tab changes
  useEffect(() => {
    if (currentClub) {
      if (activeTab === 'feed') {
        refreshPosts();
      } else if (activeTab === 'events') {
        refreshEvents();
      } else if (activeTab === 'members') {
        refreshMembers();
      } else if (activeTab === 'channels' && activeChannel) {
        refreshMessages();
      }
    }
  }, [activeTab, currentClub]);
  
  // Handle joining club
  const handleJoinClub = async () => {
    if (!user) {
      toast.error('You need to be logged in to join a club');
      return;
    }
    
    try {
      setJoiningClub(true);
      await joinCurrentClub();
      toast.success('You have joined the club!');
      refreshMembers();
    } catch (error) {
      console.error('Error joining club:', error);
      toast.error('Failed to join the club. Please try again.');
    } finally {
      setJoiningClub(false);
    }
  };
  
  // Handle leaving club
  const handleLeaveClub = async () => {
    if (!user) return;
    
    if (window.confirm('Are you sure you want to leave this club?')) {
      try {
        setJoiningClub(true);
        await leaveCurrentClub();
        toast.success('You have left the club');
        refreshMembers();
      } catch (error) {
        console.error('Error leaving club:', error);
        toast.error('Failed to leave the club. Please try again.');
      } finally {
        setJoiningClub(false);
      }
    }
  };
  
  // Handle sending message
  const handleSendMessage = async (content: string) => {
    if (!content.trim() || !activeChannel || !user) return;
    
    try {
      setSendingMessage(true);
      
      await sendNewMessage({
        club_id: clubId,
        content: content.trim()
      });
      
      refreshMessages();
    } catch (error) {
      console.error('Error sending message:', error);
      toast.error('Failed to send message');
    } finally {
      setSendingMessage(false);
    }
  };
  
  // Handle creating post
  const handleCreatePost = async () => {
    if (!newPostContent.trim() || !user) {
      toast.error('Please enter content for your post');
      return;
    }
    
    try {
      setPostingStatus(true);
      
      await createNewPost({
        club_id: clubId,
        content: newPostContent.trim()
      });
      
      setShowCreatePostDialog(false);
      setNewPostContent('');
      refreshPosts();
      toast.success('Post created successfully');
    } catch (error) {
      console.error('Error creating post:', error);
      toast.error('Failed to create post');
    } finally {
      setPostingStatus(false);
    }
  };
  
  // Format date
  const formatDate = (dateString: string) => {
    return format(new Date(dateString), 'MMM d, yyyy');
  };
  
  // Format relative time
  const formatRelativeTime = (dateString: string) => {
    return formatDistance(new Date(dateString), new Date(), { addSuffix: true });
  };
  
  // Render club header
  const renderClubHeader = () => {
    const defaultBannerUrl = 'https://images.unsplash.com/photo-1534438327276-14e5300c3a48?ixlib=rb-1.2.1&auto=format&fit=crop&w=1350&q=80';
    const defaultLogoUrl = 'https://images.unsplash.com/photo-1517836357463-d25dfeac3438?ixlib=rb-1.2.1&auto=format&fit=crop&w=1350&q=80';
    
    return (
      <div className="mb-6">
        <div 
          className="h-48 bg-cover bg-center relative w-full rounded-t-lg"
          style={{ backgroundImage: `url(${currentClub?.banner_url || defaultBannerUrl})` }}
        />
        
        <div className="px-6 py-4 relative flex flex-wrap items-start">
          <div className="absolute -top-12 left-6 w-24 h-24 rounded-full overflow-hidden border-4 border-background shadow-lg">
            <img 
              src={currentClub?.logo_url || defaultLogoUrl} 
              alt={currentClub?.name} 
              className="w-full h-full object-cover"
            />
          </div>
          
          <div className="flex flex-col ml-28 flex-1">
            <h1 className="text-2xl font-bold">{currentClub?.name}</h1>
            <span className="text-sm text-muted-foreground capitalize">
              {currentClub?.club_type || 'Fitness Club'}
            </span>
          </div>
          
          <div>
            {isUserClubMember(clubId!) ? (
              <Button
                variant="outline"
                onClick={handleLeaveClub}
                disabled={joiningClub}
                className="border-primary text-primary"
              >
                Member
              </Button>
            ) : (
              <Button
                onClick={handleJoinClub}
                disabled={joiningClub}
              >
                Join Club
              </Button>
            )}
          </div>
          
          <div className="w-full mt-4">
            <p className="text-muted-foreground mb-4">
              {currentClub?.description || 'No description available.'}
            </p>
            
            <div className="flex gap-4 text-sm text-muted-foreground">
              <div className="flex items-center">
                <Users size={16} className="mr-1 text-primary" />
                <span>{members.length} members</span>
              </div>
              
              <div className="flex items-center">
                <Calendar size={16} className="mr-1 text-primary" />
                <span>{events.length} events</span>
              </div>
              
              <div className="flex items-center">
                <MessageSquare size={16} className="mr-1 text-primary" />
                <span>{channels.length} channels</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  };
  
  // Render feed tab
  const renderFeedTab = () => {
    return (
      <div>
        {isUserClubMember(clubId!) && (
          <div className="mb-6">
            <Button
              onClick={() => setShowCreatePostDialog(true)}
              variant="outline"
              className="w-full flex items-center gap-2 h-auto py-3 justify-start"
            >
              <PlusCircle size={20} />
              <span>Create Post</span>
            </Button>
          </div>
        )}
        
        {loadingPosts ? (
          <div className="flex items-center justify-center py-12">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
          </div>
        ) : posts.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-12 text-muted-foreground">
            <FileText size={64} className="mb-4" />
            <h3 className="text-lg font-medium">No posts yet</h3>
            <p>Be the first to create a post!</p>
          </div>
        ) : (
          <div className="space-y-6">
            {posts.map(post => (
              <Card key={post.id} className="overflow-hidden">
                <div className="p-4">
                  <div className="flex items-center mb-4">
                    <Avatar className="mr-3">
                      <AvatarImage src={post.profile?.avatar_url} />
                      <AvatarFallback>
                        {post.profile?.display_name?.charAt(0) || 'U'}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <p className="font-medium">
                        {post.profile?.display_name || 'Unknown User'}
                      </p>
                      <p className="text-sm text-muted-foreground">
                        {formatRelativeTime(post.created_at)}
                      </p>
                    </div>
                  </div>
                  
                  <p className="mb-4">{post.content}</p>
                  
                  {post.image_url && (
                    <img 
                      src={post.image_url} 
                      alt="Post image" 
                      className="w-full h-auto rounded-md mb-4"
                    />
                  )}
                  
                  <div className="flex items-center gap-4 pt-3 border-t">
                    <Button variant="ghost" size="sm" className="flex items-center gap-2">
                      <Heart size={18} />
                      <span>Like</span>
                    </Button>
                    
                    <Button variant="ghost" size="sm" className="flex items-center gap-2">
                      <MessageCircle size={18} />
                      <span>Comment</span>
                    </Button>
                    
                    <Button variant="ghost" size="sm" className="flex items-center gap-2">
                      <Share2 size={18} />
                      <span>Share</span>
                    </Button>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        )}
      </div>
    );
  };
  
  // Render events tab
  const renderEventsTab = () => {
    return (
      <div>
        {isUserClubMember(clubId!) && (
          <div className="mb-6">
            <Button
              onClick={() => navigate(`/clubs/${clubId}/events/create`)}
              variant="outline"
              className="w-full flex items-center gap-2 h-auto py-3 justify-start"
            >
              <PlusCircle size={20} />
              <span>Create Event</span>
            </Button>
          </div>
        )}
        
        {loadingEvents ? (
          <div className="flex items-center justify-center py-12">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
          </div>
        ) : events.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-12 text-muted-foreground">
            <Calendar size={64} className="mb-4" />
            <h3 className="text-lg font-medium">No events yet</h3>
            <p>Be the first to create an event!</p>
          </div>
        ) : (
          <div className="space-y-4">
            {events.map(event => (
              <Card key={event.id} className="overflow-hidden">
                <div 
                  className="h-36 bg-cover bg-center" 
                  style={{ 
                    backgroundImage: `url(${
                      event.image_url || 
                      'https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b'
                    })` 
                  }}
                />
                <div className="p-4">
                  <h3 className="text-xl font-semibold mb-2">{event.name}</h3>
                  <div className="flex items-center text-sm text-primary mb-2">
                    <Calendar size={16} className="mr-2" />
                    <span>{format(new Date(event.start_time), 'MMM d, yyyy')} • </span>
                    <span className="ml-1">
                      {format(new Date(event.start_time), 'h:mm a')}
                    </span>
                  </div>
                  
                  {event.location && (
                    <p className="text-sm text-muted-foreground mb-3">
                      📍 {event.location}
                    </p>
                  )}
                  
                  <p className="text-muted-foreground line-clamp-2 mb-3">
                    {event.description || 'No description available'}
                  </p>
                  
                  <div className="flex items-center justify-between">
                    <div className="text-sm text-muted-foreground">
                      {event.attendee_count || 0} attendees
                    </div>
                    <Button
                      onClick={() => navigate(`/clubs/${clubId}/events/${event.id}`)}
                      size="sm"
                    >
                      View Details
                    </Button>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        )}
      </div>
    );
  };
  
  // Render channels tab
  const renderChannelsTab = () => {
    if (activeChannel) {
      return (
        <ClubChat
          channel={activeChannel}
          messages={messages}
          onBack={() => setActiveChannel(null)}
          onSendMessage={handleSendMessage}
          sendingMessage={sendingMessage}
        />
      );
    }
    
    return (
      <div>
        {isUserClubMember(clubId!) && isUserClubAdmin(clubId!) && (
          <div className="mb-6">
            <Button
              onClick={() => navigate(`/clubs/${clubId}/channels/create`)}
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
    );
  };
  
  // Render members tab
  const renderMembersTab = () => {
    return (
      <div>
        {loadingMembers ? (
          <div className="flex items-center justify-center py-12">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
          </div>
        ) : members.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-12 text-muted-foreground">
            <Users size={64} className="mb-4" />
            <h3 className="text-lg font-medium">No members yet</h3>
            <p>Be the first to join this club!</p>
          </div>
        ) : (
          <div className="space-y-2">
            {members.map(member => (
              <div 
                key={member.id} 
                className="flex items-center p-3 hover:bg-muted rounded-lg transition-colors"
              >
                <Avatar className="mr-3">
                  <AvatarImage src={member.profile?.avatar_url} />
                  <AvatarFallback>
                    {member.profile?.display_name?.charAt(0) || 'U'}
                  </AvatarFallback>
                </Avatar>
                
                <div className="flex-1">
                  <p className="font-medium">
                    {member.profile?.display_name || 'Unknown User'}
                  </p>
                  <p className="text-sm text-muted-foreground capitalize">
                    {member.role}
                  </p>
                </div>
                
                {member.role === 'admin' && (
                  <Badge variant="secondary">Admin</Badge>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    );
  };
  
  // Create Post Dialog
  const renderCreatePostDialog = () => (
    <Dialog open={showCreatePostDialog} onOpenChange={setShowCreatePostDialog}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Create Post</DialogTitle>
        </DialogHeader>
        
        <div className="py-4">
          <Textarea
            placeholder="What's on your mind?"
            value={newPostContent}
            onChange={(e) => setNewPostContent(e.target.value)}
            rows={5}
            className="resize-none"
          />
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
  );
  
  if (!currentClub) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
      </div>
    );
  }
  
  return (
    <div className="container mx-auto max-w-4xl px-4 py-6">
      <div className="mb-6">
        <Button
          variant="ghost"
          onClick={() => navigate('/clubs')}
          className="flex items-center mb-4"
        >
          <ArrowLeft size={18} className="mr-2" />
          Back to Clubs
        </Button>
      </div>
      
      <div className="bg-card rounded-lg shadow overflow-hidden">
        {renderClubHeader()}
        
        <div className="px-6 pb-6">
          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="grid w-full grid-cols-4 mb-6">
              <TabsTrigger value="feed" className="flex items-center gap-2">
                <FileText size={16} />
                <span>Feed</span>
              </TabsTrigger>
              <TabsTrigger value="events" className="flex items-center gap-2">
                <Calendar size={16} />
                <span>Events</span>
              </TabsTrigger>
              <TabsTrigger value="channels" className="flex items-center gap-2">
                <MessageSquare size={16} />
                <span>Channels</span>
              </TabsTrigger>
              <TabsTrigger value="members" className="flex items-center gap-2">
                <Users size={16} />
                <span>Members</span>
              </TabsTrigger>
            </TabsList>
            
            <TabsContent value="feed">
              {renderFeedTab()}
            </TabsContent>
            
            <TabsContent value="events">
              {renderEventsTab()}
            </TabsContent>
            
            <TabsContent value="channels">
              {renderChannelsTab()}
            </TabsContent>
            
            <TabsContent value="members">
              {renderMembersTab()}
            </TabsContent>
          </Tabs>
        </div>
      </div>
      
      {renderCreatePostDialog()}
    </div>
  );
};

export default ClubDetailPage;
