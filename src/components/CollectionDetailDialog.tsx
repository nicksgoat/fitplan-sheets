
import React from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Heart, Share, Plus, FolderOpen } from "lucide-react";

interface Collection {
  id: string;
  name: string;
  itemCount: number;
  type: "exercises" | "workouts" | "programs" | "mixed";
  createdBy: string;
}

interface CollectionDetailDialogProps {
  collection: Collection | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  isLiked: boolean;
  onLikeToggle: () => void;
}

const CollectionDetailDialog: React.FC<CollectionDetailDialogProps> = ({
  collection,
  open,
  onOpenChange,
  isLiked,
  onLikeToggle,
}) => {
  if (!collection) return null;

  // Generate a background gradient based on the collection type
  const getBgGradient = (type: string) => {
    switch (type) {
      case "exercises":
        return "bg-gradient-to-br from-purple-900 to-indigo-900";
      case "workouts":
        return "bg-gradient-to-br from-blue-900 to-sky-900";
      case "programs":
        return "bg-gradient-to-br from-teal-900 to-emerald-900";
      case "mixed":
        return "bg-gradient-to-br from-violet-900 to-fuchsia-900";
      default:
        return "bg-gradient-to-br from-gray-800 to-gray-900";
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
        <div className={`-mx-6 -mt-6 h-48 flex items-center justify-center ${getBgGradient(collection.type)}`}>
          <span className="text-2xl font-bold text-white">{collection.name}</span>
        </div>
        
        <DialogHeader className="mt-4">
          <DialogTitle className="text-xl">{collection.name}</DialogTitle>
          <DialogDescription className="flex items-center">
            <FolderOpen className="h-4 w-4 mr-1" />
            <span>{collection.itemCount} items • {collection.createdBy}</span>
          </DialogDescription>
        </DialogHeader>
        
        <div className="mt-4 space-y-4">
          <div>
            <h3 className="text-lg font-medium mb-2">Collection Type</h3>
            <Badge variant="outline" className="bg-dark-300">
              {collection.type.charAt(0).toUpperCase() + collection.type.slice(1)}
            </Badge>
          </div>
          
          <div>
            <h3 className="text-lg font-medium mb-2">Contents</h3>
            {collection.itemCount > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="text-gray-400 text-center p-8 border border-dashed border-gray-700 rounded-lg">
                  Collection items will appear here
                </div>
              </div>
            ) : (
              <p className="text-gray-400">This collection is empty.</p>
            )}
          </div>
        </div>
        
        <DialogFooter className="flex gap-2 mt-6">
          <Button variant="outline" size="sm" onClick={onLikeToggle} className={isLiked ? "bg-purple-500 hover:bg-purple-600 text-white" : ""}>
            <Heart className={`h-4 w-4 mr-2 ${isLiked ? "fill-white" : ""}`} />
            {isLiked ? "Liked" : "Like"}
          </Button>
          
          <Button variant="outline" size="sm">
            <Share className="h-4 w-4 mr-2" />
            Share
          </Button>
          
          <Button className="bg-purple-600 hover:bg-purple-700">
            <Plus className="h-4 w-4 mr-2" />
            Add to My Library
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default CollectionDetailDialog;
