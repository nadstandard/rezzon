import { useState } from 'react';
import { Icon } from '../Icons';
import { useGridStore } from '../../store';

export function GeneratorsView() {
  const {
    responsiveVariants,
    ratioFamilies,
    modifiers,
    toggleRatioInVariant,
    toggleModifierInRatio,
  } = useGridStore();

  const [expandedVariants, setExpandedVariants] = useState<Set<string>>(
    new Set([responsiveVariants[0]?.id])
  );

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

  return (
    <div className="generators-layout">
      {/* Main content - Responsive variants */}
      <div className="generators-main">
        {/* Add responsive variant button */}
        <div style={{ padding: '12px 16px' }}>
          <button className="btn btn--ghost" style={{ width: '100%' }}>
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
                  <button className="action-btn" onClick={(e) => e.stopPropagation()}>
                    <Icon name="edit" size="sm" />
                  </button>
                  <button
                    className="action-btn action-btn--danger"
                    onClick={(e) => e.stopPropagation()}
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
                  <button className="action-btn">
                    <Icon name="edit" size="xs" />
                  </button>
                </div>
              ))}
            </div>
            <div className="add-row" style={{ marginTop: 8 }}>
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
                  <button className="action-btn">
                    <Icon name="edit" size="xs" />
                  </button>
                </div>
              ))}
            </div>
            <div className="add-row" style={{ marginTop: 8 }}>
              <div className="add-row__icon">
                <Icon name="plus" size="xs" />
              </div>
              <span>Add ratio family</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
