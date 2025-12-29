// ============================================
// REZZON Scale – Token Generator
// ============================================

import type { 
  Style, 
  Modifier, 
  RatioFamily,
  ResponsiveVariant,
  Viewport
} from '../types';

/**
 * Computed values needed for token generation
 */
interface ComputedValues {
  'column-width': number;
  'ingrid': number;
  'photo-margin': number;
  'number-of-gutters': number;
  [key: string]: number;
}

/**
 * Base values needed for token generation  
 */
interface BaseValues {
  viewport: number;
  gutter: number;
  'margin-m': number;
  'margin-xs': number;
  columns: number;
  [key: string]: number;
}

/**
 * Context for generating tokens for one style
 */
interface GeneratorContext {
  styleId: string;
  styleName: string;
  columns: number;
  base: BaseValues;
  computed: ComputedValues;
}

// ============================================
// COLUMN TOKENS (grid/column layer)
// ============================================

/**
 * Generate base column tokens: v-col-1, v-col-2, ... v-col-n
 */
export function generateColumnTokens(
  ctx: GeneratorContext
): { name: string; value: number }[] {
  const tokens: { name: string; value: number }[] = [];
  const colWidth = ctx.computed['column-width'];
  const gutter = ctx.base.gutter;

  // v-col-1 to v-col-n (where n = number of columns)
  for (let col = 1; col <= ctx.columns; col++) {
    const value = colWidth * col + gutter * (col - 1);
    tokens.push({
      name: `v-col-${col}`,
      value: Math.round(value * 100) / 100, // Round to 2 decimals
    });
  }

  // v-full = ingrid (full width within margins)
  tokens.push({
    name: 'v-full',
    value: ctx.computed['ingrid'],
  });

  // v-col-viewport = full viewport width
  tokens.push({
    name: 'v-col-viewport',
    value: ctx.base.viewport,
  });

  return tokens;
}

/**
 * Apply a modifier to a base token value
 */
export function applyModifier(
  baseValue: number,
  modifier: Modifier,
  ctx: GeneratorContext
): number {
  const colWidth = ctx.computed['column-width'];
  const gutter = ctx.base.gutter;
  const marginM = ctx.base['margin-m'];
  const photoMargin = ctx.computed['photo-margin'];

  // Parse and apply formula
  // Supported formulas: "+ column-width/2", "+ photo-margin", "+ margin-m", "+ gutter"
  const formula = modifier.formula.trim();

  if (formula === '+ column-width/2' || formula === '+ col-width/2') {
    return baseValue + colWidth / 2;
  }
  if (formula === '+ photo-margin') {
    return baseValue + photoMargin;
  }
  if (formula === '+ margin-m') {
    return baseValue + marginM;
  }
  if (formula === '+ gutter') {
    return baseValue + gutter;
  }
  if (formula.startsWith('+ ') && formula.includes('gutter')) {
    // Handle "+ 2×gutter" style formulas
    const match = formula.match(/\+\s*(\d+)?[×x]?\s*gutter/);
    if (match) {
      const multiplier = match[1] ? parseInt(match[1]) : 1;
      return baseValue + gutter * multiplier;
    }
  }

  // Unknown formula - return base value unchanged
  console.warn(`Unknown modifier formula: ${formula}`);
  return baseValue;
}

/**
 * Generate column tokens with modifiers
 */
export function generateColumnTokensWithModifiers(
  ctx: GeneratorContext,
  modifiers: Modifier[]
): { name: string; value: number; modifier?: string }[] {
  const tokens: { name: string; value: number; modifier?: string }[] = [];
  const baseTokens = generateColumnTokens(ctx);

  // Track if we've already generated v-full variants
  let fullVariantsGenerated = false;

  baseTokens.forEach((baseToken) => {
    // Add base token
    tokens.push({ ...baseToken });

    // Extract column number for range checking
    const colMatch = baseToken.name.match(/v-col-(\d+)$/);
    const colNum = colMatch ? parseInt(colMatch[1]) : null;
    const isVFull = baseToken.name === 'v-full';

    // Apply each modifier to regular column tokens
    if (colNum !== null) {
      modifiers.forEach((mod) => {
        // Check if modifier applies to this column
        if (colNum < mod.applyFrom || colNum > mod.applyTo) {
          return; // Skip - out of range
        }

        const modifiedValue = applyModifier(baseToken.value, mod, ctx);
        tokens.push({
          name: `${baseToken.name}${mod.name}`,
          value: Math.round(modifiedValue * 100) / 100,
          modifier: mod.name,
        });
      });
    }

    // Generate v-full variants (only once when we hit v-full token)
    if (isVFull && !fullVariantsGenerated) {
      fullVariantsGenerated = true;
      
      modifiers
        .filter((mod) => mod.hasFullVariant)
        .forEach((mod) => {
          // For full variants, apply modifier twice (symmetry: both sides)
          const photoMargin = ctx.computed['photo-margin'];
          const ingrid = ctx.computed['ingrid'];

          let fullValue = ingrid;
          if (mod.formula.includes('photo-margin')) {
            fullValue = ingrid + 2 * photoMargin;
          } else if (mod.formula.includes('margin-m')) {
            fullValue = ctx.base.viewport; // ingrid + 2×margin-m = viewport
          }

          tokens.push({
            name: `v-full${mod.name}`,
            value: Math.round(fullValue * 100) / 100,
            modifier: mod.name,
          });
        });
    }

    // Skip viewport token for modifiers (it's a special case)
    // v-col-viewport doesn't get modifiers
  });

  return tokens;
}

