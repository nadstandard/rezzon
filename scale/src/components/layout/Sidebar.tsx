import { Icon } from '../Icons';
import { useGridStore } from '../../store';

export function Sidebar() {
  const {
    viewports,
    selectedViewportId,
    selectViewport,
    outputLayers,
    modifiers,
    ratioFamilies,
    responsiveVariants,
  } = useGridStore();

  // Calculate total tokens
  const totalTokens = outputLayers.reduce((sum, layer) => sum + layer.tokenCount, 0);

  return (
    <aside className="sidebar">
      <div className="sidebar__scroll">
        {/* Viewports section */}
        <div className="sidebar__section">
          <div className="sidebar__header">
            <Icon name="chev-d" size="xs" className="sidebar__chevron" />
            <span className="sidebar__title">Viewports</span>
            <button className="action-btn" style={{ width: 20, height: 20, marginLeft: 'auto' }}>
              <Icon name="plus" size="xs" />
            </button>
          </div>
          <div className="sidebar__content">
            {viewports.map((viewport) => (
              <div
                key={viewport.id}
                className={`viewport-card ${selectedViewportId === viewport.id ? 'active' : ''}`}
                onClick={() => selectViewport(viewport.id)}
              >
                <Icon name={viewport.icon} size="sm" style={{ color: 'var(--text-muted)' }} />
                <span className="viewport-card__size">{viewport.width}</span>
                <span className="viewport-card__name">{viewport.name}</span>
                <span className="viewport-card__styles">4 styles</span>
              </div>
            ))}

            {/* Add viewport */}
            <div className="add-row">
              <div className="add-row__icon">
                <Icon name="plus" size="xs" />
              </div>
              <span>Add viewport</span>
            </div>
          </div>
        </div>

        {/* Output Layers section */}
        <div className="sidebar__section">
          <div className="sidebar__header">
            <Icon name="chev-d" size="xs" className="sidebar__chevron" />
            <span className="sidebar__title">Output Layers</span>
          </div>
          <div className="sidebar__content">
            {outputLayers.map((layer) => (
              <div key={layer.id} className="sidebar-item">
                <Icon name="layers" />
                <span className="sidebar-item__name">{layer.path}</span>
                <span className="sidebar-item__count">{layer.tokenCount}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Quick Stats */}
        <div className="sidebar__section">
          <div className="sidebar__header">
            <Icon name="chev-d" size="xs" className="sidebar__chevron" />
            <span className="sidebar__title">Statistics</span>
          </div>
          <div className="sidebar__content">
            <div className="summary-card" style={{ margin: 0 }}>
              <div className="summary-row">
                <span className="summary-row__label">Total tokens</span>
                <span className="summary-row__value">{totalTokens.toLocaleString()}</span>
              </div>
              <div className="summary-row">
                <span className="summary-row__label">Modifiers</span>
                <span className="summary-row__value">{modifiers.length}</span>
              </div>
              <div className="summary-row">
                <span className="summary-row__label">Ratio families</span>
                <span className="summary-row__value">{ratioFamilies.length}</span>
              </div>
              <div className="summary-row">
                <span className="summary-row__label">Responsive variants</span>
                <span className="summary-row__value">{responsiveVariants.length}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </aside>
  );
}
