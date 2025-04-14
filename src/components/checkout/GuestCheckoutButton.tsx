
import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { useStripeCheckout } from '@/hooks/useStripeCheckout';
import { toast } from 'sonner';
import { formatCurrency } from '@/utils/workout';

interface GuestCheckoutButtonProps {
  itemType: 'workout' | 'program' | 'club';
  itemId: string;
  itemName: string;
  price: number;
  creatorId: string;
  variant?: 'default' | 'secondary' | 'outline';
  size?: 'default' | 'sm' | 'lg';
}

// Simplified version until we have the database table
interface ReferralCodeData {
  code: string;
  discount_percent: number;
  is_active: boolean;
  expiry_date: string | null;
  max_uses: number | null;
  usage_count: number;
}

export function GuestCheckoutButton({ 
  itemType, 
  itemId, 
  itemName, 
  price, 
  creatorId,
  variant = 'default', 
  size = 'default'
}: GuestCheckoutButtonProps) {
  const [open, setOpen] = useState(false);
  const [email, setEmail] = useState('');
  const [savedEmail, setSavedEmail] = useState<string | null>(null);
  const [referralCode, setReferralCode] = useState('');
  const [isValidatingCode, setIsValidatingCode] = useState(false);
  const [validReferralCode, setValidReferralCode] = useState<ReferralCodeData | null>(null);
  const [discountedPrice, setDiscountedPrice] = useState<number | null>(null);
  const [isApplePaySupported, setIsApplePaySupported] = useState(false);
  const { initiateCheckout, loading } = useStripeCheckout();
  
  // Check for previously used guest email and Apple Pay support
  useEffect(() => {
    const previousEmail = localStorage.getItem('guestEmail');
    setSavedEmail(previousEmail);
    if (previousEmail) {
      setEmail(previousEmail);
    }
    
    // Check URL for referral code
    const urlParams = new URLSearchParams(window.location.search);
    const refFromUrl = urlParams.get('ref');
    if (refFromUrl) {
      setReferralCode(refFromUrl);
      validateReferralCode(refFromUrl);
    }
    
    // Check if Apple Pay is supported
    const checkApplePaySupport = () => {
      // Check if we're on a device and browser that supports Apple Pay
      const isAppleDevice = /iPhone|iPad|iPod|Mac/.test(navigator.userAgent);
      const isSafari = /^((?!chrome|android).)*safari/i.test(navigator.userAgent);
      
      setIsApplePaySupported(isAppleDevice && isSafari);
    };
    
    checkApplePaySupport();
  }, []);
  
  const validateReferralCode = async (code: string) => {
    if (!code.trim()) {
      setValidReferralCode(null);
      setDiscountedPrice(null);
      return;
    }
    
    setIsValidatingCode(true);
    
    try {
      // Temporary mock validation until we have the table
      // This will be replaced with a real database query once tables are created
      if (code === 'DEMO10') {
        const mockCode: ReferralCodeData = {
          code: 'DEMO10',
          discount_percent: 10,
          is_active: true,
          expiry_date: null,
          max_uses: null,
          usage_count: 5
        };
        
        // Valid code
        setValidReferralCode(mockCode);
        
        // Calculate discounted price
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
  
  const handleEmailSubmit = (e: React.FormEvent, paymentMethod: 'standard' | 'apple_pay' = 'standard') => {
    e.preventDefault();
    
    if (!email.trim() || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      toast.error('Please enter a valid email address');
      return;
    }
    
    // Store email in localStorage for later use
    localStorage.setItem('guestEmail', email);
    
    // Get referral source if available
    const urlParams = new URLSearchParams(window.location.search);
    const referralSource = urlParams.get('ref') || urlParams.get('source') || undefined;
    
    // Proceed with checkout
    initiateCheckout({
      itemType,
      itemId,
      itemName,
      price: discountedPrice || price,
      creatorId,
      guestEmail: email,
      referralSource,
      referralCode: validReferralCode?.code,
      paymentMethod
    });
    
    setOpen(false);
  };

  const buttonText = loading 
    ? 'Processing...' 
    : `Quick Purchase (${formatCurrency(discountedPrice || price)})`;
  
  return (
    <>
      <Button 
        onClick={() => setOpen(true)}
        className={variant === 'default' ? "bg-fitbloom-purple hover:bg-fitbloom-purple/90" : ""}
        variant={variant}
        size={size}
        disabled={loading}
      >
        {buttonText}
      </Button>
      
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="bg-dark-100 text-white">
          <DialogHeader>
            <DialogTitle>Quick Purchase</DialogTitle>
            <DialogDescription>
              Enter your email to continue with purchase. You can create an account later.
            </DialogDescription>
          </DialogHeader>
          
          <form onSubmit={(e) => handleEmailSubmit(e)} className="space-y-4">
            <div className="space-y-2">
              <label htmlFor="email" className="block text-sm font-medium">
                Email Address
              </label>
              <Input
                id="email"
                type="email"
                placeholder="your@email.com"
                className="bg-dark-200 border-gray-700"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>
            
            <div className="space-y-2">
              <label htmlFor="referralCode" className="block text-sm font-medium">
                Referral Code (optional)
              </label>
              <div className="flex items-center gap-2">
                <Input
                  id="referralCode"
                  placeholder="FRIEND20"
                  className="bg-dark-200 border-gray-700"
                  value={referralCode}
                  onChange={(e) => setReferralCode(e.target.value)}
                  onBlur={() => validateReferralCode(referralCode)}
                />
                <Button 
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => validateReferralCode(referralCode)}
                  disabled={isValidatingCode || !referralCode}
                >
                  {isValidatingCode ? 'Validating...' : 'Apply'}
                </Button>
              </div>
              
              {validReferralCode && discountedPrice !== null && (
                <div className="mt-2 text-green-400 text-xs flex items-center gap-1">
                  <span className="bg-green-900/30 border border-green-800/30 px-2 py-1 rounded">
                    {validReferralCode.discount_percent}% discount applied: {formatCurrency(price)} → {formatCurrency(discountedPrice)}
                  </span>
                </div>
              )}
            </div>
            
            {savedEmail && email !== savedEmail && (
              <div className="text-xs text-amber-400">
                <p>Use a different email than your previous purchase? You may need to create separate accounts later.</p>
              </div>
            )}
            
            <div className="text-xs text-gray-400">
              <p>You'll receive a receipt and access instructions at this email.</p>
            </div>
            
            <div className="flex flex-col space-y-2">
              <Button 
                type="submit" 
                className="w-full bg-fitbloom-purple hover:bg-fitbloom-purple/90"
                disabled={loading}
              >
                {loading ? 'Processing...' : 'Continue to Payment'}
              </Button>
              
              {isApplePaySupported && (
                <Button 
                  type="button" 
                  className="w-full bg-black hover:bg-gray-900 text-white flex items-center justify-center gap-2"
                  disabled={loading}
                  onClick={(e) => handleEmailSubmit(e, 'apple_pay')}
                >
                  <svg 
                    viewBox="0 0 24 24" 
                    className="h-5 w-5 text-white"
                    fill="currentColor"
                  >
                    <path d="M18.96 5.73c-1.36.06-3 .8-3.96 1.8-.87.95-1.62 2.43-1.33 3.87 1.45.11 2.94-.73 3.93-1.66.97-.96 1.63-2.4 1.36-3.99zM19.32 12.3c-.99-.11-1.82.53-2.42.53s-1.34-.52-2.26-.52c-1.89.05-3.84 1.58-3.84 4.76 0 3.05 2.7 4.93 2.7 4.93-.05.08-.62 2.15-2.07 2.15-1.24 0-1.7-.74-2.64-.74-.9 0-1.73.77-2.63.77-1.42.03-2.5-1.95-3.43-3.93-1-2.02-1.73-4.77-1.73-7.5 0-4.36 2.84-6.67 5.63-6.67 1.48-.03 2.87.99 3.77.99.87 0 2.5-1.09 4.22-1.09.67 0 3.06.27 4.5 3.1-3.91 2.08-3.3 6.89.2 8.22z"/>
                  </svg>
                  <span>Apple Pay</span>
                </Button>
              )}
            </div>
            
            <div className="flex justify-end">
              <Button type="button" variant="outline" onClick={() => setOpen(false)}>
                Cancel
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </>
  );
}
