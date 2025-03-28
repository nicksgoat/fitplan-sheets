
import { useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { Avatar } from "@/components/ui/avatar";
import { useMediaQuery } from "@/hooks/use-mobile";
import { LogOut, User } from "lucide-react";

interface UserProfileProps {
  className?: string;
}

const UserProfile = ({ className }: UserProfileProps) => {
  const { user, signOut } = useAuth();
  const [open, setOpen] = useState(false);
  const isMobile = useMediaQuery("(max-width: 640px)");

  if (!user) return null;

  const userInitials = user.email 
    ? user.email.substring(0, 2).toUpperCase() 
    : "U";

  const userEmail = user.email || "User";
  const userPhone = user.phone || "";

  const ProfileContent = () => (
    <div className="flex flex-col items-center space-y-4 p-4">
      <Avatar className="h-20 w-20 text-lg">
        <div className="flex h-full w-full items-center justify-center bg-primary text-primary-foreground">
          {userInitials}
        </div>
      </Avatar>
      
      <div className="text-center">
        <h3 className="text-lg font-medium">{userEmail}</h3>
        {userPhone && <p className="text-sm text-muted-foreground">{userPhone}</p>}
      </div>
      
      <Button 
        onClick={async () => {
          await signOut();
          setOpen(false);
        }}
        variant="outline" 
        className="gap-2 border-dark-300"
      >
        <LogOut className="h-4 w-4" />
        Sign out
      </Button>
    </div>
  );

  if (isMobile) {
    return (
      <Sheet open={open} onOpenChange={setOpen}>
        <SheetTrigger asChild>
          <Button variant="ghost" size="icon" className={className}>
            <User className="h-5 w-5" />
          </Button>
        </SheetTrigger>
        <SheetContent>
          <SheetHeader>
            <SheetTitle>Profile</SheetTitle>
          </SheetHeader>
          <ProfileContent />
        </SheetContent>
      </Sheet>
    );
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="ghost" size="icon" className={className}>
          <User className="h-5 w-5" />
        </Button>
      </DialogTrigger>
      <DialogContent className="border-dark-300 bg-dark-200 text-white">
        <DialogHeader>
          <DialogTitle>Profile</DialogTitle>
        </DialogHeader>
        <ProfileContent />
      </DialogContent>
    </Dialog>
  );
};

export default UserProfile;
