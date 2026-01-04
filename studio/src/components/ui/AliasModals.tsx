import { useState, useMemo, useEffect } from 'react';
import { Link, Link2Off, RefreshCw, Check, ArrowRight, X, Folder, Box } from 'lucide-react';
import type { Library, Variable, VariableCollection, DisconnectedLibrary } from '../../types';
import { matchVariablesByName } from '../../utils/aliasUtils';

// ==================== BULK ALIAS MODAL ====================

interface BulkAliasModalProps {
  isOpen: boolean;
  onClose: () => void;
  onApply: (targetLibraryId: string, modeIds: string[], matchResults: { sourceId: string; targetId: string }[]) => void;
  sourceLibrary: Library;
  sourceCollection: VariableCollection;
  sourceFolderPath: string;
  sourceVariables: Variable[];
  allLibraries: Library[];
}

type BulkAliasStep = 'configure' | 'preview' | 'result';

export function BulkAliasModal({
  isOpen,
  onClose,
  onApply,
  sourceLibrary,
  sourceCollection,
  sourceFolderPath,
  sourceVariables,
  allLibraries,
}: BulkAliasModalProps) {
  const [step, setStep] = useState<BulkAliasStep>('configure');
  const [targetLibraryId, setTargetLibraryId] = useState<string>('');
  const [selectedModes, setSelectedModes] = useState<string[]>(
    sourceCollection.modes.map((m) => m.modeId)
  );
  const [resultStats, setResultStats] = useState({ matched: 0, unmatched: 0 });

  // Zbierz dostępne biblioteki docelowe (inne niż źródłowa + ta sama z innymi kolekcjami)
  const targetOptions = useMemo(() => {
    const options: { id: string; name: string; variableCount: number }[] = [];
    
    for (const lib of allLibraries) {
      options.push({
        id: lib.id,
        name: lib.name,
        variableCount: Object.keys(lib.file.variables).length,
      });
    }
    
    return options;
  }, [allLibraries]);

  // Oblicz matching preview
  const matchPreview = useMemo(() => {
    if (!targetLibraryId) return { matched: [], unmatched: [] };
    
    const targetLib = allLibraries.find((l) => l.id === targetLibraryId);
    if (!targetLib) return { matched: [], unmatched: [] };
    
    const targetVariables = Object.values(targetLib.file.variables);
    return matchVariablesByName(sourceVariables, targetVariables);
  }, [targetLibraryId, sourceVariables, allLibraries]);

  const handleApply = () => {
    const matchResults = matchPreview.matched.map((m) => ({
      sourceId: m.source.id,
      targetId: m.target.id,
    }));
    
    setResultStats({
      matched: matchResults.length,
      unmatched: matchPreview.unmatched.length,
    });
    
    onApply(targetLibraryId, selectedModes, matchResults);
    setStep('result');
  };

  const toggleMode = (modeId: string) => {
    setSelectedModes((prev) =>
      prev.includes(modeId)
        ? prev.filter((id) => id !== modeId)
        : [...prev, modeId]
    );
  };

  const selectAllModes = () => {
    const allModeIds = sourceCollection.modes.map((m) => m.modeId);
    setSelectedModes(
      selectedModes.length === allModeIds.length ? [] : allModeIds
    );
  };

  const handleClose = () => {
    setStep('configure');
    setTargetLibraryId('');
    setSelectedModes(sourceCollection.modes.map((m) => m.modeId));
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="modal-overlay open">
      <div className="modal" style={{ width: 560 }}>
        <div className="modal__header">
          <span className="modal__title">Bulk Alias</span>
          <button className="modal__close" onClick={handleClose}>
            <X className="icon" />
          </button>
        </div>

        <div className="modal__body">
          {step === 'configure' && (
            <>
              {/* Source & Target */}
              <div className="selection-row">
                <div className="selection-card">
                  <div className="selection-card__header">
                    <div className="selection-card__icon selection-card__icon--source">
                      <Folder className="icon sm" />
                    </div>
                    <span className="selection-card__title">Source</span>
                  </div>
                  <div className="selection-card__name">{sourceFolderPath || 'Root'}</div>
                  <div className="selection-card__path">{sourceLibrary.name} / {sourceCollection.name}</div>
                  <div className="selection-card__stats">
                    <span>{sourceVariables.length} variables</span>
                  </div>
                </div>

                <div className="selection-arrow">
                  <ArrowRight className="icon" />
                </div>

                <div className="selection-card">
                  <div className="selection-card__header">
                    <div className="selection-card__icon selection-card__icon--target">
                      <Box className="icon sm" />
                    </div>
                    <span className="selection-card__title">Target</span>
                  </div>
                  <select
                    className="form-select"
                    value={targetLibraryId}
                    onChange={(e) => setTargetLibraryId(e.target.value)}
                  >
                    <option value="">Select library...</option>
                    {targetOptions.map((opt) => (
                      <option key={opt.id} value={opt.id}>
                        {opt.name} ({opt.variableCount} vars)
                      </option>
                    ))}
                  </select>
                  {targetLibraryId && (
                    <div className="selection-card__stats" style={{ marginTop: 8 }}>
                      <span>{matchPreview.matched.length} can be matched</span>
                    </div>
                  )}
                </div>
              </div>

              <div className="divider" />

              {/* Mode Selection */}
              <div className="form-group">
                <div className="select-all-row">
                  <label className="form-label" style={{ marginBottom: 0 }}>
                    Apply to modes
                  </label>
                  <button className="select-all-btn" onClick={selectAllModes}>
                    {selectedModes.length === sourceCollection.modes.length ? 'Deselect all' : 'Select all'}
                  </button>
                </div>
                <div className="modes-grid">
                  {sourceCollection.modes.map((mode) => (
                    <div
                      key={mode.modeId}
                      className={`mode-checkbox ${selectedModes.includes(mode.modeId) ? 'checked' : ''}`}
                      onClick={() => toggleMode(mode.modeId)}
                    >
                      <div className="mode-checkbox__box">
                        <Check className="icon xs" />
                      </div>
                      <div className="mode-checkbox__label">
                        <div className="mode-checkbox__name">{mode.name}</div>
                      </div>
                    </div>
                  ))}
                </div>
                <p className="form-hint">
                  Variables will be aliased only in selected modes. Other modes remain unchanged.
                </p>
              </div>
            </>
          )}

          {step === 'preview' && (
            <div className="preview-section">
              <div className="preview-header">
                <span className="preview-header__title">Matching Preview</span>
                <div className="preview-header__stats">
                  <span className="preview-stat preview-stat--success">
                    <Check className="icon xs" /> {matchPreview.matched.length} matched
                  </span>
                  <span className="preview-stat preview-stat--warning">
                    <ArrowRight className="icon xs" /> {matchPreview.unmatched.length} unmatched
                  </span>
                </div>
              </div>
              <div className="preview-list">
                {matchPreview.matched.slice(0, 10).map(({ source, target }) => (
                  <div key={source.id} className="preview-item">
                    <div className="preview-item__icon preview-item__icon--match">
                      <Check className="icon xs" />
                    </div>
                    <span className="preview-item__source">{source.name.split('/').pop()}</span>
                    <span className="preview-item__arrow">→</span>
                    <span className="preview-item__target">{target.name.split('/').pop()}</span>
                  </div>
                ))}
                {matchPreview.unmatched.slice(0, 5).map((source) => (
                  <div key={source.id} className="preview-item">
                    <div className="preview-item__icon preview-item__icon--unmatched">
                      <ArrowRight className="icon xs" />
                    </div>
                    <span className="preview-item__source">{source.name.split('/').pop()}</span>
                    <span className="preview-item__arrow">→</span>
                    <span className="preview-item__target preview-item__target--none">No match found</span>
                  </div>
                ))}
                {(matchPreview.matched.length > 10 || matchPreview.unmatched.length > 5) && (
                  <div className="preview-item" style={{ justifyContent: 'center', color: 'var(--text-muted)' }}>
                    ... and {Math.max(0, matchPreview.matched.length - 10) + Math.max(0, matchPreview.unmatched.length - 5)} more
                  </div>
                )}
              </div>
              <p className="form-hint" style={{ marginTop: 12 }}>
                Matching is based on variable name. Unmatched variables will be skipped.
              </p>
            </div>
          )}

          {step === 'result' && (
            <div className="result-summary">
              <div className="result-icon">
                <Check className="icon" style={{ width: 24, height: 24 }} />
              </div>
              <div className="result-title">Bulk Alias Complete</div>
              <div className="result-stats">
                <div className="result-stat result-stat--success">
                  <div className="result-stat__value">{resultStats.matched}</div>
                  <div className="result-stat__label">Aliases created</div>
                </div>
                <div className="result-stat result-stat--warning">
                  <div className="result-stat__value">{resultStats.unmatched}</div>
                  <div className="result-stat__label">Unmatched</div>
                </div>
              </div>
              {resultStats.unmatched > 0 && (
                <div className="unmatched-section">
                  <div className="unmatched-section__title">Unmatched Variables ({resultStats.unmatched})</div>
                  <div className="unmatched-list">
                    {matchPreview.unmatched.slice(0, 6).map((v) => (
                      <div key={v.id} className="unmatched-item">{v.name}</div>
                    ))}
                    {matchPreview.unmatched.length > 6 && (
                      <div className="unmatched-item" style={{ color: 'var(--text-muted)' }}>
                        ... and {matchPreview.unmatched.length - 6} more
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>

        <div className="modal__footer">
          <div className="modal__footer-info">
            {step === 'configure' && `${selectedModes.length} modes selected`}
            {step === 'preview' && `${matchPreview.matched.length} aliases will be created`}
          </div>
          <div className="modal__footer-actions">
            {step === 'configure' && (
              <>
                <button className="btn btn--ghost" onClick={handleClose}>Cancel</button>
                <button
                  className="btn btn--primary"
                  onClick={() => setStep('preview')}
                  disabled={!targetLibraryId || selectedModes.length === 0}
                >
                  Preview Matching
                </button>
              </>
            )}
            {step === 'preview' && (
              <>
                <button className="btn btn--ghost" onClick={() => setStep('configure')}>Back</button>
                <button
                  className="btn btn--primary"
                  onClick={handleApply}
                  disabled={matchPreview.matched.length === 0}
                >
                  <Link className="icon sm" />
                  Apply Aliases
                </button>
              </>
            )}
            {step === 'result' && (
              <button className="btn btn--primary" onClick={handleClose}>Done</button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}


// ==================== DISCONNECT MODAL ====================

interface CollectionWithModes {
  id: string;
  name: string;
  modes: { modeId: string; name: string }[];
}

interface DisconnectModalProps {
  isOpen: boolean;
  onClose: () => void;
  onDisconnect: (modeByCollection: Record<string, string>) => void;
  libraryName: string;
  aliasCount: number;
  collections: CollectionWithModes[];
}

export function DisconnectModal({
  isOpen,
  onClose,
  onDisconnect,
  libraryName,
  aliasCount,
  collections,
}: DisconnectModalProps) {
  // Inicjalizuj state z pierwszym mode dla każdej kolekcji
  const [selectedModes, setSelectedModes] = useState<Record<string, string>>(() => {
    const initial: Record<string, string> = {};
    collections.forEach(col => {
      if (col.modes.length > 0) {
        initial[col.id] = col.modes[0].modeId;
      }
    });
    return initial;
  });

  // Reset state gdy modal się otwiera z nowymi kolekcjami
  useEffect(() => {
    if (isOpen) {
      const initial: Record<string, string> = {};
      collections.forEach(col => {
        if (col.modes.length > 0) {
          initial[col.id] = col.modes[0].modeId;
        }
      });
      setSelectedModes(initial);
    }
  }, [isOpen, collections]);

  if (!isOpen) return null;

  const handleModeChange = (collectionId: string, modeId: string) => {
    setSelectedModes(prev => ({
      ...prev,
      [collectionId]: modeId,
    }));
  };

  return (
    <div className="modal-overlay open">
      <div className="modal" style={{ width: collections.length > 1 ? '480px' : '420px' }}>
        <div className="modal__header">
          <span className="modal__title">Disconnect Library</span>
          <button className="modal__close" onClick={onClose}>
            <X className="icon" />
          </button>
        </div>
        <div className="modal__body">
          <div className="modal__info">
            <div className="modal__info-row">
              <span className="modal__info-label">Library</span>
              <span className="modal__info-value">{libraryName}</span>
            </div>
            <div className="modal__info-row">
              <span className="modal__info-label">Aliases affected</span>
              <span className="modal__info-value modal__info-value--warning">{aliasCount} aliases</span>
            </div>
            {collections.length > 1 && (
              <div className="modal__info-row">
                <span className="modal__info-label">Collections</span>
                <span className="modal__info-value">{collections.length}</span>
              </div>
            )}
          </div>
          
          <div className="modal__label">Resolve values from mode</div>
          
          {collections.length === 1 ? (
            // Pojedyncza kolekcja - prosty dropdown
            <select
              className="modal__select"
              value={selectedModes[collections[0].id] || ''}
              onChange={(e) => handleModeChange(collections[0].id, e.target.value)}
            >
              {collections[0].modes.map((mode) => (
                <option key={mode.modeId} value={mode.modeId}>
                  {mode.name}
                </option>
              ))}
            </select>
          ) : (
            // Wiele kolekcji - lista z dropdownami
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              {collections.map((collection) => (
                <div 
                  key={collection.id} 
                  style={{ 
                    display: 'flex', 
                    alignItems: 'center', 
                    gap: '12px',
                    padding: '8px 12px',
                    background: 'var(--bg-app)',
                    borderRadius: '6px',
                  }}
                >
                  <span style={{ 
                    flex: 1, 
                    fontSize: '12px', 
                    color: 'var(--text-secondary)',
                    minWidth: '100px',
                  }}>
                    {collection.name}
                  </span>
                  <select
                    className="modal__select"
                    style={{ flex: 1, margin: 0 }}
                    value={selectedModes[collection.id] || ''}
                    onChange={(e) => handleModeChange(collection.id, e.target.value)}
                  >
                    {collection.modes.map((mode) => (
                      <option key={mode.modeId} value={mode.modeId}>
                        {mode.name}
                      </option>
                    ))}
                  </select>
                </div>
              ))}
            </div>
          )}
          
          <p className="modal__hint">
            All aliases to this library will be replaced with resolved values from the selected mode{collections.length > 1 ? 's' : ''}.
            You can restore this connection later.
          </p>
        </div>
        <div className="modal__footer">
          <button className="btn btn--ghost" onClick={onClose}>Cancel</button>
          <button className="btn btn--danger" onClick={() => onDisconnect(selectedModes)}>
            <Link2Off className="icon sm" />
            Disconnect
          </button>
        </div>
      </div>
    </div>
  );
}


// ==================== RESTORE MODAL ====================

interface RestoreModalProps {
  isOpen: boolean;
  onClose: () => void;
  onRestore: () => void;
  disconnectedLibrary: DisconnectedLibrary;
  willBeBroken: number;
}

export function RestoreModal({
  isOpen,
  onClose,
  onRestore,
  disconnectedLibrary,
  willBeBroken,
}: RestoreModalProps) {
  if (!isOpen) return null;

  const totalAliases = disconnectedLibrary.previousAliases.length;
  const willRestore = totalAliases - willBeBroken;

  return (
    <div className="modal-overlay open">
      <div className="modal">
        <div className="modal__header">
          <span className="modal__title">Restore Library Connection</span>
          <button className="modal__close" onClick={onClose}>
            <X className="icon" />
          </button>
        </div>
        <div className="modal__body">
          <div className="modal__info">
            <div className="modal__info-row">
              <span className="modal__info-label">Library</span>
              <span className="modal__info-value">{disconnectedLibrary.libraryName}</span>
            </div>
            <div className="modal__info-row">
              <span className="modal__info-label">Aliases to restore</span>
              <span className="modal__info-value">{willRestore} aliases</span>
            </div>
            {willBeBroken > 0 && (
              <div className="modal__info-row">
                <span className="modal__info-label">Will become broken</span>
                <span className="modal__info-value modal__info-value--warning">{willBeBroken} aliases</span>
              </div>
            )}
          </div>
          {willBeBroken > 0 && (
            <p className="modal__hint">
              {willBeBroken} aliases will be marked as broken because their target variables
              no longer exist in {disconnectedLibrary.libraryName}.
            </p>
          )}
        </div>
        <div className="modal__footer">
          <button className="btn btn--ghost" onClick={onClose}>Cancel</button>
          <button className="btn btn--primary" onClick={onRestore}>
            <RefreshCw className="icon sm" />
            Restore
          </button>
        </div>
      </div>
    </div>
  );
}
