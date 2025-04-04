
import React, { useEffect } from 'react';
import { useParams, useNavigate, useLocation, useSearchParams } from 'react-router-dom';
import ClubList from '@/components/clubs/ClubList';
import CreateClubForm from '@/components/clubs/CreateClubForm';
import { useClub } from '@/contexts/ClubContext';
import { Button } from '@/components/ui/button';
import { ArrowLeft } from 'lucide-react';
import ClubLayout from '@/components/clubs/ClubLayout';
import PurchaseReceipt from '@/components/clubs/PurchaseReceipt';
import { toast } from 'sonner';

const Clubs: React.FC = () => {
  const { clubId } = useParams<{ clubId: string }>();
  const location = useLocation();
  const [searchParams] = useSearchParams();
  const { currentClub, setCurrentClub, clubs, loadingClubs, refreshMembers, refreshProducts } = useClub();
  const navigate = useNavigate();
  
  // Check if the current path is the create club path
  const isCreatePath = location.pathname.endsWith('/create');
  // Check if the current path is the receipt path
  const isReceiptPath = location.pathname.includes('/receipt');
  
  // Handle checkout status from query params
  const checkoutStatus = searchParams.get('checkout');
  
  useEffect(() => {
    if (checkoutStatus) {
      if (checkoutStatus === 'success') {
        toast.success('Payment completed successfully!');
        // Refresh data after successful payment
        if (clubId) {
          refreshMembers();
          refreshProducts();
        }
        // Remove the query parameter from the URL
        navigate(location.pathname, { replace: true });
      } else if (checkoutStatus === 'cancelled') {
        toast.error('Payment was cancelled.');
        // Remove the query parameter from the URL
        navigate(location.pathname, { replace: true });
      }
    }
  }, [checkoutStatus, navigate, location.pathname, clubId, refreshMembers, refreshProducts]);
  
  useEffect(() => {
    if (clubId && !isCreatePath && !isReceiptPath) {
      // Load specific club
      const club = clubs.find(c => c.id === clubId);
      if (club) {
        setCurrentClub(club);
      } else if (!loadingClubs) {
        // Club not found and not loading, redirect to clubs list
        navigate('/clubs');
      }
    } else if (!clubId && !isCreatePath && !isReceiptPath) {
      // Clubs list, clear current club
      setCurrentClub(null);
    }
  }, [clubId, isCreatePath, isReceiptPath, clubs, loadingClubs]);
  
  // When viewing a specific club, render the ClubLayout directly without container
  if (clubId && currentClub && !isCreatePath && !isReceiptPath) {
    return <ClubLayout clubId={clubId} />;
  }
  
  // For other views (club list, create form, etc.), render with container
  return (
    <div className="container mx-auto py-6 px-0 max-w-full">
      {isReceiptPath ? (
        <PurchaseReceipt />
      ) : isCreatePath ? (
        <CreateClubForm />
      ) : clubId && !currentClub && !loadingClubs ? (
        <div className="text-center py-16">
          <h2 className="text-xl mb-4">Club not found</h2>
          <Button 
            onClick={() => navigate('/clubs')}
            variant="outline"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Clubs
          </Button>
        </div>
      ) : (
        <ClubList />
      )}
    </div>
  );
};

export default Clubs;
