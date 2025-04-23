
import { toast } from "sonner";

interface ShareData {
  url: string;
  title: string;
  text?: string;
}

export const useShare = (shareData: ShareData) => {
  const fullUrl = shareData.url.startsWith('http') 
    ? shareData.url 
    : `${window.location.origin}${shareData.url.startsWith('/') ? shareData.url : `/${shareData.url}`}`;
  
  const trackShareEvent = (method: string) => {
    if (typeof window !== 'undefined' && window.gtag) {
      window.gtag('event', 'share', {
        method,
        content_type: fullUrl.includes('/workout/') ? 'workout' : 
                     fullUrl.includes('/program/') ? 'program' : 'page',
        item_id: fullUrl.split('/').pop()?.split('-')[0] || fullUrl
      });
    }
  };

  const handleNativeShare = async () => {
    if (navigator.share) {
      await navigator.share({
        ...shareData,
        url: fullUrl,
      });
      trackShareEvent('native');
      return true;
    }
    return false;
  };

  const copyToClipboard = () => {
    navigator.clipboard.writeText(fullUrl).then(() => {
      toast.success('Link copied to clipboard!');
      trackShareEvent('copy_link');
    });
  };

  const shareToTwitter = () => {
    const url = `https://twitter.com/intent/tweet?text=${encodeURIComponent(
      shareData.title
    )}&url=${encodeURIComponent(fullUrl)}`;
    window.open(url, '_blank');
    trackShareEvent('twitter');
  };

  const shareToFacebook = () => {
    const url = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(fullUrl)}`;
    window.open(url, '_blank');
    trackShareEvent('facebook');
  };

  const shareToLinkedIn = () => {
    const url = `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(
      fullUrl
    )}&title=${encodeURIComponent(shareData.title)}`;
    window.open(url, '_blank');
    trackShareEvent('linkedin');
  };

  const shareByEmail = () => {
    const emailSubject = encodeURIComponent(shareData.title);
    const emailBody = encodeURIComponent(`${shareData.text || ''}\n\nCheck it out: ${fullUrl}`);
    const url = `mailto:?subject=${emailSubject}&body=${emailBody}`;
    window.open(url, '_blank');
    trackShareEvent('email');
  };

  return {
    copyToClipboard,
    shareToTwitter,
    shareToFacebook,
    shareToLinkedIn,
    shareByEmail,
    handleNativeShare
  };
};
