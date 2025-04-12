
import React from 'react';
import { Link } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { AlertOctagon } from 'lucide-react';

const PurchaseCancel = () => {
  return (
    <div className="container max-w-2xl mx-auto p-4 py-12">
      <Card className="bg-dark-200 border-dark-300 shadow-lg overflow-hidden">
        <CardHeader className="bg-red-900/30 border-b border-red-900/20 pb-8 text-center">
          <AlertOctagon className="w-16 h-16 text-red-500 mx-auto mb-2" />
          <CardTitle className="text-2xl md:text-3xl">Payment Cancelled</CardTitle>
          <CardDescription className="text-gray-400">
            Your purchase was not completed
          </CardDescription>
        </CardHeader>
        <CardContent className="pt-6">
          <div className="space-y-4 text-center">
            <p className="text-lg">
              No worries! Your payment was cancelled and you haven't been charged.
            </p>
            <p className="text-gray-400">
              If you encountered any issues or have questions about the purchase process,
              please contact our support team.
            </p>
          </div>
        </CardContent>
        <CardFooter className="flex flex-col sm:flex-row gap-3 pt-6">
          <Button asChild className="flex-1">
            <Link to="/">Return Home</Link>
          </Button>
          <Button variant="outline" asChild className="flex-1">
            <Link to="/explore">Continue Browsing</Link>
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
};

export default PurchaseCancel;
