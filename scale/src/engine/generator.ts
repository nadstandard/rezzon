// ============================================
// REZZON Scale – Token Generator
// ============================================

import type { 
  Style, 
  Modifier, 
  RatioFamily,
  ResponsiveVariant,
  Viewport,
  OutputFolder,
  BaseParameter,
  ComputedParameter
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
// ============================================
// FIGMA VARIABLES FORMAT
// ============================================

export interface FigmaVariable {
  id: string;
  name: string;
  type: 'FLOAT' | 'STRING' | 'BOOLEAN' | 'COLOR';
  description: string;
  hiddenFromPublishing: boolean;
  scopes: string[];
  codeSyntax: Record<string, unknown>;
  valuesByMode: Record<string, { type: string; value: number | string | boolean }>;
}

export interface FigmaMode {
  id: string;
  name: string;
}

export interface FigmaCollection {
  id: string;
  name: string;
  defaultModeId: string;
  hiddenFromPublishing: boolean;
  modes: FigmaMode[];
  variables: FigmaVariable[];
}

export interface FigmaExport {
  version: string;
  exportedAt: string;
  fileName: string;
  collections: FigmaCollection[];
}

/**
 * Generate export in Figma Variables API format
 */
export function generateFigmaExport(
  viewports: Viewport[],
  styles: Style[],
  baseParameters: { name: string; values: Record<string, number> }[],
  computedParameters: { name: string; values: Record<string, number> }[],
  modifiers: Modifier[],
  ratioFamilies: RatioFamily[],
  responsiveVariants: ResponsiveVariant[],
  collectionName: string = 'Grid'
): FigmaExport {
  // Generate mode IDs for each style
  const modes: FigmaMode[] = styles.map((style, idx) => ({
    id: `mode:${idx + 1}`,
    name: style.name.toUpperCase(),
  }));

  const defaultModeId = modes[0]?.id || 'mode:1';

  // Map style ID to mode ID
  const styleModeMap: Record<string, string> = {};
  styles.forEach((style, idx) => {
    styleModeMap[style.id] = modes[idx].id;
  });

  const variables: FigmaVariable[] = [];
  let varIndex = 1;

  // Helper to create a variable
  const createVariable = (
    name: string,
    valuesByStyle: Record<string, number>
  ): FigmaVariable => {
    const valuesByMode: Record<string, { type: string; value: number }> = {};
    
    styles.forEach((style) => {
      const modeId = styleModeMap[style.id];
      const value = valuesByStyle[style.id] ?? 0;
      valuesByMode[modeId] = { type: 'FLOAT', value: Math.round(value) };
    });

    return {
      id: `VariableID:new:${varIndex++}`,
      name,
      type: 'FLOAT',
      description: '',
      hiddenFromPublishing: false,
      scopes: ['ALL_SCOPES'],
      codeSyntax: {},
      valuesByMode,
    };
  };

  // Helper to get param values
  const getBase = (paramName: string): Record<string, number> => {
    const param = baseParameters.find((p) => p.name === paramName);
    return param?.values ?? {};
  };

  const getComputed = (paramName: string): Record<string, number> => {
    const param = computedParameters.find((p) => p.name === paramName);
    return param?.values ?? {};
  };

  // 1. Base parameters (base/{viewport}/*)
  viewports.forEach((viewport) => {
    const vpName = viewport.name.toLowerCase();

    // Base editable params
    variables.push(createVariable(`base/${vpName}/viewport-edit`, getBase('viewport')));
    variables.push(createVariable(`base/${vpName}/number-of-columns-edit`, 
      Object.fromEntries(styles.map(s => [s.id, s.columns]))
    ));
    variables.push(createVariable(`base/${vpName}/gutter-width-edit`, getBase('gutter-width')));
    variables.push(createVariable(`base/${vpName}/margin-m-edit`, getBase('margin-m')));
    variables.push(createVariable(`base/${vpName}/margin-xs-edit`, getBase('margin-xs')));

    // Computed params
    variables.push(createVariable(`base/${vpName}/number-of-gutters`, getComputed('number-of-gutters')));
    variables.push(createVariable(`base/${vpName}/column-width`, getComputed('column-width')));
    variables.push(createVariable(`base/${vpName}/ingrid`, getComputed('ingrid')));
    variables.push(createVariable(`base/${vpName}/photo-margin`, getComputed('photo-margin')));
  });

  // 2. Ratio params (base/ratio/*)
  ratioFamilies.forEach((ratio) => {
    const ratioValues: Record<string, number> = {};
    styles.forEach((s) => { ratioValues[s.id] = ratio.ratioA; });
    variables.push(createVariable(`base/ratio/${ratio.name}-a`, ratioValues));

    const ratioBValues: Record<string, number> = {};
    styles.forEach((s) => { ratioBValues[s.id] = ratio.ratioB; });
    variables.push(createVariable(`base/ratio/${ratio.name}-b`, ratioBValues));
  });

  // 3. Generated tokens
  viewports.forEach((viewport) => {
    const vpName = viewport.name.toLowerCase();

    styles.forEach((style) => {
      const base = {
        viewport: getBase('viewport')[style.id] || viewport.width,
        gutter: getBase('gutter-width')[style.id] || 0,
        'margin-m': getBase('margin-m')[style.id] || 0,
        'margin-xs': getBase('margin-xs')[style.id] || 0,
        columns: style.columns,
      };

      const computed = {
        'column-width': getComputed('column-width')[style.id] || 0,
        'ingrid': getComputed('ingrid')[style.id] || 0,
        'photo-margin': getComputed('photo-margin')[style.id] || 0,
        'number-of-gutters': getComputed('number-of-gutters')[style.id] || 0,
      };

      const ctx: GeneratorContext = {
        styleId: style.id,
        styleName: style.name,
        columns: style.columns,
        base,
        computed,
      };

      // Column tokens
      const columnTokens = generateColumnTokensWithModifiers(ctx, modifiers);
      columnTokens.forEach((t) => {
        const varName = `column/${vpName}/${t.name}`;
        const existingVar = variables.find((v) => v.name === varName);
        if (existingVar) {
          existingVar.valuesByMode[styleModeMap[style.id]] = { 
            type: 'FLOAT', 
            value: Math.round(t.value) 
          };
        } else {
          const values: Record<string, number> = {};
          values[style.id] = t.value;
          variables.push(createVariable(varName, values));
        }
      });

      // Photo tokens per responsive variant
      responsiveVariants.forEach((variant) => {
        // Width tokens
        const widthTokens = generatePhotoWidthTokens(ctx, modifiers);
        widthTokens.forEach((t) => {
          const varName = `photo/${vpName}/width/${variant.name}/${t.name}`;
          const existingVar = variables.find((v) => v.name === varName);
          if (existingVar) {
            existingVar.valuesByMode[styleModeMap[style.id]] = { 
              type: 'FLOAT', 
              value: Math.round(t.value) 
            };
          } else {
            const values: Record<string, number> = {};
            values[style.id] = t.value;
            variables.push(createVariable(varName, values));
          }
        });

        // Height tokens per ratio
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
              const varName = `photo/${vpName}/height/${variant.name}/${ratio.name}/${t.name}`;
              const existingVar = variables.find((v) => v.name === varName);
              if (existingVar) {
                existingVar.valuesByMode[styleModeMap[style.id]] = { 
                  type: 'FLOAT', 
                  value: Math.round(t.value) 
                };
              } else {
                const values: Record<string, number> = {};
                values[style.id] = t.value;
                variables.push(createVariable(varName, values));
              }
            });
          });
      });
    });
  });

  return {
    version: '1.0',
    exportedAt: new Date().toISOString(),
    fileName: collectionName,
    collections: [
      {
        id: `VariableCollectionId:new:1`,
        name: collectionName,
        defaultModeId,
        hiddenFromPublishing: false,
        modes,
        variables,
      },
    ],
  };
}

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

