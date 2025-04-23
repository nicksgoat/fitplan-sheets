
import React, { useState } from 'react';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { MoreHorizontal, Shield, ShieldAlert, UserX, Crown } from 'lucide-react';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';
import { ClubMember } from '@/types/club';
import { formatRelativeTime } from '@/utils/timeUtils';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '@/components/ui/alert-dialog';

interface ClubMemberItemProps {
  member: ClubMember;
  isAdmin: boolean;
  currentUserRole: string;
  clubId: string;
  onMemberUpdated: () => void;
}

const ClubMemberItem: React.FC<ClubMemberItemProps> = ({
  member,
  isAdmin,
  currentUserRole,
  clubId,
  onMemberUpdated
}) => {
  const [showRemoveDialog, setShowRemoveDialog] = useState(false);
  const [updatingMember, setUpdatingMember] = useState(false);

  const canManageMember = isAdmin && (
    currentUserRole === 'admin' ||
    currentUserRole === 'owner' ||
    (currentUserRole === 'moderator' && member.role !== 'admin' && member.role !== 'owner')
  );

  const getRoleIcon = (role: string) => {
    switch (role) {
      case 'admin': return <Crown className="h-4 w-4 text-yellow-500" />;
      case 'moderator': return <Shield className="h-4 w-4 text-blue-500" />;
      case 'owner': return <ShieldAlert className="h-4 w-4 text-purple-500" />;
      default: return null;
    }
  };

  const handleUpdateMemberRole = async (newRole: string) => {
    try {
      setUpdatingMember(true);
      
      const { error } = await supabase
        .from('club_members')
        .update({ role: newRole })
        .eq('club_id', clubId)
        .eq('user_id', member.user_id);
        
      if (error) throw error;
      
      toast.success(`Member role updated to ${newRole}`);
      onMemberUpdated();
    } catch (error) {
      console.error('Error updating member role:', error);
      toast.error('Failed to update member role');
    } finally {
      setUpdatingMember(false);
    }
  };

  const handleRemoveMember = async () => {
    try {
      setUpdatingMember(true);
      
      const { error } = await supabase
        .from('club_members')
        .delete()
        .eq('club_id', clubId)
        .eq('user_id', member.user_id);
        
      if (error) throw error;
      
      toast.success('Member removed from club');
      onMemberUpdated();
    } catch (error) {
      console.error('Error removing member:', error);
      toast.error('Failed to remove member');
    } finally {
      setUpdatingMember(false);
      setShowRemoveDialog(false);
    }
  };

  return (
    <>
      <div className="flex items-center justify-between p-3 hover:bg-muted rounded-lg transition-colors">
        <div className="flex items-center">
          <Avatar className="mr-3">
            <AvatarImage src={member.profile?.avatar_url} />
            <AvatarFallback>
              {member.profile?.display_name?.charAt(0) || 'U'}
            </AvatarFallback>
          </Avatar>
          
          <div>
            <div className="flex items-center gap-2">
              <p className="font-medium">
                {member.profile?.display_name || 'Unknown User'}
              </p>
              {getRoleIcon(member.role)}
            </div>
            
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <span className="capitalize">{member.role}</span>
              <span>•</span>
              <span>Joined {formatRelativeTime(member.joined_at)}</span>
            </div>
          </div>
        </div>
        
        <div className="flex items-center gap-2">
          {member.membership_type !== 'free' && (
            <Badge variant="secondary" className="capitalize">
              {member.membership_type}
            </Badge>
          )}
          
          {canManageMember && (
            <DropdownMenu>
              <DropdownMenuTrigger asChild disabled={updatingMember}>
                <Button variant="ghost" size="icon">
                  <MoreHorizontal className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                {member.role !== 'admin' && member.role !== 'owner' && (
                  <DropdownMenuItem onClick={() => handleUpdateMemberRole('admin')}>
                    Make Admin
                  </DropdownMenuItem>
                )}
                
                {member.role !== 'moderator' && member.role !== 'admin' && member.role !== 'owner' && (
                  <DropdownMenuItem onClick={() => handleUpdateMemberRole('moderator')}>
                    Make Moderator
                  </DropdownMenuItem>
                )}
                
                {(member.role === 'admin' || member.role === 'moderator') && (
                  <DropdownMenuItem onClick={() => handleUpdateMemberRole('member')}>
                    Remove Privileges
                  </DropdownMenuItem>
                )}
                
                <DropdownMenuItem 
                  className="text-red-500"
                  onClick={() => setShowRemoveDialog(true)}
                >
                  <UserX className="h-4 w-4 mr-2" />
                  Remove from Club
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          )}
        </div>
      </div>
      
      <AlertDialog open={showRemoveDialog} onOpenChange={setShowRemoveDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Remove Member</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to remove this member from the club?
              This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleRemoveMember} className="bg-red-600">
              Remove
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
};

export default ClubMemberItem;
