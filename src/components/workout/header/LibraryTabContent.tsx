
import React from "react";
import { LibraryItem } from "./LibraryItem";
import { ListMusic, FileText, AlbumIcon } from "lucide-react";
import { Workout, WorkoutWeek, WorkoutProgram } from "@/types/workout";

interface LibraryTabContentProps {
  type: "workouts" | "weeks" | "programs";
  items: any[];
  handleDragStart: (e: React.DragEvent, item: any, type: string) => void;
  onAdd: (item: any) => void;
  onDelete: (id: string, type: string) => void;
  emptyMessage: string;
}

export const LibraryTabContent = ({
  type,
  items,
  handleDragStart,
  onAdd,
  onDelete,
  emptyMessage
}: LibraryTabContentProps) => {
  const getIcon = () => {
    switch (type) {
      case "workouts":
        return <ListMusic className="h-4 w-4 mr-2" />;
      case "weeks":
        return <FileText className="h-4 w-4 mr-2" />;
      case "programs":
        return <AlbumIcon className="h-4 w-4 mr-2" />;
    }
  };

  const getTitle = () => {
    switch (type) {
      case "workouts":
        return "Workout Playlists";
      case "weeks":
        return "Training Weeks";
      case "programs":
        return "Training Programs";
    }
  };

  return (
    <div>
      <h3 className="font-medium mb-2">{getTitle()}</h3>
      {items.length > 0 ? (
        <div className="space-y-2">
          {items.map((item) => (
            <LibraryItem
              key={item.id}
              item={{
                ...item,
                type: type === "workouts" ? "workout" : type === "weeks" ? "week" : "program"
              }}
              onDragStart={handleDragStart}
              onAdd={() => onAdd(item)}
              onDelete={() => onDelete(item.id, type === "workouts" ? "workout" : type === "weeks" ? "week" : "program")}
              icon={getIcon()}
            />
          ))}
        </div>
      ) : (
        <p className="text-sm text-gray-500">{emptyMessage}</p>
      )}
    </div>
  );
};
