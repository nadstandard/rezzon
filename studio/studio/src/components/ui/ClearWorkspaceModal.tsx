import { X, AlertTriangle, Trash2 } from 'lucide-react';
import { useAppStore } from '../../stores/appStore';

interface ClearWorkspaceModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function ClearWorkspaceModal({ isOpen, onClose }: ClearWorkspaceModalProps) {
  const clearLibraries = useAppStore((state) => state.clearLibraries);
  const libraries = useAppStore((state) => state.libraries);
  const snapshots = useAppStore((state) => state.snapshots);
  
  if (!isOpen) return null;
  
  const totalVariables = libraries.reduce((acc, lib) => acc + lib.variableCount, 0);

  const handleClear = () => {
    clearLibraries();
    onClose();
  };

  return (
    <div className="modal-overlay open">
      <div className="modal" style={{ width: '420px' }}>
        <div className="modal__header">
          <span className="modal__title">Clear Workspace</span>
          <button className="modal__close" onClick={onClose}>
            <X className="icon" />
          </button>
        </div>
        
        <div className="modal__body">
          <div
            style={{
              display: 'flex',
              alignItems: 'flex-start',
              gap: '12px',
              padding: '16px',
              background: 'var(--red-bg)',
              border: '1px solid rgba(239, 68, 68, 0.3)',
              borderRadius: '8px',
              marginBottom: '16px',
            }}
          >
            <AlertTriangle className="icon" style={{ color: 'var(--red)', flexShrink: 0, marginTop: '2px' }} />
            <div>
              <div style={{ color: 'var(--red)', fontWeight: 500, marginBottom: '4px' }}>
                This action cannot be undone
              </div>
              <div style={{ color: 'var(--text-secondary)', fontSize: '12px' }}>
                All imported data will be permanently removed from the workspace.
              </div>
            </div>
          </div>
          
          <div style={{ marginBottom: '16px' }}>
            <div className="modal__label">The following will be deleted:</div>
            <div
              style={{
                background: 'var(--bg-app)',
                borderRadius: '8px',
                padding: '12px',
                display: 'flex',
                flexDirection: 'column',
                gap: '8px',
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ color: 'var(--text-secondary)' }}>Libraries</span>
                <span style={{ fontWeight: 500 }}>{libraries.length}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ color: 'var(--text-secondary)' }}>Variables</span>
                <span style={{ fontWeight: 500 }}>{totalVariables.toLocaleString()}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ color: 'var(--text-secondary)' }}>Snapshots</span>
                <span style={{ fontWeight: 500 }}>{snapshots.length}</span>
              </div>
            </div>
          </div>
          
          {libraries.length === 0 && snapshots.length === 0 && (
            <div style={{ color: 'var(--text-muted)', textAlign: 'center', padding: '8px 0' }}>
              Workspace is already empty
            </div>
          )}
        </div>
        
        <div className="modal__footer">
          <button className="btn btn--ghost" onClick={onClose}>
            Cancel
          </button>
          <button
            className="btn btn--danger"
            onClick={handleClear}
            disabled={libraries.length === 0 && snapshots.length === 0}
            style={{
              background: 'var(--red)',
              borderColor: 'var(--red)',
            }}
          >
            <Trash2 className="icon sm" />
            Clear Workspace
          </button>
        </div>
      </div>
    </div>
  );
}
