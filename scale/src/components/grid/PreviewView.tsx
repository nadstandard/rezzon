import { useState } from 'react';
import { Icon } from '../Icons';
import { useGridStore } from '../../store';

export function PreviewView() {
  const { styles, baseParameters, computedParameters } = useGridStore();

  const [filters, setFilters] = useState({
    layer: 'column',
    viewport: 'all',
    responsive: 'all',
    modifier: 'all',
  });

  const [searchQuery, setSearchQuery] = useState('');

  // Generate sample tokens for preview
  const generateSampleTokens = () => {
    const tokens: {
      path: string;
      name: string;
      baseName: string;
      modifier?: string;
      values: Record<string, number>;
    }[] = [];

    // For each column from 1 to 12
    for (let col = 1; col <= 12; col++) {
      const baseName = `v-col-${col}`;

      // Base token
      const baseValues: Record<string, number> = {};
      styles.forEach((style) => {
        const colWidth = computedParameters.find((p) => p.name === 'column-width')?.values[style.id] ?? 0;
        const gutter = baseParameters.find((p) => p.name === 'gutter-width')?.values[style.id] ?? 0;
        baseValues[style.id] = Math.round(colWidth * col + gutter * (col - 1));
      });

      tokens.push({
        path: `column/desktop/`,
        name: baseName,
        baseName,
        values: baseValues,
      });

      // With modifiers (only for columns 1-11 for -w-half)
      if (col <= 11) {
        const halfValues: Record<string, number> = {};
        styles.forEach((style) => {
          const colWidth = computedParameters.find((p) => p.name === 'column-width')?.values[style.id] ?? 0;
          halfValues[style.id] = Math.round(baseValues[style.id] + colWidth / 2);
        });

        tokens.push({
          path: `column/desktop/`,
          name: `${baseName}-w-half`,
          baseName,
          modifier: '-w-half',
          values: halfValues,
        });
      }

      // -w-margin
      const marginValues: Record<string, number> = {};
      styles.forEach((style) => {
        const photoMargin = computedParameters.find((p) => p.name === 'photo-margin')?.values[style.id] ?? 0;
        marginValues[style.id] = Math.round(baseValues[style.id] + photoMargin);
      });

      tokens.push({
        path: `column/desktop/`,
        name: `${baseName}-w-margin`,
        baseName,
        modifier: '-w-margin',
        values: marginValues,
      });

      // -to-edge
      const edgeValues: Record<string, number> = {};
      styles.forEach((style) => {
        const marginM = baseParameters.find((p) => p.name === 'margin-m')?.values[style.id] ?? 0;
        edgeValues[style.id] = Math.round(baseValues[style.id] + marginM);
      });

      tokens.push({
        path: `column/desktop/`,
        name: `${baseName}-to-edge`,
        baseName,
        modifier: '-to-edge',
        values: edgeValues,
      });
    }

    // Add special tokens
    const viewport = baseParameters.find((p) => p.name === 'viewport')?.values ?? {};

    tokens.push({
      path: `column/desktop/`,
      name: 'v-col-viewport',
      baseName: 'v-col-viewport',
      values: viewport as Record<string, number>,
    });

    return tokens;
  };

  const tokens = generateSampleTokens();

  // Filter tokens
  const filteredTokens = tokens.filter((token) => {
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

  // Limit display for performance
  const displayedTokens = filteredTokens.slice(0, 20);
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
            <option value="desktop">desktop</option>
            <option value="laptop">laptop</option>
            <option value="tablet">tablet</option>
            <option value="mobile">mobile</option>
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
            <option value="-w-half">-w-half</option>
            <option value="-w-margin">-w-margin</option>
            <option value="-to-edge">-to-edge</option>
            <option value="-1G">-1G</option>
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
          Layer: <strong>{filters.layer}</strong>
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
                    {token.values[style.id] ?? '-'}
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
