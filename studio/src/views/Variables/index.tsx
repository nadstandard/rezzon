import { useMemo, useState, useCallback, useEffect, useRef } from 'react';
import { 
  Maximize2, 
  Minimize2, 
  Edit3, 
  Copy, 
  Trash2, 
  Link, 
  Undo2, 
  Redo2, 
  Filter, 
  PanelRight,
  Hash,
  Type,
  ToggleLeft,
  Palette,
  ArrowRight,
  ExternalLink,
  ChevronRight,
  Folder,
  Check,
  X
} from 'lucide-react';
import { useAppStore } from '../../stores/appStore';
import { VariablesSidebar } from '../../components/layout/VariablesSidebar';
import { DetailsPanel } from '../../components/layout/DetailsPanel';
import { BulkRenameModal, DeleteModal, DuplicateFolderModal } from '../../components/ui/CrudModals';
import { InlineEdit } from '../../components/ui/InlineEdit';
import { buildFolderTree, flattenTree, getAllFolderIds } from '../../utils/folderTree';
import type { FolderNode } from '../../utils/folderTree';
import type { Variable, VariableType, VariableValue, AliasType, Library } from '../../types';

// Ikona dla typu zmiennej
function TypeIcon({ type }: { type: VariableType }) {
  switch (type) {
    case 'FLOAT':
      return <Hash className="icon sm" />;
    case 'STRING':
      return <Type className="icon sm" />;
    case 'BOOLEAN':
      return <ToggleLeft className="icon sm" />;
    case 'COLOR':
      return <Palette className="icon sm" />;
    default:
      return <Hash className="icon sm" />;
  }
}

// Formatowanie wartości
function formatValue(value: VariableValue | undefined, type: VariableType): string {
  if (!value) return '-';
  
  if (value.type === 'VARIABLE_ALIAS') {
    return 'alias';
  }
  
  const v = value.value;
  
  if (v === undefined || v === null) return '-';
  
  if (type === 'COLOR' && typeof v === 'object' && 'r' in v) {
    const r = Math.round(v.r * 255);
    const g = Math.round(v.g * 255);
    const b = Math.round(v.b * 255);
    return `#${r.toString(16).padStart(2, '0')}${g.toString(16).padStart(2, '0')}${b.toString(16).padStart(2, '0')}`.toUpperCase();
  }
  
  if (type === 'BOOLEAN') {
    return v ? 'true' : 'false';
  }
  
  if (typeof v === 'number') {
    return Number.isInteger(v) ? String(v) : v.toFixed(2);
  }
  
  return String(v);
}

// Określ typ aliasu dla zmiennej
function getAliasType(variable: Variable, allVariables: Record<string, Variable>): AliasType {
  const firstModeValue = Object.values(variable.valuesByMode || {})[0];
  
  if (!firstModeValue || firstModeValue.type !== 'VARIABLE_ALIAS') {
    return 'none';
  }
  
  const targetId = firstModeValue.variableId;
  if (!targetId) return 'broken';
  
  const targetVar = allVariables[targetId];
  if (!targetVar) return 'external'; // Nie znaleziono = external
  
  return 'internal';
}

