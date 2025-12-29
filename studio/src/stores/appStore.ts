import { create } from 'zustand';
import type { 
  Library, 
  UIState, 
  Snapshot,
  DisconnectedLibrary,
  VariableType,
  AliasType
} from '../types';

interface AppState {
  // Dane
  libraries: Library[];
  snapshots: Snapshot[];
  disconnectedLibraries: DisconnectedLibrary[];
  
  // UI State
  ui: UIState;
  
  // Historia (UNDO/REDO)
  history: {
    past: any[];
    future: any[];
  };
  
  // Akcje - Libraries
  addLibrary: (library: Library) => void;
  removeLibrary: (id: string) => void;
  clearLibraries: () => void;
  
  // Akcje - UI
  setActiveView: (view: UIState['activeView']) => void;
  selectLibrary: (id: string | null) => void;
  selectCollection: (id: string | null) => void;
  toggleFolder: (folderId: string) => void;
  setExpandedFolders: (folderIds: string[]) => void;
  expandAllFolders: () => void;
  collapseAllFolders: () => void;
  toggleVariable: (variableId: string) => void;
  selectVariables: (variableIds: string[]) => void;
  addToSelection: (variableIds: string[]) => void;
  selectAllVariables: (variableIds: string[]) => void;
  clearSelection: () => void;
  toggleDetailsPanel: () => void;
  setSearchQuery: (query: string) => void;
  setTypeFilter: (types: VariableType[]) => void;
  setAliasFilter: (types: AliasType[]) => void;
  clearFilters: () => void;
  
  // Akcje - Snapshots
  createSnapshot: (name: string, description?: string) => void;
  restoreSnapshot: (id: string) => void;
  deleteSnapshot: (id: string) => void;
  
  // Akcje - UNDO/REDO
  undo: () => void;
  redo: () => void;
  canUndo: () => boolean;
  canRedo: () => boolean;
}

const initialUIState: UIState = {
  activeView: 'variables',
  selectedLibraryId: null,
  selectedCollectionId: null,
  expandedFolders: [],
  selectedVariables: [],
  detailsPanelOpen: true,
  filters: {
    types: [],
    aliasTypes: [],
  },
  searchQuery: '',
};

