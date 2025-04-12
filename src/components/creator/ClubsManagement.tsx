
import React, { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Loader2, Settings, Users } from 'lucide-react';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { PriceSettingsDialog } from '@/components/PriceSettingsDialog';
import { Club } from '@/types/club';

const ClubsManagement = () => {
  const { user } = useAuth();
  const [clubs, setClubs] = useState<Club[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedClub, setSelectedClub] = useState<Club | null>(null);
  const [priceDialogOpen, setPriceDialogOpen] = useState(false);

  useEffect(() => {
    const fetchCreatorClubs = async () => {
      if (!user) return;
      
      try {
        const { data, error } = await supabase
          .from('clubs')
          .select('*')
          .eq('creator_id', user.id);
          
        if (error) throw error;
        
        // Adding the created_by property to match the Club type
        const clubsWithCreatedBy = data.map(club => ({
          ...club,
          created_by: club.creator_id
        })) as Club[];
        
        setClubs(clubsWithCreatedBy);
      } catch (error) {
        console.error('Error fetching clubs:', error);
        toast.error('Failed to load clubs');
      } finally {
        setLoading(false);
      }
    };
    
    fetchCreatorClubs();
  }, [user]);

  const handleUpdatePrice = async (newPrice: number) => {
    if (!selectedClub) return;
    
    try {
      const { error } = await supabase
        .from('clubs')
        .update({ premium_price: newPrice })
        .eq('id', selectedClub.id);
        
      if (error) throw error;
      
      // Update local state
      setClubs(clubs.map(club => 
        club.id === selectedClub.id 
          ? { ...club, premium_price: newPrice } 
          : club
      ));
      
      toast.success('Club pricing updated successfully');
      setPriceDialogOpen(false);
    } catch (error) {
      console.error('Error updating club price:', error);
      toast.error('Failed to update club pricing');
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-semibold">Your Clubs</h2>
        <Button variant="outline" onClick={() => {}}>Create Club</Button>
      </div>
      
      {loading ? (
        <div className="flex justify-center py-10">
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        </div>
      ) : clubs.length === 0 ? (
        <Card>
          <CardContent className="py-10 text-center">
            <p className="text-muted-foreground">You haven't created any clubs yet.</p>
            <Button className="mt-4" onClick={() => {}}>Create Your First Club</Button>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {clubs.map((club) => (
            <Card key={club.id} className="overflow-hidden">
              <div 
                className="h-32 bg-cover bg-center" 
                style={{ backgroundImage: `url(${club.banner_url || '/placeholder.svg'})` }} 
              />
              <CardHeader className="relative pt-0 -mt-8">
                <div className="flex items-center">
                  <Avatar className="h-16 w-16 border-4 border-background">
                    <AvatarImage src={club.logo_url || undefined} />
                    <AvatarFallback className="bg-primary text-primary-foreground">
                      {club.name.charAt(0)}
                    </AvatarFallback>
                  </Avatar>
                  <div className="ml-3">
                    <CardTitle className="text-lg">{club.name}</CardTitle>
                    <Badge variant={club.membership_type === 'premium' ? 'default' : 'outline'}>
                      {club.membership_type === 'premium' ? 'Premium' : 'Free'}
                    </Badge>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground line-clamp-2 mb-4">
                  {club.description}
                </p>
                
                <div className="flex items-center justify-between">
                  <div className="flex items-center text-sm text-muted-foreground">
                    <Users className="h-4 w-4 mr-1" />
                    <span>• members</span>
                  </div>
                  
                  <Button 
                    variant="outline" 
                    size="sm" 
                    className="ml-auto"
                    onClick={() => {
                      setSelectedClub(club);
                      setPriceDialogOpen(true);
                    }}
                  >
                    <Settings className="h-4 w-4 mr-2" />
                    Manage
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
      
      {selectedClub && (
        <PriceSettingsDialog
          open={priceDialogOpen}
          onOpenChange={setPriceDialogOpen}
          currentPrice={selectedClub.premium_price}
          isPurchasable={selectedClub.membership_type === 'premium'}
          onSubmit={handleUpdatePrice}
          title={`Update ${selectedClub.name} Pricing`}
          description="Set the membership price for this club."
        />
      )}
    </div>
  );
};

export default ClubsManagement;
