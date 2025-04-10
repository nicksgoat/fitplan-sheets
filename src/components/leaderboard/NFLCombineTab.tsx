
import React, { useState, useEffect } from 'react';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { supabase } from '@/integrations/supabase/client';
import { ArrowUpDown } from 'lucide-react';

interface NFLCombineResult {
  id: number;
  Player: string;
  Pos: string;
  School: string;
  "40yd": string;
  Vertical: string;
  Bench: string;
  "Broad Jump": string;
  "3Cone": string;
  Shuttle: string;
  Draft_Team: string;
  Draft_Year: number;
  Height_in: number;
  Weight_lb: number;
}

const NFLCombineTab: React.FC = () => {
  const [combineData, setCombineData] = useState<NFLCombineResult[]>([]);
  const [positions, setPositions] = useState<string[]>([]);
  const [years, setYears] = useState<number[]>([]);
  const [selectedPosition, setSelectedPosition] = useState<string | null>(null);
  const [selectedYear, setSelectedYear] = useState<number | null>(null);
  const [sortMetric, setSortMetric] = useState<string>("40yd");
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Fetch available positions and years on component mount
  useEffect(() => {
    const fetchFilterOptions = async () => {
      // Fetch unique positions
      const { data: posData, error: posError } = await supabase
        .from('NFL Combine Database')
        .select('Pos')
        .not('Pos', 'is', null)
        .order('Pos');

      if (posError) {
        console.error('Error fetching positions:', posError);
        setError('Failed to load position filters');
      } else if (posData) {
        // Extract unique positions
        const uniquePositions = Array.from(new Set(posData.map(item => item.Pos))).filter(Boolean);
        setPositions(uniquePositions);
      }

      // Fetch unique draft years
      const { data: yearData, error: yearError } = await supabase
        .from('NFL Combine Database')
        .select('Draft_Year')
        .not('Draft_Year', 'is', null)
        .order('Draft_Year', { ascending: false });

      if (yearError) {
        console.error('Error fetching years:', yearError);
        setError('Failed to load year filters');
      } else if (yearData) {
        // Extract unique years
        const uniqueYears = Array.from(new Set(yearData.map(item => item.Draft_Year))).filter(Boolean);
        setYears(uniqueYears);
      }
    };

    fetchFilterOptions();
  }, []);

  // Fetch data with filters
  useEffect(() => {
    const fetchCombineData = async () => {
      setIsLoading(true);
      setError(null);
      
      try {
        let query = supabase
          .from('NFL Combine Database')
          .select('*');

        // Apply position filter if selected
        if (selectedPosition) {
          query = query.eq('Pos', selectedPosition);
        }

        // Apply year filter if selected
        if (selectedYear) {
          query = query.eq('Draft_Year', selectedYear);
        }

        // Filter out null values for the sort metric
        query = query.not(sortMetric, 'is', null);

        // Apply sorting
        if (sortMetric) {
          query = query.order(sortMetric, { ascending: true, nullsFirst: false });
        } else {
          query = query.order('40yd', { ascending: true, nullsFirst: false });
        }

        // Limit to a reasonable number for performance
        query = query.limit(100);

        const { data, error } = await query;

        if (error) {
          console.error('Error fetching combine data:', error);
          setError('Failed to load combine data');
          setCombineData([]);
        } else {
          if (data && data.length > 0) {
            setCombineData(data);
          } else {
            console.log('No data found with current filters');
            setCombineData([]);
          }
        }
      } catch (err) {
        console.error('Unexpected error:', err);
        setError('An unexpected error occurred');
        setCombineData([]);
      } finally {
        setIsLoading(false);
      }
    };

    // Save filters to localStorage
    if (selectedPosition) localStorage.setItem('nfl_combine_position', selectedPosition);
    if (selectedYear) localStorage.setItem('nfl_combine_year', selectedYear.toString());
    localStorage.setItem('nfl_combine_sort', sortMetric);

    fetchCombineData();
  }, [selectedPosition, selectedYear, sortMetric]);

  // Load saved preferences on mount
  useEffect(() => {
    const savedPosition = localStorage.getItem('nfl_combine_position');
    const savedYear = localStorage.getItem('nfl_combine_year');
    const savedSort = localStorage.getItem('nfl_combine_sort');

    if (savedPosition) setSelectedPosition(savedPosition);
    if (savedYear) setSelectedYear(parseInt(savedYear));
    if (savedSort) setSortMetric(savedSort);
  }, []);

  const clearFilters = () => {
    setSelectedPosition(null);
    setSelectedYear(null);
    localStorage.removeItem('nfl_combine_position');
    localStorage.removeItem('nfl_combine_year');
  };

  return (
    <div className="space-y-6">
      {/* Filters */}
      <div className="p-4 bg-gray-900/30 border border-gray-800 rounded-lg space-y-4">
        <h2 className="text-lg font-semibold mb-4">NFL Combine Filters</h2>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* Position Filter */}
          <div className="space-y-2">
            <Label htmlFor="position-filter">Position</Label>
            <Select 
              value={selectedPosition || 'all'} 
              onValueChange={(value) => setSelectedPosition(value === 'all' ? null : value)}
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
              onValueChange={(value) => setSelectedYear(value === 'all' ? null : parseInt(value))}
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
            <Select value={sortMetric} onValueChange={setSortMetric}>
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
              onClick={clearFilters}
              className="text-sm text-gray-400 hover:text-white"
            >
              Clear Filters
            </button>
          </div>
        )}
      </div>

      {/* Error Message */}
      {error && (
        <div className="p-4 text-center text-red-400 bg-red-900/20 border border-red-800 rounded-lg">
          {error}. Please try adjusting filters or try again later.
        </div>
      )}

      {/* Table */}
      <div className="rounded-md border border-gray-800 overflow-hidden">
        <Table>
          <TableHeader className="bg-gray-900 sticky top-0">
            <TableRow className="border-b border-gray-800">
              <TableHead className="whitespace-nowrap">Player</TableHead>
              <TableHead className="text-center whitespace-nowrap">Position</TableHead>
              <TableHead className="whitespace-nowrap">School</TableHead>
              <TableHead className="text-center whitespace-nowrap">
                <div className="flex items-center justify-center gap-1">
                  40-Yard
                  {sortMetric === '40yd' && <ArrowUpDown className="h-3 w-3" />}
                </div>
              </TableHead>
              <TableHead className="text-center whitespace-nowrap">
                <div className="flex items-center justify-center gap-1">
                  Vertical
                  {sortMetric === 'Vertical' && <ArrowUpDown className="h-3 w-3" />}
                </div>
              </TableHead>
              <TableHead className="text-center whitespace-nowrap">
                <div className="flex items-center justify-center gap-1">
                  Bench
                  {sortMetric === 'Bench' && <ArrowUpDown className="h-3 w-3" />}
                </div>
              </TableHead>
              <TableHead className="text-center whitespace-nowrap">
                <div className="flex items-center justify-center gap-1">
                  Broad Jump
                  {sortMetric === 'Broad Jump' && <ArrowUpDown className="h-3 w-3" />}
                </div>
              </TableHead>
              <TableHead className="text-center whitespace-nowrap">
                <div className="flex items-center justify-center gap-1">
                  3-Cone
                  {sortMetric === '3Cone' && <ArrowUpDown className="h-3 w-3" />}
                </div>
              </TableHead>
              <TableHead className="text-center whitespace-nowrap">
                <div className="flex items-center justify-center gap-1">
                  Shuttle
                  {sortMetric === 'Shuttle' && <ArrowUpDown className="h-3 w-3" />}
                </div>
              </TableHead>
              <TableHead className="whitespace-nowrap">Drafted By</TableHead>
              <TableHead className="text-center whitespace-nowrap">Year</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              <TableRow>
                <TableCell colSpan={11} className="h-24 text-center">
                  Loading combine data...
                </TableCell>
              </TableRow>
            ) : combineData.length === 0 ? (
              <TableRow>
                <TableCell colSpan={11} className="h-24 text-center">
                  No combine data found. Try adjusting filters or selecting a different sort metric.
                </TableCell>
              </TableRow>
            ) : (
              combineData.map((player) => (
                <TableRow 
                  key={player.id} 
                  className="border-b border-gray-800 hover:bg-gray-900/50 even:bg-gray-900/20"
                >
                  <TableCell className="font-medium">{player.Player || '-'}</TableCell>
                  <TableCell className="text-center">
                    <Badge variant="outline" className="bg-gray-800 text-gray-300">
                      {player.Pos || '-'}
                    </Badge>
                  </TableCell>
                  <TableCell>{player.School || '-'}</TableCell>
                  <TableCell className="text-center">{player["40yd"] || '-'}</TableCell>
                  <TableCell className="text-center">{player.Vertical || '-'}</TableCell>
                  <TableCell className="text-center">{player.Bench || '-'}</TableCell>
                  <TableCell className="text-center">{player["Broad Jump"] || '-'}</TableCell>
                  <TableCell className="text-center">{player["3Cone"] || '-'}</TableCell>
                  <TableCell className="text-center">{player.Shuttle || '-'}</TableCell>
                  <TableCell>{player.Draft_Team || '-'}</TableCell>
                  <TableCell className="text-center">{player.Draft_Year || '-'}</TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      {/* Explanatory Section */}
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
    </div>
  );
};

export default NFLCombineTab;
