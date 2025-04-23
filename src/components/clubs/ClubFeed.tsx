
import React, { useState } from 'react';
import { useClub } from '@/contexts/ClubContext';
import { useAuth } from '@/hooks/useAuth';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { formatDistanceToNow } from 'date-fns';
import { Send, Share2, MessageSquare, Loader2 } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogTitle,
} from '@/components/ui/dialog';
import { toast } from 'sonner';
import { ClubPost } from '@/types/club';
import { Skeleton } from '@/components/ui/skeleton';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

interface ClubFeedProps {
  clubId: string;
}

const ClubFeed: React.FC<ClubFeedProps> = ({ clubId }) => {
  const { posts, loadingPosts, createNewPost, removePost, isUserClubMember } = useClub();
  const { user } = useAuth();
  const [newPostContent, setNewPostContent] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [deletePostId, setDeletePostId] = useState<string | null>(null);
  const [showWorkoutPicker, setShowWorkoutPicker] = useState(false);
  const [selectedWorkoutId, setSelectedWorkoutId] = useState<string | null>(null);
  
  const isMember = isUserClubMember(clubId);

  // Fetch shared workouts for the club
  const { data: sharedWorkouts } = useQuery({
    queryKey: ['shared-workouts', clubId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('club_shared_workouts')
        .select(`
          workout_id,
          workouts (
            id,
            name,
            description
          )
        `)
        .eq('club_id', clubId);

      if (error) throw error;
      return data || [];
    },
    enabled: showWorkoutPicker,
  });
  
  const handleCreatePost = async () => {
    if (!user) {
      toast.error('You must be logged in to create posts');
      return;
    }
    
    if (!newPostContent.trim()) {
      toast.error('Post content cannot be empty');
      return;
    }
    
    try {
      setIsSubmitting(true);
      
      await createNewPost({
        club_id: clubId,
        content: newPostContent.trim(),
        workout_id: selectedWorkoutId
      });
      
      setNewPostContent('');
      setSelectedWorkoutId(null);
      toast.success('Post created successfully');
    } catch (error) {
      console.error('Error creating post:', error);
      toast.error('Failed to create post');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (loadingPosts) {
    return (
      <div className="space-y-6">
        {[...Array(3)].map((_, index) => (
          <Skeleton key={index} className="w-full h-[200px] rounded-lg" />
        ))}
      </div>
    );
  }
  
  return (
    <div className="space-y-6">
      {isMember && (
        <div className="bg-card rounded-lg p-4">
          <div className="flex items-start gap-4">
            <Avatar>
              <AvatarImage src={user?.user_metadata?.avatar_url} />
              <AvatarFallback>{user?.email?.charAt(0).toUpperCase()}</AvatarFallback>
            </Avatar>
            <div className="flex-1">
              <Textarea
                placeholder="What's on your mind?"
                value={newPostContent}
                onChange={e => setNewPostContent(e.target.value)}
                rows={3}
                className="mb-2 resize-none"
                disabled={isSubmitting}
              />
              <div className="flex justify-between items-center">
                <Button
                  variant="outline"
                  onClick={() => setShowWorkoutPicker(true)}
                  disabled={isSubmitting}
                >
                  <Share2 className="h-4 w-4 mr-2" />
                  Add Workout
                </Button>
                <Button
                  onClick={handleCreatePost}
                  disabled={isSubmitting || !newPostContent.trim()}
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      Posting...
                    </>
                  ) : (
                    <>
                      <Send className="h-4 w-4 mr-2" />
                      Post
                    </>
                  )}
                </Button>
              </div>
              {selectedWorkoutId && sharedWorkouts && (
                <div className="mt-2 p-2 bg-muted rounded-md">
                  <div className="flex items-center justify-between">
                    <span className="text-sm">
                      Selected workout: {
                        sharedWorkouts.find(w => w.workout_id === selectedWorkoutId)?.workouts?.name
                      }
                    </span>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setSelectedWorkoutId(null)}
                    >
                      ×
                    </Button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
      
      {posts.length === 0 ? (
        <div className="text-center py-8 bg-card rounded-lg">
          <p className="text-muted-foreground">No posts yet. Be the first to share something!</p>
        </div>
      ) : (
        <div className="space-y-4">
          {posts.map((post) => (
            <ClubPost 
              key={post.id} 
              post={post}
              currentUserId={user?.id}
              onDelete={() => setDeletePostId(post.id)}
            />
          ))}
        </div>
      )}
      
      {/* Workout picker dialog */}
      <Dialog open={showWorkoutPicker} onOpenChange={setShowWorkoutPicker}>
        <DialogContent>
          <DialogTitle>Select a Workout to Share</DialogTitle>
          <div className="space-y-4 my-4">
            {sharedWorkouts?.map((workoutShare) => (
              <div
                key={workoutShare.workout_id}
                className={`p-4 rounded-lg border cursor-pointer transition-colors ${
                  selectedWorkoutId === workoutShare.workout_id
                    ? 'bg-primary/10 border-primary'
                    : 'hover:bg-muted'
                }`}
                onClick={() => {
                  setSelectedWorkoutId(workoutShare.workout_id);
                  setShowWorkoutPicker(false);
                }}
              >
                <h4 className="font-medium">{workoutShare.workouts?.name}</h4>
                {workoutShare.workouts?.description && (
                  <p className="text-sm text-muted-foreground mt-1">
                    {workoutShare.workouts.description}
                  </p>
                )}
              </div>
            ))}
            {(!sharedWorkouts || sharedWorkouts.length === 0) && (
              <p className="text-center text-muted-foreground py-4">
                No workouts have been shared with this club yet.
              </p>
            )}
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowWorkoutPicker(false)}>
              Cancel
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete confirmation dialog */}
      <Dialog open={!!deletePostId} onOpenChange={(open) => !open && setDeletePostId(null)}>
        <DialogContent>
          <DialogTitle>Delete Post</DialogTitle>
          <p className="text-muted-foreground">
            Are you sure you want to delete this post? This action cannot be undone.
          </p>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDeletePostId(null)}>
              Cancel
            </Button>
            <Button 
              variant="destructive" 
              onClick={async () => {
                if (deletePostId) {
                  await removePost(deletePostId);
                  setDeletePostId(null);
                }
              }}
            >
              Delete
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default ClubFeed;
