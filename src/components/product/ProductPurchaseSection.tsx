import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { formatCurrency } from '@/utils/workout';
import { GuestCheckoutButton } from '@/components/checkout/GuestCheckoutButton';
import { useStripeCheckout } from '@/hooks/useStripeCheckout';
import { useAuth } from '@/hooks/useAuth';
import { useNavigate } from 'react-router-dom';
import { Check, Shield, Tag, CreditCard, Lock, Globe } from 'lucide-react';
import { ClubAccessBadge } from '@/components/workout/ClubAccessBadge';
import { toast } from 'sonner';

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

interface ReferralCodeData {
  code: string;
  discount_percent: number;
  is_active: boolean;
  expiry_date: string | null;
  max_uses: number | null;
  usage_count: number;
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
  const {
    user
  } = useAuth();
  const navigate = useNavigate();
  const {
    initiateCheckout,
    loading: checkoutLoading
  } = useStripeCheckout();
  const [referralCode, setReferralCode] = useState('');
  const [isValidatingCode, setIsValidatingCode] = useState(false);
  const [validReferralCode, setValidReferralCode] = useState<ReferralCodeData | null>(null);
  const [discountedPrice, setDiscountedPrice] = useState<number | null>(null);
  const [isApplePaySupported, setIsApplePaySupported] = useState(false);

  useEffect(() => {
    const checkApplePaySupport = () => {
      const isAppleDevice = /iPhone|iPad|iPod|Mac/.test(navigator.userAgent);
      const isSafari = /^((?!chrome|android).)*safari/i.test(navigator.userAgent);
      setIsApplePaySupported(isAppleDevice && isSafari);
    };
    checkApplePaySupport();
    const urlParams = new URLSearchParams(window.location.search);
    const refFromUrl = urlParams.get('ref');
    if (refFromUrl) {
      setReferralCode(refFromUrl);
      validateReferralCode(refFromUrl);
    }
  }, []);

  const validateReferralCode = async (code: string) => {
    if (!code.trim()) {
      setValidReferralCode(null);
      setDiscountedPrice(null);
      return;
    }
    setIsValidatingCode(true);
    try {
      if (code === 'DEMO10') {
        const mockCode: ReferralCodeData = {
          code: 'DEMO10',
          discount_percent: 10,
          is_active: true,
          expiry_date: null,
          max_uses: null,
          usage_count: 5
        };
        setValidReferralCode(mockCode);
        if (mockCode.discount_percent > 0) {
          const discount = price * (mockCode.discount_percent / 100);
          setDiscountedPrice(price - discount);
          toast.success(`Referral code applied: ${mockCode.discount_percent}% discount!`);
        }
      } else {
        toast.error('Invalid referral code');
        setValidReferralCode(null);
        setDiscountedPrice(null);
      }
    } catch (err) {
      console.error('Error validating referral code:', err);
      setValidReferralCode(null);
      setDiscountedPrice(null);
    } finally {
      setIsValidatingCode(false);
    }
  };

