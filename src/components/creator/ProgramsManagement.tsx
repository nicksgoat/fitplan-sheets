
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Loader2, Settings } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { useQuery, useMutation } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { format } from 'date-fns';
import { PriceSettingsDialog } from '@/components/PriceSettingsDialog';

interface DbProgram {
  id: string;
  name: string;
  description: string;
  created_at: string;
  creator_id: string;
  is_public: boolean;
  is_purchasable: boolean;
  price: number;
  thumbnail_url: string | null;
}

const ProgramsManagement = () => {
  const { user } = useAuth();
  const [selectedProgram, setSelectedProgram] = useState<DbProgram | null>(null);
  const [priceDialogOpen, setPriceDialogOpen] = useState(false);

  // Fetch programs created by the current user
  const { data: programs, isLoading, error } = useQuery({
    queryKey: ['creatorPrograms', user?.id],
    queryFn: async () => {
      if (!user) return [];
      
      const { data, error } = await supabase
        .from('programs')
        .select('*')
        .eq('creator_id', user.id);
        
      if (error) throw error;
      return data as DbProgram[];
    },
    enabled: !!user,
  });

  // Update program price mutation
  const updatePriceMutation = useMutation({
    mutationFn: async ({ programId, price, isPurchasable }: { programId: string; price: number; isPurchasable: boolean }) => {
      const { error } = await supabase
        .from('programs')
        .update({ price, is_purchasable: isPurchasable })
        .eq('id', programId);
      
      if (error) throw error;
    },
    onSuccess: () => {
      toast.success('Program pricing updated successfully');
      setPriceDialogOpen(false);
    },
    onError: (error) => {
      toast.error('Failed to update program pricing');
      console.error('Error updating program:', error);
    }
  });

  // Update program visibility mutation
  const updateVisibilityMutation = useMutation({
    mutationFn: async ({ programId, isPublic }: { programId: string; isPublic: boolean }) => {
      const { error } = await supabase
        .from('programs')
        .update({ is_public: isPublic })
        .eq('id', programId);
      
      if (error) throw error;
    },
    onSuccess: () => {
      toast.success('Program visibility updated successfully');
    },
    onError: (error) => {
      toast.error('Failed to update program visibility');
      console.error('Error updating program visibility:', error);
    }
  });

  const handleUpdatePrice = async (price: number) => {
    if (!selectedProgram) return;
    
    updatePriceMutation.mutate({
      programId: selectedProgram.id,
      price,
      isPurchasable: price > 0
    });
  };

  const handleToggleVisibility = async (program: DbProgram) => {
    updateVisibilityMutation.mutate({
      programId: program.id,
      isPublic: !program.is_public
    });
  };

  if (error) {
    console.error('Error fetching programs:', error);
    toast.error('Failed to load programs');
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-semibold">Your Programs</h2>
        <Button variant="outline" onClick={() => {}}>Create Program</Button>
      </div>
      
      {isLoading ? (
        <div className="flex justify-center py-10">
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        </div>
      ) : programs?.length === 0 ? (
        <Card>
          <CardContent className="py-10 text-center">
            <p className="text-muted-foreground">You haven't created any programs yet.</p>
            <Button className="mt-4" onClick={() => {}}>Create Your First Program</Button>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {programs?.map((program) => (
            <Card key={program.id}>
              <div 
                className="h-40 bg-cover bg-center" 
                style={{ backgroundImage: `url(${program.thumbnail_url || '/placeholder.svg'})` }} 
              />
              <CardHeader>
                <div className="flex justify-between items-start">
                  <CardTitle className="text-lg">{program.name}</CardTitle>
                  <div className="flex space-x-2">
                    <Badge variant={program.is_public ? 'default' : 'outline'}>
                      {program.is_public ? 'Public' : 'Private'}
                    </Badge>
                    {program.is_purchasable && (
                      <Badge className="bg-green-500 hover:bg-green-600">
                        ${program.price}
                      </Badge>
                    )}
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground line-clamp-2 mb-4">
                  {program.description || 'No description provided.'}
                </p>
                
                <div className="flex items-center justify-between">
                  <div className="text-sm text-muted-foreground">
                    Created {format(new Date(program.created_at), 'MMM d, yyyy')}
                  </div>
                  
                  <div className="flex gap-2">
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={() => handleToggleVisibility(program)}
                      disabled={updateVisibilityMutation.isPending}
                    >
                      {program.is_public ? 'Make Private' : 'Make Public'}
                    </Button>
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={() => {
                        setSelectedProgram(program);
                        setPriceDialogOpen(true);
                      }}
                    >
                      <Settings className="h-4 w-4 mr-2" />
                      Price
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
      
      {selectedProgram && (
        <PriceSettingsDialog
          open={priceDialogOpen}
          onOpenChange={setPriceDialogOpen}
          currentPrice={selectedProgram.price}
          isPurchasable={selectedProgram.is_purchasable}
          onSubmit={handleUpdatePrice}
          title={`Update ${selectedProgram.name} Pricing`}
          description="Set the price for this program."
        />
      )}
    </div>
  );
};

export default ProgramsManagement;
