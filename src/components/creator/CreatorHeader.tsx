
import React from 'react';
import { useProfile } from '@/hooks/useProfile';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { LayoutDashboard } from 'lucide-react';

const CreatorHeader = () => {
  const { profile, isLoading } = useProfile();

  return (
    <div className="py-6 space-y-4">
      <div className="flex items-center space-x-4">
        <LayoutDashboard className="h-8 w-8 text-fitbloom-purple" />
        <h1 className="text-3xl font-bold tracking-tight">Creator Dashboard</h1>
      </div>
      
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <Avatar className="h-12 w-12">
            <AvatarImage src={profile?.avatar_url || ''} />
            <AvatarFallback>{profile?.display_name?.[0] || 'U'}</AvatarFallback>
          </Avatar>
          <div>
            <h2 className="text-xl font-semibold">{profile?.display_name || 'Creator'}</h2>
            <p className="text-muted-foreground">Manage your products and monitor sales</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CreatorHeader;
