import { useState, useRef } from 'react';
import { X, Upload, FileJson, AlertCircle, Check, Save } from 'lucide-react';
import { useAppStore } from '../../stores/appStore';
import { 
  parseFigmaVariablesFile, 
  validateFigmaFile, 
  getFileStats,
  detectFileType,
  validateSessionFile 
} from '../../utils/figmaParser';
import type { SessionExport } from '../../types';

interface ImportModalProps {
  isOpen: boolean;
  onClose: () => void;
}

interface FilePreview {
  file: File;
  content: string;
  type: 'figma' | 'session' | 'unknown';
  stats: {
    fileName: string;
    collections: { name: string; variableCount: number; modes: string[] }[];
    totalVariables: number;
  };
  sessionData?: SessionExport;
  error?: string;
}

export function ImportModal({ isOpen, onClose }: ImportModalProps) {
  const [previews, setPreviews] = useState<FilePreview[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [importError, setImportError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  const addLibrary = useAppStore((state) => state.addLibrary);
  const clearLibraries = useAppStore((state) => state.clearLibraries);
  const importSession = useAppStore((state) => state.importSession);

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
        const parsed = JSON.parse(content);
        const fileType = detectFileType(parsed);
        
        if (fileType === 'session') {
          // Plik sesji
          const validation = validateSessionFile(parsed);
          if (!validation.valid) {
            newPreviews.push({
              file,
              content,
              type: 'session',
              stats: { fileName: file.name, collections: [], totalVariables: 0 },
              error: validation.error,
            });
          } else {
            const session = validation.session!;
            const totalVars = session.libraries.reduce((sum, lib) => sum + lib.variableCount, 0);
            newPreviews.push({
              file,
              content,
              type: 'session',
              stats: { 
                fileName: file.name, 
                collections: session.libraries.map(lib => ({
                  name: lib.name,
                  variableCount: lib.variableCount,
                  modes: [],
                })),
                totalVariables: totalVars,
              },
              sessionData: session,
            });
          }
        } else if (fileType === 'figma') {
          // Plik Figma
          const validation = validateFigmaFile(content);
          if (!validation.valid) {
            newPreviews.push({
              file,
              content,
              type: 'figma',
              stats: { fileName: file.name, collections: [], totalVariables: 0 },
              error: validation.error,
            });
          } else {
            const stats = getFileStats(content);
            newPreviews.push({
              file,
              content,
              type: 'figma',
              stats,
            });
          }
        } else {
          newPreviews.push({
            file,
            content,
            type: 'unknown',
            stats: { fileName: file.name, collections: [], totalVariables: 0 },
            error: 'Unknown file format. Expected Figma Variables JSON or REZZON Studio Session.',
          });
        }
      } catch (err) {
        newPreviews.push({
          file,
          content: '',
          type: 'unknown',
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
    
    // Sprawdź czy mamy sesję
    const sessionPreview = validPreviews.find(p => p.type === 'session');
    
    if (sessionPreview && sessionPreview.sessionData) {
      // Import sesji - nadpisuje wszystko
      try {
        importSession(sessionPreview.sessionData);
        onClose();
        setPreviews([]);
      } catch (err) {
        setImportError(`Session import failed: ${(err as Error).message}`);
      }
      return;
    }
    
    // Import plików Figma
    try {
      clearLibraries();
      
      for (const preview of validPreviews) {
        if (preview.type === 'figma') {
          const library = parseFigmaVariablesFile(preview.content, preview.file.name);
          addLibrary(library);
        }
      }
      
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
  const hasSession = previews.some((p) => p.type === 'session' && !p.error);
  const totalVariables = previews
    .filter((p) => !p.error)
    .reduce((sum, p) => sum + p.stats.totalVariables, 0);
  
  // Jeśli jest sesja, importujemy tylko ją (pierwszą)
  const sessionPreview = previews.find(p => p.type === 'session' && !p.error);

  return (
    <div className="modal-overlay open">
      <div className="modal" style={{ width: '560px' }}>
        <div className="modal__header">
          <span className="modal__title">Import Files</span>
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
              Supports Figma Variables and REZZON Studio Session files
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
                      border: preview.error 
                        ? '1px solid var(--red)' 
                        : preview.type === 'session'
                        ? '1px solid var(--accent)'
                        : '1px solid var(--border)',
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '8px' }}>
                      {preview.error ? (
                        <AlertCircle className="icon" style={{ color: 'var(--red)' }} />
                      ) : preview.type === 'session' ? (
                        <Save className="icon" style={{ color: 'var(--accent)' }} />
                      ) : (
                        <FileJson className="icon" style={{ color: 'var(--green)' }} />
                      )}
                      <span style={{ fontWeight: 500 }}>{preview.stats.fileName}</span>
                      {preview.type === 'session' && !preview.error && (
                        <span 
                          style={{ 
                            background: 'var(--accent)', 
                            color: 'white', 
                            fontSize: 10, 
                            padding: '2px 6px', 
                            borderRadius: 4,
                            fontWeight: 600,
                          }}
                        >
                          SESSION
                        </span>
                      )}
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
                    ) : preview.type === 'session' ? (
                      <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
                        {preview.stats.collections.map((lib, lidx) => (
                          <div
                            key={lidx}
                            style={{
                              background: 'var(--bg-elevated)',
                              padding: '6px 10px',
                              borderRadius: '6px',
                              fontSize: '11px',
                            }}
                          >
                            <span style={{ color: 'var(--text)' }}>{lib.name}</span>
                            <span style={{ color: 'var(--text-muted)', marginLeft: '6px' }}>
                              {lib.variableCount}
                            </span>
                          </div>
                        ))}
                        {preview.sessionData?.disconnectedLibraries && preview.sessionData.disconnectedLibraries.length > 0 && (
                          <div
                            style={{
                              background: 'var(--orange-bg)',
                              padding: '6px 10px',
                              borderRadius: '6px',
                              fontSize: '11px',
                              color: 'var(--orange)',
                            }}
                          >
                            {preview.sessionData.disconnectedLibraries.length} disconnected
                          </div>
                        )}
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
                background: hasSession ? 'var(--bg-selected)' : 'var(--green-bg)',
                border: hasSession ? '1px solid var(--accent)' : '1px solid var(--green-dim)',
                borderRadius: '8px',
                padding: '12px',
                display: 'flex',
                alignItems: 'center',
                gap: '10px',
              }}
            >
              {hasSession ? (
                <>
                  <Save className="icon" style={{ color: 'var(--accent)' }} />
                  <span style={{ color: 'var(--accent)' }}>
                    Session file detected. Will restore full workspace state with{' '}
                    {sessionPreview?.sessionData?.libraries.length} libraries and{' '}
                    {totalVariables.toLocaleString()} variables.
                  </span>
                </>
              ) : (
                <>
                  <Check className="icon" style={{ color: 'var(--green)' }} />
                  <span style={{ color: 'var(--green)' }}>
                    Ready to import {validCount} {validCount === 1 ? 'file' : 'files'} with{' '}
                    {totalVariables.toLocaleString()} variables
                  </span>
                </>
              )}
            </div>
          )}
          
          {/* Warning if mixing session with figma files */}
          {hasSession && previews.filter(p => p.type === 'figma' && !p.error).length > 0 && (
            <div
              style={{
                background: 'var(--orange-bg)',
                border: '1px solid rgba(245, 158, 11, 0.3)',
                borderRadius: '8px',
                padding: '12px',
                display: 'flex',
                alignItems: 'center',
                gap: '10px',
                marginTop: '12px',
              }}
            >
              <AlertCircle className="icon" style={{ color: 'var(--orange)' }} />
              <span style={{ color: 'var(--orange)', fontSize: 12 }}>
                Session file will be imported. Other Figma files will be ignored.
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
            {hasSession ? (
              <>
                <Save className="icon sm" />
                Restore Session
              </>
            ) : (
              <>
                <Upload className="icon sm" />
                Import {validCount > 0 ? `(${validCount})` : ''}
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
