
import React from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { FileText, PlusCircle } from 'lucide-react';
import ClubPost from './ClubPost';
import { ClubPost as ClubPostType } from '@/types/club';

interface ClubFeedTabProps {
  posts: ClubPostType[];
  isUserClubMember: boolean;
  loadingPosts: boolean;
  clubId: string;
  onCreatePost: () => void;
  onRefresh: () => void;
}

const ClubFeedTab: React.FC<ClubFeedTabProps> = ({
  posts,
  isUserClubMember,
  loadingPosts,
  clubId,
  onCreatePost,
  onRefresh
}) => {
  if (loadingPosts) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
      </div>
    );
  }

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
            <ClubPost 
              key={post.id} 
              post={post}
              onCommentAdded={onRefresh}
            />
          ))}
        </div>
      )}
    </div>
  );
};

export default ClubFeedTab;
