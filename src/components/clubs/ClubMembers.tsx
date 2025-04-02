
import React, { useState } from 'react';
import { useClub } from '@/contexts/ClubContext';
import { useAuth } from '@/hooks/useAuth';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { formatDistanceToNow } from 'date-fns';
import { Skeleton } from '@/components/ui/skeleton';
import { ChevronDown, UserPlus, MoreVertical } from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { ClubMember, MemberRole } from '@/types/club';
import { toast } from 'sonner';

interface ClubMembersProps {
  clubId: string;
}

const ClubMembers: React.FC<ClubMembersProps> = ({ clubId }) => {
  const { members, loadingMembers, updateMemberRole, isUserClubCreator } = useClub();
  const { user } = useAuth();
  
  const isCreator = isUserClubCreator(clubId);
  
  const formatDate = (dateString: string) => {
    try {
      return formatDistanceToNow(new Date(dateString), { addSuffix: true });
    } catch (e) {
      return "Unknown";
    }
  };
  
  const adminMembers = members.filter(member => member.role === 'admin');
  const moderatorMembers = members.filter(member => member.role === 'moderator');
  const regularMembers = members.filter(member => member.role === 'member');
  
  if (loadingMembers) {
    return (
      <div className="space-y-4">
        {[...Array(5)].map((_, index) => (
          <div key={index} className="flex items-center justify-between p-3 bg-dark-300 rounded-lg">
            <div className="flex items-center space-x-3">
              <Skeleton className="h-10 w-10 rounded-full bg-dark-400" />
              <div>
                <Skeleton className="h-4 w-24 bg-dark-400" />
                <Skeleton className="h-3 w-16 mt-1 bg-dark-400" />
              </div>
            </div>
            <Skeleton className="h-8 w-20 bg-dark-400" />
          </div>
        ))}
      </div>
    );
  }
  
  return (
    <div className="space-y-6">
      {/* Club Owner/Admin Section */}
      {adminMembers.length > 0 && (
        <div>
          <h3 className="text-md font-semibold mb-2">Admins</h3>
          <div className="space-y-2">
            {adminMembers.map(member => (
              <MemberItem 
                key={member.id} 
                member={member} 
                canModify={isCreator} 
                formatDate={formatDate}
                onUpdateRole={(role) => updateMemberRole(member.id, role)}
              />
            ))}
          </div>
        </div>
      )}
      
      {/* Moderators Section */}
      {moderatorMembers.length > 0 && (
        <div>
          <h3 className="text-md font-semibold mb-2">Moderators</h3>
          <div className="space-y-2">
            {moderatorMembers.map(member => (
              <MemberItem 
                key={member.id} 
                member={member} 
                canModify={isCreator} 
                formatDate={formatDate}
                onUpdateRole={(role) => updateMemberRole(member.id, role)}
              />
            ))}
          </div>
        </div>
      )}
      
      {/* Regular Members Section */}
      <div>
        <h3 className="text-md font-semibold mb-2">Members</h3>
        {regularMembers.length === 0 ? (
          <div className="text-center py-6 bg-dark-300 rounded-lg">
            <p className="text-gray-400">No members found</p>
          </div>
        ) : (
          <div className="space-y-2">
            {regularMembers.map(member => (
              <MemberItem 
                key={member.id} 
                member={member} 
                canModify={isCreator || adminMembers.some(m => m.userId === user?.id)} 
                formatDate={formatDate}
                onUpdateRole={(role) => updateMemberRole(member.id, role)}
              />
            ))}
          </div>
        )}
      </div>
      
      <div className="flex justify-center pt-4">
        <Button variant="outline" className="w-full">
          <UserPlus className="h-4 w-4 mr-2" />
          Invite Members
        </Button>
      </div>
    </div>
  );
};

interface MemberItemProps {
  member: ClubMember;
  canModify: boolean;
  formatDate: (date: string) => string;
  onUpdateRole: (role: MemberRole) => Promise<void>;
}

const MemberItem: React.FC<MemberItemProps> = ({ member, canModify, formatDate, onUpdateRole }) => {
  const [isLoading, setIsLoading] = useState(false);
  
  const handleRoleChange = async (role: MemberRole) => {
    try {
      setIsLoading(true);
      await onUpdateRole(role);
      toast.success(`Updated member role to ${role}`);
    } catch (error) {
      console.error('Error updating role:', error);
      toast.error('Failed to update member role');
    } finally {
      setIsLoading(false);
    }
  };
  
  const getRoleBadgeColor = (role: string) => {
    switch (role) {
      case 'admin':
        return 'bg-red-500';
      case 'moderator':
        return 'bg-amber-500';
      default:
        return 'bg-gray-500';
    }
  };
  
  return (
    <div className="flex items-center justify-between p-3 bg-dark-300 rounded-lg hover:bg-dark-300/80 transition-colors">
      <div className="flex items-center space-x-3">
        <Avatar>
          <AvatarImage src={member.profile?.avatar_url} />
          <AvatarFallback>
            {member.profile?.display_name?.charAt(0) || 
             member.profile?.username?.charAt(0) || '?'}
          </AvatarFallback>
        </Avatar>
        <div>
          <div className="flex items-center">
            <span className="font-medium">
              {member.profile?.display_name || member.profile?.username || 'Unknown User'}
            </span>
            <Badge className={`ml-2 ${getRoleBadgeColor(member.role)}`}>
              {member.role}
            </Badge>
          </div>
          <p className="text-xs text-gray-400">Joined {formatDate(member.joinedAt)}</p>
        </div>
      </div>
      
      {canModify && member.role !== 'admin' && (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button 
              variant="ghost" 
              size="sm"
              className="h-8 w-8 p-0"
              disabled={isLoading}
            >
              <MoreVertical className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="bg-dark-200 border-dark-300">
            <DropdownMenuItem onClick={() => handleRoleChange('admin')}>
              Make Admin
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => handleRoleChange(member.role === 'moderator' ? 'member' : 'moderator')}>
              {member.role === 'moderator' ? 'Remove Moderator' : 'Make Moderator'}
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      )}
    </div>
  );
};

export default ClubMembers;
