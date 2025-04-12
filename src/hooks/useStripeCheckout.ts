
import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { toast } from 'sonner';

interface CheckoutParams {
  itemType: 'workout' | 'program' | 'club';
  itemId: string;
  itemName: string;
  price: number;
  creatorId: string;
  guestEmail?: string;
  referralSource?: string; // Added for tracking referral sources
}

export function useStripeCheckout() {
  const [loading, setLoading] = useState(false);
  const { user } = useAuth();

  const initiateCheckout = async ({ 
    itemType, 
    itemId, 
    itemName, 
    price, 
    creatorId, 
    guestEmail,
    referralSource
  }: CheckoutParams) => {
    try {
      setLoading(true);

      // Handle guest checkout if no user is logged in but guest email is provided
      const isGuestCheckout = !user && guestEmail;
      
      if (!user && !guestEmail) {
        toast.error('You must be logged in or provide an email to make a purchase');
        return;
      }

      const { data, error } = await supabase.functions.invoke('create-checkout-session', {
        body: {
          itemType,
          itemId,
          itemName,
          price,
          userId: user?.id || 'guest',
          creatorId,
          guestEmail: isGuestCheckout ? guestEmail : undefined,
          isGuest: isGuestCheckout,
          referralSource // Pass the referral source to the checkout session
        }
      });

      if (error) {
        throw error;
      }

      if (data && data.url) {
        // Track analytics before redirecting
        try {
          // Check if gtag is available before using it
          if (typeof window !== 'undefined' && window.gtag) {
            window.gtag('event', 'begin_checkout', {
              currency: 'USD',
              value: price,
              items: [{
                item_id: itemId,
                item_name: itemName,
                item_category: itemType,
                price: price,
                // Use index signature to allow additional properties
                // This fixes the TypeScript error
                ...referralSource ? { ['referral_source']: referralSource } : {}
              }]
            });
          }
        } catch (analyticsError) {
          console.error('Analytics error:', analyticsError);
        }
        
        // Save last checkout to localStorage for cross-device continuity
        try {
          localStorage.setItem('lastCheckout', JSON.stringify({
            itemType,
            itemId,
            itemName,
            price,
            timestamp: new Date().toISOString()
          }));
        } catch (storageError) {
          console.error('Storage error:', storageError);
        }
        
        // Redirect to Stripe checkout
        window.location.href = data.url;
      } else {
        throw new Error('Failed to create checkout session');
      }
    } catch (error) {
      console.error('Checkout error:', error);
      toast.error(`Failed to initiate checkout: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  return {
    initiateCheckout,
    loading
  };
}
