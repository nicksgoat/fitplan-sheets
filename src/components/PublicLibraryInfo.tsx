
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { LibraryBig, X } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';

const PublicLibraryInfo: React.FC = () => {
  const navigate = useNavigate();
  const [isVisible, setIsVisible] = useState(true);
  
  if (!isVisible) return null;
  
  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 20 }}
          className="fixed bottom-4 right-4 bg-dark-200 border border-dark-300 rounded-lg p-4 shadow-lg max-w-xs"
        >
          <div className="flex justify-between items-start mb-2">
            <div className="flex items-center text-white">
              <LibraryBig className="h-5 w-5 mr-2 text-fitbloom-purple" />
              <h3 className="font-semibold">Public Workout Library</h3>
            </div>
            <Button 
              variant="ghost" 
              size="sm" 
              className="p-0 h-auto" 
              onClick={() => setIsVisible(false)}
            >
              <X className="h-4 w-4 text-gray-400" />
            </Button>
          </div>
          
          <p className="text-sm text-gray-300 mb-3">
            You can now share your workouts to the public library or use workouts created by others.
          </p>
          
          <div className="flex justify-end">
            <Button 
              size="sm" 
              className="bg-fitbloom-purple hover:bg-fitbloom-purple/90"
              onClick={() => navigate('/library')}
            >
              Explore Public Workouts
            </Button>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default PublicLibraryInfo;
