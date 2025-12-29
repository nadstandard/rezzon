import { Icon } from '../Icons';
import { useGridStore } from '../../store';
import { generateColumnTokensWithModifiers } from '../../engine/generator';

export function ParametersView() {
  const {
    styles,
    baseParameters,
    computedParameters,
    modifiers,
    outputLayers,
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
                  <span className="value-computed">
                    {param.values[style.id] !== undefined 
                      ? Math.round(param.values[style.id] * 100) / 100 
                      : '-'}
                  </span>
                </td>
              ))}
            </tr>
          ))}

          {/* SECTION: Generated Tokens (preview) */}
          <tr className="section-divider">
            <td colSpan={styles.length + 1}>
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

            // Show first 5 base tokens + "..." + last 3
            const tokenNames = ['v-col-1', 'v-col-2', 'v-col-3', 'v-col-4', 'v-col-5'];
            const lastTokens = [`v-col-${firstStyle.columns}`, 'v-col-viewport'];

            return (
              <>
                {tokenNames.map(name => (
                  <tr key={name} className="param-row">
                    <td className="col-param">
                      <div className="param-cell">
                        <div className="param-cell__type param-cell__type--generated">=</div>
                        <span className="param-cell__name">{name}</span>
                      </div>
                    </td>
                    {styles.map(style => (
                      <td key={style.id} className="value-cell">
                        <span className="value-generated">
                          {Math.round((tokensByStyle[style.id]?.[name] ?? 0) * 100) / 100}
                        </span>
                      </td>
                    ))}
                  </tr>
                ))}

                <tr className="param-row" style={{ opacity: 0.6 }}>
                  <td className="col-param">
                    <div className="param-cell">
                      <div className="param-cell__type param-cell__type--generated">=</div>
                      <span className="param-cell__name param-cell__name--muted">
                        ... v-col-6 to v-col-{firstStyle.columns - 1}
                      </span>
                    </div>
                  </td>
                  {styles.map(style => (
                    <td key={style.id} className="value-cell">
                      <span className="value-generated">...</span>
                    </td>
                  ))}
                </tr>

                {lastTokens.map(name => (
                  <tr key={name} className="param-row">
                    <td className="col-param">
                      <div className="param-cell">
                        <div className="param-cell__type param-cell__type--generated">=</div>
                        <span className="param-cell__name">
                          {name === `v-col-${firstStyle.columns}` ? `${name} (v-full)` : name}
                        </span>
                      </div>
                    </td>
                    {styles.map(style => (
                      <td key={style.id} className="value-cell">
                        <span className="value-generated">
                          {Math.round((tokensByStyle[style.id]?.[name] ?? 0) * 100) / 100}
                        </span>
                      </td>
                    ))}
                  </tr>
                ))}
              </>
            );
          })()}
        </tbody>
      </table>
    </div>
  );
}
