import { useState, useRef } from 'react';
import { X, Upload, FileJson, AlertCircle, Check } from 'lucide-react';
import { useAppStore } from '../../stores/appStore';
import { parseFigmaVariablesFile, validateFigmaFile, getFileStats } from '../../utils/figmaParser';

interface ImportModalProps {
  isOpen: boolean;
  onClose: () => void;
}

interface FilePreview {
  file: File;
  content: string;
  stats: {
    fileName: string;
    collections: { name: string; variableCount: number; modes: string[] }[];
    totalVariables: number;
  };
  error?: string;
}

export function ImportModal({ isOpen, onClose }: ImportModalProps) {
  const [previews, setPreviews] = useState<FilePreview[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [importError, setImportError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  const addLibrary = useAppStore((state) => state.addLibrary);
  const clearLibraries = useAppStore((state) => state.clearLibraries);

  if (!isOpen) return null;

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    if (files.length === 0) return;
    
    setIsLoading(true);
    setImportError(null);
    
    const newPreviews: FilePreview[] = [];
    
    for (const file of files) {
      try {
        const content = await file.text();
        const validation = validateFigmaFile(content);
        
        if (!validation.valid) {
          newPreviews.push({
            file,
            content,
            stats: { fileName: file.name, collections: [], totalVariables: 0 },
            error: validation.error,
          });
        } else {
          const stats = getFileStats(content);
          newPreviews.push({
            file,
            content,
            stats,
          });
        }
      } catch (err) {
        newPreviews.push({
          file,
          content: '',
          stats: { fileName: file.name, collections: [], totalVariables: 0 },
          error: `Failed to read file: ${(err as Error).message}`,
        });
      }
    }
    
    setPreviews(newPreviews);
    setIsLoading(false);
  };

  const handleImport = () => {
    const validPreviews = previews.filter((p) => !p.error);
    
    if (validPreviews.length === 0) {
      setImportError('No valid files to import');
      return;
    }
    
    try {
      // Clear existing libraries
      clearLibraries();
      
      // Import each file
      for (const preview of validPreviews) {
        const library = parseFigmaVariablesFile(preview.content, preview.file.name);
        addLibrary(library);
      }
      
      // Close modal
      onClose();
      setPreviews([]);
    } catch (err) {
      setImportError(`Import failed: ${(err as Error).message}`);
    }
  };

  const handleClose = () => {
    setPreviews([]);
    setImportError(null);
    onClose();
  };

  const validCount = previews.filter((p) => !p.error).length;
  const totalVariables = previews
    .filter((p) => !p.error)
    .reduce((sum, p) => sum + p.stats.totalVariables, 0);

  return (
    <div className="modal-overlay open">
      <div className="modal" style={{ width: '560px' }}>
        <div className="modal__header">
          <span className="modal__title">Import Figma Variables</span>
          <button className="modal__close" onClick={handleClose}>
            <X className="icon" />
          </button>
        </div>
        
        <div className="modal__body">
          {/* Drop zone */}
          <div
            className="import-dropzone"
            onClick={() => fileInputRef.current?.click()}
            style={{
              border: '2px dashed var(--border)',
              borderRadius: '8px',
              padding: '32px',
              textAlign: 'center',
              cursor: 'pointer',
              marginBottom: '16px',
              transition: 'border-color 0.15s',
            }}
            onDragOver={(e) => {
              e.preventDefault();
              e.currentTarget.style.borderColor = 'var(--accent)';
            }}
            onDragLeave={(e) => {
              e.currentTarget.style.borderColor = 'var(--border)';
            }}
            onDrop={(e) => {
              e.preventDefault();
              e.currentTarget.style.borderColor = 'var(--border)';
              const files = e.dataTransfer.files;
              if (files.length > 0 && fileInputRef.current) {
                const dt = new DataTransfer();
                Array.from(files).forEach((f) => dt.items.add(f));
                fileInputRef.current.files = dt.files;
                fileInputRef.current.dispatchEvent(new Event('change', { bubbles: true }));
              }
            }}
          >
            <Upload className="icon lg" style={{ margin: '0 auto 12px', color: 'var(--text-muted)' }} />
            <div style={{ color: 'var(--text-secondary)', marginBottom: '4px' }}>
              Drop JSON files here or click to browse
            </div>
            <div style={{ color: 'var(--text-muted)', fontSize: '11px' }}>
              Supports Figma Variables export format
            </div>
          </div>
          
          <input
            ref={fileInputRef}
            type="file"
            accept=".json"
            multiple
            style={{ display: 'none' }}
            onChange={handleFileSelect}
          />
          
          {/* File previews */}
          {previews.length > 0 && (
            <div style={{ marginBottom: '16px' }}>
              <div className="modal__label">Files to import</div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                {previews.map((preview, idx) => (
                  <div
                    key={idx}
                    style={{
                      background: 'var(--bg-app)',
                      borderRadius: '8px',
                      padding: '12px',
                      border: preview.error ? '1px solid var(--red)' : '1px solid var(--border)',
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '8px' }}>
                      {preview.error ? (
                        <AlertCircle className="icon" style={{ color: 'var(--red)' }} />
                      ) : (
                        <FileJson className="icon" style={{ color: 'var(--green)' }} />
                      )}
                      <span style={{ fontWeight: 500 }}>{preview.stats.fileName}</span>
                      {!preview.error && (
                        <span style={{ color: 'var(--text-muted)', marginLeft: 'auto' }}>
                          {preview.stats.totalVariables.toLocaleString()} variables
                        </span>
                      )}
                    </div>
                    
                    {preview.error ? (
                      <div style={{ color: 'var(--red)', fontSize: '11px' }}>
                        {preview.error}
                      </div>
                    ) : (
                      <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
                        {preview.stats.collections.map((col, cidx) => (
                          <div
                            key={cidx}
                            style={{
                              background: 'var(--bg-elevated)',
                              padding: '6px 10px',
                              borderRadius: '6px',
                              fontSize: '11px',
                            }}
                          >
                            <span style={{ color: 'var(--text)' }}>{col.name}</span>
                            <span style={{ color: 'var(--text-muted)', marginLeft: '6px' }}>
                              {col.variableCount}
                            </span>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}
          
          {/* Import summary */}
          {validCount > 0 && (
            <div
              style={{
                background: 'var(--green-bg)',
                border: '1px solid var(--green-dim)',
                borderRadius: '8px',
                padding: '12px',
                display: 'flex',
                alignItems: 'center',
                gap: '10px',
              }}
            >
              <Check className="icon" style={{ color: 'var(--green)' }} />
              <span style={{ color: 'var(--green)' }}>
                Ready to import {validCount} {validCount === 1 ? 'file' : 'files'} with{' '}
                {totalVariables.toLocaleString()} variables
              </span>
            </div>
          )}
          
          {/* Error message */}
          {importError && (
            <div
              style={{
                background: 'var(--red-bg)',
                border: '1px solid rgba(239, 68, 68, 0.3)',
                borderRadius: '8px',
                padding: '12px',
                display: 'flex',
                alignItems: 'center',
                gap: '10px',
                marginTop: '12px',
              }}
            >
              <AlertCircle className="icon" style={{ color: 'var(--red)' }} />
              <span style={{ color: 'var(--red)' }}>{importError}</span>
            </div>
          )}
        </div>
        
        <div className="modal__footer">
          <button className="btn btn--ghost" onClick={handleClose}>
            Cancel
          </button>
          <button
            className="btn btn--primary"
            onClick={handleImport}
            disabled={validCount === 0 || isLoading}
          >
            <Upload className="icon sm" />
            Import {validCount > 0 ? `(${validCount})` : ''}
          </button>
        </div>
      </div>
    </div>
  );
}
