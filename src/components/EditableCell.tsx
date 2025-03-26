
import React, { useRef, useState } from "react";
import { cn } from "@/lib/utils";

interface EditableCellProps {
  value: string | number;
  onChange: (value: string) => void;
  className?: string;
  placeholder?: string;
  type?: "text" | "number";
  onKeyDown?: (e: React.KeyboardEvent<HTMLInputElement>) => void;
}

const EditableCell: React.FC<EditableCellProps> = ({
  value,
  onChange,
  className,
  placeholder = "",
  type = "text",
  onKeyDown,
}) => {
  const [isEditing, setIsEditing] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  
  const handleClick = () => {
    setIsEditing(true);
    // Focus the input in the next tick to ensure it's in the DOM
    setTimeout(() => {
      inputRef.current?.focus();
      inputRef.current?.select();
    }, 0);
  };
  
  const handleBlur = () => {
    setIsEditing(false);
  };
  
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    onChange(e.target.value);
  };
  
  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      inputRef.current?.blur();
    }
    
    if (onKeyDown) {
      onKeyDown(e);
    }
  };
  
  return (
    <div 
      className={cn(
        "editable-cell rounded-md h-full flex items-center",
        className
      )}
      onClick={handleClick}
    >
      <input
        ref={inputRef}
        type={type}
        className="cell-input"
        value={value}
        onChange={handleChange}
        onBlur={handleBlur}
        onKeyDown={handleKeyDown}
        placeholder={placeholder}
      />
    </div>
  );
};

export default EditableCell;
