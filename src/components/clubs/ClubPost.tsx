
import React, { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { MessageSquare, Share2 } from 'lucide-react';
import { formatRelativeTime } from '@/utils/timeUtils';
import { Textarea } from '@/components/ui/textarea';
import { toast } from 'sonner';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { ClubPost as ClubPostType } from '@/types/club';
import { Badge } from '@/components/ui/badge';
import { useNavigate } from 'react-router-dom';

interface ClubPostProps {
  post: ClubPostType;
  currentUserId?: string;
  onDelete: () => void;
}

const ClubPost: React.FC<ClubPostProps> = ({ post, currentUserId, onDelete }) => {
  const [showComments, setShowComments] = useState(false);
  const [newComment, setNewComment] = useState('');
  const [submittingComment, setSubmittingComment] = useState(false);
  const { user } = useAuth();
  const navigate = useNavigate();

  const handleSubmitComment = async () => {
    if (!newComment.trim() || !user) return;

    try {
      setSubmittingComment(true);
      
      const { error } = await supabase
        .from('club_post_comments')
        .insert({
          post_id: post.id,
          user_id: user.id,
          content: newComment.trim()
        });

      if (error) throw error;
      
      setNewComment('');
      setShowComments(true);
      toast.success('Comment added');
      
    } catch (error) {
      console.error('Error posting comment:', error);
      toast.error('Failed to post comment');
    } finally {
      setSubmittingComment(false);
    }
  };

  return (
    <Card className="p-4">
      <div className="flex items-start gap-4 mb-4">
        <Avatar>
          <AvatarImage src={post.profile?.avatar_url} />
          <AvatarFallback>
            {post.profile?.display_name?.charAt(0) || 'U'}
          </AvatarFallback>
        </Avatar>
        <div className="flex-1">
          <div className="flex justify-between items-start">
            <div>
              <p className="font-medium">
                {post.profile?.display_name || 'Unknown User'}
              </p>
              <p className="text-sm text-muted-foreground">
                {formatRelativeTime(post.created_at)}
              </p>
            </div>
            {currentUserId === post.user_id && (
              <Button 
                variant="ghost" 
                size="sm"
                className="text-destructive hover:text-destructive"
                onClick={onDelete}
              >
                Delete
              </Button>
            )}
          </div>
          
          <p className="mt-2 whitespace-pre-wrap">{post.content}</p>
          
          {/* Workout Card */}
          {post.workout && (
            <div className="mt-4 p-4 border rounded-lg cursor-pointer hover:bg-accent/50 transition-colors"
                 onClick={() => navigate(`/workout/${post.workout_id}`)}>
              <div className="flex items-center justify-between mb-2">
                <h4 className="font-semibold">{post.workout.name}</h4>
                <Badge variant="secondary">Workout</Badge>
              </div>
              {post.workout.description && (
                <p className="text-sm text-muted-foreground">
                  {post.workout.description}
                </p>
              )}
            </div>
          )}
          
          <div className="flex items-center gap-4 mt-4">
            <Button 
              variant="ghost" 
              size="sm" 
              className="flex items-center gap-2"
              onClick={() => setShowComments(!showComments)}
            >
              <MessageSquare className="h-4 w-4" />
              Comment
            </Button>
            <Button variant="ghost" size="sm" className="flex items-center gap-2">
              <Share2 className="h-4 w-4" />
              Share
            </Button>
          </div>
          
          {showComments && (
            <div className="mt-4">
              <div className="flex gap-2">
                <Avatar className="h-8 w-8">
                  <AvatarImage src={user?.user_metadata?.avatar_url} />
                  <AvatarFallback>
                    {user?.user_metadata?.name?.charAt(0) || user?.email?.charAt(0) || 'U'}
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
            </div>
          )}
        </div>
      </div>
    </Card>
  );
};

export default ClubPost;
