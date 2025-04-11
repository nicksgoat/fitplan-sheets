
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

interface SaveProgramDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export const SaveProgramDialog = ({ open, onOpenChange }: SaveProgramDialogProps) => {
  const [programName, setProgramName] = useState("");
  const [isPriceDialogOpen, setIsPriceDialogOpen] = useState(false);
  const [price, setPrice] = useState(0);
  const [isPurchasable, setIsPurchasable] = useState(false);
  const { program } = useWorkout();
  const { saveProgram, saveWorkout } = useLibrary();

  const handleSaveProgramToLibrary = () => {
    if (!programName) {
      toast.error("Please enter a name for your program");
      return;
    }

    if (program) {
      // Check if there's only one workout in one week
      const isSingleWorkout = program.weeks.length === 1 && program.weeks[0].workouts.length === 1;
      
      if (isSingleWorkout) {
        // Get the workout ID
        const workoutId = program.weeks[0].workouts[0];
        const workout = program.workouts.find(w => w.id === workoutId);
        
        if (workout) {
          // Save as a single workout
          saveWorkout({
            ...workout,
            name: programName,
            price: price,
            isPurchasable: isPurchasable
          });
          
          toast.success(`Workout "${programName}" saved to library`);
          setProgramName("");
          onOpenChange(false);
        }
      } else {
        // Save as a program with multiple workouts
        saveProgram(
          {
            ...program,
            name: programName,
            price: price,
            isPurchasable: isPurchasable
          },
          programName
        );
        
        setProgramName("");
        onOpenChange(false);
        toast.success(`Program "${programName}" saved to library`);
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
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Save Your Program to Library</DialogTitle>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="program-name" className="text-right">
                Program Name
              </Label>
              <Input
                id="program-name"
                value={programName}
                onChange={(e) => setProgramName(e.target.value)}
                className="col-span-3"
                autoFocus
                placeholder="My Awesome Program"
              />
            </div>

            <div className="grid grid-cols-4 items-center gap-4">
              <div className="text-right text-sm col-span-1">Price:</div>
              <div className="col-span-3 flex items-center justify-between">
                {isPurchasable ? (
                  <span>${price.toFixed(2)}</span>
                ) : (
                  <span className="text-gray-500">Not for sale</span>
                )}
                <Button 
                  variant="outline" 
                  size="sm" 
                  onClick={handleOpenPricingSettings}
                >
                  Configure Pricing
                </Button>
              </div>
            </div>

            <div className="col-span-4">
              <p className="text-sm text-muted-foreground">
                {program?.weeks.length === 1 && program?.weeks[0].workouts.length === 1
                  ? "This will save your workout to your library. You can access it from the Library page."
                  : "This will save your entire program with all weeks and workouts to your library. You can access it from the Library page."}
              </p>
            </div>
          </div>
          <DialogFooter>
            <Button 
              type="submit" 
              onClick={handleSaveProgramToLibrary}
              disabled={!programName}
              className="bg-green-600 hover:bg-green-700"
            >
              <Save className="h-4 w-4 mr-2" />
              {program?.weeks.length === 1 && program?.weeks[0].workouts.length === 1
                ? "Save Workout" 
                : "Save Program"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <PriceSettingsDialog
        open={isPriceDialogOpen}
        onOpenChange={setIsPriceDialogOpen}
        title={program?.weeks.length === 1 && program?.weeks[0].workouts.length === 1
          ? "Workout Pricing"
          : "Program Pricing"}
        currentPrice={price}
        isPurchasable={isPurchasable}
        onSave={handleSavePricing}
        isSaving={false}
      />
    </>
  );
};
