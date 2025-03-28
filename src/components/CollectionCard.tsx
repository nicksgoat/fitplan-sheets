
import React, { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Heart } from "lucide-react";
import CollectionDetailDialog from "./CollectionDetailDialog";

interface Collection {
  id: string;
  name: string;
  itemCount: number;
  type: "exercises" | "workouts" | "programs" | "mixed";
  createdBy: string;
}

interface CollectionCardProps {
  collection: Collection;
}

const CollectionCard: React.FC<CollectionCardProps> = ({ collection }) => {
  const [isLiked, setIsLiked] = useState(false);
  const [detailOpen, setDetailOpen] = useState(false);
  
  const toggleLike = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsLiked(!isLiked);
  };
  
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
    <>
      <Card 
        className="overflow-hidden hover:ring-1 hover:ring-purple-500 transition-all cursor-pointer"
        onClick={() => setDetailOpen(true)}
      >
        <div className={`h-40 flex items-center justify-center ${getBgGradient(collection.type)}`}>
          <div className="absolute top-2 right-2 z-10">
            <button 
              onClick={toggleLike} 
              className={`p-2 rounded-full ${isLiked ? 'bg-purple-500' : 'bg-gray-800 bg-opacity-60 hover:bg-gray-700'}`}
              aria-label={isLiked ? "Unlike" : "Like"}
            >
              <Heart className={`h-5 w-5 ${isLiked ? 'fill-white text-white' : 'text-white'}`} />
            </button>
          </div>
          <span className="text-xl font-bold text-white">{collection.name}</span>
        </div>
        
        <CardContent className="p-4">
          <div className="uppercase text-xs font-semibold tracking-wider text-gray-400 mb-1">COLLECTION</div>
          <h3 className="text-lg font-semibold mb-1">{collection.name}</h3>
          <p className="text-sm text-gray-400 mb-4">{collection.createdBy}</p>
          
          <div className="flex items-center justify-between text-sm text-gray-400 mb-3">
            <div>{collection.itemCount} items</div>
          </div>
          
          <div className="flex flex-wrap gap-2">
            <Badge variant="secondary" className="text-xs bg-dark-300 hover:bg-dark-200">
              {collection.type.charAt(0).toUpperCase() + collection.type.slice(1)}
            </Badge>
          </div>
        </CardContent>
      </Card>
      
      <CollectionDetailDialog
        collection={collection}
        open={detailOpen}
        onOpenChange={setDetailOpen}
        isLiked={isLiked}
        onLikeToggle={() => setIsLiked(!isLiked)}
      />
    </>
  );
};

export default CollectionCard;
