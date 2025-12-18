import React, { useState } from 'react';
import { useSpacingStore, useActiveCollection, calculateSpacing } from '../stores/spacingStore';
import { useFileHandling } from '../hooks/useFileHandling';
import { Toolbar } from './Toolbar';
import { Modal } from './Modal';
import { Toast } from './Toast';

interface SpacingEditorProps {
  activeGroup: string;
}

export function SpacingEditor({ activeGroup }: SpacingEditorProps) {
  const store = useSpacingStore();
  const collection = useActiveCollection();
  const [showAddModal, setShowAddModal] = useState(false);
  const [newRefValue, setNewRefValue] = useState('');
  const [validationError, setValidationError] = useState<string | null>(null);
  const [contextMenu, setContextMenu] = useState<{ x: number; y: number; refValue: number } | null>(null);

  const { importError, clearError, handleImport, handleExport } = useFileHandling({
    onImport: store.loadFromJSON,
    exportData: store.exportToJSON,
    exportFilename: '2-R4-Spacing-Scale.json',
  });

  if (!collection) {
    return (
      <div className="empty-state">
        No collection loaded. Import a JSON file to get started.
      </div>
    );
  }

  const types = Object.keys(collection.scales);
  const allViewports = types.length > 0 ? Object.keys(collection.scales[types[0]] || {}) : [];

  const handleAddRefValue = () => {
    const num = parseInt(newRefValue, 10);
    
    if (isNaN(num)) {
      setValidationError('Please enter a valid number');
      return;
    }
    
    if (collection.refScale.includes(num)) {
      setValidationError(`Value ${num} already exists`);
      return;
    }
    
    store.addRefValue(num);
    setNewRefValue('');
    setShowAddModal(false);
    setValidationError(null);
  };

  const handleCloseAddModal = () => {
    setShowAddModal(false);
    setNewRefValue('');
    setValidationError(null);
  };

  const handleRowContextMenu = (e: React.MouseEvent, refValue: number) => {
    e.preventDefault();
    setContextMenu({ x: e.clientX, y: e.clientY, refValue });
  };

  const handleDeleteRef = () => {
    if (contextMenu) {
      store.removeRefValue(contextMenu.refValue);
      setContextMenu(null);
    }
  };

  // Close context menu on click outside
  React.useEffect(() => {
    const handleClick = () => setContextMenu(null);
    if (contextMenu) {
      document.addEventListener('click', handleClick);
      return () => document.removeEventListener('click', handleClick);
    }
  }, [contextMenu]);

  // Filter based on activeGroup (which is now a path like "Padding/Desktop")
  const getVisibleTypes = (): string[] => {
    if (activeGroup === 'All') return types;
    const groupParts = activeGroup.split('/');
    const type = groupParts[0];
    if (types.includes(type)) return [type];
    return types;
  };

  const getVisibleViewports = (type: string): string[] => {
    const typeViewports = Object.keys(collection.scales[type] || {});
    if (activeGroup === 'All' || activeGroup === type) return typeViewports;
    const groupParts = activeGroup.split('/');
    if (groupParts[0] === type && groupParts[1] && typeViewports.includes(groupParts[1])) {
      return [groupParts[1]];
    }
    return typeViewports;
  };

  const showParameters = activeGroup === 'All';
  const visibleTypes = getVisibleTypes();

  return (
    <div className="editor-container">
      <Toolbar
        title={`Spacing (${collection.name})`}
        formula="round( ref × scale[type][viewport] )"
        onImport={handleImport}
        onExport={handleExport}
      />

      {importError && (
        <Toast message={importError} type="error" onClose={clearError} />
      )}

      <div className="table-container">
        <table className="data-table">
          <thead>
            <tr>
              <th>Name</th>
              {collection.modes.map((mode) => (
                <th key={mode.id}>{mode.name}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {/* Scale Parameters */}
            {showParameters && (
              <>
                <tr className="group-header">
                  <td colSpan={collection.modes.length + 1}>Scale Parameters</td>
                </tr>
                {types.map((type) =>
                  allViewports.map((viewport) => (
                    <tr key={`scale-${type}-${viewport}`}>
                      <td>
                        <div className="cell-name">
                          <span className="cell-icon">ƒ</span>
                          <span>scale-{type.toLowerCase()}-{viewport.toLowerCase()}</span>
                        </div>
                      </td>
                      {collection.modes.map((mode) => (
                        <td key={mode.id}>
                          <div className="cell-wrapper">
                            <input
                              type="text"
                              className="cell-input"
                              value={collection.scales[type]?.[viewport]?.[mode.id] ?? 1}
                              onChange={(e) => {
                                const v = parseFloat(e.target.value);
                                if (!isNaN(v)) store.setScale(type, viewport, mode.id, v);
                              }}
                              aria-label={`Scale ${type} ${viewport} for ${mode.name}`}
                            />
                          </div>
                        </td>
                      ))}
                    </tr>
                  ))
                )}
              </>
            )}

            {/* Computed values by type/viewport */}
            {visibleTypes.map((type) => (
              <React.Fragment key={`group-${type}`}>
                <tr className="group-header">
                  <td colSpan={collection.modes.length + 1}>{type}</td>
                </tr>
                {getVisibleViewports(type).map((viewport) => (
                  <React.Fragment key={`group-${type}-${viewport}`}>
                    <tr className="group-header subgroup-header">
                      <td colSpan={collection.modes.length + 1}>{viewport}</td>
                    </tr>
                    {collection.refScale.map((ref) => (
                      <tr 
                        key={`${type}-${viewport}-${ref}`}
                        onContextMenu={(e) => handleRowContextMenu(e, ref)}
                        className="data-row"
                      >
                        <td>
                          <div className="cell-name cell-name-indented">
                            <span className="cell-icon">=</span>
                            <span>ref-{ref}</span>
                          </div>
                        </td>
                        {collection.modes.map((mode) => {
                          const scale = collection.scales[type]?.[viewport]?.[mode.id] ?? 1;
                          const computed = calculateSpacing(ref, scale);
                          return (
                            <td key={mode.id}>
                              <div className="cell-wrapper">
                                <span className="cell-value computed">{computed}</span>
                              </div>
                            </td>
                          );
                        })}
                      </tr>
                    ))}
                  </React.Fragment>
                ))}
              </React.Fragment>
            ))}
          </tbody>
        </table>
      </div>

      {/* Footer */}
      <div className="table-footer">
        <button 
          onClick={() => setShowAddModal(true)} 
          className="add-row"
          aria-label="Add new reference value"
        >
          <span>+</span> Add ref value
        </button>
      </div>

      {/* Context Menu */}
      {contextMenu && (
        <div 
          className="context-menu"
          style={{ top: contextMenu.y, left: contextMenu.x }}
        >
          <button onClick={handleDeleteRef} className="context-menu-item danger">
            Delete ref-{contextMenu.refValue}
          </button>
        </div>
      )}

      {/* Add Ref Value Modal */}
      <Modal
        title="Add Ref Value"
        isOpen={showAddModal}
        onClose={handleCloseAddModal}
        actions={
          <>
            <button onClick={handleCloseAddModal} className="btn btn-secondary">
              Cancel
            </button>
            <button onClick={handleAddRefValue} className="btn btn-primary">
              Add
            </button>
          </>
        }
      >
        <input
          type="number"
          value={newRefValue}
          onChange={(e) => {
            setNewRefValue(e.target.value);
            setValidationError(null);
          }}
          placeholder="Enter value (e.g. 72 or -8)"
          autoFocus
          onKeyDown={(e) => e.key === 'Enter' && handleAddRefValue()}
          aria-describedby={validationError ? 'add-ref-error' : undefined}
        />
        {validationError && (
          <p id="add-ref-error" className="input-error">{validationError}</p>
        )}
      </Modal>
    </div>
  );
}
