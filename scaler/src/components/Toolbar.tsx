import { useRef } from 'react';

interface ToolbarProps {
  title: string;
  formula?: string;
  onImport: (file: File) => void;
  onExport: () => void;
  extraButtons?: React.ReactNode;
}

export function Toolbar({ title, formula, onImport, onExport, extraButtons }: ToolbarProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      onImport(file);
      // Reset input so same file can be imported again
      e.target.value = '';
    }
  };

  return (
    <div className="toolbar">
      <div className="toolbar-left">
        <span className="toolbar-title">{title}</span>
        {formula && (
          <div className="formula-trigger">
            ƒ
            <div className="formula-tooltip">{formula}</div>
          </div>
        )}
      </div>
      <div className="toolbar-right">
        {extraButtons}
        <input
          ref={fileInputRef}
          type="file"
          accept=".json"
          onChange={handleFileChange}
          style={{ display: 'none' }}
          id="import-file"
        />
        <label htmlFor="import-file" className="btn btn-secondary" style={{ cursor: 'pointer' }}>
          Import
        </label>
        <button onClick={onExport} className="btn btn-primary">
          Export JSON
        </button>
      </div>
    </div>
  );
}
