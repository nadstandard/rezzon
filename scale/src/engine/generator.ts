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
  columns: number;      // always 12 for grid structure
  maxColumns?: number;  // viewport's max columns (e.g., 2 for mobile) - clamp to ingrid above this
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
  const gutter = ctx.base.gutter;
  const marginM = ctx.base['margin-m'];
  const viewport = ctx.base.viewport;
  const ingrid = ctx.computed['ingrid'];
  const maxCols = ctx.maxColumns || ctx.columns; // viewport's columns (e.g., 2 for mobile)
  
  // Calculate column-width for THIS viewport's column count
  // Formula: (viewport - 2×margin-m - (maxCols-1)×gutter) / maxCols
  const colWidth = (viewport - 2 * marginM - (maxCols - 1) * gutter) / maxCols;

  // v-col-1 to v-col-n (where n = style.columns, typically 12)
  for (let col = 1; col <= ctx.columns; col++) {
    let value: number;
    
    if (col <= maxCols) {
      // Within viewport's column count - calculate normally
      value = colWidth * col + gutter * (col - 1);
    } else {
      // Exceeds viewport's columns - clamp to ingrid
      value = ingrid;
    }
    
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
 * Apply a modifier to a base token value using formula parser
 */
export function applyModifier(
  baseValue: number,
  modifier: Modifier,
  ctx: GeneratorContext
): number {
  const formula = modifier.formula.trim();
  if (!formula) return baseValue;
  
  // Build variable context for formula evaluation
  const variables: Record<string, number> = {
    // Base parameters
    'viewport': ctx.base.viewport,
    'gutter': ctx.base.gutter,
    'margin-m': ctx.base['margin-m'],
    'margin-xs': ctx.base['margin-xs'],
    'columns': ctx.columns,
    // Computed parameters
    'column-width': ctx.computed['column-width'],
    'col-width': ctx.computed['column-width'], // alias
    'ingrid': ctx.computed['ingrid'],
    'photo-margin': ctx.computed['photo-margin'],
    'number-of-gutters': ctx.computed['number-of-gutters'],
    // Base value reference
    'base': baseValue,
    'value': baseValue,
  };
  
  // Parse and evaluate formula
  const result = evaluateFormula(formula, variables, baseValue);
  return result;
}

/**
 * Evaluate a formula string with variables
 * Supports: +, -, *, /, parentheses, numbers, variable names
 * Formula can start with operator (e.g., "+ gutter") which applies to baseValue
 */
function evaluateFormula(
  formula: string, 
  variables: Record<string, number>,
  baseValue: number
): number {
  // Normalize formula
  let normalized = formula
    .replace(/×/g, '*')  // Replace × with *
    .replace(/÷/g, '/')  // Replace ÷ with /
    .trim();
  
  // If formula starts with operator, prepend base value
  if (/^[+\-*/]/.test(normalized)) {
    normalized = `${baseValue} ${normalized}`;
  }
  
  // Tokenize
  const tokens = tokenizeFormula(normalized);
  
  // Parse and evaluate
  try {
    const result = parseExpression(tokens, variables);
    return Math.round(result * 100) / 100; // Round to 2 decimals
  } catch (e) {
    console.warn(`Failed to parse formula: ${formula}`, e);
    return baseValue;
  }
}

/**
 * Tokenize formula string into tokens
 */
function tokenizeFormula(formula: string): string[] {
  const tokens: string[] = [];
  let current = '';
  
  for (let i = 0; i < formula.length; i++) {
    const char = formula[i];
    
    if (char === ' ') {
      if (current) {
        tokens.push(current);
        current = '';
      }
      continue;
    }
    
    if ('+-*/()'.includes(char)) {
      if (current) {
        tokens.push(current);
        current = '';
      }
      tokens.push(char);
      continue;
    }
    
    current += char;
  }
  
  if (current) {
    tokens.push(current);
  }
  
  return tokens;
}

/**
 * Parse expression with operator precedence
 * Grammar:
 *   expression = term (('+' | '-') term)*
 *   term = factor (('*' | '/') factor)*
 *   factor = number | variable | '(' expression ')'
 */
function parseExpression(tokens: string[], variables: Record<string, number>): number {
  let pos = 0;
  
  function parseExpr(): number {
    let left = parseTerm();
    
    while (pos < tokens.length && (tokens[pos] === '+' || tokens[pos] === '-')) {
      const op = tokens[pos++];
      const right = parseTerm();
      left = op === '+' ? left + right : left - right;
    }
    
    return left;
  }
  
  function parseTerm(): number {
    let left = parseFactor();
    
    while (pos < tokens.length && (tokens[pos] === '*' || tokens[pos] === '/')) {
      const op = tokens[pos++];
      const right = parseFactor();
      left = op === '*' ? left * right : left / right;
    }
    
    return left;
  }
  
  function parseFactor(): number {
    const token = tokens[pos];
    
    // Parentheses
    if (token === '(') {
      pos++;
      const result = parseExpr();
      if (tokens[pos] === ')') pos++;
      return result;
    }
    
    pos++;
    
    // Number
    const num = parseFloat(token);
    if (!isNaN(num)) {
      return num;
    }
    
    // Variable
    if (token in variables) {
      return variables[token];
    }
    
    // Unknown - return 0
    console.warn(`Unknown variable in formula: ${token}`);
    return 0;
  }
  
  return parseExpr();
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
    maxColumns: viewport.columns,  // clamp to ingrid above this
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
        maxColumns: viewport.columns,  // clamp to ingrid above this
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
        maxColumns: viewport.columns,  // clamp to ingrid above this
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
 * Generate tokens for a folder
 * Order: all base tokens first, then all tokens for each modifier (in global modifier order)
 * If multiplyByRatio is enabled and a ratio is selected, values are multiplied by ratio
 */
function generateBaseTokens(
  folder: OutputFolder,
  ctx: FolderGeneratorContext
): FolderToken[] {
  const tokens: FolderToken[] = [];
  const enabledMods = ctx.modifiers.filter(m => folder.enabledModifiers.includes(m.id));
  const maxColumns = Math.max(...ctx.styles.map(s => s.columns));
  const prefix = folder.tokenPrefix;
  const fullPrefix = prefix.replace(/col-?$/, '');
  
  // Get ratio multiplier if multiplyByRatio is enabled
  let ratioMultiplier = 1;
  if (folder.multiplyByRatio && folder.enabledRatios.length > 0) {
    const ratio = ctx.ratioFamilies.find(r => r.id === folder.enabledRatios[0]);
    if (ratio) {
      ratioMultiplier = ratio.ratioB / ratio.ratioA;
    }
  }
  
  // ============================================
  // PHASE 1: All base column tokens (1 to maxColumns)
  // ============================================
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
        const baseValue = colWidth * col + gutter * (col - 1);
        token.values[style.id] = Math.round(baseValue * ratioMultiplier);
      }
    });
    
    if (Object.keys(token.values).length > 0) {
      tokens.push(token);
    }
  }
  
  // ============================================
  // PHASE 2: Base 'full' token
  // ============================================
  const fullToken: FolderToken = {
    name: `${fullPrefix}full`,
    values: {},
  };
  ctx.styles.forEach(style => {
    const { computed } = getStyleContext(
      style.id, style, ctx.baseParameters, ctx.computedParameters
    );
    fullToken.values[style.id] = Math.round(computed['ingrid'] * ratioMultiplier);
  });
  tokens.push(fullToken);
  
  // ============================================
  // PHASE 3: All tokens for each modifier (in global order)
  // ============================================
  enabledMods.forEach(mod => {
    for (let col = 1; col <= maxColumns; col++) {
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
            const modifiedValue = applyModifier(baseValue, mod, genCtx);
            modToken.values[style.id] = Math.round(modifiedValue * ratioMultiplier);
          }
        });
        
        if (Object.keys(modToken.values).length > 0) {
          tokens.push(modToken);
        }
      }
    }
    
    // Full variant for this modifier (if applicable)
    if (mod.hasFullVariant) {
      const fullModToken: FolderToken = {
        name: `${fullPrefix}full${mod.name}`,
        values: {},
        modifier: mod.name,
      };
      
      ctx.styles.forEach(style => {
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
        const ingrid = computed['ingrid'];
        const modifiedValue = applyModifier(ingrid, mod, genCtx);
        fullModToken.values[style.id] = Math.round(modifiedValue * ratioMultiplier);
      });
      
      tokens.push(fullModToken);
    }
  });
  
  return tokens;
}

