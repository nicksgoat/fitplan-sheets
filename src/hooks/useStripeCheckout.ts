
import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { toast } from 'sonner';

interface CheckoutParams {
  itemType: 'workout' | 'program';
  itemId: string;
  itemName: string;
  price: number;
  creatorId: string;
}

export function useStripeCheckout() {
  const [loading, setLoading] = useState(false);
  const { user } = useAuth();

  const initiateCheckout = async ({ itemType, itemId, itemName, price, creatorId }: CheckoutParams) => {
    if (!user) {
      toast.error('You must be logged in to make a purchase');
      return;
    }

    try {
      setLoading(true);

      const { data, error } = await supabase.functions.invoke('create-checkout-session', {
        body: {
          itemType,
          itemId,
          itemName,
          price,
          userId: user.id,
          creatorId
        }
      });

      if (error) {
        throw error;
      }

      if (data && data.url) {
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
