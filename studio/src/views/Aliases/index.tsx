import { ChevronDown, Package, Box, Link2Off, ArrowRight, ExternalLink, AlertTriangle } from 'lucide-react';
import { useState } from 'react';
import { useAppStore } from '../../stores/appStore';

export function AliasesView() {
  const libraries = useAppStore((state) => state.libraries);
  const [activeTab, setActiveTab] = useState<'all' | 'internal' | 'external' | 'broken'>('internal');
  
  // TODO: Oblicz statystyki aliasów
  const stats = {
    internal: 5234,
    external: 1208,
    broken: 25,
    disconnected: 1,
  };

  return (
    <>
      {/* Sidebar */}
      <aside className="sidebar">
        <div className="sidebar__scroll">
          {/* Summary */}
          <div className="sidebar__section">
            <div className="sidebar__content" style={{ paddingTop: '12px' }}>
              <div className="summary-card">
                <div className="summary-card__title">Alias Summary</div>
                <div className="summary-row">
                  <span className="summary-row__label">
                    <span className="dot dot--internal" /> Internal
                  </span>
                  <span className="summary-row__value">{stats.internal.toLocaleString()}</span>
                </div>
                <div className="summary-row">
                  <span className="summary-row__label">
                    <span className="dot dot--external" /> External
                  </span>
                  <span className="summary-row__value">{stats.external.toLocaleString()}</span>
                </div>
                <div className="summary-row">
                  <span className="summary-row__label">
                    <span className="dot dot--broken" /> Broken
                  </span>
                  <span className="summary-row__value">{stats.broken}</span>
                </div>
                <div className="summary-row">
                  <span className="summary-row__label">
                    <span className="dot dot--disconnected" /> Disconnected
                  </span>
                  <span className="summary-row__value">{stats.disconnected}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Libraries */}
          <div className="sidebar__section">
            <div className="sidebar__header">
              <ChevronDown className="icon xs sidebar__chevron" />
              <span className="sidebar__title">Libraries</span>
            </div>
            <div className="sidebar__content">
              {libraries.map((lib) => (
                <div key={lib.id} className={`lib-card ${lib.isMain ? 'active' : ''}`}>
                  <div className="lib-card__header">
                    <div className="lib-card__icon">
                      {lib.isMain ? <Package className="icon" /> : <Box className="icon" />}
                    </div>
                    <div className="lib-card__info">
                      <div className="lib-card__name">{lib.name}</div>
                      <div className="lib-card__type">{lib.isMain ? 'Main library' : 'Companion'}</div>
                    </div>
                  </div>
                  <div className="lib-card__stats">
                    <div className="lib-stat"><span className="dot dot--internal" /> 0</div>
                    <div className="lib-stat"><span className="dot dot--external" /> 0</div>
                    <div className="lib-stat"><span className="dot dot--broken" /> 0</div>
                  </div>
                </div>
              ))}
              
              {libraries.length === 0 && (
                <div style={{ color: 'var(--text-muted)', padding: '10px' }}>
                  No libraries loaded
                </div>
              )}
            </div>
          </div>

          {/* Disconnected */}
          <div className="sidebar__section">
            <div className="sidebar__header">
              <ChevronDown className="icon xs sidebar__chevron" />
              <span className="sidebar__title">Disconnected</span>
            </div>
            <div className="sidebar__content">
              <div style={{ color: 'var(--text-muted)', padding: '10px' }}>
                No disconnected libraries
              </div>
            </div>
          </div>
        </div>
      </aside>

      {/* Main */}
      <main className="main">
        {/* Connected section */}
        <div className="connected-section">
          <div className="connected-section__header">
            <span className="connected-section__title">Connected External Libraries</span>
          </div>
          <div className="connected-grid">
            <div style={{ color: 'var(--text-muted)', padding: '20px' }}>
              No external libraries connected
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="toolbar">
          <div className="tabs">
            <div 
              className={`tab ${activeTab === 'all' ? 'active' : ''}`}
              onClick={() => setActiveTab('all')}
            >
              All
              <span className="tab-badge badge--neutral">
                {(stats.internal + stats.external).toLocaleString()}
              </span>
            </div>
            <div 
              className={`tab ${activeTab === 'internal' ? 'active' : ''}`}
              onClick={() => setActiveTab('internal')}
            >
              <ArrowRight className="icon sm" />
              Internal
              <span className="tab-badge tab-badge--green">{stats.internal.toLocaleString()}</span>
            </div>
            <div 
              className={`tab ${activeTab === 'external' ? 'active' : ''}`}
              onClick={() => setActiveTab('external')}
            >
              <ExternalLink className="icon sm" />
              External
              <span className="tab-badge tab-badge--orange">{stats.external.toLocaleString()}</span>
            </div>
            <div 
              className={`tab ${activeTab === 'broken' ? 'active' : ''}`}
              onClick={() => setActiveTab('broken')}
            >
              <AlertTriangle className="icon sm" />
              Broken
              <span className="tab-badge tab-badge--red">{stats.broken}</span>
            </div>
          </div>
          <div className="toolbar__spacer" />
          <button className="btn btn--ghost">
            <Link2Off className="icon sm" />
            Disconnect Selected
          </button>
        </div>

        {/* Table */}
        <div className="table-wrap">
          <div style={{ 
            display: 'flex', 
            alignItems: 'center', 
            justifyContent: 'center', 
            height: '100%',
            color: 'var(--text-muted)'
          }}>
            Import a library to view aliases
          </div>
        </div>
      </main>
    </>
  );
}
