
import React from 'react';
import { Badge } from '@/components/ui/badge';
import { Link } from 'lucide-react';
import { SocialLink } from '@/types/profile';

interface SocialLinksDisplayProps {
  socialLinks?: SocialLink[];
}

const SocialLinksDisplay = ({ socialLinks }: SocialLinksDisplayProps) => {
  if (!socialLinks || socialLinks.length === 0) {
    return null;
  }

  return (
    <div className="mt-4 flex flex-wrap gap-2">
      {socialLinks.map((link, index) => (
        <Badge key={index} variant="outline" className="flex items-center">
          <Link className="h-3 w-3 mr-1" />
          <a 
            href={link.url.startsWith('http') ? link.url : `https://${link.url}`} 
            target="_blank" 
            rel="noopener noreferrer"
          >
            {link.platform}
          </a>
        </Badge>
      ))}
    </div>
  );
};

export default SocialLinksDisplay;
