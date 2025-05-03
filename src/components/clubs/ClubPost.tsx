
import React, { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { Heart, MessageCircle, Share2 } from 'lucide-react';
import { formatRelativeTime } from '@/utils/timeUtils';
import { Textarea } from '@/components/ui/textarea';
import { toast } from 'sonner';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { ClubPost as ClubPostType, ClubPostComment } from '@/types/club';

interface ClubPostProps {
  post: ClubPostType;
  onCommentAdded: () => void;
  clubId: string;
}

const ClubPost: React.FC<ClubPostProps> = ({ post, onCommentAdded, clubId }) => {
  const [showComments, setShowComments] = useState(false);
  const [newComment, setNewComment] = useState('');
  const [submittingComment, setSubmittingComment] = useState(false);
  const [comments, setComments] = useState<ClubPostComment[]>(post.comments || []);
  const [liked, setLiked] = useState(false);
  const { user } = useAuth();

  const handleLike = () => {
    setLiked(!liked);
    // In a real implementation, this would call an API to record the like
    toast.success(liked ? 'Post unliked' : 'Post liked');
  };

  const loadComments = async () => {
    try {
      const { data, error } = await supabase
        .from('club_post_comments')
        .select(`
          id,
          post_id,
          content,
          user_id,
          created_at,
          updated_at,
          profiles:user_id (username, display_name, avatar_url)
        `)
        .eq('post_id', post.id)
        .order('created_at', { ascending: true });

      if (error) throw error;
      setComments(data || []);
      setShowComments(true);
    } catch (error) {
      console.error('Error loading comments:', error);
      toast.error('Failed to load comments');
    }
  };

  const handleToggleComments = () => {
    if (!showComments && comments.length === 0) {
      loadComments();
    } else {
      setShowComments(!showComments);
    }
  };

  const handleSubmitComment = async () => {
    if (!newComment.trim() || !user) return;

    try {
      setSubmittingComment(true);
      
      const { data, error } = await supabase
        .from('club_post_comments')
        .insert({
          post_id: post.id,
          user_id: user.id,
          content: newComment.trim()
        })
        .select(`
          id,
          post_id,
          content,
          user_id,
          created_at,
          updated_at,
          profiles:user_id (username, display_name, avatar_url)
        `)
        .single();

      if (error) throw error;
      
      // Add the new comment to the list
      setComments([...comments, data as ClubPostComment]);
      setNewComment('');
      onCommentAdded();
      
    } catch (error) {
      console.error('Error posting comment:', error);
      toast.error('Failed to post comment');
    } finally {
      setSubmittingComment(false);
    }
  };

  return (
    <Card className="overflow-hidden mb-4">
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
          <Button 
            variant="ghost" 
            size="sm" 
            className={`flex items-center gap-2 ${liked ? 'text-red-500' : ''}`}
            onClick={handleLike}
          >
            <Heart size={18} className={liked ? 'fill-current' : ''} />
            <span>Like</span>
          </Button>
          
          <Button 
            variant="ghost" 
            size="sm" 
            className="flex items-center gap-2"
            onClick={handleToggleComments}
          >
            <MessageCircle size={18} />
            <span>Comment {comments.length > 0 && `(${comments.length})`}</span>
          </Button>
          
          <Button variant="ghost" size="sm" className="flex items-center gap-2">
            <Share2 size={18} />
            <span>Share</span>
          </Button>
        </div>

        {showComments && (
          <div className="mt-4 space-y-4">
            <div className="space-y-4">
              {comments.map(comment => (
                <div key={comment.id} className="flex gap-2">
                  <Avatar className="h-8 w-8">
                    <AvatarImage src={comment.profile?.avatar_url} />
                    <AvatarFallback>
                      {comment.profile?.display_name?.charAt(0) || 'U'}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1 bg-muted p-2 rounded-md">
                    <div className="flex items-center gap-2">
                      <p className="text-sm font-medium">
                        {comment.profile?.display_name || 'Unknown User'}
                      </p>
                      <span className="text-xs text-muted-foreground">
                        {formatRelativeTime(comment.created_at)}
                      </span>
                    </div>
                    <p className="text-sm">{comment.content}</p>
                  </div>
                </div>
              ))}
            </div>
            
            {user && (
              <div className="flex gap-2 mt-2">
                <Avatar className="h-8 w-8">
                  <AvatarImage src={user.user_metadata?.avatar_url} />
                  <AvatarFallback>
                    {user.user_metadata?.name?.charAt(0) || user.email?.charAt(0) || 'U'}
                  </AvatarFallback>
                </Avatar>
                <div className="flex-1">
                  <Textarea 
                    placeholder="Write a comment..." 
                    className="resize-none min-h-[60px]"
                    value={newComment}
                    onChange={(e) => setNewComment(e.target.value)}
                  />
                  <Button 
                    size="sm" 
                    className="mt-2" 
                    onClick={handleSubmitComment}
                    disabled={!newComment.trim() || submittingComment}
                  >
                    {submittingComment ? 'Posting...' : 'Post'}
                  </Button>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </Card>
  );
};

export default ClubPost;
