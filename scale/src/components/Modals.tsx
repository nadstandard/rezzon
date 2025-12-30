import { useState, useEffect } from 'react';
import { Icon } from './Icons';

// ============================================
// MODAL OVERLAY
// ============================================

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  children: React.ReactNode;
  footer?: React.ReactNode;
}

export function Modal({ isOpen, onClose, title, children, footer }: ModalProps) {
  useEffect(() => {
    const handleEsc = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    if (isOpen) {
      document.addEventListener('keydown', handleEsc);
    }
    return () => document.removeEventListener('keydown', handleEsc);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div className="modal-overlay open" onClick={onClose}>
      <div className="modal" onClick={(e) => e.stopPropagation()}>
        <div className="modal__header">
          <span className="modal__title">{title}</span>
          <button className="modal__close" onClick={onClose}>
            <Icon name="x" />
          </button>
        </div>
        <div className="modal__body">{children}</div>
        {footer && <div className="modal__footer">{footer}</div>}
      </div>
    </div>
  );
}

// ============================================
// CONFIRM DELETE MODAL
// ============================================

interface ConfirmDeleteModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
  message: string;
  itemName?: string;
}

export function ConfirmDeleteModal({ 
  isOpen, 
  onClose, 
  onConfirm, 
  title, 
  message,
  itemName 
}: ConfirmDeleteModalProps) {
  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={title}
      footer={
        <>
          <button className="btn btn--ghost" onClick={onClose}>Cancel</button>
          <button className="btn btn--danger" onClick={() => { onConfirm(); onClose(); }}>
            <Icon name="trash" size="sm" />
            Delete
          </button>
        </>
      }
    >
      <p style={{ marginBottom: 12 }}>{message}</p>
      {itemName && (
        <div className="modal__info">
          <div className="modal__info-row">
            <span className="modal__info-label">Name</span>
            <span className="modal__info-value">{itemName}</span>
          </div>
        </div>
      )}
    </Modal>
  );
}

// ============================================
// ADD/EDIT VIEWPORT MODAL
// ============================================

interface ViewportModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (viewport: { name: string; width: number; icon: string }) => void;
  editData?: { name: string; width: number; icon: string } | null;
}

export function ViewportModal({ isOpen, onClose, onSave, editData }: ViewportModalProps) {
  const [name, setName] = useState('');
  const [width, setWidth] = useState(1440);
  const [icon, setIcon] = useState('monitor');

  useEffect(() => {
    if (editData) {
      setName(editData.name);
      setWidth(editData.width);
      setIcon(editData.icon);
    } else {
      setName('');
      setWidth(1440);
      setIcon('monitor');
    }
  }, [editData, isOpen]);

  const handleSubmit = () => {
    if (!name.trim() || width <= 0) return;
    onSave({ name: name.trim(), width, icon });
    onClose();
  };

  const isEdit = !!editData;

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={isEdit ? 'Edit Viewport' : 'Add Viewport'}
      footer={
        <>
          <button className="btn btn--ghost" onClick={onClose}>Cancel</button>
          <button className="btn btn--primary" onClick={handleSubmit} disabled={!name.trim()}>
            <Icon name={isEdit ? 'check' : 'plus'} size="sm" />
            {isEdit ? 'Save' : 'Add Viewport'}
          </button>
        </>
      }
    >
      <div className="modal__label">Name</div>
      <input
        type="text"
        className="modal__input"
        placeholder="e.g., Desktop, Laptop, Tablet, Mobile"
        value={name}
        onChange={(e) => setName(e.target.value)}
        autoFocus
      />

      <div className="modal__label" style={{ marginTop: 16 }}>Width (px)</div>
      <input
        type="number"
        className="modal__input"
        placeholder="1440"
        value={width}
        onChange={(e) => setWidth(parseInt(e.target.value) || 0)}
        min={1}
      />

      <div className="modal__label" style={{ marginTop: 16 }}>Icon</div>
      <select
        className="modal__select"
        value={icon}
        onChange={(e) => setIcon(e.target.value)}
      >
        <option value="monitor">Monitor (Desktop)</option>
        <option value="laptop">Laptop</option>
        <option value="tablet">Tablet</option>
        <option value="phone">Phone (Mobile)</option>
      </select>

      {/* Quick presets */}
      <div className="modal__label" style={{ marginTop: 16 }}>Quick presets</div>
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
        {[
          { name: 'Desktop', width: 1920, icon: 'monitor' },
          { name: 'Laptop', width: 1366, icon: 'laptop' },
          { name: 'Tablet', width: 768, icon: 'tablet' },
          { name: 'Mobile', width: 390, icon: 'phone' },
        ].map((preset) => (
          <button
            key={preset.name}
            className="btn btn--ghost"
            style={{ padding: '4px 8px', fontSize: 11 }}
            onClick={() => {
              setName(preset.name);
              setWidth(preset.width);
              setIcon(preset.icon);
            }}
          >
            {preset.name} ({preset.width}px)
          </button>
        ))}
      </div>
    </Modal>
  );
}

