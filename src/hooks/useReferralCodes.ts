
import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { toast } from 'sonner';

export interface ReferralCode {
  id: string;
  code: string;
  description: string | null;
  discount_percent: number;
  commission_percent: number;
  is_active: boolean;
  created_at: string;
  expiry_date: string | null;
  max_uses: number | null;
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
  product_type: 'workout' | 'program' | 'club';
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
      
      const { data, error } = await supabase.functions.invoke('run-sql-rpcs', {
        body: {
          sqlName: 'get_creator_referral_codes'
        }
      });
      
      if (error) throw error;
      return data as ReferralCode[];
    },
    enabled: !!user
  });
  
  // Get referral statistics
  const { data: referralStats, isLoading: isStatsLoading } = useQuery({
    queryKey: ['referral-stats', user?.id],
    queryFn: async () => {
      if (!user) return null;
      
      const { data, error } = await supabase.functions.invoke('run-sql-rpcs', {
        body: {
          sqlName: 'get_referral_stats'
        }
      });
      
      if (error) throw error;
      return data as ReferralStats;
    },
    enabled: !!user
  });
  
  // Create new referral code
  const createReferralCode = useMutation({
    mutationFn: async (codeData: {
      code: string;
      description?: string;
      discount_percent?: number;
      commission_percent?: number;
      expiry_date?: string;
      max_uses?: number;
    }) => {
      if (!user) throw new Error('Not authenticated');
      
      const { data, error } = await supabase.functions.invoke('run-sql-rpcs', {
        body: {
          sqlName: 'create_referral_code',
          params: codeData
        }
      });
      
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['referral-codes', user?.id] });
      queryClient.invalidateQueries({ queryKey: ['referral-stats', user?.id] });
      toast.success('Referral code created successfully');
    },
    onError: (error) => {
      toast.error(`Failed to create referral code: ${error.message}`);
    }
  });
  
  return {
    referralCodes,
    referralStats,
    isLoading,
    isStatsLoading,
    error,
    createReferralCode
  };
}
