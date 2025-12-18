import React, { useState } from 'react';
import {
  useTypographyStore,
  useActiveTypographyCollection,
  calculateSize,
  calculateLineHeight,
} from '../stores/typographyStore';
import { useFileHandling } from '../hooks/useFileHandling';
import { Toolbar } from './Toolbar';
import { Modal } from './Modal';
import { Toast } from './Toast';

interface TypographyEditorProps {
  activeGroup: string;
}

export function TypographyEditor({ activeGroup }: TypographyEditorProps) {
  const store = useTypographyStore();
  const collection = useActiveTypographyCollection();
  const [showAddModal, setShowAddModal] = useState(false);
  const [newRefValue, setNewRefValue] = useState('');
  const [validationError, setValidationError] = useState<string | null>(null);
  const [contextMenu, setContextMenu] = useState<{ x: number; y: number; refValue: number } | null>(null);

  const { importError, clearError, handleImport, handleExport } = useFileHandling({
    onImport: store.loadFromJSON,
    exportData: store.exportToJSON,
    exportFilename: '3-R4-Typography-Scale.json',
  });

  if (!collection) {
    return (
      <div className="empty-state">
        No collection loaded. Import a JSON file to get started.
      </div>
    );
  }

  const isLineHeight = collection.name === 'Line Height';
  const formula = isLineHeight
    ? 'LH = Size × (A + B / Size)'
    : 'Size = ref × scale[viewport]';

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

  // Filter viewports based on activeGroup
  const getVisibleViewports = (): string[] => {
    if (activeGroup === 'All') return collection.groups;
    if (collection.groups.includes(activeGroup)) return [activeGroup];
    return collection.groups;
  };

  const showParameters = activeGroup === 'All';
  const visibleViewports = getVisibleViewports();

  return (
    <div className="editor-container">
      <Toolbar
        title={`Typography (${collection.name})`}
        formula={formula}
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
                {isLineHeight ? (
                  // Line Height: A and B parameters per category
                  <>
                    {(collection.categories || []).map((category) => (
                      <React.Fragment key={`params-${category}`}>
                        <tr>
                          <td>
                            <div className="cell-name">
                              <span className="cell-icon">ƒ</span>
                              <span>A-{category.toUpperCase()}</span>
                            </div>
                          </td>
                          {collection.modes.map((mode) => (
                            <td key={mode.id}>
                              <div className="cell-wrapper">
                                <input
                                  type="text"
                                  className="cell-input"
                                  value={collection.scalesA?.[category]?.[mode.id] ?? 1.25}
                                  onChange={(e) => {
                                    const v = parseFloat(e.target.value);
                                    if (!isNaN(v)) store.setScaleA(category, mode.id, v);
                                  }}
                                  aria-label={`A parameter for ${category} in ${mode.name}`}
                                />
                              </div>
                            </td>
                          ))}
                        </tr>
                        <tr>
                          <td>
                            <div className="cell-name">
                              <span className="cell-icon">ƒ</span>
                              <span>B-{category.toUpperCase()}</span>
                            </div>
                          </td>
                          {collection.modes.map((mode) => (
                            <td key={mode.id}>
                              <div className="cell-wrapper">
                                <input
                                  type="text"
                                  className="cell-input"
                                  value={collection.scalesB?.[category]?.[mode.id] ?? 2}
                                  onChange={(e) => {
                                    const v = parseFloat(e.target.value);
                                    if (!isNaN(v)) store.setScaleB(category, mode.id, v);
                                  }}
                                  aria-label={`B parameter for ${category} in ${mode.name}`}
                                />
                              </div>
                            </td>
                          ))}
                        </tr>
                      </React.Fragment>
                    ))}
                  </>
                ) : (
                  // Size: scale per viewport
                  collection.groups.map((viewport) => (
                    <tr key={`scale-${viewport}`}>
                      <td>
                        <div className="cell-name">
                          <span className="cell-icon">ƒ</span>
                          <span>scale-{viewport.toLowerCase()}</span>
                        </div>
                      </td>
                      {collection.modes.map((mode) => (
                        <td key={mode.id}>
                          <div className="cell-wrapper">
                            <input
                              type="text"
                              className="cell-input"
                              value={collection.scales[viewport]?.[mode.id] ?? 1}
                              onChange={(e) => {
                                const v = parseFloat(e.target.value);
                                if (!isNaN(v)) store.setScale(viewport, mode.id, v);
                              }}
                              aria-label={`Scale for ${viewport} in ${mode.name}`}
                            />
                          </div>
                        </td>
                      ))}
                    </tr>
                  ))
                )}
              </>
            )}

            {/* Computed values by viewport */}
            {visibleViewports.map((viewport) => (
              <React.Fragment key={`group-${viewport}`}>
                <tr className="group-header">
                  <td colSpan={collection.modes.length + 1}>{viewport}</td>
                </tr>
                {isLineHeight ? (
                  // Line Height: ref-N-category
                  collection.refScale.map((ref) => (
                    <React.Fragment key={`${viewport}-${ref}`}>
                      {(collection.categories || []).map((category, catIdx) => (
                        <tr
                          key={`${viewport}-${ref}-${category}`}
                          onContextMenu={(e) => handleRowContextMenu(e, ref)}
                          className="data-row"
                        >
                          <td>
                            <div className={`cell-name ${catIdx > 0 ? 'cell-name-indented' : ''}`}>
                              <span className="cell-icon">=</span>
                              <span>ref-{ref}-{category}</span>
                            </div>
                          </td>
                          {collection.modes.map((mode) => {
                            const a = collection.scalesA?.[category]?.[mode.id] ?? 1.25;
                            const b = collection.scalesB?.[category]?.[mode.id] ?? 2;
                            // For LH, we use ref as base (assuming Size scale = 1 for this viewport)
                            const computed = calculateLineHeight(ref, a, b);
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
                  ))
                ) : (
                  // Size: ref-N
                  collection.refScale.map((ref) => (
                    <tr
                      key={`${viewport}-${ref}`}
                      onContextMenu={(e) => handleRowContextMenu(e, ref)}
                      className="data-row"
                    >
                      <td>
                        <div className="cell-name">
                          <span className="cell-icon">=</span>
                          <span>ref-{ref}</span>
                        </div>
                      </td>
                      {collection.modes.map((mode) => {
                        const scale = collection.scales[viewport]?.[mode.id] ?? 1;
                        const computed = calculateSize(ref, scale);
                        return (
                          <td key={mode.id}>
                            <div className="cell-wrapper">
                              <span className="cell-value computed">{computed}</span>
                            </div>
                          </td>
                        );
                      })}
                    </tr>
                  ))
                )}
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
          placeholder="Enter value (e.g. 72)"
          autoFocus
          onKeyDown={(e) => e.key === 'Enter' && handleAddRefValue()}
          aria-describedby={validationError ? 'add-ref-error' : undefined}
        />
        {validationError && (
          <p id="add-ref-error" className="input-error">
            {validationError}
          </p>
        )}
      </Modal>
    </div>
  );
}