// Komponent dla komórki wartości
function ValueCell({ value, type, allVariables, allLibraries }: { 
  value: VariableValue | undefined; 
  type: VariableType;
  allVariables: Record<string, Variable>;
  allLibraries?: Library[];
}) {
  if (!value) {
    return <span className="val-text">-</span>;
  }
  
  if (value.type === 'VARIABLE_ALIAS' && value.variableId) {
    const targetVar = allVariables[value.variableId];
    
    // Sprawdź czy to external alias (zmienna nie istnieje w bieżącej bibliotece)
    if (!targetVar) {
      // Spróbuj znaleźć w innych bibliotekach
      let externalTargetName = value.variableName || value.variableId;
      let externalLibName = value.collectionName || '';
      
      // Szukaj w innych bibliotekach
      if (allLibraries) {
        for (const lib of allLibraries) {
          const foundVar = lib.file.variables[value.variableId];
          if (foundVar) {
            externalTargetName = foundVar.name.split('/').pop() || foundVar.name;
            externalLibName = lib.name;
            break;
          }
        }
      }
      
      // Formatuj nazwę dla external
      const displayName = externalLibName 
        ? `${externalLibName}/${externalTargetName}` 
        : externalTargetName;
      
      return (
        <div className="val-alias val-alias--external">
          <ExternalLink className="icon sm" />
          <span className="val-alias__path">{displayName}</span>
        </div>
      );
    }
    
    // Internal alias
    const targetName = targetVar.name.split('/').pop() || targetVar.name;
    return (
      <div className="val-alias val-alias--internal">
        <ArrowRight className="icon sm" />
        <span className="val-alias__path">{targetName}</span>
      </div>
    );
  }
  
  // Wartość bezpośrednia
  const formatted = formatValue(value, type);
  
  // Specjalna obsługa kolorów z podglądem
  if (type === 'COLOR' && value.value && typeof value.value === 'object' && 'r' in value.value) {
    const { r, g, b, a = 1 } = value.value;
    const color = `rgba(${Math.round(r * 255)}, ${Math.round(g * 255)}, ${Math.round(b * 255)}, ${a})`;
    
    return (
      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
        <div 
          style={{ 
            width: '20px', 
            height: '20px', 
            borderRadius: '4px',
            background: color,
            border: '1px solid var(--border)',
          }} 
        />
        <span className="val-text">{formatted}</span>
      </div>
    );
  }
  
  return <span className="val-text">{formatted}</span>;
}

// Checkbox component
function Checkbox({ 
  checked, 
  indeterminate, 
  onChange 
}: { 
  checked: boolean; 
  indeterminate?: boolean;
  onChange: () => void;
}) {
  return (
    <div 
      className={`checkbox ${checked ? 'checked' : ''} ${indeterminate ? 'indeterminate' : ''}`}
      onClick={(e) => { e.stopPropagation(); onChange(); }}
    >
      {checked && <Check className="icon xs" />}
    </div>
  );
}

// Filter dropdown component
function FilterDropdown({ 
  isOpen, 
  onClose,
  typeFilters,
  aliasFilters,
  onTypeFilterChange,
  onAliasFilterChange,
  onClear,
  counts
}: {
  isOpen: boolean;
  onClose: () => void;
  typeFilters: VariableType[];
  aliasFilters: AliasType[];
  onTypeFilterChange: (type: VariableType) => void;
  onAliasFilterChange: (type: AliasType) => void;
  onClear: () => void;
  counts: {
    types: Record<VariableType, number>;
    aliases: Record<AliasType, number>;
  };
}) {
  if (!isOpen) return null;
  
  const typeOptions: { type: VariableType; label: string }[] = [
    { type: 'FLOAT', label: 'Number' },
    { type: 'BOOLEAN', label: 'Boolean' },
    { type: 'STRING', label: 'String' },
    { type: 'COLOR', label: 'Color' },
  ];
  
  const aliasOptions: { type: AliasType; label: string }[] = [
    { type: 'none', label: 'No alias' },
    { type: 'internal', label: 'Internal' },
    { type: 'external', label: 'External' },
    { type: 'broken', label: 'Broken' },
  ];
  
  return (
    <div className="filter-dropdown" style={{ display: 'block' }}>
      <div className="filter-section">
        <div className="filter-section__title">By Type</div>
        {typeOptions.map(({ type, label }) => (
          <div 
            key={type}
            className={`filter-option ${typeFilters.includes(type) ? 'selected' : ''}`}
            onClick={() => onTypeFilterChange(type)}
          >
            <div className="filter-option__check">
              {typeFilters.includes(type) && <Check className="icon xs" />}
            </div>
            <div className={`type-dot type-dot--${type.toLowerCase()}`} />
            <span className="filter-option__label">{label}</span>
            <span className="filter-option__count">{counts.types[type] || 0}</span>
          </div>
        ))}
      </div>
      <div className="filter-section">
        <div className="filter-section__title">By Alias</div>
        {aliasOptions.map(({ type, label }) => (
          <div 
            key={type}
            className={`filter-option ${aliasFilters.includes(type) ? 'selected' : ''}`}
            onClick={() => onAliasFilterChange(type)}
          >
            <div className="filter-option__check">
              {aliasFilters.includes(type) && <Check className="icon xs" />}
            </div>
            <div className={`alias-dot alias-dot--${type}`} />
            <span className="filter-option__label">{label}</span>
            <span className="filter-option__count">{counts.aliases[type] || 0}</span>
          </div>
        ))}
      </div>
      <div className="filter-actions">
        <button className="btn btn--ghost" onClick={onClear}>Clear all</button>
        <button className="btn btn--primary" onClick={onClose}>Apply</button>
      </div>
    </div>
  );
}

