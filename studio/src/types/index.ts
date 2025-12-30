// Typy zmiennych Figma
export type VariableType = 'COLOR' | 'FLOAT' | 'STRING' | 'BOOLEAN';

export interface VariableValue {
  type: 'VARIABLE_ALIAS' | 'DIRECT';
  value?: string | number | boolean | { r: number; g: number; b: number; a?: number };
  variableId?: string; // dla aliasów
  variableName?: string; // nazwa zmiennej docelowej (dla external)
  collectionName?: string; // nazwa kolekcji docelowej (dla external)
}

export interface Variable {
  id: string;
  name: string;
  resolvedType: VariableType;
  valuesByMode: Record<string, VariableValue>;
  scopes: string[];
  hiddenFromPublishing: boolean;
  description?: string;
  codeSyntax?: Record<string, string>;
}

export interface VariableCollection {
  id: string;
  name: string;
  modes: { modeId: string; name: string }[];
  defaultModeId: string;
  variableIds: string[];
  hiddenFromPublishing: boolean;
}

export interface FigmaVariablesFile {
  version: string;
  variableCollections: Record<string, VariableCollection>;
  variables: Record<string, Variable>;
}

// Typy wewnętrzne aplikacji
export interface Library {
  id: string;
  name: string;
  isMain: boolean;
  file: FigmaVariablesFile;
  variableCount: number;
}

export interface FolderNode {
  id: string;
  name: string;
  path: string;
  children: FolderNode[];
  variables: Variable[];
  isExpanded: boolean;
  isSelected: boolean;
  depth: number;
}

export type AliasType = 'internal' | 'external' | 'broken' | 'none';

export interface AliasInfo {
  sourceVariableId: string;
  sourceVariablePath: string;
  targetVariableId: string;
  targetVariablePath: string;
  targetLibrary: string;
  type: AliasType;
  modeId: string;
}

export interface DisconnectedLibrary {
  libraryName: string;
  disconnectedAt: string;
  resolvedWithMode: string;
  previousAliases: {
    sourceVar: string;
    targetVar: string;
    modeId: string;
  }[];
  aliasCount?: number;
}

export interface Snapshot {
  id: string;
  name: string;
  description?: string;
  createdAt: string;
  type: 'manual' | 'auto';
  variableCount: number;
  aliasCount: number;
  data: {
    libraries: Library[];
    // pełny stan
  };
}

export interface UIState {
  activeView: 'variables' | 'aliases' | 'snapshots';
  selectedLibraryId: string | null;
  selectedCollectionId: string | null;
  expandedFolders: string[];
  selectedVariables: string[];
  detailsPanelOpen: boolean;
  filters: {
    types: VariableType[];
    aliasTypes: AliasType[];
  };
  searchQuery: string;
}
