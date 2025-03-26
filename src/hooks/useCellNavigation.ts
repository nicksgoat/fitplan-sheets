
import { useState, useCallback } from 'react';

export interface CellCoordinate {
  rowIndex: number;
  columnName: string;
  exerciseId: string;
}

export function useCellNavigation() {
  const [focusedCell, setFocusedCell] = useState<CellCoordinate | null>(null);

  const focusCell = useCallback((cell: CellCoordinate) => {
    setFocusedCell(cell);
  }, []);

  const blurCell = useCallback(() => {
    setFocusedCell(null);
  }, []);

  const isCellFocused = useCallback((rowIndex: number, columnName: string, exerciseId: string) => {
    if (!focusedCell) return false;
    return (
      focusedCell.rowIndex === rowIndex &&
      focusedCell.columnName === columnName &&
      focusedCell.exerciseId === exerciseId
    );
  }, [focusedCell]);

  return {
    focusedCell,
    focusCell,
    blurCell,
    isCellFocused
  };
}
