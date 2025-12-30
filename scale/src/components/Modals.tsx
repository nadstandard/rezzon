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

// ============================================
// ADD/EDIT RESPONSIVE VARIANT MODAL
// ============================================

interface ResponsiveVariantModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (variant: { name: string; description?: string }) => void;
  editData?: { name: string; description?: string } | null;
}

export function ResponsiveVariantModal({ isOpen, onClose, onSave, editData }: ResponsiveVariantModalProps) {
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');

  useEffect(() => {
    if (editData) {
      setName(editData.name);
      setDescription(editData.description || '');
    } else {
      setName('');
      setDescription('');
    }
  }, [editData, isOpen]);

  const handleSubmit = () => {
    if (!name.trim()) return;
    onSave({ 
      name: name.trim().toLowerCase().replace(/\s+/g, '-'),
      description: description.trim() || undefined,
    });
    onClose();
  };

  const isEdit = !!editData;

  // Name presets
  const namePresets = [
    { name: 'static', desc: 'Same columns across all viewports' },
    { name: 'to-tab-6-col', desc: 'Switch to 6 columns on tablet' },
    { name: 'to-mob-4-col', desc: 'Switch to 4 columns on mobile' },
    { name: 'to-mob-2-col', desc: 'Switch to 2 columns on mobile' },
    { name: 'fluid', desc: 'Fluid columns based on viewport' },
  ];

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={isEdit ? 'Edit Responsive Variant' : 'Add Responsive Variant'}
      footer={
        <>
          <button className="btn btn--ghost" onClick={onClose}>Cancel</button>
          <button className="btn btn--primary" onClick={handleSubmit} disabled={!name.trim()}>
            <Icon name={isEdit ? 'check' : 'plus'} size="sm" />
            {isEdit ? 'Save' : 'Add Variant'}
          </button>
        </>
      }
    >
      <div className="modal__label">Name</div>
      <input
        type="text"
        className="modal__input"
        placeholder="e.g., static, to-tab-6-col, fluid"
        value={name}
        onChange={(e) => setName(e.target.value.toLowerCase().replace(/\s+/g, '-'))}
        autoFocus
      />
      <p className="modal__hint">Used in token names: v-col-3-<strong>{name || 'variant'}</strong></p>

      {/* Quick presets */}
      <div className="modal__label" style={{ marginTop: 12 }}>Presets</div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
        {namePresets.map((preset) => (
          <button
            key={preset.name}
            className="btn btn--ghost"
            style={{ padding: '6px 10px', fontSize: 11, justifyContent: 'flex-start', textAlign: 'left' }}
            onClick={() => { setName(preset.name); setDescription(preset.desc); }}
          >
            <strong style={{ minWidth: 100 }}>{preset.name}</strong>
            <span style={{ color: 'var(--text-muted)', marginLeft: 8 }}>{preset.desc}</span>
          </button>
        ))}
      </div>

      <div className="modal__label" style={{ marginTop: 16 }}>Description (optional)</div>
      <textarea
        className="modal__textarea"
        placeholder="Describe when to use this variant..."
        value={description}
        onChange={(e) => setDescription(e.target.value)}
        rows={2}
      />
      <p className="modal__hint">
        After creating, configure which ratios and modifiers are enabled in the main panel.
      </p>
    </Modal>
  );
}

// ============================================
// IMPORT SESSION MODAL
// ============================================

interface ImportModalProps {
  isOpen: boolean;
  onClose: () => void;
  onImport: (data: unknown) => { success: boolean; errors: string[] };
}

