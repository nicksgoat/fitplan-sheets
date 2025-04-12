
import React, { useEffect, useState } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { 
  usePrograms, 
  useUpdateProgramPrice,
  useUpdateProgramVisibility 
} from '@/hooks/useWorkoutData';
import { PriceSettingsDialog } from '@/components/PriceSettingsDialog';
import { Button } from '@/components/ui/button';
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from '@/components/ui/table';
import { 
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger
} from '@/components/ui/dropdown-menu';
import { 
  CircleDollarSign, 
  Edit, 
  EyeIcon, 
  EyeOffIcon,
  MoreHorizontal,
  Loader2,
  ArrowUpDown,
  PlusCircle,
  Link
} from 'lucide-react';
import { toast } from 'sonner';
import { Badge } from '@/components/ui/badge';
import { Link as RouterLink } from 'react-router-dom';

interface Program {
  id: string;
  name: string;
  price: number;
  is_public: boolean;
  is_purchasable: boolean;
  created_at: string;
  updated_at: string;
}

const ProgramsManagement = () => {
  const { user } = useAuth();
  const { programs, isLoading, refetch } = usePrograms(user?.id);
  const { updateProgramPrice, isLoading: isUpdatingPrice } = useUpdateProgramPrice();
  const { updateProgramVisibility, isLoading: isUpdatingVisibility } = useUpdateProgramVisibility();
  
  const [selectedProgram, setSelectedProgram] = useState<Program | null>(null);
  const [isPriceDialogOpen, setIsPriceDialogOpen] = useState(false);
  const [sortBy, setSortBy] = useState<'name' | 'price' | 'date'>('date');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');

  // Sort programs based on current sort settings
  const sortedPrograms = [...(programs || [])].sort((a, b) => {
    if (sortBy === 'name') {
      return sortOrder === 'asc' 
        ? a.name.localeCompare(b.name) 
        : b.name.localeCompare(a.name);
    } else if (sortBy === 'price') {
      return sortOrder === 'asc' 
        ? a.price - b.price 
        : b.price - a.price;
    } else {
      return sortOrder === 'asc' 
        ? new Date(a.created_at).getTime() - new Date(b.created_at).getTime() 
        : new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
    }
  });

  const handleToggleSort = (column: 'name' | 'price' | 'date') => {
    if (sortBy === column) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortBy(column);
      setSortOrder('asc');
    }
  };

  const handlePriceUpdate = async (price: number, isPurchasable: boolean) => {
    if (!selectedProgram) return;

    try {
      await updateProgramPrice(
        selectedProgram.id, 
        price, 
        isPurchasable
      );
      
      toast.success(`Price updated for ${selectedProgram.name}`);
      refetch();
      setIsPriceDialogOpen(false);
    } catch (error) {
      console.error('Error updating price:', error);
      toast.error('Failed to update price');
    }
  };

  const handleToggleVisibility = async (programId: string, isPublic: boolean) => {
    try {
      await updateProgramVisibility(programId, !isPublic);
      toast.success(`Visibility updated`);
      refetch();
    } catch (error) {
      console.error('Error updating visibility:', error);
      toast.error('Failed to update visibility');
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString();
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-48">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (!programs?.length) {
    return (
      <div className="text-center py-12">
        <h3 className="font-medium text-lg mb-2">No programs available</h3>
        <p className="text-muted-foreground mb-6">
          Create a workout program to start selling.
        </p>
        <Button asChild>
          <RouterLink to="/programs/create">
            <PlusCircle className="h-5 w-5 mr-2" />
            Create New Program
          </RouterLink>
        </Button>
      </div>
    );
  }

  return (
    <div>
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-6">
        <h2 className="text-xl font-semibold">Programs Management</h2>
        <Button asChild className="mt-2 sm:mt-0">
          <RouterLink to="/programs/create">
            <PlusCircle className="h-5 w-5 mr-2" />
            Create New Program
          </RouterLink>
        </Button>
      </div>

      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-[300px]">
                <Button 
                  variant="ghost" 
                  onClick={() => handleToggleSort('name')}
                  className="flex items-center gap-1 hover:bg-transparent p-0 h-auto font-medium"
                >
                  Program Name
                  <ArrowUpDown className="h-4 w-4" />
                </Button>
              </TableHead>
              <TableHead>Status</TableHead>
              <TableHead>
                <Button 
                  variant="ghost" 
                  onClick={() => handleToggleSort('price')}
                  className="flex items-center gap-1 hover:bg-transparent p-0 h-auto font-medium"
                >
                  Price
                  <ArrowUpDown className="h-4 w-4" />
                </Button>
              </TableHead>
              <TableHead>
                <Button 
                  variant="ghost" 
                  onClick={() => handleToggleSort('date')}
                  className="flex items-center gap-1 hover:bg-transparent p-0 h-auto font-medium"
                >
                  Created
                  <ArrowUpDown className="h-4 w-4" />
                </Button>
              </TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {sortedPrograms.map((program) => (
              <TableRow key={program.id}>
                <TableCell className="font-medium">{program.name}</TableCell>
                <TableCell>
                  {program.is_public ? (
                    <Badge variant="outline" className="bg-green-500/10 text-green-500 border-green-500/20">
                      Public
                    </Badge>
                  ) : (
                    <Badge variant="outline" className="bg-gray-500/10 text-gray-400 border-gray-500/20">
                      Private
                    </Badge>
                  )}
                </TableCell>
                <TableCell>
                  {program.is_purchasable ? (
                    <span className="font-medium">${program.price.toFixed(2)}</span>
                  ) : (
                    <span className="text-muted-foreground">Not for sale</span>
                  )}
                </TableCell>
                <TableCell>{formatDate(program.created_at)}</TableCell>
                <TableCell className="text-right">
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" className="h-8 w-8 p-0">
                        <span className="sr-only">Open menu</span>
                        <MoreHorizontal className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem
                        onClick={() => {
                          setSelectedProgram(program);
                          setIsPriceDialogOpen(true);
                        }}
                      >
                        <CircleDollarSign className="h-4 w-4 mr-2" />
                        Update Price
                      </DropdownMenuItem>
                      <DropdownMenuItem
                        onClick={() => handleToggleVisibility(program.id, program.is_public)}
                      >
                        {program.is_public ? (
                          <>
                            <EyeOffIcon className="h-4 w-4 mr-2" />
                            Make Private
                          </>
                        ) : (
                          <>
                            <EyeIcon className="h-4 w-4 mr-2" />
                            Make Public
                          </>
                        )}
                      </DropdownMenuItem>
                      <DropdownMenuItem asChild>
                        <RouterLink to={`/programs/edit/${program.id}`}>
                          <Edit className="h-4 w-4 mr-2" />
                          Edit Program
                        </RouterLink>
                      </DropdownMenuItem>
                      <DropdownMenuItem>
                        <Link className="h-4 w-4 mr-2" />
                        Copy Link
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      {selectedProgram && (
        <PriceSettingsDialog
          open={isPriceDialogOpen}
          onOpenChange={setIsPriceDialogOpen}
          title={`Update Price: ${selectedProgram.name}`}
          currentPrice={selectedProgram.price}
          isPurchasable={selectedProgram.is_purchasable}
          onSave={handlePriceUpdate}
          isSaving={isUpdatingPrice}
        />
      )}
    </div>
  );
};

export default ProgramsManagement;