// ============================================
// ADD/EDIT STYLE MODAL
// ============================================

interface StyleModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (style: { name: string; columns: number }) => void;
  editData?: { name: string; columns: number } | null;
}

export function StyleModal({ isOpen, onClose, onSave, editData }: StyleModalProps) {
  const [name, setName] = useState('');
  const [columns, setColumns] = useState(12);

  useEffect(() => {
    if (editData) {
      setName(editData.name);
      setColumns(editData.columns);
    } else {
      setName('');
      setColumns(12);
    }
  }, [editData, isOpen]);

  const handleSubmit = () => {
    if (!name.trim() || columns <= 0) return;
    onSave({ name: name.trim(), columns });
    onClose();
  };

  const isEdit = !!editData;

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={isEdit ? 'Edit Style' : 'Add Style'}
      footer={
        <>
          <button className="btn btn--ghost" onClick={onClose}>Cancel</button>
          <button className="btn btn--primary" onClick={handleSubmit} disabled={!name.trim()}>
            <Icon name={isEdit ? 'check' : 'plus'} size="sm" />
            {isEdit ? 'Save' : 'Add Style'}
          </button>
        </>
      }
    >
      <div className="modal__label">Name</div>
      <input
        type="text"
        className="modal__input"
        placeholder="e.g., Standard, Wide, Compact"
        value={name}
        onChange={(e) => setName(e.target.value)}
        autoFocus
      />

      <div className="modal__label" style={{ marginTop: 16 }}>Number of Columns</div>
      <input
        type="number"
        className="modal__input"
        placeholder="12"
        value={columns}
        onChange={(e) => setColumns(parseInt(e.target.value) || 0)}
        min={1}
        max={24}
      />

      {/* Quick presets */}
      <div className="modal__label" style={{ marginTop: 16 }}>Quick presets</div>
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
        {[4, 6, 8, 10, 12, 16].map((cols) => (
          <button
            key={cols}
            className="btn btn--ghost"
            style={{ padding: '4px 8px', fontSize: 11 }}
            onClick={() => setColumns(cols)}
          >
            {cols} columns
          </button>
        ))}
      </div>
      <p className="modal__hint">
        Each style can have different number of columns. Values will be calculated separately.
      </p>
    </Modal>
  );
}

// ============================================
// ADD BASE PARAMETER MODAL
// ============================================

interface AddBaseParameterModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (param: { name: string; defaultValue: number }) => void;
  existingNames: string[];
}

export function AddBaseParameterModal({ isOpen, onClose, onSave, existingNames }: AddBaseParameterModalProps) {
  const [name, setName] = useState('');
  const [defaultValue, setDefaultValue] = useState(0);
  const [error, setError] = useState('');

  useEffect(() => {
    if (isOpen) {
      setName('');
      setDefaultValue(0);
      setError('');
    }
  }, [isOpen]);

  const handleSubmit = () => {
    if (!name.trim()) return;
    // Check for duplicates
    if (existingNames.includes(name.trim())) {
      setError('Parameter with this name already exists');
      return;
    }
    onSave({ name: name.trim(), defaultValue });
    onClose();
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Add Base Parameter"
      footer={
        <>
          <button className="btn btn--ghost" onClick={onClose}>Cancel</button>
          <button className="btn btn--primary" onClick={handleSubmit} disabled={!name.trim()}>
            <Icon name="plus" size="sm" />
            Add Parameter
          </button>
        </>
      }
    >
      <div className="modal__label">Parameter Name</div>
      <input
        type="text"
        className="modal__input"
        placeholder="e.g., custom-offset, min-gap"
        value={name}
        onChange={(e) => {
          setName(e.target.value.toLowerCase().replace(/\s+/g, '-'));
          setError('');
        }}
        autoFocus
      />
      {error && <p style={{ color: 'var(--red)', fontSize: 11, marginTop: 4 }}>{error}</p>}
      <p className="modal__hint">Use lowercase with dashes, no spaces.</p>

      <div className="modal__label" style={{ marginTop: 16 }}>Default Value</div>
      <input
        type="number"
        className="modal__input"
        placeholder="0"
        value={defaultValue}
        onChange={(e) => setDefaultValue(parseFloat(e.target.value) || 0)}
      />
      <p className="modal__hint">
        This value will be applied to all existing styles. You can edit per-style values in the matrix.
      </p>
    </Modal>
  );
}
