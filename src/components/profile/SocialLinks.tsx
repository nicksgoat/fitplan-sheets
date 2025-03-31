
import React from 'react';
import { Button } from '@/components/ui/button';
import { 
  Instagram, 
  Twitter, 
  Facebook, 
  Youtube, 
  Twitch, 
  Globe, 
  Link as LinkIcon,
  Mail,
  Github,
  Linkedin,
  ExternalLink
} from 'lucide-react';
import { SocialLink } from '@/types/profile';

interface SocialLinksProps {
  links: SocialLink[];
  className?: string;
}

const SocialLinks = ({ links, className }: SocialLinksProps) => {
  if (!links || links.length === 0) return null;

  const getPlatformIcon = (platform: string) => {
    const iconProps = { className: "h-5 w-5" };
    
    switch (platform.toLowerCase()) {
      case 'instagram':
        return <Instagram {...iconProps} />;
      case 'twitter':
      case 'x':
        return <Twitter {...iconProps} />;
      case 'facebook':
        return <Facebook {...iconProps} />;
      case 'youtube':
        return <Youtube {...iconProps} />;
      case 'twitch':
        return <Twitch {...iconProps} />;
      case 'github':
        return <Github {...iconProps} />;
      case 'linkedin':
        return <Linkedin {...iconProps} />;
      case 'website':
        return <Globe {...iconProps} />;
      case 'email':
        return <Mail {...iconProps} />;
      default:
        return <LinkIcon {...iconProps} />;
    }
  };

  const formatLink = (link: SocialLink) => {
    const { platform, url } = link;
    if (platform.toLowerCase() === 'email' && !url.startsWith('mailto:')) {
      return `mailto:${url}`;
    }
    if (!url.startsWith('http://') && !url.startsWith('https://') && !url.startsWith('mailto:')) {
      return `https://${url}`;
    }
    return url;
  };

  return (
    <div className={`flex flex-wrap justify-center gap-2 ${className || ''}`}>
      {links.map((link, index) => (
        <Button
          key={index}
          variant="outline"
          size="sm"
          asChild
          className="rounded-full"
        >
          <a 
            href={formatLink(link)} 
            target="_blank" 
            rel="noopener noreferrer"
            className="flex items-center gap-2"
          >
            {getPlatformIcon(link.platform)}
            <span className="hidden md:inline">{link.platform}</span>
            <ExternalLink className="h-3 w-3 ml-1" />
          </a>
        </Button>
      ))}
    </div>
  );
};

export default SocialLinks;