// ============================================
// PHOTO TOKENS (grid/photo layer)
// ============================================

/**
 * Generate photo width tokens (same as column tokens)
 */
export function generatePhotoWidthTokens(
  ctx: GeneratorContext,
  modifiers: Modifier[]
): { name: string; value: number; modifier?: string }[] {
  // Photo widths use same formula as columns, just different prefix
  return generateColumnTokensWithModifiers(ctx, modifiers).map((token) => ({
    ...token,
    name: token.name.replace('v-col', 'w-col').replace('v-full', 'w-full'),
  }));
}

/**
 * Generate photo height tokens for a specific ratio
 */
export function generatePhotoHeightTokens(
  ctx: GeneratorContext,
  modifiers: Modifier[],
  ratio: RatioFamily,
  enabledModifierIds: string[]
): { name: string; value: number; modifier?: string; ratio: string }[] {
  const tokens: { name: string; value: number; modifier?: string; ratio: string }[] = [];
  
  // Filter to only enabled modifiers
  const activeModifiers = modifiers.filter((m) => enabledModifierIds.includes(m.id));
  
  // Get width tokens first
  const widthTokens = generateColumnTokensWithModifiers(ctx, activeModifiers);

  // Calculate height from width using ratio
  const ratioMultiplier = ratio.ratioB / ratio.ratioA;

  widthTokens.forEach((widthToken) => {
    const height = widthToken.value * ratioMultiplier;
    tokens.push({
      name: widthToken.name.replace('v-col', 'h-col').replace('v-full', 'h-full'),
      value: Math.round(height * 100) / 100,
      modifier: widthToken.modifier,
      ratio: ratio.name,
    });
  });

  return tokens;
}

// ============================================
// FULL TOKEN GENERATION
// ============================================

export interface GeneratedTokenSet {
  layer: string;
  viewport: string;
  style: string;
  responsive?: string;
  ratio?: string;
  tokens: { name: string; value: number; modifier?: string }[];
}

/**
 * Generate all tokens for a viewport/style combination
 */
export function generateAllTokens(
  viewport: Viewport,
  style: Style,
  base: BaseValues,
  computed: ComputedValues,
  modifiers: Modifier[],
  ratioFamilies: RatioFamily[],
  responsiveVariants: ResponsiveVariant[]
): GeneratedTokenSet[] {
  const results: GeneratedTokenSet[] = [];

  const ctx: GeneratorContext = {
    styleId: style.id,
    styleName: style.name,
    columns: style.columns,
    base,
    computed,
  };

  // 1. Column layer (grid/column/{viewport})
  const columnTokens = generateColumnTokensWithModifiers(ctx, modifiers);
  results.push({
    layer: 'grid/column',
    viewport: viewport.name.toLowerCase(),
    style: style.name,
    tokens: columnTokens,
  });

  // 2. Photo width layer (grid/photo/width/{viewport}/{responsive})
  responsiveVariants.forEach((variant) => {
    const widthTokens = generatePhotoWidthTokens(ctx, modifiers);
    results.push({
      layer: 'grid/photo/width',
      viewport: viewport.name.toLowerCase(),
      style: style.name,
      responsive: variant.name,
      tokens: widthTokens,
    });

    // 3. Photo height layer (grid/photo/height/{viewport}/{responsive}/{ratio})
    variant.ratioConfigs
      .filter((rc) => rc.enabled)
      .forEach((ratioConfig) => {
        const ratio = ratioFamilies.find((rf) => rf.id === ratioConfig.ratioId);
        if (!ratio) return;

        const heightTokens = generatePhotoHeightTokens(
          ctx,
          modifiers,
          ratio,
          ratioConfig.enabledModifiers
        );

        results.push({
          layer: 'grid/photo/height',
          viewport: viewport.name.toLowerCase(),
          style: style.name,
          responsive: variant.name,
          ratio: ratio.name,
          tokens: heightTokens,
        });
      });
  });

  return results;
}

// ============================================
// TOKEN COUNTING
// ============================================

/**
 * Count total tokens that will be generated
 */
