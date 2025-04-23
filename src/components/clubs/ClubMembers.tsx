
import React from 'react';
import { useClub } from '@/contexts/ClubContext';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { MemberRole } from '@/types/club';

export function ClubMembers() {
  const { members, updateMemberRole, refreshMembers } = useClub();

  const handlePromoteToModerator = async (memberId: string) => {
    try {
      await updateMemberRole(memberId, 'moderator');
      toast.success('User promoted to moderator');
      refreshMembers();
    } catch (error) {
      toast.error('Failed to update role');
    }
  };

  const handlePromoteToAdmin = async (memberId: string) => {
    try {
      await updateMemberRole(memberId, 'admin');
      toast.success('User promoted to admin');
      refreshMembers();
    } catch (error) {
      toast.error('Failed to update role');
    }
  };

  const handleDemote = async (memberId: string) => {
    try {
      await updateMemberRole(memberId, 'member');
      toast.success('User role updated');
      refreshMembers();
    } catch (error) {
      toast.error('Failed to update role');
    }
  };

  return (
    <div className="space-y-6">
      <h3 className="text-xl font-semibold">Club Members ({members.length})</h3>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {members.map((member) => (
          <Card key={member.id}>
            <CardHeader className="pb-2">
              <div className="flex justify-between items-start">
                <div className="flex items-center space-x-3">
                  <Avatar>
                    <AvatarImage src={member.profile?.avatar_url || ''} alt={member.profile?.display_name || ''} />
                    <AvatarFallback>
                      {member.profile?.display_name?.[0] || member.profile?.username?.[0] || 'U'}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <CardTitle className="text-base">
                      {member.profile?.display_name || member.profile?.username || 'Unknown User'}
                    </CardTitle>
                    <p className="text-xs text-muted-foreground capitalize">{member.role}</p>
                  </div>
                </div>
                <div className="px-2 py-1 rounded-full text-xs bg-green-500/20 text-green-500">
                  {member.status}
                </div>
              </div>
            </CardHeader>
            
            <CardContent className="pb-1">
              <p className="text-sm">Joined: {new Date(member.joined_at).toLocaleDateString()}</p>
              <p className="text-xs capitalize">
                Membership: <span className="font-medium">{member.membership_type}</span>
              </p>
            </CardContent>
            
            <CardFooter className="pt-2 flex flex-wrap gap-2">
              {member.role !== 'moderator' && member.role !== 'admin' && (
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => handlePromoteToModerator(member.id)}
                  className="text-xs flex-1"
                >
                  Promote to Mod
                </Button>
              )}
              
              {member.role !== 'admin' && (
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => handlePromoteToAdmin(member.id)}
                  className="text-xs flex-1"
                >
                  Make Admin
                </Button>
              )}
              
              {(member.role === 'moderator' || member.role === 'admin') && (
                <Button
                  size="sm"
                  variant="destructive"
                  onClick={() => handleDemote(member.id)}
                  className="text-xs flex-1"
                >
                  Demote
                </Button>
              )}
            </CardFooter>
          </Card>
        ))}
      </div>
    </div>
  );
}

export default ClubMembers;
