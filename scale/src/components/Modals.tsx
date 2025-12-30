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

// ============================================
// ADD/EDIT MODIFIER MODAL
// ============================================

interface ModifierModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (modifier: { name: string; formula: string; applyFrom: number; applyTo: number; hasFullVariant: boolean }) => void;
  editData?: { name: string; formula: string; applyFrom: number; applyTo: number; hasFullVariant: boolean } | null;
  maxColumns?: number;
}

export function ModifierModal({ isOpen, onClose, onSave, editData, maxColumns = 12 }: ModifierModalProps) {
  const [name, setName] = useState('-w-half');
  const [formula, setFormula] = useState('+ column-width / 2');
  const [applyFrom, setApplyFrom] = useState(1);
  const [applyTo, setApplyTo] = useState(12);
  const [hasFullVariant, setHasFullVariant] = useState(false);

  useEffect(() => {
    if (editData) {
      setName(editData.name);
      setFormula(editData.formula);
      setApplyFrom(editData.applyFrom);
      setApplyTo(editData.applyTo);
      setHasFullVariant(editData.hasFullVariant);
    } else {
      setName('-w-half');
      setFormula('+ column-width / 2');
      setApplyFrom(1);
      setApplyTo(maxColumns);
      setHasFullVariant(false);
    }
  }, [editData, isOpen, maxColumns]);

  const handleSubmit = () => {
    if (!name.trim() || !formula.trim()) return;
    onSave({ 
      name: name.startsWith('-') ? name : `-${name}`,
      formula, 
      applyFrom, 
      applyTo, 
      hasFullVariant 
    });
    onClose();
  };

  const isEdit = !!editData;

  // Formula presets
  const formulaPresets = [
    { name: '-w-half', formula: '+ column-width / 2' },
    { name: '-w-margin', formula: '+ photo-margin' },
    { name: '-to-edge', formula: '+ margin-m' },
    { name: '-1G', formula: '+ gutter' },
    { name: '-2G', formula: '+ gutter * 2' },
  ];

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={isEdit ? 'Edit Modifier' : 'Add Modifier'}
      footer={
        <>
          <button className="btn btn--ghost" onClick={onClose}>Cancel</button>
          <button className="btn btn--primary" onClick={handleSubmit} disabled={!name.trim() || !formula.trim()}>
            <Icon name={isEdit ? 'check' : 'plus'} size="sm" />
            {isEdit ? 'Save' : 'Add Modifier'}
          </button>
        </>
      }
    >
      <div className="modal__label">Suffix Name</div>
      <input
        type="text"
        className="modal__input"
        placeholder="-w-half"
        value={name}
        onChange={(e) => setName(e.target.value.toLowerCase().replace(/\s+/g, '-'))}
        autoFocus
      />
      <p className="modal__hint">Will be appended to token names, e.g. v-col-3<strong>{name}</strong></p>

      <div className="modal__label" style={{ marginTop: 16 }}>Formula</div>
      <input
        type="text"
        className="modal__input"
        placeholder="+ column-width / 2"
        value={formula}
        onChange={(e) => setFormula(e.target.value)}
      />
      <p className="modal__hint">Available: column-width, gutter, margin-m, margin-xs, photo-margin, ingrid</p>

      {/* Quick presets */}
      <div className="modal__label" style={{ marginTop: 12 }}>Presets</div>
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
        {formulaPresets.map((preset) => (
          <button
            key={preset.name}
            className="btn btn--ghost"
            style={{ padding: '4px 8px', fontSize: 11 }}
            onClick={() => { setName(preset.name); setFormula(preset.formula); }}
          >
            {preset.name}
          </button>
        ))}
      </div>

      <div style={{ display: 'flex', gap: 12, marginTop: 16 }}>
        <div style={{ flex: 1 }}>
          <div className="modal__label">Apply from column</div>
          <input
            type="number"
            className="modal__input"
            value={applyFrom}
            onChange={(e) => setApplyFrom(parseInt(e.target.value) || 1)}
            min={1}
            max={maxColumns}
          />
        </div>
        <div style={{ flex: 1 }}>
          <div className="modal__label">Apply to column</div>
          <input
            type="number"
            className="modal__input"
            value={applyTo}
            onChange={(e) => setApplyTo(parseInt(e.target.value) || maxColumns)}
            min={1}
            max={maxColumns}
          />
        </div>
      </div>

      <div style={{ marginTop: 16, display: 'flex', alignItems: 'center', gap: 8 }}>
        <input
          type="checkbox"
          id="hasFullVariant"
          checked={hasFullVariant}
          onChange={(e) => setHasFullVariant(e.target.checked)}
          style={{ width: 16, height: 16 }}
        />
        <label htmlFor="hasFullVariant" style={{ fontSize: 12 }}>
          Generate "full" variant (v-full{name})
        </label>
      </div>
    </Modal>
  );
}

