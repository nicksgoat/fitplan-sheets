
import React from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Copy, Twitter, Facebook, Linkedin, Mail } from 'lucide-react';

interface ShareDialogProps {
  open: boolean;
  setOpen: (open: boolean) => void;
  url: string;
  title: string;
  onCopy: () => void;
  onTwitterShare: () => void;
  onFacebookShare: () => void;
  onLinkedInShare: () => void;
  onEmailShare: () => void;
}

export const ShareDialog: React.FC<ShareDialogProps> = ({
  open,
  setOpen,
  url,
  title,
  onCopy,
  onTwitterShare,
  onFacebookShare,
  onLinkedInShare,
  onEmailShare
}) => {
  const handleAction = (action: () => void) => {
    action();
    setOpen(false);
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogContent className="bg-dark-100 text-white">
        <DialogHeader>
          <DialogTitle>Share {title}</DialogTitle>
          <DialogDescription>
            Share this content with your friends and followers
          </DialogDescription>
        </DialogHeader>
        
        <div className="p-2">
          <div className="bg-dark-200 p-2 rounded-md text-sm mb-4 overflow-hidden">
            <p className="truncate">{url}</p>
          </div>
          
          <div className="grid grid-cols-2 gap-3">
            <Button 
              variant="outline" 
              className="flex items-center justify-center gap-2"
              onClick={() => handleAction(onCopy)}
            >
              <Copy size={16} />
              Copy Link
            </Button>
            
            <Button 
              variant="outline" 
              className="flex items-center justify-center gap-2"
              onClick={() => handleAction(onTwitterShare)}
            >
              <Twitter size={16} />
              Twitter
            </Button>
            
            <Button 
              variant="outline" 
              className="flex items-center justify-center gap-2"
              onClick={() => handleAction(onFacebookShare)}
            >
              <Facebook size={16} />
              Facebook
            </Button>
            
            <Button 
              variant="outline" 
              className="flex items-center justify-center gap-2"
              onClick={() => handleAction(onLinkedInShare)}
            >
              <Linkedin size={16} />
              LinkedIn
            </Button>
            
            <Button 
              variant="outline" 
              className="flex items-center justify-center gap-2 col-span-2"
              onClick={() => handleAction(onEmailShare)}
            >
              <Mail size={16} />
              Email
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};
