
import { useState, useCallback } from 'react';

export interface CellCoordinate {
  section: "exercise" | "set";
  sectionIndex: number;
  row: number;
  col: number;
  rowIndex?: number;
  columnName?: string;
  exerciseId?: string;
  setIndex?: number;
}

export function useCellNavigation() {
  const [focusedCell, setFocusedCell] = useState<CellCoordinate | null>(null);

  const focusCell = useCallback((cell: CellCoordinate) => {
    setFocusedCell(cell);
  }, []);

  const blurCell = useCallback(() => {
    setFocusedCell(null);
  }, []);

  const isCellFocused = useCallback((rowIndex: number, columnName: string, exerciseId: string, setIndex?: number) => {
    if (!focusedCell) return false;
    
    if (!focusedCell.rowIndex || !focusedCell.columnName || !focusedCell.exerciseId) {
      return false;
    }
    
    const baseMatch = (
      focusedCell.rowIndex === rowIndex &&
      focusedCell.columnName === columnName &&
      focusedCell.exerciseId === exerciseId
    );
    
    // If setIndex is provided, check it as well
    if (setIndex !== undefined) {
      return baseMatch && focusedCell.setIndex === setIndex;
    }
    
    // If no setIndex provided but focusedCell has one, they don't match
    if (focusedCell.setIndex !== undefined && setIndex === undefined) {
      return false;
    }
    
    return baseMatch;
  }, [focusedCell]);

  return {
    focusedCell,
    focusCell,
    blurCell,
    isCellFocused
  };
}
