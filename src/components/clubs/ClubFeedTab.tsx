
import React from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { FileText, Heart, MessageCircle, Share2, PlusCircle } from 'lucide-react';
import { format, formatDistanceToNow } from 'date-fns';

interface ClubFeedTabProps {
  posts: any[];
  isUserClubMember: boolean;
  loadingPosts: boolean;
  onCreatePost: () => void;
}

const ClubFeedTab: React.FC<ClubFeedTabProps> = ({
  posts,
  isUserClubMember,
  loadingPosts,
  onCreatePost
}) => {
  if (loadingPosts) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
      </div>
    );
  }

  // Helper function to format relative time (replacing the import)
  const formatRelativeTime = (dateString: string) => {
    try {
      return formatDistanceToNow(new Date(dateString), { addSuffix: true });
    } catch (e) {
      return "Unknown time";
    }
  };

  return (
    <div>
      {isUserClubMember && (
        <div className="mb-6">
          <Button
            onClick={onCreatePost}
            variant="outline"
            className="w-full flex items-center gap-2 h-auto py-3 justify-start"
          >
            <PlusCircle size={20} />
            <span>Create Post</span>
          </Button>
        </div>
      )}

      {posts.length === 0 ? (
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

export default ClubFeedTab;
