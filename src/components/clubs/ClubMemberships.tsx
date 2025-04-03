
import React, { useState } from 'react';
import { useClub } from '@/contexts/ClubContext';
import { useAuth } from '@/hooks/useAuth';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardFooter, 
  CardHeader, 
  CardTitle 
} from '@/components/ui/card';
import { toast } from 'sonner';
import { 
  CheckCircle, 
  CircleDollarSign, 
  Info,
  Star 
} from 'lucide-react';

interface ClubMembershipsProps {
  clubId: string;
}

const ClubMemberships: React.FC<ClubMembershipsProps> = ({ clubId }) => {
  const { 
    currentClub, 
    members, 
    isUserClubMember, 
    getUserClubRole,
    upgradeToMembership 
  } = useClub();
  const { user } = useAuth();
  const [loading, setLoading] = useState<{ [key: string]: boolean }>({
    free: false,
    premium: false,
    vip: false
  });

  const currentMembership = isUserClubMember(clubId) ? 
    members.find(member => member.user_id === user?.id)?.membership_type : null;

  const handleUpgrade = async (membershipType: 'free' | 'premium' | 'vip') => {
    if (!user) {
      toast.error('You need to log in to upgrade membership');
      return;
    }

    try {
      setLoading({ ...loading, [membershipType]: true });
      
      if (membershipType === 'premium') {
        // For premium, we'll have a pricing tier that's monthly or yearly
        await upgradeToMembership(clubId, membershipType);
        toast.success(`You've upgraded to Premium membership!`);
      } else if (membershipType === 'free') {
        // Downgrade to free
        await upgradeToMembership(clubId, membershipType);
        toast.success(`Your membership has been changed to Free`);
      }
      // VIP is handled differently - it's for one-off purchases
    } catch (error) {
      console.error('Error upgrading membership:', error);
      toast.error('Failed to upgrade membership. Please try again.');
    } finally {
      setLoading({ ...loading, [membershipType]: false });
    }
  };

  if (!currentClub) return null;

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold mb-2">Club Membership</h2>
        <p className="text-gray-400">
          Choose a membership tier to access different levels of content and features.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Free Tier */}
        <Card className="bg-dark-300 border-dark-400">
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <span>Free Membership</span>
              <Badge className="bg-gray-600">90%</Badge>
            </CardTitle>
            <CardDescription>Basic club access</CardDescription>
          </CardHeader>
          <CardContent className="space-y-2">
            <div className="text-2xl font-bold">$0</div>
            <ul className="space-y-2">
              <li className="flex items-start">
                <CheckCircle className="h-5 w-5 mr-2 text-green-500 shrink-0" />
                <span>Access to club posts and updates</span>
              </li>
              <li className="flex items-start">
                <CheckCircle className="h-5 w-5 mr-2 text-green-500 shrink-0" />
                <span>Join club events</span>
              </li>
              <li className="flex items-start">
                <CheckCircle className="h-5 w-5 mr-2 text-green-500 shrink-0" />
                <span>Participate in community discussions</span>
              </li>
            </ul>
          </CardContent>
          <CardFooter>
            {currentMembership === 'free' ? (
              <Button disabled className="w-full bg-green-700">
                Current Plan
              </Button>
            ) : (
              <Button 
                variant="outline" 
                className="w-full" 
                onClick={() => handleUpgrade('free')}
                disabled={loading.free || !currentMembership}
              >
                {loading.free ? 'Processing...' : 'Downgrade to Free'}
              </Button>
            )}
          </CardFooter>
        </Card>

        {/* Premium Tier */}
        <Card className="bg-dark-300 border-dark-400 relative overflow-hidden">
          {currentMembership === 'premium' && (
            <div className="absolute top-0 right-0 bg-fitbloom-purple text-white px-2 py-1 text-xs transform translate-x-[30%] translate-y-[-30%] rotate-45">
              Current
            </div>
          )}
          <div className="absolute top-0 left-0 right-0 h-1 bg-fitbloom-purple"></div>
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <span>Premium</span>
              <Badge className="bg-fitbloom-purple">10%</Badge>
            </CardTitle>
            <CardDescription>Enhanced club benefits</CardDescription>
          </CardHeader>
          <CardContent className="space-y-2">
            <div className="text-2xl font-bold">
              {currentClub.premium_price ? 
                `$${currentClub.premium_price}/mo` : 
                `$9.99/mo`}
            </div>
            <ul className="space-y-2">
              <li className="flex items-start">
                <CheckCircle className="h-5 w-5 mr-2 text-green-500 shrink-0" />
                <span>All Free tier benefits</span>
              </li>
              <li className="flex items-start">
                <CheckCircle className="h-5 w-5 mr-2 text-green-500 shrink-0" />
                <span>Exclusive premium workouts & programs</span>
              </li>
              <li className="flex items-start">
                <CheckCircle className="h-5 w-5 mr-2 text-green-500 shrink-0" />
                <span>Priority access to club events</span>
              </li>
              <li className="flex items-start">
                <CheckCircle className="h-5 w-5 mr-2 text-green-500 shrink-0" />
                <span>Premium badge on profile</span>
              </li>
            </ul>
          </CardContent>
          <CardFooter>
            {currentMembership === 'premium' ? (
              <Button disabled className="w-full bg-fitbloom-purple">
                Current Plan
              </Button>
            ) : (
              <Button 
                className="w-full bg-fitbloom-purple hover:bg-fitbloom-purple/90" 
                onClick={() => handleUpgrade('premium')}
                disabled={loading.premium}
              >
                {loading.premium ? 'Processing...' : 'Upgrade to Premium'}
              </Button>
            )}
          </CardFooter>
        </Card>

        {/* VIP Tier - One-off purchases */}
        <Card className="bg-dark-300 border-dark-400">
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <span>VIP Exclusives</span>
              <Badge className="bg-amber-600">1%</Badge>
            </CardTitle>
            <CardDescription>Premium one-off purchases</CardDescription>
          </CardHeader>
          <CardContent className="space-y-2">
            <div className="text-2xl font-bold">Custom Pricing</div>
            <ul className="space-y-2">
              <li className="flex items-start">
                <Star className="h-5 w-5 mr-2 text-amber-500 shrink-0" />
                <span>Exclusive coaching sessions</span>
              </li>
              <li className="flex items-start">
                <Star className="h-5 w-5 mr-2 text-amber-500 shrink-0" />
                <span>Special in-person events</span>
              </li>
              <li className="flex items-start">
                <Star className="h-5 w-5 mr-2 text-amber-500 shrink-0" />
                <span>Custom workout programs</span>
              </li>
              <li className="flex items-start">
                <Info className="h-5 w-5 mr-2 text-gray-400 shrink-0" />
                <span className="text-gray-400">One-time purchases</span>
              </li>
            </ul>
          </CardContent>
          <CardFooter>
            <Button 
              variant="outline" 
              className="w-full border-amber-600 text-amber-500 hover:bg-amber-950/30"
              onClick={() => { toast.info('Check out the Products section below!'); }}
            >
              <CircleDollarSign className="h-5 w-5 mr-2" />
              See Available Products
            </Button>
          </CardFooter>
        </Card>
      </div>

      <Separator className="my-8" />

      <div>
        <h2 className="text-2xl font-bold mb-2">Exclusive VIP Products</h2>
        <p className="text-gray-400 mb-6">
          Premium one-time purchases that give you access to exclusive coaching and events.
        </p>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* This will be populated with club products from backend */}
          <Card className="bg-dark-300 border-dark-400 text-center p-8">
            <CircleDollarSign className="h-16 w-16 mx-auto mb-4 text-gray-500" />
            <p className="text-gray-400">
              Club admins will be able to create exclusive VIP products that will appear here.
            </p>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default ClubMemberships;
