
import React, { useState, useEffect, useRef } from "react";
import { cn } from "@/lib/utils";
import { Input } from "./ui/input";

interface EditableTextProps {
  value: string;
  onSave: (value: string) => void;
  className?: string;
  inputClassName?: string;
  placeholder?: string;
  isActive?: boolean;
}

const EditableText: React.FC<EditableTextProps> = ({
  value,
  onSave,
  className,
  inputClassName,
  placeholder = "Enter text",
  isActive = false,
}) => {
  const [isEditing, setIsEditing] = useState(false);
  const [text, setText] = useState(value);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    setText(value);
  }, [value]);

  useEffect(() => {
    if (isEditing && inputRef.current) {
      inputRef.current.focus();
      inputRef.current.select();
    }
  }, [isEditing]);

  const handleDoubleClick = () => {
    if (isActive) {
      setIsEditing(true);
    }
  };

  const handleBlur = () => {
    setIsEditing(false);
    if (text.trim() !== "") {
      onSave(text);
    } else {
      setText(value);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      setIsEditing(false);
      if (text.trim() !== "") {
        onSave(text);
      } else {
        setText(value);
      }
    } else if (e.key === "Escape") {
      setIsEditing(false);
      setText(value);
    }
  };

  if (isEditing) {
    return (
      <Input
        ref={inputRef}
        value={text}
        onChange={(e) => setText(e.target.value)}
        onBlur={handleBlur}
        onKeyDown={handleKeyDown}
        className={cn("h-8 min-w-[100px] px-2 py-1", inputClassName)}
        placeholder={placeholder}
      />
    );
  }

  return (
    <span
      className={cn("cursor-pointer", isActive && "cursor-text", className)}
      onDoubleClick={handleDoubleClick}
      onClick={() => isActive && setIsEditing(true)}
    >
      {value}
    </span>
  );
};

export default EditableText;
