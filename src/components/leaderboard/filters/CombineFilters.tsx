
import React from 'react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Label } from '@/components/ui/label';

interface CombineFiltersProps {
  positions: string[];
  years: number[];
  selectedPosition: string | null;
  selectedYear: number | null;
  sortMetric: string;
  onPositionChange: (value: string) => void;
  onYearChange: (value: string) => void;
  onSortChange: (value: string) => void;
  onClearFilters: () => void;
}

const CombineFilters: React.FC<CombineFiltersProps> = ({
  positions,
  years,
  selectedPosition,
  selectedYear,
  sortMetric,
  onPositionChange,
  onYearChange,
  onSortChange,
  onClearFilters
}) => {
  return (
    <div className="p-4 bg-gray-900/30 border border-gray-800 rounded-lg space-y-4">
      <h2 className="text-lg font-semibold mb-4">NFL Combine Filters</h2>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Position Filter */}
        <div className="space-y-2">
          <Label htmlFor="position-filter">Position</Label>
          <Select 
            value={selectedPosition || 'all'} 
            onValueChange={(value) => onPositionChange(value)}
          >
            <SelectTrigger id="position-filter" className="bg-gray-800 border-gray-700">
              <SelectValue placeholder="All Positions" />
            </SelectTrigger>
            <SelectContent className="bg-gray-800 border-gray-700">
              <SelectItem value="all">All Positions</SelectItem>
              {positions.map(pos => (
                <SelectItem key={pos} value={pos}>{pos}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Draft Year Filter */}
        <div className="space-y-2">
          <Label htmlFor="year-filter">Draft Year</Label>
          <Select 
            value={selectedYear?.toString() || 'all'} 
            onValueChange={(value) => onYearChange(value)}
          >
            <SelectTrigger id="year-filter" className="bg-gray-800 border-gray-700">
              <SelectValue placeholder="All Years" />
            </SelectTrigger>
            <SelectContent className="bg-gray-800 border-gray-700">
              <SelectItem value="all">All Years</SelectItem>
              {years.map(year => (
                <SelectItem key={year} value={year.toString()}>{year}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        
        {/* Sort By Filter */}
        <div className="space-y-2">
          <Label htmlFor="sort-filter">Sort By</Label>
          <Select value={sortMetric} onValueChange={onSortChange}>
            <SelectTrigger id="sort-filter" className="bg-gray-800 border-gray-700">
              <SelectValue placeholder="Sort By" />
            </SelectTrigger>
            <SelectContent className="bg-gray-800 border-gray-700">
              <SelectItem value="40yd">40-Yard Dash</SelectItem>
              <SelectItem value="Vertical">Vertical Jump</SelectItem>
              <SelectItem value="Bench">Bench Press</SelectItem>
              <SelectItem value="Broad Jump">Broad Jump</SelectItem>
              <SelectItem value="3Cone">3-Cone Drill</SelectItem>
              <SelectItem value="Shuttle">Shuttle</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Clear Filters Button */}
      {(selectedPosition || selectedYear) && (
        <div className="flex justify-end mt-2">
          <button 
            onClick={onClearFilters}
            className="text-sm text-gray-400 hover:text-white"
          >
            Clear Filters
          </button>
        </div>
      )}
    </div>
  );
};

export default CombineFilters;
