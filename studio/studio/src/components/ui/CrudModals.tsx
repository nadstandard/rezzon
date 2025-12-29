import { useState, useEffect, useMemo } from 'react';
import { X, AlertTriangle, Copy, Trash2, Edit3, CheckCircle, XCircle } from 'lucide-react';
import { useAppStore } from '../../stores/appStore';
import type { Variable } from '../../types';

// ============================================
// BULK RENAME MODAL
// ============================================

interface BulkRenameModalProps {
  isOpen: boolean;
  onClose: () => void;
  variableIds: string[];
  libraryId: string;
}

export function BulkRenameModal({ isOpen, onClose, variableIds, libraryId }: BulkRenameModalProps) {
  const [match, setMatch] = useState('');
  const [replace, setReplace] = useState('');
  const [useRegex, setUseRegex] = useState(false);
  const [preview, setPreview] = useState<{ old: string; new: string; hasChange: boolean }[]>([]);
  const [result, setResult] = useState<{ success: boolean; renamed: number; conflicts: string[] } | null>(null);
  
  const libraries = useAppStore((state) => state.libraries);
  const bulkRename = useAppStore((state) => state.bulkRename);
  
  const library = libraries.find((l) => l.id === libraryId);
  const variables = useMemo(() => {
    if (!library) return [];
    return variableIds.map((id) => library.file.variables[id]).filter(Boolean) as Variable[];
  }, [library, variableIds]);
  
  // Aktualizuj preview
  useEffect(() => {
    if (!match || variables.length === 0) {
      setPreview([]);
      return;
    }
    
    try {
      const regex = useRegex 
        ? new RegExp(match, 'g') 
        : new RegExp(match.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'g');
      
      const newPreview = variables.map((v) => {
        const newName = v.name.replace(regex, replace);
        return { 
          old: v.name, 
          new: newName, 
          hasChange: newName !== v.name 
        };
      }).filter((p) => p.hasChange).slice(0, 20); // Limit do 20 dla wydajności
      
      setPreview(newPreview);
    } catch (e) {
      setPreview([]);
    }
  }, [match, replace, useRegex, variables]);
  
  const handleSubmit = () => {
    const res = bulkRename(libraryId, variableIds, match, replace, useRegex);
    setResult(res);
    
    if (res.success && res.renamed > 0) {
      setTimeout(() => {
        onClose();
        setMatch('');
        setReplace('');
        setResult(null);
      }, 1500);
    }
  };
  
  const handleClose = () => {
    onClose();
    setMatch('');
    setReplace('');
    setResult(null);
    setPreview([]);
  };
  
  if (!isOpen) return null;
  
  return (
    <div className="modal-overlay open">
      <div className="modal" style={{ width: '520px' }}>
        <div className="modal__header">
          <span className="modal__title">
            <Edit3 className="icon sm" style={{ marginRight: '8px' }} />
            Bulk Rename ({variableIds.length} variables)
          </span>
          <button className="modal__close" onClick={handleClose}>
            <X className="icon" />
          </button>
        </div>
        
        <div className="modal__body">
          {result ? (
            <div style={{ textAlign: 'center', padding: '20px' }}>
              {result.success ? (
                <>
                  <CheckCircle className="icon lg" style={{ color: 'var(--green)', width: '48px', height: '48px', marginBottom: '16px' }} />
                  <p style={{ fontSize: '14px', color: 'var(--text)' }}>
                    Renamed {result.renamed} variable{result.renamed !== 1 ? 's' : ''}
                  </p>
                </>
              ) : (
                <>
                  <XCircle className="icon lg" style={{ color: 'var(--red)', width: '48px', height: '48px', marginBottom: '16px' }} />
                  <p style={{ fontSize: '14px', color: 'var(--text)', marginBottom: '12px' }}>
                    Conflicts detected:
                  </p>
                  <div style={{ 
                    background: 'var(--red-bg)', 
                    border: '1px solid var(--red)', 
                    borderRadius: '8px', 
                    padding: '12px',
                    textAlign: 'left',
                    maxHeight: '150px',
                    overflow: 'auto'
                  }}>
                    {result.conflicts.map((c, i) => (
                      <div key={i} style={{ fontSize: '12px', color: 'var(--red)', marginBottom: '4px' }}>{c}</div>
                    ))}
                  </div>
                </>
              )}
            </div>
          ) : (
            <>
              <div style={{ marginBottom: '16px' }}>
                <div className="modal__label">Match</div>
                <input 
                  type="text" 
                  className="modal__input" 
                  placeholder="Text to find..."
                  value={match}
                  onChange={(e) => setMatch(e.target.value)}
                  autoFocus
                />
              </div>
              
              <div style={{ marginBottom: '16px' }}>
                <div className="modal__label">Replace with</div>
                <input 
                  type="text" 
                  className="modal__input" 
                  placeholder="Replacement text..."
                  value={replace}
                  onChange={(e) => setReplace(e.target.value)}
                />
              </div>
              
              <div style={{ marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                <input 
                  type="checkbox" 
                  id="useRegex" 
                  checked={useRegex} 
                  onChange={(e) => setUseRegex(e.target.checked)}
                  style={{ width: '16px', height: '16px' }}
                />
                <label htmlFor="useRegex" style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>
                  Use regular expression
                </label>
              </div>
              
              {preview.length > 0 && (
                <div>
                  <div className="modal__label">Preview ({preview.length}{preview.length === 20 ? '+' : ''} changes)</div>
                  <div style={{ 
                    background: 'var(--bg-app)', 
                    borderRadius: '8px', 
                    padding: '8px',
                    maxHeight: '200px',
                    overflow: 'auto'
                  }}>
                    {preview.map((p, i) => (
                      <div key={i} style={{ 
                        display: 'flex', 
                        gap: '8px', 
                        alignItems: 'center',
                        padding: '6px 8px',
                        fontSize: '11px',
                        fontFamily: 'monospace',
                        borderBottom: i < preview.length - 1 ? '1px solid var(--border-subtle)' : 'none'
                      }}>
                        <span style={{ color: 'var(--text-muted)', flex: 1, overflow: 'hidden', textOverflow: 'ellipsis' }}>{p.old}</span>
                        <span style={{ color: 'var(--text-muted)' }}>→</span>
                        <span style={{ color: 'var(--green)', flex: 1, overflow: 'hidden', textOverflow: 'ellipsis' }}>{p.new}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </>
          )}
        </div>
        
        {!result && (
          <div className="modal__footer">
            <button className="btn btn--ghost" onClick={handleClose}>Cancel</button>
            <button 
              className="btn btn--primary" 
              onClick={handleSubmit}
              disabled={!match || preview.length === 0}
            >
              <Edit3 className="icon sm" />
              Rename {preview.length} variable{preview.length !== 1 ? 's' : ''}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

// ============================================
// DELETE MODAL
// ============================================

interface DeleteModalProps {
  isOpen: boolean;
  onClose: () => void;
  variableIds: string[];
  libraryId: string;
}

export function DeleteModal({ isOpen, onClose, variableIds, libraryId }: DeleteModalProps) {
  const [result, setResult] = useState<{ deleted: number; brokenAliases: string[] } | null>(null);
  
  const libraries = useAppStore((state) => state.libraries);
  const deleteVariables = useAppStore((state) => state.deleteVariables);
  
  const library = libraries.find((l) => l.id === libraryId);
  
  // Oblicz potencjalne broken aliasy przed usunięciem
  const potentialBrokenAliases = useMemo(() => {
    if (!library) return [];
    
    const broken: string[] = [];
    for (const [varId, variable] of Object.entries(library.file.variables)) {
      if (variableIds.includes(varId)) continue;
      
      for (const value of Object.values(variable.valuesByMode || {})) {
        if (value.type === 'VARIABLE_ALIAS' && value.variableId && variableIds.includes(value.variableId)) {
          broken.push(variable.name);
          break;
        }
      }
    }
    return broken;
  }, [library, variableIds]);
  
  const handleDelete = () => {
    const res = deleteVariables(libraryId, variableIds);
    setResult(res);
    
    setTimeout(() => {
      onClose();
      setResult(null);
    }, 1500);
  };
  
  const handleClose = () => {
    onClose();
    setResult(null);
  };
  
  if (!isOpen) return null;
  
  return (
    <div className="modal-overlay open">
      <div className="modal">
        <div className="modal__header">
          <span className="modal__title">
            <Trash2 className="icon sm" style={{ marginRight: '8px', color: 'var(--red)' }} />
            Delete Variables
          </span>
          <button className="modal__close" onClick={handleClose}>
            <X className="icon" />
          </button>
        </div>
        
        <div className="modal__body">
          {result ? (
            <div style={{ textAlign: 'center', padding: '20px' }}>
              <CheckCircle className="icon lg" style={{ color: 'var(--green)', width: '48px', height: '48px', marginBottom: '16px' }} />
              <p style={{ fontSize: '14px', color: 'var(--text)' }}>
                Deleted {result.deleted} variable{result.deleted !== 1 ? 's' : ''}
              </p>
              {result.brokenAliases.length > 0 && (
                <p style={{ fontSize: '12px', color: 'var(--orange)', marginTop: '8px' }}>
                  {result.brokenAliases.length} alias{result.brokenAliases.length !== 1 ? 'es' : ''} now broken
                </p>
              )}
            </div>
          ) : (
            <>
              <div className="modal__info">
                <div className="modal__info-row">
                  <span className="modal__info-label">Variables to delete</span>
                  <span className="modal__info-value">{variableIds.length}</span>
                </div>
                {potentialBrokenAliases.length > 0 && (
                  <div className="modal__info-row">
                    <span className="modal__info-label">Aliases that will break</span>
                    <span className="modal__info-value modal__info-value--warning">{potentialBrokenAliases.length}</span>
                  </div>
                )}
              </div>
              
              {potentialBrokenAliases.length > 0 && (
                <div style={{ 
                  background: 'var(--orange-bg)', 
                  border: '1px solid var(--orange)', 
                  borderRadius: '8px', 
                  padding: '12px',
                  marginBottom: '16px',
                  display: 'flex',
                  gap: '10px',
                  alignItems: 'flex-start'
                }}>
                  <AlertTriangle className="icon" style={{ color: 'var(--orange)', flexShrink: 0, marginTop: '2px' }} />
                  <div>
                    <div style={{ fontSize: '12px', fontWeight: 500, color: 'var(--orange)', marginBottom: '4px' }}>
                      Warning: Broken aliases
                    </div>
                    <div style={{ fontSize: '11px', color: 'var(--text-secondary)', maxHeight: '100px', overflow: 'auto' }}>
                      {potentialBrokenAliases.slice(0, 5).map((name, i) => (
                        <div key={i}>{name}</div>
                      ))}
                      {potentialBrokenAliases.length > 5 && (
                        <div style={{ color: 'var(--text-muted)' }}>...and {potentialBrokenAliases.length - 5} more</div>
                      )}
                    </div>
                  </div>
                </div>
              )}
              
              <p className="modal__hint">
                This action cannot be undone. All selected variables will be permanently deleted.
              </p>
            </>
          )}
        </div>
        
        {!result && (
          <div className="modal__footer">
            <button className="btn btn--ghost" onClick={handleClose}>Cancel</button>
            <button className="btn btn--danger" onClick={handleDelete}>
              <Trash2 className="icon sm" />
              Delete {variableIds.length} variable{variableIds.length !== 1 ? 's' : ''}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

// ============================================
// DUPLICATE FOLDER MODAL
// ============================================

interface DuplicateFolderModalProps {
  isOpen: boolean;
  onClose: () => void;
  folderPath: string;
  libraryId: string;
  collectionId: string;
  variableCount: number;
}

export function DuplicateFolderModal({ isOpen, onClose, folderPath, libraryId, collectionId, variableCount }: DuplicateFolderModalProps) {
  const [result, setResult] = useState<{ success: boolean; newFolderPath?: string } | null>(null);
  
  const duplicateFolder = useAppStore((state) => state.duplicateFolder);
  
  const handleDuplicate = () => {
    const res = duplicateFolder(libraryId, collectionId, folderPath);
    setResult(res);
    
    if (res.success) {
      setTimeout(() => {
        onClose();
        setResult(null);
      }, 1500);
    }
  };
  
  const handleClose = () => {
    onClose();
    setResult(null);
  };
  
  if (!isOpen) return null;
  
  const folderName = folderPath.split('/').pop() || folderPath;
  
  return (
    <div className="modal-overlay open">
      <div className="modal">
        <div className="modal__header">
          <span className="modal__title">
            <Copy className="icon sm" style={{ marginRight: '8px' }} />
            Duplicate Folder
          </span>
          <button className="modal__close" onClick={handleClose}>
            <X className="icon" />
          </button>
        </div>
        
        <div className="modal__body">
          {result ? (
            <div style={{ textAlign: 'center', padding: '20px' }}>
              {result.success ? (
                <>
                  <CheckCircle className="icon lg" style={{ color: 'var(--green)', width: '48px', height: '48px', marginBottom: '16px' }} />
                  <p style={{ fontSize: '14px', color: 'var(--text)' }}>
                    Created "{result.newFolderPath}"
                  </p>
                  <p style={{ fontSize: '12px', color: 'var(--text-secondary)', marginTop: '4px' }}>
                    {variableCount} variable{variableCount !== 1 ? 's' : ''} duplicated
                  </p>
                </>
              ) : (
                <>
                  <XCircle className="icon lg" style={{ color: 'var(--red)', width: '48px', height: '48px', marginBottom: '16px' }} />
                  <p style={{ fontSize: '14px', color: 'var(--text)' }}>
                    Failed to duplicate folder
                  </p>
                </>
              )}
            </div>
          ) : (
            <>
              <div className="modal__info">
                <div className="modal__info-row">
                  <span className="modal__info-label">Folder</span>
                  <span className="modal__info-value">{folderName}</span>
                </div>
                <div className="modal__info-row">
                  <span className="modal__info-label">Path</span>
                  <span className="modal__info-value" style={{ fontSize: '11px', fontFamily: 'monospace' }}>{folderPath}</span>
                </div>
                <div className="modal__info-row">
                  <span className="modal__info-label">Variables</span>
                  <span className="modal__info-value">{variableCount}</span>
                </div>
              </div>
              
              <p className="modal__hint">
                A copy of this folder will be created with suffix " 2". All variables will be duplicated, and aliases will point to the original variables.
              </p>
            </>
          )}
        </div>
        
        {!result && (
          <div className="modal__footer">
            <button className="btn btn--ghost" onClick={handleClose}>Cancel</button>
            <button className="btn btn--primary" onClick={handleDuplicate}>
              <Copy className="icon sm" />
              Duplicate
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
