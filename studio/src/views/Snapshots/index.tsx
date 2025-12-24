import { ChevronDown, Plus, Grid3X3, Link, RefreshCw, Eye, Trash2 } from 'lucide-react';
import { useAppStore } from '../../stores/appStore';

export function SnapshotsView() {
  const snapshots = useAppStore((state) => state.snapshots);
  const createSnapshot = useAppStore((state) => state.createSnapshot);

  const handleCreateSnapshot = () => {
    const name = prompt('Snapshot name:');
    if (name) {
      createSnapshot(name);
    }
  };

  return (
    <>
      {/* Sidebar */}
      <aside className="sidebar">
        <div className="sidebar__scroll">
          <div className="sidebar__section">
            <div className="sidebar__content" style={{ paddingTop: '12px' }}>
              <button 
                className="btn btn--primary btn--block"
                onClick={handleCreateSnapshot}
              >
                <Plus className="icon sm" />
                Create Snapshot
              </button>
            </div>
          </div>

          <div className="sidebar__section" style={{ flex: 1 }}>
            <div className="sidebar__header">
              <ChevronDown className="icon xs sidebar__chevron" />
              <span className="sidebar__title">Snapshots</span>
            </div>
            <div className="sidebar__content">
              {snapshots.length === 0 ? (
                <div style={{ color: 'var(--text-muted)', padding: '10px' }}>
                  No snapshots yet
                </div>
              ) : (
                snapshots.map((snapshot) => (
                  <div key={snapshot.id} className="snapshot-card">
                    <div className="snapshot-card__header">
                      <div>
                        <div className="snapshot-card__name">{snapshot.name}</div>
                        <div className="snapshot-card__date">
                          {new Date(snapshot.createdAt).toLocaleString()}
                        </div>
                      </div>
                      <span className={`snapshot-card__badge ${snapshot.type === 'auto' ? 'snapshot-card__badge--auto' : ''}`}>
                        {snapshot.type === 'auto' ? 'Auto' : 'Manual'}
                      </span>
                    </div>
                    <div className="snapshot-card__stats">
                      <span className="snapshot-stat">
                        <Grid3X3 className="icon xs" /> {snapshot.variableCount.toLocaleString()}
                      </span>
                      <span className="snapshot-stat">
                        <Link className="icon xs" /> {snapshot.aliasCount.toLocaleString()}
                      </span>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </aside>

      {/* Main */}
      <main className="main">
        <div className="snapshot-detail">
          {snapshots.length === 0 ? (
            <div style={{ 
              display: 'flex', 
              alignItems: 'center', 
              justifyContent: 'center', 
              height: '100%',
              color: 'var(--text-muted)'
            }}>
              Create a snapshot to get started
            </div>
          ) : (
            <>
              <div className="snapshot-detail__header">
                <div className="snapshot-detail__title">
                  {snapshots[0]?.name || 'Select a snapshot'}
                </div>
                <div className="snapshot-detail__actions">
                  <button className="btn btn--ghost">
                    <Eye className="icon sm" />
                    Compare
                  </button>
                  <button className="btn btn--primary">
                    <RefreshCw className="icon sm" />
                    Restore
                  </button>
                  <button className="btn btn--ghost" style={{ color: 'var(--red)' }}>
                    <Trash2 className="icon sm" />
                  </button>
                </div>
              </div>
              
              <div className="snapshot-info-grid">
                <div className="snapshot-info-item">
                  <div className="snapshot-info-item__label">Created</div>
                  <div className="snapshot-info-item__value">
                    {snapshots[0] ? new Date(snapshots[0].createdAt).toLocaleString() : '-'}
                  </div>
                </div>
                <div className="snapshot-info-item">
                  <div className="snapshot-info-item__label">Type</div>
                  <div className="snapshot-info-item__value">
                    {snapshots[0]?.type || '-'}
                  </div>
                </div>
                <div className="snapshot-info-item">
                  <div className="snapshot-info-item__label">Variables</div>
                  <div className="snapshot-info-item__value">
                    {snapshots[0]?.variableCount.toLocaleString() || '0'}
                  </div>
                </div>
                <div className="snapshot-info-item">
                  <div className="snapshot-info-item__label">Aliases</div>
                  <div className="snapshot-info-item__value">
                    {snapshots[0]?.aliasCount.toLocaleString() || '0'}
                  </div>
                </div>
              </div>
              
              {snapshots[0]?.description && (
                <div className="snapshot-description">
                  <div className="detail-label">Description</div>
                  <p>{snapshots[0].description}</p>
                </div>
              )}
            </>
          )}
        </div>
      </main>
    </>
  );
}
