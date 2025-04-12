
import React, { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { Club } from '@/types/club';
import { Button } from '@/components/ui/button';
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from '@/components/ui/table';
import { 
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger
} from '@/components/ui/dropdown-menu';
import { 
  CircleDollarSign, 
  Edit, 
  PlusCircle,
  MoreHorizontal, 
  Loader2, 
  User, 
  Calendar,
  ArrowUpDown
} from 'lucide-react';
import { toast } from 'sonner';
import { Badge } from '@/components/ui/badge';
import { Link } from 'react-router-dom';

const ClubsManagement = () => {
  const { user } = useAuth();
  const [clubs, setClubs] = useState<Club[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [sortBy, setSortBy] = useState<'name' | 'members' | 'date'>('date');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');
  const [clubStats, setClubStats] = useState<{[key: string]: {members: number, events: number}}>({});
  
  useEffect(() => {
    if (!user) return;
    
    const fetchClubs = async () => {
      setIsLoading(true);
      try {
        // Fetch clubs created by user
        const { data, error } = await supabase
          .from('clubs')
          .select('*')
          .eq('creator_id', user.id);
          
        if (error) throw error;
        setClubs(data || []);
        
        // Fetch membership stats for each club
        const stats: {[key: string]: {members: number, events: number}} = {};
        
        for (const club of (data || [])) {
          // Get members count
          const { count: membersCount, error: membersError } = await supabase
            .from('club_members')
            .select('*', { count: 'exact', head: true })
            .eq('club_id', club.id);
            
          // Get events count  
          const { count: eventsCount, error: eventsError } = await supabase
            .from('club_events')
            .select('*', { count: 'exact', head: true })
            .eq('club_id', club.id);
            
          if (!membersError && !eventsError) {
            stats[club.id] = {
              members: membersCount || 0,
              events: eventsCount || 0
            };
          }
        }
        
        setClubStats(stats);
      } catch (error) {
        console.error('Error fetching clubs:', error);
        toast.error('Failed to load clubs');
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchClubs();
  }, [user]);

  const handleToggleSort = (column: 'name' | 'members' | 'date') => {
    if (sortBy === column) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortBy(column);
      setSortOrder('asc');
    }
  };
  
  // Sort clubs based on current sort settings
  const sortedClubs = [...clubs].sort((a, b) => {
    if (sortBy === 'name') {
      return sortOrder === 'asc' 
        ? a.name.localeCompare(b.name) 
        : b.name.localeCompare(a.name);
    } else if (sortBy === 'members') {
      const membersA = clubStats[a.id]?.members || 0;
      const membersB = clubStats[b.id]?.members || 0;
      return sortOrder === 'asc' 
        ? membersA - membersB
        : membersB - membersA;
    } else {
      return sortOrder === 'asc' 
        ? new Date(a.created_at).getTime() - new Date(b.created_at).getTime() 
        : new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
    }
  });

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString();
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-48">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (!clubs.length) {
    return (
      <div className="text-center py-12">
        <h3 className="font-medium text-lg mb-2">No clubs available</h3>
        <p className="text-muted-foreground mb-6">
          Create a club to start building your community and offering memberships
        </p>
        <Button asChild>
          <Link to="/clubs/create">
            <PlusCircle className="h-5 w-5 mr-2" />
            Create New Club
          </Link>
        </Button>
      </div>
    );
  }

  return (
    <div>
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-6">
        <h2 className="text-xl font-semibold">Clubs Management</h2>
        <Button asChild className="mt-2 sm:mt-0">
          <Link to="/clubs/create">
            <PlusCircle className="h-5 w-5 mr-2" />
            Create New Club
          </Link>
        </Button>
      </div>

      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-[300px]">
                <Button 
                  variant="ghost" 
                  onClick={() => handleToggleSort('name')}
                  className="flex items-center gap-1 hover:bg-transparent p-0 h-auto font-medium"
                >
                  Club Name
                  <ArrowUpDown className="h-4 w-4" />
                </Button>
              </TableHead>
              <TableHead>Membership</TableHead>
              <TableHead>
                <Button 
                  variant="ghost" 
                  onClick={() => handleToggleSort('members')}
                  className="flex items-center gap-1 hover:bg-transparent p-0 h-auto font-medium"
                >
                  Members
                  <ArrowUpDown className="h-4 w-4" />
                </Button>
              </TableHead>
              <TableHead>Events</TableHead>
              <TableHead>
                <Button 
                  variant="ghost" 
                  onClick={() => handleToggleSort('date')}
                  className="flex items-center gap-1 hover:bg-transparent p-0 h-auto font-medium"
                >
                  Created
                  <ArrowUpDown className="h-4 w-4" />
                </Button>
              </TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {sortedClubs.map((club) => (
              <TableRow key={club.id}>
                <TableCell className="font-medium">{club.name}</TableCell>
                <TableCell>
                  {club.membership_type === 'premium' ? (
                    <Badge className="bg-fitbloom-purple">Premium</Badge>
                  ) : (
                    <Badge variant="outline">Free</Badge>
                  )}
                </TableCell>
                <TableCell>
                  <div className="flex items-center">
                    <User className="h-4 w-4 mr-1.5 text-muted-foreground" />
                    {clubStats[club.id]?.members || 0}
                  </div>
                </TableCell>
                <TableCell>
                  <div className="flex items-center">
                    <Calendar className="h-4 w-4 mr-1.5 text-muted-foreground" />
                    {clubStats[club.id]?.events || 0}
                  </div>
                </TableCell>
                <TableCell>{formatDate(club.created_at)}</TableCell>
                <TableCell className="text-right">
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" className="h-8 w-8 p-0">
                        <span className="sr-only">Open menu</span>
                        <MoreHorizontal className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem asChild>
                        <Link to={`/clubs/${club.id}`}>
                          <Edit className="h-4 w-4 mr-2" />
                          Manage Club
                        </Link>
                      </DropdownMenuItem>
                      <DropdownMenuItem asChild>
                        <Link to={`/clubs/${club.id}/events/create`}>
                          <Calendar className="h-4 w-4 mr-2" />
                          Create Event
                        </Link>
                      </DropdownMenuItem>
                      <DropdownMenuItem asChild>
                        <Link to={`/clubs/${club.id}`}>
                          <CircleDollarSign className="h-4 w-4 mr-2" />
                          Manage Memberships
                        </Link>
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
};

export default ClubsManagement;
