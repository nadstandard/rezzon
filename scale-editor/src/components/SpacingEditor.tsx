import { useState } from 'react';
import { useSpacingStore, useActiveCollection, calculateSpacing } from '../stores/spacingStore';
import { Toolbar } from './Toolbar';

interface SpacingEditorProps {
  activeGroup: string;
}

export function SpacingEditor({ activeGroup }: SpacingEditorProps) {
  const store = useSpacingStore();
  const collection = useActiveCollection();
  const [showAddModal, setShowAddModal] = useState(false);
  const [newRefValue, setNewRefValue] = useState('');

  if (!collection) return <div>No collection loaded</div>;

  const types = Object.keys(collection.scales);
  const allViewports = types.length > 0 ? Object.keys(collection.scales[types[0]] || {}) : [];

  const handleAddRefValue = () => {
    const num = parseInt(newRefValue, 10);
    if (!isNaN(num) && !collection.refScale.includes(num)) {
      store.addRefValue(num);
      setNewRefValue('');
      setShowAddModal(false);
    }
  };

  const handleExport = () => {
    const output = store.exportToJSON();
    const blob = new Blob([JSON.stringify(output, null, 2)], {
      type: 'application/json',
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = '2-R4-Spacing-Scale.json';
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleImport = (file: File) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const data = JSON.parse(e.target?.result as string);
        store.loadFromJSON(data);
      } catch (err) {
        console.error('Failed to parse JSON:', err);
      }
    };
    reader.readAsText(file);
  };

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
    <div style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
      <Toolbar
        title={`Spacing (${collection.name})`}
        formula="round( ref × scale[type][viewport] )"
        onImport={handleImport}
        onExport={handleExport}
      />

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
              <tbody key={`group-${type}`}>
                <tr className="group-header">
                  <td colSpan={collection.modes.length + 1}>{type}</td>
                </tr>
                {getVisibleViewports(type).map((viewport) => (
                  <tbody key={`group-${type}-${viewport}`}>
                    <tr className="group-header" style={{ background: 'var(--bg-hover)' }}>
                      <td colSpan={collection.modes.length + 1} style={{ paddingLeft: '24px' }}>{viewport}</td>
                    </tr>
                    {collection.refScale.map((ref) => (
                      <tr key={`${type}-${viewport}-${ref}`}>
                        <td>
                          <div className="cell-name" style={{ paddingLeft: '16px' }}>
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
                  </tbody>
                ))}
              </tbody>
            ))}
          </tbody>
        </table>
      </div>

      {/* Footer */}
      <div className="table-footer">
        <button onClick={() => setShowAddModal(true)} className="add-row">
          <span>+</span> Add ref value
        </button>
      </div>

      {/* Add Ref Value Modal */}
      {showAddModal && (
        <div className="modal-overlay">
          <div className="modal">
            <h3>Add Ref Value</h3>
            <input
              type="number"
              value={newRefValue}
              onChange={(e) => setNewRefValue(e.target.value)}
              placeholder="Enter value (e.g. 72 or -8)"
              autoFocus
              onKeyDown={(e) => e.key === 'Enter' && handleAddRefValue()}
            />
            <div className="modal-actions">
              <button onClick={() => setShowAddModal(false)} className="btn btn-secondary">
                Cancel
              </button>
              <button onClick={handleAddRefValue} className="btn btn-primary">
                Add
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