export function ImportModal({ isOpen, onClose, onImport }: ImportModalProps) {
  const [isDragging, setIsDragging] = useState(false);
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<{
    version?: string;
    exportedAt?: string;
    viewports?: number;
    styles?: number;
    modifiers?: number;
    ratios?: number;
    variants?: number;
  } | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [parsedData, setParsedData] = useState<unknown>(null);

  const resetState = () => {
    setFile(null);
    setPreview(null);
    setError(null);
    setParsedData(null);
    setIsDragging(false);
  };

  useEffect(() => {
    if (!isOpen) {
      resetState();
    }
  }, [isOpen]);

  const validateAndParseFile = async (f: File) => {
    setError(null);
    setPreview(null);
    setParsedData(null);

    // Check file type
    if (!f.name.endsWith('.json')) {
      setError('Please select a JSON file');
      return;
    }

    try {
      const text = await f.text();
      const json = JSON.parse(text);

      // Validate structure
      if (json.type !== 'scale-session') {
        setError('Invalid file: not a Scale session file. Expected type: "scale-session"');
        return;
      }

      if (!json.version) {
        setError('Invalid file: missing version');
        return;
      }

      if (!json.data) {
        setError('Invalid file: missing data section');
        return;
      }

      const data = json.data;

      // Validate required arrays
      const requiredArrays = ['viewports', 'styles', 'baseParameters'];
      for (const arr of requiredArrays) {
        if (!Array.isArray(data[arr])) {
          setError(`Invalid file: missing or invalid "${arr}" array`);
          return;
        }
      }

      // Build preview
      setPreview({
        version: json.version,
        exportedAt: json.exportedAt,
        viewports: data.viewports?.length || 0,
        styles: data.styles?.length || 0,
        modifiers: data.modifiers?.length || 0,
        ratios: data.ratioFamilies?.length || 0,
        variants: data.responsiveVariants?.length || 0,
      });

      setParsedData(json);
      setFile(f);
    } catch (e) {
      setError(`Failed to parse JSON: ${e instanceof Error ? e.message : 'Unknown error'}`);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);

    const f = e.dataTransfer.files[0];
    if (f) {
      validateAndParseFile(f);
    }
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0];
    if (f) {
      validateAndParseFile(f);
    }
  };

  const handleImport = () => {
    if (!parsedData) return;

    const result = onImport(parsedData);
    if (result.success) {
      onClose();
    } else {
      setError(result.errors.join(', '));
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Import Scale Session"
      footer={
        <>
          <button className="btn btn--ghost" onClick={onClose}>Cancel</button>
          <button 
            className="btn btn--primary" 
            onClick={handleImport}
            disabled={!parsedData || !!error}
          >
            <Icon name="dl" size="sm" />
            Import Session
          </button>
        </>
      }
    >
      {/* Drop zone */}
      <div
        className={`import-dropzone ${isDragging ? 'dragging' : ''} ${file ? 'has-file' : ''}`}
        onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
        onDragLeave={() => setIsDragging(false)}
        onDrop={handleDrop}
        onClick={() => document.getElementById('import-file-input')?.click()}
        style={{
          border: `2px dashed ${isDragging ? 'var(--accent)' : error ? 'var(--red)' : 'var(--border)'}`,
          borderRadius: 8,
          padding: '32px 24px',
          textAlign: 'center',
          cursor: 'pointer',
          background: isDragging ? 'var(--bg-selected)' : 'var(--bg-app)',
          transition: 'all 0.15s',
          marginBottom: 16,
        }}
      >
        <input
          id="import-file-input"
          type="file"
          accept=".json"
          style={{ display: 'none' }}
          onChange={handleFileSelect}
        />
        
        {file ? (
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 12 }}>
            <Icon name="check" style={{ color: 'var(--green)' }} />
            <span style={{ color: 'var(--text)' }}>{file.name}</span>
            <button 
              className="btn btn--ghost" 
              style={{ padding: '4px 8px', marginLeft: 8 }}
              onClick={(e) => { e.stopPropagation(); resetState(); }}
            >
              <Icon name="x" size="sm" />
            </button>
          </div>
        ) : (
          <>
            <Icon name="ul" style={{ marginBottom: 12, color: 'var(--text-muted)' }} />
            <div style={{ color: 'var(--text-secondary)', marginBottom: 4 }}>
              Drop Scale session file here
            </div>
            <div style={{ color: 'var(--text-muted)', fontSize: 11 }}>
              or click to browse
            </div>
          </>
        )}
      </div>

      {/* Error */}
      {error && (
        <div style={{
          background: 'var(--red-bg)',
          border: '1px solid rgba(239, 68, 68, 0.3)',
          borderRadius: 6,
          padding: '10px 12px',
          marginBottom: 16,
          display: 'flex',
          alignItems: 'flex-start',
          gap: 10,
        }}>
          <Icon name="warn" size="sm" style={{ color: 'var(--red)', flexShrink: 0, marginTop: 2 }} />
          <span style={{ color: 'var(--red)', fontSize: 12 }}>{error}</span>
        </div>
      )}

      {/* Preview */}
      {preview && !error && (
        <div className="modal__info">
          <div className="modal__info-row">
            <span className="modal__info-label">Version</span>
            <span className="modal__info-value">{preview.version}</span>
          </div>
          {preview.exportedAt && (
            <div className="modal__info-row">
              <span className="modal__info-label">Exported</span>
              <span className="modal__info-value">
                {new Date(preview.exportedAt).toLocaleString()}
              </span>
            </div>
          )}
          <div className="modal__info-row">
            <span className="modal__info-label">Viewports</span>
            <span className="modal__info-value">{preview.viewports}</span>
          </div>
          <div className="modal__info-row">
            <span className="modal__info-label">Styles</span>
            <span className="modal__info-value">{preview.styles}</span>
          </div>
          <div className="modal__info-row">
            <span className="modal__info-label">Modifiers</span>
            <span className="modal__info-value">{preview.modifiers}</span>
          </div>
          <div className="modal__info-row">
            <span className="modal__info-label">Ratio Families</span>
            <span className="modal__info-value">{preview.ratios}</span>
          </div>
          <div className="modal__info-row">
            <span className="modal__info-label">Responsive Variants</span>
            <span className="modal__info-value">{preview.variants}</span>
          </div>
        </div>
      )}

      <p className="modal__hint">
        <strong>Warning:</strong> Importing will replace your current session data. Make sure to export first if needed.
      </p>
    </Modal>
  );
}

