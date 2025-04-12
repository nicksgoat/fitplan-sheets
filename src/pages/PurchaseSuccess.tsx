
import React, { useEffect, useState } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { CheckCircle } from 'lucide-react';

const PurchaseSuccess = () => {
  const [searchParams] = useSearchParams();
  const [itemType, setItemType] = useState<string>('');
  const [itemId, setItemId] = useState<string>('');

  useEffect(() => {
    const type = searchParams.get('item');
    const id = searchParams.get('id');
    if (type) setItemType(type);
    if (id) setItemId(id);
  }, [searchParams]);

  return (
    <div className="container max-w-2xl mx-auto p-4 py-12">
      <Card className="bg-dark-200 border-dark-300 shadow-lg overflow-hidden">
        <CardHeader className="bg-green-900/30 border-b border-green-900/20 pb-8 text-center">
          <CheckCircle className="w-16 h-16 text-green-500 mx-auto mb-2" />
          <CardTitle className="text-2xl md:text-3xl">Payment Successful!</CardTitle>
          <CardDescription className="text-gray-400">
            Thank you for your purchase
          </CardDescription>
        </CardHeader>
        <CardContent className="pt-6">
          <div className="space-y-4">
            <div className="text-center mb-6">
              <h3 className="text-lg font-medium">Your {itemType} purchase was successful</h3>
              <p className="text-gray-400 mt-2">
                You can now access your purchased content in your library.
              </p>
            </div>
            
            <div className="bg-dark-300 rounded-md p-4 border border-dark-400">
              <h4 className="font-medium">What's next?</h4>
              <ul className="mt-2 space-y-2 text-gray-400">
                <li>• Check out your purchase in your Library</li>
                <li>• Start using your newly purchased content right away</li>
                <li>• Need help? Contact customer support</li>
              </ul>
            </div>
          </div>
        </CardContent>
        <CardFooter className="flex flex-col sm:flex-row gap-3 pt-0">
          <Button asChild className="flex-1">
            <Link to="/library">Go to Library</Link>
          </Button>
          <Button variant="outline" asChild className="flex-1">
            <Link to="/">Return Home</Link>
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
};

export default PurchaseSuccess;
