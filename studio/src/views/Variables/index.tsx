import { useMemo } from 'react';
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
  Folder
} from 'lucide-react';
import { useAppStore } from '../../stores/appStore';
import { VariablesSidebar } from '../../components/layout/VariablesSidebar';
import { DetailsPanel } from '../../components/layout/DetailsPanel';
import { buildFolderTree, flattenTree, getAllFolderIds } from '../../utils/folderTree';
import type { Variable, VariableType, VariableValue } from '../../types';

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

// Komponent dla komórki wartości
function ValueCell({ value, type, allVariables }: { 
  value: VariableValue | undefined; 
  type: VariableType;
  allVariables: Record<string, Variable>;
}) {
  if (!value) {
    return <span className="val-text">-</span>;
  }
  
  if (value.type === 'VARIABLE_ALIAS' && value.variableId) {
    const targetVar = allVariables[value.variableId];
    const targetName = targetVar?.name.split('/').pop() || 'unknown';
    const isExternal = !targetVar;
    
    if (isExternal || !targetVar) {
      return (
        <div className="val-alias val-alias--external">
          <ExternalLink className="icon sm" />
          <span className="val-alias__path">{targetName}</span>
        </div>
      );
    }
    
    return (
      <div className="val-alias val-alias--internal">
        <ArrowRight className="icon sm" />
        <span className="val-alias__path">{targetName}</span>
      </div>
    );
  }
  
  const formatted = formatValue(value, type);
  
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

export function VariablesView() {
  const libraries = useAppStore((state) => state.libraries);
  const selectedLibraryId = useAppStore((state) => state.ui.selectedLibraryId);
  const selectedCollectionId = useAppStore((state) => state.ui.selectedCollectionId);
  const expandedFolders = useAppStore((state) => state.ui.expandedFolders);
  const detailsPanelOpen = useAppStore((state) => state.ui.detailsPanelOpen);
  const toggleDetailsPanel = useAppStore((state) => state.toggleDetailsPanel);
  const toggleFolder = useAppStore((state) => state.toggleFolder);
  
  const selectedLibrary = libraries.find((l) => l.id === selectedLibraryId);
  const selectedCollection = selectedLibrary?.file.variableCollections?.[selectedCollectionId || ''];
  const allVariables = selectedLibrary?.file.variables || {};
  
  const variables = useMemo(() => {
    if (!selectedCollection) return [];
    return selectedCollection.variableIds
      .map((id) => allVariables[id])
      .filter(Boolean) as Variable[];
  }, [selectedCollection, allVariables]);
  
  const folderTree = useMemo(() => buildFolderTree(variables), [variables]);
  
  const rows = useMemo(() => 
    flattenTree(folderTree, expandedFolders), 
    [folderTree, expandedFolders]
  );
  
  const allFolderIds = useMemo(() => getAllFolderIds(folderTree), [folderTree]);
  
  const modes = selectedCollection?.modes || [];

  const handleExpandAll = () => {
    for (const id of allFolderIds) {
      if (!expandedFolders.includes(id)) {
        toggleFolder(id);
      }
    }
  };
  
  const handleCollapseAll = () => {
    for (const id of expandedFolders) {
      toggleFolder(id);
    }
  };

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
            <button className="tool-btn" title="Rename">
              <Edit3 className="icon" />
            </button>
            <button className="tool-btn" title="Duplicate">
              <Copy className="icon" />
            </button>
            <button className="tool-btn" title="Delete">
              <Trash2 className="icon" />
            </button>
          </div>
          
          <div className="toolbar__sep" />
          
          <button className="tool-btn" title="Bulk Alias">
            <Link className="icon" />
          </button>
          
          <div className="toolbar__sep" />
          
          <div className="toolbar__group">
            <button className="tool-btn" title="Undo">
              <Undo2 className="icon" />
            </button>
            <button className="tool-btn" title="Redo" disabled>
              <Redo2 className="icon" />
            </button>
          </div>
          
          <div className="toolbar__sep" />
          
          <button className="filter-btn">
            <Filter className="icon sm" />
            Filter
          </button>
          
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
                    <div className="checkbox" />
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
                      No variables in this collection
                    </td>
                  </tr>
                ) : (
                  rows.map((row) => {
                    if (row.type === 'folder') {
                      const isExpanded = expandedFolders.includes(row.id) || expandedFolders.includes('all');
                      
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
                              <div className="checkbox" />
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
                    
                    return (
                      <tr key={row.id} className="row-var">
                        <td>
                          <div className="table__check-cell">
                            <div className="checkbox" />
                          </div>
                        </td>
                        <td>
                          <div 
                            className="var-cell" 
                            style={{ paddingLeft: `${32 + row.depth * 20}px` }}
                          >
                            <div className="type-badge">
                              <TypeIcon type={variable.resolvedType} />
                            </div>
                            <span className="var-cell__name">{row.name}</span>
                          </div>
                        </td>
                        {modes.map((mode) => (
                          <td key={mode.modeId} className="val-cell">
                            <ValueCell 
                              value={variable.valuesByMode?.[mode.modeId]} 
                              type={variable.resolvedType}
                              allVariables={allVariables}
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
      </main>
      
      {detailsPanelOpen && <DetailsPanel />}
    </>
  );
}
