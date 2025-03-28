
import React from "react";
import { TableHead, TableHeader, TableRow } from "@/components/ui/table";

const WorkoutTableHeader: React.FC = () => {
  return (
    <TableHeader>
      <TableRow className="bg-muted/40">
        <TableHead className="border border-muted-foreground/20 p-2 text-center" style={{ width: "40px" }}>#</TableHead>
        <TableHead className="border border-muted-foreground/20 p-2 exercise-cell">Exercise</TableHead>
        <TableHead className="border border-muted-foreground/20 p-2 numeric-cell text-center">Sets</TableHead>
        <TableHead className="border border-muted-foreground/20 p-2 numeric-cell text-center">Reps</TableHead>
        <TableHead className="border border-muted-foreground/20 p-2 numeric-cell text-center">Weight</TableHead>
        <TableHead className="border border-muted-foreground/20 p-2 numeric-cell text-center">Intensity</TableHead>
        <TableHead className="border border-muted-foreground/20 p-2 numeric-cell text-center">Rest</TableHead>
        <TableHead className="border border-muted-foreground/20 p-2 note-cell">Notes</TableHead>
        <TableHead className="border border-muted-foreground/20 p-2" style={{ width: "70px" }}>Actions</TableHead>
      </TableRow>
    </TableHeader>
  );
};

export default WorkoutTableHeader;
