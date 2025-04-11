import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useProgram, useUpdateProgram, useUpdateProgramPrice } from '@/hooks/workout/useProgramOperations';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent } from '@/components/ui/card';
import { toast } from 'sonner';
import { Loader2, CheckCircle2, ArrowLeft } from 'lucide-react';
import { PriceSettingsDialog } from '@/components/PriceSettingsDialog';

const UpdateProgram: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  
  const { data: program, isLoading, error } = useProgram(id || '');
  const updateProgramMutation = useUpdateProgram();
  const updateProgramPriceMutation = useUpdateProgramPrice();
  
  const [name, setName] = useState('');
  const [isPublic, setIsPublic] = useState(false);
  const [isPriceDialogOpen, setIsPriceDialogOpen] = useState(false);
  
  useEffect(() => {
    if (program) {
      setName(program.name);
      setIsPublic(program.isPublic || false);
    }
  }, [program]);
  
  const handleNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setName(e.target.value);
  };
  
  const handleVisibilityChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setIsPublic(e.target.checked);
  };
  
  const handleUpdateProgram = async () => {
    if (!id) return;
    
    try {
      await updateProgramMutation.mutateAsync({ programId: id, name });
      toast.success('Program updated successfully');
    } catch (err: any) {
      toast.error(`Failed to update program: ${err.message}`);
    }
  };
  
  const handlePriceSave = (price: number, isPurchasable: boolean) => {
    if (id) {
      updateProgramPriceMutation.mutate({ 
        programId: id, 
        price, 
        isPurchasable 
      });
      setIsPriceDialogOpen(false);
    }
  };
  
  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
        <span className="ml-2 text-lg">Loading program...</span>
      </div>
    );
  }
  
  if (error || !program) {
    return (
      <div className="p-6 flex flex-col items-center">
        <div className="bg-red-50 text-red-600 p-4 rounded-lg mb-4 w-full max-w-md">
          <p className="font-medium">Error loading program</p>
          <p className="text-sm mt-1">
            {error instanceof Error 
              ? error.message 
              : "Could not find the requested program"}
          </p>
        </div>
        <Button onClick={() => navigate(-1)} variant="outline" className="mt-4">
          <ArrowLeft className="mr-2 h-4 w-4" />
          Go Back
        </Button>
      </div>
    );
  }
  
  return (
    <div className="container mx-auto p-4">
      <Button 
        variant="ghost" 
        onClick={() => navigate(-1)}
        className="mb-4"
      >
        <ArrowLeft className="mr-2 h-4 w-4" />
        Back
      </Button>
      
      <h1 className="text-2xl font-bold mb-6">Update Program</h1>
      
      <Card>
        <CardContent className="space-y-4">
          <div>
            <Label htmlFor="name">Program Name</Label>
            <Input 
              type="text" 
              id="name" 
              value={name} 
              onChange={handleNameChange} 
              className="mt-1" 
            />
          </div>
          
          <div className="flex items-center space-x-2">
            <Label htmlFor="isPublic">Public Program</Label>
            <Input 
              type="checkbox" 
              id="isPublic" 
              checked={isPublic} 
              onChange={handleVisibilityChange} 
            />
          </div>
          
          <Button 
            onClick={handleUpdateProgram} 
            className="bg-fitbloom-purple hover:bg-fitbloom-purple/90"
            disabled={updateProgramMutation.isLoading}
          >
            {updateProgramMutation.isLoading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Updating...
              </>
            ) : (
              <>
                <CheckCircle2 className="mr-2 h-4 w-4" />
                Update Program
              </>
            )}
          </Button>
        </CardContent>
      </Card>
      
      <div className="mt-6">
        <Button 
          onClick={() => setIsPriceDialogOpen(true)}
          variant="outline"
        >
          Set Pricing
        </Button>
      </div>
      
      <PriceSettingsDialog 
        open={isPriceDialogOpen}
        onOpenChange={setIsPriceDialogOpen}
        title="Program Pricing"
        currentPrice={program.price || 0}
        isPurchasable={program.isPurchasable || false}
        onSave={handlePriceSave}
        isSaving={updateProgramPriceMutation.isLoading}
      />
    </div>
  );
};

export default UpdateProgram;
