
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Share2, Check, Copy, Twitter, Facebook } from 'lucide-react';
import { 
  Popover, 
  PopoverContent, 
  PopoverTrigger 
} from '@/components/ui/popover';
import { toast } from 'sonner';

interface ShareButtonProps {
  url: string;
  title: string;
  description?: string;
  variant?: 'default' | 'outline' | 'ghost';
  size?: 'default' | 'sm' | 'lg' | 'icon';
  className?: string;
}

const ShareButton = ({ 
  url, 
  title, 
  description = '', 
  variant = 'outline',
  size = 'sm',
  className = ''
}: ShareButtonProps) => {
  const [isOpen, setIsOpen] = useState(false);
  const fullUrl = `${window.location.origin}${url}`;
  
  const handleCopy = () => {
    navigator.clipboard.writeText(fullUrl);
    toast.success('Link copied to clipboard');
  };
  
  const handleShare = (platform: 'twitter' | 'facebook') => {
    let shareUrl = '';
    
    if (platform === 'twitter') {
      shareUrl = `https://twitter.com/intent/tweet?url=${encodeURIComponent(fullUrl)}&text=${encodeURIComponent(title)}`;
    } else if (platform === 'facebook') {
      shareUrl = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(fullUrl)}`;
    }
    
    if (shareUrl) {
      window.open(shareUrl, '_blank', 'width=600,height=400');
    }
    
    setIsOpen(false);
  };
  
  // Check if native sharing is available
  const canUseNativeShare = () => {
    return !!navigator.share;
  };
  
  const handleNativeShare = () => {
    if (canUseNativeShare()) {
      navigator.share({
        title,
        text: description,
        url: fullUrl,
      }).catch(err => {
        console.error('Error sharing:', err);
        toast.error('Could not share content');
      });
    }
  };
  
  return (
    <Popover open={isOpen} onOpenChange={setIsOpen}>
      <PopoverTrigger asChild>
        <Button 
          variant={variant} 
          size={size} 
          className={className}
          onClick={() => canUseNativeShare() ? handleNativeShare() : setIsOpen(true)}
        >
          <Share2 className="h-4 w-4 mr-2" />
          Share
        </Button>
      </PopoverTrigger>
      
      {!canUseNativeShare() && (
        <PopoverContent className="w-56 bg-dark-200 border border-dark-300">
          <div className="grid gap-2">
            <h3 className="font-medium mb-1">Share this {url.split('/')[1]}</h3>
            <div className="text-xs text-gray-400 truncate mb-2">{fullUrl}</div>
            
            <div className="flex flex-col gap-2">
              <Button 
                variant="outline" 
                size="sm" 
                className="w-full justify-start" 
                onClick={handleCopy}
              >
                <Copy className="h-4 w-4 mr-2" />
                Copy link
              </Button>
              
              <Button 
                variant="outline" 
                size="sm" 
                className="w-full justify-start" 
                onClick={() => handleShare('twitter')}
              >
                <Twitter className="h-4 w-4 mr-2" />
                Share on Twitter
              </Button>
              
              <Button 
                variant="outline" 
                size="sm" 
                className="w-full justify-start" 
                onClick={() => handleShare('facebook')}
              >
                <Facebook className="h-4 w-4 mr-2" />
                Share on Facebook
              </Button>
            </div>
          </div>
        </PopoverContent>
      )}
    </Popover>
  );
};

export default ShareButton;
