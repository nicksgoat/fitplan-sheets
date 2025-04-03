
import { supabase } from '@/integrations/supabase/client';
import { 
  Club, 
  ClubMember, 
  ClubProduct, 
  MembershipType, 
  ProductType 
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
      membershipType: data.membership_type, 
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
        product_type: 'other',
        max_participants: productDetails.maxParticipants,
        is_active: true
      })
      .select()
      .single();

    if (error) throw error;

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
