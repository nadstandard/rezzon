import { create } from 'zustand';

// ============================================================================
// TYPES
// ============================================================================

interface Mode {
  id: string;
  name: string;
}

export type ViewportName = 'Desktop' | 'Laptop' | 'Tablet' | 'Mobile';

interface BaseValues {
  viewport: number;
  columns: number;
  gutterWidth: number;
  marginM: number;
  marginXs: number;
}

interface ComputedValues {
  gutters: number;
  ingrid: number;
  columnWidth: number;
}

// Exception value can be column count, 'viewport', or 'to-margins'
export type ExceptionValue = number | 'viewport' | 'to-margins';

interface ResponsiveException {
  enabled: boolean;
  value: ExceptionValue;
}

export interface FolderConfig {
  id: string;
  name: string;
  parent: 'container' | 'photo';
  exceptions: Record<ViewportName, ResponsiveException>;
  variants: {
    base: boolean;
    wHalf: boolean;
    wMargin: boolean;
    toEdge: boolean;
    oneG: boolean;
    twoG: boolean;
  };
  // Photo-specific: ratio per viewport
  ratios?: Record<ViewportName, { a: number; b: number }>;
}

interface GridState {
  modes: Mode[];
  base: Record<ViewportName, Record<string, BaseValues>>;
  folders: FolderConfig[];
  activeFolder: string | null;
  activeViewport: ViewportName | 'All';

  loadFromJSON: (data: unknown) => void;
  exportToJSON: () => object;
  
  setBaseValue: (
    viewport: ViewportName,
    modeId: string,
    field: keyof BaseValues,
    value: number
  ) => void;
  
  addFolder: (name: string, parent: 'container' | 'photo') => void;
  removeFolder: (id: string) => void;
  updateFolder: (id: string, updates: Partial<FolderConfig>) => void;
  
  setException: (
    folderId: string,
    viewport: ViewportName,
    exception: ResponsiveException
  ) => void;
  
  setRatio: (
    folderId: string,
    viewport: ViewportName,
    ratio: { a: number; b: number }
  ) => void;
  
  setActiveFolder: (folder: string | null) => void;
  setActiveViewport: (viewport: ViewportName | 'All') => void;
}

// ============================================================================
// CONSTANTS
// ============================================================================

export const VIEWPORTS: ViewportName[] = ['Desktop', 'Laptop', 'Tablet', 'Mobile'];

const DEFAULT_BASE: Record<ViewportName, BaseValues> = {
  Desktop: { viewport: 1920, columns: 12, gutterWidth: 24, marginM: 204, marginXs: 20 },
  Laptop: { viewport: 1366, columns: 12, gutterWidth: 20, marginM: 45, marginXs: 15 },
  Tablet: { viewport: 768, columns: 12, gutterWidth: 20, marginM: 58, marginXs: 16 },
  Mobile: { viewport: 390, columns: 2, gutterWidth: 20, marginM: 20, marginXs: 10 },
};

const DEFAULT_VARIANTS = {
  base: true,
  wHalf: true,
  wMargin: true,
  toEdge: true,
  oneG: false,
  twoG: false,
};

// ============================================================================
// CALCULATIONS
// ============================================================================

export function computeBaseValues(base: BaseValues): ComputedValues {
  const gutters = base.columns - 1;
  const ingrid = base.viewport - 2 * base.marginM;
  const columnWidth = (ingrid - gutters * base.gutterWidth) / base.columns;
  return { gutters, ingrid, columnWidth };
}

// Column width formulas
export function calcColN(n: number, base: BaseValues, computed: ComputedValues): number {
  if (n > base.columns) return computed.ingrid;
  return n * computed.columnWidth + (n - 1) * base.gutterWidth;
}

export function calcColViewport(base: BaseValues): number {
  return base.viewport;
}

export function calcColNwHalf(n: number, base: BaseValues, computed: ComputedValues): number {
  return calcColN(n, base, computed) + base.gutterWidth + computed.columnWidth / 2;
}

export function calcColNwMargin(n: number, base: BaseValues, computed: ComputedValues): number {
  return calcColN(n, base, computed) + (base.marginM - base.marginXs);
}

