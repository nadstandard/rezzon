import { X, Hash } from 'lucide-react';
import { useAppStore } from '../../stores/appStore';

export function DetailsPanel() {
  const detailsPanelOpen = useAppStore((state) => state.ui.detailsPanelOpen);
  const selectedVariables = useAppStore((state) => state.ui.selectedVariables);
  const selectedLibraryId = useAppStore((state) => state.ui.selectedLibraryId);
  const libraries = useAppStore((state) => state.libraries);
  const toggleDetailsPanel = useAppStore((state) => state.toggleDetailsPanel);
  
  if (!detailsPanelOpen) return null;
  
  // Pobierz pierwszą wybraną zmienną
  const selectedId = selectedVariables[0];
  const selectedLibrary = libraries.find((l) => l.id === selectedLibraryId);
  const selectedVariable = selectedLibrary?.file.variables?.[selectedId];
  
  return (
    <aside className="panel">
      <div className="panel__header">
        <span className="panel__title">Details</span>
        <button className="panel__close" onClick={toggleDetailsPanel}>
          <X className="icon" />
        </button>
      </div>
      
      <div className="panel__body">
        {!selectedVariable ? (
          <div style={{ color: 'var(--text-muted)', padding: '20px 0' }}>
            Select a variable to see details
          </div>
        ) : (
          <>
            <div className="detail-group">
              <div className="detail-label">Name</div>
              <div className="detail-value">{selectedVariable.name.split('/').pop()}</div>
            </div>
            
            <div className="detail-group">
              <div className="detail-label">Path</div>
              <div className="detail-mono">{selectedVariable.name}</div>
            </div>
            
            <div className="detail-group">
              <div className="detail-label">Type</div>
              <div className="detail-value" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <div className="type-badge" style={{ width: '20px', height: '20px' }}>
                  <Hash className="icon sm" />
                </div>
                {selectedVariable.resolvedType}
              </div>
            </div>
            
            <div className="detail-group">
              <div className="detail-label">Values per mode</div>
              <div className="modes-list">
                {Object.entries(selectedVariable.valuesByMode || {}).map(([modeId, value]) => (
                  <div key={modeId} className="mode-row">
                    <span className="mode-row__name">{modeId}</span>
                    <span className="mode-row__val">
                      {typeof value === 'object' && 'value' in value 
                        ? String(value.value) 
                        : String(value)}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </>
        )}
      </div>
    </aside>
  );
}
