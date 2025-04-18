
import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
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
  discount_percent: number; // This will always be DISCOUNT_PERCENT
  commission_percent: number; // This will always be COMMISSION_PERCENT
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

// Mock data until database tables exist
const mockReferralCodes: ReferralCode[] = [
  {
    id: '1',
    code: 'WELCOME10',
    description: 'Welcome discount for new users',
    discount_percent: DISCOUNT_PERCENT,
    commission_percent: COMMISSION_PERCENT,
    is_active: true,
    created_at: new Date().toISOString(),
    usage_count: 3
  },
  {
    id: '2',
    code: 'SUMMER20',
    description: 'Summer promotion',
    discount_percent: DISCOUNT_PERCENT,
    commission_percent: COMMISSION_PERCENT,
    is_active: true,
    created_at: new Date().toISOString(),
    usage_count: 12
  }
];

const mockReferralStats: ReferralStats = {
  totalReferralCodes: 2,
  totalReferrals: 15,
  totalCommissionEarnings: 45.75,
  totalDiscountGiven: 95.50,
  referralSummary: mockReferralCodes,
  recentTransactions: [
    {
      id: '1',
      referral_code_id: '1',
      referral_codes: { code: 'WELCOME10' },
      purchase_amount: 49.99,
      commission_amount: 7.50, // 15% of $49.99
      discount_amount: 5.00,   // 10% of $49.99
      created_at: new Date().toISOString(),
      product_type: 'workout',
      product_id: 'abc123'
    },
    {
      id: '2',
      referral_code_id: '2',
      referral_codes: { code: 'SUMMER20' },
      purchase_amount: 99.99,
      commission_amount: 15.00, // 15% of $99.99
      discount_amount: 10.00,   // 10% of $99.99
      created_at: new Date(Date.now() - 86400000).toISOString(),  // Yesterday
      product_type: 'program',
      product_id: 'def456'
    }
  ]
};

export function useReferralCodes() {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  
  // Get all referral codes for the current creator
  const { data: referralCodes, isLoading, error } = useQuery({
    queryKey: ['referral-codes', user?.id],
    queryFn: async () => {
      if (!user) return [];
      
      // Return mock data until tables exist
      return mockReferralCodes;
    },
    enabled: !!user
  });
  
  // Get referral statistics
  const { data: referralStats, isLoading: isStatsLoading } = useQuery({
    queryKey: ['referral-stats', user?.id],
    queryFn: async () => {
      if (!user) return null;
      
      // Return mock data until tables exist
      return mockReferralStats;
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
      
      // Simulate a delay for the create operation
      await new Promise(resolve => setTimeout(resolve, 500));
      
      // Validate that code doesn't already exist
      if (mockReferralCodes.some(code => code.code === codeData.code)) {
        throw new Error('Code already exists. Please choose a different code.');
      }
      
      // Return a mocked new code with fixed discount and commission
      return {
        id: String(Date.now()),
        code: codeData.code,
        description: codeData.description || null,
        discount_percent: DISCOUNT_PERCENT,
        commission_percent: COMMISSION_PERCENT,
        is_active: true,
        created_at: new Date().toISOString(),
        usage_count: 0
      };
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
    createReferralCode,
    DISCOUNT_PERCENT,
    COMMISSION_PERCENT
  };
}
