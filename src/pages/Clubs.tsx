
import React from 'react';
import { useParams } from 'react-router-dom';
import ClubList from '@/components/clubs/ClubList';
import ClubDetailPage from '@/components/clubs/ClubDetailPage';

const Clubs: React.FC = () => {
  const { clubId } = useParams<{ clubId: string }>();
  
  // If clubId is provided in URL, show the club detail page, otherwise show the club list
  if (clubId) {
    return <ClubDetailPage clubId={clubId} />;
  }
  
  return <ClubList />;
};

export default Clubs;
