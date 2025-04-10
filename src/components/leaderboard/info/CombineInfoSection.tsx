
import React from 'react';

const CombineInfoSection: React.FC = () => {
  return (
    <div className="p-4 bg-gray-900/30 border border-gray-800 rounded-lg">
      <h3 className="text-lg font-semibold mb-2">About NFL Combine Measurements</h3>
      <p className="text-gray-300 mb-3">
        The NFL Combine is where college football players showcase their physical abilities for NFL scouts.
        These results are key metrics used by teams to evaluate talent.
      </p>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-gray-400">
        <div>
          <h4 className="font-medium mb-1">Key Metrics:</h4>
          <ul className="list-disc pl-5 space-y-1">
            <li><span className="font-semibold">40-Yard Dash:</span> Measured in seconds, tests straight-line speed</li>
            <li><span className="font-semibold">Vertical Jump:</span> Measured in inches, tests explosive leg power</li>
            <li><span className="font-semibold">Bench Press:</span> Number of 225-pound reps, tests upper body strength</li>
          </ul>
        </div>
        <div>
          <h4 className="font-medium mb-1">Additional Metrics:</h4>
          <ul className="list-disc pl-5 space-y-1">
            <li><span className="font-semibold">Broad Jump:</span> Measured in inches, tests explosive lower-body power</li>
            <li><span className="font-semibold">3-Cone Drill:</span> Measured in seconds, tests agility and change of direction</li>
            <li><span className="font-semibold">Shuttle Run:</span> Measured in seconds, tests lateral quickness</li>
          </ul>
        </div>
      </div>
    </div>
  );
};

export default CombineInfoSection;
