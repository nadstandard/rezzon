import { useState, useMemo } from 'react';
import { Icon } from '../Icons';
import { useGridStore } from '../../store';
import { generateColumnTokensWithModifiers } from '../../engine/generator';

export function PreviewView() {
  const { 
    styles, 
    baseParameters, 
    computedParameters,
    modifiers,
    viewports,
    selectedViewportId,
  } = useGridStore();

  const [filters, setFilters] = useState({
    layer: 'column',
    viewport: 'all',
    responsive: 'all',
    modifier: 'all',
  });

  const [searchQuery, setSearchQuery] = useState('');

  // Generate tokens using real engine
  const tokens = useMemo(() => {
    const result: {
      path: string;
      name: string;
      baseName: string;
      modifier?: string;
      values: Record<string, number>;
    }[] = [];

    // Get selected viewport name for path
    const selectedVp = viewports.find(vp => vp.id === selectedViewportId);
    const vpName = selectedVp?.name.toLowerCase() ?? 'desktop';

    // Build tokens for each style
    styles.forEach((style) => {
      // Build context for this style
      const baseValues = {
        viewport: baseParameters.find(p => p.name === 'viewport')?.values[style.id] ?? 0,
        gutter: baseParameters.find(p => p.name === 'gutter-width')?.values[style.id] ?? 0,
        'margin-m': baseParameters.find(p => p.name === 'margin-m')?.values[style.id] ?? 0,
        'margin-xs': baseParameters.find(p => p.name === 'margin-xs')?.values[style.id] ?? 0,
        columns: style.columns,
      };

      const computedValues = {
        'column-width': computedParameters.find(p => p.name === 'column-width')?.values[style.id] ?? 0,
        'ingrid': computedParameters.find(p => p.name === 'ingrid')?.values[style.id] ?? 0,
        'photo-margin': computedParameters.find(p => p.name === 'photo-margin')?.values[style.id] ?? 0,
        'number-of-gutters': computedParameters.find(p => p.name === 'number-of-gutters')?.values[style.id] ?? 0,
      };

      const ctx = {
        styleId: style.id,
        styleName: style.name,
        columns: style.columns,
        base: baseValues,
        computed: computedValues,
      };

      // Generate tokens
      const styleTokens = generateColumnTokensWithModifiers(ctx, modifiers);

      // Merge into result - group by token name
      styleTokens.forEach(token => {
        const existingToken = result.find(t => t.name === token.name);
        if (existingToken) {
          existingToken.values[style.id] = token.value;
        } else {
          // Extract base name (without modifier)
          const baseName = token.modifier 
            ? token.name.replace(token.modifier, '')
            : token.name;
            
          result.push({
            path: `column/${vpName}/`,
            name: token.name,
            baseName,
            modifier: token.modifier,
            values: { [style.id]: token.value },
          });
        }
      });
    });

    return result;
  }, [styles, baseParameters, computedParameters, modifiers, viewports, selectedViewportId]);

  // Filter tokens
  const filteredTokens = useMemo(() => {
    return tokens.filter((token) => {
      // Search filter
      if (searchQuery && !token.name.toLowerCase().includes(searchQuery.toLowerCase())) {
        return false;
      }

      // Modifier filter
      if (filters.modifier !== 'all') {
        if (filters.modifier === '(none)' && token.modifier) return false;
        if (filters.modifier !== '(none)' && token.modifier !== filters.modifier) return false;
      }

      return true;
    });
  }, [tokens, searchQuery, filters.modifier]);

  // Limit display for performance
  const displayedTokens = filteredTokens.slice(0, 50);
  const remainingCount = filteredTokens.length - displayedTokens.length;

  return (
    <div className="preview-view">
      {/* Filters */}
      <div className="preview-filters">
        <div className={`filter-select ${filters.layer !== 'all' ? 'active' : ''}`}>
          <span className="filter-select__label">Layer:</span>
          <select
            value={filters.layer}
            onChange={(e) => setFilters({ ...filters, layer: e.target.value })}
          >
            <option value="all">All</option>
            <option value="base">base</option>
            <option value="column">column</option>
            <option value="container">container</option>
            <option value="photo/width">photo/width</option>
            <option value="photo/height">photo/height</option>
          </select>
        </div>

        <div className={`filter-select ${filters.viewport !== 'all' ? 'active' : ''}`}>
          <span className="filter-select__label">Viewport:</span>
          <select
            value={filters.viewport}
            onChange={(e) => setFilters({ ...filters, viewport: e.target.value })}
          >
            <option value="all">All</option>
            {viewports.map(vp => (
              <option key={vp.id} value={vp.name.toLowerCase()}>{vp.name.toLowerCase()}</option>
            ))}
          </select>
        </div>

        <div className={`filter-select ${filters.responsive !== 'all' ? 'active' : ''}`}>
          <span className="filter-select__label">Responsive:</span>
          <select
            value={filters.responsive}
            onChange={(e) => setFilters({ ...filters, responsive: e.target.value })}
          >
            <option value="all">All</option>
            <option value="static">static</option>
            <option value="to-tab-6-col">to-tab-6-col</option>
            <option value="to-mobile-6-col">to-mobile-6-col</option>
          </select>
        </div>

        <div className={`filter-select ${filters.modifier !== 'all' ? 'active' : ''}`}>
          <span className="filter-select__label">Modifier:</span>
          <select
            value={filters.modifier}
            onChange={(e) => setFilters({ ...filters, modifier: e.target.value })}
          >
            <option value="all">All</option>
            <option value="(none)">(none)</option>
            {modifiers.map(mod => (
              <option key={mod.id} value={mod.name}>{mod.name}</option>
            ))}
          </select>
        </div>

        <div className="preview-search">
          <Icon name="search" size="xs" className="preview-search__icon" />
          <input
            type="text"
            placeholder="Search tokens..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
      </div>

      {/* Stats */}
      <div className="preview-stats">
        <div className="preview-stat">
          Showing <strong>{displayedTokens.length}</strong> of {filteredTokens.length} tokens
        </div>
        <div className="preview-stat">
          Total generated: <strong>{tokens.length}</strong>
        </div>
      </div>

      {/* Token table */}
      <div className="table-wrap">
        <table className="token-table">
          <thead>
            <tr>
              <th style={{ width: '40%' }}>Token Path</th>
              {styles.map((style) => (
                <th key={style.id} className="col-value">
                  {style.name.toUpperCase()}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {displayedTokens.map((token, idx) => (
              <tr key={idx}>
                <td>
                  <span className="token-path">{token.path}</span>
                  <span className="token-name">
                    <span className="token-name__base">{token.baseName}</span>
                    {token.modifier && (
                      <span className="token-name__modifier">{token.modifier}</span>
                    )}
                  </span>
                </td>
                {styles.map((style) => (
                  <td key={style.id} className="token-value">
                    {token.values[style.id] !== undefined 
                      ? Math.round(token.values[style.id] * 100) / 100 
                      : '-'}
                  </td>
                ))}
              </tr>
            ))}

            {remainingCount > 0 && (
              <tr style={{ opacity: 0.5 }}>
                <td
                  colSpan={styles.length + 1}
                  style={{ textAlign: 'center', color: 'var(--text-muted)', padding: 12 }}
                >
                  ... {remainingCount} more tokens ...
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
