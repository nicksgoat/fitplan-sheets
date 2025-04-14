import React from 'react';
import { Button } from '@/components/ui/button';
import { formatCurrency } from '@/utils/workout';
import { GuestCheckoutButton } from '@/components/checkout/GuestCheckoutButton';
import { useStripeCheckout } from '@/hooks/useStripeCheckout';
import { useAuth } from '@/hooks/useAuth';
import { useNavigate } from 'react-router-dom';
import { Check, Shield } from 'lucide-react';
import { ClubAccessBadge } from '@/components/workout/ClubAccessBadge';

interface ProductPurchaseSectionProps {
  itemType: 'workout' | 'program'; 
  itemId: string;
  itemName: string;
  price: number;
  creatorId: string;
  isPurchasable: boolean;
  hasPurchased: boolean;
  isPurchaseLoading: boolean;
  isClubShared?: boolean;
  sharedWithClubs?: string[];
  className?: string;
}

export function ProductPurchaseSection({
  itemType,
  itemId,
  itemName,
  price,
  creatorId,
  isPurchasable,
  hasPurchased,
  isPurchaseLoading,
  isClubShared = false,
  sharedWithClubs = [],
  className = ''
}: ProductPurchaseSectionProps) {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { initiateCheckout, loading: checkoutLoading } = useStripeCheckout();

  const handlePurchase = () => {
    if (!price) return;
    
    // Get referral source if available
    const urlParams = new URLSearchParams(window.location.search);
    const referralSource = urlParams.get('ref') || urlParams.get('source') || undefined;
    
    initiateCheckout({
      itemType,
      itemId,
      itemName,
      price: parseFloat(price.toString()),
      creatorId,
      referralSource
    });
  };

  console.log('[ProductPurchaseSection]', {
    itemId,
    isPurchasable,
    price,
    hasPurchased,
    isClubShared,
    sharedWithClubs,
    isPurchaseLoading,
    userId: user?.id
  });

  if (isPurchaseLoading) {
    return (
      <div className={`flex justify-center py-4 ${className}`}>
        <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-fitbloom-purple"></div>
      </div>
    );
  }

  if (isClubShared) {
    return (
      <div className={`border border-green-800/30 rounded-lg p-4 text-center bg-green-900/10 ${className}`}>
        <h3 className="text-lg font-semibold mb-1 text-green-400">Available via Club Membership ✓</h3>
        <ClubAccessBadge isClubShared={true} clubs={sharedWithClubs} className="mx-auto mb-2" />
        <Button 
          className="w-full bg-fitbloom-purple hover:bg-fitbloom-purple/90 mt-2"
          onClick={() => navigate('/sheets')}
        >
          Start Training
        </Button>
      </div>
    );
  }

  if (!isPurchasable || !price || price <= 0) {
    return null;
  }

  if (hasPurchased) {
    return (
      <div className={`border border-green-800/30 rounded-lg p-4 text-center bg-green-900/10 ${className}`}>
        <h3 className="text-lg font-semibold mb-1 text-green-400">Purchased ✓</h3>
        <Button 
          className="w-full bg-fitbloom-purple hover:bg-fitbloom-purple/90 mt-2"
          onClick={() => navigate('/sheets')}
        >
          Start Training
        </Button>
      </div>
    );
  }

  return (
    <div className={`p-4 bg-dark-200 rounded-lg ${className}`}>
      <div className="mb-3 text-center">
        <span className="text-3xl font-bold text-fitbloom-purple">{formatCurrency(price)}</span>
        <span className="text-gray-400 text-sm ml-2">one-time</span>
      </div>
      
      <div className="mb-3">
        <div className="flex items-start mb-1.5">
          <Check className="h-4 w-4 text-green-500 mr-1.5 mt-0.5 flex-shrink-0" />
          <span className="text-sm text-gray-200">Full access to all exercises</span>
        </div>
        <div className="flex items-start mb-1.5">
          <Check className="h-4 w-4 text-green-500 mr-1.5 mt-0.5 flex-shrink-0" />
          <span className="text-sm text-gray-200">Track progress in app</span>
        </div>
      </div>
      
      <div className="space-y-2">
        {user ? (
          <Button 
            onClick={handlePurchase}
            disabled={checkoutLoading}
            className="w-full bg-fitbloom-purple hover:bg-fitbloom-purple/90 py-6 text-lg"
          >
            {checkoutLoading ? 'Processing...' : `Buy Now`}
          </Button>
        ) : (
          <div className="flex flex-col space-y-2">
            <Button 
              onClick={() => navigate('/auth')}
              className="w-full py-5"
            >
              Sign in to Buy
            </Button>
            
            <GuestCheckoutButton
              itemType={itemType}
              itemId={itemId}
              itemName={itemName}
              price={price}
              creatorId={creatorId}
            />
          </div>
        )}
        
        <div className="flex justify-center items-center text-xs text-gray-400">
          <Shield className="h-3 w-3 mr-1 text-gray-400" />
          <p>Secure payment • Instant access</p>
        </div>
      </div>
    </div>
  );
}
