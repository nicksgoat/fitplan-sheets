
import * as React from "react";
import { cn } from "@/lib/utils";

interface ContainerProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
  size?: "default" | "sm" | "lg" | "xl";
}

export function Container({ 
  children, 
  className, 
  size = "default", 
  ...props 
}: ContainerProps) {
  return (
    <div
      className={cn(
        "w-full px-4 mx-auto",
        {
          "max-w-7xl": size === "default",
          "max-w-5xl": size === "sm",
          "max-w-screen-xl": size === "lg",
          "max-w-screen-2xl": size === "xl",
        },
        className
      )}
      {...props}
    >
      {children}
    </div>
  );
}