export function countTokens(
  viewports: Viewport[],
  styles: Style[],
  modifiers: Modifier[],
  responsiveVariants: ResponsiveVariant[]
): {
  total: number;
  byLayer: Record<string, number>;
} {
  let total = 0;
  const byLayer: Record<string, number> = {
    'grid/column': 0,
    'grid/photo/width': 0,
    'grid/photo/height': 0,
  };

  // For each viewport × style combination
  viewports.forEach(() => {
    styles.forEach((style) => {
      const cols = style.columns;

      // Column tokens: 
      // - v-col-1 to v-col-n (cols)
      // - v-full (1)
      // - v-col-viewport (1)
      // - modifiers for applicable columns
      // - v-full variants for modifiers with hasFullVariant
      let columnCount = cols + 2; // base tokens: v-col-1...n + v-full + v-col-viewport
      
      modifiers.forEach((mod) => {
        const applicableCols = Math.min(mod.applyTo, cols) - mod.applyFrom + 1;
        columnCount += Math.max(0, applicableCols);
        if (mod.hasFullVariant) columnCount += 1; // v-full-xxx
      });

      byLayer['grid/column'] += columnCount;

      // Photo tokens per responsive variant
      responsiveVariants.forEach((variant) => {
        // Width = same as column (w-col-X)
        byLayer['grid/photo/width'] += columnCount;

        // Height = width × enabled ratios (h-col-X per ratio)
        const enabledRatios = variant.ratioConfigs.filter((rc) => rc.enabled).length;
        byLayer['grid/photo/height'] += columnCount * enabledRatios;
      });
    });
  });

  total = Object.values(byLayer).reduce((sum, count) => sum + count, 0);

  return { total, byLayer };
}

// ============================================
// FULL EXPORT GENERATION
// ============================================

export interface ExportToken {
  path: string;           // Full path: grid/column/desktop/v-col-1
  name: string;           // Token name: v-col-1
  values: Record<string, number>; // Values per style: { cross: 140, circle: 140 }
}

export interface ExportData {
  tokens: ExportToken[];
  metadata: {
    generatedAt: string;
    viewportCount: number;
    styleCount: number;
    totalTokens: number;
  };
}

/**
 * Generate complete export data with all tokens
 */
export function generateExportData(
  viewports: Viewport[],
  styles: Style[],
  baseParameters: { name: string; values: Record<string, number> }[],
  computedParameters: { name: string; values: Record<string, number> }[],
  modifiers: Modifier[],
  ratioFamilies: RatioFamily[],
  responsiveVariants: ResponsiveVariant[]
): ExportData {
  const tokens: ExportToken[] = [];

  // Helper to get param value for a style
  const getBase = (paramName: string, styleId: string) =>
    baseParameters.find((p) => p.name === paramName)?.values[styleId] ?? 0;
  const getComputed = (paramName: string, styleId: string) =>
    computedParameters.find((p) => p.name === paramName)?.values[styleId] ?? 0;

  viewports.forEach((viewport) => {
    const vpName = viewport.name.toLowerCase();

    // Build token sets for each style, then merge by token name
    const tokenMap: Record<string, ExportToken> = {};

    styles.forEach((style) => {
      const ctx: GeneratorContext = {
        styleId: style.id,
        styleName: style.name,
        columns: style.columns,
        base: {
          viewport: getBase('viewport', style.id) || viewport.width,
          gutter: getBase('gutter-width', style.id),
          'margin-m': getBase('margin-m', style.id),
          'margin-xs': getBase('margin-xs', style.id),
          columns: style.columns,
        },
        computed: {
          'column-width': getComputed('column-width', style.id),
          'ingrid': getComputed('ingrid', style.id),
          'photo-margin': getComputed('photo-margin', style.id),
          'number-of-gutters': getComputed('number-of-gutters', style.id),
        },
      };

      // 1. Column layer
      const columnTokens = generateColumnTokensWithModifiers(ctx, modifiers);
      columnTokens.forEach((t) => {
        const path = `grid/column/${vpName}/${t.name}`;
        if (!tokenMap[path]) {
          tokenMap[path] = { path, name: t.name, values: {} };
        }
        tokenMap[path].values[style.name.toLowerCase()] = t.value;
      });

      // 2. Photo layers per responsive variant
      responsiveVariants.forEach((variant) => {
        // Width tokens
        const widthTokens = generatePhotoWidthTokens(ctx, modifiers);
        widthTokens.forEach((t) => {
          const path = `grid/photo/width/${vpName}/${variant.name}/${t.name}`;
          if (!tokenMap[path]) {
            tokenMap[path] = { path, name: t.name, values: {} };
          }
          tokenMap[path].values[style.name.toLowerCase()] = t.value;
        });

        // Height tokens per enabled ratio
        variant.ratioConfigs
          .filter((rc) => rc.enabled)
          .forEach((ratioConfig) => {
            const ratio = ratioFamilies.find((rf) => rf.id === ratioConfig.ratioId);
            if (!ratio) return;

            const heightTokens = generatePhotoHeightTokens(
              ctx,
              modifiers,
              ratio,
              ratioConfig.enabledModifiers
            );

            heightTokens.forEach((t) => {
              const path = `grid/photo/height/${vpName}/${variant.name}/${ratio.name}/${t.name}`;
              if (!tokenMap[path]) {
                tokenMap[path] = { path, name: t.name, values: {} };
              }
              tokenMap[path].values[style.name.toLowerCase()] = t.value;
            });
          });
      });
    });

    // Add all tokens from this viewport
    tokens.push(...Object.values(tokenMap));
  });

  return {
    tokens,
    metadata: {
      generatedAt: new Date().toISOString(),
      viewportCount: viewports.length,
      styleCount: styles.length,
      totalTokens: tokens.length,
    },
  };
}
