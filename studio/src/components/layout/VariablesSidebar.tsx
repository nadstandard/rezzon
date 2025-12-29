import { ChevronDown, ChevronRight, Package, Box, Layers, Folder, Check } from 'lucide-react';
import { useState, useMemo, useCallback } from 'react';
import { useAppStore } from '../../stores/appStore';
import { buildFolderTree } from '../../utils/folderTree';
import type { FolderNode } from '../../utils/folderTree';
import type { Variable } from '../../types';

interface SidebarSectionProps {
  title: string;
  children: React.ReactNode;
  defaultExpanded?: boolean;
}

function SidebarSection({ title, children, defaultExpanded = true }: SidebarSectionProps) {
  const [expanded, setExpanded] = useState(defaultExpanded);
  
  return (
    <div className={`sidebar__section ${expanded ? '' : 'collapsed'}`}>
      <div className="sidebar__header" onClick={() => setExpanded(!expanded)}>
        <ChevronDown className="icon xs sidebar__chevron" />
        <span className="sidebar__title">{title}</span>
      </div>
      {expanded && <div className="sidebar__content">{children}</div>}
    </div>
  );
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

// Rekurencyjny komponent dla folderu w drzewie
function FolderTreeItem({ 
  folder, 
  depth,
  expandedFolders,
  selectedVariables,
  onToggleExpand,
  onToggleSelect,
  getFolderCheckState,
}: {
  folder: FolderNode;
  depth: number;
  expandedFolders: string[];
  selectedVariables: string[];
  onToggleExpand: (folderId: string) => void;
  onToggleSelect: (folder: FolderNode) => void;
  getFolderCheckState: (folder: FolderNode) => 'checked' | 'indeterminate' | 'unchecked';
}) {
  const isExpanded = expandedFolders.includes(folder.id);
  const checkState = getFolderCheckState(folder);
  const hasChildren = folder.children.length > 0;
  
  return (
    <>
      <div 
        className={`tree-item ${isExpanded ? 'expanded' : ''}`}
        style={{ paddingLeft: `${8 + depth * 16}px` }}
        onClick={() => onToggleExpand(folder.id)}
      >
        <Checkbox 
          checked={checkState === 'checked'}
          indeterminate={checkState === 'indeterminate'}
          onChange={() => onToggleSelect(folder)}
        />
        <span className="tree-item__chevron">
          {hasChildren && <ChevronRight className="icon xs" />}
        </span>
        <Folder className="icon" />
        <span style={{ flex: 1, overflow: 'hidden', textOverflow: 'ellipsis' }}>{folder.name}</span>
      </div>
      {isExpanded && folder.children.map((child) => (
        <FolderTreeItem
          key={child.id}
          folder={child}
          depth={depth + 1}
          expandedFolders={expandedFolders}
          selectedVariables={selectedVariables}
          onToggleExpand={onToggleExpand}
          onToggleSelect={onToggleSelect}
          getFolderCheckState={getFolderCheckState}
        />
      ))}
    </>
  );
}

export function VariablesSidebar() {
  const libraries = useAppStore((state) => state.libraries);
  const selectedLibraryId = useAppStore((state) => state.ui.selectedLibraryId);
  const selectedCollectionId = useAppStore((state) => state.ui.selectedCollectionId);
  const expandedFolders = useAppStore((state) => state.ui.expandedFolders);
  const selectedVariables = useAppStore((state) => state.ui.selectedVariables);
  const selectLibrary = useAppStore((state) => state.selectLibrary);
  const selectCollection = useAppStore((state) => state.selectCollection);
  const toggleFolder = useAppStore((state) => state.toggleFolder);
  const selectVariables = useAppStore((state) => state.selectVariables);
  
  const selectedLibrary = libraries.find((l) => l.id === selectedLibraryId);
  const collections = selectedLibrary 
    ? Object.values(selectedLibrary.file.variableCollections || {})
    : [];
  
  // Zbuduj drzewo folderów dla wybranej kolekcji
  const selectedCollection = selectedLibrary?.file.variableCollections?.[selectedCollectionId || ''];
  const allVariables = selectedLibrary?.file.variables || {};
  
  const folderTree = useMemo(() => {
    if (!selectedCollection) return null;
    const variables = selectedCollection.variableIds
      .map((id) => allVariables[id])
      .filter(Boolean) as Variable[];
    return buildFolderTree(variables);
  }, [selectedCollection, allVariables]);
  
  // Funkcja do zbierania ID zmiennych z folderu
  const collectVariableIds = useCallback((node: FolderNode): string[] => {
    const ids = node.variables.map((v) => v.id);
    for (const child of node.children) {
      ids.push(...collectVariableIds(child));
    }
    return ids;
  }, []);
  
  // Sprawdź stan checkboxa folderu
  const getFolderCheckState = useCallback((folder: FolderNode): 'checked' | 'indeterminate' | 'unchecked' => {
    const folderVariableIds = collectVariableIds(folder);
    if (folderVariableIds.length === 0) return 'unchecked';
    
    const selectedCount = folderVariableIds.filter((id) => selectedVariables.includes(id)).length;
    if (selectedCount === 0) return 'unchecked';
    if (selectedCount === folderVariableIds.length) return 'checked';
    return 'indeterminate';
  }, [selectedVariables, collectVariableIds]);
  
  // Toggle select folderu
  const handleFolderSelect = useCallback((folder: FolderNode) => {
    const folderVariableIds = collectVariableIds(folder);
    const allFolderSelected = folderVariableIds.every((id) => selectedVariables.includes(id));
    
    if (allFolderSelected) {
      selectVariables(selectedVariables.filter((id) => !folderVariableIds.includes(id)));
    } else {
      selectVariables([...new Set([...selectedVariables, ...folderVariableIds])]);
    }
  }, [selectedVariables, selectVariables, collectVariableIds]);

  return (
    <aside className="sidebar">
      <div className="sidebar__scroll">
        <SidebarSection title="Libraries">
          {libraries.length === 0 ? (
            <div className="sidebar-item" style={{ color: 'var(--text-muted)' }}>
              No libraries loaded
            </div>
          ) : (
            libraries.map((lib) => (
              <div
                key={lib.id}
                className={`sidebar-item ${selectedLibraryId === lib.id ? 'active' : ''}`}
                onClick={() => selectLibrary(lib.id)}
              >
                {lib.isMain ? (
                  <Package className="icon" />
                ) : (
                  <Box className="icon" />
                )}
                <span className="sidebar-item__name">{lib.name}</span>
                <span className="sidebar-item__count">{lib.variableCount.toLocaleString()}</span>
              </div>
            ))
          )}
        </SidebarSection>
        
        <SidebarSection title="Collections">
          {collections.length === 0 ? (
            <div className="sidebar-item" style={{ color: 'var(--text-muted)' }}>
              Select a library
            </div>
          ) : (
            collections.map((col) => (
              <div
                key={col.id}
                className={`sidebar-item ${selectedCollectionId === col.id ? 'active' : ''}`}
                onClick={() => selectCollection(col.id)}
              >
                <Layers className="icon" />
                <span className="sidebar-item__name">{col.name}</span>
                <span className="sidebar-item__count">{col.variableIds.length.toLocaleString()}</span>
              </div>
            ))
          )}
        </SidebarSection>
        
        <SidebarSection title="Folders">
          {!folderTree || folderTree.children.length === 0 ? (
            <div className="sidebar-item" style={{ color: 'var(--text-muted)' }}>
              {selectedCollectionId ? 'No folders' : 'Select a collection'}
            </div>
          ) : (
            folderTree.children.map((folder) => (
              <FolderTreeItem
                key={folder.id}
                folder={folder}
                depth={0}
                expandedFolders={expandedFolders}
                selectedVariables={selectedVariables}
                onToggleExpand={toggleFolder}
                onToggleSelect={handleFolderSelect}
                getFolderCheckState={getFolderCheckState}
              />
            ))
          )}
        </SidebarSection>
      </div>
    </aside>
  );
}
