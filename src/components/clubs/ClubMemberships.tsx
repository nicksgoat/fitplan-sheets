
import React from 'react';
import { useClub } from '@/contexts/ClubContext';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { MembershipType } from '@/types/club';

export function ClubMemberships() {
  const { upgradeToMembership, refreshMembers } = useClub();

  const handleUpgrade = async (membershipType: string) => {
    try {
      await upgradeToMembership(membershipType as MembershipType);
      toast.success(`Upgraded to ${membershipType} membership`);
      refreshMembers();
    } catch (error) {
      toast.error('Failed to upgrade membership');
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h3 className="text-xl font-semibold">Membership Options</h3>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="border rounded-lg p-4 flex flex-col">
          <h4 className="text-lg font-medium mb-2">Free</h4>
          <p className="text-muted-foreground flex-grow mb-4">Basic membership with limited features.</p>
          <Button onClick={() => handleUpgrade('free')} className="w-full">Select Free</Button>
        </div>
        
        <div className="border rounded-lg p-4 flex flex-col bg-muted/50">
          <h4 className="text-lg font-medium mb-2">Premium</h4>
          <p className="text-muted-foreground flex-grow mb-4">Access to premium content and features.</p>
          <Button onClick={() => handleUpgrade('premium')} className="w-full">
            Upgrade to Premium
          </Button>
        </div>
        
        <div className="border rounded-lg p-4 flex flex-col bg-muted/20">
          <h4 className="text-lg font-medium mb-2">VIP</h4>
          <p className="text-muted-foreground flex-grow mb-4">Full access with exclusive benefits.</p>
          <Button onClick={() => handleUpgrade('vip')} variant="outline" className="w-full">
            Upgrade to VIP
          </Button>
        </div>
      </div>
    </div>
  );
}

export default ClubMemberships;
