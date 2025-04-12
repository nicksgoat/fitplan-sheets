
import React, { useState } from 'react';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { PriceSettingsDialog } from '@/components/PriceSettingsDialog';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { useUpdateProgramPrice } from '@/hooks/useWorkoutData';
import { formatCurrency } from '@/utils/workout';

type Program = {
  id: string;
  name: string;
  price: number;
  is_public: boolean;
  is_purchasable: boolean;
  user_id: string;
  created_at: string;
  updated_at: string;
};

export const ProgramsManagement: React.FC = () => {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const [selectedProgram, setSelectedProgram] = useState<Program | null>(null);
  const [isPriceDialogOpen, setIsPriceDialogOpen] = useState(false);
  
  const updateProgramPrice = useUpdateProgramPrice();
  
  // Fetch user's programs
  const { data: programs, isLoading } = useQuery({
    queryKey: ['creator-programs', user?.id],
    queryFn: async () => {
      if (!user) return [];
      
      const { data, error } = await supabase
        .from('programs')
        .select('*')
        .eq('user_id', user.id);
      
      if (error) {
        throw error;
      }
      
      return data as Program[];
    },
    enabled: !!user
  });
  
  // Update program visibility mutation
  const updateVisibility = useMutation({
    mutationFn: async ({ programId, isPublic }: { programId: string, isPublic: boolean }) => {
      const { error } = await supabase
        .from('programs')
        .update({ is_public: isPublic })
        .eq('id', programId);
      
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['creator-programs', user?.id] });
      toast.success('Program visibility updated');
    },
    onError: (error) => {
      console.error('Error updating program visibility:', error);
      toast.error('Failed to update program visibility');
    }
  });
  
  const handleToggleVisibility = (program: Program) => {
    updateVisibility.mutate({ 
      programId: program.id,
      isPublic: !program.is_public
    });
  };
  
  const handleSavePrice = async (price: number, isPurchasable: boolean) => {
    if (!selectedProgram) return;
    
    try {
      await updateProgramPrice.mutateAsync({
        programId: selectedProgram.id,
        price,
        isPurchasable
      });
      
      toast.success("Program pricing updated successfully");
      setIsPriceDialogOpen(false);
      
      // Update local state
      queryClient.invalidateQueries({ queryKey: ['creator-programs', user?.id] });
    } catch (error) {
      console.error("Error updating program price:", error);
      toast.error("Failed to update program pricing");
    }
  };
  
  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-bold">Your Programs</h2>
      </div>
      
      <div className="border rounded-md border-dark-300 overflow-hidden">
        {isLoading ? (
          <div className="p-4 text-center">Loading programs...</div>
        ) : programs && programs.length > 0 ? (
          <Table>
            <TableHeader className="bg-dark-300">
              <TableRow>
                <TableHead>Program Name</TableHead>
                <TableHead>Price</TableHead>
                <TableHead>Visibility</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Created</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {programs.map((program) => (
                <TableRow key={program.id} className="border-dark-300">
                  <TableCell>{program.name}</TableCell>
                  <TableCell>{program.is_purchasable ? formatCurrency(program.price || 0) : 'Not for sale'}</TableCell>
                  <TableCell>
                    <Button 
                      variant="ghost" 
                      size="sm" 
                      onClick={() => handleToggleVisibility(program)}
                      className={program.is_public ? 'text-green-400' : 'text-gray-400'}
                    >
                      {program.is_public ? 'Public' : 'Private'}
                    </Button>
                  </TableCell>
                  <TableCell>
                    <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs ${program.is_purchasable ? 'bg-green-900/20 text-green-400' : 'bg-gray-800 text-gray-400'}`}>
                      {program.is_purchasable ? 'Purchasable' : 'Not for sale'}
                    </span>
                  </TableCell>
                  <TableCell>{new Date(program.created_at).toLocaleDateString()}</TableCell>
                  <TableCell className="text-right">
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={() => {
                        setSelectedProgram(program);
                        setIsPriceDialogOpen(true);
                      }}
                    >
                      Set Price
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        ) : (
          <div className="p-8 text-center">
            <p className="mb-4 text-gray-400">You haven't created any programs yet.</p>
            <Button className="bg-fitbloom-purple hover:bg-fitbloom-purple/90" asChild>
              <a href="/sheets">Create a Program</a>
            </Button>
          </div>
        )}
      </div>
      
      {selectedProgram && (
        <PriceSettingsDialog
          open={isPriceDialogOpen}
          onOpenChange={setIsPriceDialogOpen}
          title={`Set pricing for ${selectedProgram.name}`}
          currentPrice={selectedProgram.price || 0}
          isPurchasable={selectedProgram.is_purchasable || false}
          onSave={handleSavePrice}
          isSaving={updateProgramPrice.isPending}
        />
      )}
    </div>
  );
};