/**
 * Generate tokens for an OutputFolder (for preview - single set)
 */
export function generateTokensForFolder(
  folder: OutputFolder,
  ctx: FolderGeneratorContext
): FolderToken[] {
  return generateBaseTokens(folder, ctx);
}

/**
 * Generate all tokens for export with full path expansion
 * Now supports responsive variants with inherit/override column logic
 */
export function generateAllTokensForFolder(
  folder: OutputFolder,
  ctx: FolderGeneratorContext
): FolderToken[] {
  const templateInfo = parsePathTemplate(folder.path);
  const allTokens: FolderToken[] = [];
  
  // Determine viewports to iterate
  const viewportsToUse = templateInfo.hasViewport 
    ? ctx.viewports 
    : [{ id: 'default', name: 'default', width: 0, icon: 'monitor' as const }];
  
  // Determine responsive variants to iterate
  const variantsToUse = templateInfo.hasResponsive && folder.enabledResponsiveVariants.length > 0
    ? ctx.responsiveVariants.filter(rv => folder.enabledResponsiveVariants.includes(rv.id))
    : [null]; // null means no responsive variant (single iteration)
  
  // Iterate: viewports × responsive variants
  viewportsToUse.forEach(viewport => {
    const vpName = viewport.name !== 'default' ? viewport.name : undefined;
    
    variantsToUse.forEach(variant => {
      // Determine effective columns for this viewport + variant combination
      let effectiveColumns: number | undefined = undefined;
      
      if (variant) {
        // Find behavior for this viewport
        const behavior = variant.viewportBehaviors.find(vb => vb.viewportId === viewport.id);
        if (behavior?.behavior === 'override' && behavior.overrideColumns) {
          effectiveColumns = behavior.overrideColumns;
        }
        // If inherit or no behavior defined, use default (undefined = use style's columns)
      }
      
      // Generate tokens with optional column override
      const baseTokens = generateBaseTokensWithOverride(folder, ctx, effectiveColumns);
      
      baseTokens.forEach(token => {
        const basePath = resolvePathTemplate(
          folder.path, 
          vpName, 
          variant?.name // responsive variant name or undefined
        );
        allTokens.push({
          ...token,
          path: `${basePath}/${token.name}`,
          viewport: vpName,
          responsive: variant?.name,
        });
      });
    });
  });
  
  return allTokens;
}

