import { useState } from 'react';
import { Icon } from '../Icons';
import { useGridStore } from '../../store';
import { generateColumnTokensWithModifiers } from '../../engine/generator';
import { StyleModal, ConfirmDeleteModal, AddBaseParameterModal } from '../Modals';

export function ParametersView() {
  const {
    styles,
    baseParameters,
    computedParameters,
    modifiers,
    outputLayers,
    updateBaseParameter,
    addStyle,
    updateStyle,
    removeStyle,
    addBaseParameter,
    removeBaseParameter,
    recalculateComputed,
  } = useGridStore();

  // Modal states
  const [styleModalOpen, setStyleModalOpen] = useState(false);
  const [editingStyle, setEditingStyle] = useState<{ id: string; name: string; columns: number } | null>(null);
  const [deleteStyleId, setDeleteStyleId] = useState<string | null>(null);
  const [paramModalOpen, setParamModalOpen] = useState(false);
  const [deleteParamId, setDeleteParamId] = useState<string | null>(null);

  const handleValueChange = (paramId: string, styleId: string, value: string) => {
    const numValue = parseFloat(value);
    if (!isNaN(numValue)) {
      updateBaseParameter(paramId, styleId, numValue);
    }
  };

  // Style handlers
  const handleAddStyle = (data: { name: string; columns: number }) => {
    // Add style
    addStyle(data);
    // Note: Base parameters will have undefined values for new style
    // They will default to 0 in calculations
    setTimeout(() => recalculateComputed(), 0);
  };

  const handleEditStyle = (data: { name: string; columns: number }) => {
    if (editingStyle) {
      updateStyle(editingStyle.id, data);
      // Also update number-of-columns parameter
      const colsParam = baseParameters.find(p => p.name === 'number-of-columns');
      if (colsParam) {
        updateBaseParameter(colsParam.id, editingStyle.id, data.columns);
      }
      setEditingStyle(null);
    }
  };

  const handleDeleteStyle = () => {
    if (deleteStyleId) {
      removeStyle(deleteStyleId);
      setDeleteStyleId(null);
      setTimeout(() => recalculateComputed(), 0);
    }
  };

  // Parameter handlers
  const handleAddParameter = (data: { name: string; defaultValue: number }) => {
    // Create values object with default value for all styles
    const values: Record<string, number> = {};
    styles.forEach(s => { values[s.id] = data.defaultValue; });
    
    addBaseParameter({
      name: data.name,
      type: 'base',
      values,
      editable: true,
    });
    setTimeout(() => recalculateComputed(), 0);
  };

  const handleDeleteParameter = () => {
    if (deleteParamId) {
      removeBaseParameter(deleteParamId);
      setDeleteParamId(null);
      setTimeout(() => recalculateComputed(), 0);
    }
  };

  const styleToDelete = styles.find(s => s.id === deleteStyleId);
  const paramToDelete = baseParameters.find(p => p.id === deleteParamId);

  // Core parameters that cannot be deleted
  const coreParamNames = ['viewport', 'number-of-columns', 'gutter-width', 'margin-m', 'margin-xs'];

  return (
    <div className="table-wrap">
      <table className="matrix-table">
        <thead>
          <tr>
            <th className="col-param">Parameter</th>
            {styles.map((style) => (
              <th key={style.id} className="col-style">
                <div className="style-header">
                  <div className="style-header__top">
                    <span className="style-header__name">{style.name}</span>
                    <div className="style-header__actions">
                      <button 
                        className="action-btn" 
                        onClick={() => { setEditingStyle({ id: style.id, name: style.name, columns: style.columns }); setStyleModalOpen(true); }}
                        title="Edit style"
                      >
                        <Icon name="edit" size="xs" />
                      </button>
                      <button 
                        className="action-btn action-btn--danger" 
                        onClick={() => setDeleteStyleId(style.id)}
                        title="Delete style"
                        disabled={styles.length <= 1}
                      >
                        <Icon name="trash" size="xs" />
                      </button>
                    </div>
                  </div>
                  <span className="style-header__cols">{style.columns} col</span>
                </div>
              </th>
            ))}
            {/* Add style column */}
            <th className="col-style col-style--add">
              <button 
                className="add-style-btn"
                onClick={() => { setEditingStyle(null); setStyleModalOpen(true); }}
              >
                <Icon name="plus" size="sm" />
                <span>Add Style</span>
              </button>
            </th>
          </tr>
        </thead>
        <tbody>
          {/* SECTION: Base Parameters */}
          <tr className="section-divider">
            <td colSpan={styles.length + 2}>
              <div className="section-divider__content">
                <span className="section-divider__title">Base Parameters</span>
                <span className="section-divider__count">{baseParameters.length} params</span>
              </div>
            </td>
          </tr>

          {baseParameters.map((param) => {
            const isCore = coreParamNames.includes(param.name);
            return (
              <tr key={param.id} className="param-row">
                <td className="col-param">
                  <div className="param-cell">
                    <div className="param-cell__type param-cell__type--base">#</div>
                    <span className="param-cell__name">{param.name}</span>
                    {!isCore && (
                      <button 
                        className="param-cell__delete"
                        onClick={() => setDeleteParamId(param.id)}
                        title="Delete parameter"
                      >
                        <Icon name="x" size="xs" />
                      </button>
                    )}
                  </div>
                </td>
                {styles.map((style) => (
                  <td key={style.id} className="value-cell">
                    {param.editable ? (
                      <input
                        type="number"
                        className="value-input"
                        value={param.values[style.id] ?? ''}
                        onChange={(e) => handleValueChange(param.id, style.id, e.target.value)}
                      />
                    ) : (
                      <input
                        type="text"
                        className="value-input value-input--readonly"
                        value={param.values[style.id] ?? ''}
                        readOnly
                      />
                    )}
                  </td>
                ))}
                <td className="value-cell value-cell--empty"></td>
              </tr>
            );
          })}

          {/* Add parameter row */}
          <tr>
            <td colSpan={styles.length + 2}>
              <div className="add-row" onClick={() => setParamModalOpen(true)}>
                <div className="add-row__icon">
                  <Icon name="plus" size="xs" />
                </div>
                <span>Add parameter</span>
              </div>
            </td>
          </tr>

          {/* SECTION: Computed Parameters */}
          <tr className="section-divider">
            <td colSpan={styles.length + 2}>
              <div className="section-divider__content">
                <span className="section-divider__title">Computed</span>
                <span className="section-divider__count">{computedParameters.length} params</span>
              </div>
            </td>
          </tr>

          {computedParameters.map((param) => (
            <tr key={param.id} className="param-row">
              <td className="col-param">
                <div className="param-cell">
                  <div className="param-cell__type param-cell__type--computed">ƒ</div>
                  <span className="param-cell__name">{param.name}</span>
                </div>
              </td>
              {styles.map((style) => (
                <td key={style.id} className="value-cell">
                  <span className="value-computed">
                    {param.values[style.id] !== undefined 
                      ? Math.round(param.values[style.id] * 100) / 100 
                      : '-'}
                  </span>
                </td>
              ))}
              <td className="value-cell value-cell--empty"></td>
            </tr>
          ))}

          {/* SECTION: Generated Tokens (preview) */}
          <tr className="section-divider">
            <td colSpan={styles.length + 2}>
              <div className="section-divider__content">
                <span className="section-divider__title">Generated Tokens</span>
                <span className="section-divider__count">
                  {outputLayers.find(l => l.path === 'grid/column')?.tokenCount ?? 0} tokens
                </span>
              </div>
            </td>
          </tr>

          {/* Generate real preview tokens */}
          {(() => {
            // Generate tokens for first style to show structure
            const firstStyle = styles[0];
            if (!firstStyle) return null;

            // Generate all token values per style
            const tokensByStyle: Record<string, Record<string, number>> = {};
            styles.forEach(style => {
              const ctx = {
                styleId: style.id,
                styleName: style.name,
                columns: style.columns,
                base: {
                  viewport: baseParameters.find(p => p.name === 'viewport')?.values[style.id] ?? 0,
                  gutter: baseParameters.find(p => p.name === 'gutter-width')?.values[style.id] ?? 0,
                  'margin-m': baseParameters.find(p => p.name === 'margin-m')?.values[style.id] ?? 0,
                  'margin-xs': baseParameters.find(p => p.name === 'margin-xs')?.values[style.id] ?? 0,
                  columns: style.columns,
                },
                computed: {
                  'column-width': computedParameters.find(p => p.name === 'column-width')?.values[style.id] ?? 0,
                  'ingrid': computedParameters.find(p => p.name === 'ingrid')?.values[style.id] ?? 0,
                  'photo-margin': computedParameters.find(p => p.name === 'photo-margin')?.values[style.id] ?? 0,
                  'number-of-gutters': computedParameters.find(p => p.name === 'number-of-gutters')?.values[style.id] ?? 0,
                },
              };
              const tokens = generateColumnTokensWithModifiers(ctx, modifiers);
              tokensByStyle[style.id] = {};
              tokens.forEach(t => {
                tokensByStyle[style.id][t.name] = t.value;
              });
            });

            // Generate ALL token names: v-col-1 to v-col-{maxColumns} + v-col-viewport
            const maxColumns = Math.max(...styles.map(s => s.columns));
            const allTokenNames: string[] = [];
            for (let i = 1; i <= maxColumns; i++) {
              allTokenNames.push(`v-col-${i}`);
            }
            allTokenNames.push('v-col-viewport');

            return (
              <>
                {allTokenNames.map((name) => {
                  const colNum = parseInt(name.replace('v-col-', '')) || 0;
                  
                  return (
                    <tr key={name} className="param-row">
                      <td className="col-param">
                        <div className="param-cell">
                          <div className="param-cell__type param-cell__type--generated">=</div>
                          <span className="param-cell__name">{name}</span>
                        </div>
                      </td>
                      {styles.map(style => {
                        const value = tokensByStyle[style.id]?.[name];
                        const isOutOfRange = name !== 'v-col-viewport' && colNum > style.columns;
                        
                        return (
                          <td key={style.id} className="value-cell">
                            <span className="value-generated" style={isOutOfRange ? { opacity: 0.3 } : undefined}>
                              {isOutOfRange ? '–' : Math.round((value ?? 0) * 100) / 100}
                            </span>
                          </td>
                        );
                      })}
                      <td className="value-cell value-cell--empty"></td>
                    </tr>
                  );
                })}
              </>
            );
          })()}
        </tbody>
      </table>

      {/* Style Modal */}
      <StyleModal
        isOpen={styleModalOpen}
        onClose={() => { setStyleModalOpen(false); setEditingStyle(null); }}
        onSave={editingStyle ? handleEditStyle : handleAddStyle}
        editData={editingStyle}
      />

      {/* Delete Style Confirmation */}
      <ConfirmDeleteModal
        isOpen={!!deleteStyleId}
        onClose={() => setDeleteStyleId(null)}
        onConfirm={handleDeleteStyle}
        title="Delete Style"
        message="Are you sure you want to delete this style? All parameter values for this style will be removed."
        itemName={styleToDelete?.name}
      />

      {/* Add Parameter Modal */}
      <AddBaseParameterModal
        isOpen={paramModalOpen}
        onClose={() => setParamModalOpen(false)}
        onSave={handleAddParameter}
        existingNames={baseParameters.map(p => p.name)}
      />

      {/* Delete Parameter Confirmation */}
      <ConfirmDeleteModal
        isOpen={!!deleteParamId}
        onClose={() => setDeleteParamId(null)}
        onConfirm={handleDeleteParameter}
        title="Delete Parameter"
        message="Are you sure you want to delete this parameter?"
        itemName={paramToDelete?.name}
      />
    </div>
  );
}
