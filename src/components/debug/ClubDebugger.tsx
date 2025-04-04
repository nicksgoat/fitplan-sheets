
import React, { useState, useEffect } from 'react';
import { useClub } from '@/contexts/ClubContext';
import { useAuth } from '@/hooks/useAuth';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { supabase } from '@/integrations/supabase/client';
import { Loader2 } from 'lucide-react';

interface ClubDebuggerProps {
  clubId: string;
}

const ClubDebugger: React.FC<ClubDebuggerProps> = ({ clubId }) => {
  const { members, isUserClubMember, currentClub, refreshMembers, loadingMembers, posts, messages, events } = useClub();
  const { user } = useAuth();
  const [directMembershipCheck, setDirectMembershipCheck] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [edgeFunctionCheck, setEdgeFunctionCheck] = useState<any>(null);
  const [refreshing, setRefreshing] = useState(false);
  
  const checkMembership = async () => {
    if (!user || !clubId) return;
    
    setLoading(true);
    try {
      // Direct DB query check (will likely fail with RLS error)
      try {
        const { data, error } = await supabase
          .from('club_members')
          .select('*')
          .eq('club_id', clubId)
          .eq('user_id', user.id)
          .maybeSingle();
          
        setDirectMembershipCheck({ data, error: error?.message });
      } catch (error: any) {
        setDirectMembershipCheck({ error: error.message });
      }
      
      // Edge function check (should work)
      try {
        const { data, error } = await supabase.functions.invoke('run-sql-rpcs', {
          body: {
            sqlName: 'check_club_member',
            params: {
              club_id: clubId,
              user_id: user.id
            }
          }
        });
        
        setEdgeFunctionCheck({ data, error: error?.message });
      } catch (error: any) {
        setEdgeFunctionCheck({ error: error.message });
      }
    } finally {
      setLoading(false);
    }
  };
  
  const handleForceRefresh = async () => {
    setRefreshing(true);
    try {
      await refreshMembers();
      console.log("Members after forced refresh:", members);
    } catch (error) {
      console.error("Error during force refresh:", error);
    } finally {
      setRefreshing(false);
    }
  };
  
  return (
    <div className="p-3 bg-dark-400 text-xs font-mono">
      <div className="flex items-center justify-between mb-2">
        <h3 className="text-gray-300 font-bold">Club Debug Info</h3>
        <div className="flex gap-2">
          <Button 
            size="sm" 
            variant="outline" 
            className="h-6 text-xs"
            onClick={checkMembership}
            disabled={loading}
          >
            {loading ? (
              <>
                <Loader2 className="mr-1 h-3 w-3 animate-spin" />
                Checking...
              </>
            ) : 'Check Membership'}
          </Button>
          <Button 
            size="sm" 
            variant="outline" 
            className="h-6 text-xs"
            onClick={handleForceRefresh}
            disabled={refreshing || loadingMembers}
          >
            {(refreshing || loadingMembers) ? (
              <>
                <Loader2 className="mr-1 h-3 w-3 animate-spin" />
                Refreshing...
              </>
            ) : 'Force Refresh'}
          </Button>
        </div>
      </div>
      
      <div className="space-y-2">
        <div>
          <span className="text-gray-400">Club ID:</span> {clubId}
        </div>
        <div>
          <span className="text-gray-400">User ID:</span> {user?.id || 'Not logged in'}
        </div>
        <div>
          <span className="text-gray-400">Context.isUserClubMember:</span>{' '}
          <Badge className={isUserClubMember(clubId) ? 'bg-green-600' : 'bg-red-600'}>
            {isUserClubMember(clubId) ? 'true' : 'false'}
          </Badge>
        </div>
        <div>
          <span className="text-gray-400">Members loading:</span>{' '}
          <Badge className={loadingMembers ? 'bg-yellow-600' : 'bg-blue-600'}>
            {loadingMembers ? 'true' : 'false'}
          </Badge>
        </div>
        <div>
          <span className="text-gray-400">Members count:</span> {loadingMembers ? 'Loading...' : members.length}
        </div>
        <div>
          <span className="text-gray-400">User in members:</span>{' '}
          <Badge className={members.some(m => m.user_id === user?.id) ? 'bg-green-600' : 'bg-red-600'}>
            {members.some(m => m.user_id === user?.id) ? 'true' : 'false'}
          </Badge>
        </div>
        
        <div>
          <span className="text-gray-400">Posts count:</span> {posts.length}
        </div>
        
        <div>
          <span className="text-gray-400">Messages count:</span> {messages.length}
        </div>
        
        <div>
          <span className="text-gray-400">Events count:</span> {events.length}
        </div>
        
        {directMembershipCheck && (
          <div className="mt-4 border border-gray-600 p-2 rounded">
            <h4 className="font-bold mb-1">Direct DB Query:</h4>
            {directMembershipCheck.error ? (
              <div className="text-red-400">{directMembershipCheck.error}</div>
            ) : (
              <div className="text-green-400">
                {directMembershipCheck.data ? 'Member found' : 'Not a member'} 
              </div>
            )}
            <pre className="mt-1 whitespace-pre-wrap text-[10px] text-gray-400 max-h-20 overflow-y-auto">
              {JSON.stringify(directMembershipCheck, null, 2)}
            </pre>
          </div>
        )}
        
        {edgeFunctionCheck && (
          <div className="mt-2 border border-gray-600 p-2 rounded">
            <h4 className="font-bold mb-1">Edge Function Check:</h4>
            {edgeFunctionCheck.error ? (
              <div className="text-red-400">{edgeFunctionCheck.error}</div>
            ) : (
              <div className="text-green-400">
                {edgeFunctionCheck.data?.is_member ? 'Member found' : 'Not a member'} 
              </div>
            )}
            <pre className="mt-1 whitespace-pre-wrap text-[10px] text-gray-400 max-h-20 overflow-y-auto">
              {JSON.stringify(edgeFunctionCheck, null, 2)}
            </pre>
          </div>
        )}
      </div>
    </div>
  );
};

export default ClubDebugger;