// Selection bar component
function SelectionBar({ 
  count, 
  onClear,
  onRename,
  onDelete,
  onDuplicate,
}: { 
  count: number; 
  onClear: () => void;
  onRename?: () => void;
  onDelete?: () => void;
  onDuplicate?: () => void;
}) {
  if (count === 0) return null;
  
  return (
    <div 
      style={{
        position: 'fixed',
        bottom: '48px',
        left: '50%',
        transform: 'translateX(-50%)',
        background: 'var(--bg-surface)',
        border: '1px solid var(--border)',
        borderRadius: '8px',
        padding: '8px 16px',
        display: 'flex',
        alignItems: 'center',
        gap: '16px',
        boxShadow: '0 4px 12px rgba(0,0,0,0.3)',
        zIndex: 100,
      }}
    >
      <span style={{ fontWeight: 500 }}>{count} selected</span>
      <div style={{ width: '1px', height: '20px', background: 'var(--border)' }} />
      <button className="btn btn--ghost" style={{ padding: '4px 8px' }} onClick={onRename}>
        <Edit3 className="icon sm" /> Rename
      </button>
      {onDuplicate && (
        <button className="btn btn--ghost" style={{ padding: '4px 8px' }} onClick={onDuplicate}>
          <Copy className="icon sm" /> Duplicate
        </button>
      )}
      <button className="btn btn--ghost" style={{ padding: '4px 8px', color: 'var(--red)' }} onClick={onDelete}>
        <Trash2 className="icon sm" /> Delete
      </button>
      <div style={{ width: '1px', height: '20px', background: 'var(--border)' }} />
      <button 
        className="btn btn--ghost" 
        style={{ padding: '4px 8px' }}
        onClick={onClear}
      >
        <X className="icon sm" /> Clear
      </button>
    </div>
  );
}

