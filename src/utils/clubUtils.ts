
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

    return data;
  } catch (error) {
    console.error('Error creating VIP product:', error);
    return null;
  }
}
