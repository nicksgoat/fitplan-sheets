
import React from "react";
import { TableHead, TableHeader, TableRow } from "@/components/ui/table";

const WorkoutTableHeader: React.FC = () => {
  return (
    <TableHeader>
      <TableRow>
        <TableHead className="w-[50px] text-center border border-muted-foreground/20">
          Actions
        </TableHead>
        <TableHead className="w-[80px] text-left border border-muted-foreground/20">
          Exercise
        </TableHead>
        <TableHead className="w-[200px] text-left border border-muted-foreground/20"></TableHead>
        <TableHead className="w-[100px] text-left border border-muted-foreground/20">
          Reps
        </TableHead>
        <TableHead className="w-[120px] text-left border border-muted-foreground/20">
          Weight/Max
        </TableHead>
        <TableHead className="w-[100px] text-left border border-muted-foreground/20">
          Intensity
        </TableHead>
        <TableHead className="w-[100px] text-left border border-muted-foreground/20">
          Rest
        </TableHead>
        <TableHead className="text-left border border-muted-foreground/20" colSpan={2}>
          Notes
        </TableHead>
      </TableRow>
    </TableHeader>
  );
};

export default WorkoutTableHeader;
