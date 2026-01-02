import { useState, useMemo } from 'react';
import { Icon } from '../Icons';
import { useGridStore } from '../../store';
import { 
  generateAllTokensForFolder, 
  calculateFolderTokenCount,
  type FolderGeneratorContext 
} from '../../engine/generator';

interface TokenRow {
  folderName: string;
  folderId: string;
  path: string;
  name: string;
  viewport?: string;
  responsive?: string;
  values: Record<string, number>;
}

export function PreviewView() {
  const { 
    styles, 
    viewports,
    baseParameters, 
    computedParameters,
    modifiers,
    ratioFamilies,
    responsiveVariants,
    outputFolders,
  } = useGridStore();

  const [filters, setFilters] = useState({
    folder: 'all',
    viewport: 'all',
    responsive: 'all',
  });

  const [searchQuery, setSearchQuery] = useState('');

  // Build generator context
  const generatorContext = useMemo((): FolderGeneratorContext => ({
    styles,
    viewports,
    baseParameters,
    computedParameters,
    modifiers,
    ratioFamilies,
    responsiveVariants,
  }), [styles, viewports, baseParameters, computedParameters, modifiers, ratioFamilies, responsiveVariants]);

  // Generate ALL tokens from ALL folders
  const allTokens = useMemo(() => {
    const tokens: TokenRow[] = [];
    
    // Only process folders with paths (not grouping folders)
    const activeFolders = outputFolders.filter(f => f.path);
    
    activeFolders.forEach(folder => {
      const folderTokens = generateAllTokensForFolder(folder, generatorContext);
      
      folderTokens.forEach(token => {
        tokens.push({
          folderName: folder.name,
          folderId: folder.id,
          path: token.path ?? '',
          name: token.name,
          viewport: token.viewport,
          responsive: token.responsive,
          values: token.values,
        });
      });
    });
    
    return tokens;
  }, [outputFolders, generatorContext]);

  // Get unique values for filters
  const uniqueFolders = useMemo(() => {
    const folders = outputFolders.filter(f => f.path);
    return folders.map(f => ({ id: f.id, name: f.name }));
  }, [outputFolders]);

  const uniqueViewports = useMemo(() => {
    const vps = new Set<string>();
    allTokens.forEach(t => {
      if (t.viewport) vps.add(t.viewport);
    });
    return Array.from(vps);
  }, [allTokens]);

  const uniqueResponsives = useMemo(() => {
    const rvs = new Set<string>();
    allTokens.forEach(t => {
      if (t.responsive) rvs.add(t.responsive);
    });
    return Array.from(rvs);
  }, [allTokens]);

  // Filter tokens
  const filteredTokens = useMemo(() => {
    return allTokens.filter((token) => {
      // Search filter
      if (searchQuery) {
        const query = searchQuery.toLowerCase();
        if (!token.path.toLowerCase().includes(query) && 
            !token.name.toLowerCase().includes(query)) {
          return false;
        }
      }

      // Folder filter
      if (filters.folder !== 'all' && token.folderId !== filters.folder) {
        return false;
      }

      // Viewport filter
      if (filters.viewport !== 'all' && token.viewport !== filters.viewport) {
        return false;
      }

      // Responsive filter
      if (filters.responsive !== 'all' && token.responsive !== filters.responsive) {
        return false;
      }

      return true;
    });
  }, [allTokens, searchQuery, filters]);

  // Calculate total token count
  const totalTokenCount = useMemo(() => {
    return outputFolders.reduce((sum, f) => {
      if (!f.path) return sum;
      return sum + calculateFolderTokenCount(f, generatorContext);
    }, 0);
  }, [outputFolders, generatorContext]);

  return (
    <div className="preview-view">
      {/* Filters */}
      <div className="preview-filters">
        <div className={`filter-select ${filters.folder !== 'all' ? 'active' : ''}`}>
          <span className="filter-select__label">Folder:</span>
          <select
            value={filters.folder}
            onChange={(e) => setFilters({ ...filters, folder: e.target.value })}
          >
            <option value="all">All folders</option>
            {uniqueFolders.map(f => (
              <option key={f.id} value={f.id}>{f.name}</option>
            ))}
          </select>
        </div>

        <div className={`filter-select ${filters.viewport !== 'all' ? 'active' : ''}`}>
          <span className="filter-select__label">Viewport:</span>
          <select
            value={filters.viewport}
            onChange={(e) => setFilters({ ...filters, viewport: e.target.value })}
          >
            <option value="all">All viewports</option>
            {uniqueViewports.map(vp => (
              <option key={vp} value={vp}>{vp}</option>
            ))}
          </select>
        </div>

        <div className={`filter-select ${filters.responsive !== 'all' ? 'active' : ''}`}>
          <span className="filter-select__label">Responsive:</span>
          <select
            value={filters.responsive}
            onChange={(e) => setFilters({ ...filters, responsive: e.target.value })}
          >
            <option value="all">All variants</option>
            {uniqueResponsives.map(rv => (
              <option key={rv} value={rv}>{rv}</option>
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

        <button 
          className="btn btn--ghost btn--sm"
          onClick={() => {
            setFilters({ folder: 'all', viewport: 'all', responsive: 'all' });
            setSearchQuery('');
          }}
        >
          Clear
        </button>
      </div>

      {/* Stats */}
      <div className="preview-stats">
        <div className="preview-stat">
          Showing <strong>{filteredTokens.length.toLocaleString()}</strong> of {totalTokenCount.toLocaleString()} tokens
          {(searchQuery || filters.folder !== 'all' || filters.viewport !== 'all' || filters.responsive !== 'all') && ` (filtered)`}
        </div>
        <div className="preview-stat">
          {uniqueFolders.length} folders • {styles.length} styles • {viewports.length} viewports
        </div>
      </div>

      {/* Token table */}
      <div className="table-wrap">
        <table className="token-table">
          <thead>
            <tr>
              <th style={{ width: '50%' }}>Token Path</th>
              {styles.map((style) => (
                <th key={style.id} className="col-value">
                  {style.name}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {filteredTokens.map((token, idx) => (
              <tr key={idx}>
                <td>
                  <div className="token-path-cell">
                    <span className="token-path">{token.path}</span>
                  </div>
                </td>
                {styles.map((style) => (
                  <td key={style.id} className="token-value">
                    {token.values[style.id] !== undefined 
                      ? Math.round(token.values[style.id] * 100) / 100 
                      : '—'}
                  </td>
                ))}
              </tr>
            ))}
            {filteredTokens.length === 0 && (
              <tr>
                <td colSpan={styles.length + 1} className="token-table__empty">
                  {allTokens.length === 0 
                    ? 'No tokens generated. Configure Output Folders in Generators tab.'
                    : 'No tokens match the current filters.'}
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
