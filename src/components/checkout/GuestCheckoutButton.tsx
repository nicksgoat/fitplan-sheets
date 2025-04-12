
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
  const { initiateCheckout, loading } = useStripeCheckout();
  
  // Check for previously used guest email
  useEffect(() => {
    const previousEmail = localStorage.getItem('guestEmail');
    setSavedEmail(previousEmail);
    if (previousEmail) {
      setEmail(previousEmail);
    }
  }, []);
  
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
      price,
      creatorId,
      guestEmail: email,
      referralSource
    });
    
    setOpen(false);
  };

  const buttonText = loading 
    ? 'Processing...' 
    : `Quick Purchase (${formatCurrency(price)})`;
  
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
