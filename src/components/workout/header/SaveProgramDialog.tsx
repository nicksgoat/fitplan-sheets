
import React, { useState } from "react";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Save } from "lucide-react";
import { useWorkout } from "@/contexts/WorkoutContext";
import { useLibrary } from "@/contexts/LibraryContext";
import { toast } from "sonner";
import { PriceSettingsDialog } from "@/components/PriceSettingsDialog";
import { ClubShareSelection } from "@/components/ClubShareSelection";
import { useShareWithClubs } from "@/hooks/useClubSharing";

interface SaveProgramDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export const SaveProgramDialog = ({ open, onOpenChange }: SaveProgramDialogProps) => {
  const [programName, setProgramName] = useState("");
  const [isPriceDialogOpen, setIsPriceDialogOpen] = useState(false);
  const [price, setPrice] = useState(0);
  const [isPurchasable, setIsPurchasable] = useState(false);
  const [selectedClubs, setSelectedClubs] = useState<string[]>([]);
  const { program } = useWorkout();
  const { saveProgram, saveWorkout } = useLibrary();
  const shareWithClubs = useShareWithClubs();

  // Check if we're saving a single workout or a full program
  const isSingleWorkout = program?.weeks.length === 1 && program?.weeks[0].workouts.length === 1;
  
  const itemTypeLabel = isSingleWorkout ? "Workout" : "Program";

  const handleSaveProgramToLibrary = async () => {
    if (!programName) {
      toast.error(`Please enter a name for your ${itemTypeLabel.toLowerCase()}`);
      return;
    }

    if (program) {
      try {
        let savedId: string | null = null;
        
        if (isSingleWorkout) {
          // Get the workout ID
          const workoutId = program.weeks[0].workouts[0];
          const workout = program.workouts.find(w => w.id === workoutId);
          
          if (workout) {
            // Save as a single workout
            const result = await saveWorkout({
              ...workout,
              name: programName,
              price: price,
              isPurchasable: isPurchasable
            });
            
            if (result) {
              savedId = result;
              toast.success(`Workout "${programName}" saved to library`);
            }
          }
        } else {
          // Save as a program with multiple workouts
          const result = await saveProgram(
            {
              ...program,
              name: programName,
              price: price,
              isPurchasable: isPurchasable
            },
            programName
          );
          
          if (result) {
            savedId = result;
            toast.success(`Program "${programName}" saved to library`);
          }
        }
        
        // If content was saved successfully and clubs are selected, share with clubs
        if (savedId && selectedClubs.length > 0) {
          await shareWithClubs.mutateAsync({
            contentId: savedId,
            contentType: isSingleWorkout ? 'workout' : 'program',
            clubIds: selectedClubs
          });
        }
        
        setProgramName("");
        onOpenChange(false);
      } catch (error) {
        console.error("Error saving:", error);
        toast.error(`Failed to save ${itemTypeLabel.toLowerCase()}`);
      }
    }
  };

  const handleOpenPricingSettings = () => {
    setIsPriceDialogOpen(true);
  };

  const handleSavePricing = (newPrice: number, newIsPurchasable: boolean) => {
    setPrice(newPrice);
    setIsPurchasable(newIsPurchasable);
    setIsPriceDialogOpen(false);
  };

  return (
    <>
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="sm:max-w-[425px] bg-dark-200 border-dark-300 text-white">
          <DialogHeader>
            <DialogTitle className="text-xl font-bold">
              Save Your {itemTypeLabel} to Library
            </DialogTitle>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="program-name" className="text-sm font-medium text-gray-300">
                {itemTypeLabel} Name
              </Label>
              <Input
                id="program-name"
                value={programName}
                onChange={(e) => setProgramName(e.target.value)}
                className="bg-dark-300 border-dark-400 text-white"
                autoFocus
                placeholder={`My Awesome ${itemTypeLabel}`}
              />
            </div>

            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label className="text-sm font-medium text-gray-300">Pricing</Label>
                <Button 
                  variant="outline" 
                  size="sm" 
                  onClick={handleOpenPricingSettings}
                  className="text-xs h-8 bg-dark-300 hover:bg-dark-400 border-dark-400"
                >
                  Configure Pricing
                </Button>
              </div>
              <div className="px-3 py-2 rounded-md bg-dark-300 border border-dark-400 text-sm">
                {isPurchasable ? (
                  <span className="text-green-400">${price.toFixed(2)}</span>
                ) : (
                  <span className="text-gray-500">Not for sale</span>
                )}
              </div>
            </div>
            
            <div className="space-y-2 pt-2">
              <ClubShareSelection
                contentType={isSingleWorkout ? "workout" : "program"}
                onSelectionChange={setSelectedClubs}
                selectedClubIds={selectedClubs}
              />
            </div>

            <div className="mt-2">
              <p className="text-sm text-gray-400">
                {isSingleWorkout
                  ? "This will save your workout to your library. You can access it from the Library page."
                  : "This will save your entire program with all weeks and workouts to your library. You can access it from the Library page."}
              </p>
            </div>
          </div>
          <DialogFooter>
            <Button 
              variant="outline" 
              onClick={() => onOpenChange(false)}
              className="bg-dark-300 hover:bg-dark-400 border-dark-400"
            >
              Cancel
            </Button>
            <Button 
              onClick={handleSaveProgramToLibrary}
              disabled={!programName}
              className="bg-fitbloom-purple hover:bg-fitbloom-purple/90"
            >
              <Save className="h-4 w-4 mr-2" />
              Save {itemTypeLabel}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <PriceSettingsDialog
        open={isPriceDialogOpen}
        onOpenChange={setIsPriceDialogOpen}
        title={`${itemTypeLabel} Pricing`}
        currentPrice={price}
        isPurchasable={isPurchasable}
        onSave={handleSavePricing}
        isSaving={false}
      />
    </>
  );
};
