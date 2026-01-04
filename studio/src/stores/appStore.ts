import { create } from 'zustand';
import type { 
  Library, 
  UIState, 
  Snapshot,
  DisconnectedLibrary,
  VariableType,
  AliasType
} from '../types';
import { resolveAliasValue, getAliasType, findVariableInLibrary } from '../utils/aliasUtils';

// Typ operacji do UNDO/REDO
interface HistoryEntry {
  type: string;
  description: string;
  timestamp: number;
  // Snapshot stanu przed operacją
  libraries: Library[];
  disconnectedLibraries: DisconnectedLibrary[];
}

const HISTORY_LIMIT = 30;

interface AppState {
  // Dane
  libraries: Library[];
  snapshots: Snapshot[];
  disconnectedLibraries: DisconnectedLibrary[];
  
  // UI State
  ui: UIState;
  
  // Historia (UNDO/REDO)
  history: {
    past: HistoryEntry[];
    future: HistoryEntry[];
  };
  
  // Akcje - Libraries
  addLibrary: (library: Library) => void;
  removeLibrary: (id: string) => void;
  clearLibraries: () => void;
  
  // Akcje - CRUD
  renameVariable: (libraryId: string, variableId: string, newName: string) => { success: boolean; error?: string };
  bulkRename: (libraryId: string, variableIds: string[], match: string, replace: string, useRegex: boolean) => { 
    success: boolean; 
    renamed: number; 
    conflicts: string[];
  };
  deleteVariables: (libraryId: string, variableIds: string[]) => { deleted: number; brokenAliases: string[] };
  duplicateFolder: (libraryId: string, collectionId: string, folderPath: string) => { success: boolean; newFolderPath?: string };
  
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
  
  // Akcje - Aliasy
  setAlias: (libraryId: string, variableId: string, modeId: string, targetVariableId: string) => void;
  removeAlias: (libraryId: string, variableId: string, modeId: string) => void;
  bulkAlias: (libraryId: string, matches: { sourceId: string; targetId: string }[], modeIds: string[]) => { created: number };
  disconnectLibrary: (libraryId: string, externalLibraryName: string, modeByCollection: Record<string, string>) => void;
  restoreLibrary: (libraryName: string) => { restored: number; broken: number };
  
  // Akcje - UNDO/REDO
  undo: () => void;
  redo: () => void;
  canUndo: () => boolean;
  canRedo: () => boolean;
  getUndoDescription: () => string | null;
  getRedoDescription: () => string | null;
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

// Helper: deep clone state for history
function cloneForHistory(state: AppState): Pick<HistoryEntry, 'libraries' | 'disconnectedLibraries'> {
  return {
    libraries: JSON.parse(JSON.stringify(state.libraries)),
    disconnectedLibraries: JSON.parse(JSON.stringify(state.disconnectedLibraries)),
  };
}

// Helper: save state to history before mutation
function saveToHistory(
  state: AppState, 
  type: string, 
  description: string
): AppState['history'] {
  const entry: HistoryEntry = {
    type,
    description,
    timestamp: Date.now(),
    ...cloneForHistory(state),
  };
  
  const newPast = [...state.history.past, entry];
  
  // Limit history size
  if (newPast.length > HISTORY_LIMIT) {
    newPast.shift();
  }
  
  return {
    past: newPast,
    future: [], // Clear future on new action
  };
}

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
    disconnectedLibraries: [],
    ui: initialUIState,
    history: { past: [], future: [] },
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
    
    // Save current state to history before restore
    const newHistory = saveToHistory(state, 'restoreSnapshot', `Restore snapshot "${snapshot.name}"`);
    