/**
 * Generate tokens with optional column override and ratio multiplication
 */
function generateBaseTokensWithOverride(
  folder: OutputFolder,
  ctx: FolderGeneratorContext,
  columnsOverride?: number
): FolderToken[] {
  const tokens: FolderToken[] = [];
  const enabledMods = ctx.modifiers.filter(m => folder.enabledModifiers.includes(m.id));
  
  // Use override or max from styles
  const maxColumns = columnsOverride ?? Math.max(...ctx.styles.map(s => s.columns));
  const prefix = folder.tokenPrefix;
  const fullPrefix = prefix.replace(/col-?$/, '');
  
  // Get ratio multiplier if multiplyByRatio is enabled
  let ratioMultiplier = 1;
  if (folder.multiplyByRatio && folder.enabledRatios.length > 0) {
    const ratio = ctx.ratioFamilies.find(r => r.id === folder.enabledRatios[0]);
    if (ratio) {
      ratioMultiplier = ratio.ratioB / ratio.ratioA;
    }
  }
  
  // ============================================
  // PHASE 1: All base column tokens (1 to maxColumns)
  // ============================================
  for (let col = 1; col <= maxColumns; col++) {
    const token: FolderToken = {
      name: `${prefix}${col}`,
      values: {},
    };
    
    ctx.styles.forEach(style => {
      const effectiveColumns = columnsOverride ?? style.columns;
      if (col <= effectiveColumns) {
        const { base, computed } = getStyleContext(
          style.id, style, ctx.baseParameters, ctx.computedParameters
        );
        const colWidth = computed['column-width'];
        const gutter = base.gutter;
        const baseValue = colWidth * col + gutter * (col - 1);
        token.values[style.id] = Math.round(baseValue * ratioMultiplier);
      }
    });
    
    if (Object.keys(token.values).length > 0) {
      tokens.push(token);
    }
  }
  
  // ============================================
  // PHASE 2: Base 'full' token
  // ============================================
  const fullToken: FolderToken = {
    name: `${fullPrefix}full`,
    values: {},
  };
  ctx.styles.forEach(style => {
    const { computed } = getStyleContext(
      style.id, style, ctx.baseParameters, ctx.computedParameters
    );
    fullToken.values[style.id] = Math.round(computed['ingrid'] * ratioMultiplier);
  });
  tokens.push(fullToken);
  
  // ============================================
  // PHASE 3: All tokens for each modifier (in global order)
  // ============================================
  enabledMods.forEach(mod => {
    for (let col = 1; col <= maxColumns; col++) {
      if (col >= mod.applyFrom && col <= mod.applyTo) {
        const modToken: FolderToken = {
          name: `${prefix}${col}${mod.name}`,
          values: {},
          modifier: mod.name,
        };
        
        ctx.styles.forEach(style => {
          const effectiveColumns = columnsOverride ?? style.columns;
          if (col <= effectiveColumns) {
            const { base, computed } = getStyleContext(
              style.id, style, ctx.baseParameters, ctx.computedParameters
            );
            const genCtx: GeneratorContext = {
              styleId: style.id,
              styleName: style.name,
              columns: effectiveColumns,
              base,
              computed,
            };
            const colWidth = computed['column-width'];
            const gutter = base.gutter;
            const baseValue = colWidth * col + gutter * (col - 1);
            const modifiedValue = applyModifier(baseValue, mod, genCtx);
            modToken.values[style.id] = Math.round(modifiedValue * ratioMultiplier);
          }
        });
        
        if (Object.keys(modToken.values).length > 0) {
          tokens.push(modToken);
        }
      }
    }
    
    // Full variant for this modifier (if applicable)
    if (mod.hasFullVariant) {
      const fullModToken: FolderToken = {
        name: `${fullPrefix}full${mod.name}`,
        values: {},
        modifier: mod.name,
      };
      
      ctx.styles.forEach(style => {
        const { base, computed } = getStyleContext(
          style.id, style, ctx.baseParameters, ctx.computedParameters
        );
        const genCtx: GeneratorContext = {
          styleId: style.id,
          styleName: style.name,
          columns: columnsOverride ?? style.columns,
          base,
          computed,
        };
        const ingrid = computed['ingrid'];
        const modifiedValue = applyModifier(ingrid, mod, genCtx);
        fullModToken.values[style.id] = Math.round(modifiedValue * ratioMultiplier);
      });
      
      tokens.push(fullModToken);
    }
  });
  
  return tokens;
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
  
  let totalCount = baseCount;
  
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
