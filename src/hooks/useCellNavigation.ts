
export interface CellCoordinate {
  section: "exercise" | "set";
  sectionIndex: number;
  row: number;
  col: number;
}

export function useCellNavigation() {
  // This hook can be extended with additional functionality later
  return {};
}
