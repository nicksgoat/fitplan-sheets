
import React, { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Save } from "lucide-react";

interface SaveDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title: string;
  description: string;
  onSave: (name: string) => void;
  buttonText: string;
}

export const SaveDialog = ({
  open,
  onOpenChange,
  title,
  description,
  onSave,
  buttonText
}: SaveDialogProps) => {
  const [name, setName] = useState("");

  const handleSave = () => {
    if (name) {
      onSave(name);
      setName("");
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="item-name" className="text-right">
              Name
            </Label>
            <Input
              id="item-name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="col-span-3"
              autoFocus
              placeholder="Enter a name"
            />
          </div>
          <div className="col-span-4">
            <p className="text-sm text-muted-foreground">
              {description}
            </p>
          </div>
        </div>
        <DialogFooter>
          <Button 
            type="submit" 
            onClick={handleSave}
            disabled={!name}
          >
            <Save className="h-4 w-4 mr-2" />
            {buttonText}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
