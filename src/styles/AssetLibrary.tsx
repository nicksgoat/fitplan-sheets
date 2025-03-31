
import { cva } from 'class-variance-authority';

// Profile Card styling
export const profileCardStyles = cva(
  "bg-background border rounded-lg shadow-sm overflow-hidden",
  {
    variants: {
      size: {
        default: "p-6",
        compact: "p-4",
        expanded: "p-8",
      },
    },
    defaultVariants: {
      size: "default",
    },
  }
);

// Profile Avatar styling
export const profileAvatarStyles = cva(
  "rounded-full border-2 shadow-md flex items-center justify-center",
  {
    variants: {
      size: {
        sm: "h-12 w-12 text-sm",
        md: "h-24 w-24 text-xl",
        lg: "h-32 w-32 text-2xl",
      },
    },
    defaultVariants: {
      size: "md",
    },
  }
);

// Badge styling
export const badgeStyles = cva(
  "inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2",
  {
    variants: {
      variant: {
        default:
          "border-transparent bg-primary text-primary-foreground",
        secondary:
          "border-transparent bg-secondary text-secondary-foreground",
        destructive:
          "border-transparent bg-destructive text-destructive-foreground",
        outline: "text-foreground",
        social: "bg-muted/20 border-transparent text-foreground hover:bg-muted/30",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  }
);

// Section Header styling
export const sectionHeaderStyles = cva(
  "font-semibold border-b pb-2 mb-4",
  {
    variants: {
      size: {
        sm: "text-lg",
        md: "text-xl",
        lg: "text-2xl",
      },
    },
    defaultVariants: {
      size: "md",
    },
  }
);

// Content Card styling
export const contentCardStyles = cva(
  "bg-background border rounded-lg overflow-hidden transition-all hover:shadow-md",
  {
    variants: {
      variant: {
        default: "border-border",
        featured: "border-primary",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  }
);
