
import React, { useState } from "react";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Save } from "lucide-react";

interface EditItemDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  initialName: string;
  onSave: (name: string) => void;
  itemType: "workout" | "week";
}

export const EditItemDialog = ({
  open,
  onOpenChange,
  initialName,
  onSave,
  itemType
}: EditItemDialogProps) => {
  const [name, setName] = useState(initialName);

  // Reset name when dialog opens with new initialName
  React.useEffect(() => {
    setName(initialName);
  }, [initialName]);

  const handleSave = () => {
    onSave(name);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>
            Rename {itemType === "workout" ? "Workout" : "Week"}
          </DialogTitle>
        </DialogHeader>
        <div className="py-4">
          <Input
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="w-full"
            autoFocus
          />
        </div>
        <DialogFooter>
          <Button type="submit" onClick={handleSave}>
            <Save className="h-4 w-4 mr-2" />
            Save
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
