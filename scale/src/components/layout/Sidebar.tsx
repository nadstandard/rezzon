import { useState, useMemo } from 'react';
import { Icon } from '../Icons';
import { useGridStore } from '../../store';
import { ViewportModal, ConfirmDeleteModal } from '../Modals';
import type { Viewport } from '../../types/grid';
import { calculateFolderTokenCount, type FolderGeneratorContext } from '../../engine/generator';
import { SortableList } from '../common/SortableList';

export function Sidebar() {
  const {
    viewports,
    styles,
    selectedViewportId,
    selectViewport,
    addViewport,
    updateViewport,
    removeViewport,
    reorderViewports,
    outputFolders,
    modifiers,
    ratioFamilies,
    responsiveVariants,
    baseParameters,
    computedParameters,
  } = useGridStore();

  // Modal states
  const [viewportModalOpen, setViewportModalOpen] = useState(false);
  const [editingViewport, setEditingViewport] = useState<{ id: string; name: string; width: number; icon: Viewport['icon'] } | null>(null);
  const [deleteViewportId, setDeleteViewportId] = useState<string | null>(null);

  // Calculate total tokens from outputFolders
  const totalTokens = useMemo(() => {
    const ctx: FolderGeneratorContext = {
      styles, viewports, baseParameters, computedParameters,
      modifiers, ratioFamilies, responsiveVariants,
    };
    return outputFolders.reduce((sum, f) => {
      if (!f.path) return sum;
      return sum + calculateFolderTokenCount(f, ctx);
    }, 0);
  }, [outputFolders, styles, viewports, baseParameters, computedParameters, modifiers, ratioFamilies, responsiveVariants]);

  // Handlers
  const handleAddViewport = (data: { name: string; width: number; icon: string }) => {
    addViewport({
      name: data.name,
      width: data.width,
      icon: data.icon as Viewport['icon'],
    });
  };

  const handleEditViewport = (data: { name: string; width: number; icon: string }) => {
    if (editingViewport) {
      updateViewport(editingViewport.id, {
        name: data.name,
        width: data.width,
        icon: data.icon as Viewport['icon'],
      });
      setEditingViewport(null);
    }
  };

  const handleDeleteViewport = () => {
    if (deleteViewportId) {
      removeViewport(deleteViewportId);
      setDeleteViewportId(null);
    }
  };

  const openEditModal = (vp: typeof viewports[0], e: React.MouseEvent) => {
    e.stopPropagation();
    setEditingViewport({ id: vp.id, name: vp.name, width: vp.width, icon: vp.icon });
    setViewportModalOpen(true);
  };

  const openDeleteModal = (vpId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setDeleteViewportId(vpId);
  };

  const viewportToDelete = viewports.find(vp => vp.id === deleteViewportId);

  return (
    <aside className="sidebar">
      <div className="sidebar__scroll">
        {/* Viewports section */}
        <div className="sidebar__section">
          <div className="sidebar__header">
            <Icon name="chev-d" size="xs" className="sidebar__chevron" />
            <span className="sidebar__title">Viewports</span>
            <button 
              className="action-btn" 
              style={{ width: 20, height: 20, marginLeft: 'auto' }}
              onClick={() => { setEditingViewport(null); setViewportModalOpen(true); }}
              title="Add viewport"
            >
              <Icon name="plus" size="xs" />
            </button>
          </div>
          <div className="sidebar__content">
            <SortableList
              items={viewports}
              onReorder={reorderViewports}
              renderItem={(viewport) => (
                <div
                  className={`viewport-card ${selectedViewportId === viewport.id ? 'active' : ''}`}
                  onClick={() => selectViewport(viewport.id)}
                >
                  <div className="drag-handle" onClick={(e) => e.stopPropagation()}>
                    <svg width="12" height="12" viewBox="0 0 24 24" fill="currentColor">
                      <circle cx="9" cy="5" r="2"/>
                      <circle cx="15" cy="5" r="2"/>
                      <circle cx="9" cy="12" r="2"/>
                      <circle cx="15" cy="12" r="2"/>
                      <circle cx="9" cy="19" r="2"/>
                      <circle cx="15" cy="19" r="2"/>
                    </svg>
                  </div>
                  <Icon name={viewport.icon} size="sm" style={{ color: 'var(--text-muted)' }} />
                  <span className="viewport-card__size">{viewport.width}</span>
                  <span className="viewport-card__name">{viewport.name}</span>
                  <span className="viewport-card__styles">{styles.length} styles</span>
                  <div className="viewport-card__actions">
                    <button 
                      className="action-btn" 
                      onClick={(e) => openEditModal(viewport, e)}
                      title="Edit viewport"
                    >
                      <Icon name="edit" size="xs" />
                    </button>
                    <button 
                      className="action-btn action-btn--danger" 
                      onClick={(e) => openDeleteModal(viewport.id, e)}
                      title="Delete viewport"
                      disabled={viewports.length <= 1}
                    >
                      <Icon name="trash" size="xs" />
                    </button>
                  </div>
                </div>
              )}
            />

            {/* Add viewport */}
            <div className="add-row" onClick={() => { setEditingViewport(null); setViewportModalOpen(true); }}>
              <div className="add-row__icon">
                <Icon name="plus" size="xs" />
              </div>
              <span>Add viewport</span>
            </div>
          </div>
        </div>

        {/* Viewport Modal */}
        <ViewportModal
          isOpen={viewportModalOpen}
          onClose={() => { setViewportModalOpen(false); setEditingViewport(null); }}
          onSave={editingViewport ? handleEditViewport : handleAddViewport}
          editData={editingViewport}
        />

        {/* Delete Confirmation Modal */}
        <ConfirmDeleteModal
          isOpen={!!deleteViewportId}
          onClose={() => setDeleteViewportId(null)}
          onConfirm={handleDeleteViewport}
          title="Delete Viewport"
          message="Are you sure you want to delete this viewport? This action cannot be undone."
          itemName={viewportToDelete?.name}
        />

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