export function calcColViewportWMargin(base: BaseValues, computed: ComputedValues): number {
  return computed.ingrid + 2 * (base.marginM - base.marginXs);
}

export function calcColNtoEdge(n: number, base: BaseValues, computed: ComputedValues): number {
  return calcColN(n, base, computed) + base.marginM;
}

export function calcColN1g(n: number, base: BaseValues, computed: ComputedValues): number {
  return calcColN(n, base, computed) + base.gutterWidth;
}

export function calcColN2g(n: number, base: BaseValues, computed: ComputedValues): number {
  return calcColN(n, base, computed) + 2 * base.gutterWidth;
}

// Margin formulas
export function calcMarginXs(base: BaseValues): number {
  return base.marginXs;
}

export function calcMarginM(base: BaseValues): number {
  return base.marginM;
}

export function calcMarginL(base: BaseValues, computed: ComputedValues): number {
  return base.marginM + computed.columnWidth;
}

export function calcMarginXL(base: BaseValues, computed: ComputedValues): number {
  return base.marginM + 2 * computed.columnWidth + base.gutterWidth;
}

export function calcMarginXXL(base: BaseValues, computed: ComputedValues): number {
  return base.marginM + 3 * computed.columnWidth + 2 * base.gutterWidth;
}

export function calcMarginXXXL(base: BaseValues, computed: ComputedValues): number {
  return base.marginM + 4 * computed.columnWidth + 3 * base.gutterWidth;
}

export function calcIngridL(base: BaseValues, computed: ComputedValues): number {
  return computed.columnWidth + base.gutterWidth;
}

export function calcIngridXL(base: BaseValues, computed: ComputedValues): number {
  return 2 * computed.columnWidth + 2 * base.gutterWidth;
}

export function calcIngridXXL(base: BaseValues, computed: ComputedValues): number {
  return 3 * computed.columnWidth + 3 * base.gutterWidth;
}

export function calcIngridXXXL(base: BaseValues, computed: ComputedValues): number {
  return 4 * computed.columnWidth + 4 * base.gutterWidth;
}

// DL/TM variants
export function isDL(viewport: ViewportName): boolean {
  return viewport === 'Desktop' || viewport === 'Laptop';
}

export function isTM(viewport: ViewportName): boolean {
  return viewport === 'Tablet' || viewport === 'Mobile';
}

// Calculate width for exception value
export function calcExceptionWidth(
  exception: ExceptionValue,
  base: BaseValues,
  computed: ComputedValues
): number {
  if (exception === 'viewport') {
    return base.viewport;
  }
  if (exception === 'to-margins') {
    return computed.ingrid + 2 * (base.marginM - base.marginXs);
  }
  // It's a column count
  return calcColN(exception, base, computed);
}

// Photo height calculation
export function calcHeight(width: number, ratioA: number, ratioB: number): number {
  return Math.round(width * (ratioB / ratioA));
}

// ============================================================================
// STORE
// ============================================================================

