
import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Plus, Trash2 } from "lucide-react";
import { WorkoutWeek } from "@/types/workout";
import { toast } from "sonner";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { useLibrary } from "@/contexts/LibraryContext";
import { ItemType } from "@/lib/types";
import ContentGrid from "@/components/ui/ContentGrid";
import { useNavigate } from "react-router-dom";

const WeeksLibraryTab: React.FC = () => {
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [weekToDelete, setWeekToDelete] = useState<string | null>(null);
  const navigate = useNavigate();
  const { weeks, removeWeek } = useLibrary();
  
  const handleDeleteWeek = (event: React.MouseEvent, weekId: string) => {
    event.stopPropagation(); // Stop click from propagating to parent
    setWeekToDelete(weekId);
    setDeleteDialogOpen(true);
  };
  
  const confirmDelete = () => {
    if (weekToDelete) {
      removeWeek(weekToDelete);
      toast.success("Week removed from library");
      setDeleteDialogOpen(false);
      setWeekToDelete(null);
    }
  };
  
  const formatDate = (dateString?: string) => {
    if (!dateString) return "Unknown date";
    const date = new Date(dateString);
    return date.toLocaleDateString();
  };
  
  // Convert weeks to ItemType format for ContentGrid
  const weekItems: ItemType[] = weeks.map(week => ({
    id: week.id,
    title: week.name,
    type: 'workout' as const, // Using workout type since we don't have a specific week type
    creator: 'You',
    imageUrl: 'https://placehold.co/600x400?text=Training+Week',
    tags: ['Week', 'Custom'],
    duration: `${week.workouts?.length || 0} workouts`,
    difficulty: 'intermediate' as const,
    isFavorite: false,
    description: `Training week with ${week.workouts?.length || 0} workouts`,
    isCustom: true,
    savedAt: week.savedAt,
    lastModified: week.lastModified
  }));
  
  return (
    <div className="space-y-6">
      {weeks.length === 0 ? (
        <div className="text-center py-10">
          <p className="text-gray-400 mb-4">You haven't saved any training weeks to your library yet.</p>
          <Button 
            className="mt-4 bg-fitbloom-purple hover:bg-fitbloom-purple/90 text-sm"
            onClick={() => navigate("/sheets")}
          >
            <Plus className="h-4 w-4 mr-2" />
            Create Training Week
          </Button>
        </div>
      ) : (
        <ContentGrid items={weekItems} />
      )}
      
      <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <DialogContent className="bg-dark-200 text-white border-dark-300">
          <DialogHeader>
            <DialogTitle>Delete Training Week</DialogTitle>
            <DialogDescription className="text-gray-400">
              Are you sure you want to remove this training week from your library? This action cannot be undone.
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

export default WeeksLibraryTab;
