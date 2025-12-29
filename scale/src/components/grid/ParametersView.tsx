import { Icon } from '../Icons';
import { useGridStore } from '../../store';

export function ParametersView() {
  const {
    styles,
    baseParameters,
    computedParameters,
    updateBaseParameter,
  } = useGridStore();

  const handleValueChange = (paramId: string, styleId: string, value: string) => {
    const numValue = parseFloat(value);
    if (!isNaN(numValue)) {
      updateBaseParameter(paramId, styleId, numValue);
    }
  };

  return (
    <div className="table-wrap">
      <table className="matrix-table">
        <thead>
          <tr>
            <th className="col-param">Parameter</th>
            {styles.map((style) => (
              <th key={style.id} className="col-style">
                <div className="style-header">
                  <span className="style-header__name">{style.name}</span>
                  <span className="style-header__cols">{style.columns} col</span>
                </div>
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {/* SECTION: Base Parameters */}
          <tr className="section-divider">
            <td colSpan={styles.length + 1}>
              <div className="section-divider__content">
                <span className="section-divider__title">Base Parameters</span>
                <span className="section-divider__count">{baseParameters.length} params</span>
              </div>
            </td>
          </tr>

          {baseParameters.map((param) => (
            <tr key={param.id} className="param-row">
              <td className="col-param">
                <div className="param-cell">
                  <div className="param-cell__type param-cell__type--base">#</div>
                  <span className="param-cell__name">{param.name}</span>
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
            </tr>
          ))}

          {/* Add parameter row */}
          <tr>
            <td colSpan={styles.length + 1}>
              <div className="add-row">
                <div className="add-row__icon">
                  <Icon name="plus" size="xs" />
                </div>
                <span>Add parameter</span>
              </div>
            </td>
          </tr>

          {/* SECTION: Computed Parameters */}
          <tr className="section-divider">
            <td colSpan={styles.length + 1}>
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
                  <span className="value-computed">{param.values[style.id] ?? '-'}</span>
                </td>
              ))}
            </tr>
          ))}

          {/* SECTION: Generated Tokens (preview) */}
          <tr className="section-divider">
            <td colSpan={styles.length + 1}>
              <div className="section-divider__content">
                <span className="section-divider__title">Generated Tokens</span>
                <span className="section-divider__count">48 tokens</span>
              </div>
            </td>
          </tr>

          {/* Show first few generated tokens as preview */}
          {['v-col-1', 'v-col-2', 'v-col-3'].map((tokenName, idx) => (
            <tr key={tokenName} className="param-row">
              <td className="col-param">
                <div className="param-cell">
                  <div className="param-cell__type param-cell__type--generated">=</div>
                  <span className="param-cell__name">{tokenName}</span>
                </div>
              </td>
              {styles.map((style) => {
                // Calculate approximate value based on column width
                const colWidth = computedParameters.find(p => p.name === 'column-width')?.values[style.id] ?? 0;
                const gutter = baseParameters.find(p => p.name === 'gutter-width')?.values[style.id] ?? 0;
                const value = colWidth * (idx + 1) + gutter * idx;
                return (
                  <td key={style.id} className="value-cell">
                    <span className="value-generated">{Math.round(value)}</span>
                  </td>
                );
              })}
            </tr>
          ))}

          <tr className="param-row" style={{ opacity: 0.6 }}>
            <td className="col-param">
              <div className="param-cell">
                <div className="param-cell__type param-cell__type--generated">=</div>
                <span className="param-cell__name param-cell__name--muted">... v-col-4 to v-col-11</span>
              </div>
            </td>
            {styles.map((style) => (
              <td key={style.id} className="value-cell">
                <span className="value-generated">...</span>
              </td>
            ))}
          </tr>

          <tr className="param-row">
            <td className="col-param">
              <div className="param-cell">
                <div className="param-cell__type param-cell__type--generated">=</div>
                <span className="param-cell__name">v-col-12 (v-full)</span>
              </div>
            </td>
            {styles.map((style) => {
              const ingrid = computedParameters.find(p => p.name === 'ingrid')?.values[style.id] ?? 0;
              return (
                <td key={style.id} className="value-cell">
                  <span className="value-generated">{ingrid}</span>
                </td>
              );
            })}
          </tr>

          <tr className="param-row">
            <td className="col-param">
              <div className="param-cell">
                <div className="param-cell__type param-cell__type--generated">=</div>
                <span className="param-cell__name">v-col-viewport</span>
              </div>
            </td>
            {styles.map((style) => {
              const viewport = baseParameters.find(p => p.name === 'viewport')?.values[style.id] ?? 0;
              return (
                <td key={style.id} className="value-cell">
                  <span className="value-generated">{viewport}</span>
                </td>
              );
            })}
          </tr>
        </tbody>
      </table>
    </div>
  );
}
