// ============================================
// REZZON Scale – Formula Engine
// ============================================

import type { BaseParameter, ComputedParameter, Style } from '../types';

/**
 * Context for formula evaluation - contains all base parameter values for a style
 */
interface FormulaContext {
  viewport: number;
  columns: number;
  gutter: number;
  'margin-m': number;
  'margin-xs': number;
  [key: string]: number;
}

/**
 * Build context from base parameters for a specific style
 * columns is passed separately as it comes from viewport, not style
 */
export function buildContext(
  baseParameters: BaseParameter[],
  styleId: string,
  columns: number = 12
): FormulaContext {
  const context: FormulaContext = {
    viewport: 0,
    columns: columns,
    gutter: 0,
    'margin-m': 0,
    'margin-xs': 0,
  };

  baseParameters.forEach((param) => {
    const value = param.values[styleId] ?? 0;
    
    // Map parameter names to context keys
    switch (param.name) {
      case 'viewport':
        context.viewport = value;
        break;
      case 'gutter-width':
        context.gutter = value;
        break;
      case 'margin-m':
        context['margin-m'] = value;
        break;
      case 'margin-xs':
        context['margin-xs'] = value;
        break;
      default:
        // Store any custom parameters
        context[param.name] = value;
    }
  });

  return context;
}

/**
 * Calculate all computed parameters for a style
 */
export function calculateComputed(ctx: FormulaContext): Record<string, number> {
  const computed: Record<string, number> = {};

  // number-of-gutters = columns - 1
  computed['number-of-gutters'] = ctx.columns - 1;

  // column-width = (viewport - 2×margin-m - (columns-1)×gutter) / columns
  computed['column-width'] = ctx.columns > 0
    ? (ctx.viewport - 2 * ctx['margin-m'] - (ctx.columns - 1) * ctx.gutter) / ctx.columns
    : 0;

  // ingrid = viewport - 2×margin-m
  computed['ingrid'] = ctx.viewport - 2 * ctx['margin-m'];

  // photo-margin = margin-m - margin-xs
  computed['photo-margin'] = ctx['margin-m'] - ctx['margin-xs'];

  return computed;
}

/**
 * Recalculate all computed parameters for all styles
 */
/**
 * Recalculate all computed parameters for all styles
 * viewportColumns: number of columns for current viewport (e.g., 2 for mobile, 12 for desktop)
 */
export function recalculateAllComputed(
  baseParameters: BaseParameter[],
  styles: Style[],
  viewportColumns: number = 12
): ComputedParameter[] {
  // Define computed parameters structure
  const computedDefs = [
    { id: 'cp-1', name: 'number-of-gutters', formula: 'columns - 1' },
    { id: 'cp-2', name: 'column-width', formula: '(viewport - 2×margin-m - (columns-1)×gutter) / columns' },
    { id: 'cp-3', name: 'ingrid', formula: 'viewport - 2×margin-m' },
    { id: 'cp-4', name: 'photo-margin', formula: 'margin-m - margin-xs' },
  ];

  return computedDefs.map((def) => {
    const values: Record<string, number> = {};

    styles.forEach((style) => {
      // Use viewportColumns for column-width calculation (e.g., 2 for mobile)
      const ctx = buildContext(baseParameters, style.id, viewportColumns);
      const computed = calculateComputed(ctx);
      values[style.id] = computed[def.name] ?? 0;
    });

    return {
      id: def.id,
      name: def.name,
      type: 'computed' as const,
      formula: def.formula,
      values,
    };
  });
}