// ============================================
// ADD/EDIT RATIO MODAL
// ============================================

interface RatioModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (ratio: { name: string; ratioA: number; ratioB: number }) => void;
  editData?: { name: string; ratioA: number; ratioB: number } | null;
}

export function RatioModal({ isOpen, onClose, onSave, editData }: RatioModalProps) {
  const [name, setName] = useState('horizontal');
  const [ratioA, setRatioA] = useState(4);
  const [ratioB, setRatioB] = useState(3);

  useEffect(() => {
    if (editData) {
      setName(editData.name);
      setRatioA(editData.ratioA);
      setRatioB(editData.ratioB);
    } else {
      setName('');
      setRatioA(4);
      setRatioB(3);
    }
  }, [editData, isOpen]);

  const handleSubmit = () => {
    if (!name.trim() || ratioA <= 0 || ratioB <= 0) return;
    onSave({ name: name.trim(), ratioA, ratioB });
    onClose();
  };

  const isEdit = !!editData;

  // Ratio presets
  const ratioPresets = [
    { name: 'horizontal', ratioA: 4, ratioB: 3 },
    { name: 'vertical', ratioA: 3, ratioB: 4 },
    { name: 'square', ratioA: 1, ratioB: 1 },
    { name: 'widescreen', ratioA: 16, ratioB: 9 },
    { name: 'ultrawide', ratioA: 21, ratioB: 9 },
    { name: 'golden', ratioA: 1618, ratioB: 1000 },
  ];

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={isEdit ? 'Edit Ratio Family' : 'Add Ratio Family'}
      footer={
        <>
          <button className="btn btn--ghost" onClick={onClose}>Cancel</button>
          <button className="btn btn--primary" onClick={handleSubmit} disabled={!name.trim()}>
            <Icon name={isEdit ? 'check' : 'plus'} size="sm" />
            {isEdit ? 'Save' : 'Add Ratio'}
          </button>
        </>
      }
    >
      <div className="modal__label">Name</div>
      <input
        type="text"
        className="modal__input"
        placeholder="e.g., horizontal, vertical, square"
        value={name}
        onChange={(e) => setName(e.target.value.toLowerCase().replace(/\s+/g, '-'))}
        autoFocus
      />

      <div style={{ display: 'flex', gap: 12, marginTop: 16, alignItems: 'flex-end' }}>
        <div style={{ flex: 1 }}>
          <div className="modal__label">Width (A)</div>
          <input
            type="number"
            className="modal__input"
            value={ratioA}
            onChange={(e) => setRatioA(parseInt(e.target.value) || 1)}
            min={1}
          />
        </div>
        <div style={{ fontSize: 18, color: 'var(--text-muted)', paddingBottom: 10 }}>:</div>
        <div style={{ flex: 1 }}>
          <div className="modal__label">Height (B)</div>
          <input
            type="number"
            className="modal__input"
            value={ratioB}
            onChange={(e) => setRatioB(parseInt(e.target.value) || 1)}
            min={1}
          />
        </div>
        {/* Preview box */}
        <div 
          style={{ 
            width: 60, 
            aspectRatio: `${ratioA}/${ratioB}`,
            maxHeight: 60,
            background: 'var(--accent)',
            borderRadius: 4,
            opacity: 0.6,
          }} 
        />
      </div>

      {/* Quick presets */}
      <div className="modal__label" style={{ marginTop: 16 }}>Presets</div>
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
        {ratioPresets.map((preset) => (
          <button
            key={preset.name}
            className="btn btn--ghost"
            style={{ padding: '4px 8px', fontSize: 11 }}
            onClick={() => { setName(preset.name); setRatioA(preset.ratioA); setRatioB(preset.ratioB); }}
          >
            {preset.name} ({preset.ratioA}:{preset.ratioB})
          </button>
        ))}
      </div>

      <p className="modal__hint" style={{ marginTop: 12 }}>
        Height = Width × (B / A). For {ratioA}:{ratioB}, height is {Math.round((ratioB / ratioA) * 100)}% of width.
      </p>
    </Modal>
  );
}
