
import React, { useState } from 'react';
import { useClub } from '@/contexts/ClubContext';
import { useAuth } from '@/hooks/useAuth';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { formatDistanceToNow } from 'date-fns';
import { Send, MoreVertical, Trash2, MessageSquare, Share2, Loader2 } from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { toast } from 'sonner';
import { Dialog, DialogContent, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { ClubPost } from '@/types/club';
import { Skeleton } from '@/components/ui/skeleton';

interface ClubFeedProps {
  clubId: string;
}

const ClubFeed: React.FC<ClubFeedProps> = ({ clubId }) => {
  const { posts, loadingPosts, createNewPost, removePost, isUserClubMember } = useClub();
  const { user } = useAuth();
  const [newPostContent, setNewPostContent] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [deletePostId, setDeletePostId] = useState<string | null>(null);
  const [showComments, setShowComments] = useState<Record<string, boolean>>({});
  
  const isMember = isUserClubMember(clubId);
  
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
      console.log("Creating new post:", {
        club_id: clubId,
        user_id: user.id,
        content: newPostContent
      });
      
      await createNewPost({
        club_id: clubId,
        user_id: user.id,
        content: newPostContent
      });
      
      setNewPostContent('');
      toast.success('Post created successfully');
    } catch (error) {
      console.error('Error creating post:', error);
      toast.error('Failed to create post');
    } finally {
      setIsSubmitting(false);
    }
  };
  
  const handleDeletePost = async () => {
    if (!deletePostId) return;
    
    try {
      await removePost(deletePostId);
      setDeletePostId(null);
    } catch (error) {
      console.error('Error deleting post:', error);
    }
  };
  
  const toggleComments = (postId: string) => {
    setShowComments(prev => ({
      ...prev,
      [postId]: !prev[postId]
    }));
  };
  
  if (loadingPosts) {
    return (
      <div className="space-y-6">
        {[...Array(3)].map((_, index) => (
          <div key={index} className="bg-dark-300 rounded-lg p-4 space-y-4">
            <div className="flex items-center space-x-3">
              <Skeleton className="h-10 w-10 rounded-full bg-dark-400" />
              <div className="space-y-2">
                <Skeleton className="h-4 w-24 bg-dark-400" />
                <Skeleton className="h-3 w-16 bg-dark-400" />
              </div>
            </div>
            <div className="space-y-2">
              <Skeleton className="h-4 w-full bg-dark-400" />
              <Skeleton className="h-4 w-3/4 bg-dark-400" />
            </div>
          </div>
        ))}
      </div>
    );
  }
  
  return (
    <div className="space-y-6">
      {isMember && (
        <div className="bg-dark-300 rounded-lg p-4">
          <div className="flex items-start gap-4">
            <Avatar>
              <AvatarImage src={user?.user_metadata?.avatar_url} />
              <AvatarFallback>{user?.email?.charAt(0).toUpperCase()}</AvatarFallback>
            </Avatar>
            <div className="flex-1">
              <Textarea
                placeholder="Share an update with the club..."
                className="bg-dark-200 border-dark-400 mb-2"
                value={newPostContent}
                onChange={e => setNewPostContent(e.target.value)}
                rows={3}
                disabled={isSubmitting}
              />
              <div className="flex justify-end">
                <Button 
                  className="bg-fitbloom-purple hover:bg-fitbloom-purple/90"
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
            </div>
          </div>
        </div>
      )}
      
      {posts.length === 0 ? (
        <div className="text-center py-8 bg-dark-300 rounded-lg">
          <p className="text-gray-400">No posts yet. Be the first to share something!</p>
        </div>
      ) : (
        <div className="space-y-4">
          {posts.map((post) => (
            <PostItem 
              key={post.id} 
              post={post} 
              onDelete={() => setDeletePostId(post.id)}
              onToggleComments={() => toggleComments(post.id)}
              showComments={!!showComments[post.id]}
              currentUserId={user?.id}
            />
          ))}
        </div>
      )}
      
      <Dialog open={!!deletePostId} onOpenChange={(open) => !open && setDeletePostId(null)}>
        <DialogContent className="bg-dark-200 border-dark-300">
          <DialogTitle>Delete Post</DialogTitle>
          <DialogDescription className="text-gray-400">
            Are you sure you want to delete this post? This action cannot be undone.
          </DialogDescription>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDeletePostId(null)}>
              Cancel
            </Button>
            <Button 
              variant="destructive" 
              onClick={handleDeletePost}
            >
              Delete
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

interface PostItemProps {
  post: ClubPost;
  onDelete: () => void;
  onToggleComments: () => void;
  showComments: boolean;
  currentUserId?: string;
}

const PostItem: React.FC<PostItemProps> = ({ 
  post, 
  onDelete, 
  onToggleComments, 
  showComments,
  currentUserId 
}) => {
  const formatDate = (dateString: string) => {
    try {
      return formatDistanceToNow(new Date(dateString), { addSuffix: true });
    } catch (e) {
      return "Unknown";
    }
  };
  
  const isAuthor = currentUserId === post.user_id;
  
  return (
    <div className="bg-dark-300 rounded-lg p-4">
      <div className="flex items-start justify-between">
        <div className="flex items-start gap-3">
          <Avatar>
            <AvatarImage src={post.profile?.avatar_url} />
            <AvatarFallback>
              {post.profile?.display_name?.charAt(0) || post.profile?.username?.charAt(0) || '?'}
            </AvatarFallback>
          </Avatar>
          <div>
            <h3 className="font-medium">
              {post.profile?.display_name || post.profile?.username || 'Unknown User'}
            </h3>
            <p className="text-xs text-gray-400">{formatDate(post.created_at)}</p>
          </div>
        </div>
        
        {isAuthor && (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                <MoreVertical className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="bg-dark-200 border-dark-300">
              <DropdownMenuItem 
                className="text-red-500 focus:text-red-500 focus:bg-red-500/10"
                onClick={onDelete}
              >
                <Trash2 className="h-4 w-4 mr-2" />
                Delete
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        )}
      </div>
      
      <div className="mt-3 mb-3">
        <p className="whitespace-pre-wrap">{post.content}</p>
      </div>
      
      <div className="flex items-center justify-between border-t border-dark-400 pt-3">
        <Button variant="ghost" size="sm" onClick={onToggleComments}>
          <MessageSquare className="h-4 w-4 mr-2" />
          Comments
        </Button>
        
        <Button variant="ghost" size="sm">
          <Share2 className="h-4 w-4 mr-2" />
          Share
        </Button>
      </div>
      
      {showComments && (
        <div className="mt-4 pt-4 border-t border-dark-400">
          <p className="text-gray-400 text-sm text-center">Comments feature coming soon</p>
        </div>
      )}
    </div>
  );
};

export default ClubFeed;
