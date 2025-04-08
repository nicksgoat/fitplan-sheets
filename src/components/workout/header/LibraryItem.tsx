
import React from "react";
import { Button } from "@/components/ui/button";
import { GripVertical, PlusCircle, Trash2 } from "lucide-react";
import { toast } from "sonner";

interface LibraryItemProps {
  item: {
    id: string;
    name: string;
    type: "workout" | "week" | "program";
  };
  onDragStart: (e: React.DragEvent, item: any, type: string) => void;
  onAdd: () => void;
  onDelete: () => void;
  icon: React.ReactNode;
}

export const LibraryItem = ({
  item,
  onDragStart,
  onAdd,
  onDelete,
  icon
}: LibraryItemProps) => {
  return (
    <div 
      draggable
      onDragStart={(e) => onDragStart(e, item, item.type)}
      className="flex items-center p-2 border rounded-md hover:bg-gray-100 dark:hover:bg-gray-800 cursor-grab active:cursor-grabbing"
    >
      <GripVertical className="h-4 w-4 mr-2 text-gray-400" />
      {icon}
      <span className="flex-1">{item.name}</span>
      <div className="flex items-center">
        <Button
          variant="ghost"
          size="icon"
          onClick={onAdd}
          className="h-8 w-8"
          title={`Add to ${item.type === 'program' ? 'current' : item.type === 'week' ? 'program' : 'week'}`}
        >
          <PlusCircle className="h-4 w-4" />
        </Button>
        <Button
          variant="ghost"
          size="icon"
          onClick={onDelete}
          className="h-8 w-8"
          title="Remove from library"
        >
          <Trash2 className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );
};
