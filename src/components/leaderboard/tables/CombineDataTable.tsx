
import React from 'react';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
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

interface CombineDataTableProps {
  combineData: NFLCombineResult[];
  isLoading: boolean;
  error: string | null;
  sortMetric: string;
}

const CombineDataTable: React.FC<CombineDataTableProps> = ({
  combineData,
  isLoading,
  error,
  sortMetric
}) => {
  return (
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
          ) : error ? (
            <TableRow>
              <TableCell colSpan={11} className="h-24 text-center text-red-400">
                {error}. Please try adjusting filters or try again later.
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
  );
};

export default CombineDataTable;
