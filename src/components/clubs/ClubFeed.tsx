
import React from 'react';
import { formatRelativeTime } from '@/utils/timeUtils';
import { ClubPost } from '@/types/club';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { MessageSquare, Heart } from 'lucide-react';
import ClubPostComment from './ClubPostComment';

interface ClubFeedProps {
  posts: ClubPost[];
}

export function ClubFeed({ posts }: ClubFeedProps) {
  return (
    <div className="space-y-6">
      {posts.length === 0 ? (
        <div className="text-center p-8">
          <p className="text-muted-foreground">No posts yet. Be the first to post!</p>
        </div>
      ) : (
        posts.map((post) => (
          <Card key={post.id} className="p-4">
            <div className="flex items-start gap-3">
              <Avatar className="h-10 w-10">
                <AvatarImage src={post.profile?.avatar_url || ''} />
                <AvatarFallback>
                  {post.profile?.display_name?.[0] || 
                   post.profile?.username?.[0] || 'U'}
                </AvatarFallback>
              </Avatar>
              <div className="flex-1">
                <div className="flex justify-between">
                  <div>
                    <p className="font-medium">
                      {post.profile?.display_name || 
                       post.profile?.username || 'Unknown User'}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {formatRelativeTime(post.created_at)}
                    </p>
                  </div>
                </div>
                <p className="mt-2 text-sm">{post.content}</p>
                
                {post.image_url && (
                  <div className="mt-3">
                    <img 
                      src={post.image_url} 
                      alt="Post"
                      className="rounded-md w-full max-h-80 object-cover"
                    />
                  </div>
                )}
                
                {post.workout_id && post.workout && (
                  <div className="mt-3 p-3 bg-muted rounded-md">
                    <p className="text-sm font-medium">
                      Workout: {post.workout?.name || 'Unknown Workout'}
                    </p>
                    {post.workout?.description && (
                      <p className="text-xs text-muted-foreground">
                        {post.workout.description}
                      </p>
                    )}
                  </div>
                )}
                
                <div className="flex gap-4 mt-4">
                  <Button variant="ghost" size="sm" className="text-muted-foreground">
                    <Heart className="h-4 w-4 mr-1" />
                    Like
                  </Button>
                  <Button variant="ghost" size="sm" className="text-muted-foreground">
                    <MessageSquare className="h-4 w-4 mr-1" />
                    Comment
                  </Button>
                </div>
                
                {post.comments && post.comments.length > 0 && (
                  <div className="mt-4 space-y-3 pl-3 border-l-2">
                    {post.comments.map((comment) => (
                      <ClubPostComment key={comment.id} comment={comment} />
                    ))}
                  </div>
                )}
              </div>
            </div>
          </Card>
        ))
      )}
    </div>
  );
}

export default ClubFeed;
