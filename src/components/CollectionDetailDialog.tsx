
import React from "react";
import { Dialog, DialogContent, DialogClose } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

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

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl p-0 bg-black max-h-[90vh] overflow-y-auto">
        <div className="bg-black w-full">
          <Tabs defaultValue="details" className="w-full">
            <TabsList className="w-full grid grid-cols-2 bg-transparent">
              <TabsTrigger value="details" className="rounded-none border-b-2 border-transparent data-[state=active]:border-purple-500 data-[state=active]:bg-transparent">
                Details
              </TabsTrigger>
              <TabsTrigger value="contents" className="rounded-none border-b-2 border-transparent data-[state=active]:border-purple-500 data-[state=active]:bg-transparent">
                Contents
              </TabsTrigger>
            </TabsList>
            
            <TabsContent value="details" className="p-0 m-0">
              <div className="p-6">
                <div className="uppercase text-xs font-semibold tracking-wider text-gray-400 mb-1">
                  COLLECTION
                </div>
                <h1 className="text-2xl font-bold mb-1">{collection.name}</h1>
                <p className="text-gray-400 mb-4">{collection.createdBy}</p>
                
                <div className="flex flex-wrap gap-2 mb-6">
                  <Badge className="bg-black text-white border border-gray-700">
                    {collection.type.charAt(0).toUpperCase() + collection.type.slice(1)}
                  </Badge>
                  <Badge className="bg-black text-white border border-gray-700">
                    {collection.itemCount} items
                  </Badge>
                </div>
                
                <div className="mb-6">
                  <h2 className="text-lg font-medium mb-3">Description</h2>
                  <p className="text-gray-400">
                    A curated collection of {collection.type} for your fitness journey.
                  </p>
                </div>
              </div>
            </TabsContent>
            
            <TabsContent value="contents" className="p-6">
              {collection.itemCount > 0 ? (
                <div className="space-y-4">
                  <h2 className="text-lg font-medium">Collection Items</h2>
                  <div className="text-gray-400 text-center p-8 border border-dashed border-gray-700 rounded-lg">
                    Collection items will appear here
                  </div>
                </div>
              ) : (
                <div className="text-gray-400 py-8 text-center">
                  This collection is empty.
                </div>
              )}
            </TabsContent>
          </Tabs>
        </div>
        
        <div className="flex px-6 py-4 border-t border-gray-800 justify-between">
          <DialogClose asChild>
            <Button variant="outline" className="bg-transparent border-gray-700 text-white">
              Close
            </Button>
          </DialogClose>
          
          <Button className="bg-purple-600 hover:bg-purple-700">
            Add to My Library
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default CollectionDetailDialog;