// ============================================
// OUTPUT FOLDER GENERATION (v0.3.0 architecture)
// ============================================

/**
 * Token generated for a folder
 */
export interface FolderToken {
  name: string;
  path?: string;                    // Full path with resolved template
  values: Record<string, number>;   // styleId -> value
  modifier?: string;
  ratio?: string;
  viewport?: string;                // If generated per viewport
  responsive?: string;              // If generated per responsive variant
}

/**
 * Context for folder token generation
 */
export interface FolderGeneratorContext {
  styles: Style[];
  viewports: Viewport[];
  baseParameters: BaseParameter[];
  computedParameters: ComputedParameter[];
  modifiers: Modifier[];
  ratioFamilies: RatioFamily[];
  responsiveVariants: ResponsiveVariant[];
}

/**
 * Parse path template and return expansion info
 */
export function parsePathTemplate(template: string): {
  hasViewport: boolean;
  hasResponsive: boolean;
  hasRatio: boolean;
} {
  return {
    hasViewport: template.includes('{viewport}'),
    hasResponsive: template.includes('{responsive}'),
    hasRatio: template.includes('{ratio}'),
  };
}

/**
 * Resolve path template with actual values
 */
export function resolvePathTemplate(
  template: string,
  viewport?: string,
  responsive?: string,
  ratio?: string
): string {
  let path = template;
  if (viewport) path = path.replace('{viewport}', viewport.toLowerCase());
  if (responsive) path = path.replace('{responsive}', responsive);
  if (ratio) path = path.replace('{ratio}', ratio);
  return path;
}

