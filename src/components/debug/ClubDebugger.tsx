
import React, { useEffect, useState } from 'react';
import { useClub } from '@/contexts/ClubContext';
import { useAuth } from '@/hooks/useAuth';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

const ClubDebugger = ({ clubId }: { clubId: string }) => {
  const { user } = useAuth();
  const { isUserClubMember, userClubs, currentClub, joinCurrentClub, refreshClubs, refreshMembers } = useClub();
  const [loading, setLoading] = useState(false);
  const [debugInfo, setDebugInfo] = useState<any>({});
  
  const fetchDebugInfo = async () => {
    if (!user || !clubId) return;
    
    setLoading(true);
    try {
      // Manual check for club membership using edge function
      const { data: edgeFunctionData, error: edgeFunctionError } = await supabase.functions.invoke('run-sql-rpcs', {
        body: {
          sqlName: 'check_club_member',
          params: {
            club_id: clubId,
            user_id: user.id
          }
        }
      });
      
      // Direct database query (will likely trigger the recursion error)
      let directQueryResult = null;
      let directQueryError = null;
      try {
        const { data, error } = await supabase
          .from('club_members')
          .select('*')
          .eq('club_id', clubId)
          .eq('user_id', user.id)
          .maybeSingle();
          
        directQueryResult = data;
        directQueryError = error;
      } catch (e) {
        directQueryError = e;
      }
      
      // Log user clubs
      console.log("DEBUG - Current User Clubs:", userClubs);
      
      // Check club membership using context
      const isMember = isUserClubMember(clubId);
      console.log(`DEBUG - isUserClubMember result for club ${clubId}:`, isMember);
      
      setDebugInfo({
        userId: user.id,
        clubId,
        contextMembership: isMember,
        directQueryMembership: directQueryResult ? true : false,
        membershipData: directQueryResult,
        membershipError: directQueryError,
        edgeFunctionMembership: edgeFunctionData?.is_member === true,
        edgeFunctionData,
        edgeFunctionError,
        userClubs: userClubs,
        currentClub: currentClub
      });
    } catch (error) {
      console.error("Error fetching debug info:", error);
      setDebugInfo({ error });
    } finally {
      setLoading(false);
    }
  };
  
  // Force join the club with a direct database insert through edge function
  const forceJoin = async () => {
    if (!user || !clubId) return;
    
    setLoading(true);
    try {
      console.log("DEBUG - Forcing club join...");
      toast.loading('Attempting to join club via admin route...');
      
      // Direct API call through edge function with service role token
      const { data, error } = await supabase.functions.invoke('run-sql-rpcs', {
        body: {
          sqlName: 'join_club',
          params: {
            club_id: clubId,
            user_id: user.id,
            membership_type: 'free',
            force: true  // Signal that this is a forced join
          }
        }
      });
      
      console.log("DEBUG - Force join result:", { data, error });
      
      if (error) throw error;
      
      toast.dismiss();
      toast.success('Successfully joined club!');
      
      // Refresh clubs and debug info
      await refreshClubs();
      await refreshMembers();
      await fetchDebugInfo();
      
      // Force page reload to update UI state
      window.location.reload();
      
    } catch (error) {
      console.error("Error in force join:", error);
      toast.dismiss();
      toast.error(`Failed to join: ${error.message}`);
      setDebugInfo(prev => ({ ...prev, forceJoinError: error }));
    } finally {
      setLoading(false);
    }
  };
  
  useEffect(() => {
    if (user && clubId) {
      fetchDebugInfo();
    }
  }, [user, clubId, userClubs]);
  
  if (!user) return <div>User not authenticated</div>;
  
  return (
    <Card className="bg-zinc-800 border-zinc-700 my-2">
      <CardHeader>
        <CardTitle className="text-sm font-medium">Club Debugging Info</CardTitle>
      </CardHeader>
      <CardContent className="text-xs space-y-2">
        <div className="grid grid-cols-2 gap-1">
          <div>User ID:</div>
          <div className="font-mono">{user.id}</div>
          
          <div>Club ID:</div>
          <div className="font-mono">{clubId}</div>
          
          <div>Context says is member:</div>
          <div>{debugInfo.contextMembership ? "Yes" : "No"}</div>
          
          <div>DB query says is member:</div>
          <div>{debugInfo.directQueryMembership ? "Yes" : "No"}</div>
          
          <div>Edge function says is member:</div>
          <div>{debugInfo.edgeFunctionMembership ? "Yes" : "No"}</div>
          
          <div>User Clubs Count:</div>
          <div>{debugInfo.userClubs?.length || 0}</div>
          
          <div>Error in membership check:</div>
          <div className="text-red-400">
            {debugInfo.membershipError ? debugInfo.membershipError.message : "None"}
          </div>
        </div>
        
        <div className="flex flex-row space-x-2 pt-2">
          <Button 
            size="sm" 
            variant="outline" 
            onClick={fetchDebugInfo} 
            disabled={loading}
          >
            Refresh
          </Button>
          <Button 
            size="sm" 
            variant="outline" 
            onClick={forceJoin} 
            disabled={loading || debugInfo.edgeFunctionMembership}
          >
            Force Join
          </Button>
          <Button 
            size="sm" 
            variant="destructive" 
            onClick={() => window.location.reload()} 
            disabled={loading}
          >
            Reload Page
          </Button>
        </div>
        
        <details className="pt-2">
          <summary className="cursor-pointer">Raw Debug Data</summary>
          <pre className="text-xs mt-2 p-2 bg-zinc-900 rounded overflow-auto max-h-60">
            {JSON.stringify(debugInfo, null, 2)}
          </pre>
        </details>
      </CardContent>
    </Card>
  );
};

export default ClubDebugger;
