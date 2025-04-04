
import { supabase } from '@/integrations/supabase/client';
import { 
  Club, 
  ClubMember, 
  ClubProduct, 
  ClubProductPurchase,
  MembershipType, 
  ProductType,
  RefundStatus,
  SubscriptionStatus,
  PurchaseStatus,
  ClubSubscription
} from '@/types/club';

/**
 * Check if a user has a premium or VIP membership for a club
 */
export async function checkPremiumStatus(userId: string, clubId: string): Promise<{
  hasPremium: boolean;
  membershipType: MembershipType;
  premiumExpiresAt?: string;
}> {
  try {
    const { data, error } = await supabase
      .from('club_members')
      .select('membership_type, premium_expires_at')
      .eq('user_id', userId)
      .eq('club_id', clubId)
      .single();

    if (error) throw error;

    const hasPremium = 
      data.membership_type === 'premium' || 
      data.membership_type === 'vip';
    
    const premiumExpiresAt = data.premium_expires_at;

    return { 
      hasPremium, 
      membershipType: data.membership_type as MembershipType, 
      premiumExpiresAt 
    };
  } catch (error) {
    console.error('Error checking premium status:', error);
    return { 
      hasPremium: false, 
      membershipType: 'free' 
    };
  }
}

/**
 * Create a club product (event, coaching, etc)
 */
export async function createClubProduct(
  productDetails: {
    clubId: string;
    name: string;
    description?: string;
    priceAmount: number;
    priceCurrency?: string;
    productType: ProductType;
    maxParticipants?: number;
    dateTime?: string;
    location?: string;
  }
): Promise<{ success: boolean; data?: ClubProduct; error?: string }> {
  try {
    const { data, error } = await supabase
      .from('club_products')
      .insert({
        club_id: productDetails.clubId,
        name: productDetails.name,
        description: productDetails.description,
        price_amount: productDetails.priceAmount,
        price_currency: productDetails.priceCurrency || 'usd',
        product_type: productDetails.productType,
        max_participants: productDetails.maxParticipants,
        date_time: productDetails.dateTime,
        location: productDetails.location,
        is_active: true
      })
      .select()
      .single();

    if (error) throw error;
    if (!data) throw new Error('No data returned after product creation');

    // Explicitly cast the product_type to ensure it matches the ProductType type
    const typedProduct: ClubProduct = {
      ...data,
      product_type: data.product_type as ProductType
    };

    return { success: true, data: typedProduct };
  } catch (error) {
    console.error('Error creating club product:', error);
    return { 
      success: false, 
      error: error instanceof Error ? error.message : 'Unknown error creating product'
    };
  }
}

/**
 * Create a VIP product for a club
 */
export async function createVIPProduct(
  clubId: string, 
  productDetails: {
    name: string;
    description?: string;
    priceAmount: number;
    maxParticipants?: number;
  }
): Promise<ClubProduct | null> {
  try {
    const { data, error } = await supabase
      .from('club_products')
      .insert({
        club_id: clubId,
        name: productDetails.name,
        description: productDetails.description,
        price_amount: productDetails.priceAmount,
        product_type: 'other' as ProductType,
        max_participants: productDetails.maxParticipants,
        is_active: true
      })
      .select()
      .single();

    if (error) throw error;
    if (!data) return null;

    // Explicitly cast the product_type to ensure it matches the ProductType type
    const typedProduct: ClubProduct = {
      ...data,
      product_type: data.product_type as ProductType
    };

    return typedProduct;
  } catch (error) {
    console.error('Error creating VIP product:', error);
    return null;
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
    // Use an RPC function to get a specific subscription with proper typing
    const { data, error } = await supabase.rpc('get_user_club_subscription', {
      user_id_param: userId,
      club_id_param: clubId
    });

    if (error) throw error;
    
    // Handle the case where data is null, undefined, not an array, or empty array
    if (!data || !Array.isArray(data) || data.length === 0) {
      return null;
    }

    // Cast the data to the correct type
    const subscription: ClubSubscription = {
      id: data[0].id,
      user_id: data[0].user_id,
      club_id: data[0].club_id,
      stripe_subscription_id: data[0].stripe_subscription_id,
      status: data[0].status as SubscriptionStatus,
      created_at: data[0].created_at,
      updated_at: data[0].updated_at,
      current_period_start: data[0].current_period_start,
      current_period_end: data[0].current_period_end,
      cancel_at_period_end: data[0].cancel_at_period_end,
      canceled_at: data[0].canceled_at,
      plan_amount: data[0].plan_amount,
      plan_currency: data[0].plan_currency,
      plan_interval: data[0].plan_interval
    };

    return subscription;
  } catch (error) {
    console.error('Error getting user subscription:', error);
    return null;
  }
}

// Export functions from the clubService
export { 
  getUserPurchases,
  getUserSubscriptions,
  requestRefund,
  cancelSubscription
} from '@/services/clubService';
