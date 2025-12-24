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
  expandAllFolders: () => void;
  collapseAllFolders: () => void;
  toggleVariable: (variableId: string) => void;
  selectAllVariables: () => void;
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
  addLibrary: (library) => set((state) => ({
    libraries: [...state.libraries, library],
    ui: {
      ...state.ui,
      selectedLibraryId: state.ui.selectedLibraryId || library.id,
    },
  })),
  
  removeLibrary: (id) => set((state) => ({
    libraries: state.libraries.filter((l) => l.id !== id),
    ui: {
      ...state.ui,
      selectedLibraryId: state.ui.selectedLibraryId === id ? null : state.ui.selectedLibraryId,
    },
  })),
  
  clearLibraries: () => set({
    libraries: [],
    ui: initialUIState,
  }),
  
  setActiveView: (view) => set((state) => ({
    ui: { ...state.ui, activeView: view },
  })),
  
  selectLibrary: (id) => set((state) => ({
    ui: { 
      ...state.ui, 
      selectedLibraryId: id,
      selectedCollectionId: null,
      expandedFolders: [],
      selectedVariables: [],
    },
  })),
  
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
  
  expandAllFolders: () => set((state) => {
    // TODO: Zebrać wszystkie folder IDs
    return { ui: { ...state.ui, expandedFolders: ['all'] } };
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
  
  selectAllVariables: () => set((state) => {
    // TODO: Zebrać wszystkie visible variable IDs
    return state;
  }),
  
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
      filters: { types: [], aliasTypes: [] } 
    },
  })),
  
  createSnapshot: (name, description) => set((state) => ({
    snapshots: [
      ...state.snapshots,
      {
        id: crypto.randomUUID(),
        name,
        description,
        createdAt: new Date().toISOString(),
        type: 'manual',
        variableCount: 0, // TODO: policzyć
        aliasCount: 0, // TODO: policzyć
        data: {
          libraries: JSON.parse(JSON.stringify(state.libraries)),
        },
      },
    ],
  })),
  
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