  const handlePurchase = (paymentMethod: 'standard' | 'apple_pay' = 'standard') => {
    if (!price) return;
    const urlParams = new URLSearchParams(window.location.search);
    const referralSource = urlParams.get('ref') || urlParams.get('source') || undefined;
    initiateCheckout({
      itemType,
      itemId,
      itemName,
      price: discountedPrice !== null ? discountedPrice : parseFloat(price.toString()),
      creatorId,
      referralSource,
      referralCode: validReferralCode?.code,
      paymentMethod
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
    return <div className={`flex justify-center py-4 ${className}`}>
        <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-fitbloom-purple"></div>
      </div>;
  }

  if (isClubShared) {
    return <div className={`border border-green-800/30 rounded-lg p-4 text-center bg-green-900/10 ${className}`}>
        <h3 className="text-lg font-semibold mb-1 text-green-400">Available via Club Membership ✓</h3>
        <ClubAccessBadge isClubShared={true} clubs={sharedWithClubs} className="mx-auto mb-2" />
        <Button className="w-full bg-fitbloom-purple hover:bg-fitbloom-purple/90 mt-2" onClick={() => navigate('/sheets')}>
          Start Training
        </Button>
      </div>;
  }

  if (!isPurchasable || !price || price <= 0) {
    return null;
  }

  if (hasPurchased) {
    return <div className={`border border-green-800/30 rounded-lg p-4 text-center bg-green-900/10 ${className}`}>
        <h3 className="text-lg font-semibold mb-1 text-green-400">Purchased ✓</h3>
        <Button className="w-full bg-fitbloom-purple hover:bg-fitbloom-purple/90 mt-2" onClick={() => navigate('/sheets')}>
          Start Training
        </Button>
      </div>;
  }

  return <div className={`p-4 bg-dark-200/60 backdrop-blur-lg border border-dark-300/50 rounded-lg shadow-lg ${className}`}>
      <div className="mb-3 text-center">
        {discountedPrice !== null ? <div className="flex flex-col items-center">
            <span className="text-3xl font-bold text-fitbloom-purple">{formatCurrency(discountedPrice)}</span>
            <span className="text-sm text-gray-400 line-through">{formatCurrency(price)}</span>
          </div> : <>
            <span className="text-3xl font-bold text-fitbloom-purple">{formatCurrency(price)}</span>
            <span className="text-gray-400 text-sm ml-2">one-time</span>
          </>}
      </div>
      
      {validReferralCode && <div className="mb-3 flex justify-center">
          <div className="bg-green-900/30 border border-green-800/30 px-2 py-1 rounded flex items-center gap-1">
            <Tag className="h-3 w-3 text-green-500" />
            <span className="text-xs text-green-400">
              {validReferralCode.discount_percent}% discount with code: {validReferralCode.code}
            </span>
          </div>
        </div>}
      
      {user && <div className="mb-3">
          <div className="space-y-2">
            <label htmlFor="referralCode" className="block text-xs text-gray-400">
              Have a referral code?
            </label>
            <div className="flex items-center gap-2">
              <Input id="referralCode" placeholder="Enter code" className="bg-dark-300/80 border-dark-400/50 text-sm h-8" value={referralCode} onChange={e => setReferralCode(e.target.value)} onBlur={() => referralCode && validateReferralCode(referralCode)} />
              <Button type="button" variant="outline" size="sm" className="h-8" onClick={() => validateReferralCode(referralCode)} disabled={isValidatingCode || !referralCode}>
                {isValidatingCode ? 'Validating...' : 'Apply'}
              </Button>
            </div>
          </div>
        </div>}
      
      <div className="space-y-2">
        {user ? <div className="grid grid-cols-2 gap-2">
            <Button onClick={() => handlePurchase('standard')} disabled={checkoutLoading} className="w-full bg-fitbloom-purple hover:bg-fitbloom-purple/90 py-6 text-lg flex items-center justify-center">
              {checkoutLoading ? 'Processing...' : `Buy Now`}
            </Button>
            
            {isApplePaySupported && <Button onClick={() => handlePurchase('apple_pay')} disabled={checkoutLoading} className="w-full bg-black hover:bg-gray-900 text-white py-6 flex items-center justify-center gap-2">
                <svg viewBox="0 0 24 24" className="h-5 w-5 text-white" fill="currentColor">
                  <path d="M18.96 5.73c-1.36.06-3 .8-3.96 1.8-.87.95-1.62 2.43-1.33 3.87 1.45.11 2.94-.73 3.93-1.66.97-.96 1.63-2.4 1.36-3.99zM19.32 12.3c-.99-.11-1.82.53-2.42.53s-1.34-.52-2.26-.52c-1.89.05-3.84 1.58-3.84 4.76 0 3.05 2.7 4.93 2.7 4.93-.05.08-.62 2.15-2.07 2.15-1.24 0-1.7-.74-2.64-.74-.9 0-1.73.77-2.63.77-1.42.03-2.5-1.95-3.43-3.93-1-2.02-1.73-4.77-1.73-7.5 0-4.36 2.84-6.67 5.63-6.67 1.48-.03 2.87.99 3.77.99.87 0 2.5-1.09 4.22-1.09.67 0 3.06.27 4.5 3.1-3.91 2.08-3.3 6.89.2 8.22z" />
                </svg>
                <span>Apple Pay</span>
              </Button>}
          </div> : <div className="flex flex-col space-y-2">
            <Button onClick={() => navigate('/auth')} className="w-full py-5">
              Sign in to Buy
            </Button>
            
            <GuestCheckoutButton itemType={itemType} itemId={itemId} itemName={itemName} price={price} creatorId={creatorId} />
          </div>}
        
        <div className="flex justify-center items-center text-xs text-gray-400 mt-2">
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-1">
              <Shield className="h-3 w-3 mr-1 text-green-500" />
              <span>Secure payment</span>
            </div>
            <div className="flex items-center gap-1">
              <Lock className="h-3 w-3 mr-1 text-blue-500" />
              <span>Instant access</span>
            </div>
            <div className="flex items-center gap-1">
              <Globe className="h-3 w-3 mr-1 text-purple-500" />
              <span>Global support</span>
            </div>
          </div>
        </div>
      </div>
    </div>;
}
