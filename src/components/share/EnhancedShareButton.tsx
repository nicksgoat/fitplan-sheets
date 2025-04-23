
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Share2 } from 'lucide-react';
import { useShare } from '@/hooks/useShare';
import { ShareDialog } from './ShareDialog';

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
  variant = 'outline',
  size = 'default',
  className = ''
}) => {
  const [open, setOpen] = useState(false);
  
  const {
    handleNativeShare,
    copyToClipboard,
    shareToTwitter,
    shareToFacebook,
    shareToLinkedIn,
    shareByEmail
  } = useShare({ url, title, text: description });
  
  const handleClick = async () => {
    const nativeShareAvailable = await handleNativeShare();
    if (!nativeShareAvailable) {
      setOpen(true);
    }
  };
  
  if (size === 'icon') {
    return (
      <>
        <Button 
          variant={variant} 
          size="icon"
          onClick={handleClick}
          aria-label="Share"
          className={className}
        >
          <Share2 className="h-4 w-4" />
        </Button>
        
        <ShareDialog
          open={open}
          setOpen={setOpen}
          url={url}
          title={title}
          onCopy={copyToClipboard}
          onTwitterShare={shareToTwitter}
          onFacebookShare={shareToFacebook}
          onLinkedInShare={shareToLinkedIn}
          onEmailShare={shareByEmail}
        />
      </>
    );
  }
  
  return (
    <>
      <Button 
        variant={variant} 
        size={size}
        onClick={handleClick}
        className={className}
      >
        <Share2 className="h-4 w-4 mr-2" />
        Share
      </Button>
      
      <ShareDialog
        open={open}
        setOpen={setOpen}
        url={url}
        title={title}
        onCopy={copyToClipboard}
        onTwitterShare={shareToTwitter}
        onFacebookShare={shareToFacebook}
        onLinkedInShare={shareToLinkedIn}
        onEmailShare={shareByEmail}
      />
    </>
  );
};

export default EnhancedShareButton;