// ============================================
// EXPORT OPTIONS MODAL
// ============================================

interface ExportModalProps {
  isOpen: boolean;
  onClose: () => void;
  onExportSession: () => void;
  onExportTokens: () => void;
  tokenCount: number;
}

export function ExportModal({ isOpen, onClose, onExportSession, onExportTokens, tokenCount }: ExportModalProps) {
  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Export"
    >
      <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
        {/* Session export option */}
        <div
          className="export-option"
          onClick={() => { onExportSession(); onClose(); }}
          style={{
            background: 'var(--bg-app)',
            border: '1px solid var(--border)',
            borderRadius: 8,
            padding: 16,
            cursor: 'pointer',
            transition: 'all 0.15s',
          }}
          onMouseOver={(e) => e.currentTarget.style.borderColor = 'var(--accent)'}
          onMouseOut={(e) => e.currentTarget.style.borderColor = 'var(--border)'}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 8 }}>
            <div style={{
              width: 36,
              height: 36,
              background: 'var(--bg-elevated)',
              borderRadius: 8,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}>
              <Icon name="hist" style={{ color: 'var(--accent)' }} />
            </div>
            <div>
              <div style={{ fontWeight: 600, marginBottom: 2 }}>Scale Session</div>
              <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>
                .json • Reload later to continue work
              </div>
            </div>
          </div>
          <p style={{ fontSize: 12, color: 'var(--text-secondary)', margin: 0 }}>
            Saves viewports, styles, parameters, modifiers, ratios, and responsive variants. 
            Use this to backup your work or continue later.
          </p>
        </div>

        {/* Tokens export option */}
        <div
          className="export-option"
          onClick={() => { onExportTokens(); onClose(); }}
          style={{
            background: 'var(--bg-app)',
            border: '1px solid var(--border)',
            borderRadius: 8,
            padding: 16,
            cursor: 'pointer',
            transition: 'all 0.15s',
          }}
          onMouseOver={(e) => e.currentTarget.style.borderColor = 'var(--accent)'}
          onMouseOut={(e) => e.currentTarget.style.borderColor = 'var(--border)'}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 8 }}>
            <div style={{
              width: 36,
              height: 36,
              background: 'var(--green-bg)',
              borderRadius: 8,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}>
              <Icon name="grid" style={{ color: 'var(--green)' }} />
            </div>
            <div>
              <div style={{ fontWeight: 600, marginBottom: 2 }}>Generated Tokens</div>
              <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>
                .json • {tokenCount.toLocaleString()} tokens for Figma
              </div>
            </div>
          </div>
          <p style={{ fontSize: 12, color: 'var(--text-secondary)', margin: 0 }}>
            Exports generated token values ready for Figma Variables API. 
            Use with REZZON Portal plugin.
          </p>
        </div>
      </div>
    </Modal>
  );
}
