import { useState, useMemo } from 'react';
import { Icon } from '../Icons';
import { useGridStore } from '../../store';
import { ModifierModal, RatioModal, ConfirmDeleteModal, ResponsiveVariantModal, FolderModal } from '../Modals';
import type { OutputFolder } from '../../types';
import { getTokenPreviewForFolder, calculateFolderTokenCount, type FolderGeneratorContext } from '../../engine/generator';

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
    toggleFolderRatio,
    addModifier,
    updateModifier,
    removeModifier,
    addRatioFamily,
    updateRatioFamily,
    removeRatioFamily,
    addResponsiveVariant,
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
      generateHeight: false,
      widthPrefix: '',
      heightPrefix: '',
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
  const handleAddVariant = (data: { name: string; description?: string }) => {
    addResponsiveVariant({
      name: data.name,
      description: data.description,
      ratioConfigs: [],
      viewportBehaviors: [],
    });
    setVariantModalOpen(false);
  };

  const handleDeleteVariant = () => {
    if (deleteVariantId) {
      removeResponsiveVariant(deleteVariantId);
      setDeleteVariantId(null);
    }
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
                <label className="config-label">Responsive Variants</label>
                <div className="config-checkboxes">
                  {responsiveVariants.map(rv => (
                    <label key={rv.id} className="config-checkbox">
                      <input
                        type="checkbox"
                        checked={selectedFolder.enabledResponsiveVariants.includes(rv.id)}
                        onChange={(e) => toggleFolderResponsive(selectedFolder.id, rv.id, e.target.checked)}
                      />
                      <span className="config-checkbox__box">
                        {selectedFolder.enabledResponsiveVariants.includes(rv.id) && (
                          <Icon name="check" size="xs" />
                        )}
                      </span>
                      <span className="config-checkbox__label">{rv.name}</span>
                    </label>
                  ))}
                </div>
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

              {/* Ratios (if multiplyByRatio enabled) */}
              {selectedFolder.multiplyByRatio && (
                <div className="config-group config-group--nested">
                  <label className="config-label">Ratios</label>
                  <div className="config-checkboxes">
                    {ratioFamilies.map(ratio => (
                      <label key={ratio.id} className="config-checkbox">
                        <input
                          type="checkbox"
                          checked={selectedFolder.enabledRatios.includes(ratio.id)}
                          onChange={(e) => toggleFolderRatio(selectedFolder.id, ratio.id, e.target.checked)}
                        />
                        <span className="config-checkbox__box">
                          {selectedFolder.enabledRatios.includes(ratio.id) && (
                            <Icon name="check" size="xs" />
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

              {/* Generate Height toggle */}
              <div className="config-group">
                <label className="config-toggle">
                  <input
                    type="checkbox"
                    checked={selectedFolder.generateHeight}
                    onChange={(e) => updateOutputFolder(selectedFolder.id, { generateHeight: e.target.checked })}
                  />
                  <span className="config-toggle__track">
                    <span className="config-toggle__thumb" />
                  </span>
                  <span className="config-toggle__label">Generate height</span>
                </label>
              </div>

              {/* Width/Height prefixes (if generateHeight enabled) */}
              {selectedFolder.generateHeight && (
                <div className="config-group config-group--nested config-group--row">
                  <div className="config-field">
                    <label className="config-label">Width prefix</label>
                    <input
                      type="text"
                      className="config-input config-input--mono"
                      value={selectedFolder.widthPrefix}
                      onChange={(e) => updateOutputFolder(selectedFolder.id, { widthPrefix: e.target.value })}
                      placeholder="w-col-"
                    />
                  </div>
                  <div className="config-field">
                    <label className="config-label">Height prefix</label>
                    <input
                      type="text"
                      className="config-input config-input--mono"
                      value={selectedFolder.heightPrefix}
                      onChange={(e) => updateOutputFolder(selectedFolder.id, { heightPrefix: e.target.value })}
                      placeholder="h-col-"
                    />
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
            {modifiers.map(mod => (
              <div key={mod.id} className="modifier-row">
                <span className="modifier-row__name">{mod.name}</span>
                <span className="modifier-row__formula">{mod.formula}</span>
                <div className="modifier-row__actions">
                  <button
                    className="action-btn"
                    onClick={() => setEditingModifier({
                      id: mod.id,
                      name: mod.name,
                      formula: mod.formula,
                      applyFrom: mod.applyFrom,
                      applyTo: mod.applyTo,
                      hasFullVariant: mod.hasFullVariant,
                    })}
                  >
                    <Icon name="edit" size="xs" />
                  </button>
                  <button
                    className="action-btn action-btn--danger"
                    onClick={() => setDeleteModifierId(mod.id)}
                  >
                    <Icon name="trash" size="xs" />
                  </button>
                </div>
              </div>
            ))}
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
            {responsiveVariants.map(rv => (
              <div key={rv.id} className="modifier-row">
                <span className="modifier-row__name">{rv.name}</span>
                {rv.description && (
                  <span className="modifier-row__formula">{rv.description}</span>
                )}
                <div className="modifier-row__actions">
                  <button
                    className="action-btn action-btn--danger"
                    onClick={() => setDeleteVariantId(rv.id)}
                  >
                    <Icon name="trash" size="xs" />
                  </button>
                </div>
              </div>
            ))}
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
