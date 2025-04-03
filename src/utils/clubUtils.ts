
import { supabase } from '@/integrations/supabase/client';
import { MembershipType, ProductType } from '@/types/club';

/**
 * Initiate the checkout process for a club membership or product
 */
export async function initiateCheckout(options: {
  clubId: string,
  userId: string,
  membershipType?: MembershipType,
  productId?: string
}) {
  try {
    const { clubId, userId, membershipType, productId } = options;
    
    if (!membershipType && !productId) {
      throw new Error('Either membershipType or productId must be provided');
    }
    
    const { data, error } = await supabase.functions.invoke('create-checkout', {
      body: {
        clubId,
        userId,
        membershipType,
        productId
      }
    });
    
    if (error) throw error;
    
    if (data.url) {
      // Redirect to Stripe Checkout
      window.location.href = data.url;
      return { success: true };
    } else {
      throw new Error('No checkout URL returned');
    }
  } catch (error) {
    console.error('Checkout error:', error);
    return { 
      success: false, 
      error: error.message || 'Failed to process checkout' 
    };
  }
}

/**
 * Check if a user has an active subscription for a club
 */
export async function checkSubscription(userId: string, clubId: string) {
  try {
    const { data, error } = await supabase.functions.invoke('check-subscription', {
      body: { userId, clubId }
    });
    
    if (error) throw error;
    
    return {
      success: true,
      hasSubscription: data.hasSubscription,
      membershipType: data.membershipType,
      hasPremium: data.hasPremium,
      premiumExpiresAt: data.premiumExpiresAt
    };
  } catch (error) {
    console.error('Subscription check error:', error);
    return { 
      success: false, 
      hasSubscription: false,
      error: error.message || 'Failed to check subscription status' 
    };
  }
}

/**
 * Create a new club product (for admins)
 */
export async function createClubProduct(product: {
  clubId: string,
  name: string,
  description?: string,
  priceAmount: number,
  priceCurrency?: string,
  productType: ProductType,
  maxParticipants?: number,
  dateTime?: string,
  location?: string
}) {
  try {
    const { data, error } = await supabase
      .from('club_products')
      .insert({
        club_id: product.clubId,
        name: product.name,
        description: product.description,
        price_amount: product.priceAmount,
        price_currency: product.priceCurrency || 'usd',
        product_type: product.productType,
        max_participants: product.maxParticipants,
        date_time: product.dateTime,
        location: product.location,
        is_active: true
      })
      .select()
      .single();
    
    if (error) throw error;
    
    return { success: true, product: data };
  } catch (error) {
    console.error('Create product error:', error);
    return { 
      success: false, 
      error: error.message || 'Failed to create product' 
    };
  }
}

/**
 * Get purchase history for a user
 */
export async function getUserPurchaseHistory(userId: string) {
  try {
    const { data, error } = await supabase
      .from('club_product_purchases')
      .select(`
        *,
        product:club_products(*)
      `)
      .eq('user_id', userId)
      .order('purchase_date', { ascending: false });
    
    if (error) throw error;
    
    return { success: true, purchases: data };
  } catch (error) {
    console.error('Get purchases error:', error);
    return { 
      success: false, 
      purchases: [],
      error: error.message || 'Failed to get purchase history' 
    };
  }
}
