
import React from 'react';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { User } from 'lucide-react';
import { format } from 'date-fns';

interface SharedContentItemProps {
  id: string;
  name: string;
  isPurchasable?: boolean;
  price?: number;
  createdAt: string;
  sharedBy?: {
    displayName?: string;
    username?: string;
  };
  onClick: () => void;
}

const SharedContentItem: React.FC<SharedContentItemProps> = ({
  name,
  isPurchasable,
  price,
  createdAt,
  sharedBy,
  onClick
}) => {
  return (
    <Card 
      className="p-4 hover:bg-card/60 cursor-pointer"
      onClick={onClick}
    >
      <div className="flex justify-between items-start">
        <div>
          <div className="flex items-center mb-1">
            <h3 className="font-medium">{name}</h3>
            {isPurchasable && (
              <Badge variant="secondary" className="ml-2">
                ${price || 0}
              </Badge>
            )}
          </div>
          {sharedBy && (
            <div className="flex items-center text-sm text-muted-foreground">
              <User className="h-3 w-3 mr-1" />
              <span>
                Shared by {sharedBy.displayName || sharedBy.username || 'Member'}
              </span>
            </div>
          )}
        </div>
        <div className="text-xs text-muted-foreground">
          {format(new Date(createdAt), 'MMM d, yyyy')}
        </div>
      </div>
    </Card>
  );
};

export default SharedContentItem;
