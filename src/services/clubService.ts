
import { supabase } from '@/integrations/supabase/client';
import { 
  ClubProductPurchase, 
  ClubProduct, 
  ClubSubscription,
  PurchaseStatus,
  SubscriptionStatus,
  RefundStatus
} from '@/types/club';

/**
 * Get user's purchases
 */
export async function getUserPurchases(): Promise<ClubProductPurchase[]> {
  try {
    const { data, error } = await supabase
      .from('club_product_purchases')
      .select(`
        *,
        product:club_products(*)
      `)
      .order('purchase_date', { ascending: false });

    if (error) throw error;

    // Cast the data to the correct type
    return data.map(purchase => ({
      ...purchase,
      status: purchase.status as PurchaseStatus,
      refund_status: purchase.refund_status as RefundStatus | undefined,
      product: purchase.product as ClubProduct
    })) as ClubProductPurchase[];
  } catch (error) {
    console.error('Error getting user purchases:', error);
    return [];
  }
}

/**
 * Get user's subscriptions
 */
export async function getUserSubscriptions(): Promise<ClubSubscription[]> {
  try {
    // Instead of using supabase.from('club_subscriptions') directly, 
    // we'll use a more advanced approach for better typing
    const response = await supabase.rpc('get_user_subscriptions');
    
    if (response.error) throw response.error;
    
    // Cast the data to the correct type
    return (response.data || []).map(sub => ({
      ...sub,
      status: sub.status as SubscriptionStatus
    })) as ClubSubscription[];
  } catch (error) {
    console.error('Error getting user subscriptions:', error);
    return [];
  }
}

/**
 * Get user's subscription for a club
 */
export async function getUserClubSubscription(
  userId: string, 
  clubId: string
): Promise<ClubSubscription | null> {
  try {
    // Using RPC instead of direct table access for better typing
    const { data, error } = await supabase.rpc('get_user_club_subscription', {
      user_id_param: userId,
      club_id_param: clubId
    });

    if (error) throw error;
    
    if (!data || data.length === 0) {
      return null;
    }

    // Cast the data to the correct type
    return {
      ...data[0],
      status: data[0].status as SubscriptionStatus
    } as ClubSubscription;
  } catch (error) {
    console.error('Error getting user subscription:', error);
    return null;
  }
}

/**
 * Request a refund for a product purchase
 */
export async function requestRefund(
  purchaseId: string,
  reason: string
): Promise<{ success: boolean; data?: ClubProductPurchase; error?: string }> {
  try {
    const { data, error } = await supabase.functions.invoke('refund-request', {
      body: { purchaseId, reason }
    });

    if (error) throw error;
    
    if (!data.success) {
      return { success: false, error: data.error || 'Unknown error requesting refund' };
    }

    return { 
      success: true, 
      data: {
        ...data.purchase,
        status: data.purchase.status as PurchaseStatus,
        refund_status: data.purchase.refund_status as RefundStatus
      } as ClubProductPurchase 
    };
  } catch (error) {
    console.error('Error requesting refund:', error);
    return { 
      success: false, 
      error: error instanceof Error ? error.message : 'Unknown error requesting refund'
    };
  }
}

/**
 * Cancel a subscription
 */
export async function cancelSubscription(
  subscriptionId: string,
  atPeriodEnd: boolean = true
): Promise<{ success: boolean; data?: ClubSubscription; error?: string }> {
  try {
    const { data, error } = await supabase.functions.invoke('cancel-subscription', {
      body: { subscriptionId, atPeriodEnd }
    });

    if (error) throw error;
    
    if (!data.success) {
      return { success: false, error: data.error || 'Unknown error canceling subscription' };
    }

    return { 
      success: true, 
      data: {
        ...data.subscription,
        status: data.subscription.status as SubscriptionStatus
      } as ClubSubscription
    };
  } catch (error) {
    console.error('Error canceling subscription:', error);
    return { 
      success: false, 
      error: error instanceof Error ? error.message : 'Unknown error canceling subscription'
    };
  }
}
