
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { useStripeCheckout } from '@/hooks/useStripeCheckout';
import { toast } from 'sonner';

interface GuestCheckoutButtonProps {
  itemType: 'workout' | 'program' | 'club';
  itemId: string;
  itemName: string;
  price: number;
  creatorId: string;
}

export function GuestCheckoutButton({ itemType, itemId, itemName, price, creatorId }: GuestCheckoutButtonProps) {
  const [open, setOpen] = useState(false);
  const [email, setEmail] = useState('');
  const { initiateCheckout, loading } = useStripeCheckout();
  
  const handleEmailSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!email.trim() || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      toast.error('Please enter a valid email address');
      return;
    }
    
    // Store email in localStorage for later use
    localStorage.setItem('guestEmail', email);
    
    // Proceed with checkout
    initiateCheckout({
      itemType,
      itemId,
      itemName,
      price,
      creatorId,
      guestEmail: email
    });
    
    setOpen(false);
  };
  
  return (
    <>
      <Button 
        onClick={() => setOpen(true)}
        className="bg-fitbloom-purple hover:bg-fitbloom-purple/90"
        disabled={loading}
      >
        {loading ? 'Processing...' : `Quick Purchase (${new Intl.NumberFormat('en-US', {
          style: 'currency',
          currency: 'USD',
        }).format(price)})`}
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
