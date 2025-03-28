
import React from 'react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

interface CategoryButtonProps {
  name: string;
  active?: boolean;
  onClick?: () => void;
}

const CategoryButton = ({ name, active = false, onClick }: CategoryButtonProps) => {
  return (
    <Button
      variant="outline"
      className={cn(
        "rounded-full border-sidebar-accent bg-sidebar-accent text-white hover:bg-fitbloom-purple hover:text-white transition-all",
        active && "bg-fitbloom-purple text-white"
      )}
      onClick={onClick}
    >
      {name}
    </Button>
  );
};

export default CategoryButton;
