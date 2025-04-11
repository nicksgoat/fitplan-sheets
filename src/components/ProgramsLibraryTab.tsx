
import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Plus, Trash2, DollarSign } from "lucide-react";
import { WorkoutProgram } from "@/types/workout";
import { toast } from "sonner";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { useLibrary } from "@/contexts/LibraryContext";
import { ItemType } from "@/lib/types";
import ContentGrid from "@/components/ui/ContentGrid";
import { useNavigate } from "react-router-dom";
import { Badge } from "@/components/ui/badge";

const ProgramsLibraryTab: React.FC = () => {
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [programToDelete, setProgramToDelete] = useState<string | null>(null);
  const navigate = useNavigate();
  const { programs, removeProgram } = useLibrary();
  
  const handleDeleteProgram = (event: React.MouseEvent, programId: string) => {
    event.stopPropagation(); // Stop click from propagating to parent
    setProgramToDelete(programId);
    setDeleteDialogOpen(true);
  };
  
  const confirmDelete = () => {
    if (programToDelete) {
      removeProgram(programToDelete);
      toast.success("Program removed from library");
      setDeleteDialogOpen(false);
      setProgramToDelete(null);
    }
  };
  
  const formatDate = (dateString?: string) => {
    if (!dateString) return "Unknown date";
    const date = new Date(dateString);
    return date.toLocaleDateString();
  };
  
  // Convert programs to ItemType format for ContentGrid
  const programItems: ItemType[] = programs.map(program => ({
    id: program.id,
    title: program.name,
    type: 'program' as const,
    creator: 'You',
    imageUrl: 'https://placehold.co/600x400?text=Program',
    tags: ['Program', 'Custom'],
    duration: `${program.weeks?.length || 0} weeks`,
    difficulty: 'intermediate' as const,
    isFavorite: false,
    description: `Program with ${program.weeks?.length || 0} weeks and ${program.workouts?.length || 0} workouts`,
    isCustom: true,
    savedAt: program.savedAt,
    lastModified: program.lastModified,
    price: program.price,
    isPurchasable: program.isPurchasable
  }));
  
  return (
    <div className="space-y-6">
      {programs.length === 0 ? (
        <div className="text-center py-10">
          <p className="text-gray-400 mb-4">You haven't saved any programs to your library yet.</p>
          <Button 
            className="mt-4 bg-fitbloom-purple hover:bg-fitbloom-purple/90 text-sm"
            onClick={() => navigate("/sheets")}
          >
            <Plus className="h-4 w-4 mr-2" />
            Create Program
          </Button>
        </div>
      ) : (
        <>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {programs.map(program => (
              <div 
                key={program.id}
                className="bg-dark-200 p-4 rounded-lg border border-dark-300 hover:border-fitbloom-purple/50 transition-all cursor-pointer"
              >
                <div className="flex justify-between items-start">
                  <div>
                    <h3 className="font-medium">{program.name}</h3>
                    <p className="text-sm text-gray-400">
                      {program.weeks.length} {program.weeks.length === 1 ? 'week' : 'weeks'} • {program.workouts.length} workouts
                    </p>
                  </div>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8"
                    onClick={(e) => handleDeleteProgram(e, program.id)}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
                
                {program.isPurchasable && program.price && program.price > 0 && (
                  <Badge variant="outline" className="mt-2 text-xs flex items-center w-fit text-green-500 border-green-500">
                    <DollarSign className="h-3 w-3 mr-0.5" />
                    {Number(program.price).toFixed(2)}
                  </Badge>
                )}
                
                <div className="mt-2 text-xs text-gray-500">
                  Last updated: {formatDate(program.lastModified)}
                </div>
              </div>
            ))}
          </div>
          <ContentGrid items={programItems} />
        </>
      )}
      
      <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <DialogContent className="bg-dark-200 text-white border-dark-300">
          <DialogHeader>
            <DialogTitle>Delete Program</DialogTitle>
            <DialogDescription className="text-gray-400">
              Are you sure you want to remove this program from your library? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDeleteDialogOpen(false)}>
              Cancel
            </Button>
            <Button 
              variant="destructive" 
              onClick={confirmDelete}
            >
              Delete
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default ProgramsLibraryTab;
