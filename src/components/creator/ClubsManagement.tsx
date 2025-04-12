
import React, { useState } from 'react';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { PriceSettingsDialog } from '@/components/PriceSettingsDialog';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { Link } from 'react-router-dom';

type Club = {
  id: string;
  name: string;
  description: string | null;
  premium_price: number | null;
  membership_type: string;
  creator_id: string;
  created_at: string;
  updated_at: string;
  member_count?: number;
};

export const ClubsManagement: React.FC = () => {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const [selectedClub, setSelectedClub] = useState<Club | null>(null);
  const [isPriceDialogOpen, setIsPriceDialogOpen] = useState(false);
  
  // Fetch user's clubs
  const { data: clubs, isLoading } = useQuery({
    queryKey: ['creator-clubs', user?.id],
    queryFn: async () => {
      if (!user) return [];
      
      // Get clubs created by the user
      const { data: clubsData, error: clubsError } = await supabase
        .from('clubs')
        .select('*')
        .eq('creator_id', user.id);
      
      if (clubsError) {
        throw clubsError;
      }
      
      // Get member count for each club
      const clubsWithMemberCount = await Promise.all(clubsData.map(async (club) => {
        const { count, error: countError } = await supabase
          .from('club_members')
          .select('*', { count: 'exact', head: true })
          .eq('club_id', club.id);
          
        if (countError) {
          console.error('Error getting member count:', countError);
          return { ...club, member_count: 0 };
        }
        
        return { ...club, member_count: count || 0 };
      }));
      
      return clubsWithMemberCount as Club[];
    },
    enabled: !!user
  });
  
  // Update club premium price mutation
  const updateClubPrice = useMutation({
    mutationFn: async ({ clubId, price }: { clubId: string, price: number }) => {
      const isPremium = price > 0;
      
      const { error } = await supabase
        .from('clubs')
        .update({ 
          premium_price: price,
          membership_type: isPremium ? 'premium' : 'free'
        })
        .eq('id', clubId);
      
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['creator-clubs', user?.id] });
      toast.success('Club pricing updated');
    },
    onError: (error) => {
      console.error('Error updating club price:', error);
      toast.error('Failed to update club pricing');
    }
  });
  
  const handleSavePricing = async (price: number, isPurchasable: boolean) => {
    if (!selectedClub) return;
    
    try {
      // If not purchasable, set price to 0
      const finalPrice = isPurchasable ? price : 0;
      
      await updateClubPrice.mutateAsync({
        clubId: selectedClub.id,
        price: finalPrice
      });
      
      setIsPriceDialogOpen(false);
    } catch (error) {
      console.error('Error updating club price:', error);
      toast.error('Failed to update club pricing');
    }
  };
  
  const formatCurrency = (amount: number | null) => {
    if (amount === null) return '$0.00';
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(amount);
  };
  
  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-bold">Your Clubs</h2>
        <Link to="/clubs">
          <Button variant="outline">
            View All Clubs
          </Button>
        </Link>
      </div>
      
      <div className="border rounded-md border-dark-300 overflow-hidden">
        {isLoading ? (
          <div className="p-4 text-center">Loading clubs...</div>
        ) : clubs && clubs.length > 0 ? (
          <Table>
            <TableHeader className="bg-dark-300">
              <TableRow>
                <TableHead>Club Name</TableHead>
                <TableHead>Members</TableHead>
                <TableHead>Membership Type</TableHead>
                <TableHead>Premium Price</TableHead>
                <TableHead>Created</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {clubs.map((club) => (
                <TableRow key={club.id} className="border-dark-300">
                  <TableCell>
                    <Link to={`/clubs/${club.id}`} className="text-fitbloom-purple hover:underline">
                      {club.name}
                    </Link>
                  </TableCell>
                  <TableCell>{club.member_count}</TableCell>
                  <TableCell>
                    <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs ${club.membership_type === 'premium' ? 'bg-amber-900/20 text-amber-400' : 'bg-gray-800 text-gray-400'}`}>
                      {club.membership_type === 'premium' ? 'Premium' : 'Free'}
                    </span>
                  </TableCell>
                  <TableCell>
                    {club.membership_type === 'premium' ? formatCurrency(club.premium_price) : 'N/A'}
                  </TableCell>
                  <TableCell>{new Date(club.created_at).toLocaleDateString()}</TableCell>
                  <TableCell className="text-right">
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={() => {
                        setSelectedClub(club);
                        setIsPriceDialogOpen(true);
                      }}
                    >
                      Set Pricing
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        ) : (
          <div className="p-8 text-center">
            <p className="mb-4 text-gray-400">You haven't created any clubs yet.</p>
            <Button className="bg-fitbloom-purple hover:bg-fitbloom-purple/90" asChild>
              <Link to="/clubs">Create a Club</Link>
            </Button>
          </div>
        )}
      </div>
      
      {selectedClub && (
        <PriceSettingsDialog
          open={isPriceDialogOpen}
          onOpenChange={setIsPriceDialogOpen}
          title={`Set pricing for ${selectedClub.name}`}
          currentPrice={selectedClub.premium_price || 0}
          isPurchasable={selectedClub.membership_type === 'premium'}
          onSave={handleSavePricing}
          isSaving={updateClubPrice.isPending}
        />
      )}
    </div>
  );
};
