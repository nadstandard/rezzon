import { useState } from 'react';
import { useSpacingStore, calculateSpacing } from '../stores/spacingStore';
import { Toolbar } from './Toolbar';

const VIEWPORTS = ['Desktop', 'Laptop', 'Tablet', 'Mobile'] as const;
const SCALE_TYPES = ['Padding', 'Spacing'] as const;

interface SpacingEditorProps {
  activeGroup: string;
}

export function SpacingEditor({ activeGroup }: SpacingEditorProps) {
  const store = useSpacingStore();
  const [showAddModal, setShowAddModal] = useState(false);
  const [newRefValue, setNewRefValue] = useState('');

  const handleAddRefValue = () => {
    const num = parseInt(newRefValue, 10);
    if (!isNaN(num) && !store.refScale.includes(num)) {
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
    a.download = `2-R4-Spacing-Scale-${store.collectionName}.json`;
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

  const showParameters = activeGroup === 'All';
  const showPadding = activeGroup === 'All' || activeGroup === 'Padding';
  const showSpacing = activeGroup === 'All' || activeGroup === 'Spacing';

  return (
    <div style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
      <Toolbar
        title={`Spacing (${store.collectionName})`}
        formula="round( ref × scale[type][viewport] )"
        onImport={handleImport}
        onExport={handleExport}
      />

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
            {showParameters && (
              <>
                <tr className="group-header">
                  <td colSpan={store.modes.length + 1}>Collection</td>
                </tr>
                <tr>
                  <td>
                    <div className="cell-name">
                      <span className="cell-icon">#</span>
                      <span>direction</span>
                    </div>
                  </td>
                  <td colSpan={store.modes.length}>
                    <select
                      value={store.collectionName}
                      onChange={(e) => store.setCollectionName(e.target.value as 'Vertical' | 'Horizontal')}
                      style={{
                        background: 'var(--bg-tertiary)',
                        border: '1px solid var(--border)',
                        color: '#fff',
                        padding: '4px 8px',
                        borderRadius: '3px',
                      }}
                    >
                      <option value="Vertical">Vertical</option>
                      <option value="Horizontal">Horizontal</option>
                    </select>
                  </td>
                </tr>
                <tr className="group-header">
                  <td colSpan={store.modes.length + 1}>Scale Parameters</td>
                </tr>
                {SCALE_TYPES.map((type) =>
                  VIEWPORTS.map((viewport) => (
                    <tr key={`scale-${type}-${viewport}`}>
                      <td>
                        <div className="cell-name">
                          <span className="cell-icon">ƒ</span>
                          <span>scale-{type.toLowerCase()}-{viewport.toLowerCase()}</span>
                        </div>
                      </td>
                      {store.modes.map((mode) => (
                        <td key={mode.id}>
                          <div className="cell-wrapper">
                            <input
                              type="text"
                              className="cell-input"
                              value={store.scales[type][viewport][mode.id] ?? 1}
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

            {showPadding && (
              <>
                <tr className="group-header">
                  <td colSpan={store.modes.length + 1}>Padding</td>
                </tr>
                {VIEWPORTS.map((viewport) => (
                  <>
                    <tr key={`padding-header-${viewport}`} className="group-header" style={{ background: 'var(--bg-hover)' }}>
                      <td colSpan={store.modes.length + 1} style={{ paddingLeft: '24px' }}>{viewport}</td>
                    </tr>
                    {store.refScale.map((ref) => (
                      <tr key={`padding-${viewport}-${ref}`}>
                        <td>
                          <div className="cell-name" style={{ paddingLeft: '16px' }}>
                            <span className="cell-icon">=</span>
                            <span>ref-{ref}</span>
                          </div>
                        </td>
                        {store.modes.map((mode) => {
                          const scale = store.scales.Padding[viewport][mode.id] ?? 1;
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
                  </>
                ))}
              </>
            )}

            {showSpacing && (
              <>
                <tr className="group-header">
                  <td colSpan={store.modes.length + 1}>Spacing</td>
                </tr>
                {VIEWPORTS.map((viewport) => (
                  <>
                    <tr key={`spacing-header-${viewport}`} className="group-header" style={{ background: 'var(--bg-hover)' }}>
                      <td colSpan={store.modes.length + 1} style={{ paddingLeft: '24px' }}>{viewport}</td>
                    </tr>
                    {store.refScale.map((ref) => (
                      <tr key={`spacing-${viewport}-${ref}`}>
                        <td>
                          <div className="cell-name" style={{ paddingLeft: '16px' }}>
                            <span className="cell-icon">=</span>
                            <span>ref-{ref}</span>
                          </div>
                        </td>
                        {store.modes.map((mode) => {
                          const scale = store.scales.Spacing[viewport][mode.id] ?? 1;
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
                  </>
                ))}
              </>
            )}
          </tbody>
        </table>
      </div>

      <div className="table-footer">
        <button onClick={() => setShowAddModal(true)} className="add-row">
          <span>+</span> Add ref value
        </button>
      </div>

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
