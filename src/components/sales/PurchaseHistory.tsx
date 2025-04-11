
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useAuth } from '@/hooks/useAuth';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Calendar as CalendarIcon, Download, Search } from 'lucide-react';
import { format } from 'date-fns';

export default function PurchaseHistory() {
  const { user } = useAuth();
  const [search, setSearch] = useState('');

  const { data: purchaseHistory, isLoading } = useQuery({
    queryKey: ['purchase-history', user?.id],
    queryFn: async () => {
      if (!user) return [];
      
      const { data } = await supabase.rpc('run_sql_query', {
        query: `
          SELECT 
            'workout' as purchase_type,
            w.id as product_id,
            w.name as product_name,
            wp.purchase_date,
            wp.amount_paid,
            wp.platform_fee,
            wp.creator_earnings,
            wp.status,
            p.username as customer_username,
            p.display_name as customer_name,
            p.avatar_url as customer_avatar
          FROM workout_purchases wp
          JOIN workouts w ON wp.workout_id = w.id
          LEFT JOIN profiles p ON wp.user_id = p.id
          WHERE w.id IN (
            SELECT w.id FROM workouts w
            JOIN weeks wk ON w.week_id = wk.id
            JOIN programs pg ON wk.program_id = pg.id
            WHERE pg.user_id = '${user.id}'
          )
          
          UNION ALL
          
          SELECT 
            'program' as purchase_type,
            p.id as product_id,
            p.name as product_name,
            pp.purchase_date,
            pp.amount_paid,
            pp.platform_fee,
            pp.creator_earnings,
            pp.status,
            pr.username as customer_username,
            pr.display_name as customer_name,
            pr.avatar_url as customer_avatar
          FROM program_purchases pp
          JOIN programs p ON pp.program_id = p.id
          LEFT JOIN profiles pr ON pp.user_id = pr.id
          WHERE p.user_id = '${user.id}'
          
          ORDER BY purchase_date DESC
        `
      });
      
      return data || [];
    },
    enabled: !!user
  });

  const filterPurchases = () => {
    if (!purchaseHistory) return [];
    if (!search.trim()) return purchaseHistory;
    
    const searchLower = search.toLowerCase();
    return purchaseHistory.filter(purchase => {
      return (
        purchase.product_name?.toLowerCase().includes(searchLower) ||
        purchase.customer_name?.toLowerCase().includes(searchLower) ||
        purchase.customer_username?.toLowerCase().includes(searchLower)
      );
    });
  };

  const exportToCsv = () => {
    if (!purchaseHistory?.length) return;
    
    // Prepare CSV content
    const headers = ['Date', 'Type', 'Product', 'Customer', 'Amount', 'Platform Fee', 'Earnings', 'Status'];
    const rows = purchaseHistory.map(p => [
      format(new Date(p.purchase_date), 'yyyy-MM-dd'),
      p.purchase_type,
      p.product_name,
      p.customer_name || p.customer_username || 'Unknown',
      p.amount_paid,
      p.platform_fee,
      p.creator_earnings,
      p.status
    ]);
    
    const csvContent = [
      headers.join(','),
      ...rows.map(row => row.join(','))
    ].join('\n');
    
    // Create download link
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    
    link.setAttribute('href', url);
    link.setAttribute('download', `sales_${format(new Date(), 'yyyy-MM-dd')}.csv`);
    link.style.display = 'none';
    
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const filteredPurchases = filterPurchases();
  
  return (
    <Card className="bg-dark-100 border-dark-300">
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle className="text-xl">Purchase History</CardTitle>
        <Button 
          variant="outline"
          size="sm"
          className="flex items-center gap-1"
          onClick={exportToCsv}
          disabled={!purchaseHistory?.length}
        >
          <Download className="h-4 w-4" />
          <span>Export</span>
        </Button>
      </CardHeader>
      <CardContent>
        <div className="relative mb-4">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-500" />
          <Input
            className="pl-9 bg-dark-200 border-dark-300"
            placeholder="Search by product or customer..."
            value={search}
            onChange={e => setSearch(e.target.value)}
          />
        </div>
        
        {isLoading ? (
          <div className="text-center py-8">Loading purchase history...</div>
        ) : !filteredPurchases.length ? (
          <div className="text-center py-8 text-gray-400">
            {purchaseHistory?.length ? 
              'No results match your search criteria.' : 
              'No purchase history found.'}
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="text-left text-sm text-gray-400 border-b border-dark-300">
                  <th className="pb-2 font-medium">Date</th>
                  <th className="pb-2 font-medium">Type</th>
                  <th className="pb-2 font-medium">Product</th>
                  <th className="pb-2 font-medium">Customer</th>
                  <th className="pb-2 font-medium text-right">Amount</th>
                  <th className="pb-2 font-medium text-right">You Receive</th>
                </tr>
              </thead>
              <tbody>
                {filteredPurchases.map((purchase, i) => (
                  <tr key={i} className="border-b border-dark-300 text-sm">
                    <td className="py-3">
                      <div className="flex items-center">
                        <CalendarIcon className="h-3 w-3 mr-2 text-gray-500" />
                        {format(new Date(purchase.purchase_date), 'MMM d, yyyy')}
                      </div>
                    </td>
                    <td className="py-3 capitalize">
                      {purchase.purchase_type}
                    </td>
                    <td className="py-3">
                      {purchase.product_name}
                    </td>
                    <td className="py-3">
                      <div className="flex items-center">
                        {purchase.customer_avatar && (
                          <div className="h-5 w-5 rounded-full overflow-hidden mr-2">
                            <img 
                              src={purchase.customer_avatar} 
                              alt={purchase.customer_name || 'Customer'} 
                              className="h-full w-full object-cover"
                            />
                          </div>
                        )}
                        <span>{purchase.customer_name || purchase.customer_username || 'Unknown User'}</span>
                      </div>
                    </td>
                    <td className="py-3 text-right">
                      ${Number(purchase.amount_paid).toFixed(2)}
                    </td>
                    <td className="py-3 text-right font-medium text-green-500">
                      ${Number(purchase.creator_earnings).toFixed(2)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
