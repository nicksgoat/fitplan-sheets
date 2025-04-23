
import { useState } from 'react';
import { useMutation, useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { toast } from 'sonner';

// Constants for hardcoded values
const DISCOUNT_PERCENT = 10;  // Fixed 10% discount for customers
const COMMISSION_PERCENT = 15; // Fixed 15% commission for creators

export interface ReferralCode {
  id: string;
  code: string;
  description: string | null;
  discount_percent: number;
  commission_percent: number;
  is_active: boolean;
  created_at: string;
  usage_count: number;
}

export interface ReferralTransaction {
  id: string;
  referral_code_id: string;
  referral_codes: {
    code: string;
  };
  purchase_amount: number;
  commission_amount: number;
  discount_amount: number;
  created_at: string;
  product_type: 'workout' | 'program';
  product_id: string;
}

export interface ReferralStats {
  totalReferralCodes: number;
  totalReferrals: number;
  totalCommissionEarnings: number;
  totalDiscountGiven: number;
  referralSummary: ReferralCode[];
  recentTransactions: ReferralTransaction[];
}

export function useReferralCodes() {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  
  // Get all referral codes for the current creator
  const { data: referralCodes, isLoading, error } = useQuery({
    queryKey: ['referral-codes', user?.id],
    queryFn: async () => {
      if (!user) return [];
      
      const { data, error } = await supabase
        .from('referral_codes')
        .select('*')
        .eq('creator_id', user.id);
        
      if (error) throw error;
      return data;
    },
    enabled: !!user
  });
  
  // Get referral statistics
  const { data: referralStats, isLoading: isStatsLoading } = useQuery({
    queryKey: ['referral-stats', user?.id],
    queryFn: async () => {
      if (!user) return null;
      
      const { data, error } = await supabase.rpc('get_referral_stats');
      
      if (error) throw error;
      return data;
    },
    enabled: !!user
  });
  
  // Create new referral code with fixed discount and commission percentages
  const createReferralCode = useMutation({
    mutationFn: async (codeData: {
      code: string;
      description?: string;
    }) => {
      if (!user) throw new Error('Not authenticated');
      
      const { data, error } = await supabase
        .from('referral_codes')
        .insert({
          creator_id: user.id,
          code: codeData.code,
          description: codeData.description,
          discount_percent: DISCOUNT_PERCENT,
          commission_percent: COMMISSION_PERCENT,
          is_active: true
        })
        .select()
        .single();
      
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['referral-codes'] });
      queryClient.invalidateQueries({ queryKey: ['referral-stats'] });
      toast.success('Referral code created successfully');
    },
    onError: (error: Error) => {
      toast.error(`Failed to create referral code: ${error.message}`);
    }
  });
  
  return {
    referralCodes,
    referralStats,
    isLoading,
    isStatsLoading,
    error,
    createReferralCode,
    DISCOUNT_PERCENT,
    COMMISSION_PERCENT
  };
}
