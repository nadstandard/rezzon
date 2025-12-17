import { useState } from 'react';
import { useRadiusStore, calculateRadius } from '../stores/radiusStore';
import { Toolbar } from './Toolbar';

const VIEWPORTS = ['Desktop', 'Laptop', 'Tablet', 'Mobile'];

interface RadiusEditorProps {
  activeGroup: string;
}

export function RadiusEditor({ activeGroup }: RadiusEditorProps) {
  const store = useRadiusStore();
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
    a.download = '5-R4-Radii.json';
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

  // Filter viewports based on activeGroup
  const visibleViewports = activeGroup === 'All' 
    ? VIEWPORTS 
    : VIEWPORTS.filter(v => v === activeGroup);

  return (
    <div style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
      <Toolbar
        title="Radius"
        formula="(ref / 2) × base-value × multiplier[viewport]"
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
              <>
                <tr key={`header-${viewport}`} className="group-header">
                  <td colSpan={store.modes.length + 1}>{viewport}</td>
                </tr>
                {store.refScale.map((ref) => (
                  <tr key={`${viewport}-${ref}`}>
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
                <tr key={`${viewport}-pill`}>
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
              </>
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
              placeholder="Enter value (e.g. 72)"
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