/**
 * Get base/computed values for a specific style
 */
function getStyleContext(
  styleId: string,
  style: Style,
  baseParameters: BaseParameter[],
  computedParameters: ComputedParameter[]
): { base: BaseValues; computed: ComputedValues } {
  const getBase = (name: string): number => 
    baseParameters.find(p => p.name === name)?.values[styleId] ?? 0;
  const getComputed = (name: string): number =>
    computedParameters.find(p => p.name === name)?.values[styleId] ?? 0;

  return {
    base: {
      viewport: getBase('viewport'),
      gutter: getBase('gutter-width'),
      'margin-m': getBase('margin-m'),
      'margin-xs': getBase('margin-xs'),
      columns: style.columns,
    },
    computed: {
      'column-width': getComputed('column-width'),
      'ingrid': getComputed('ingrid'),
      'photo-margin': getComputed('photo-margin'),
      'number-of-gutters': getComputed('number-of-gutters'),
    },
  };
}

/**
 * Generate base width tokens (without viewport/responsive expansion)
 */
function generateBaseWidthTokens(
  folder: OutputFolder,
  ctx: FolderGeneratorContext
): FolderToken[] {
  const tokens: FolderToken[] = [];
  const enabledMods = ctx.modifiers.filter(m => folder.enabledModifiers.includes(m.id));
  const maxColumns = Math.max(...ctx.styles.map(s => s.columns));
  const prefix = folder.generateHeight ? (folder.widthPrefix || 'w-col-') : folder.tokenPrefix;
  
  // Generate base column tokens (1 to maxColumns)
  for (let col = 1; col <= maxColumns; col++) {
    const token: FolderToken = {
      name: `${prefix}${col}`,
      values: {},
    };
    
    ctx.styles.forEach(style => {
      if (col <= style.columns) {
        const { base, computed } = getStyleContext(
          style.id, style, ctx.baseParameters, ctx.computedParameters
        );
        const colWidth = computed['column-width'];
        const gutter = base.gutter;
        token.values[style.id] = Math.round(colWidth * col + gutter * (col - 1));
      }
    });
    
    if (Object.keys(token.values).length > 0) {
      tokens.push(token);
    }
    
    // Apply modifiers to this column
    enabledMods.forEach(mod => {
      if (col >= mod.applyFrom && col <= mod.applyTo) {
        const modToken: FolderToken = {
          name: `${prefix}${col}${mod.name}`,
          values: {},
          modifier: mod.name,
        };
        
        ctx.styles.forEach(style => {
          if (col <= style.columns) {
            const { base, computed } = getStyleContext(
              style.id, style, ctx.baseParameters, ctx.computedParameters
            );
            const genCtx: GeneratorContext = {
              styleId: style.id,
              styleName: style.name,
              columns: style.columns,
              base,
              computed,
            };
            const colWidth = computed['column-width'];
            const gutter = base.gutter;
            const baseValue = colWidth * col + gutter * (col - 1);
            modToken.values[style.id] = Math.round(applyModifier(baseValue, mod, genCtx));
          }
        });
        
        if (Object.keys(modToken.values).length > 0) {
          tokens.push(modToken);
        }
      }
    });
  }
  
  // Add 'full' token
  const fullPrefix = prefix.replace(/col-?$/, '');
  const fullToken: FolderToken = {
    name: `${fullPrefix}full`,
    values: {},
  };
  ctx.styles.forEach(style => {
    const { computed } = getStyleContext(
      style.id, style, ctx.baseParameters, ctx.computedParameters
    );
    fullToken.values[style.id] = Math.round(computed['ingrid']);
  });
  tokens.push(fullToken);
  
  // Add full variants for modifiers with hasFullVariant
  enabledMods.filter(m => m.hasFullVariant).forEach(mod => {
    const fullModToken: FolderToken = {
      name: `${fullPrefix}full${mod.name}`,
      values: {},
      modifier: mod.name,
    };
    
    ctx.styles.forEach(style => {
      const { base, computed } = getStyleContext(
        style.id, style, ctx.baseParameters, ctx.computedParameters
      );
      const ingrid = computed['ingrid'];
      const photoMargin = computed['photo-margin'];
      const viewport = base.viewport;
      
      let value = ingrid;
      if (mod.formula.includes('photo-margin')) {
        value = ingrid + 2 * photoMargin;
      } else if (mod.formula.includes('margin-m')) {
        value = viewport;
      }
      fullModToken.values[style.id] = Math.round(value);
    });
    tokens.push(fullModToken);
  });
  
  return tokens;
}

