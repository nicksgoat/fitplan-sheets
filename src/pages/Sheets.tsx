
import React from 'react';
import { motion } from 'framer-motion';

const Sheets: React.FC = () => {
  return (
    <div className="container mx-auto py-6">
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
      >
        <h1 className="text-3xl font-bold mb-6">Workout Sheets</h1>
        
        <div className="bg-dark-200 rounded-lg p-6 shadow-lg">
          <div className="grid gap-4">
            <p className="text-lg">
              Create and manage your workout plans with our powerful sheets tool.
            </p>
            
            <div className="mt-4">
              <button 
                className="bg-fitbloom-purple hover:bg-opacity-80 text-white px-4 py-2 rounded-md transition-all"
                onClick={() => window.location.href = "/?mode=workout"}
              >
                Open Workout Builder
              </button>
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  );
};

export default Sheets;
