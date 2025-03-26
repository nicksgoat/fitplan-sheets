
import React, { useState, useEffect, useRef } from "react";
import { Check, X } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

interface EditableTitleProps {
  value: string;
  onSave: (value: string) => void;
  className?: string;
  placeholder?: string;
  isEditing?: boolean;
  onEditingChange?: (isEditing: boolean) => void;
}

const EditableTitle: React.FC<EditableTitleProps> = ({
  value,
  onSave,
  className = "",
  placeholder = "Enter a name",
  isEditing: externalIsEditing,
  onEditingChange
}) => {
  const [isEditing, setIsEditing] = useState(externalIsEditing || false);
  const [editValue, setEditValue] = useState(value);
  const inputRef = useRef<HTMLInputElement>(null);
  
  // Sync with external editing state if provided
  useEffect(() => {
    if (externalIsEditing !== undefined) {
      setIsEditing(externalIsEditing);
    }
  }, [externalIsEditing]);
  
  // Notify parent of editing state changes
  useEffect(() => {
    if (onEditingChange) {
      onEditingChange(isEditing);
    }
  }, [isEditing, onEditingChange]);
  
  // Focus input when editing starts
  useEffect(() => {
    if (isEditing && inputRef.current) {
      inputRef.current.focus();
      inputRef.current.select();
    }
  }, [isEditing]);
  
  const handleSave = () => {
    if (editValue.trim()) {
      onSave(editValue);
    } else {
      setEditValue(value); // Reset to original if empty
    }
    setIsEditing(false);
  };
  
  const handleCancel = () => {
    setEditValue(value);
    setIsEditing(false);
  };
  
  const handleDoubleClick = () => {
    // Only handle double-click if not already editing
    if (!isEditing) {
      setIsEditing(true);
    }
  };
  
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      handleSave();
    } else if (e.key === "Escape") {
      handleCancel();
    }
  };
  
  if (isEditing) {
    return (
      <div className={`flex items-center gap-1 ${className}`}>
        <Input
          ref={inputRef}
          value={editValue}
          onChange={(e) => setEditValue(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder={placeholder}
          className="h-8"
          autoFocus
        />
        <div className="flex gap-1">
          <Button 
            variant="ghost" 
            size="icon" 
            className="h-7 w-7" 
            onClick={handleSave}
          >
            <Check className="h-4 w-4" />
          </Button>
          <Button 
            variant="ghost" 
            size="icon" 
            className="h-7 w-7" 
            onClick={handleCancel}
          >
            <X className="h-4 w-4" />
          </Button>
        </div>
      </div>
    );
  }
  
  return (
    <div 
      className={`${className} cursor-pointer hover:underline`}
      onDoubleClick={handleDoubleClick}
      onClick={() => setIsEditing(true)}
    >
      {value || placeholder}
    </div>
  );
};

export default EditableTitle;