/**
 * Generate height tokens from width tokens for a specific ratio
 */
function generateHeightTokensForRatio(
  widthTokens: FolderToken[],
  ratio: RatioFamily,
  folder: OutputFolder
): FolderToken[] {
  const ratioMultiplier = ratio.ratioB / ratio.ratioA;
  const widthPrefix = folder.widthPrefix || 'w-col-';
  const heightPrefix = folder.heightPrefix || 'h-col-';
  
  return widthTokens.map(widthToken => {
    // Replace width prefix with height prefix, then append ratio name
    let heightName = widthToken.name.replace(widthPrefix, heightPrefix).replace('w-full', 'h-full');
    // Append ratio name to prevent conflicts between different ratios
    heightName = `${heightName}-${ratio.name}`;
    
    return {
      name: heightName,
      values: Object.fromEntries(
        Object.entries(widthToken.values).map(([styleId, widthValue]) => [
          styleId,
          Math.round(widthValue * ratioMultiplier)
        ])
      ),
      modifier: widthToken.modifier,
      ratio: ratio.name,
    };
  });
}

/**
 * Generate tokens for an OutputFolder (for preview - single set)
 */
export function generateTokensForFolder(
  folder: OutputFolder,
  ctx: FolderGeneratorContext
): FolderToken[] {
  const widthTokens = generateBaseWidthTokens(folder, ctx);
  
  // If generateHeight is true, generate ONLY height tokens (width tokens are in separate folder)
  if (folder.generateHeight && folder.enabledRatios.length > 0) {
    const enabledRatios = ctx.ratioFamilies.filter(r => folder.enabledRatios.includes(r.id));
    const allHeightTokens: FolderToken[] = [];
    
    enabledRatios.forEach(ratio => {
      const heightTokens = generateHeightTokensForRatio(widthTokens, ratio, folder);
      allHeightTokens.push(...heightTokens);
    });
    
    // Return ONLY height tokens, not width tokens
    return allHeightTokens;
  }
  
  return widthTokens;
}

/**
 * Generate all tokens for export with full path expansion
 */
