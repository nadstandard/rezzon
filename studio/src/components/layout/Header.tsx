import { Link, useLocation } from 'react-router-dom';
import { Grid3X3, Link as LinkIcon, History, Download, Upload, Search } from 'lucide-react';
import { useAppStore } from '../../stores/appStore';

export function Header() {
  const location = useLocation();
  const searchQuery = useAppStore((state) => state.ui.searchQuery);
  const setSearchQuery = useAppStore((state) => state.setSearchQuery);

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
        />
      </div>
      
      <div className="header__actions">
        <button className="btn btn--ghost">
          <Download className="icon sm" />
          Import
        </button>
        <button className="btn btn--primary">
          <Upload className="icon sm" />
          Export
        </button>
      </div>
    </header>
  );
}
