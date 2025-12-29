import React, { useState } from 'react';
import { useRadiusStore, calculateRadius } from '../stores/radiusStore';
import { useFileHandling } from '../hooks/useFileHandling';
import { Toolbar } from './Toolbar';
import { Modal } from './Modal';
import { Toast } from './Toast';

const VIEWPORTS = ['Desktop', 'Laptop', 'Tablet', 'Mobile'];

interface RadiusEditorProps {
  activeGroup: string;
}

export function RadiusEditor({ activeGroup }: RadiusEditorProps) {
  const store = useRadiusStore();
  const [showAddModal, setShowAddModal] = useState(false);
  const [newRefValue, setNewRefValue] = useState('');
  const [validationError, setValidationError] = useState<string | null>(null);
  const [contextMenu, setContextMenu] = useState<{ x: number; y: number; refValue: number } | null>(null);

  const { importError, clearError, handleImport, handleExport } = useFileHandling({
    onImport: store.loadFromJSON,
    exportData: store.exportToJSON,
    exportFilename: '5-R4-Radii.json',
  });

  const handleAddRefValue = () => {
    const num = parseInt(newRefValue, 10);
    
    if (isNaN(num)) {
      setValidationError('Please enter a valid number');
      return;
    }
    
    if (store.refScale.includes(num)) {
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

  // Filter viewports based on activeGroup
  const visibleViewports = activeGroup === 'All' 
    ? VIEWPORTS 
    : VIEWPORTS.filter(v => v === activeGroup);

  return (
    <div className="editor-container">
      <Toolbar
        title="Radius"
        formula="(ref / 2) × base-value × multiplier[viewport]"
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
              {store.modes.map((mode) => (
                <th key={mode.id}>{mode.name}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {/* Parameters section - only show when All is selected */}
            {activeGroup === 'All' && (
              <>
                <tr className="group-header">
                  <td colSpan={store.modes.length + 1}>Parameters</td>
                </tr>
                {/* Base value */}
                <tr>
                  <td>
                    <div className="cell-name">
                      <span className="cell-icon">#</span>
                      <span>base-value</span>
                    </div>
                  </td>
                  {store.modes.map((mode) => (
                    <td key={mode.id}>
                      <div className="cell-wrapper">
                        <input
                          type="text"
                          className="cell-input"
                          value={store.baseValue[mode.id] ?? 2}
                          onChange={(e) => {
                            const v = parseFloat(e.target.value);
                            if (!isNaN(v)) store.setBaseValue(mode.id, v);
                          }}
                          aria-label={`Base value for ${mode.name}`}
                        />
                      </div>
                    </td>
                  ))}
                </tr>
                {/* Multipliers per viewport */}
                {VIEWPORTS.map((viewport) => (
                  <tr key={`mult-${viewport}`}>
                    <td>
                      <div className="cell-name">
                        <span className="cell-icon">ƒ</span>
                        <span>multiplier-{viewport.toLowerCase()}</span>
                      </div>
                    </td>
                    {store.modes.map((mode) => (
                      <td key={mode.id}>
                        <div className="cell-wrapper">
                          <input
                            type="text"
                            className="cell-input"
                            value={store.multipliers[viewport]?.[mode.id] ?? 1}
                            onChange={(e) => {
                              const v = parseFloat(e.target.value);
                              if (!isNaN(v)) store.setMultiplier(viewport, mode.id, v);
                            }}
                            aria-label={`Multiplier ${viewport} for ${mode.name}`}
                          />
                        </div>
                      </td>
                    ))}
                  </tr>
                ))}
                {/* Pill values per viewport */}
                {VIEWPORTS.map((viewport) => (
                  <tr key={`pill-${viewport}`}>
                    <td>
                      <div className="cell-name">
                        <span className="cell-icon">#</span>
                        <span>pill-{viewport.toLowerCase()}</span>
                      </div>
                    </td>
                    {store.modes.map((mode) => (
                      <td key={mode.id}>
                        <div className="cell-wrapper">
                          <input
                            type="text"
                            className="cell-input"
                            value={store.pillValues[viewport]?.[mode.id] ?? 999}
                            onChange={(e) => {
                              const v = parseFloat(e.target.value);
                              if (!isNaN(v)) store.setPillValue(viewport, mode.id, v);
                            }}
                            aria-label={`Pill value ${viewport} for ${mode.name}`}
                          />
                        </div>
                      </td>
                    ))}
                  </tr>
                ))}
              </>
            )}

            {/* Viewport sections */}
            {visibleViewports.map((viewport) => (
              <React.Fragment key={`viewport-${viewport}`}>
                <tr className="group-header">
                  <td colSpan={store.modes.length + 1}>{viewport}</td>
                </tr>
                {store.refScale.map((ref) => (
                  <tr 
                    key={`${viewport}-${ref}`}
                    onContextMenu={(e) => handleRowContextMenu(e, ref)}
                    className="data-row"
                  >
                    <td>
                      <div className="cell-name">
                        <span className="cell-icon">=</span>
                        <span>v-{ref}</span>
                      </div>
                    </td>
                    {store.modes.map((mode) => {
                      const base = store.baseValue[mode.id] ?? 2;
                      const mult = store.multipliers[viewport]?.[mode.id] ?? 1;
                      const computed = calculateRadius(ref, base, mult);
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
                {/* v-pill - read only, takes value from pillValues */}
                <tr>
                  <td>
                    <div className="cell-name">
                      <span className="cell-icon">=</span>
                      <span>v-pill</span>
                    </div>
                  </td>
                  {store.modes.map((mode) => (
                    <td key={mode.id}>
                      <div className="cell-wrapper">
                        <span className="cell-value computed">
                          {store.pillValues[viewport]?.[mode.id] ?? 999}
                        </span>
                      </div>
                    </td>
                  ))}
                </tr>
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
            Delete v-{contextMenu.refValue}
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
          placeholder="Enter value (e.g. 72)"
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
