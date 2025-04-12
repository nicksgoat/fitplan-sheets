
import React from 'react';
import { Button } from '@/components/ui/button';
import { formatCurrency } from '@/utils/workout';
import { GuestCheckoutButton } from '@/components/checkout/GuestCheckoutButton';
import { useStripeCheckout } from '@/hooks/useStripeCheckout';
import { useAuth } from '@/hooks/useAuth';
import { useNavigate } from 'react-router-dom';

interface ProductPurchaseSectionProps {
  itemType: 'workout' | 'program'; 
  itemId: string;
  itemName: string;
  price: number;
  creatorId: string;
  isPurchasable: boolean;
  hasPurchased: boolean;
  isPurchaseLoading: boolean;
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

  if (isPurchaseLoading) {
    return (
      <div className={`border border-gray-700 rounded-lg p-6 ${className}`}>
        <div className="flex justify-center">
          <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-fitbloom-purple"></div>
        </div>
        <p className="text-center text-gray-400 mt-2">Loading...</p>
      </div>
    );
  }

  if (!isPurchasable || !price || price <= 0) {
    return (
      <div className={`border border-gray-700 rounded-lg p-6 text-center ${className}`}>
        <p className="text-gray-400">
          This {itemType} is not available for purchase at this time.
        </p>
      </div>
    );
  }

  if (hasPurchased) {
    return (
      <div className={`border border-green-800/30 rounded-lg p-6 text-center bg-green-900/10 ${className}`}>
        <h3 className="text-xl font-semibold mb-2 text-green-400">Purchased</h3>
        <p className="text-gray-300 mb-4">
          You already own this {itemType}. Enjoy your training!
        </p>
        <Button 
          className="bg-fitbloom-purple hover:bg-fitbloom-purple/90"
          onClick={() => navigate('/sheets')}
        >
          Start Training
        </Button>
      </div>
    );
  }

  return (
    <div className={`border border-gray-700 rounded-lg p-6 ${className}`}>
      <h3 className="text-xl font-semibold mb-2 text-center">Premium {itemType === 'workout' ? 'Workout' : 'Training Program'}</h3>
      <p className="text-gray-400 mb-6 text-center">
        Purchase this {itemType} to see all {itemType === 'workout' ? 'exercises' : 'workouts'} and start your training
      </p>
      
      <div className="mb-4 text-center">
        <span className="text-2xl font-bold text-fitbloom-purple">{formatCurrency(price)}</span>
        <span className="text-gray-400 ml-2">one-time purchase</span>
      </div>
      
      <div className="space-y-4">
        <div className="flex flex-col space-y-2 sm:flex-row sm:space-y-0 sm:space-x-2">
          {user ? (
            <Button 
              onClick={handlePurchase}
              disabled={checkoutLoading}
              className="w-full bg-fitbloom-purple hover:bg-fitbloom-purple/90"
            >
              {checkoutLoading ? 'Processing...' : `Purchase (${formatCurrency(price)})`}
            </Button>
          ) : (
            <Button 
              onClick={() => navigate('/auth')}
              className="w-full"
            >
              Sign in to Purchase
            </Button>
          )}
          
          {!user && (
            <GuestCheckoutButton
              itemType={itemType}
              itemId={itemId}
              itemName={itemName}
              price={price}
              creatorId={creatorId}
            />
          )}
        </div>
        
        <div className="text-sm text-gray-400 text-center">
          <p>Secure payment • Instant access • No subscription</p>
        </div>
      </div>
    </div>
  );
}
