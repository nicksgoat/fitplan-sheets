
import React from 'react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { formatRelativeTime } from '@/utils/timeUtils';
import { ClubPostComment as ClubPostCommentType } from '@/types/club';

interface ClubPostCommentProps {
  comment: ClubPostCommentType;
}

const ClubPostComment: React.FC<ClubPostCommentProps> = ({ comment }) => {
  return (
    <div className="flex gap-2">
      <Avatar className="h-8 w-8">
        <AvatarImage src={comment.profile?.avatar_url || undefined} />
        <AvatarFallback>
          {comment.profile?.display_name?.charAt(0) || 
           comment.profile?.username?.charAt(0) || 'U'}
        </AvatarFallback>
      </Avatar>
      <div className="flex-1 bg-muted p-2 rounded-md">
        <div className="flex items-center gap-2">
          <p className="text-sm font-medium">
            {comment.profile?.display_name || 
             comment.profile?.username || 'Unknown User'}
          </p>
          <span className="text-xs text-muted-foreground">
            {formatRelativeTime(comment.created_at)}
          </span>
        </div>
        <p className="text-sm">{comment.content}</p>
      </div>
    </div>
  );
};

export default ClubPostComment;