    return {
      libraries: JSON.parse(JSON.stringify(snapshot.data.libraries)),
      history: newHistory,
    };
  }),
  
  deleteSnapshot: (id) => set((state) => ({
    snapshots: state.snapshots.filter((s) => s.id !== id),
  })),
  
  // CRUD - Rename single variable (WITH UNDO)
  renameVariable: (libraryId, variableId, newName) => {
    const state = get();
    const library = state.libraries.find((l) => l.id === libraryId);
    if (!library) return { success: false, error: 'Library not found' };
    
    const variable = library.file.variables[variableId];
    if (!variable) return { success: false, error: 'Variable not found' };
    
    // Pobierz folder path z nazwy
    const pathParts = variable.name.split('/');
    const oldShortName = pathParts.pop() || '';
    const folderPath = pathParts.join('/');
    
    // Walidacja nazwy
    if (!newName.trim()) return { success: false, error: 'Name cannot be empty' };
    if (newName.includes('/')) return { success: false, error: 'Name cannot contain /' };
    
    // Nowa pełna ścieżka
    const newFullPath = folderPath ? `${folderPath}/${newName}` : newName;
    
    // Sprawdź duplikaty
    const existingVar = Object.values(library.file.variables).find(
      (v) => v.name === newFullPath && v.id !== variableId
    );
    if (existingVar) return { success: false, error: `Variable "${newFullPath}" already exists` };
    
    // Wykonaj rename z zapisem do historii
    set((s) => {
      const newHistory = saveToHistory(s, 'rename', `Rename "${oldShortName}" → "${newName}"`);
      
      const libs = [...s.libraries];
      const libIdx = libs.findIndex((l) => l.id === libraryId);
      if (libIdx < 0) return s;
      
      const updatedLib = { ...libs[libIdx] };
      updatedLib.file = { ...updatedLib.file };
      updatedLib.file.variables = { ...updatedLib.file.variables };
      updatedLib.file.variables[variableId] = {
        ...updatedLib.file.variables[variableId],
        name: newFullPath,
      };
      
      libs[libIdx] = updatedLib;
      return { libraries: libs, history: newHistory };
    });
    
    return { success: true };
  },
  
  // CRUD - Bulk rename (WITH UNDO)
  bulkRename: (libraryId, variableIds, match, replace, useRegex) => {
    const state = get();
    const library = state.libraries.find((l) => l.id === libraryId);
    if (!library) return { success: false, renamed: 0, conflicts: [] };
    
    const conflicts: string[] = [];
    const renames: { id: string; oldName: string; newName: string }[] = [];
    
    // Przygotuj regex lub string
    let regex: RegExp;
    try {
      regex = useRegex ? new RegExp(match, 'g') : new RegExp(match.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'g');
    } catch (e) {
      return { success: false, renamed: 0, conflicts: ['Invalid regex pattern'] };
    }
    
    // Oblicz nowe nazwy i sprawdź konflikty
    for (const varId of variableIds) {
      const variable = library.file.variables[varId];
      if (!variable) continue;
      
      const newName = variable.name.replace(regex, replace);
      if (newName === variable.name) continue; // Bez zmian
      
      // Sprawdź duplikaty (nie licząc zmiennych które też są w operacji)
      const existingVar = Object.values(library.file.variables).find(
        (v) => v.name === newName && v.id !== varId && !variableIds.includes(v.id)
      );
      
      // Sprawdź też czy nie będzie kolizji między zmiennymi w operacji
      const internalConflict = renames.find((r) => r.newName === newName);
      
      if (existingVar || internalConflict) {
        conflicts.push(`${variable.name} → ${newName}`);
      } else {
        renames.push({ id: varId, oldName: variable.name, newName });
      }
    }
    
    if (conflicts.length > 0) {
      return { success: false, renamed: 0, conflicts };
    }
    
    if (renames.length === 0) {
      return { success: true, renamed: 0, conflicts: [] };
    }
    
    // Wykonaj rename z zapisem do historii
    set((s) => {
      const newHistory = saveToHistory(s, 'bulkRename', `Bulk rename ${renames.length} variables ("${match}" → "${replace}")`);
      
      const libs = [...s.libraries];
      const libIdx = libs.findIndex((l) => l.id === libraryId);
      if (libIdx < 0) return s;
      
      const updatedLib = { ...libs[libIdx] };
      updatedLib.file = { ...updatedLib.file };
      updatedLib.file.variables = { ...updatedLib.file.variables };
      
      for (const { id, newName } of renames) {
        updatedLib.file.variables[id] = {
          ...updatedLib.file.variables[id],
          name: newName,
        };
      }
      
      libs[libIdx] = updatedLib;
      return { libraries: libs, history: newHistory };
    });
    
    return { success: true, renamed: renames.length, conflicts: [] };
  },
  
  // CRUD - Delete (WITH UNDO)
  deleteVariables: (libraryId, variableIds) => {
    const state = get();
    const library = state.libraries.find((l) => l.id === libraryId);
    if (!library) return { deleted: 0, brokenAliases: [] };
    
    const brokenAliases: string[] = [];
    
    // Znajdź aliasy które zostaną broken
    for (const [varId, variable] of Object.entries(library.file.variables)) {
      if (variableIds.includes(varId)) continue; // Ta zmienna jest usuwana
      
      for (const value of Object.values(variable.valuesByMode || {})) {
        if (value.type === 'VARIABLE_ALIAS' && value.variableId && variableIds.includes(value.variableId)) {
          brokenAliases.push(variable.name);
          break;
        }
      }
    }
    
    // Zbierz nazwy usuwanych zmiennych dla opisu
    const deletedNames = variableIds
      .map(id => library.file.variables[id]?.name.split('/').pop())
      .filter(Boolean)
      .slice(0, 3);
    const description = variableIds.length === 1 
      ? `Delete "${deletedNames[0]}"` 
      : `Delete ${variableIds.length} variables`;
    
    // Usuń zmienne z zapisem do historii
    set((s) => {
      const newHistory = saveToHistory(s, 'delete', description);
      
      const libs = [...s.libraries];
      const libIdx = libs.findIndex((l) => l.id === libraryId);
      if (libIdx < 0) return s;
      
      const updatedLib = { ...libs[libIdx] };
      updatedLib.file = { ...updatedLib.file };
      updatedLib.file.variables = { ...updatedLib.file.variables };
      updatedLib.file.variableCollections = { ...updatedLib.file.variableCollections };
      
      // Usuń zmienne
      for (const varId of variableIds) {
        delete updatedLib.file.variables[varId];
      }
      
      // Aktualizuj variableIds w kolekcjach
      for (const collId of Object.keys(updatedLib.file.variableCollections)) {
        const coll = updatedLib.file.variableCollections[collId];
        updatedLib.file.variableCollections[collId] = {
          ...coll,
          variableIds: coll.variableIds.filter((id) => !variableIds.includes(id)),
        };
      }
      
      // Aktualizuj count
      updatedLib.variableCount = Object.keys(updatedLib.file.variables).length;
      
      libs[libIdx] = updatedLib;
      
      // Wyczyść selekcję
      return { 
        libraries: libs,
        history: newHistory,
        ui: { ...s.ui, selectedVariables: s.ui.selectedVariables.filter((id) => !variableIds.includes(id)) },
      };
    });
    
    return { deleted: variableIds.length, brokenAliases };
  },
  
  // CRUD - Duplicate folder (WITH UNDO)
  duplicateFolder: (libraryId, collectionId, folderPath) => {
    const state = get();
    const library = state.libraries.find((l) => l.id === libraryId);
    if (!library) return { success: false };
    
    const collection = library.file.variableCollections[collectionId];
    if (!collection) return { success: false };
    
    // Znajdź wszystkie zmienne w tym folderze
    const folderVariables = Object.values(library.file.variables).filter(
      (v) => v.name === folderPath || v.name.startsWith(folderPath + '/')
    );
    
    if (folderVariables.length === 0) return { success: false };
    
    // Generuj nową nazwę folderu (folder → folder 2, folder 2 → folder 3, etc.)
    let newFolderPath = folderPath + ' 2';
    let suffix = 2;
    while (Object.values(library.file.variables).some((v) => 
      v.name === newFolderPath || v.name.startsWith(newFolderPath + '/')
    )) {
      suffix++;
      newFolderPath = folderPath + ' ' + suffix;
    }
    
    const folderName = folderPath.split('/').pop() || folderPath;
    
    // Stwórz kopie zmiennych z zapisem do historii
    const newVariableIds: string[] = [];
    
    set((s) => {
      const newHistory = saveToHistory(s, 'duplicate', `Duplicate folder "${folderName}"`);
      
      const libs = [...s.libraries];
      const libIdx = libs.findIndex((l) => l.id === libraryId);
      if (libIdx < 0) return s;
      
      const updatedLib = { ...libs[libIdx] };
      updatedLib.file = { ...updatedLib.file };
      updatedLib.file.variables = { ...updatedLib.file.variables };
      updatedLib.file.variableCollections = { ...updatedLib.file.variableCollections };
      
      for (const original of folderVariables) {
        const newId = crypto.randomUUID();
        const newName = original.name.replace(folderPath, newFolderPath);
        
        updatedLib.file.variables[newId] = {
          ...original,
          id: newId,
          name: newName,
          // Aliasy w kopii wskazują na ORYGINAŁY
          valuesByMode: { ...original.valuesByMode },
        };
        
        newVariableIds.push(newId);
      }
      
      // Dodaj nowe ID do kolekcji
      updatedLib.file.variableCollections[collectionId] = {
        ...updatedLib.file.variableCollections[collectionId],
        variableIds: [...updatedLib.file.variableCollections[collectionId].variableIds, ...newVariableIds],
      };
      
      updatedLib.variableCount = Object.keys(updatedLib.file.variables).length;
      
      libs[libIdx] = updatedLib;
      return { libraries: libs, history: newHistory };
    });
    
    return { success: true, newFolderPath };
  },
  
  // Aliasy - Set alias (WITH UNDO)
  setAlias: (libraryId, variableId, modeId, targetVariableId) => {
    set((state) => {
      const libs = [...state.libraries];
      const libIdx = libs.findIndex((l) => l.id === libraryId);
      if (libIdx < 0) return state;
      
      const variable = libs[libIdx].file.variables[variableId];
      if (!variable) return state;
      
      // Znajdź target variable żeby pobrać nazwę
      let targetName: string | undefined;
      for (const lib of libs) {
        const targetVar = lib.file.variables[targetVariableId];
        if (targetVar) {
          targetName = targetVar.name;
          break;
        }
      }
      
      const varName = variable.name.split('/').pop() || variable.name;
      const newHistory = saveToHistory(state, 'setAlias', `Set alias on "${varName}"`);
      
      const updatedLib = { ...libs[libIdx] };
      updatedLib.file = { ...updatedLib.file };
      updatedLib.file.variables = { ...updatedLib.file.variables };
      
      updatedLib.file.variables[variableId] = {
        ...variable,
        valuesByMode: {
          ...variable.valuesByMode,
          [modeId]: {
            type: 'VARIABLE_ALIAS',
            variableId: targetVariableId,
            variableName: targetName,
          },
        },
      };
      
      libs[libIdx] = updatedLib;
      return { libraries: libs, history: newHistory };
    });
  },
  
  // Aliasy - Remove alias (WITH UNDO)
  removeAlias: (libraryId, variableId, modeId) => {
    set((state) => {
      const libs = [...state.libraries];
      const libIdx = libs.findIndex((l) => l.id === libraryId);
      if (libIdx < 0) return state;
      
      const variable = libs[libIdx].file.variables[variableId];
      if (!variable) return state;
      
      const currentValue = variable.valuesByMode[modeId];
      if (!currentValue || currentValue.type !== 'VARIABLE_ALIAS') {
        return state; // Nie ma aliasu do usunięcia
      }
      
      // Znajdź resolved value PRZED usunięciem aliasu
      const resolvedValue = resolveAliasValue(currentValue, modeId, libs[libIdx], libs);
      
      const varName = variable.name.split('/').pop() || variable.name;
      const newHistory = saveToHistory(state, 'removeAlias', `Remove alias from "${varName}"`);
      
      const updatedLib = { ...libs[libIdx] };
      updatedLib.file = { ...updatedLib.file };
      updatedLib.file.variables = { ...updatedLib.file.variables };
      
      // Ustaw resolved value jako nową wartość
      updatedLib.file.variables[variableId] = {
        ...variable,
        valuesByMode: {
          ...variable.valuesByMode,
          [modeId]: resolvedValue.type === 'VARIABLE_ALIAS' 
            ? { type: 'DIRECT', value: undefined } // Broken alias - nie ma co resolvować
            : resolvedValue,
        },
      };
      
      libs[libIdx] = updatedLib;
      return { libraries: libs, history: newHistory };
    });
  },
  
  // Aliasy - Bulk alias (WITH UNDO)
  bulkAlias: (libraryId, matches, modeIds) => {
    let created = 0;
    
    set((state) => {
      const libs = [...state.libraries];
      const libIdx = libs.findIndex((l) => l.id === libraryId);
      if (libIdx < 0) return state;
      
      const newHistory = saveToHistory(state, 'bulkAlias', `Bulk alias ${matches.length} variables`);
      
      const updatedLib = { ...libs[libIdx] };
      updatedLib.file = { ...updatedLib.file };
      updatedLib.file.variables = { ...updatedLib.file.variables };
      
      for (const { sourceId, targetId } of matches) {
        const variable = updatedLib.file.variables[sourceId];
        if (!variable) continue;
        
        // Znajdź target variable żeby pobrać nazwę
        let targetName: string | undefined;
        for (const lib of libs) {
          const targetVar = lib.file.variables[targetId];
          if (targetVar) {
            targetName = targetVar.name;
            break;
          }
        }
        
        const newValuesByMode = { ...variable.valuesByMode };
        for (const modeId of modeIds) {
          newValuesByMode[modeId] = {
            type: 'VARIABLE_ALIAS',
            variableId: targetId,
            variableName: targetName,
          };
          created++;
        }
        
        updatedLib.file.variables[sourceId] = {
          ...variable,
          valuesByMode: newValuesByMode,
        };
      }
      
      libs[libIdx] = updatedLib;
      return { libraries: libs, history: newHistory };
    });
    
    return { created };
  },
  
  // Aliasy - Disconnect library (WITH UNDO)
  disconnectLibrary: (libraryId, externalLibraryName, modeByCollection) => {
    set((state) => {
      // Sprawdź czy biblioteka już nie jest odłączona
      if (state.disconnectedLibraries.some(d => d.libraryName === externalLibraryName)) {
        console.warn(`Library "${externalLibraryName}" is already disconnected`);
        return state;
      }
      
      const newHistory = saveToHistory(state, 'disconnect', `Disconnect "${externalLibraryName}"`);
      
      const libs = [...state.libraries];
      const libIdx = libs.findIndex((l) => l.id === libraryId);
      if (libIdx < 0) return state;
      
      const library = libs[libIdx];
      
      const externalLib = libs.find((l) => l.name === externalLibraryName);
      if (!externalLib) {
        console.warn(`External library "${externalLibraryName}" not found`);
        return state;
      }
      
      // Helper: znajdź collectionId dla zmiennej
      const findCollectionId = (varId: string): string | null => {
        for (const [colId, col] of Object.entries(externalLib.file.variableCollections)) {
          if (col.variableIds.includes(varId)) {
            return colId;
          }
        }
        return null;
      };
      
      const previousAliases: { sourceVarId: string; sourceVarName: string; targetVarId: string; targetVarName: string; modeId: string }[] = [];
      
      const updatedLib = { ...library };
      updatedLib.file = { ...updatedLib.file };
      updatedLib.file.variables = { ...updatedLib.file.variables };
      
      // Znajdź wszystkie aliasy do external library i zamień na resolved values
      for (const [varId, variable] of Object.entries(updatedLib.file.variables)) {
        const newValuesByMode = { ...variable.valuesByMode };
        let changed = false;
        
        for (const [modeId, value] of Object.entries(variable.valuesByMode)) {
          if (value.type === 'VARIABLE_ALIAS' && value.variableId) {
            // Sprawdź czy alias jest do external library używając getAliasType
            const aliasType = getAliasType(value, library, libs);
            
            if (aliasType === 'external') {
              // Znajdź target variable w external library używając findVariableInLibrary
              const targetVar = findVariableInLibrary(externalLib, value.variableId, value.variableName);
              
              if (targetVar) {
                // Zapisz poprzedni alias z ID i nazwami
                previousAliases.push({
                  sourceVarId: varId,
                  sourceVarName: variable.name,
                  targetVarId: targetVar.id,
                  targetVarName: targetVar.name,
                  modeId,
                });
                
                // Znajdź kolekcję target variable
                const targetCollectionId = findCollectionId(targetVar.id);
                
                // Pobierz wybrany mode dla tej kolekcji
                let selectedModeId: string | null = null;
                if (targetCollectionId && modeByCollection[targetCollectionId]) {
                  selectedModeId = modeByCollection[targetCollectionId];
                }
                
                // Rozwiąż do wartości
                let resolvedValue = selectedModeId 
                  ? targetVar.valuesByMode[selectedModeId]
                  : null;
                
                // Fallback: jeśli nie ma wartości dla wybranego mode, użyj pierwszego dostępnego
                if (!resolvedValue) {
                  const availableModeIds = Object.keys(targetVar.valuesByMode);
                  if (availableModeIds.length > 0) {
                    resolvedValue = targetVar.valuesByMode[availableModeIds[0]];
                  }
                }
                
                if (resolvedValue && resolvedValue.type !== 'VARIABLE_ALIAS') {
                  newValuesByMode[modeId] = { ...resolvedValue };
                } else if (resolvedValue && resolvedValue.type === 'VARIABLE_ALIAS') {
                  // Jeśli target też jest aliasem, użyj pełnego resolve
                  const fullyResolved = resolveAliasValue(value, selectedModeId || Object.keys(targetVar.valuesByMode)[0], library, libs);
                  newValuesByMode[modeId] = fullyResolved.type !== 'VARIABLE_ALIAS' 
                    ? { ...fullyResolved }
                    : { type: 'DIRECT', value: undefined };
                } else {
                  // Brak wartości - ustaw undefined
                  newValuesByMode[modeId] = { type: 'DIRECT', value: undefined };
                }
                changed = true;
              }
            }
          }
        }
        
        if (changed) {
          updatedLib.file.variables[varId] = { ...variable, valuesByMode: newValuesByMode };
        }
      }
      
      libs[libIdx] = updatedLib;
      
      // Dodaj do disconnected tylko jeśli faktycznie były aliasy
      if (previousAliases.length === 0) {
        console.warn(`No aliases found to disconnect for "${externalLibraryName}"`);
        return state;
      }
      
      // DEBUG - analiza zapisywanych aliasów
      console.log('=== DISCONNECT DEBUG ===');
      console.log('Library:', externalLibraryName);
      console.log('Total aliases saved:', previousAliases.length);
      const uniqueSourceVars = new Set(previousAliases.map(a => a.sourceVarId));
      console.log('Unique source variables:', uniqueSourceVars.size);
      const aliasesPerVar: Record<string, string[]> = {};
      previousAliases.forEach(a => {
        if (!aliasesPerVar[a.sourceVarId]) aliasesPerVar[a.sourceVarId] = [];
        aliasesPerVar[a.sourceVarId].push(a.modeId);
      });
      console.log('Variables with multiple modes (first 5):');
      Object.entries(aliasesPerVar)
        .filter(([_, modes]) => modes.length > 1)
        .slice(0, 5)
        .forEach(([varId, modes]) => {
          console.log(`  ${varId}: [${modes.join(', ')}]`);
        });
      console.log('=== END DISCONNECT DEBUG ===');
      
      const disconnected: typeof state.disconnectedLibraries[0] = {
        libraryName: externalLibraryName,
        disconnectedAt: new Date().toISOString(),
        resolvedWithMode: JSON.stringify(modeByCollection), // Zapisz jako JSON dla kompatybilności
        previousAliases: previousAliases.map(a => ({
          sourceVar: a.sourceVarId,
          targetVar: a.targetVarId,
          modeId: a.modeId,
        })),
        aliasCount: previousAliases.length,
      };
      
      return {
        libraries: libs,
        disconnectedLibraries: [...state.disconnectedLibraries, disconnected],
        history: newHistory,
      };
    });
  },
  
  // Aliasy - Restore library (WITH UNDO)
  restoreLibrary: (libraryName) => {
    const state = get();
    const disconnected = state.disconnectedLibraries.find((d) => d.libraryName === libraryName);
    if (!disconnected) return { restored: 0, broken: 0 };
    
    console.log('=== RESTORE DEBUG ===');
    console.log('Restoring library:', libraryName);
    console.log('previousAliases count:', disconnected.previousAliases.length);
    
    // Wynik będzie zapisany tutaj przez set()
    const result = { restored: 0, broken: 0 };
    
    set((s) => {
      const newHistory = saveToHistory(s, 'restore', `Restore connection to "${libraryName}"`);
      
      // WAŻNE: Pobierz externalLib z AKTUALNEGO stanu wewnątrz set()
      const externalLib = s.libraries.find((l) => l.name === libraryName);
      console.log('externalLib found:', !!externalLib);
      if (!externalLib) {
        console.error('External library not found:', libraryName);
        return s;
      }
      
      const libs = [...s.libraries];
      
      // Musimy deep clone biblioteki które będziemy modyfikować
      // żeby uniknąć nadpisywania zmian przy wielu aliasach do tej samej zmiennej
      const libClones: Record<number, typeof libs[0]> = {};
      
      // Debug: śledź unikalne zmienne źródłowe
      const uniqueSourceVars = new Set<string>();
      const aliasesPerVar: Record<string, number> = {};
      let notFoundSourceVars = 0;
      let notFoundTargetVars = 0;
      
      for (const prevAlias of disconnected.previousAliases) {
        uniqueSourceVars.add(prevAlias.sourceVar);
        aliasesPerVar[prevAlias.sourceVar] = (aliasesPerVar[prevAlias.sourceVar] || 0) + 1;
        
        let sourceFound = false;
        
        // Szukaj source variable
        for (let libIdx = 0; libIdx < libs.length; libIdx++) {
          // Użyj sklonowanej wersji jeśli istnieje, inaczej sklonuj
          if (!libClones[libIdx]) {
            libClones[libIdx] = {
              ...libs[libIdx],
              file: {
                ...libs[libIdx].file,
                variables: { ...libs[libIdx].file.variables },
              },
            };
          }
          
          const lib = libClones[libIdx];
          const sourceVar = lib.file.variables[prevAlias.sourceVar];
          
          if (sourceVar) {
            sourceFound = true;
            // Znajdź target variable po ID
            const targetVar = externalLib.file.variables[prevAlias.targetVar];
            
            if (targetVar) {
              // Debug: sprawdź czy targetVar.id istnieje
              if (!targetVar.id) {
                console.warn('RESTORE: targetVar.id is undefined!', {
                  targetVarName: targetVar.name,
                  prevAliasTargetVar: prevAlias.targetVar,
                  targetVarKeys: Object.keys(targetVar),
                });
              }
              
              // Przywróć alias - modyfikujemy sklonowaną wersję
              // UWAGA: używamy prevAlias.targetVar jako variableId (to jest oryginalny ID)
              lib.file.variables[prevAlias.sourceVar] = {
                ...sourceVar,
                valuesByMode: {
                  ...sourceVar.valuesByMode,
                  [prevAlias.modeId]: {
                    type: 'VARIABLE_ALIAS',
                    variableId: prevAlias.targetVar,  // Używamy zapisanego ID, nie targetVar.id!
                    variableName: targetVar.name,
                  },
                },
              };
              result.restored++;
            } else {
              result.broken++;
              notFoundTargetVars++;
            }
            break;
          }
        }
        
        if (!sourceFound) {
          notFoundSourceVars++;
          result.broken++;
        }
      }
      
      console.log('Unique source variables:', uniqueSourceVars.size);
      console.log('Variables with multiple modes:');
      Object.entries(aliasesPerVar)
        .filter(([_, count]) => count > 1)
        .slice(0, 5)
        .forEach(([varId, count]) => {
          console.log(`  ${varId}: ${count} modes`);
        });
      console.log('Source vars not found:', notFoundSourceVars);
      console.log('Target vars not found:', notFoundTargetVars);
      console.log('Restored:', result.restored);
      console.log('Broken:', result.broken);
      console.log('libClones keys:', Object.keys(libClones));
      console.log('libClones size:', Object.keys(libClones).length);
      console.log('=== END RESTORE DEBUG ===');
      
      // Zastąp zmodyfikowane biblioteki
      for (const [idxStr, lib] of Object.entries(libClones)) {
        console.log(`Replacing library at index ${idxStr}`);
        libs[parseInt(idxStr)] = lib;
      }
      
      return {
        libraries: libs,
        disconnectedLibraries: s.disconnectedLibraries.filter((d) => d.libraryName !== libraryName),
        history: newHistory,
      };
    });
    
    return result;
  },
  
  // UNDO - przywróć poprzedni stan
  undo: () => set((state) => {
    if (state.history.past.length === 0) return state;
    
    const past = [...state.history.past];
    const lastEntry = past.pop()!;
    
    // Zapisz bieżący stan do future
    const currentEntry: HistoryEntry = {
      type: lastEntry.type,
      description: lastEntry.description,
      timestamp: Date.now(),
      ...cloneForHistory(state),
    };
    
    return {
      libraries: JSON.parse(JSON.stringify(lastEntry.libraries)),
      disconnectedLibraries: JSON.parse(JSON.stringify(lastEntry.disconnectedLibraries)),
      history: {
        past,
        future: [...state.history.future, currentEntry],
      },
    };
  }),
  
  // REDO - przywróć cofnięty stan
  redo: () => set((state) => {
    if (state.history.future.length === 0) return state;
    
    const future = [...state.history.future];
    const nextEntry = future.pop()!;
    
    // Zapisz bieżący stan do past
    const currentEntry: HistoryEntry = {
      type: nextEntry.type,
      description: nextEntry.description,
      timestamp: Date.now(),
      ...cloneForHistory(state),
    };
    
    return {
      libraries: JSON.parse(JSON.stringify(nextEntry.libraries)),
      disconnectedLibraries: JSON.parse(JSON.stringify(nextEntry.disconnectedLibraries)),
      history: {
        past: [...state.history.past, currentEntry],
        future,
      },
    };
  }),
  
  canUndo: () => get().history.past.length > 0,
  canRedo: () => get().history.future.length > 0,
  
  // Nowe helpery do tooltipów
  getUndoDescription: () => {
    const past = get().history.past;
    return past.length > 0 ? past[past.length - 1].description : null;
  },
  
  getRedoDescription: () => {
    const future = get().history.future;
    return future.length > 0 ? future[future.length - 1].description : null;
  },
}));
