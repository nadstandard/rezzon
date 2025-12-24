import React, { useState } from 'react';
import {
  useGridStore,
  computeBaseValues,
  calcColN,
  calcColNwHalf,
  calcColNwMargin,
  calcColNtoEdge,
  calcColN1g,
  calcColN2g,
  calcColViewport,
  calcColViewportWMargin,
  calcMarginXs,
  calcMarginM,
  calcMarginL,
  calcMarginXL,
  calcMarginXXL,
  calcMarginXXXL,
  calcIngridL,
  calcIngridXL,
  calcIngridXXL,
  calcIngridXXXL,
  isDL,
  isTM,
  VIEWPORTS,
  type ViewportName,
  type ExceptionValue,
} from '../stores/gridStore';
import { useFileHandling } from '../hooks/useFileHandling';
import { Modal } from './Modal';
import { Toast } from './Toast';

// ============================================================================
// TYPES
// ============================================================================

type TreeSelection = 
  | { type: 'BASE'; viewport?: ViewportName }
  | { type: 'column'; viewport?: ViewportName }
  | { type: 'margin'; viewport?: ViewportName }
  | { type: 'container'; folderId?: string }
  | { type: 'photo'; folderId?: string };

type ViewMode = 'table' | 'config';

// ============================================================================
// GRID SIDEBAR (własne drzewo)
// ============================================================================

interface GridSidebarProps {
  selection: TreeSelection;
  onSelect: (sel: TreeSelection) => void;
  folders: { id: string; name: string; parent: 'container' | 'photo' }[];
  expandedFolders: Set<string>;
  onToggleExpand: (folder: string) => void;
}

