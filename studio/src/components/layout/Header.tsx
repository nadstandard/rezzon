import { useState, useRef, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Grid3X3, Link as LinkIcon, History, Download, Upload, Search, Trash2, X, ChevronDown } from 'lucide-react';
import { useAppStore } from '../../stores/appStore';
import { ImportModal } from '../ui/ImportModal';
import { ClearWorkspaceModal } from '../ui/ClearWorkspaceModal';
import { ExportModal } from '../ui/CrudModals';

export function Header() {
  const location = useLocation();
  const searchQuery = useAppStore((state) => state.ui.searchQuery);
  const setSearchQuery = useAppStore((state) => state.setSearchQuery);
  const libraries = useAppStore((state) => state.libraries);
  
  const [importModalOpen, setImportModalOpen] = useState(false);
  const [clearModalOpen, setClearModalOpen] = useState(false);
  const [exportModalOpen, setExportModalOpen] = useState(false);
  const [exportDropdownOpen, setExportDropdownOpen] = useState(false);
  const [exportLibraryId, setExportLibraryId] = useState<string | null>(null);
  
  const dropdownRef = useRef<HTMLDivElement>(null);
  
  // Zamknij dropdown po kliknięciu poza
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setExportDropdownOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const navItems = [
    { path: '/', label: 'Variables', icon: Grid3X3 },
    { path: '/aliases', label: 'Aliases', icon: LinkIcon },
    { path: '/snapshots', label: 'Snapshots', icon: History },
  ];

  const getPlaceholder = () => {
    switch (location.pathname) {
      case '/aliases': return 'Search aliases...';
      case '/snapshots': return 'Search snapshots...';
      default: return 'Search variables...';
    }
  };
  
  const canExport = libraries.length > 0;
  
  const handleExportLibrary = (libraryId: string) => {
    setExportLibraryId(libraryId);
    setExportDropdownOpen(false);
    setExportModalOpen(true);
  };
  
  // Sortuj biblioteki - główna (REZZON) pierwsza
  const sortedLibraries = [...libraries].sort((a, b) => {
    if (a.isMain && !b.isMain) return -1;
    if (!a.isMain && b.isMain) return 1;
    return a.name.localeCompare(b.name);
  });

  return (
    <header className="header">
      <div className="logo">
        <div className="logo__icon">R</div>
        <span className="logo__text">REZZON Studio</span>
      </div>
      
      <nav className="nav">
        {navItems.map(({ path, label, icon: Icon }) => (
          <Link
            key={path}
            to={path}
            className={`nav__item ${location.pathname === path ? 'active' : ''}`}
          >
            <Icon className="icon" />
            {label}
          </Link>
        ))}
      </nav>
      
      <div className="header__spacer" />
      
      <div className="search">
        <Search className="icon sm search__icon" />
        <input
          type="text"
          className="search__input"
          placeholder={getPlaceholder()}
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          style={{ paddingRight: searchQuery ? 32 : 10 }}
        />
        {searchQuery && (
          <button 
            className="search__clear"
            onClick={() => setSearchQuery('')}
            title="Clear search"
            style={{
              position: 'absolute',
              right: 8,
              top: '50%',
              transform: 'translateY(-50%)',
              background: 'none',
              border: 'none',
              padding: 2,
              cursor: 'pointer',
              color: 'var(--text-muted)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              borderRadius: 4,
            }}
          >
            <X className="icon xs" />
          </button>
        )}
      </div>
      
      <div className="header__actions">
        <button 
          className="btn btn--ghost" 
          onClick={() => setClearModalOpen(true)}
          title="Clear Workspace"
        >
          <Trash2 className="icon sm" />
        </button>
        <button className="btn btn--ghost" onClick={() => setImportModalOpen(true)}>
          <Download className="icon sm" />
          Import
        </button>
        
        {/* Export dropdown */}
        <div className="dropdown" ref={dropdownRef} style={{ position: 'relative' }}>
          <button 
            className="btn btn--primary"
            onClick={() => setExportDropdownOpen(!exportDropdownOpen)}
            disabled={!canExport}
            title={canExport ? 'Export library to Figma' : 'Import libraries first'}
            style={{ display: 'flex', alignItems: 'center', gap: 4 }}
          >
            <Upload className="icon sm" />
            Export
            <ChevronDown className="icon xs" style={{ marginLeft: 2 }} />
          </button>
          
          {exportDropdownOpen && canExport && (
            <div 
              className="dropdown__menu"
              style={{
                position: 'absolute',
                top: '100%',
                right: 0,
                marginTop: 4,
                background: 'var(--bg-secondary)',
                border: '1px solid var(--border)',
                borderRadius: 8,
                padding: '4px 0',
                minWidth: 200,
                zIndex: 1000,
                boxShadow: '0 4px 12px rgba(0,0,0,0.3)',
              }}
            >
              {sortedLibraries.map((lib) => (
                <button
                  key={lib.id}
                  className="dropdown__item"
                  onClick={() => handleExportLibrary(lib.id)}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 8,
                    width: '100%',
                    padding: '8px 12px',
                    background: 'none',
                    border: 'none',
                    color: 'var(--text-primary)',
                    cursor: 'pointer',
                    textAlign: 'left',
                    fontSize: 13,
                  }}
                  onMouseEnter={(e) => e.currentTarget.style.background = 'var(--bg-tertiary)'}
                  onMouseLeave={(e) => e.currentTarget.style.background = 'none'}
                >
                  <span style={{ 
                    width: 8, 
                    height: 8, 
                    borderRadius: '50%', 
                    background: lib.isMain ? 'var(--accent)' : 'var(--text-muted)',
                    flexShrink: 0,
                  }} />
                  <span style={{ flex: 1 }}>{lib.name}</span>
                  <span style={{ color: 'var(--text-muted)', fontSize: 11 }}>
                    {lib.variableCount} vars
                  </span>
                </button>
              ))}
            </div>
          )}
        </div>
      </div>
      
      <ImportModal isOpen={importModalOpen} onClose={() => setImportModalOpen(false)} />
      <ClearWorkspaceModal isOpen={clearModalOpen} onClose={() => setClearModalOpen(false)} />
      <ExportModal 
        isOpen={exportModalOpen} 
        onClose={() => setExportModalOpen(false)} 
        libraryId={exportLibraryId}
      />
    </header>
  );
}
