
import React, { ReactNode } from 'react';
import { ScrollArea } from "@/components/ui/scroll-area";
import { ChevronLeft } from "lucide-react";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";

interface MobileDeviceFrameProps {
  children: ReactNode;
  title: string;
  subtitle: string;
  className?: string;
  creatorName?: string;
  creatorUsername?: string;
  creatorAvatar?: string;
}

const MobileDeviceFrame: React.FC<MobileDeviceFrameProps> = ({ 
  children, 
  title,
  subtitle,
  className,
  creatorName,
  creatorUsername,
  creatorAvatar
}) => {
  // Get initials for avatar fallback
  const getInitials = () => {
    if (creatorName) {
      return creatorName.substring(0, 1).toUpperCase();
    }
    return '';
  };

  return (
    <div className="relative w-full p-4 flex justify-center">
      <div className="w-[300px] h-[620px] border-[10px] border-dark-100 rounded-[40px] overflow-hidden shadow-xl bg-dark-100">
        <div className="absolute top-[24px] left-1/2 transform -translate-x-1/2 w-[120px] h-[30px] bg-dark-100 rounded-b-xl z-10"></div>
        
        <div className="w-full h-full bg-black text-white">
          {/* Status bar */}
          <div className="flex justify-between items-center px-5 py-2 text-xs">
            <div>7:18</div>
            <div className="flex items-center gap-1">
              <div className="h-2.5 w-2.5 rounded-full bg-white"></div>
              <div className="h-2.5 w-2.5 rounded-full bg-white"></div>
              <div className="h-2.5 w-2.5 rounded-full bg-white"></div>
            </div>
          </div>
          
          {/* Header */}
          <div className="px-4 py-3 sticky top-0 bg-black z-10">
            <div className="flex items-center mb-1">
              <ChevronLeft className="h-5 w-5 text-white mr-3" />
            </div>
            <h2 className="text-2xl font-bold mb-2">
              <span className="font-normal">Day {title}</span>
            </h2>
            <p className="text-lg mb-3 text-gray-400 italic">{subtitle}</p>
            
            {/* Creator info section */}
            {creatorName && (
              <div className="flex items-center bg-dark-100 rounded-md p-3 mb-2">
                <Avatar className="h-10 w-10 mr-3">
                  {creatorAvatar ? (
                    <AvatarImage src={creatorAvatar} alt={creatorName} />
                  ) : (
                    <AvatarFallback className="bg-dark-300 text-white">
                      {getInitials()}
                    </AvatarFallback>
                  )}
                </Avatar>
                <div>
                  <p className="font-medium text-white">
                    {creatorName}
                    {creatorUsername && (
                      <span className="text-gray-400 ml-1">@{creatorUsername}</span>
                    )}
                  </p>
                </div>
              </div>
            )}
          </div>
          
          <ScrollArea className={`h-[500px] ${className}`}>
            {children}
          </ScrollArea>
        </div>
      </div>
    </div>
  );
};

export default MobileDeviceFrame;
