import { useState, useMemo, useRef, useEffect } from 'react';
import { Search, ArrowRight, ExternalLink, Inbox } from 'lucide-react';
import type { Variable, Library } from '../../types';

interface AliasPickerProps {
  isOpen: boolean;
  onClose: () => void;
  onSelect: (variableId: string) => void;
  onRemoveAlias?: () => void;
  sourceVariable: Variable;
  currentAliasId?: string;
  sourceLibrary: Library;
  allLibraries: Library[];
  position?: { top: number; left: number };
}

export function AliasPicker({
  isOpen,
  onClose,
  onSelect,
  onRemoveAlias,
  sourceVariable,
  currentAliasId,
  sourceLibrary,
  allLibraries,
  position,
}: AliasPickerProps) {
  const [search, setSearch] = useState('');
  const [activeTab, setActiveTab] = useState<'all' | 'internal' | 'external'>('all');
  const pickerRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Focus input when opened
  useEffect(() => {
    if (isOpen && inputRef.current) {
      inputRef.current.focus();
    }
  }, [isOpen]);

  // Close on click outside
  useEffect(() => {
    if (!isOpen) return;
    
    const handleClickOutside = (e: MouseEvent) => {
      if (pickerRef.current && !pickerRef.current.contains(e.target as Node)) {
        onClose();
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isOpen, onClose]);

  // Close on Escape
  useEffect(() => {
    if (!isOpen) return;
    
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  // Zbierz wszystkie zmienne tego samego typu
  const availableVariables = useMemo(() => {
    const type = sourceVariable.resolvedType;
    const internal: Variable[] = [];
    const external: Variable[] = [];

    // Internal - z tej samej biblioteki
    for (const v of Object.values(sourceLibrary.file.variables)) {
      if (v.id === sourceVariable.id) continue; // Nie pokazuj samej siebie
      if (v.resolvedType === type) {
        internal.push(v);
      }
    }

    // External - z innych bibliotek
    for (const lib of allLibraries) {
      if (lib.id === sourceLibrary.id) continue;
      for (const v of Object.values(lib.file.variables)) {
        if (v.resolvedType === type) {
          external.push({ ...v, _libraryName: lib.name } as Variable & { _libraryName: string });
        }
      }
    }

    return { internal, external };
  }, [sourceVariable, sourceLibrary, allLibraries]);

  // Filtruj po search i tab
  const filteredVariables = useMemo(() => {
    const searchLower = search.toLowerCase();
    
    const filterFn = (v: Variable) => 
      v.name.toLowerCase().includes(searchLower);

    let internal = availableVariables.internal.filter(filterFn);
    let external = availableVariables.external.filter(filterFn);

    if (activeTab === 'internal') external = [];
    if (activeTab === 'external') internal = [];

    return { internal, external };
  }, [availableVariables, search, activeTab]);

  const totalCount = filteredVariables.internal.length + filteredVariables.external.length;
  const isEmpty = totalCount === 0;

  if (!isOpen) return null;

  const style = position ? {
    position: 'absolute' as const,
    top: position.top,
    left: position.left,
    zIndex: 1000,
  } : {};

  return (
    <div className="alias-picker" ref={pickerRef} style={style}>
      {/* Search */}
      <div className="picker-search">
        <div className="picker-search__wrapper">
          <Search className="icon sm picker-search__icon" />
          <input
            ref={inputRef}
            type="text"
            className="picker-search__input"
            placeholder="Search variables..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
      </div>

      {/* Tabs */}
      <div className="picker-tabs">
        <button
          className={`picker-tab ${activeTab === 'all' ? 'active' : ''}`}
          onClick={() => setActiveTab('all')}
        >
          All
          <span className="picker-tab__count">
            {availableVariables.internal.length + availableVariables.external.length}
          </span>
        </button>
        <button
          className={`picker-tab ${activeTab === 'internal' ? 'active' : ''}`}
          onClick={() => setActiveTab('internal')}
        >
          Internal
          <span className="picker-tab__count">{availableVariables.internal.length}</span>
        </button>
        <button
          className={`picker-tab ${activeTab === 'external' ? 'active' : ''}`}
          onClick={() => setActiveTab('external')}
        >
          External
          <span className="picker-tab__count">{availableVariables.external.length}</span>
        </button>
      </div>

      {/* List */}
      {isEmpty ? (
        <div className="picker-empty">
          <div className="picker-empty__icon">
            <Inbox className="icon" />
          </div>
          <div className="picker-empty__title">No variables found</div>
          <div className="picker-empty__description">
            {search 
              ? `No matches for "${search}"`
              : `No ${sourceVariable.resolvedType.toLowerCase()} variables available`
            }
          </div>
        </div>
      ) : (
        <div className="picker-list">
          {/* Internal section */}
          {filteredVariables.internal.length > 0 && (
            <div className="picker-section">
              <div className="picker-section__header">
                <span className="picker-section__dot picker-section__dot--internal" />
                Internal · {sourceLibrary.name}
              </div>
              {filteredVariables.internal.map((v) => (
                <div
                  key={v.id}
                  className={`picker-item ${v.id === currentAliasId ? 'selected' : ''}`}
                  onClick={() => onSelect(v.id)}
                >
                  <div className="picker-item__icon picker-item__icon--internal">
                    <ArrowRight className="icon xs" />
                  </div>
                  <div className="picker-item__content">
                    <div className="picker-item__name">
                      {highlightMatch(v.name.split('/').pop() || v.name, search)}
                    </div>
                    {v.name.includes('/') && (
                      <div className="picker-item__path">{getParentPath(v.name)}</div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* External section */}
          {filteredVariables.external.length > 0 && (
            <div className="picker-section">
              <div className="picker-section__header">
                <span className="picker-section__dot picker-section__dot--external" />
                External
              </div>
              {filteredVariables.external.map((v) => {
                const libName = (v as any)._libraryName || 'External';
                return (
                  <div
                    key={v.id}
                    className={`picker-item ${v.id === currentAliasId ? 'selected' : ''}`}
                    onClick={() => onSelect(v.id)}
                  >
                    <div className="picker-item__icon picker-item__icon--external">
                      <ExternalLink className="icon xs" />
                    </div>
                    <div className="picker-item__content">
                      <div className="picker-item__name">
                        {highlightMatch(v.name.split('/').pop() || v.name, search)}
                      </div>
                      <div className="picker-item__path">{libName} / {getParentPath(v.name)}</div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* Footer */}
      <div className="picker-footer">
        <span className="picker-footer__hint">↑↓ navigate · Enter select · Esc close</span>
        {currentAliasId && onRemoveAlias && (
          <button className="picker-footer__action" onClick={onRemoveAlias}>
            Remove alias
          </button>
        )}
      </div>
    </div>
  );
}

// Helper - podświetl match w tekście
function highlightMatch(text: string, search: string): React.ReactNode {
  if (!search) return text;
  
  const idx = text.toLowerCase().indexOf(search.toLowerCase());
  if (idx < 0) return text;
  
  return (
    <>
      {text.slice(0, idx)}
      <span className="highlight">{text.slice(idx, idx + search.length)}</span>
      {text.slice(idx + search.length)}
    </>
  );
}

// Helper - pobierz ścieżkę rodzica
function getParentPath(fullPath: string): string {
  const parts = fullPath.split('/');
  parts.pop();
  return parts.join(' / ') || '';
}
