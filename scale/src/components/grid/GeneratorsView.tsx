import { useState } from 'react';
import { Icon } from '../Icons';
import { useGridStore } from '../../store';
import { ModifierModal, RatioModal, ConfirmDeleteModal, ResponsiveVariantModal } from '../Modals';

export function GeneratorsView() {
  const {
    responsiveVariants,
    ratioFamilies,
    modifiers,
    toggleRatioInVariant,
    toggleModifierInRatio,
    addModifier,
    updateModifier,
    removeModifier,
    addRatioFamily,
    updateRatioFamily,
    removeRatioFamily,
    addResponsiveVariant,
    updateResponsiveVariant,
    removeResponsiveVariant,
    styles,
  } = useGridStore();

  const [expandedVariants, setExpandedVariants] = useState<Set<string>>(
    new Set([responsiveVariants[0]?.id])
  );

  // Modifier modal state
  const [modifierModalOpen, setModifierModalOpen] = useState(false);
  const [editingModifier, setEditingModifier] = useState<{ id: string; name: string; formula: string; applyFrom: number; applyTo: number; hasFullVariant: boolean } | null>(null);
  const [deleteModifierId, setDeleteModifierId] = useState<string | null>(null);

  // Ratio modal state
  const [ratioModalOpen, setRatioModalOpen] = useState(false);
  const [editingRatio, setEditingRatio] = useState<{ id: string; name: string; ratioA: number; ratioB: number } | null>(null);
  const [deleteRatioId, setDeleteRatioId] = useState<string | null>(null);

  // Responsive Variant modal state
  const [variantModalOpen, setVariantModalOpen] = useState(false);
  const [editingVariant, setEditingVariant] = useState<{ id: string; name: string; description?: string } | null>(null);
  const [deleteVariantId, setDeleteVariantId] = useState<string | null>(null);

  // Get max columns from styles
  const maxColumns = Math.max(...styles.map(s => s.columns), 12);

  const toggleVariantExpanded = (variantId: string) => {
    setExpandedVariants((prev) => {
      const next = new Set(prev);
      if (next.has(variantId)) {
        next.delete(variantId);
      } else {
        next.add(variantId);
      }
      return next;
    });
  };

  const getRatioConfig = (variantId: string, ratioId: string) => {
    const variant = responsiveVariants.find((rv) => rv.id === variantId);
    return variant?.ratioConfigs.find((rc) => rc.ratioId === ratioId);
  };

  // Calculate token count for a variant (simplified)
  const getTokenCount = (variantId: string) => {
    const variant = responsiveVariants.find((rv) => rv.id === variantId);
    if (!variant) return 0;
    
    let count = 0;
    variant.ratioConfigs.forEach((rc) => {
      if (rc.enabled) {
        // Base tokens (12 columns) + modifiers
        count += 12 * (1 + rc.enabledModifiers.length);
      }
    });
    return count * 4; // × 4 viewports
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

  const openEditModifier = (mod: typeof modifiers[0]) => {
    setEditingModifier({
      id: mod.id,
      name: mod.name,
      formula: mod.formula,
      applyFrom: mod.applyFrom,
      applyTo: mod.applyTo,
      hasFullVariant: mod.hasFullVariant,
    });
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

  const openEditRatio = (ratio: typeof ratioFamilies[0]) => {
    setEditingRatio({
      id: ratio.id,
      name: ratio.name,
      ratioA: ratio.ratioA,
      ratioB: ratio.ratioB,
    });
  };

  // === RESPONSIVE VARIANT HANDLERS ===
  const handleAddVariant = (data: { name: string; description?: string }) => {
    // Create new variant with default ratioConfigs for all existing ratios
    addResponsiveVariant({
      name: data.name,
      description: data.description,
      ratioConfigs: ratioFamilies.map(rf => ({
        ratioId: rf.id,
        enabled: false,
        enabledModifiers: [],
      })),
      viewportBehaviors: [],
    });
    setVariantModalOpen(false);
  };

  const handleEditVariant = (data: { name: string; description?: string }) => {
    if (editingVariant) {
      updateResponsiveVariant(editingVariant.id, data);
      setEditingVariant(null);
    }
  };

  const handleDeleteVariant = () => {
    if (deleteVariantId) {
      removeResponsiveVariant(deleteVariantId);
      setDeleteVariantId(null);
    }
  };

  const openEditVariant = (variant: typeof responsiveVariants[0]) => {
    setEditingVariant({
      id: variant.id,
      name: variant.name,
      description: variant.description,
    });
  };

  return (
    <div className="generators-layout">
      {/* Main content - Responsive variants */}
      <div className="generators-main">
        {/* Add responsive variant button */}
        <div style={{ padding: '12px 16px' }}>
          <button className="btn btn--ghost" style={{ width: '100%' }} onClick={() => setVariantModalOpen(true)}>
            <Icon name="plus" size="sm" />
            Add Responsive Variant
          </button>
        </div>

        {responsiveVariants.map((variant) => {
          const isExpanded = expandedVariants.has(variant.id);
          const enabledRatios = variant.ratioConfigs.filter((rc) => rc.enabled).length;
          const tokenCount = getTokenCount(variant.id);

          return (
            <div
              key={variant.id}
              className={`generator-panel ${isExpanded ? 'expanded' : ''}`}
            >
              <div
                className="generator-panel__header"
                onClick={() => toggleVariantExpanded(variant.id)}
              >
                <Icon name="chev-r" size="sm" className="generator-panel__chevron" />
                <span className="generator-panel__title">{variant.name}</span>
                <span className="generator-panel__badge">
                  {enabledRatios} ratios · {tokenCount} tokens
                </span>
                <div className="generator-panel__actions">
                  <button className="action-btn" onClick={(e) => { e.stopPropagation(); openEditVariant(variant); }}>
                    <Icon name="edit" size="sm" />
                  </button>
                  <button
                    className="action-btn action-btn--danger"
                    onClick={(e) => { e.stopPropagation(); setDeleteVariantId(variant.id); }}
                    disabled={responsiveVariants.length <= 1}
                  >
                    <Icon name="trash" size="sm" />
                  </button>
                </div>
              </div>

              {isExpanded && (
                <div className="generator-panel__body">
                  {/* Description */}
                  {variant.description && (
                    <p style={{ fontSize: 11, color: 'var(--text-muted)', marginBottom: 16 }}>
                      {variant.description}
                    </p>
                  )}

                  {/* Ratios & Modifiers */}
                  <div className="gen-section">
                    <div className="gen-section__header">
                      <span className="gen-section__title">Ratios & Modifiers</span>
                    </div>
                    <div className="ratio-grid">
                      {ratioFamilies.map((ratio) => {
                        const config = getRatioConfig(variant.id, ratio.id);
                        const isEnabled = config?.enabled ?? false;

                        return (
                          <div
                            key={ratio.id}
                            className={`ratio-card ${!isEnabled ? 'disabled' : ''}`}
                          >
                            <div className="ratio-card__header">
                              <div
                                className={`ratio-card__toggle ${isEnabled ? 'active' : ''}`}
                                onClick={() =>
                                  toggleRatioInVariant(variant.id, ratio.id, !isEnabled)
                                }
                              />
                              <span className="ratio-card__name">{ratio.name}</span>
                              <span className="ratio-card__value">
                                {ratio.ratioA}:{ratio.ratioB}
                              </span>
                            </div>

                            {isEnabled && (
                              <div className="ratio-card__modifiers">
                                {modifiers.map((mod) => {
                                  const isModEnabled =
                                    config?.enabledModifiers.includes(mod.id) ?? false;
                                  return (
                                    <div
                                      key={mod.id}
                                      className={`modifier-chip ${isModEnabled ? 'active' : ''}`}
                                      onClick={() =>
                                        toggleModifierInRatio(
                                          variant.id,
                                          ratio.id,
                                          mod.id,
                                          !isModEnabled
                                        )
                                      }
                                    >
                                      <span className="modifier-chip__check">
                                        {isModEnabled && <Icon name="check" size="xs" />}
                                      </span>
                                      {mod.name}
                                    </div>
                                  );
                                })}
                              </div>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Sidebar - Global definitions */}
      <div className="generators-sidebar">
        {/* Modifiers definition */}
        <div className="generator-panel expanded">
          <div className="generator-panel__header">
            <Icon name="chev-r" size="sm" className="generator-panel__chevron" />
            <span className="generator-panel__title">Modifiers</span>
            <span className="generator-panel__badge">{modifiers.length}</span>
          </div>
          <div className="generator-panel__body">
            <div className="modifiers-list">
              {modifiers.map((mod) => (
                <div key={mod.id} className="modifier-row">
                  <span className="modifier-row__name">{mod.name}</span>
                  <span className="modifier-row__formula">{mod.formula}</span>
                  <span className="modifier-row__range">
                    {mod.applyFrom}–{mod.applyTo}
                  </span>
                  <div className="modifier-row__actions">
                    <button className="action-btn" onClick={() => openEditModifier(mod)}>
                      <Icon name="edit" size="xs" />
                    </button>
                    <button className="action-btn action-btn--danger" onClick={() => setDeleteModifierId(mod.id)}>
                      <Icon name="trash" size="xs" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
            <div className="add-row" style={{ marginTop: 8 }} onClick={() => setModifierModalOpen(true)}>
              <div className="add-row__icon">
                <Icon name="plus" size="xs" />
              </div>
              <span>Add modifier</span>
            </div>
          </div>
        </div>

        {/* Ratios definition */}
        <div className="generator-panel expanded">
          <div className="generator-panel__header">
            <Icon name="chev-r" size="sm" className="generator-panel__chevron" />
            <span className="generator-panel__title">Ratio Families</span>
            <span className="generator-panel__badge">{ratioFamilies.length}</span>
          </div>
          <div className="generator-panel__body">
            <div className="modifiers-list">
              {ratioFamilies.map((ratio) => (
                <div key={ratio.id} className="modifier-row">
                  <div
                    className="ratio-row__preview"
                    style={{
                      aspectRatio: `${ratio.ratioA}/${ratio.ratioB}`,
                    }}
                  />
                  <span className="modifier-row__name">{ratio.name}</span>
                  <span className="modifier-row__formula">
                    {ratio.ratioA}:{ratio.ratioB}
                  </span>
                  <div className="modifier-row__actions">
                    <button className="action-btn" onClick={() => openEditRatio(ratio)}>
                      <Icon name="edit" size="xs" />
                    </button>
                    <button className="action-btn action-btn--danger" onClick={() => setDeleteRatioId(ratio.id)}>
                      <Icon name="trash" size="xs" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
            <div className="add-row" style={{ marginTop: 8 }} onClick={() => setRatioModalOpen(true)}>
              <div className="add-row__icon">
                <Icon name="plus" size="xs" />
              </div>
              <span>Add ratio family</span>
            </div>
          </div>
        </div>
      </div>

      {/* MODALS */}
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
        message="Are you sure you want to delete this modifier? This action cannot be undone."
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
        title="Delete Ratio Family"
        message="Are you sure you want to delete this ratio family? This action cannot be undone."
        itemName={ratioFamilies.find(r => r.id === deleteRatioId)?.name || 'ratio'}
      />

      {/* Responsive Variant Modals */}
      <ResponsiveVariantModal
        isOpen={variantModalOpen}
        onClose={() => setVariantModalOpen(false)}
        onSave={handleAddVariant}
      />

      <ResponsiveVariantModal
        isOpen={!!editingVariant}
        onClose={() => setEditingVariant(null)}
        onSave={handleEditVariant}
        editData={editingVariant}
      />

      <ConfirmDeleteModal
        isOpen={!!deleteVariantId}
        onClose={() => setDeleteVariantId(null)}
        onConfirm={handleDeleteVariant}
        title="Delete Responsive Variant"
        message="Are you sure you want to delete this responsive variant? All its configurations will be lost."
        itemName={responsiveVariants.find(v => v.id === deleteVariantId)?.name || 'variant'}
      />
    </div>
  );
}
