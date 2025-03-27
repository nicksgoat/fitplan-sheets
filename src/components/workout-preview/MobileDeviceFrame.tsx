
import React, { ReactNode } from 'react';
import { ScrollArea } from "@/components/ui/scroll-area";

interface MobileDeviceFrameProps {
  children: ReactNode;
  title: string;
  subtitle: string;
}

const MobileDeviceFrame: React.FC<MobileDeviceFrameProps> = ({ 
  children, 
  title,
  subtitle
}) => {
  return (
    <div className="relative w-full p-4 flex justify-center">
      <div className="w-[300px] h-[620px] border-[10px] border-[#1a1a1a] rounded-[40px] overflow-hidden shadow-xl bg-[#1a1a1a]">
        <div className="absolute top-[24px] left-1/2 transform -translate-x-1/2 w-[120px] h-[30px] bg-[#1a1a1a] rounded-b-xl z-10"></div>
        
        <div className="w-full h-full bg-white">
          <div className="px-4 py-3 sticky top-0 bg-white z-10 border-b">
            <div className="text-xl font-bold mb-1 flex items-center">
              <span className="text-amber-600">{title}</span>
              <span className="mx-1">·</span>
              <span className="truncate">{subtitle}</span>
            </div>
            <div className="text-sm text-gray-500">0:00</div>
          </div>
          
          <ScrollArea className="h-[530px]">
            {children}
          </ScrollArea>
        </div>
      </div>
    </div>
  );
};

export default MobileDeviceFrame;
