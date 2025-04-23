import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Share2, Copy, Twitter, Facebook, Linkedin, Mail } from 'lucide-react';
import { toast } from 'sonner';

interface ShareButtonProps {
  url: string;
  title: string;
  description?: string;
  image?: string;
  variant?: 'default' | 'outline' | 'ghost';
  size?: 'default' | 'sm' | 'icon';
  className?: string;
}

const EnhancedShareButton: React.FC<ShareButtonProps> = ({
  url,
  title,
  description = '',
  image = '',
  variant = 'outline',
  size = 'default',
  className = ''
}) => {
  const [open, setOpen] = useState(false);
  
  const fullUrl = url.startsWith('http') ? url : `${window.location.origin}${url.startsWith('/') ? url : `/${url}`}`;
  
  const shareData = {
    title,
    text: description,
    url: fullUrl,
  };
  
  const handleNativeShare = async () => {
    try {
      if (navigator.share) {
        await navigator.share(shareData);
        
        if (typeof window !== 'undefined' && window.gtag) {
          window.gtag('event', 'share', {
            method: 'native',
            content_type: url.includes('/workout/') ? 'workout' : 
                         url.includes('/program/') ? 'program' : 'page',
            item_id: url.split('/').pop()?.split('-')[0] || url
          });
        }
        
        setOpen(false);
      } else {
        setOpen(true);
      }
    } catch (error) {
      console.error('Error sharing:', error);
      setOpen(true);
    }
  };
  
  const copyToClipboard = () => {
    navigator.clipboard.writeText(fullUrl).then(() => {
      toast.success('Link copied to clipboard!');
      
      if (typeof window !== 'undefined' && window.gtag) {
        window.gtag('event', 'share', {
          method: 'copy_link',
          content_type: url.includes('/workout/') ? 'workout' : 
                       url.includes('/program/') ? 'program' : 'page',
          item_id: url.split('/').pop()?.split('-')[0] || url
        });
      }
      
      setOpen(false);
    });
  };
  
  const shareToTwitter = () => {
    const twitterUrl = `https://twitter.com/intent/tweet?text=${encodeURIComponent(
      title
    )}&url=${encodeURIComponent(fullUrl)}`;
    
    window.open(twitterUrl, '_blank');
    
    if (typeof window !== 'undefined' && window.gtag) {
      window.gtag('event', 'share', {
        method: 'twitter',
        content_type: url.includes('/workout/') ? 'workout' : 
                     url.includes('/program/') ? 'program' : 'page',
        item_id: url.split('/').pop()?.split('-')[0] || url
      });
    }
    
    setOpen(false);
  };
  
  const shareToFacebook = () => {
    const facebookUrl = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(fullUrl)}`;
    window.open(facebookUrl, '_blank');
    
    if (typeof window !== 'undefined' && window.gtag) {
      window.gtag('event', 'share', {
        method: 'facebook',
        content_type: url.includes('/workout/') ? 'workout' : 
                     url.includes('/program/') ? 'program' : 'page',
        item_id: url.split('/').pop()?.split('-')[0] || url
      });
    }
    
    setOpen(false);
  };
  
  const shareToLinkedIn = () => {
    const linkedinUrl = `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(
      fullUrl
    )}&title=${encodeURIComponent(title)}`;
    window.open(linkedinUrl, '_blank');
    
    if (typeof window !== 'undefined' && window.gtag) {
      window.gtag('event', 'share', {
        method: 'linkedin',
        content_type: url.includes('/workout/') ? 'workout' : 
                     url.includes('/program/') ? 'program' : 'page',
        item_id: url.split('/').pop()?.split('-')[0] || url
      });
    }
    
    setOpen(false);
  };
  
  const shareByEmail = () => {
    const emailSubject = encodeURIComponent(title);
    const emailBody = encodeURIComponent(`${description}\n\nCheck it out: ${fullUrl}`);
    const emailUrl = `mailto:?subject=${emailSubject}&body=${emailBody}`;
    
    window.open(emailUrl, '_blank');
    
    if (typeof window !== 'undefined' && window.gtag) {
      window.gtag('event', 'share', {
        method: 'email',
        content_type: url.includes('/workout/') ? 'workout' : 
                     url.includes('/program/') ? 'program' : 'page',
        item_id: url.split('/').pop()?.split('-')[0] || url
      });
    }
    
    setOpen(false);
  };
  
  if (size === 'icon') {
    return (
      <>
        <Button 
          variant={variant} 
          size="icon"
          onClick={handleNativeShare}
          aria-label="Share"
          className={className}
        >
          <Share2 className="h-4 w-4" />
        </Button>
        
        <ShareDialog
          open={open}
          setOpen={setOpen}
          url={fullUrl}
          title={title}
          copyToClipboard={copyToClipboard}
          shareToTwitter={shareToTwitter}
          shareToFacebook={shareToFacebook}
          shareToLinkedIn={shareToLinkedIn}
          shareByEmail={shareByEmail}
        />
      </>
    );
  }
  
  return (
    <>
      <Button 
        variant={variant} 
        size={size}
        onClick={handleNativeShare}
        className={className}
      >
        <Share2 className="h-4 w-4 mr-2" />
        Share
      </Button>
      
      <ShareDialog
        open={open}
        setOpen={setOpen}
        url={fullUrl}
        title={title}
        copyToClipboard={copyToClipboard}
        shareToTwitter={shareToTwitter}
        shareToFacebook={shareToFacebook}
        shareToLinkedIn={shareToLinkedIn}
        shareByEmail={shareByEmail}
      />
    </>
  );
};

interface ShareDialogProps {
  open: boolean;
  setOpen: (open: boolean) => void;
  url: string;
  title: string;
  copyToClipboard: () => void;
  shareToTwitter: () => void;
  shareToFacebook: () => void;
  shareToLinkedIn: () => void;
  shareByEmail: () => void;
}

const ShareDialog: React.FC<ShareDialogProps> = ({
  open,
  setOpen,
  url,
  title,
  copyToClipboard,
  shareToTwitter,
  shareToFacebook,
  shareToLinkedIn,
  shareByEmail,
}) => {
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
              onClick={copyToClipboard}
            >
              <Copy size={16} />
              Copy Link
            </Button>
            
            <Button 
              variant="outline" 
              className="flex items-center justify-center gap-2"
              onClick={shareToTwitter}
            >
              <Twitter size={16} />
              Twitter
            </Button>
            
            <Button 
              variant="outline" 
              className="flex items-center justify-center gap-2"
              onClick={shareToFacebook}
            >
              <Facebook size={16} />
              Facebook
            </Button>
            
            <Button 
              variant="outline" 
              className="flex items-center justify-center gap-2"
              onClick={shareToLinkedIn}
            >
              <Linkedin size={16} />
              LinkedIn
            </Button>
            
            <Button 
              variant="outline" 
              className="flex items-center justify-center gap-2 col-span-2"
              onClick={shareByEmail}
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

export default EnhancedShareButton;