export function VariablesView() {
  const libraries = useAppStore((state) => state.libraries);
  const selectedLibraryId = useAppStore((state) => state.ui.selectedLibraryId);
  const selectedCollectionId = useAppStore((state) => state.ui.selectedCollectionId);
  const expandedFolders = useAppStore((state) => state.ui.expandedFolders);
  const selectedVariables = useAppStore((state) => state.ui.selectedVariables);
  const detailsPanelOpen = useAppStore((state) => state.ui.detailsPanelOpen);
  const searchQuery = useAppStore((state) => state.ui.searchQuery);
  const filters = useAppStore((state) => state.ui.filters);
  
  const toggleDetailsPanel = useAppStore((state) => state.toggleDetailsPanel);
  const toggleFolder = useAppStore((state) => state.toggleFolder);
  const setExpandedFolders = useAppStore((state) => state.setExpandedFolders);
  const toggleVariable = useAppStore((state) => state.toggleVariable);
  const selectVariables = useAppStore((state) => state.selectVariables);
  const clearSelection = useAppStore((state) => state.clearSelection);
  const setTypeFilter = useAppStore((state) => state.setTypeFilter);
  const setAliasFilter = useAppStore((state) => state.setAliasFilter);
  const clearFilters = useAppStore((state) => state.clearFilters);
  const renameVariable = useAppStore((state) => state.renameVariable);
  
  // UNDO/REDO
  const undo = useAppStore((state) => state.undo);
  const redo = useAppStore((state) => state.redo);
  const canUndo = useAppStore((state) => state.canUndo());
  const canRedo = useAppStore((state) => state.canRedo());
  const undoDescription = useAppStore((state) => state.getUndoDescription());
  const redoDescription = useAppStore((state) => state.getRedoDescription());
  
  const [filterOpen, setFilterOpen] = useState(false);
  const [lastClickedId, setLastClickedId] = useState<string | null>(null);
  const filterRef = useRef<HTMLDivElement>(null);
  
  // CRUD Modal states
  const [bulkRenameOpen, setBulkRenameOpen] = useState(false);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [duplicateModalOpen, setDuplicateModalOpen] = useState(false);
  const [duplicateFolderPath, setDuplicateFolderPath] = useState('');
  const [duplicateFolderCount, setDuplicateFolderCount] = useState(0);
  
  // Inline edit state
  const [editingVariableId, setEditingVariableId] = useState<string | null>(null);
  
  // Zamykanie filtra po kliknięciu poza nim
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (filterRef.current && !filterRef.current.contains(e.target as Node)) {
        setFilterOpen(false);
      }
    };
    
    if (filterOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [filterOpen]);
  
  // Skróty klawiszowe UNDO/REDO
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // ⌘Z lub Ctrl+Z = Undo
      if ((e.metaKey || e.ctrlKey) && e.key === 'z' && !e.shiftKey) {
        e.preventDefault();
        if (canUndo) undo();
      }
      // ⌘⇧Z lub Ctrl+Shift+Z = Redo
      if ((e.metaKey || e.ctrlKey) && e.key === 'z' && e.shiftKey) {
        e.preventDefault();
        if (canRedo) redo();
      }
      // ⌘Y lub Ctrl+Y = Redo (alternatywny skrót)
      if ((e.metaKey || e.ctrlKey) && e.key === 'y') {
        e.preventDefault();
        if (canRedo) redo();
      }
    };
    
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [canUndo, canRedo, undo, redo]);
  
  const selectedLibrary = libraries.find((l) => l.id === selectedLibraryId);
  const selectedCollection = selectedLibrary?.file.variableCollections?.[selectedCollectionId || ''];
  const allVariables = selectedLibrary?.file.variables || {};
  
  // Pobierz wszystkie zmienne dla kolekcji
  const allCollectionVariables = useMemo(() => {
    if (!selectedCollection) return [];
    return selectedCollection.variableIds
      .map((id) => allVariables[id])
      .filter(Boolean) as Variable[];
  }, [selectedCollection, allVariables]);
  
  // Filtruj zmienne
  const filteredVariables = useMemo(() => {
    let result = allCollectionVariables;
    
    // Search filter
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      result = result.filter((v) => 
        v.name.toLowerCase().includes(query)
      );
    }
    
    // Type filter
    if (filters.types.length > 0) {
      result = result.filter((v) => filters.types.includes(v.resolvedType));
    }
    
    // Alias filter
    if (filters.aliasTypes.length > 0) {
      result = result.filter((v) => {
        const aliasType = getAliasType(v, allVariables);
        return filters.aliasTypes.includes(aliasType);
      });
    }
    
    return result;
  }, [allCollectionVariables, searchQuery, filters, allVariables]);
  
  // Policz statystyki dla filtrów
  const filterCounts = useMemo(() => {
    const types: Record<VariableType, number> = { FLOAT: 0, BOOLEAN: 0, STRING: 0, COLOR: 0 };
    const aliases: Record<AliasType, number> = { none: 0, internal: 0, external: 0, broken: 0 };
    
    for (const v of allCollectionVariables) {
      types[v.resolvedType] = (types[v.resolvedType] || 0) + 1;
      const aliasType = getAliasType(v, allVariables);
      aliases[aliasType] = (aliases[aliasType] || 0) + 1;
    }
    
    return { types, aliases };
  }, [allCollectionVariables, allVariables]);
  
  // Zbuduj drzewo folderów
  const folderTree = useMemo(() => buildFolderTree(filteredVariables), [filteredVariables]);
  
  // Sprawdź czy "expand all"
  const isExpandAll = expandedFolders.includes('__all__');
  
  // Spłaszcz do wierszy
  const rows = useMemo(() => {
    if (isExpandAll) {
      const allIds = getAllFolderIds(folderTree);
      return flattenTree(folderTree, allIds);
    }
    return flattenTree(folderTree, expandedFolders);
  }, [folderTree, expandedFolders, isExpandAll]);
  
  // Wszystkie folder IDs
  const allFolderIds = useMemo(() => getAllFolderIds(folderTree), [folderTree]);
  
  // Wszystkie ID zmiennych w kolejności wizualnej (jak w tabeli)
  const visibleVariableIdsInOrder = useMemo(() => 
    rows.filter((r) => r.type === 'variable').map((r) => r.id),
    [rows]
  );
  
  // Wszystkie ID zmiennych po filtrach (dla Select All - włącznie ze zwiniętymi folderami)
  const allFilteredVariableIds = useMemo(() => 
    filteredVariables.map((v) => v.id),
    [filteredVariables]
  );
  
  // Pobierz modes
  const modes = selectedCollection?.modes || [];

  // Expand/Collapse all
  const handleExpandAll = useCallback(() => {
    setExpandedFolders(allFolderIds);
  }, [allFolderIds, setExpandedFolders]);
  
  const handleCollapseAll = useCallback(() => {
    setExpandedFolders([]);
  }, [setExpandedFolders]);
  
  // Select all checkbox logic - używamy WSZYSTKICH zmiennych po filtrach
  const allSelected = allFilteredVariableIds.length > 0 && 
    allFilteredVariableIds.every((id) => selectedVariables.includes(id));
  const someSelected = allFilteredVariableIds.some((id) => selectedVariables.includes(id));
  
  const handleSelectAll = useCallback(() => {
    if (allSelected) {
      clearSelection();
    } else {
      // Zaznacz WSZYSTKIE zmienne w kolekcji (po filtrach), nie tylko widoczne
      selectVariables(allFilteredVariableIds);
    }
  }, [allSelected, allFilteredVariableIds, selectVariables, clearSelection]);
  
  // Folder checkbox - zaznacza wszystkie zmienne w folderze
  const handleFolderSelect = useCallback((folder: FolderNode) => {
    // Zbierz wszystkie zmienne w tym folderze i podfolderach
    const collectVariableIds = (node: FolderNode): string[] => {
      const ids = node.variables.map((v) => v.id);
      for (const child of node.children) {
        ids.push(...collectVariableIds(child));
      }
      return ids;
    };
    
    const folderVariableIds = collectVariableIds(folder);
    const allFolderSelected = folderVariableIds.every((id) => selectedVariables.includes(id));
    
    if (allFolderSelected) {
      // Odznacz wszystkie z tego folderu
      selectVariables(selectedVariables.filter((id) => !folderVariableIds.includes(id)));
    } else {
      // Zaznacz wszystkie z tego folderu
      selectVariables([...new Set([...selectedVariables, ...folderVariableIds])]);
    }
  }, [selectedVariables, selectVariables]);
  
  // Sprawdź stan checkboxa folderu
  const getFolderCheckState = useCallback((folder: FolderNode): 'checked' | 'indeterminate' | 'unchecked' => {
    const collectVariableIds = (node: FolderNode): string[] => {
      const ids = node.variables.map((v) => v.id);
      for (const child of node.children) {
        ids.push(...collectVariableIds(child));
      }
      return ids;
    };
    
    const folderVariableIds = collectVariableIds(folder);
    if (folderVariableIds.length === 0) return 'unchecked';
    
    const selectedCount = folderVariableIds.filter((id) => selectedVariables.includes(id)).length;
    if (selectedCount === 0) return 'unchecked';
    if (selectedCount === folderVariableIds.length) return 'checked';
    return 'indeterminate';
  }, [selectedVariables]);
  
  // Row click with shift support - używamy wizualnej kolejności dla range selection
  const handleRowClick = useCallback((id: string, isVariable: boolean, e: React.MouseEvent) => {
    if (!isVariable) return;
    
    if (e.shiftKey && lastClickedId) {
      // Shift+click - select range (używamy wizualnej kolejności)
      const startIdx = visibleVariableIdsInOrder.indexOf(lastClickedId);
      const endIdx = visibleVariableIdsInOrder.indexOf(id);
      if (startIdx !== -1 && endIdx !== -1) {
        const start = Math.min(startIdx, endIdx);
        const end = Math.max(startIdx, endIdx);
        const rangeIds = visibleVariableIdsInOrder.slice(start, end + 1);
        selectVariables([...new Set([...selectedVariables, ...rangeIds])]);
      }
      setLastClickedId(id);
    } else {
      toggleVariable(id);
      setLastClickedId(id);
    }
  }, [lastClickedId, visibleVariableIdsInOrder, selectedVariables, selectVariables, toggleVariable]);
  
  // Toggle type filter
  const handleTypeFilterChange = useCallback((type: VariableType) => {
    const newTypes = filters.types.includes(type)
      ? filters.types.filter((t) => t !== type)
      : [...filters.types, type];
    setTypeFilter(newTypes);
  }, [filters.types, setTypeFilter]);
  
  // Toggle alias filter
  const handleAliasFilterChange = useCallback((type: AliasType) => {
    const newTypes = filters.aliasTypes.includes(type)
      ? filters.aliasTypes.filter((t) => t !== type)
      : [...filters.aliasTypes, type];
    setAliasFilter(newTypes);
  }, [filters.aliasTypes, setAliasFilter]);
  
  const activeFilterCount = filters.types.length + filters.aliasTypes.length;
  
  // Handler dla inline rename
  const handleInlineRename = useCallback((variableId: string, newName: string) => {
    if (!selectedLibraryId) return { success: false, error: 'No library selected' };
    const result = renameVariable(selectedLibraryId, variableId, newName);
    if (result.success) {
      setEditingVariableId(null);
    }
    return result;
  }, [selectedLibraryId, renameVariable]);
  
  // Handler dla double-click na nazwie zmiennej
  const handleVariableDoubleClick = useCallback((variableId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setEditingVariableId(variableId);
  }, []);
  
  // Handler dla duplicate folder (z context menu lub selection bar)
  const handleDuplicateFolder = useCallback((folderPath: string, variableCount: number) => {
    setDuplicateFolderPath(folderPath);
    setDuplicateFolderCount(variableCount);
    setDuplicateModalOpen(true);
  }, []);
  
  // Znajdź folder path z zaznaczonych zmiennych (dla duplikacji)
  const selectedFolderInfo = useMemo(() => {
    if (selectedVariables.length === 0 || !selectedLibrary) return null;
    
    const vars = selectedVariables.map((id) => allVariables[id]).filter(Boolean);
    if (vars.length === 0) return null;
    
    // Sprawdź czy wszystkie zmienne są w tym samym folderze
    const folders = new Set<string>();
    for (const v of vars) {
      const parts = v.name.split('/');
      if (parts.length > 1) {
        folders.add(parts.slice(0, -1).join('/'));
      }
    }
    
    if (folders.size === 1) {
      const folderPath = Array.from(folders)[0];
      // Policz wszystkie zmienne w tym folderze
      const folderVars = Object.values(allVariables).filter(
        (v) => v.name === folderPath || v.name.startsWith(folderPath + '/')
      );
      return { path: folderPath, count: folderVars.length };
    }
    
    return null;
  }, [selectedVariables, selectedLibrary, allVariables]);

  return (
    <>
      <VariablesSidebar />
      
      <main className="main">
        <div className="toolbar">
          <div className="toolbar__group">
            <button className="tool-btn" title="Expand all" onClick={handleExpandAll}>
              <Maximize2 className="icon" />
            </button>
            <button className="tool-btn" title="Collapse all" onClick={handleCollapseAll}>
              <Minimize2 className="icon" />
            </button>
          </div>
          
          <div className="toolbar__sep" />
          
          <div className="toolbar__group">
            <button 
              className="tool-btn" 
              title="Rename" 
              disabled={selectedVariables.length === 0}
              onClick={() => setBulkRenameOpen(true)}
            >
              <Edit3 className="icon" />
            </button>
            <button 
              className="tool-btn" 
              title="Duplicate folder" 
              disabled={!selectedFolderInfo}
              onClick={() => selectedFolderInfo && handleDuplicateFolder(selectedFolderInfo.path, selectedFolderInfo.count)}
            >
              <Copy className="icon" />
            </button>
            <button 
              className="tool-btn" 
              title="Delete" 
              disabled={selectedVariables.length === 0}
              onClick={() => setDeleteModalOpen(true)}
            >
              <Trash2 className="icon" />
            </button>
          </div>
          
          <div className="toolbar__sep" />
          
          <button className="tool-btn" title="Bulk Alias" disabled={selectedVariables.length === 0}>
            <Link className="icon" />
          </button>
          
          <div className="toolbar__sep" />
          
          <div className="toolbar__group">
            <button 
              className="tool-btn" 
              title={undoDescription ? `Undo: ${undoDescription}` : 'Undo (⌘Z)'}
              disabled={!canUndo}
              onClick={undo}
            >
              <Undo2 className="icon" />
            </button>
            <button 
              className="tool-btn" 
              title={redoDescription ? `Redo: ${redoDescription}` : 'Redo (⌘⇧Z)'}
              disabled={!canRedo}
              onClick={redo}
            >
              <Redo2 className="icon" />
            </button>
          </div>
          
          <div className="toolbar__sep" />
          
          <div className="filter-wrapper" ref={filterRef} style={{ position: 'relative' }}>
            <button 
              className={`filter-btn ${activeFilterCount > 0 ? 'active' : ''}`}
              onClick={() => setFilterOpen(!filterOpen)}
            >
              <Filter className="icon sm" />
              Filter
              {activeFilterCount > 0 && (
                <span className="filter-btn__badge">{activeFilterCount}</span>
              )}
            </button>
            <FilterDropdown
              isOpen={filterOpen}
              onClose={() => setFilterOpen(false)}
              typeFilters={filters.types}
              aliasFilters={filters.aliasTypes}
              onTypeFilterChange={handleTypeFilterChange}
              onAliasFilterChange={handleAliasFilterChange}
              onClear={() => { clearFilters(); setFilterOpen(false); }}
              counts={filterCounts}
            />
          </div>
          
          <div className="toolbar__sep" />
          
          <button 
            className={`tool-btn ${detailsPanelOpen ? 'active' : ''}`}
            title="Details panel"
            onClick={toggleDetailsPanel}
          >
            <PanelRight className="icon" />
          </button>
          
          <div className="toolbar__spacer" />
          
          <div className="breadcrumb">
            <span className="breadcrumb__item">{selectedLibrary?.name || 'Select library'}</span>
            {selectedCollection && (
              <>
                <span className="breadcrumb__sep">›</span>
                <span className="breadcrumb__current">{selectedCollection.name}</span>
              </>
            )}
          </div>
        </div>

        <div className="table-wrap">
          {!selectedCollection ? (
            <div style={{ 
              display: 'flex', 
              alignItems: 'center', 
              justifyContent: 'center', 
              height: '100%',
              color: 'var(--text-muted)'
            }}>
              Select a library and collection to view variables
            </div>
          ) : (
            <table className="table var-table">
              <thead>
                <tr>
                  <th className="col-check">
                    <Checkbox 
                      checked={allSelected} 
                      indeterminate={someSelected && !allSelected}
                      onChange={handleSelectAll}
                    />
                  </th>
                  <th className="col-name">Name</th>
                  {modes.map((mode) => (
                    <th key={mode.modeId} className="col-mode">
                      <div className="mode-header">
                        <span className="mode-header__label">{mode.name}</span>
                      </div>
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {rows.length === 0 ? (
                  <tr>
                    <td colSpan={2 + modes.length} style={{ textAlign: 'center', color: 'var(--text-muted)', padding: '40px' }}>
                      {searchQuery || activeFilterCount > 0 
                        ? 'No variables match your filters'
                        : 'No variables in this collection'}
                    </td>
                  </tr>
                ) : (
                  rows.map((row) => {
                    if (row.type === 'folder' && row.folder) {
                      const isExpanded = isExpandAll || expandedFolders.includes(row.id);
                      const folderCheckState = getFolderCheckState(row.folder);
                      
                      return (
                        <tr 
                          key={row.id} 
                          className={`row-folder ${isExpanded ? 'expanded' : ''}`}
                          onClick={() => toggleFolder(row.id)}
                          style={{ 
                            background: row.depth === 0 ? 'var(--bg-surface)' : 'var(--bg-elevated)'
                          }}
                        >
                          <td>
                            <div className="table__check-cell">
                              <Checkbox 
                                checked={folderCheckState === 'checked'}
                                indeterminate={folderCheckState === 'indeterminate'}
                                onChange={() => handleFolderSelect(row.folder!)}
                              />
                            </div>
                          </td>
                          <td colSpan={1 + modes.length}>
                            <div 
                              className="folder-cell" 
                              style={{ paddingLeft: `${12 + row.depth * 20}px` }}
                            >
                              <ChevronRight 
                                className="icon xs folder-cell__chevron" 
                                style={{ 
                                  transform: isExpanded ? 'rotate(90deg)' : 'none',
                                  transition: 'transform 0.15s'
                                }}
                              />
                              <Folder className="icon" />
                              <span className="folder-cell__name">{row.name}</span>
                              <span className="folder-cell__count">{row.childCount}</span>
                            </div>
                          </td>
                        </tr>
                      );
                    }
                    
                    const variable = row.variable!;
                    const isSelected = selectedVariables.includes(row.id);
                    const isEditing = editingVariableId === row.id;
                    
                    return (
                      <tr 
                        key={row.id} 
                        className={`row-var ${isSelected ? 'selected' : ''}`}
                        onClick={(e) => handleRowClick(row.id, true, e)}
                      >
                        <td>
                          <div className="table__check-cell">
                            <Checkbox 
                              checked={isSelected}
                              onChange={() => toggleVariable(row.id)}
                            />
                          </div>
                        </td>
                        <td>
                          <div 
                            className="var-cell" 
                            style={{ paddingLeft: `${32 + row.depth * 20}px` }}
                            onDoubleClick={(e) => handleVariableDoubleClick(row.id, e)}
                          >
                            <div className="type-badge">
                              <TypeIcon type={variable.resolvedType} />
                            </div>
                            {isEditing ? (
                              <InlineEdit
                                value={row.name}
                                onSave={(newName) => handleInlineRename(row.id, newName)}
                                onCancel={() => setEditingVariableId(null)}
                              />
                            ) : (
                              <span className="var-cell__name">
                                {searchQuery ? (
                                  <HighlightText text={row.name} highlight={searchQuery} />
                                ) : (
                                  row.name
                                )}
                              </span>
                            )}
                          </div>
                        </td>
                        {modes.map((mode) => (
                          <td key={mode.modeId} className="val-cell">
                            <ValueCell 
                              value={variable.valuesByMode?.[mode.modeId]} 
                              type={variable.resolvedType}
                              allVariables={allVariables}
                              allLibraries={libraries}
                            />
                          </td>
                        ))}
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          )}
        </div>
        
        <SelectionBar 
          count={selectedVariables.length} 
          onClear={clearSelection}
          onRename={() => setBulkRenameOpen(true)}
          onDelete={() => setDeleteModalOpen(true)}
          onDuplicate={selectedFolderInfo ? () => handleDuplicateFolder(selectedFolderInfo.path, selectedFolderInfo.count) : undefined}
        />
      </main>
      
      {detailsPanelOpen && <DetailsPanel />}
      
      {/* CRUD Modals */}
      <BulkRenameModal
        isOpen={bulkRenameOpen}
        onClose={() => setBulkRenameOpen(false)}
        variableIds={selectedVariables}
        libraryId={selectedLibraryId || ''}
      />
      
      <DeleteModal
        isOpen={deleteModalOpen}
        onClose={() => setDeleteModalOpen(false)}
        variableIds={selectedVariables}
        libraryId={selectedLibraryId || ''}
      />
      
      <DuplicateFolderModal
        isOpen={duplicateModalOpen}
        onClose={() => setDuplicateModalOpen(false)}
        folderPath={duplicateFolderPath}
        libraryId={selectedLibraryId || ''}
        collectionId={selectedCollectionId || ''}
        variableCount={duplicateFolderCount}
      />
    </>
  );
}

// Podświetlanie tekstu wyszukiwania
function HighlightText({ text, highlight }: { text: string; highlight: string }) {
  if (!highlight.trim()) return <>{text}</>;
  
  const parts = text.split(new RegExp(`(${highlight})`, 'gi'));
  
  return (
    <>
      {parts.map((part, i) => 
        part.toLowerCase() === highlight.toLowerCase() ? (
          <mark key={i} style={{ background: 'var(--accent)', color: 'white', borderRadius: '2px', padding: '0 2px' }}>
            {part}
          </mark>
        ) : (
          <span key={i}>{part}</span>
        )
      )}
    </>
  );
}
