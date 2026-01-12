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
    targetVarName?: string; // Nazwa target variable - potrzebna do wyszukiwania przy restore
    modeId: string;
    targetCollectionName?: string; // Nazwa kolekcji target variable - potrzebna do prawidłowego restore
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

// Eksport sesji
export interface SessionExport {
  version: string;
  exportedAt: string;
  type: 'rezzon-studio-session';
  libraries: Library[];
  disconnectedLibraries: DisconnectedLibrary[];
  ui: {
    selectedLibraryId: string | null;
    selectedCollectionId: string | null;
    expandedFolders: string[];
    detailsPanelOpen: boolean;
    filters: {
      types: VariableType[];
      aliasTypes: AliasType[];
    };
  };
  // Przyszłościowo: snapshots
}
