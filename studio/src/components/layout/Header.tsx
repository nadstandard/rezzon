import { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Grid3X3, Link as LinkIcon, History, Download, Upload, Search, Trash2, X } from 'lucide-react';
import { useAppStore } from '../../stores/appStore';
import { ImportModal } from '../ui/ImportModal';
import { ClearWorkspaceModal } from '../ui/ClearWorkspaceModal';
import { ExportModal } from '../ui/CrudModals';

export function Header() {
  const location = useLocation();
  const searchQuery = useAppStore((state) => state.ui.searchQuery);
  const setSearchQuery = useAppStore((state) => state.setSearchQuery);
  const selectedLibraryId = useAppStore((state) => state.ui.selectedLibraryId);
  const libraries = useAppStore((state) => state.libraries);
  
  const [importModalOpen, setImportModalOpen] = useState(false);
  const [clearModalOpen, setClearModalOpen] = useState(false);
  const [exportModalOpen, setExportModalOpen] = useState(false);

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
  
  const canExport = libraries.length > 0 && selectedLibraryId;

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
        <button 
          className="btn btn--primary"
          onClick={() => setExportModalOpen(true)}
          disabled={!canExport}
          title={canExport ? 'Export selected library' : 'Select a library first'}
        >
          <Upload className="icon sm" />
          Export
        </button>
      </div>
      
      <ImportModal isOpen={importModalOpen} onClose={() => setImportModalOpen(false)} />
      <ClearWorkspaceModal isOpen={clearModalOpen} onClose={() => setClearModalOpen(false)} />
      <ExportModal 
        isOpen={exportModalOpen} 
        onClose={() => setExportModalOpen(false)} 
        libraryId={selectedLibraryId}
      />
    </header>
  );
}
