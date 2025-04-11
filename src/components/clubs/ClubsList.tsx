
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useClub } from '@/contexts/ClubContext';
import { useAuth } from '@/hooks/useAuth';
import { Skeleton } from '@/components/ui/skeleton';
import { Button } from '@/components/ui/button';
import { Users } from 'lucide-react';

const ClubsList = () => {
  const navigate = useNavigate();
  const { clubs, userClubs, loadingClubs } = useClub();
  const { user } = useAuth();
  
  const handleClubClick = (clubId: string) => {
    navigate(`/clubs/${clubId}`);
  };
  
  const handleCreateClub = () => {
    navigate('/clubs/create');
  };
  
  const isUserMemberOfClub = (clubId: string) => {
    return userClubs.some(club => club.id === clubId);
  };
  
  if (loadingClubs) {
    return (
      <div className="space-y-4">
        {[...Array(3)].map((_, i) => (
          <div key={i} className="bg-gray-900 rounded-lg overflow-hidden border border-gray-800">
            <Skeleton className="h-32 w-full" />
            <div className="p-4">
              <Skeleton className="h-6 w-3/4 mb-2" />
              <Skeleton className="h-4 w-full mb-4" />
              <div className="flex justify-between">
                <Skeleton className="h-5 w-16" />
                <Skeleton className="h-5 w-16" />
              </div>
            </div>
          </div>
        ))}
      </div>
    );
  }
  
  if (!loadingClubs && clubs.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-12 text-center">
        <Users className="h-16 w-16 text-gray-500 mb-4" />
        <h3 className="text-lg font-medium text-gray-300 mb-2">No clubs found</h3>
        <p className="text-gray-500 mb-6">Create your first club now!</p>
        <Button onClick={handleCreateClub}>Create Club</Button>
      </div>
    );
  }
  
  const defaultLogoUrl = 'https://images.unsplash.com/photo-1517836357463-d25dfeac3438?auto=format&fit=crop&w=1350&q=80';
  const defaultBannerUrl = 'https://images.unsplash.com/photo-1534438327276-14e5300c3a48?auto=format&fit=crop&w=1350&q=80';
  
  return (
    <div className="space-y-6">
      {/* User's clubs section */}
      {userClubs && userClubs.length > 0 && (
        <div className="mb-8">
          <h2 className="text-xl font-semibold text-white mb-4">Your Clubs</h2>
          <div className="overflow-x-auto pb-4">
            <div className="flex space-x-4">
              {userClubs.map((club) => (
                <div 
                  key={`my-${club.id}`} 
                  className="min-w-[300px] max-w-[300px] bg-gray-900 rounded-lg overflow-hidden border border-gray-800 cursor-pointer hover:bg-gray-800 transition-colors"
                  onClick={() => handleClubClick(club.id)}
                >
                  <div 
                    className="h-32 bg-center bg-cover" 
                    style={{ 
                      backgroundImage: `url(${club.banner_url || defaultBannerUrl})` 
                    }}
                  >
                    <div className="h-full w-full bg-black bg-opacity-30 flex items-center justify-center">
                      <div className="h-16 w-16 rounded-full border-2 border-white overflow-hidden mt-16">
                        <img 
                          src={club.logo_url || defaultLogoUrl} 
                          alt={club.name} 
                          className="h-full w-full object-cover"
                        />
                      </div>
                    </div>
                  </div>
                  <div className="p-4 pt-10">
                    <div className="flex justify-between items-start">
                      <h3 className="text-lg font-semibold text-white truncate">{club.name}</h3>
                      <div className="px-2 py-1 bg-fitbloom-purple text-white text-xs rounded-full">
                        Member
                      </div>
                    </div>
                    <p className="text-gray-400 text-sm mt-2 line-clamp-2">
                      {club.description || `A community for ${club.club_type || 'fitness'} enthusiasts.`}
                    </p>
                    <div className="flex justify-between mt-4 text-sm text-gray-500">
                      <div className="flex items-center">
                        <Users className="h-4 w-4 mr-1 text-fitbloom-purple" />
                        <span>{Math.floor(Math.random() * 100)} members</span>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
      
      {/* All clubs section */}
      <h2 className="text-xl font-semibold text-white mb-4">Discover Clubs</h2>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {clubs.map((club) => {
          const isUserMember = isUserMemberOfClub(club.id);
          
          return (
            <div 
              key={club.id} 
              className="bg-gray-900 rounded-lg overflow-hidden border border-gray-800 cursor-pointer hover:bg-gray-800 transition-colors"
              onClick={() => handleClubClick(club.id)}
            >
              <div 
                className="h-32 bg-center bg-cover" 
                style={{ 
                  backgroundImage: `url(${club.banner_url || defaultBannerUrl})` 
                }}
              >
                <div className="h-full w-full bg-black bg-opacity-30 flex items-center justify-center">
                  <div className="h-16 w-16 rounded-full border-2 border-white overflow-hidden mt-16">
                    <img 
                      src={club.logo_url || defaultLogoUrl} 
                      alt={club.name} 
                      className="h-full w-full object-cover"
                    />
                  </div>
                </div>
              </div>
              <div className="p-4 pt-10">
                <div className="flex justify-between items-start">
                  <h3 className="text-lg font-semibold text-white truncate">{club.name}</h3>
                  {isUserMember && (
                    <div className="px-2 py-1 bg-fitbloom-purple text-white text-xs rounded-full">
                      Member
                    </div>
                  )}
                </div>
                <p className="text-gray-400 text-sm mt-2 line-clamp-2">
                  {club.description || `A community for ${club.club_type || 'fitness'} enthusiasts.`}
                </p>
                <div className="flex justify-between mt-4 text-sm text-gray-500">
                  <div className="flex items-center">
                    <Users className="h-4 w-4 mr-1 text-fitbloom-purple" />
                    <span>{Math.floor(Math.random() * 100)} members</span>
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default ClubsList;
