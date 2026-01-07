import { X, Hash, Type, ToggleLeft, Palette, ArrowRight, ExternalLink } from 'lucide-react';
import { useAppStore } from '../../stores/appStore';
import type { VariableType, VariableValue } from '../../types';

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

function getTypeName(type: VariableType): string {
  switch (type) {
    case 'FLOAT': return 'Number';
    case 'STRING': return 'String';
    case 'BOOLEAN': return 'Boolean';
    case 'COLOR': return 'Color';
    default: return type;
  }
}

function formatValue(value: VariableValue['value'], type: VariableType): string {
  if (value === undefined || value === null) return '-';
  
  if (type === 'COLOR' && typeof value === 'object' && 'r' in value) {
    const r = Math.round(value.r * 255);
    const g = Math.round(value.g * 255);
    const b = Math.round(value.b * 255);
    return `#${r.toString(16).padStart(2, '0')}${g.toString(16).padStart(2, '0')}${b.toString(16).padStart(2, '0')}`.toUpperCase();
  }
  
  if (type === 'BOOLEAN') {
    return value ? 'true' : 'false';
  }
  
  if (typeof value === 'number') {
    return Number.isInteger(value) ? String(value) : value.toFixed(2);
  }
  
  return String(value);
}

export function DetailsPanel() {
  const detailsPanelOpen = useAppStore((state) => state.ui.detailsPanelOpen);
  const selectedVariables = useAppStore((state) => state.ui.selectedVariables);
  const selectedLibraryId = useAppStore((state) => state.ui.selectedLibraryId);
  const selectedCollectionId = useAppStore((state) => state.ui.selectedCollectionId);
  const libraries = useAppStore((state) => state.libraries);
  const toggleDetailsPanel = useAppStore((state) => state.toggleDetailsPanel);
  
  if (!detailsPanelOpen) return null;
  
  const selectedLibrary = libraries.find((l) => l.id === selectedLibraryId);
  const selectedCollection = selectedLibrary?.file.variableCollections?.[selectedCollectionId || ''];
  const allVariables = selectedLibrary?.file.variables || {};
  
  // Pobierz pierwszą wybraną zmienną
  const selectedId = selectedVariables[0];
  const selectedVariable = allVariables[selectedId];
  
  // Multi-select summary
  if (selectedVariables.length > 1) {
    const types: Record<string, number> = {};
    for (const id of selectedVariables) {
      const v = allVariables[id];
      if (v) {
        types[v.resolvedType] = (types[v.resolvedType] || 0) + 1;
      }
    }
    
    return (
      <aside className="panel">
        <div className="panel__header">
          <span className="panel__title">Selection</span>
          <button className="panel__close" onClick={toggleDetailsPanel}>
            <X className="icon" />
          </button>
        </div>
        
        <div className="panel__body">
          <div className="detail-group">
            <div className="detail-label">Selected</div>
            <div className="detail-value" style={{ fontSize: '18px', fontWeight: 600 }}>
              {selectedVariables.length} variables
            </div>
          </div>
          
          <div className="detail-group">
            <div className="detail-label">By Type</div>
            <div className="modes-list">
              {Object.entries(types).map(([type, count]) => (
                <div key={type} className="mode-row">
                  <span className="mode-row__name" style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <TypeIcon type={type as VariableType} />
                    {getTypeName(type as VariableType)}
                  </span>
                  <span className="mode-row__val">{count}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </aside>
    );
  }
  
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
              <div className="detail-mono">
                {selectedCollection?.name} / {selectedVariable.name}
              </div>
            </div>
            
            <div className="detail-group">
              <div className="detail-label">Type</div>
              <div className="detail-value" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <div className="type-badge" style={{ width: '20px', height: '20px' }}>
                  <TypeIcon type={selectedVariable.resolvedType} />
                </div>
                {getTypeName(selectedVariable.resolvedType)}
              </div>
            </div>
            
            {/* Alias info */}
            {(() => {
              const firstValue = Object.values(selectedVariable.valuesByMode || {})[0];
              if (firstValue?.type === 'VARIABLE_ALIAS' && firstValue.variableId) {
                const targetVar = allVariables[firstValue.variableId];
                const isExternal = !targetVar;
                
                return (
                  <div className="detail-group">
                    <div className="detail-label">Alias Target</div>
                    <div 
                      className={`val-alias ${isExternal ? 'val-alias--external' : 'val-alias--internal'}`}
                      style={{ display: 'inline-flex' }}
                    >
                      {isExternal ? (
                        <ExternalLink className="icon sm" />
                      ) : (
                        <ArrowRight className="icon sm" />
                      )}
                      <span className="val-alias__path">
                        {targetVar?.name || firstValue.variableId}
                      </span>
                    </div>
                  </div>
                );
              }
              return null;
            })()}
            
            <div className="detail-group">
              <div className="detail-label">Values per mode</div>
              <div className="modes-list">
                {selectedCollection?.modes.map((mode) => {
                  const modeValue = selectedVariable.valuesByMode?.[mode.modeId];
                  
                  if (modeValue?.type === 'VARIABLE_ALIAS') {
                    const targetVar = allVariables[modeValue.variableId || ''];
                    return (
                      <div key={mode.modeId} className="mode-row">
                        <span className="mode-row__name">{mode.name}</span>
                        <span className="mode-row__val" style={{ color: 'var(--green)' }}>
                          → {targetVar?.name.split('/').pop() || 'alias'}
                        </span>
                      </div>
                    );
                  }
                  
                  const displayValue = formatValue(modeValue?.value, selectedVariable.resolvedType);
                  
                  return (
                    <div key={mode.modeId} className="mode-row">
                      <span className="mode-row__name">{mode.name}</span>
                      <span className="mode-row__val">{displayValue}</span>
                    </div>
                  );
                })}
              </div>
            </div>
            
            {selectedVariable.description && (
              <div className="detail-group">
                <div className="detail-label">Description</div>
                <div className="detail-value" style={{ color: 'var(--text-secondary)' }}>
                  {selectedVariable.description}
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </aside>
  );
}