function GridSidebar({ selection, onSelect, folders, expandedFolders, onToggleExpand }: GridSidebarProps) {
  const isSelected = (type: string, viewport?: string, folderId?: string) => {
    if (selection.type !== type) return false;
    if (type === 'BASE' || type === 'column' || type === 'margin') {
      const sel = selection as { type: string; viewport?: ViewportName };
      return viewport ? sel.viewport === viewport : !sel.viewport;
    }
    if (type === 'container' || type === 'photo') {
      const sel = selection as { type: string; folderId?: string };
      return folderId ? sel.folderId === folderId : !sel.folderId;
    }
    return false;
  };

  const containerFolders = folders.filter(f => f.parent === 'container');
  const photoFolders = folders.filter(f => f.parent === 'photo');

  return (
    <div className="grid-sidebar">
      <div className="grid-sidebar-header">Grid Editor</div>
      <div className="grid-sidebar-content">
        {/* BASE */}
        <div 
          className={`tree-item folder ${isSelected('BASE') ? 'active' : ''}`}
          onClick={() => onSelect({ type: 'BASE' })}
        >
          <span 
            className={`tree-arrow ${expandedFolders.has('BASE') ? 'expanded' : ''}`}
            onClick={(e) => { e.stopPropagation(); onToggleExpand('BASE'); }}
          >▶</span>
          <span className="tree-icon">📁</span>
          <span className="tree-label">BASE</span>
        </div>
        {expandedFolders.has('BASE') && VIEWPORTS.map(vp => (
          <div 
            key={`BASE-${vp}`}
            className={`tree-item indent-1 ${isSelected('BASE', vp) ? 'active' : ''}`}
            onClick={() => onSelect({ type: 'BASE', viewport: vp })}
          >
            <span className="tree-arrow hidden">▶</span>
            <span className="tree-icon">◇</span>
            <span className="tree-label">{vp}</span>
          </div>
        ))}

        {/* column (auto) */}
        <div 
          className={`tree-item folder ${isSelected('column') ? 'active' : ''}`}
          onClick={() => onSelect({ type: 'column' })}
        >
          <span 
            className={`tree-arrow ${expandedFolders.has('column') ? 'expanded' : ''}`}
            onClick={(e) => { e.stopPropagation(); onToggleExpand('column'); }}
          >▶</span>
          <span className="tree-icon">📁</span>
          <span className="tree-label">column</span>
          <span className="tree-badge">auto</span>
        </div>
        {expandedFolders.has('column') && VIEWPORTS.map(vp => (
          <div 
            key={`column-${vp}`}
            className={`tree-item indent-1 ${isSelected('column', vp) ? 'active' : ''}`}
            onClick={() => onSelect({ type: 'column', viewport: vp })}
          >
            <span className="tree-arrow hidden">▶</span>
            <span className="tree-icon">◇</span>
            <span className="tree-label">{vp}</span>
          </div>
        ))}

        {/* margin (auto) */}
        <div 
          className={`tree-item folder ${isSelected('margin') ? 'active' : ''}`}
          onClick={() => onSelect({ type: 'margin' })}
        >
          <span 
            className={`tree-arrow ${expandedFolders.has('margin') ? 'expanded' : ''}`}
            onClick={(e) => { e.stopPropagation(); onToggleExpand('margin'); }}
          >▶</span>
          <span className="tree-icon">📁</span>
          <span className="tree-label">margin</span>
          <span className="tree-badge">auto</span>
        </div>
        {expandedFolders.has('margin') && VIEWPORTS.map(vp => (
          <div 
            key={`margin-${vp}`}
            className={`tree-item indent-1 ${isSelected('margin', vp) ? 'active' : ''}`}
            onClick={() => onSelect({ type: 'margin', viewport: vp })}
          >
            <span className="tree-arrow hidden">▶</span>
            <span className="tree-icon">◇</span>
            <span className="tree-label">{vp}</span>
          </div>
        ))}

        {/* container (zawsze widoczny) */}
        <div 
          className={`tree-item folder ${isSelected('container') && !(selection as any).folderId ? 'active' : ''}`}
          onClick={() => onSelect({ type: 'container' })}
        >
          <span 
            className={`tree-arrow ${expandedFolders.has('container') ? 'expanded' : ''}`}
            onClick={(e) => { e.stopPropagation(); onToggleExpand('container'); }}
          >▶</span>
          <span className="tree-icon">📁</span>
          <span className="tree-label">container</span>
        </div>
        {expandedFolders.has('container') && containerFolders.map(f => (
          <div 
            key={f.id}
            className={`tree-item indent-1 ${isSelected('container', undefined, f.id) ? 'active' : ''}`}
            onClick={() => onSelect({ type: 'container', folderId: f.id })}
          >
            <span className="tree-arrow hidden">▶</span>
            <span className="tree-icon">◇</span>
            <span className="tree-label">{f.name}</span>
          </div>
        ))}

        {/* photo (zawsze widoczny) */}
        <div 
          className={`tree-item folder ${isSelected('photo') && !(selection as any).folderId ? 'active' : ''}`}
          onClick={() => onSelect({ type: 'photo' })}
        >
          <span 
            className={`tree-arrow ${expandedFolders.has('photo') ? 'expanded' : ''}`}
            onClick={(e) => { e.stopPropagation(); onToggleExpand('photo'); }}
          >▶</span>
          <span className="tree-icon">📁</span>
          <span className="tree-label">photo</span>
        </div>
        {expandedFolders.has('photo') && photoFolders.map(f => (
          <div 
            key={f.id}
            className={`tree-item indent-1 ${isSelected('photo', undefined, f.id) ? 'active' : ''}`}
            onClick={() => onSelect({ type: 'photo', folderId: f.id })}
          >
            <span className="tree-arrow hidden">▶</span>
            <span className="tree-icon">◇</span>
            <span className="tree-label">{f.name}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

// ============================================================================
// TOOLBAR
// ============================================================================

interface GridToolbarProps {
  viewMode: ViewMode;
  onViewModeChange: (mode: ViewMode) => void;
  showViewToggle: boolean;
  onAddFolder: () => void;
  onImport: (file: File) => void;
  onExport: () => void;
}

function GridToolbar({ viewMode, onViewModeChange, showViewToggle, onAddFolder, onImport, onExport }: GridToolbarProps) {
  const fileInputRef = React.useRef<HTMLInputElement>(null);

  return (
    <div className="grid-toolbar">
      <div className="grid-toolbar-left">
        {showViewToggle && (
          <div className="view-tabs">
            <button 
              className={`view-tab ${viewMode === 'table' ? 'active' : ''}`}
              onClick={() => onViewModeChange('table')}
            >
              Table
            </button>
            <button 
              className={`view-tab ${viewMode === 'config' ? 'active' : ''}`}
              onClick={() => onViewModeChange('config')}
            >
              Configuration
            </button>
          </div>
        )}
      </div>
      <div className="grid-toolbar-right">
        <button className="btn btn-secondary" onClick={onAddFolder}>
          + Folder
        </button>
        <input
          ref={fileInputRef}
          type="file"
          accept=".json"
          onChange={(e) => {
            const file = e.target.files?.[0];
            if (file) {
              onImport(file);
              e.target.value = '';
            }
          }}
          style={{ display: 'none' }}
          id="grid-import-file"
        />
        <label htmlFor="grid-import-file" className="btn btn-secondary" style={{ cursor: 'pointer' }}>
          Import
        </label>
        <button className="btn btn-primary" onClick={onExport}>
          Export JSON
        </button>
      </div>
    </div>
  );
}

// ============================================================================
// BASE TABLE
// ============================================================================

interface BaseTableProps {
  viewport?: ViewportName;
}

function BaseTable({ viewport }: BaseTableProps) {
  const store = useGridStore();
  const viewports = viewport ? [viewport] : VIEWPORTS;

  return (
    <div className="table-container">
      <table className="data-table">
        <thead>
          <tr>
            <th>Name</th>
            {store.modes.map(mode => (
              <th key={mode.id}>{mode.name}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {viewports.map(vp => (
            <React.Fragment key={vp}>
              <tr className="group-header">
                <td colSpan={store.modes.length + 1}>{vp}</td>
              </tr>
              
              {/* Editable values */}
              {[
                { field: 'viewport' as const, label: 'viewport' },
                { field: 'columns' as const, label: 'columns' },
                { field: 'gutterWidth' as const, label: 'gutter width' },
                { field: 'marginM' as const, label: 'margin m' },
                { field: 'marginXs' as const, label: 'margin xs' },
              ].map(({ field, label }) => (
                <tr key={`${vp}-${field}`}>
                  <td>
                    <div className="cell-name">
                      <span className="cell-icon">#</span>
                      <span>{label}</span>
                    </div>
                  </td>
                  {store.modes.map(mode => (
                    <td key={mode.id}>
                      <input
                        type="number"
                        className="cell-input"
                        value={store.base[vp][mode.id]?.[field] ?? 0}
                        onChange={(e) => {
                          const val = parseFloat(e.target.value);
                          if (!isNaN(val)) store.setBaseValue(vp, mode.id, field, val);
                        }}
                      />
                    </td>
                  ))}
                </tr>
              ))}

              {/* Computed values */}
              <tr>
                <td>
                  <div className="cell-name">
                    <span className="cell-icon computed">=</span>
                    <span>ingrid</span>
                  </div>
                </td>
                {store.modes.map(mode => {
                  const base = store.base[vp][mode.id];
                  const computed = computeBaseValues(base);
                  return (
                    <td key={mode.id}>
                      <span className="cell-value computed">{Math.round(computed.ingrid)}</span>
                    </td>
                  );
                })}
              </tr>
              <tr>
                <td>
                  <div className="cell-name">
                    <span className="cell-icon computed">=</span>
                    <span>column width</span>
                  </div>
                </td>
                {store.modes.map(mode => {
                  const base = store.base[vp][mode.id];
                  const computed = computeBaseValues(base);
                  return (
                    <td key={mode.id}>
                      <span className="cell-value computed">{Math.round(computed.columnWidth * 100) / 100}</span>
                    </td>
                  );
                })}
              </tr>
            </React.Fragment>
          ))}
        </tbody>
      </table>
    </div>
  );
}

// ============================================================================
// COLUMN TABLE
// ============================================================================

interface ColumnTableProps {
  viewport?: ViewportName;
}

function ColumnTable({ viewport }: ColumnTableProps) {
  const store = useGridStore();
  const viewports = viewport ? [viewport] : VIEWPORTS;

  return (
    <div className="table-container">
      <table className="data-table">
        <thead>
          <tr>
            <th>Name</th>
            {store.modes.map(mode => (
              <th key={mode.id}>{mode.name}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {viewports.map(vp => (
            <React.Fragment key={vp}>
              <tr className="group-header">
                <td colSpan={store.modes.length + 1}>{vp}</td>
              </tr>
              
              {/* v-col-1 to v-col-12 */}
              {Array.from({ length: 12 }, (_, i) => i + 1).map(n => (
                <React.Fragment key={`${vp}-${n}`}>
                  <tr>
                    <td>
                      <div className="cell-name">
                        <span className="cell-icon computed">=</span>
                        <span>v-col-{n}</span>
                      </div>
                    </td>
                    {store.modes.map(mode => {
                      const base = store.base[vp][mode.id];
                      const computed = computeBaseValues(base);
                      return (
                        <td key={mode.id}>
                          <span className="cell-value computed">{Math.round(calcColN(n, base, computed))}</span>
                        </td>
                      );
                    })}
                  </tr>
                  {n < 12 && (
                    <tr>
                      <td>
                        <div className="cell-name cell-name-indent">
                          <span className="cell-icon computed">=</span>
                          <span>v-col-{n}-w-half</span>
                        </div>
                      </td>
                      {store.modes.map(mode => {
                        const base = store.base[vp][mode.id];
                        const computed = computeBaseValues(base);
                        return (
                          <td key={mode.id}>
                            <span className="cell-value computed">{Math.round(calcColNwHalf(n, base, computed))}</span>
                          </td>
                        );
                      })}
                    </tr>
                  )}
                  <tr>
                    <td>
                      <div className="cell-name cell-name-indent">
                        <span className="cell-icon computed">=</span>
                        <span>v-col-{n}-w-margin</span>
                      </div>
                    </td>
                    {store.modes.map(mode => {
                      const base = store.base[vp][mode.id];
                      const computed = computeBaseValues(base);
                      return (
                        <td key={mode.id}>
                          <span className="cell-value computed">{Math.round(calcColNwMargin(n, base, computed))}</span>
                        </td>
                      );
                    })}
                  </tr>
                  <tr>
                    <td>
                      <div className="cell-name cell-name-indent">
                        <span className="cell-icon computed">=</span>
                        <span>v-col-{n}-to-edge</span>
                      </div>
                    </td>
                    {store.modes.map(mode => {
                      const base = store.base[vp][mode.id];
                      const computed = computeBaseValues(base);
                      return (
                        <td key={mode.id}>
                          <span className="cell-value computed">{Math.round(calcColNtoEdge(n, base, computed))}</span>
                        </td>
                      );
                    })}
                  </tr>
                  <tr>
                    <td>
                      <div className="cell-name cell-name-indent">
                        <span className="cell-icon computed">=</span>
                        <span>v-col-{n}-1g</span>
                      </div>
                    </td>
                    {store.modes.map(mode => {
                      const base = store.base[vp][mode.id];
                      const computed = computeBaseValues(base);
                      return (
                        <td key={mode.id}>
                          <span className="cell-value computed">{Math.round(calcColN1g(n, base, computed))}</span>
                        </td>
                      );
                    })}
                  </tr>
                  <tr>
                    <td>
                      <div className="cell-name cell-name-indent">
                        <span className="cell-icon computed">=</span>
                        <span>v-col-{n}-2g</span>
                      </div>
                    </td>
                    {store.modes.map(mode => {
                      const base = store.base[vp][mode.id];
                      const computed = computeBaseValues(base);
                      return (
                        <td key={mode.id}>
                          <span className="cell-value computed">{Math.round(calcColN2g(n, base, computed))}</span>
                        </td>
                      );
                    })}
                  </tr>
                </React.Fragment>
              ))}

              {/* viewport tokens */}
              <tr>
                <td>
                  <div className="cell-name">
                    <span className="cell-icon computed">=</span>
                    <span>v-col-viewport</span>
                  </div>
                </td>
                {store.modes.map(mode => {
                  const base = store.base[vp][mode.id];
                  return (
                    <td key={mode.id}>
                      <span className="cell-value computed">{calcColViewport(base)}</span>
                    </td>
                  );
                })}
              </tr>
              <tr>
                <td>
                  <div className="cell-name cell-name-indent">
                    <span className="cell-icon computed">=</span>
                    <span>v-col-viewport-w-margin</span>
                  </div>
                </td>
                {store.modes.map(mode => {
                  const base = store.base[vp][mode.id];
                  const computed = computeBaseValues(base);
                  return (
                    <td key={mode.id}>
                      <span className="cell-value computed">{Math.round(calcColViewportWMargin(base, computed))}</span>
                    </td>
                  );
                })}
              </tr>
            </React.Fragment>
          ))}
        </tbody>
      </table>
    </div>
  );
}

// ============================================================================
// MARGIN TABLE
// ============================================================================

interface MarginTableProps {
  viewport?: ViewportName;
}

function MarginTable({ viewport }: MarginTableProps) {
  const store = useGridStore();
  const viewports = viewport ? [viewport] : VIEWPORTS;

  const marginTokens = [
    { name: 'v-xs', calc: calcMarginXs },
    { name: 'v-m', calc: calcMarginM },
    { name: 'v-l', calc: calcMarginL },
    { name: 'v-xl', calc: calcMarginXL },
    { name: 'v-xxl', calc: calcMarginXXL },
    { name: 'v-xxxl', calc: calcMarginXXXL },
  ];

  const ingridTokens = [
    { name: 'v-ingrid-l', calc: calcIngridL },
    { name: 'v-ingrid-xl', calc: calcIngridXL },
    { name: 'v-ingrid-xxl', calc: calcIngridXXL },
    { name: 'v-ingrid-xxxl', calc: calcIngridXXXL },
  ];

  return (
    <div className="table-container">
      <table className="data-table">
        <thead>
          <tr>
            <th>Name</th>
            {store.modes.map(mode => (
              <th key={mode.id}>{mode.name}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {viewports.map(vp => (
            <React.Fragment key={vp}>
              <tr className="group-header">
                <td colSpan={store.modes.length + 1}>{vp}</td>
              </tr>
              
              {/* Basic margins with DL/TM */}
              {marginTokens.map(({ name, calc }) => (
                <React.Fragment key={`${vp}-${name}`}>
                  <tr>
                    <td>
                      <div className="cell-name">
                        <span className="cell-icon computed">=</span>
                        <span>{name}</span>
                      </div>
                    </td>
                    {store.modes.map(mode => {
                      const base = store.base[vp][mode.id];
                      const computed = computeBaseValues(base);
                      return (
                        <td key={mode.id}>
                          <span className="cell-value computed">{Math.round(calc(base, computed))}</span>
                        </td>
                      );
                    })}
                  </tr>
                  <tr>
                    <td>
                      <div className="cell-name cell-name-indent">
                        <span className="cell-icon computed">=</span>
                        <span>{name}-DL</span>
                      </div>
                    </td>
                    {store.modes.map(mode => {
                      const base = store.base[vp][mode.id];
                      const computed = computeBaseValues(base);
                      const value = isDL(vp) ? calc(base, computed) : 0;
                      return (
                        <td key={mode.id}>
                          <span className="cell-value computed">{Math.round(value)}</span>
                        </td>
                      );
                    })}
                  </tr>
                  <tr>
                    <td>
                      <div className="cell-name cell-name-indent">
                        <span className="cell-icon computed">=</span>
                        <span>{name}-TM</span>
                      </div>
                    </td>
                    {store.modes.map(mode => {
                      const base = store.base[vp][mode.id];
                      const computed = computeBaseValues(base);
                      const value = isTM(vp) ? calc(base, computed) : 0;
                      return (
                        <td key={mode.id}>
                          <span className="cell-value computed">{Math.round(value)}</span>
                        </td>
                      );
                    })}
                  </tr>
                </React.Fragment>
              ))}

              {/* Ingrid margins with DL/TM */}
              {ingridTokens.map(({ name, calc }) => (
                <React.Fragment key={`${vp}-${name}`}>
                  <tr>
                    <td>
                      <div className="cell-name">
                        <span className="cell-icon computed">=</span>
                        <span>{name}</span>
                      </div>
                    </td>
                    {store.modes.map(mode => {
                      const base = store.base[vp][mode.id];
                      const computed = computeBaseValues(base);
                      return (
                        <td key={mode.id}>
                          <span className="cell-value computed">{Math.round(calc(base, computed))}</span>
                        </td>
                      );
                    })}
                  </tr>
                  <tr>
                    <td>
                      <div className="cell-name cell-name-indent">
                        <span className="cell-icon computed">=</span>
                        <span>{name}-DL</span>
                      </div>
                    </td>
                    {store.modes.map(mode => {
                      const base = store.base[vp][mode.id];
                      const computed = computeBaseValues(base);
                      const value = isDL(vp) ? calc(base, computed) : 0;
                      return (
                        <td key={mode.id}>
                          <span className="cell-value computed">{Math.round(value)}</span>
                        </td>
                      );
                    })}
                  </tr>
                  <tr>
                    <td>
                      <div className="cell-name cell-name-indent">
                        <span className="cell-icon computed">=</span>
                        <span>{name}-TM</span>
                      </div>
                    </td>
                    {store.modes.map(mode => {
                      const base = store.base[vp][mode.id];
                      const computed = computeBaseValues(base);
                      const value = isTM(vp) ? calc(base, computed) : 0;
                      return (
                        <td key={mode.id}>
                          <span className="cell-value computed">{Math.round(value)}</span>
                        </td>
                      );
                    })}
                  </tr>
                </React.Fragment>
              ))}
            </React.Fragment>
          ))}
        </tbody>
      </table>
    </div>
  );
}

// ============================================================================
// FOLDER CONFIG PANEL
// ============================================================================

interface FolderConfigProps {
  folderId: string;
  folderType: 'container' | 'photo';
}

function FolderConfig({ folderId, folderType }: FolderConfigProps) {
  const store = useGridStore();
  const folder = store.folders.find(f => f.id === folderId);

  if (!folder) {
    return (
      <div className="empty-state">
        <p>Folder not found</p>
      </div>
    );
  }

  const isPhoto = folderType === 'photo';

  const handleExceptionToggle = (vp: ViewportName, enabled: boolean) => {
    store.setException(folderId, vp, { ...folder.exceptions[vp], enabled });
  };

  const handleExceptionValue = (vp: ViewportName, value: ExceptionValue) => {
    store.setException(folderId, vp, { ...folder.exceptions[vp], value });
  };

  const handleVariantToggle = (variant: keyof typeof folder.variants) => {
    store.updateFolder(folderId, {
      variants: { ...folder.variants, [variant]: !folder.variants[variant] }
    });
  };

  const getRatioPreset = (ratio: { a: number; b: number }): string => {
    if (ratio.a === 16 && ratio.b === 9) return '16:9';
    if (ratio.a === 4 && ratio.b === 3) return '4:3';
    if (ratio.a === 3 && ratio.b === 4) return '3:4';
    if (ratio.a === 1 && ratio.b === 1) return '1:1';
    return 'custom';
  };

  const handleRatioPreset = (vp: ViewportName, preset: string) => {
    const presets: Record<string, { a: number; b: number }> = {
      '16:9': { a: 16, b: 9 },
      '4:3': { a: 4, b: 3 },
      '3:4': { a: 3, b: 4 },
      '1:1': { a: 1, b: 1 },
    };
    if (presets[preset]) {
      store.setRatio(folderId, vp, presets[preset]);
    }
  };

  return (
    <div className="folder-config">
      <h2>{folderType} / {folder.name}</h2>
      <p className="config-subtitle">
        {isPhoto ? 'Photo ratio configuration' : 'Container configuration'}
      </p>

      {/* Ratio per viewport (photo only) */}
      {isPhoto && folder.ratios && (
        <div className="config-section">
          <h3>Ratio per viewport</h3>
          <div className="config-grid four-cols">
            <div className="config-label"></div>
            <div className="config-header">Ratio</div>
            <div className="config-header">A</div>
            <div className="config-header">B</div>

            {VIEWPORTS.map(vp => {
              const ratio = folder.ratios![vp];
              const preset = getRatioPreset(ratio);
              const isCustom = preset === 'custom';
              return (
                <React.Fragment key={vp}>
                  <div className="config-label">{vp}</div>
                  <select
                    className="config-select"
                    value={preset}
                    onChange={(e) => handleRatioPreset(vp, e.target.value)}
                  >
                    <option value="16:9">16:9</option>
                    <option value="4:3">4:3</option>
                    <option value="3:4">3:4</option>
                    <option value="1:1">1:1</option>
                    <option value="custom">custom</option>
                  </select>
                  <input
                    type="number"
                    className="config-input"
                    value={ratio.a}
                    onChange={(e) => store.setRatio(folderId, vp, { ...ratio, a: Number(e.target.value) })}
                    disabled={!isCustom}
                  />
                  <input
                    type="number"
                    className="config-input"
                    value={ratio.b}
                    onChange={(e) => store.setRatio(folderId, vp, { ...ratio, b: Number(e.target.value) })}
                    disabled={!isCustom}
                  />
                </React.Fragment>
              );
            })}
          </div>
        </div>
      )}

      {/* Responsive exceptions */}
      <div className="config-section">
        <h3>Responsive exceptions</h3>
        <div className="config-grid four-cols">
          <div className="config-label"></div>
          <div className="config-header">Exception</div>
          <div className="config-header">Value</div>
          <div></div>

          {VIEWPORTS.map(vp => {
            const exc = folder.exceptions[vp];
            return (
              <React.Fragment key={vp}>
                <div className="config-label">{vp}</div>
                <div>
                  <input
                    type="checkbox"
                    checked={exc.enabled}
                    onChange={(e) => handleExceptionToggle(vp, e.target.checked)}
                  />
                </div>
                <select
                  className="config-select"
                  value={String(exc.value)}
                  onChange={(e) => {
                    const val = e.target.value;
                    handleExceptionValue(vp, val === 'viewport' || val === 'to-margins' ? val : Number(val));
                  }}
                  disabled={!exc.enabled}
                  style={{ opacity: exc.enabled ? 1 : 0.5 }}
                >
                  {[12,11,10,9,8,7,6,5,4,3,2,1].map(n => (
                    <option key={n} value={n}>{n} column{n !== 1 ? 's' : ''}</option>
                  ))}
                  <option disabled>───────────</option>
                  <option value="viewport">viewport</option>
                  <option value="to-margins">to margins</option>
                </select>
                <div></div>
              </React.Fragment>
            );
          })}
        </div>
      </div>

      {/* Variants to generate */}
      <div className="config-section">
        <h3>Variants to generate</h3>
        <div className="config-checkbox-row">
          <label className="config-checkbox">
            <input type="checkbox" checked={folder.variants.base} onChange={() => handleVariantToggle('base')} />
            <span>{isPhoto ? 'w-col-n / h-col-n' : 'v-col-n'} (base)</span>
          </label>
          {!isPhoto && (
            <label className="config-checkbox">
              <input type="checkbox" checked={folder.variants.wHalf} onChange={() => handleVariantToggle('wHalf')} />
              <span>-w-half</span>
            </label>
          )}
          <label className="config-checkbox">
            <input type="checkbox" checked={folder.variants.wMargin} onChange={() => handleVariantToggle('wMargin')} />
            <span>-w-margin</span>
          </label>
          <label className="config-checkbox">
            <input type="checkbox" checked={folder.variants.toEdge} onChange={() => handleVariantToggle('toEdge')} />
            <span>-to-edge</span>
          </label>
          {!isPhoto && (
            <>
              <label className="config-checkbox">
                <input type="checkbox" checked={folder.variants.oneG} onChange={() => handleVariantToggle('oneG')} />
                <span>-1g</span>
              </label>
              <label className="config-checkbox">
                <input type="checkbox" checked={folder.variants.twoG} onChange={() => handleVariantToggle('twoG')} />
                <span>-2g</span>
              </label>
            </>
          )}
        </div>
      </div>

      {/* Actions */}
      <div className="config-section">
        <div className="config-actions">
          <button className="btn btn-primary">Save & generate</button>
          <button 
            className="btn btn-danger"
            onClick={() => {
              if (confirm(`Delete folder "${folder.name}"?`)) {
                store.removeFolder(folderId);
              }
            }}
          >
            Delete folder
          </button>
        </div>
      </div>
    </div>
  );
}

// ============================================================================
// EMPTY FOLDER STATE
// ============================================================================

interface EmptyFolderStateProps {
  folderType: 'container' | 'photo';
  onAddFolder: () => void;
}

function EmptyFolderState({ folderType, onAddFolder }: EmptyFolderStateProps) {
  return (
    <div className="empty-state">
      <div className="empty-state-icon">📁</div>
      <p className="empty-state-text">No {folderType} folders yet</p>
      <button className="btn btn-primary" onClick={onAddFolder}>
        + Add {folderType} folder
      </button>
    </div>
  );
}

// ============================================================================
// MAIN GRID EDITOR
// ============================================================================

export function GridEditor() {
  const store = useGridStore();
  
  const [selection, setSelection] = useState<TreeSelection>({ type: 'BASE' });
  const [viewMode, setViewMode] = useState<ViewMode>('table');
  const [expandedFolders, setExpandedFolders] = useState<Set<string>>(
    new Set(['BASE', 'column', 'margin', 'container', 'photo'])
  );
  const [showAddFolderModal, setShowAddFolderModal] = useState(false);
  const [newFolderName, setNewFolderName] = useState('');
  const [newFolderParent, setNewFolderParent] = useState<'container' | 'photo'>('container');
  const [validationError, setValidationError] = useState<string | null>(null);

  const { importError, clearError, handleImport, handleExport } = useFileHandling({
    onImport: store.loadFromJSON,
    exportData: store.exportToJSON,
    exportFilename: '1-R4-Grid.json',
  });

  const toggleExpand = (folder: string) => {
    setExpandedFolders(prev => {
      const next = new Set(prev);
      if (next.has(folder)) next.delete(folder);
      else next.add(folder);
      return next;
    });
  };

  const handleAddFolder = () => {
    const name = newFolderName.trim();
    if (!name) {
      setValidationError('Please enter a folder name');
      return;
    }
    const exists = store.folders.some(f => f.name === name && f.parent === newFolderParent);
    if (exists) {
      setValidationError(`Folder "${name}" already exists in ${newFolderParent}`);
      return;
    }
    store.addFolder(name, newFolderParent);
    setNewFolderName('');
    setShowAddFolderModal(false);
    setValidationError(null);
    // Select the new folder
    const newFolder = store.folders.find(f => f.name === name && f.parent === newFolderParent);
    if (newFolder) {
      setSelection({ type: newFolderParent, folderId: newFolder.id });
    }
  };

  const openAddFolderModal = (parent?: 'container' | 'photo') => {
    if (parent) setNewFolderParent(parent);
    setShowAddFolderModal(true);
  };

  // Determine if view toggle should be shown
  const showViewToggle = selection.type === 'container' || selection.type === 'photo';
  
  // For container/photo without folderId, show empty state or folder list
  const isFolderRoot = (selection.type === 'container' || selection.type === 'photo') && !(selection as any).folderId;

  // Render content based on selection
  const renderContent = () => {
    if (selection.type === 'BASE') {
      return <BaseTable viewport={(selection as any).viewport} />;
    }
    if (selection.type === 'column') {
      return <ColumnTable viewport={(selection as any).viewport} />;
    }
    if (selection.type === 'margin') {
      return <MarginTable viewport={(selection as any).viewport} />;
    }
    if (selection.type === 'container') {
      const folderId = (selection as any).folderId;
      if (!folderId) {
        const folders = store.folders.filter(f => f.parent === 'container');
        if (folders.length === 0) {
          return <EmptyFolderState folderType="container" onAddFolder={() => openAddFolderModal('container')} />;
        }
        return (
          <div className="folder-list">
            <h2>Container folders</h2>
            <p>Select a folder from the sidebar or create a new one.</p>
          </div>
        );
      }
      if (viewMode === 'config') {
        return <FolderConfig folderId={folderId} folderType="container" />;
      }
      // TODO: Table view for container folder
      return <div className="empty-state">Table view for container folder (TODO)</div>;
    }
    if (selection.type === 'photo') {
      const folderId = (selection as any).folderId;
      if (!folderId) {
        const folders = store.folders.filter(f => f.parent === 'photo');
        if (folders.length === 0) {
          return <EmptyFolderState folderType="photo" onAddFolder={() => openAddFolderModal('photo')} />;
        }
        return (
          <div className="folder-list">
            <h2>Photo folders</h2>
            <p>Select a folder from the sidebar or create a new one.</p>
          </div>
        );
      }
      if (viewMode === 'config') {
        return <FolderConfig folderId={folderId} folderType="photo" />;
      }
      // TODO: Table view for photo folder
      return <div className="empty-state">Table view for photo folder (TODO)</div>;
    }
    return null;
  };

  return (
    <div className="grid-editor">
      <GridSidebar
        selection={selection}
        onSelect={(sel) => {
          setSelection(sel);
          // Reset to config view when selecting a folder
          if ((sel.type === 'container' || sel.type === 'photo') && (sel as any).folderId) {
            setViewMode('config');
          }
        }}
        folders={store.folders.map(f => ({ id: f.id, name: f.name, parent: f.parent }))}
        expandedFolders={expandedFolders}
        onToggleExpand={toggleExpand}
      />

      <div className="grid-main">
        <GridToolbar
          viewMode={viewMode}
          onViewModeChange={setViewMode}
          showViewToggle={showViewToggle && !isFolderRoot}
          onAddFolder={() => openAddFolderModal()}
          onImport={handleImport}
          onExport={handleExport}
        />

        {importError && <Toast message={importError} type="error" onClose={clearError} />}

        <div className="grid-content">
          {renderContent()}
        </div>
      </div>

      {/* Add Folder Modal */}
      <Modal
        title="Create folder"
        isOpen={showAddFolderModal}
        onClose={() => {
          setShowAddFolderModal(false);
          setNewFolderName('');
          setValidationError(null);
        }}
        actions={
          <>
            <button className="btn btn-secondary" onClick={() => setShowAddFolderModal(false)}>
              Cancel
            </button>
            <button className="btn btn-primary" onClick={handleAddFolder}>
              Create
            </button>
          </>
        }
      >
        <div className="modal-field">
          <label>Parent folder</label>
          <select
            value={newFolderParent}
            onChange={(e) => setNewFolderParent(e.target.value as 'container' | 'photo')}
          >
            <option value="container">container</option>
            <option value="photo">photo</option>
          </select>
        </div>
        <div className="modal-field">
          <label>Folder name</label>
          <input
            type="text"
            value={newFolderName}
            onChange={(e) => {
              setNewFolderName(e.target.value);
              setValidationError(null);
            }}
            placeholder="e.g. to-tab-6-col, static, horizontal"
            onKeyDown={(e) => e.key === 'Enter' && handleAddFolder()}
          />
        </div>
        {validationError && <p className="input-error">{validationError}</p>}
      </Modal>
    </div>
  );
}
