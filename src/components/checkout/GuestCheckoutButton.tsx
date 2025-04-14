
import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { useStripeCheckout } from '@/hooks/useStripeCheckout';
import { toast } from 'sonner';
import { formatCurrency } from '@/utils/workout';
import { supabase } from '@/integrations/supabase/client';

interface GuestCheckoutButtonProps {
  itemType: 'workout' | 'program' | 'club';
  itemId: string;
  itemName: string;
  price: number;
  creatorId: string;
  variant?: 'default' | 'secondary' | 'outline';
  size?: 'default' | 'sm' | 'lg';
}

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
  const { initiateCheckout, loading } = useStripeCheckout();
  
  // Check for previously used guest email
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
  }, []);
  
  const validateReferralCode = async (code: string) => {
    if (!code.trim()) {
      setValidReferralCode(null);
      setDiscountedPrice(null);
      return;
    }
    
    setIsValidatingCode(true);
    
    try {
      const { data, error } = await supabase
        .from('referral_codes')
        .select('code, discount_percent, is_active, expiry_date, max_uses, usage_count')
        .eq('code', code.trim())
        .eq('is_active', true)
        .single();
      
      if (error || !data) {
        setValidReferralCode(null);
        setDiscountedPrice(null);
        return;
      }
      
      // Check if code is expired
      if (data.expiry_date && new Date(data.expiry_date) < new Date()) {
        toast.error('This referral code has expired');
        setValidReferralCode(null);
        setDiscountedPrice(null);
        return;
      }
      
      // Check if code has reached max uses
      if (data.max_uses !== null && data.usage_count >= data.max_uses) {
        toast.error('This referral code has reached its maximum usage limit');
        setValidReferralCode(null);
        setDiscountedPrice(null);
        return;
      }
      
      // Valid code
      setValidReferralCode(data);
      
      // Calculate discounted price
      if (data.discount_percent > 0) {
        const discount = price * (data.discount_percent / 100);
        setDiscountedPrice(price - discount);
        toast.success(`Referral code applied: ${data.discount_percent}% discount!`);
      }
    } catch (err) {
      console.error('Error validating referral code:', err);
      setValidReferralCode(null);
      setDiscountedPrice(null);
    } finally {
      setIsValidatingCode(false);
    }
  };
  
  const handleEmailSubmit = (e: React.FormEvent) => {
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
      referralCode: validReferralCode?.code
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
          
          <form onSubmit={handleEmailSubmit} className="space-y-4">
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
            
            <div className="flex justify-end gap-2 pt-2">
              <Button type="button" variant="outline" onClick={() => setOpen(false)}>
                Cancel
              </Button>
              <Button 
                type="submit" 
                className="bg-fitbloom-purple hover:bg-fitbloom-purple/90"
                disabled={loading}
              >
                {loading ? 'Processing...' : 'Continue to Payment'}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </>
  );
}