export const useGridStore = create<GridState>((set, get) => ({
  modes: [{ id: 'mode:0', name: 'Default' }],
  base: {
    Desktop: { 'mode:0': DEFAULT_BASE.Desktop },
    Laptop: { 'mode:0': DEFAULT_BASE.Laptop },
    Tablet: { 'mode:0': DEFAULT_BASE.Tablet },
    Mobile: { 'mode:0': DEFAULT_BASE.Mobile },
  },
  folders: [],
  activeFolder: null,
  activeViewport: 'All',

  loadFromJSON: (data) => {
    try {
      const json = data as {
        collections: Array<{
          id: string;
          name: string;
          modes: Array<{ id: string; name: string }>;
          variables: Array<{
            name: string;
            description?: string;
            valuesByMode: Record<string, { value: number }>;
          }>;
        }>;
      };

      const collection = json.collections[0];
      if (!collection) return;

      const modes = collection.modes.map((m) => ({ id: m.id, name: m.name }));

      // Initialize base with defaults for all modes
      const base: Record<ViewportName, Record<string, BaseValues>> = {
        Desktop: {},
        Laptop: {},
        Tablet: {},
        Mobile: {},
      };

      modes.forEach((mode) => {
        VIEWPORTS.forEach((vp) => {
          base[vp][mode.id] = { ...DEFAULT_BASE[vp] };
        });
      });

      // Parse folders from variable descriptions
      const folders: FolderConfig[] = [];
      const folderConfigs = new Map<string, string>();

      // Parse variables
      collection.variables.forEach((v) => {
        const parts = v.name.split('/');
        
        // Check for folder config in description
        if (v.description?.startsWith('GRID_FOLDER:')) {
          try {
            const configJson = v.description.replace('GRID_FOLDER:', '');
            const config = JSON.parse(configJson);
            folderConfigs.set(config.id, v.description);
          } catch {
            // Ignore parse errors
          }
        }
        
        // Look for base/viewport/param-edit pattern
        if (parts[0]?.toLowerCase() === 'base' && parts.length >= 3) {
          const vpRaw = parts[1];
          const vpMap: Record<string, ViewportName> = {
            'desktop': 'Desktop',
            'laptop': 'Laptop', 
            'tablet': 'Tablet',
            'mobile': 'Mobile',
          };
          const viewport = vpMap[vpRaw.toLowerCase()];
          if (!viewport) return;
          
          const param = parts[2];
          
          modes.forEach((mode) => {
            const val = v.valuesByMode[mode.id]?.value;
            if (val === undefined) return;
            
            if (param === 'viewport-edit') {
              base[viewport][mode.id].viewport = val;
            } else if (param === 'columns-edit') {
              base[viewport][mode.id].columns = val;
            } else if (param === 'gutter-width-edit') {
              base[viewport][mode.id].gutterWidth = val;
            } else if (param === 'margin-m-edit') {
              base[viewport][mode.id].marginM = val;
            } else if (param === 'margin-xs-edit') {
              base[viewport][mode.id].marginXs = val;
            }
          });
        }
      });

      // Reconstruct folders from configs
      folderConfigs.forEach((configStr) => {
        try {
          const config = JSON.parse(configStr.replace('GRID_FOLDER:', ''));
          folders.push(config as FolderConfig);
        } catch {
          // Ignore
        }
      });

      set({ modes, base, folders });
      console.log('Loaded grid config:', { modes: modes.length, folders: folders.length });
    } catch (err) {
      console.error('Failed to parse Grid JSON:', err);
    }
  },

  exportToJSON: () => {
    const state = get();
    const variables: Array<{
      id: string;
      name: string;
      type: string;
      description: string;
      hiddenFromPublishing: boolean;
      scopes: string[];
      codeSyntax: Record<string, never>;
      valuesByMode: Record<string, { type: string; value: number }>;
    }> = [];

    let varIdx = 0;

    // Helper to add a variable for a specific viewport
    const addVarForViewport = (
      vp: ViewportName,
      name: string,
      getValue: (base: BaseValues, computed: ComputedValues, vp: ViewportName) => number,
      description = ''
    ) => {
      const valuesByMode: Record<string, { type: string; value: number }> = {};
      
      state.modes.forEach((mode) => {
        const baseVals = state.base[vp][mode.id];
        const computed = computeBaseValues(baseVals);
        const value = Math.round(getValue(baseVals, computed, vp));
        valuesByMode[mode.id] = { type: 'FLOAT', value };
      });

      variables.push({
        id: `VariableID:${varIdx++}`,
        name,
        type: 'FLOAT',
        description,
        hiddenFromPublishing: false,
        scopes: ['WIDTH_HEIGHT', 'GAP'],
        codeSyntax: {},
        valuesByMode,
      });
    };

    // Export BASE values per viewport
    VIEWPORTS.forEach((vp) => {
      const vpLower = vp.toLowerCase();
      
      addVarForViewport(vp, `base/${vpLower}/viewport-edit`, (base) => base.viewport);
      addVarForViewport(vp, `base/${vpLower}/columns-edit`, (base) => base.columns);
      addVarForViewport(vp, `base/${vpLower}/gutter-width-edit`, (base) => base.gutterWidth);
      addVarForViewport(vp, `base/${vpLower}/margin-m-edit`, (base) => base.marginM);
      addVarForViewport(vp, `base/${vpLower}/margin-xs-edit`, (base) => base.marginXs);
      addVarForViewport(vp, `base/${vpLower}/gutters`, (_, c) => c.gutters);
      addVarForViewport(vp, `base/${vpLower}/ingrid`, (_, c) => c.ingrid);
      addVarForViewport(vp, `base/${vpLower}/column-width`, (_, c) => c.columnWidth);
    });

    // Export column tokens per viewport
    VIEWPORTS.forEach((vp) => {
      const vpLower = vp.toLowerCase();
      
      for (let n = 1; n <= 12; n++) {
        addVarForViewport(vp, `${vpLower}/column/v-col-${n}`, (base, comp) => calcColN(n, base, comp));
        if (n < 12) {
          addVarForViewport(vp, `${vpLower}/column/v-col-${n}-w-half`, (base, comp) => calcColNwHalf(n, base, comp));
        }
        addVarForViewport(vp, `${vpLower}/column/v-col-${n}-w-margin`, (base, comp) => calcColNwMargin(n, base, comp));
        addVarForViewport(vp, `${vpLower}/column/v-col-${n}-to-edge`, (base, comp) => calcColNtoEdge(n, base, comp));
        addVarForViewport(vp, `${vpLower}/column/v-col-${n}-1g`, (base, comp) => calcColN1g(n, base, comp));
        addVarForViewport(vp, `${vpLower}/column/v-col-${n}-2g`, (base, comp) => calcColN2g(n, base, comp));
      }
      
      addVarForViewport(vp, `${vpLower}/column/v-col-viewport`, (base) => calcColViewport(base));
      addVarForViewport(vp, `${vpLower}/column/v-col-viewport-w-margin`, (base, comp) => calcColViewportWMargin(base, comp));
    });

    // Export margin tokens per viewport with DL/TM variants
    VIEWPORTS.forEach((vp) => {
      const vpLower = vp.toLowerCase();
      
      // Base margin tokens
      addVarForViewport(vp, `${vpLower}/margin/v-xs`, (base) => calcMarginXs(base));
      addVarForViewport(vp, `${vpLower}/margin/v-m`, (base) => calcMarginM(base));
      addVarForViewport(vp, `${vpLower}/margin/v-l`, (base, comp) => calcMarginL(base, comp));
      addVarForViewport(vp, `${vpLower}/margin/v-xl`, (base, comp) => calcMarginXL(base, comp));
      addVarForViewport(vp, `${vpLower}/margin/v-xxl`, (base, comp) => calcMarginXXL(base, comp));
      addVarForViewport(vp, `${vpLower}/margin/v-xxxl`, (base, comp) => calcMarginXXXL(base, comp));
      
      // DL variants (value on Desktop/Laptop, 0 on Tablet/Mobile)
      addVarForViewport(vp, `${vpLower}/margin/v-xs-DL`, (base, _, v) => isDL(v) ? calcMarginXs(base) : 0);
      addVarForViewport(vp, `${vpLower}/margin/v-m-DL`, (base, _, v) => isDL(v) ? calcMarginM(base) : 0);
      addVarForViewport(vp, `${vpLower}/margin/v-l-DL`, (base, comp, v) => isDL(v) ? calcMarginL(base, comp) : 0);
      addVarForViewport(vp, `${vpLower}/margin/v-xl-DL`, (base, comp, v) => isDL(v) ? calcMarginXL(base, comp) : 0);
      addVarForViewport(vp, `${vpLower}/margin/v-xxl-DL`, (base, comp, v) => isDL(v) ? calcMarginXXL(base, comp) : 0);
      addVarForViewport(vp, `${vpLower}/margin/v-xxxl-DL`, (base, comp, v) => isDL(v) ? calcMarginXXXL(base, comp) : 0);
      
      // TM variants (value on Tablet/Mobile, 0 on Desktop/Laptop)
      addVarForViewport(vp, `${vpLower}/margin/v-xs-TM`, (base, _, v) => isTM(v) ? calcMarginXs(base) : 0);
      addVarForViewport(vp, `${vpLower}/margin/v-m-TM`, (base, _, v) => isTM(v) ? calcMarginM(base) : 0);
      addVarForViewport(vp, `${vpLower}/margin/v-l-TM`, (base, comp, v) => isTM(v) ? calcMarginL(base, comp) : 0);
      addVarForViewport(vp, `${vpLower}/margin/v-xl-TM`, (base, comp, v) => isTM(v) ? calcMarginXL(base, comp) : 0);
      addVarForViewport(vp, `${vpLower}/margin/v-xxl-TM`, (base, comp, v) => isTM(v) ? calcMarginXXL(base, comp) : 0);
      addVarForViewport(vp, `${vpLower}/margin/v-xxxl-TM`, (base, comp, v) => isTM(v) ? calcMarginXXXL(base, comp) : 0);
      
      // Ingrid variants
      addVarForViewport(vp, `${vpLower}/margin/v-ingrid-l`, (base, comp) => calcIngridL(base, comp));
      addVarForViewport(vp, `${vpLower}/margin/v-ingrid-xl`, (base, comp) => calcIngridXL(base, comp));
      addVarForViewport(vp, `${vpLower}/margin/v-ingrid-xxl`, (base, comp) => calcIngridXXL(base, comp));
      addVarForViewport(vp, `${vpLower}/margin/v-ingrid-xxxl`, (base, comp) => calcIngridXXXL(base, comp));
      
      // Ingrid DL/TM variants
      addVarForViewport(vp, `${vpLower}/margin/v-ingrid-l-DL`, (base, comp, v) => isDL(v) ? calcIngridL(base, comp) : 0);
      addVarForViewport(vp, `${vpLower}/margin/v-ingrid-xl-DL`, (base, comp, v) => isDL(v) ? calcIngridXL(base, comp) : 0);
      addVarForViewport(vp, `${vpLower}/margin/v-ingrid-xxl-DL`, (base, comp, v) => isDL(v) ? calcIngridXXL(base, comp) : 0);
      addVarForViewport(vp, `${vpLower}/margin/v-ingrid-xxxl-DL`, (base, comp, v) => isDL(v) ? calcIngridXXXL(base, comp) : 0);
      
      addVarForViewport(vp, `${vpLower}/margin/v-ingrid-l-TM`, (base, comp, v) => isTM(v) ? calcIngridL(base, comp) : 0);
      addVarForViewport(vp, `${vpLower}/margin/v-ingrid-xl-TM`, (base, comp, v) => isTM(v) ? calcIngridXL(base, comp) : 0);
      addVarForViewport(vp, `${vpLower}/margin/v-ingrid-xxl-TM`, (base, comp, v) => isTM(v) ? calcIngridXXL(base, comp) : 0);
      addVarForViewport(vp, `${vpLower}/margin/v-ingrid-xxxl-TM`, (base, comp, v) => isTM(v) ? calcIngridXXXL(base, comp) : 0);
    });

    // Export container folders
    state.folders.filter(f => f.parent === 'container').forEach((folder) => {
      // Store folder config in first variable's description
      const folderConfigJson = `GRID_FOLDER:${JSON.stringify(folder)}`;
      let isFirst = true;

      VIEWPORTS.forEach((vp) => {
        const vpLower = vp.toLowerCase();
        const exc = folder.exceptions[vp];
        
        // Get effective columns for this viewport
        const getEffectiveValue = (base: BaseValues, computed: ComputedValues) => {
          if (exc.enabled) {
            return calcExceptionWidth(exc.value, base, computed);
          }
          return computed.ingrid; // Default to full ingrid
        };

        // Base token
        if (folder.variants.base) {
          addVarForViewport(
            vp,
            `${vpLower}/container/${folder.name}/v-col-n`,
            (base, comp) => getEffectiveValue(base, comp),
            isFirst ? folderConfigJson : ''
          );
          isFirst = false;
        }

        // Variant tokens
        if (folder.variants.wHalf) {
          addVarForViewport(vp, `${vpLower}/container/${folder.name}/v-col-n-w-half`, (base, comp) => {
            return getEffectiveValue(base, comp) + base.gutterWidth + comp.columnWidth / 2;
          });
        }
        if (folder.variants.wMargin) {
          addVarForViewport(vp, `${vpLower}/container/${folder.name}/v-col-n-w-margin`, (base, comp) => {
            return getEffectiveValue(base, comp) + (base.marginM - base.marginXs);
          });
        }
        if (folder.variants.toEdge) {
          addVarForViewport(vp, `${vpLower}/container/${folder.name}/v-col-n-to-edge`, (base, comp) => {
            return getEffectiveValue(base, comp) + base.marginM;
          });
        }
        if (folder.variants.oneG) {
          addVarForViewport(vp, `${vpLower}/container/${folder.name}/v-col-n-1g`, (base, comp) => {
            return getEffectiveValue(base, comp) + base.gutterWidth;
          });
        }
        if (folder.variants.twoG) {
          addVarForViewport(vp, `${vpLower}/container/${folder.name}/v-col-n-2g`, (base, comp) => {
            return getEffectiveValue(base, comp) + 2 * base.gutterWidth;
          });
        }
      });
    });

    // Export photo folders
    state.folders.filter(f => f.parent === 'photo').forEach((folder) => {
      const folderConfigJson = `GRID_FOLDER:${JSON.stringify(folder)}`;
      let isFirst = true;

      VIEWPORTS.forEach((vp) => {
        const vpLower = vp.toLowerCase();
        const exc = folder.exceptions[vp];
        const ratio = folder.ratios?.[vp] ?? { a: 4, b: 3 };
        
        const getEffectiveWidth = (base: BaseValues, computed: ComputedValues) => {
          if (exc.enabled) {
            return calcExceptionWidth(exc.value, base, computed);
          }
          return computed.ingrid;
        };

        // Width tokens
        if (folder.variants.base) {
          addVarForViewport(
            vp,
            `${vpLower}/photo/${folder.name}/width/w-col-n`,
            (base, comp) => getEffectiveWidth(base, comp),
            isFirst ? folderConfigJson : ''
          );
          isFirst = false;
        }
        if (folder.variants.wMargin) {
          addVarForViewport(vp, `${vpLower}/photo/${folder.name}/width/w-col-n-w-margin`, (base, comp) => {
            return getEffectiveWidth(base, comp) + (base.marginM - base.marginXs);
          });
        }
        if (folder.variants.toEdge) {
          addVarForViewport(vp, `${vpLower}/photo/${folder.name}/width/w-col-n-to-edge`, (base, comp) => {
            return getEffectiveWidth(base, comp) + base.marginM;
          });
        }

        // Height tokens (with ratio)
        if (folder.variants.base) {
          addVarForViewport(vp, `${vpLower}/photo/${folder.name}/height/h-col-n`, (base, comp) => {
            const width = getEffectiveWidth(base, comp);
            return calcHeight(width, ratio.a, ratio.b);
          });
        }
        if (folder.variants.wMargin) {
          addVarForViewport(vp, `${vpLower}/photo/${folder.name}/height/h-col-n-w-margin`, (base, comp) => {
            const width = getEffectiveWidth(base, comp) + (base.marginM - base.marginXs);
            return calcHeight(width, ratio.a, ratio.b);
          });
        }
        if (folder.variants.toEdge) {
          addVarForViewport(vp, `${vpLower}/photo/${folder.name}/height/h-col-n-to-edge`, (base, comp) => {
            const width = getEffectiveWidth(base, comp) + base.marginM;
            return calcHeight(width, ratio.a, ratio.b);
          });
        }
      });
    });

    return {
      version: '1.0',
      exportedAt: new Date().toISOString(),
      fileName: '1-R4-Grid',
      collections: [
        {
          id: 'collection:grid',
          name: 'Grid',
          defaultModeId: state.modes[0]?.id ?? 'mode:0',
          hiddenFromPublishing: false,
          modes: state.modes,
          variables,
        },
      ],
    };
  },

  setBaseValue: (viewport, modeId, field, value) =>
    set((state) => {
      const newBase = { ...state.base };
      newBase[viewport] = {
        ...newBase[viewport],
        [modeId]: {
          ...newBase[viewport][modeId],
          [field]: value,
        },
      };
      return { base: newBase };
    }),

  addFolder: (name, parent) =>
    set((state) => {
      const id = `folder-${Date.now()}`;
      const newFolder: FolderConfig = {
        id,
        name,
        parent,
        exceptions: {
          Desktop: { enabled: false, value: 12 },
          Laptop: { enabled: false, value: 12 },
          Tablet: { enabled: false, value: 12 },
          Mobile: { enabled: false, value: 2 },
        },
        variants: { ...DEFAULT_VARIANTS },
        ratios: parent === 'photo'
          ? {
              Desktop: { a: 4, b: 3 },
              Laptop: { a: 4, b: 3 },
              Tablet: { a: 4, b: 3 },
              Mobile: { a: 1, b: 1 },
            }
          : undefined,
      };
      return { folders: [...state.folders, newFolder] };
    }),

  removeFolder: (id) =>
    set((state) => ({
      folders: state.folders.filter((f) => f.id !== id),
      activeFolder: state.activeFolder === id ? null : state.activeFolder,
    })),

  updateFolder: (id, updates) =>
    set((state) => ({
      folders: state.folders.map((f) =>
        f.id === id ? { ...f, ...updates } : f
      ),
    })),

  setException: (folderId, viewport, exception) =>
    set((state) => ({
      folders: state.folders.map((f) =>
        f.id === folderId
          ? {
              ...f,
              exceptions: {
                ...f.exceptions,
                [viewport]: exception,
              },
            }
          : f
      ),
    })),

  setRatio: (folderId, viewport, ratio) =>
    set((state) => ({
      folders: state.folders.map((f) =>
        f.id === folderId
          ? {
              ...f,
              ratios: {
                ...f.ratios,
                [viewport]: ratio,
              },
            }
          : f
      ),
    })),

  setActiveFolder: (folder) => set({ activeFolder: folder }),
  setActiveViewport: (viewport) => set({ activeViewport: viewport }),
}));

