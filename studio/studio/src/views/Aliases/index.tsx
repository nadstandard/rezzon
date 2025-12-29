import { useState, useMemo } from 'react';
import { 
  ChevronDown, Package, Box, Link2Off, ArrowRight, ExternalLink, 
  AlertTriangle, RefreshCw, Eye, Link, Check, Search, X,
  ArrowDown
} from 'lucide-react';
import { useAppStore } from '../../stores/appStore';
import { 
  collectAliases, 
  calculateAliasStats, 
  findConnectedExternalLibraries,
  resolveAliasValue 
} from '../../utils/aliasUtils';
import { DisconnectModal, RestoreModal } from '../../components/ui/AliasModals';
import type { AliasInfo, DisconnectedLibrary, Library } from '../../types';

export function AliasesView() {
  const libraries = useAppStore((state) => state.libraries);
  const disconnectedLibraries = useAppStore((state) => state.disconnectedLibraries);
  const searchQuery = useAppStore((state) => state.ui.searchQuery);
  
  const [activeTab, setActiveTab] = useState<'all' | 'internal' | 'external' | 'broken'>('all');
  const [selectedLibraryId, setSelectedLibraryId] = useState<string | null>(null);
  const [selectedAliases, setSelectedAliases] = useState<string[]>([]);
  const [selectedAliasDetail, setSelectedAliasDetail] = useState<AliasInfo | null>(null);
  
  // Modals
  const [disconnectModal, setDisconnectModal] = useState<{
    isOpen: boolean;
    libraryName: string;
    aliasCount: number;
  } | null>(null);
  
  const [restoreModal, setRestoreModal] = useState<{
    isOpen: boolean;
    library: DisconnectedLibrary;
  } | null>(null);

  // Aktywna biblioteka
  const activeLibrary = useMemo(() => {
    if (selectedLibraryId) {
      return libraries.find((l) => l.id === selectedLibraryId);
    }
    return libraries.find((l) => l.isMain) || libraries[0];
  }, [libraries, selectedLibraryId]);

  // Oblicz statystyki dla każdej biblioteki
  const libraryStats = useMemo(() => {
    const stats = new Map<string, { internal: number; external: number; broken: number }>();
    for (const lib of libraries) {
      stats.set(lib.id, calculateAliasStats(lib, libraries));
    }
    return stats;
  }, [libraries]);

  // Całkowite statystyki
  const totalStats = useMemo(() => {
    const total = { internal: 0, external: 0, broken: 0, disconnected: disconnectedLibraries.length };
    for (const stats of libraryStats.values()) {
      total.internal += stats.internal;
      total.external += stats.external;
      total.broken += stats.broken;
    }
    return total;
  }, [libraryStats, disconnectedLibraries]);

  // Aliasy dla aktywnej biblioteki
  const aliases = useMemo(() => {
    if (!activeLibrary) return [];
    return collectAliases(activeLibrary, libraries);
  }, [activeLibrary, libraries]);

  // Filtrowane aliasy
  const filteredAliases = useMemo(() => {
    let result = aliases;
    
    if (activeTab !== 'all') {
      result = result.filter((a) => a.type === activeTab);
    }
    
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      result = result.filter((a) => 
        a.sourceVariablePath.toLowerCase().includes(q) ||
        a.targetVariablePath.toLowerCase().includes(q)
      );
    }
    
    const seen = new Map<string, AliasInfo>();
    for (const alias of result) {
      const key = `${alias.sourceVariableId}-${alias.targetVariableId}`;
      if (!seen.has(key)) {
        seen.set(key, alias);
      }
    }
    
    return Array.from(seen.values());
  }, [aliases, activeTab, searchQuery]);

  // Connected external libraries
  const connectedExternals = useMemo(() => {
    if (!activeLibrary) return [];
    return findConnectedExternalLibraries(activeLibrary, libraries);
  }, [activeLibrary, libraries]);

  // Tab counts
  const tabCounts = useMemo(() => {
    const stats = activeLibrary ? libraryStats.get(activeLibrary.id) : null;
    return {
      all: (stats?.internal || 0) + (stats?.external || 0),
      internal: stats?.internal || 0,
      external: stats?.external || 0,
      broken: stats?.broken || 0,
    };
  }, [activeLibrary, libraryStats]);

  const handleDisconnect = (libraryName: string, aliasCount: number) => {
    setDisconnectModal({ isOpen: true, libraryName, aliasCount });
  };

  const handleRestore = (lib: DisconnectedLibrary) => {
    setRestoreModal({ isOpen: true, library: lib });
  };

  const toggleAliasSelection = (aliasKey: string) => {
    setSelectedAliases((prev) =>
      prev.includes(aliasKey) ? prev.filter((k) => k !== aliasKey) : [...prev, aliasKey]
    );
  };

  const selectAllAliases = () => {
    if (selectedAliases.length === filteredAliases.length) {
      setSelectedAliases([]);
    } else {
      setSelectedAliases(filteredAliases.map((a) => `${a.sourceVariableId}-${a.targetVariableId}`));
    }
  };

  const isEmpty = libraries.length === 0;
  const hasNoAliases = !isEmpty && filteredAliases.length === 0;

  return (
    <>
      {/* Sidebar */}
      <aside className="sidebar" style={{ width: 260 }}>
        <div className="sidebar__scroll">
          {/* Summary */}
          <div className="sidebar__section">
            <div className="sidebar__content" style={{ paddingTop: '12px' }}>
              <div className="summary-card">
                <div className="summary-card__title">Alias Summary</div>
                <div className="summary-row">
                  <span className="summary-row__label"><span className="dot dot--internal" /> Internal</span>
                  <span className="summary-row__value">{totalStats.internal.toLocaleString()}</span>
                </div>
                <div className="summary-row">
                  <span className="summary-row__label"><span className="dot dot--external" /> External</span>
                  <span className="summary-row__value">{totalStats.external.toLocaleString()}</span>
                </div>
                <div className="summary-row">
                  <span className="summary-row__label"><span className="dot dot--broken" /> Broken</span>
                  <span className="summary-row__value">{totalStats.broken}</span>
                </div>
                <div className="summary-row">
                  <span className="summary-row__label"><span className="dot dot--disconnected" /> Disconnected</span>
                  <span className="summary-row__value">{totalStats.disconnected}</span>
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
              {libraries.map((lib) => {
                const stats = libraryStats.get(lib.id);
                const isActive = activeLibrary?.id === lib.id;
                return (
                  <div key={lib.id} className={`lib-card ${isActive ? 'active' : ''}`} onClick={() => setSelectedLibraryId(lib.id)}>
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
                      <div className="lib-stat"><span className="dot dot--internal" /> {stats?.internal || 0}</div>
                      <div className="lib-stat"><span className="dot dot--external" /> {stats?.external || 0}</div>
                      <div className="lib-stat"><span className="dot dot--broken" /> {stats?.broken || 0}</div>
                    </div>
                  </div>
                );
              })}
              {libraries.length === 0 && (
                <div style={{ color: 'var(--text-muted)', padding: '10px' }}>No libraries loaded</div>
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
              {disconnectedLibraries.map((lib) => (
                <div key={lib.libraryName} className="lib-card lib-card--disconnected">
                  <div className="lib-card__header">
                    <div className="lib-card__icon"><Link2Off className="icon" /></div>
                    <div className="lib-card__info">
                      <div className="lib-card__name">{lib.libraryName}</div>
                      <div className="lib-card__type">{lib.previousAliases.length} aliases resolved</div>
                    </div>
                  </div>
                  <button className="restore-btn" onClick={() => handleRestore(lib)}>
                    <RefreshCw className="icon sm" /> Restore
                  </button>
                </div>
              ))}
              {disconnectedLibraries.length === 0 && (
                <div style={{ color: 'var(--text-muted)', padding: '10px' }}>No disconnected libraries</div>
              )}
            </div>
          </div>
        </div>
      </aside>

      {/* Main */}
      <main className="main">
        {isEmpty ? (
          <div className="empty-state" style={{ margin: '40px auto', maxWidth: 400 }}>
            <div className="empty-state__icon"><Link className="icon" style={{ width: 32, height: 32 }} /></div>
            <div className="empty-state__title">No libraries loaded</div>
            <div className="empty-state__description">Import a Figma Variables file to view and manage aliases.</div>
          </div>
        ) : (
          <>
            {/* Connected External Libraries */}
            {connectedExternals.length > 0 && (
              <div className="connected-section">
                <div className="connected-section__header">
                  <span className="connected-section__title">Connected External Libraries</span>
                </div>
                <div className="connected-grid">
                  {connectedExternals.map((ext) => (
                    <div key={ext.libraryId} className="ext-lib-card">
                      <div className="ext-lib-card__icon"><Box className="icon sm" /></div>
                      <div className="ext-lib-card__info">
                        <div className="ext-lib-card__name">{ext.libraryName}</div>
                        <div className="ext-lib-card__count">{ext.aliasCount} aliases</div>
                      </div>
                      <div className="ext-lib-card__actions">
                        <button className="action-btn"><Eye className="icon sm" /></button>
                        <button className="action-btn action-btn--danger" onClick={() => handleDisconnect(ext.libraryName, ext.aliasCount)}>
                          <Link2Off className="icon sm" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Toolbar with Tabs */}
            <div className="toolbar">
              <div className="tabs">
                <div className={`tab ${activeTab === 'all' ? 'active' : ''}`} onClick={() => setActiveTab('all')}>
                  All <span className="tab-badge badge--neutral">{tabCounts.all.toLocaleString()}</span>
                </div>
                <div className={`tab ${activeTab === 'internal' ? 'active' : ''}`} onClick={() => setActiveTab('internal')}>
                  <ArrowRight className="icon sm" /> Internal <span className="tab-badge tab-badge--green">{tabCounts.internal.toLocaleString()}</span>
                </div>
                <div className={`tab ${activeTab === 'external' ? 'active' : ''}`} onClick={() => setActiveTab('external')}>
                  <ExternalLink className="icon sm" /> External <span className="tab-badge tab-badge--orange">{tabCounts.external.toLocaleString()}</span>
                </div>
                <div className={`tab ${activeTab === 'broken' ? 'active' : ''}`} onClick={() => setActiveTab('broken')}>
                  <AlertTriangle className="icon sm" /> Broken <span className="tab-badge tab-badge--red">{tabCounts.broken}</span>
                </div>
              </div>
              <div className="toolbar__spacer" />
              {selectedAliases.length > 0 && (
                <button className="btn btn--ghost">
                  <Link2Off className="icon sm" /> Disconnect Selected ({selectedAliases.length})
                </button>
              )}
            </div>

            {/* Table */}
            <div className="table-wrap">
              {hasNoAliases ? (
                <EmptyAliasState tab={activeTab} searchQuery={searchQuery} />
              ) : (
                <table className="table alias-table">
                  <thead>
                    <tr>
                      <th className="col-check">
                        <div className={`checkbox ${selectedAliases.length === filteredAliases.length && filteredAliases.length > 0 ? 'checked' : selectedAliases.length > 0 ? 'indeterminate' : ''}`} onClick={selectAllAliases}>
                          {selectedAliases.length === filteredAliases.length && filteredAliases.length > 0 && <Check className="icon xs" />}
                        </div>
                      </th>
                      <th className="col-source">Source Variable</th>
                      <th style={{ width: 40 }}></th>
                      <th className="col-target">Target Variable</th>
                      <th className="col-type">Type</th>
                      <th className="col-actions">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredAliases.map((alias) => {
                      const key = `${alias.sourceVariableId}-${alias.targetVariableId}`;
                      const isSelected = selectedAliases.includes(key);
                      return (
                        <tr key={key} className={`alias-row ${isSelected ? 'selected' : ''}`} onClick={() => setSelectedAliasDetail(alias)}>
                          <td onClick={(e) => e.stopPropagation()}>
                            <div className={`checkbox ${isSelected ? 'checked' : ''}`} onClick={() => toggleAliasSelection(key)}>
                              {isSelected && <Check className="icon xs" />}
                            </div>
                          </td>
                          <td>
                            <div className="alias-path">
                              <div className={`alias-path__icon alias-path__icon--${alias.type}`}>
                                {alias.type === 'broken' ? <AlertTriangle className="icon sm" /> : alias.type === 'external' ? <ExternalLink className="icon sm" /> : <ArrowRight className="icon sm" />}
                              </div>
                              <div className="alias-path__text">
                                <span className="alias-path__name">{alias.sourceVariablePath.split('/').pop()}</span>
                                <span className="alias-path__path">{getParentPath(alias.sourceVariablePath)}</span>
                              </div>
                            </div>
                          </td>
                          <td><div className="alias-arrow"><ArrowRight className="icon" /></div></td>
                          <td>
                            <div className="alias-path">
                              <div className="alias-path__text">
                                <span className="alias-path__name">
                                  {alias.type === 'broken' ? <span style={{ color: 'var(--red)', fontStyle: 'italic' }}>Missing</span> : alias.targetVariablePath.split('/').pop()}
                                </span>
                                <span className="alias-path__path">
                                  {alias.type === 'broken' ? 'Variable deleted' : alias.type === 'external' ? `${alias.targetLibrary} / ${getParentPath(alias.targetVariablePath)}` : getParentPath(alias.targetVariablePath)}
                                </span>
                              </div>
                            </div>
                          </td>
                          <td><span className={`badge badge--${alias.type}`}>{alias.type.charAt(0).toUpperCase() + alias.type.slice(1)}</span></td>
                          <td onClick={(e) => e.stopPropagation()}>
                            <div className="action-btns">
                              <button className="action-btn"><Eye className="icon sm" /></button>
                              <button className="action-btn action-btn--danger"><Link2Off className="icon sm" /></button>
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              )}
            </div>
          </>
        )}
      </main>

      {/* Detail Panel */}
      {selectedAliasDetail && (
        <AliasDetailPanel alias={selectedAliasDetail} library={activeLibrary!} allLibraries={libraries} onClose={() => setSelectedAliasDetail(null)} />
      )}

      {/* Modals */}
      {disconnectModal && (
        <DisconnectModal
          isOpen={disconnectModal.isOpen}
          onClose={() => setDisconnectModal(null)}
          onDisconnect={(modeId) => { console.log('Disconnect', disconnectModal.libraryName, modeId); setDisconnectModal(null); }}
          libraryName={disconnectModal.libraryName}
          aliasCount={disconnectModal.aliasCount}
          modes={activeLibrary ? Object.values(activeLibrary.file.variableCollections)[0]?.modes || [] : []}
        />
      )}

      {restoreModal && (
        <RestoreModal
          isOpen={restoreModal.isOpen}
          onClose={() => setRestoreModal(null)}
          onRestore={() => { console.log('Restore', restoreModal.library.libraryName); setRestoreModal(null); }}
          disconnectedLibrary={restoreModal.library}
          willBeBroken={0}
        />
      )}
    </>
  );
}

// ==================== SUB-COMPONENTS ====================

function EmptyAliasState({ tab, searchQuery }: { tab: string; searchQuery: string }) {
  if (searchQuery) {
    return (
      <div className="empty-state" style={{ margin: '40px auto', maxWidth: 400 }}>
        <div className="empty-state__icon"><Search className="icon" style={{ width: 32, height: 32 }} /></div>
        <div className="empty-state__title">No aliases found</div>
        <div className="empty-state__description">No aliases match "{searchQuery}".</div>
      </div>
    );
  }
  if (tab === 'broken') {
    return (
      <div className="empty-state" style={{ margin: '40px auto', maxWidth: 400 }}>
        <div className="empty-state__icon" style={{ background: 'var(--green-bg)', color: 'var(--green)' }}>
          <Check className="icon" style={{ width: 32, height: 32 }} />
        </div>
        <div className="empty-state__title">All aliases healthy</div>
        <div className="empty-state__description">No broken aliases in this library.</div>
      </div>
    );
  }
  if (tab === 'external') {
    return (
      <div className="empty-state" style={{ margin: '40px auto', maxWidth: 400 }}>
        <div className="empty-state__icon"><ExternalLink className="icon" style={{ width: 32, height: 32 }} /></div>
        <div className="empty-state__title">No external aliases</div>
        <div className="empty-state__description">This library doesn't reference external libraries.</div>
      </div>
    );
  }
  return (
    <div className="empty-state" style={{ margin: '40px auto', maxWidth: 400 }}>
      <div className="empty-state__icon"><Link className="icon" style={{ width: 32, height: 32 }} /></div>
      <div className="empty-state__title">No aliases yet</div>
      <div className="empty-state__description">Create aliases to link variables.</div>
    </div>
  );
}

function AliasDetailPanel({ alias, library, allLibraries, onClose }: { alias: AliasInfo; library: Library; allLibraries: Library[]; onClose: () => void }) {
  const sourceVariable = library.file.variables[alias.sourceVariableId];
  let targetVariable = library.file.variables[alias.targetVariableId];
  if (!targetVariable) {
    for (const lib of allLibraries) {
      targetVariable = lib.file.variables[alias.targetVariableId];
      if (targetVariable) break;
    }
  }
  const collection = Object.values(library.file.variableCollections).find((c) => c.variableIds.includes(alias.sourceVariableId));
  const modes = collection?.modes || [];

  return (
    <aside className="panel" style={{ width: 300 }}>
      <div className="panel__header">
        <span className="panel__title">Alias Details</span>
        <button className="panel__close" onClick={onClose}><X className="icon sm" /></button>
      </div>
      <div className="panel__body">
        {alias.type === 'broken' && (
          <div className="detail-group">
            <div className="warning-box">
              <AlertTriangle className="icon sm" style={{ color: 'var(--orange)', flexShrink: 0 }} />
              <div>
                <div style={{ fontWeight: 500, marginBottom: 2 }}>Broken alias</div>
                <div style={{ fontSize: 11, color: 'var(--text-secondary)' }}>Target variable no longer exists.</div>
              </div>
            </div>
          </div>
        )}

        <div className="detail-group">
          <div className="detail-label">Source → Target</div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            <div className="alias-indicator">
              <div className={`alias-indicator__icon alias-indicator__icon--${alias.type}`}>
                {alias.type === 'external' ? <ExternalLink className="icon sm" /> : alias.type === 'broken' ? <AlertTriangle className="icon sm" /> : <ArrowRight className="icon sm" />}
              </div>
              <div style={{ flex: 1 }}>
                <div style={{ fontWeight: 500 }}>{alias.sourceVariablePath.split('/').pop()}</div>
                <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>{getParentPath(alias.sourceVariablePath)}</div>
              </div>
            </div>
            <div style={{ display: 'flex', justifyContent: 'center' }}><ArrowDown className="icon sm" style={{ color: 'var(--text-muted)' }} /></div>
            <div className="alias-indicator" style={alias.type === 'broken' ? { opacity: 0.6, border: '1px dashed var(--red)', background: 'var(--red-bg)' } : {}}>
              <div className={`alias-indicator__icon alias-indicator__icon--${alias.type}`}>
                {alias.type === 'broken' ? <X className="icon sm" /> : alias.type === 'external' ? <ExternalLink className="icon sm" /> : <ArrowRight className="icon sm" />}
              </div>
              <div style={{ flex: 1 }}>
                <div style={{ fontWeight: 500, ...(alias.type === 'broken' ? { textDecoration: 'line-through', color: 'var(--text-muted)' } : {}) }}>
                  {alias.type === 'broken' ? 'Unknown' : alias.targetVariablePath.split('/').pop()}
                </div>
                <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>{alias.type === 'broken' ? 'Deleted' : alias.targetLibrary}</div>
              </div>
              <span className={`badge badge--${alias.type}`} style={{ fontSize: 10 }}>{alias.type}</span>
            </div>
          </div>
        </div>

        <div className="detail-group">
          <div className="detail-label">Type</div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <div className="type-badge" style={{ width: 20, height: 20 }}>#</div>
            <span>{sourceVariable?.resolvedType || 'Unknown'}</span>
          </div>
        </div>

        {modes.length > 0 && alias.type !== 'broken' && (
          <div className="detail-group">
            <div className="detail-label">Resolved values</div>
            <div className="modes-list">
              {modes.map((mode) => {
                const value = sourceVariable?.valuesByMode[mode.modeId];
                const resolved = value ? resolveAliasValue(value, mode.modeId, library, allLibraries) : null;
                return (
                  <div key={mode.modeId} className="mode-row">
                    <span className="mode-row__name">{mode.name}</span>
                    <span className="mode-row__val">{resolved?.value !== undefined ? String(resolved.value) : '—'}</span>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>
      <div style={{ padding: '12px 14px', borderTop: '1px solid var(--border)', display: 'flex', gap: 8 }}>
        {alias.type === 'broken' ? (
          <>
            <button className="btn btn--primary" style={{ flex: 1 }}><Link className="icon sm" /> Fix</button>
            <button className="btn btn--danger"><Link2Off className="icon sm" /></button>
          </>
        ) : (
          <>
            <button className="btn btn--ghost" style={{ flex: 1 }}><Eye className="icon sm" /> {alias.type === 'external' ? 'View' : 'Change'}</button>
            <button className="btn btn--ghost" style={{ color: 'var(--red)' }}><Link2Off className="icon sm" /></button>
          </>
        )}
      </div>
    </aside>
  );
}

function getParentPath(fullPath: string): string {
  const parts = fullPath.split('/');
  parts.pop();
  return parts.join(' / ') || '';
}
