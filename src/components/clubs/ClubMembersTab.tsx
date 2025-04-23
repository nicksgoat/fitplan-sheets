
import React, { useState } from 'react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Users, Search, Filter } from 'lucide-react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import ClubMemberItem from './ClubMemberItem';
import { ClubMember } from '@/types/club';

interface ClubMembersTabProps {
  members: ClubMember[];
  loadingMembers: boolean;
  isAdmin: boolean;
  currentUserRole: string;
  clubId: string;
  onRefresh: () => void;
}

const ClubMembersTab: React.FC<ClubMembersTabProps> = ({
  members,
  loadingMembers,
  isAdmin,
  currentUserRole,
  clubId,
  onRefresh
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [roleFilter, setRoleFilter] = useState<string>('all');
  const [membershipFilter, setMembershipFilter] = useState<string>('all');

  // Filter members based on search and filters
  const filteredMembers = members.filter(member => {
    const matchesSearch = !searchQuery || 
      member.profile?.display_name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      member.profile?.username?.toLowerCase().includes(searchQuery.toLowerCase());
      
    const matchesRole = roleFilter === 'all' || member.role === roleFilter;
    const matchesMembership = membershipFilter === 'all' || member.membership_type === membershipFilter;
    
    return matchesSearch && matchesRole && matchesMembership;
  });
  
  // Sort members by role (admin/moderator first, then members)
  const sortedMembers = [...filteredMembers].sort((a, b) => {
    const roleOrder = { owner: 0, admin: 1, moderator: 2, member: 3 };
    return (roleOrder[a.role as keyof typeof roleOrder] || 4) - 
           (roleOrder[b.role as keyof typeof roleOrder] || 4);
  });

  if (loadingMembers) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
      </div>
    );
  }

  return (
    <div>
      {/* Search and filter bar */}
      <div className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between mb-6">
        <div className="relative w-full md:w-96">
          <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search members..."
            className="pl-8"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
        
        <div className="flex gap-2 flex-col sm:flex-row">
          <div className="w-full sm:w-40">
            <Select value={roleFilter} onValueChange={setRoleFilter}>
              <SelectTrigger>
                <SelectValue placeholder="Role" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Roles</SelectItem>
                <SelectItem value="owner">Owner</SelectItem>
                <SelectItem value="admin">Admin</SelectItem>
                <SelectItem value="moderator">Moderator</SelectItem>
                <SelectItem value="member">Member</SelectItem>
              </SelectContent>
            </Select>
          </div>
          
          <div className="w-full sm:w-40">
            <Select value={membershipFilter} onValueChange={setMembershipFilter}>
              <SelectTrigger>
                <SelectValue placeholder="Membership" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Memberships</SelectItem>
                <SelectItem value="free">Free</SelectItem>
                <SelectItem value="premium">Premium</SelectItem>
                <SelectItem value="vip">VIP</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      </div>

      {/* Members list */}
      {sortedMembers.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-12 text-muted-foreground">
          <Users size={64} className="mb-4" />
          <h3 className="text-lg font-medium">No members found</h3>
          {searchQuery || roleFilter !== 'all' || membershipFilter !== 'all' ? (
            <p>Try changing your search or filters</p>
          ) : (
            <p>Invite people to join this club!</p>
          )}
        </div>
      ) : (
        <div className="space-y-2">
          {sortedMembers.map(member => (
            <ClubMemberItem
              key={member.id}
              member={member}
              isAdmin={isAdmin}
              currentUserRole={currentUserRole}
              clubId={clubId}
              onMemberUpdated={onRefresh}
            />
          ))}
          
          <div className="py-2 text-sm text-center text-muted-foreground">
            Showing {sortedMembers.length} of {members.length} members
          </div>
        </div>
      )}
    </div>
  );
};

export default ClubMembersTab;