// ============================================================================
// HELPERS
// ============================================================================

export const useActiveGridFolder = () => {
  const store = useGridStore();
  if (!store.activeFolder) return null;
  return store.folders.find((f) => f.id === store.activeFolder) ?? null;
};

// Build sidebar groups for Grid
export function buildGridSidebarGroups(
  folders: FolderConfig[]
): { name: string; path: string; count: number; indent: number; isAuto?: boolean }[] {
  const groups: { name: string; path: string; count: number; indent: number; isAuto?: boolean }[] = [];

  // BASE
  groups.push({ name: 'BASE', path: 'BASE', count: 8 * 4, indent: 0 });
  VIEWPORTS.forEach((vp) => {
    groups.push({ name: vp, path: `BASE/${vp}`, count: 8, indent: 1 });
  });

  // column (auto)
  const colTokensPerVp = 12 + 11 + 12 + 12 + 12 + 12 + 2; // base + w-half + w-margin + to-edge + 1g + 2g + viewport
  groups.push({ name: 'column', path: 'column', count: colTokensPerVp * 4, indent: 0, isAuto: true });
  VIEWPORTS.forEach((vp) => {
    groups.push({ name: vp, path: `column/${vp}`, count: colTokensPerVp, indent: 1 });
  });

  // margin (auto)
  const marginTokensPerVp = 6 + 6 + 6 + 4 + 4 + 4; // base + DL + TM + ingrid + ingrid-DL + ingrid-TM
  groups.push({ name: 'margin', path: 'margin', count: marginTokensPerVp * 4, indent: 0, isAuto: true });
  VIEWPORTS.forEach((vp) => {
    groups.push({ name: vp, path: `margin/${vp}`, count: marginTokensPerVp, indent: 1 });
  });

  // container folders
  const containerFolders = folders.filter((f) => f.parent === 'container');
  if (containerFolders.length > 0) {
    groups.push({ name: 'container', path: 'container', count: containerFolders.length * 24, indent: 0 });
    containerFolders.forEach((f) => {
      groups.push({ name: f.name, path: `container/${f.id}`, count: 24, indent: 1 });
    });
  }

  // photo folders
  const photoFolders = folders.filter((f) => f.parent === 'photo');
  if (photoFolders.length > 0) {
    groups.push({ name: 'photo', path: 'photo', count: photoFolders.length * 24, indent: 0 });
    photoFolders.forEach((f) => {
      groups.push({ name: f.name, path: `photo/${f.id}`, count: 24, indent: 1 });
    });
  }

  return groups;
}
