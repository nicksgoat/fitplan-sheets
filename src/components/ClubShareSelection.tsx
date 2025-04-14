
import React, { useState, useEffect } from "react";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Button } from "@/components/ui/button";
import { RefreshCw } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

// Define a simplified type to avoid recursive references
type SimpleClub = {
  id: string;
  name: string;
  description: string;
  created_at: string;
  created_by?: string;
  banner_url?: string;
  logo_url?: string;
  club_type: string;
  membership_type: string;
  premium_price?: number;
  creator_id?: string;
};

interface ClubShareSelectionProps {
  contentId?: string;
  contentType: "workout" | "program";
  onSelectionChange: (selectedClubs: string[]) => void;
  selectedClubIds?: string[];
}

export function ClubShareSelection({
  contentId,
  contentType,
  onSelectionChange,
  selectedClubIds = []
}: ClubShareSelectionProps) {
  const [selectedClubs, setSelectedClubs] = useState<string[]>(selectedClubIds);

  // Fetch user's clubs where they are admin/owner
  const { data: clubs = [], isLoading, refetch } = useQuery({
    queryKey: ["user-manageable-clubs"],
    queryFn: async () => {
      const { data: userData } = await supabase.auth.getUser();
      if (!userData?.user) return [];

      const { data, error } = await supabase
        .from("club_members")
        .select("club_id, role, club:clubs(*)")
        .eq("user_id", userData.user.id)
        .in("role", ["admin", "owner", "moderator"]);

      if (error) {
        console.error("Error fetching clubs:", error);
        return [];
      }

      // Extract club data and manually build the SimpleClub objects
      // to completely avoid any potential type recursion
      return data?.filter(item => item.club).map(item => {
        const club = item.club as Record<string, any>;
        
        return {
          id: club.id,
          name: club.name,
          description: club.description,
          created_at: club.created_at,
          created_by: club.created_by,
          banner_url: club.banner_url,
          logo_url: club.logo_url,
          club_type: club.club_type,
          membership_type: club.membership_type,
          premium_price: club.premium_price,
          creator_id: club.creator_id
        } as SimpleClub;
      }) || [];
    },
  });

  // If we have a content ID, fetch existing shares
  const { data: existingShares = [], isLoading: isLoadingShares, refetch: refetchShares } = useQuery({
    queryKey: ["content-shares", contentId, contentType],
    queryFn: async () => {
      if (!contentId) return [];

      const tableName = contentType === "workout" ? "club_shared_workouts" : "club_shared_programs";
      const idField = contentType === "workout" ? "workout_id" : "program_id";

      const { data, error } = await supabase
        .from(tableName)
        .select("club_id")
        .eq(idField, contentId);

      if (error) {
        console.error(`Error fetching ${contentType} shares:`, error);
        return [];
      }

      return data.map(share => share.club_id);
    },
    enabled: !!contentId,
  });

  // Update selected clubs when existing shares load
  useEffect(() => {
    if (existingShares && existingShares.length > 0) {
      setSelectedClubs(existingShares);
      onSelectionChange(existingShares);
    }
  }, [existingShares, onSelectionChange]);

  // Handle checkbox change
  const handleCheckboxChange = (clubId: string, checked: boolean) => {
    let updatedSelection = [...selectedClubs];
    
    if (checked) {
      updatedSelection.push(clubId);
    } else {
      updatedSelection = updatedSelection.filter(id => id !== clubId);
    }
    
    setSelectedClubs(updatedSelection);
    onSelectionChange(updatedSelection);
  };

  if (isLoading) {
    return <div className="text-sm text-gray-400">Loading clubs...</div>;
  }

  if (!clubs || clubs.length === 0) {
    return (
      <div className="text-sm text-gray-400">
        <p className="mb-2">You don't have any clubs where you're an admin or moderator.</p>
        <p>Create a club or get admin permissions to share content with clubs.</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <Label className="text-sm font-medium text-gray-300">Share with clubs</Label>
        <Button
          variant="ghost"
          size="sm"
          className="h-8 text-xs"
          onClick={() => {
            refetch();
            if (contentId) refetchShares();
          }}
        >
          <RefreshCw className="h-3 w-3 mr-1" />
          Refresh
        </Button>
      </div>
      
      <ScrollArea className="h-[180px] rounded-md border border-dark-400 p-2 bg-dark-300">
        <div className="space-y-2 pr-4">
          {clubs.map((club) => (
            <div key={club.id} className="flex items-start space-x-2 py-1.5">
              <Checkbox
                id={`club-${club.id}`}
                checked={selectedClubs.includes(club.id)}
                onCheckedChange={(checked) => {
                  handleCheckboxChange(club.id, checked === true);
                }}
              />
              <Label
                htmlFor={`club-${club.id}`}
                className="text-sm font-medium cursor-pointer flex items-center gap-2"
              >
                {club.logo_url && (
                  <img
                    src={club.logo_url}
                    alt={club.name}
                    className="h-5 w-5 rounded-full object-cover"
                  />
                )}
                {club.name}
              </Label>
            </div>
          ))}
          {clubs.length === 0 && (
            <div className="text-sm text-gray-400 py-2">No clubs found</div>
          )}
        </div>
      </ScrollArea>

      <div className="text-xs text-gray-400">
        Members of the selected clubs will be able to access this content.
      </div>
    </div>
  );
}