export function generateAllTokensForFolder(
  folder: OutputFolder,
  ctx: FolderGeneratorContext
): FolderToken[] {
  const templateInfo = parsePathTemplate(folder.path);
  const baseTokens = generateBaseWidthTokens(folder, ctx);
  const allTokens: FolderToken[] = [];
  
  // Determine viewports to iterate
  const viewportsToUse = templateInfo.hasViewport 
    ? ctx.viewports 
    : [{ id: 'default', name: 'default', width: 0, icon: 'monitor' as const }];
  
  // Determine responsive variants to iterate
  const responsivesToUse = templateInfo.hasResponsive && folder.enabledResponsiveVariants.length > 0
    ? ctx.responsiveVariants.filter(rv => folder.enabledResponsiveVariants.includes(rv.id))
    : [{ id: 'default', name: 'default', ratioConfigs: [], viewportBehaviors: [] }];
  
  // Determine ratios
  const enabledRatios = folder.generateHeight && folder.enabledRatios.length > 0
    ? ctx.ratioFamilies.filter(r => folder.enabledRatios.includes(r.id))
    : [];
  
  // Expand tokens across viewports and responsive variants
  viewportsToUse.forEach(viewport => {
    responsivesToUse.forEach(responsive => {
      const vpName = viewport.name !== 'default' ? viewport.name : undefined;
      const rvName = responsive.name !== 'default' ? responsive.name : undefined;
      
      // If generateHeight, generate ONLY height tokens
      if (enabledRatios.length > 0) {
        // Height tokens per ratio
        enabledRatios.forEach(ratio => {
          const heightTokens = generateHeightTokensForRatio(baseTokens, ratio, folder);
          const ratioPath = folder.multiplyByRatio
            ? resolvePathTemplate(folder.path.replace('{ratio}', ratio.name), vpName, rvName)
            : resolvePathTemplate(folder.path, vpName, rvName);
          
          heightTokens.forEach(token => {
            allTokens.push({
              ...token,
              path: `${ratioPath}/${token.name}`,
              viewport: vpName,
              responsive: rvName,
            });
          });
        });
      } else {
        // Width tokens only
        baseTokens.forEach(token => {
          const basePath = resolvePathTemplate(folder.path, vpName, rvName);
          allTokens.push({
            ...token,
            path: `${basePath}/${token.name}`,
            viewport: vpName,
            responsive: rvName,
          });
        });
      }
    });
  });
  
  return allTokens;
}

/**
 * Calculate token count for an OutputFolder
 */
export function calculateFolderTokenCount(
  folder: OutputFolder,
  ctx: FolderGeneratorContext
): number {
  const maxColumns = Math.max(...ctx.styles.map(s => s.columns));
  const enabledMods = ctx.modifiers.filter(m => folder.enabledModifiers.includes(m.id));
  const templateInfo = parsePathTemplate(folder.path);
  
  // Base tokens: 1 per column + full
  let baseCount = maxColumns + 1;
  
  // Modifier tokens per column
  enabledMods.forEach(mod => {
    const applicableColumns = Math.min(mod.applyTo, maxColumns) - mod.applyFrom + 1;
    if (applicableColumns > 0) {
      baseCount += applicableColumns;
    }
  });
  
  // Full variants for modifiers with hasFullVariant
  baseCount += enabledMods.filter(m => m.hasFullVariant).length;
  
  // If generateHeight, count ONLY height tokens (width tokens are in separate folder)
  let totalCount: number;
  if (folder.generateHeight && folder.enabledRatios.length > 0) {
    // Height tokens only: base × number of ratios
    totalCount = baseCount * folder.enabledRatios.length;
  } else {
    // Width tokens only
    totalCount = baseCount;
  }
  
  // Multiply by viewports (if {viewport} in path)
  if (templateInfo.hasViewport) {
    totalCount *= ctx.viewports.length;
  }
  
  // Multiply by responsive variants (if {responsive} in path and variants enabled)
  if (templateInfo.hasResponsive && folder.enabledResponsiveVariants.length > 0) {
    totalCount *= folder.enabledResponsiveVariants.length;
  }
  
  return totalCount;
}

/**
 * Get preview data for a folder (first N tokens, first viewport)
 */
export function getTokenPreviewForFolder(
  folder: OutputFolder,
  ctx: FolderGeneratorContext
): { name: string; values: Record<string, number> }[] {
  const tokens = generateTokensForFolder(folder, ctx);
  return tokens.map(t => ({
    name: t.name,
    values: t.values,
  }));
}
