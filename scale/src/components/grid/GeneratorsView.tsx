import { useState, useMemo } from 'react';
import { Icon } from '../Icons';
import { useGridStore } from '../../store';
import { ModifierModal, RatioModal, ConfirmDeleteModal, ResponsiveVariantModal, FolderModal } from '../Modals';
import type { OutputFolder } from '../../types';
import { getTokenPreviewForFolder, calculateFolderTokenCount, type FolderGeneratorContext } from '../../engine/generator';
import { SortableList } from '../common/SortableList';

export function GeneratorsView() {
  const {
    outputFolders,
    selectedFolderId,
    modifiers,
    ratioFamilies,
    responsiveVariants,
    viewports,
    styles,
    baseParameters,
    computedParameters,
    selectFolder,
    addOutputFolder,
    updateOutputFolder,
    removeOutputFolder,
    toggleFolderModifier,
    toggleFolderResponsive,
    addModifier,
    updateModifier,
    removeModifier,
    reorderModifiers,
    addRatioFamily,
    updateRatioFamily,
    removeRatioFamily,
    addResponsiveVariant,
    updateResponsiveVariant,
    removeResponsiveVariant,
  } = useGridStore();

  // Expanded folders in tree
  const [expandedFolders, setExpandedFolders] = useState<Set<string>>(new Set(['of-2']));

  // Modal states
  const [folderModalOpen, setFolderModalOpen] = useState(false);
  const [editingFolder, setEditingFolder] = useState<OutputFolder | null>(null);
  const [deleteFolderId, setDeleteFolderId] = useState<string | null>(null);

  const [modifierModalOpen, setModifierModalOpen] = useState(false);
  const [editingModifier, setEditingModifier] = useState<{ id: string; name: string; formula: string; applyFrom: number; applyTo: number; hasFullVariant: boolean } | null>(null);
  const [deleteModifierId, setDeleteModifierId] = useState<string | null>(null);

  const [ratioModalOpen, setRatioModalOpen] = useState(false);
  const [editingRatio, setEditingRatio] = useState<{ id: string; name: string; ratioA: number; ratioB: number } | null>(null);
  const [deleteRatioId, setDeleteRatioId] = useState<string | null>(null);

  const [variantModalOpen, setVariantModalOpen] = useState(false);
  const [editingVariant, setEditingVariant] = useState<typeof responsiveVariants[0] | null>(null);
  const [deleteVariantId, setDeleteVariantId] = useState<string | null>(null);

  // Get selected folder
  const selectedFolder = outputFolders.find(f => f.id === selectedFolderId);

  // Generator context for token calculations
  const generatorContext: FolderGeneratorContext = useMemo(() => ({
    styles,
    viewports,
    baseParameters,
    computedParameters,
    modifiers,
    ratioFamilies,
    responsiveVariants,
  }), [styles, viewports, baseParameters, computedParameters, modifiers, ratioFamilies, responsiveVariants]);

  // Preview tokens for selected folder (including children if grouping folder)
  const previewTokens = useMemo(() => {
    if (!selectedFolder) return [];
    
    // If folder has path, it generates tokens directly
    if (selectedFolder.path) {
      return getTokenPreviewForFolder(selectedFolder, generatorContext);
    }
    
    // Grouping folder - collect tokens from all children recursively
    const collectChildTokens = (parentId: string): { name: string; values: Record<string, number> }[] => {
      const children = outputFolders.filter(f => f.parentId === parentId);
      let allTokens: { name: string; values: Record<string, number> }[] = [];
      
      for (const child of children) {
        if (child.path) {
          allTokens = [...allTokens, ...getTokenPreviewForFolder(child, generatorContext)];
        } else {
          // Nested grouping folder
          allTokens = [...allTokens, ...collectChildTokens(child.id)];
        }
      }
      return allTokens;
    };
    
    return collectChildTokens(selectedFolder.id);
  }, [selectedFolder, generatorContext, outputFolders]);

  // Get max columns from styles
  const maxColumns = Math.max(...styles.map(s => s.columns), 12);

  // Build folder tree
  const rootFolders = outputFolders.filter(f => f.parentId === null);
  const getChildren = (parentId: string) => outputFolders.filter(f => f.parentId === parentId);

  const toggleFolderExpanded = (folderId: string) => {
    setExpandedFolders(prev => {
      const next = new Set(prev);
      if (next.has(folderId)) {
        next.delete(folderId);
      } else {
        next.add(folderId);
      }
      return next;
    });
  };

  // Calculate total tokens dynamically
  const totalTokens = useMemo(() => {
    return outputFolders.reduce((sum, f) => {
      // Skip folders without path (grouping folders)
      if (!f.path) return sum;
      return sum + calculateFolderTokenCount(f, generatorContext);
    }, 0);
  }, [outputFolders, generatorContext]);

  // Calculate token count per folder
  const folderTokenCounts = useMemo(() => {
    const counts: Record<string, number> = {};
    outputFolders.forEach(f => {
      counts[f.id] = f.path ? calculateFolderTokenCount(f, generatorContext) : 0;
    });
    return counts;
  }, [outputFolders, generatorContext]);

  // === FOLDER HANDLERS ===
  const handleAddFolder = (data: { name: string; path: string; tokenPrefix: string; parentId: string | null }) => {
    addOutputFolder({
      name: data.name,
      parentId: data.parentId,
      path: data.path,
      tokenPrefix: data.tokenPrefix,
      enabledModifiers: [],
      enabledResponsiveVariants: [],
      multiplyByRatio: false,
      enabledRatios: [],
    });
    setFolderModalOpen(false);
  };

  const handleEditFolder = (data: { name: string; path: string; tokenPrefix: string; parentId: string | null }) => {
    if (editingFolder) {
      updateOutputFolder(editingFolder.id, data);
      setEditingFolder(null);
    }
  };

  const handleDeleteFolder = () => {
    if (deleteFolderId) {
      removeOutputFolder(deleteFolderId);
      setDeleteFolderId(null);
    }
  };

  // === MODIFIER HANDLERS ===
  const handleAddModifier = (data: { name: string; formula: string; applyFrom: number; applyTo: number; hasFullVariant: boolean }) => {
    addModifier(data);
    setModifierModalOpen(false);
  };

  const handleEditModifier = (data: { name: string; formula: string; applyFrom: number; applyTo: number; hasFullVariant: boolean }) => {
    if (editingModifier) {
      updateModifier(editingModifier.id, data);
      setEditingModifier(null);
    }
  };

  const handleDeleteModifier = () => {
    if (deleteModifierId) {
      removeModifier(deleteModifierId);
      setDeleteModifierId(null);
    }
  };

  // === RATIO HANDLERS ===
  const handleAddRatio = (data: { name: string; ratioA: number; ratioB: number }) => {
    addRatioFamily(data);
    setRatioModalOpen(false);
  };

  const handleEditRatio = (data: { name: string; ratioA: number; ratioB: number }) => {
    if (editingRatio) {
      updateRatioFamily(editingRatio.id, data);
      setEditingRatio(null);
    }
  };

  const handleDeleteRatio = () => {
    if (deleteRatioId) {
      removeRatioFamily(deleteRatioId);
      setDeleteRatioId(null);
    }
  };

  // === RESPONSIVE VARIANT HANDLERS ===
  const handleAddVariant = (data: { 
    name: string; 
    description?: string;
    viewportBehaviors: Array<{
      viewportId: string;
      behavior: 'inherit' | 'override';
      overrideColumns?: number;
    }>;
  }) => {
    addResponsiveVariant({
      name: data.name,
      description: data.description,
      ratioConfigs: [],
      viewportBehaviors: data.viewportBehaviors,
    });
    setVariantModalOpen(false);
  };

  const handleEditVariant = (data: { 
    name: string; 
    description?: string;
    viewportBehaviors: Array<{
      viewportId: string;
      behavior: 'inherit' | 'override';
      overrideColumns?: number;
    }>;
  }) => {
    if (editingVariant) {
      updateResponsiveVariant(editingVariant.id, {
        name: data.name,
        description: data.description,
        viewportBehaviors: data.viewportBehaviors,
      });
      setEditingVariant(null);
    }
  };

  const handleDeleteVariant = () => {
    if (deleteVariantId) {
      removeResponsiveVariant(deleteVariantId);
      setDeleteVariantId(null);
    }
  };

  // Helper: Get behavior summary for a variant
  const getVariantBehaviorSummary = (variant: typeof responsiveVariants[0]) => {
    const overrides = variant.viewportBehaviors.filter(vb => vb.behavior === 'override');
    if (overrides.length === 0) return 'All inherit';
    return overrides.map(vb => {
      const vp = viewports.find(v => v.id === vb.viewportId);
      return `${vp?.name || 'Unknown'}→${vb.overrideColumns}`;
    }).join(', ');
  };

  // Render folder tree item
  const renderFolderItem = (folder: OutputFolder, depth: number = 0) => {
    const children = getChildren(folder.id);
    const hasChildren = children.length > 0;
    const isExpanded = expandedFolders.has(folder.id);
    const isSelected = selectedFolderId === folder.id;

    return (
      <div key={folder.id}>
        <div
          className={`folder-tree-item ${isSelected ? 'active' : ''}`}
          style={{ paddingLeft: 12 + depth * 16 }}
          onClick={() => selectFolder(folder.id)}
        >
          {hasChildren ? (
            <button
              className="folder-tree-item__chevron"
              onClick={(e) => {
                e.stopPropagation();
                toggleFolderExpanded(folder.id);
              }}
            >
              <Icon name={isExpanded ? 'chev-d' : 'chev-r'} size="xs" />
            </button>
          ) : (
            <span className="folder-tree-item__chevron" />
          )}
          <Icon name="folder" size="sm" />
          <span className="folder-tree-item__name">{folder.name}</span>
          {folderTokenCounts[folder.id] > 0 && (
            <span className="folder-tree-item__count">{folderTokenCounts[folder.id]}</span>
          )}
          <div className="folder-tree-item__actions">
            <button
              className="action-btn"
              onClick={(e) => {
                e.stopPropagation();
                setEditingFolder(folder);
              }}
            >
              <Icon name="edit" size="xs" />
            </button>
            <button
              className="action-btn action-btn--danger"
              onClick={(e) => {
                e.stopPropagation();
                setDeleteFolderId(folder.id);
              }}
            >
              <Icon name="trash" size="xs" />
            </button>
          </div>
        </div>
        {hasChildren && isExpanded && (
          <div className="folder-tree-children">
            {children.map(child => renderFolderItem(child, depth + 1))}
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="generators-layout-v2">
      {/* Left panel - Folder tree */}
      <div className="folders-panel">
        <div className="folders-panel__header">
          <span className="folders-panel__title">Output Folders</span>
          <span className="folders-panel__count">{totalTokens} tokens</span>
        </div>
        <div className="folders-panel__content">
          <div className="folder-tree">
            {rootFolders.map(folder => renderFolderItem(folder))}
          </div>
          <div
            className="add-row"
            style={{ margin: '8px 12px' }}
            onClick={() => setFolderModalOpen(true)}
          >
            <div className="add-row__icon">
              <Icon name="plus" size="xs" />
            </div>
            <span>Add output folder</span>
          </div>
        </div>
      </div>

      {/* Center panel - Preview */}
      <div className="preview-panel">
        {selectedFolder ? (
          <>
            <div className="preview-panel__header">
              <div className="preview-panel__title">
                <Icon name="folder" size="sm" />
                <span>{selectedFolder.name}</span>
              </div>
              <div className="preview-panel__stats">
                <span className="preview-panel__stat">{folderTokenCounts[selectedFolder.id]} tokens</span>
                <span className="preview-panel__stat">{selectedFolder.enabledModifiers.length} modifiers</span>
                <span className="preview-panel__stat">{selectedFolder.enabledResponsiveVariants.length} variants</span>
              </div>
            </div>
            <div className="preview-panel__content">
              {/* Token preview table - real calculated values */}
              <table className="preview-table">
                <thead>
                  <tr>
                    <th>Token</th>
                    {styles.map(s => (
                      <th key={s.id}>{s.name}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {previewTokens.map((token, idx) => {
                    // Check if token has a modifier
                    const hasModifier = modifiers.some(m => token.name.includes(m.name));
                    const modifierMatch = modifiers.find(m => token.name.includes(m.name));
                    
                    return (
                      <tr key={idx}>
                        <td className="preview-table__token">
                          <span className="token-name">
                            {hasModifier && modifierMatch ? (
                              <>
                                {token.name.replace(modifierMatch.name, '')}
                                <span className="token-modifier">{modifierMatch.name}</span>
                              </>
                            ) : (
                              token.name
                            )}
                          </span>
                        </td>
                        {styles.map(s => (
                          <td key={s.id} className="preview-table__value">
                            {token.values[s.id] !== undefined ? token.values[s.id] : '—'}
                          </td>
                        ))}
                      </tr>
                    );
                  })}
                  {previewTokens.length === 0 && (
                    <tr>
                      <td colSpan={styles.length + 1} className="preview-table__more">
                        No tokens generated
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
              
              {/* Viewport info */}
              <div className="preview-viewports">
                <span className="preview-viewports__label">Across {viewports.length} viewports:</span>
                {viewports.map(vp => (
                  <span key={vp.id} className="preview-viewports__badge">
                    <Icon name={vp.icon} size="xs" />
                    {vp.name}
                  </span>
                ))}
              </div>
            </div>
          </>
        ) : (
          <div className="preview-panel__empty">
            <Icon name="folder" size="lg" />
            <span>Select a folder to see preview</span>
          </div>
        )}
      </div>

      {/* Right panel - Config */}
      <div className="config-panel">
        {selectedFolder ? (
          <>
            <div className="config-panel__header">
              <span className="config-panel__title">Configuration</span>
            </div>
            <div className="config-panel__content">
              {/* Output Path */}
              <div className="config-group">
                <label className="config-label">Output Path</label>
                <input
                  type="text"
                  className="config-input config-input--mono"
                  value={selectedFolder.path}
                  onChange={(e) => updateOutputFolder(selectedFolder.id, { path: e.target.value })}
                  placeholder="{viewport}/{responsive}"
                />
                <span className="config-hint">Variables: {'{viewport}'}, {'{responsive}'}, {'{ratio}'}</span>
              </div>

              {/* Token Prefix */}
              <div className="config-group">
                <label className="config-label">Token Prefix</label>
                <input
                  type="text"
                  className="config-input config-input--mono"
                  value={selectedFolder.tokenPrefix}
                  onChange={(e) => updateOutputFolder(selectedFolder.id, { tokenPrefix: e.target.value })}
                  placeholder="v-col-"
                />
              </div>

              {/* Modifiers */}
              <div className="config-group">
                <label className="config-label">Modifiers</label>
                <div className="config-checkboxes">
                  {modifiers.map(mod => (
                    <label key={mod.id} className="config-checkbox">
                      <input
                        type="checkbox"
                        checked={selectedFolder.enabledModifiers.includes(mod.id)}
                        onChange={(e) => toggleFolderModifier(selectedFolder.id, mod.id, e.target.checked)}
                      />
                      <span className="config-checkbox__box">
                        {selectedFolder.enabledModifiers.includes(mod.id) && (
                          <Icon name="check" size="xs" />
                        )}
                      </span>
                      <span className="config-checkbox__label">{mod.name}</span>
                      <span className="config-checkbox__range">{mod.applyFrom}-{mod.applyTo}</span>
                    </label>
                  ))}
                </div>
              </div>

              {/* Responsive Variants */}
              <div className="config-group">
                <label className="config-label">
                  Responsive Variants
                  {responsiveVariants.length === 0 && (
                    <span className="config-label__badge">Add variants first</span>
                  )}
                </label>
                {responsiveVariants.length === 0 ? (
                  <p className="config-hint">
                    Define responsive variants in the left sidebar first, then enable them here.
                  </p>
                ) : (
                  <div className="responsive-checkbox-list">
                    {responsiveVariants.map(rv => {
                      const isEnabled = selectedFolder.enabledResponsiveVariants.includes(rv.id);
                      return (
                        <div 
                          key={rv.id} 
                          className={`responsive-checkbox-item ${isEnabled ? 'checked' : ''}`}
                          onClick={() => toggleFolderResponsive(selectedFolder.id, rv.id, !isEnabled)}
                        >
                          <div className="responsive-checkbox-item__checkbox">
                            <div className={`checkbox ${isEnabled ? 'checked' : ''}`}>
                              {isEnabled && <Icon name="check" size="xs" />}
                            </div>
                          </div>
                          <div className="responsive-checkbox-item__info">
                            <div className="responsive-checkbox-item__name">{rv.name}</div>
                            <div className="responsive-checkbox-item__summary">
                              {getVariantBehaviorSummary(rv)}
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
                {selectedFolder.enabledResponsiveVariants.length > 0 && !selectedFolder.path.includes('{responsive}') && (
                  <p className="config-hint" style={{ marginTop: 8, color: 'var(--orange)' }}>
                    ⚠️ Add <code>{'{responsive}'}</code> to path template to generate variant subfolders
                  </p>
                )}
              </div>

              {/* Multiply by Ratio toggle */}
              <div className="config-group">
                <label className="config-toggle">
                  <input
                    type="checkbox"
                    checked={selectedFolder.multiplyByRatio}
                    onChange={(e) => updateOutputFolder(selectedFolder.id, { multiplyByRatio: e.target.checked })}
                  />
                  <span className="config-toggle__track">
                    <span className="config-toggle__thumb" />
                  </span>
                  <span className="config-toggle__label">Multiply by ratio</span>
                </label>
              </div>

              {/* Ratio selection (if multiplyByRatio enabled) - single selection */}
              {selectedFolder.multiplyByRatio && (
                <div className="config-group config-group--nested">
                  <label className="config-label">Ratio (select one)</label>
                  <div className="config-checkboxes">
                    {ratioFamilies.map(ratio => (
                      <label key={ratio.id} className="config-checkbox">
                        <input
                          type="radio"
                          name="selectedRatio"
                          checked={selectedFolder.enabledRatios[0] === ratio.id}
                          onChange={() => updateOutputFolder(selectedFolder.id, { enabledRatios: [ratio.id] })}
                        />
                        <span className="config-checkbox__box config-checkbox__box--radio">
                          {selectedFolder.enabledRatios[0] === ratio.id && (
                            <span className="config-radio__dot" />
                          )}
                        </span>
                        <div
                          className="ratio-preview-small"
                          style={{ aspectRatio: `${ratio.ratioA}/${ratio.ratioB}` }}
                        />
                        <span className="config-checkbox__label">{ratio.name}</span>
                        <span className="config-checkbox__range">{ratio.ratioA}:{ratio.ratioB}</span>
                      </label>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </>
        ) : (
          <div className="config-panel__empty">
            <span>Select a folder to configure</span>
          </div>
        )}
      </div>

      {/* Global definitions sidebar */}
      <div className="generators-sidebar">
        {/* Viewports */}
        <div className="sidebar-section">
          <div className="sidebar-section__header">
            <span className="sidebar-section__title">Viewports</span>
            <span className="sidebar-section__count">{viewports.length}</span>
          </div>
          <div className="sidebar-section__content">
            {viewports.map(vp => (
              <div key={vp.id} className="viewport-card-small">
                <Icon name={vp.icon} size="sm" />
                <span className="viewport-card-small__name">{vp.name}</span>
                <span className="viewport-card-small__width">{vp.width}px</span>
              </div>
            ))}
          </div>
        </div>

        {/* Modifiers */}
        <div className="sidebar-section">
          <div className="sidebar-section__header">
            <span className="sidebar-section__title">Modifiers</span>
            <span className="sidebar-section__count">{modifiers.length}</span>
          </div>
          <div className="sidebar-section__content">
            <SortableList
              items={modifiers}
              onReorder={reorderModifiers}
              renderItem={(mod) => (
                <div className="modifier-row">
                  <div className="drag-handle" onClick={(e) => e.stopPropagation()}>
                    <svg width="12" height="12" viewBox="0 0 24 24" fill="currentColor">
                      <circle cx="9" cy="5" r="2"/>
                      <circle cx="15" cy="5" r="2"/>
                      <circle cx="9" cy="12" r="2"/>
                      <circle cx="15" cy="12" r="2"/>
                      <circle cx="9" cy="19" r="2"/>
                      <circle cx="15" cy="19" r="2"/>
                    </svg>
                  </div>
                  <span className="modifier-row__name">{mod.name}</span>
                  <span className="modifier-row__formula">{mod.formula}</span>
                  <div className="modifier-row__actions">
                    <button
                      className="action-btn"
                      onClick={(e) => {
                        e.stopPropagation();
                        setEditingModifier({
                          id: mod.id,
                          name: mod.name,
                          formula: mod.formula,
                          applyFrom: mod.applyFrom,
                          applyTo: mod.applyTo,
                          hasFullVariant: mod.hasFullVariant,
                        });
                      }}
                    >
                      <Icon name="edit" size="xs" />
                    </button>
                    <button
                      className="action-btn action-btn--danger"
                      onClick={(e) => {
                        e.stopPropagation();
                        setDeleteModifierId(mod.id);
                      }}
                    >
                      <Icon name="trash" size="xs" />
                    </button>
                  </div>
                </div>
              )}
            />
            <div className="add-row" onClick={() => setModifierModalOpen(true)}>
              <div className="add-row__icon">
                <Icon name="plus" size="xs" />
              </div>
              <span>Add modifier</span>
            </div>
          </div>
        </div>

        {/* Ratio Families */}
        <div className="sidebar-section">
          <div className="sidebar-section__header">
            <span className="sidebar-section__title">Ratio Families</span>
            <span className="sidebar-section__count">{ratioFamilies.length}</span>
          </div>
          <div className="sidebar-section__content">
            {ratioFamilies.map(ratio => (
              <div key={ratio.id} className="modifier-row">
                <div
                  className="ratio-row__preview"
                  style={{ aspectRatio: `${ratio.ratioA}/${ratio.ratioB}` }}
                />
                <span className="modifier-row__name">{ratio.name}</span>
                <span className="modifier-row__formula">{ratio.ratioA}:{ratio.ratioB}</span>
                <div className="modifier-row__actions">
                  <button
                    className="action-btn"
                    onClick={() => setEditingRatio({
                      id: ratio.id,
                      name: ratio.name,
                      ratioA: ratio.ratioA,
                      ratioB: ratio.ratioB,
                    })}
                  >
                    <Icon name="edit" size="xs" />
                  </button>
                  <button
                    className="action-btn action-btn--danger"
                    onClick={() => setDeleteRatioId(ratio.id)}
                  >
                    <Icon name="trash" size="xs" />
                  </button>
                </div>
              </div>
            ))}
            <div className="add-row" onClick={() => setRatioModalOpen(true)}>
              <div className="add-row__icon">
                <Icon name="plus" size="xs" />
              </div>
              <span>Add ratio family</span>
            </div>
          </div>
        </div>

        {/* Responsive Variants */}
        <div className="sidebar-section">
          <div className="sidebar-section__header">
            <span className="sidebar-section__title">Responsive Variants</span>
            <span className="sidebar-section__count">{responsiveVariants.length}</span>
          </div>
          <div className="sidebar-section__content">
            {responsiveVariants.length === 0 ? (
              <p className="empty-hint">
                No variants yet. Add variants like "static" or "to-tab-6-col" to control column behavior per viewport.
              </p>
            ) : (
              responsiveVariants.map(rv => (
                <div key={rv.id} className="variant-card" onClick={() => setEditingVariant(rv)}>
                  <div className="variant-card__header">
                    <span className="variant-card__name">{rv.name}</span>
                    <div className="variant-card__actions" onClick={e => e.stopPropagation()}>
                      <button
                        className="action-btn"
                        onClick={() => setEditingVariant(rv)}
                      >
                        <Icon name="edit" size="xs" />
                      </button>
                      <button
                        className="action-btn action-btn--danger"
                        onClick={() => setDeleteVariantId(rv.id)}
                      >
                        <Icon name="trash" size="xs" />
                      </button>
                    </div>
                  </div>
                  <div className="variant-card__behaviors">
                    {viewports.map(vp => {
                      const behavior = rv.viewportBehaviors.find(vb => vb.viewportId === vp.id);
                      const isOverride = behavior?.behavior === 'override';
                      return (
                        <span 
                          key={vp.id} 
                          className={`variant-card__behavior ${isOverride ? 'variant-card__behavior--override' : 'variant-card__behavior--inherit'}`}
                        >
                          {vp.name.slice(0, 3)}
                          {isOverride ? `→${behavior?.overrideColumns}` : ''}
                        </span>
                      );
                    })}
                  </div>
                </div>
              ))
            )}
            <div className="add-row" onClick={() => setVariantModalOpen(true)}>
              <div className="add-row__icon">
                <Icon name="plus" size="xs" />
              </div>
              <span>Add variant</span>
            </div>
          </div>
        </div>
      </div>

      {/* MODALS */}
      <FolderModal
        isOpen={folderModalOpen}
        onClose={() => setFolderModalOpen(false)}
        onSave={handleAddFolder}
        folders={outputFolders}
      />

      <FolderModal
        isOpen={!!editingFolder}
        onClose={() => setEditingFolder(null)}
        onSave={handleEditFolder}
        editData={editingFolder}
        folders={outputFolders}
      />

      <ConfirmDeleteModal
        isOpen={!!deleteFolderId}
        onClose={() => setDeleteFolderId(null)}
        onConfirm={handleDeleteFolder}
        title="Delete Folder"
        message="Are you sure you want to delete this folder? All child folders will also be deleted."
        itemName={outputFolders.find(f => f.id === deleteFolderId)?.name || 'folder'}
      />

      <ModifierModal
        isOpen={modifierModalOpen}
        onClose={() => setModifierModalOpen(false)}
        onSave={handleAddModifier}
        maxColumns={maxColumns}
      />

      <ModifierModal
        isOpen={!!editingModifier}
        onClose={() => setEditingModifier(null)}
        onSave={handleEditModifier}
        editData={editingModifier}
        maxColumns={maxColumns}
      />

      <ConfirmDeleteModal
        isOpen={!!deleteModifierId}
        onClose={() => setDeleteModifierId(null)}
        onConfirm={handleDeleteModifier}
        title="Delete Modifier"
        message="Are you sure you want to delete this modifier?"
        itemName={modifiers.find(m => m.id === deleteModifierId)?.name || 'modifier'}
      />

      <RatioModal
        isOpen={ratioModalOpen}
        onClose={() => setRatioModalOpen(false)}
        onSave={handleAddRatio}
      />

      <RatioModal
        isOpen={!!editingRatio}
        onClose={() => setEditingRatio(null)}
        onSave={handleEditRatio}
        editData={editingRatio}
      />

      <ConfirmDeleteModal
        isOpen={!!deleteRatioId}
        onClose={() => setDeleteRatioId(null)}
        onConfirm={handleDeleteRatio}
        title="Delete Ratio"
        message="Are you sure you want to delete this ratio family?"
        itemName={ratioFamilies.find(r => r.id === deleteRatioId)?.name || 'ratio'}
      />

      <ResponsiveVariantModal
        isOpen={variantModalOpen}
        onClose={() => setVariantModalOpen(false)}
        onSave={handleAddVariant}
        viewports={viewports}
        styles={styles}
      />

      <ResponsiveVariantModal
        isOpen={!!editingVariant}
        onClose={() => setEditingVariant(null)}
        onSave={handleEditVariant}
        editData={editingVariant}
        viewports={viewports}
        styles={styles}
      />

      <ConfirmDeleteModal
        isOpen={!!deleteVariantId}
        onClose={() => setDeleteVariantId(null)}
        onConfirm={handleDeleteVariant}
        title="Delete Variant"
        message="Are you sure you want to delete this responsive variant?"
        itemName={responsiveVariants.find(v => v.id === deleteVariantId)?.name || 'variant'}
      />
    </div>
  );
}
