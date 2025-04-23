
import { useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
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
      
      // Use a direct SQL query instead of rpc since get_referral_stats doesn't exist yet
      const { data, error } = await supabase
        .from('referral_transactions')
        .select(`
          referral_code_id,
          purchase_amount,
          commission_amount,
          discount_amount,
          referral_codes!inner(creator_id)
        `)
        .eq('referral_codes.creator_id', user.id);
      
      if (error) throw error;
      
      if (!data || data.length === 0) {
        // Return default empty stats
        return {
          totalReferralCodes: 0,
          totalReferrals: 0,
          totalCommissionEarnings: 0,
          totalDiscountGiven: 0,
          referralSummary: [],
          recentTransactions: []
        };
      }
      
      // Calculate stats from transactions
      const stats: ReferralStats = {
        totalReferralCodes: 0, // Will be set from referralCodes query
        totalReferrals: data.length,
        totalCommissionEarnings: data.reduce((sum, tx) => sum + tx.commission_amount, 0),
        totalDiscountGiven: data.reduce((sum, tx) => sum + tx.discount_amount, 0),
        referralSummary: [],
        recentTransactions: []
      };
      
      // Get recent transactions with their codes
      const { data: recentTxs, error: recentError } = await supabase
        .from('referral_transactions')
        .select(`
          *,
          referral_codes(code)
        `)
        .eq('referral_codes.creator_id', user.id)
        .order('created_at', { ascending: false })
        .limit(10);
      
      if (!recentError && recentTxs) {
        stats.recentTransactions = recentTxs as unknown as ReferralTransaction[];
      }
      
      return stats as ReferralStats;
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