export const useAppStore = create<AppState>()((set, get) => ({
  // Początkowy stan
  libraries: [],
  snapshots: [],
  disconnectedLibraries: [],
  ui: initialUIState,
  history: {
    past: [],
    future: [],
  },
  
  // Implementacje akcji
  addLibrary: (library) => set((state) => {
    const newLibraries = [...state.libraries, library];
    
    // Sortuj: REZZON (główna) na górze, potem R4-* w kolejności numerycznej
    newLibraries.sort((a, b) => {
      // Główna biblioteka zawsze na górze
      if (a.isMain && !b.isMain) return -1;
      if (!a.isMain && b.isMain) return 1;
      
      // Dla bibliotek R4-* sortuj numerycznie
      const aMatch = a.name.match(/^(\d+)-/);
      const bMatch = b.name.match(/^(\d+)-/);
      
      if (aMatch && bMatch) {
        return parseInt(aMatch[1]) - parseInt(bMatch[1]);
      }
      
      // Fallback: alfabetycznie
      return a.name.localeCompare(b.name);
    });
    
    return {
      libraries: newLibraries,
      ui: {
        ...state.ui,
        selectedLibraryId: state.ui.selectedLibraryId || library.id,
      },
    };
  }),
  
  removeLibrary: (id) => set((state) => ({
    libraries: state.libraries.filter((l) => l.id !== id),
    ui: {
      ...state.ui,
      selectedLibraryId: state.ui.selectedLibraryId === id ? null : state.ui.selectedLibraryId,
    },
  })),
  
  clearLibraries: () => set({
    libraries: [],
    snapshots: [],
    ui: initialUIState,
  }),
  
  setActiveView: (view) => set((state) => ({
    ui: { ...state.ui, activeView: view },
  })),
  
  selectLibrary: (id) => set((state) => {
    // Znajdź bibliotekę i jej pierwszą kolekcję
    const library = state.libraries.find((l) => l.id === id);
    const firstCollectionId = library 
      ? Object.keys(library.file.variableCollections)[0] || null 
      : null;
    
    return {
      ui: { 
        ...state.ui, 
        selectedLibraryId: id,
        selectedCollectionId: firstCollectionId, // Auto-wybór pierwszej kolekcji
        expandedFolders: [],
        selectedVariables: [],
      },
    };
  }),
  
  selectCollection: (id) => set((state) => ({
    ui: { 
      ...state.ui, 
      selectedCollectionId: id,
      expandedFolders: [],
      selectedVariables: [],
    },
  })),
  
  toggleFolder: (folderId) => set((state) => {
    const expanded = [...state.ui.expandedFolders];
    const idx = expanded.indexOf(folderId);
    if (idx >= 0) {
      expanded.splice(idx, 1);
    } else {
      expanded.push(folderId);
    }
    return { ui: { ...state.ui, expandedFolders: expanded } };
  }),
  
  setExpandedFolders: (folderIds) => set((state) => ({
    ui: { ...state.ui, expandedFolders: folderIds },
  })),
  
  expandAllFolders: () => set((state) => {
    return { ui: { ...state.ui, expandedFolders: ['__all__'] } };
  }),
  
  collapseAllFolders: () => set((state) => ({
    ui: { ...state.ui, expandedFolders: [] },
  })),
  
  toggleVariable: (variableId) => set((state) => {
    const selected = [...state.ui.selectedVariables];
    const idx = selected.indexOf(variableId);
    if (idx >= 0) {
      selected.splice(idx, 1);
    } else {
      selected.push(variableId);
    }
    return { ui: { ...state.ui, selectedVariables: selected } };
  }),
  
  selectVariables: (variableIds) => set((state) => ({
    ui: { ...state.ui, selectedVariables: variableIds },
  })),
  
  addToSelection: (variableIds) => set((state) => {
    const newSelection = [...state.ui.selectedVariables];
    for (const id of variableIds) {
      if (!newSelection.includes(id)) {
        newSelection.push(id);
      }
    }
    return { ui: { ...state.ui, selectedVariables: newSelection } };
  }),
  
  selectAllVariables: (variableIds) => set((state) => ({
    ui: { ...state.ui, selectedVariables: variableIds },
  })),
  
  clearSelection: () => set((state) => ({
    ui: { ...state.ui, selectedVariables: [] },
  })),
  
  toggleDetailsPanel: () => set((state) => ({
    ui: { ...state.ui, detailsPanelOpen: !state.ui.detailsPanelOpen },
  })),
  
  setSearchQuery: (query) => set((state) => ({
    ui: { ...state.ui, searchQuery: query },
  })),
  
  setTypeFilter: (types) => set((state) => ({
    ui: { 
      ...state.ui, 
      filters: { ...state.ui.filters, types } 
    },
  })),
  
  setAliasFilter: (types) => set((state) => ({
    ui: { 
      ...state.ui, 
      filters: { ...state.ui.filters, aliasTypes: types } 
    },
  })),
  
  clearFilters: () => set((state) => ({
    ui: { 
      ...state.ui, 
      filters: { types: [], aliasTypes: [] },
      searchQuery: '',
    },
  })),
  
  createSnapshot: (name, description) => set((state) => {
    const variableCount = state.libraries.reduce((acc, lib) => 
      acc + Object.keys(lib.file.variables || {}).length, 0);
    
    return {
      snapshots: [
        ...state.snapshots,
        {
          id: crypto.randomUUID(),
          name,
          description,
          createdAt: new Date().toISOString(),
          type: 'manual',
          variableCount,
          aliasCount: 0,
          data: {
            libraries: JSON.parse(JSON.stringify(state.libraries)),
          },
        },
      ],
    };
  }),
  
  restoreSnapshot: (id) => set((state) => {
    const snapshot = state.snapshots.find((s) => s.id === id);
    if (!snapshot) return state;
    return {
      libraries: JSON.parse(JSON.stringify(snapshot.data.libraries)),
    };
  }),
  
  deleteSnapshot: (id) => set((state) => ({
    snapshots: state.snapshots.filter((s) => s.id !== id),
  })),
  
  undo: () => set((state) => {
    if (state.history.past.length === 0) return state;
    // TODO: Implementacja UNDO
    return state;
  }),
  
  redo: () => set((state) => {
    if (state.history.future.length === 0) return state;
    // TODO: Implementacja REDO
    return state;
  }),
  
  canUndo: () => get().history.past.length > 0,
  canRedo: () => get().history.future.length > 0,
}));
