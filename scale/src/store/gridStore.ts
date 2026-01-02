import { create } from 'zustand';
import type { 
  GridStore, 
  Viewport, 
  Style, 
  BaseParameter, 
  ComputedParameter,
  Modifier,
  RatioFamily,
  ResponsiveVariant,
  OutputLayer,
  OutputFolder,
  ScaleSession
} from '../types';
import { recalculateAllComputed } from '../engine/formulas';
import { 
  generateColumnTokensWithModifiers, 
  countTokens, 
  generateFigmaExport,
  calculateFolderTokenCount,
  type FolderGeneratorContext
} from '../engine/generator';

// === HELPER: Generate unique ID ===
const generateId = () => Math.random().toString(36).substr(2, 9);

// === INITIAL STATE ===
const initialState: Omit<GridStore, keyof import('../types').GridActions> = {
  viewports: [],
  styles: [],
  baseParameters: [],
  computedParameters: [],
  generatedTokens: [],
  modifiers: [],
  ratioFamilies: [],
  responsiveVariants: [],
  outputFolders: [],
  outputLayers: [],
  selectedViewportId: null,
  selectedStyleId: null,
  selectedFolderId: null,
  activeTab: 'parameters',
};

// === DEMO DATA ===
const createDemoData = (): Partial<GridStore> => ({
  viewports: [
    { id: 'vp-1', name: 'Desktop', width: 1920, icon: 'monitor' },
    { id: 'vp-2', name: 'Laptop', width: 1366, icon: 'monitor' },
    { id: 'vp-3', name: 'Tablet', width: 768, icon: 'tablet' },
    { id: 'vp-4', name: 'Mobile', width: 390, icon: 'phone' },
  ],
  styles: [
    { id: 'st-1', name: 'Cross', columns: 12 },
    { id: 'st-2', name: 'Circle', columns: 12 },
    { id: 'st-3', name: 'Triangle', columns: 12 },
    { id: 'st-4', name: 'Square', columns: 12 },
  ],
  baseParameters: [
    {
      id: 'bp-1',
      name: 'viewport',
      type: 'base',
      values: { 'st-1': 1920, 'st-2': 1920, 'st-3': 1920, 'st-4': 1920 },
      editable: false,
    },
    {
      id: 'bp-2',
      name: 'number-of-columns',
      type: 'base',
      values: { 'st-1': 12, 'st-2': 12, 'st-3': 6, 'st-4': 4 },
      editable: true,
    },
    {
      id: 'bp-3',
      name: 'gutter-width',
      type: 'base',
      values: { 'st-1': 24, 'st-2': 24, 'st-3': 24, 'st-4': 24 },
      editable: true,
    },
    {
      id: 'bp-4',
      name: 'margin-m',
      type: 'base',
      values: { 'st-1': 48, 'st-2': 48, 'st-3': 48, 'st-4': 48 },
      editable: true,
    },
    {
      id: 'bp-5',
      name: 'margin-xs',
      type: 'base',
      values: { 'st-1': 16, 'st-2': 16, 'st-3': 16, 'st-4': 16 },
      editable: true,
    },
  ],
  computedParameters: [
    {
      id: 'cp-1',
      name: 'number-of-gutters',
      type: 'computed',
      formula: 'columns - 1',
      values: { 'st-1': 11, 'st-2': 11, 'st-3': 5, 'st-4': 3 },
    },
    {
      id: 'cp-2',
      name: 'column-width',
      type: 'computed',
      formula: '(viewport - 2×margin-m - (columns-1)×gutter) / columns',
      values: { 'st-1': 130, 'st-2': 130, 'st-3': 284, 'st-4': 438 },
    },
    {
      id: 'cp-3',
      name: 'ingrid',
      type: 'computed',
      formula: 'viewport - 2×margin-m',
      values: { 'st-1': 1824, 'st-2': 1824, 'st-3': 1824, 'st-4': 1824 },
    },
    {
      id: 'cp-4',
      name: 'photo-margin',
      type: 'computed',
      formula: 'margin-m - margin-xs',
      values: { 'st-1': 32, 'st-2': 32, 'st-3': 32, 'st-4': 32 },
    },
  ],
  modifiers: [
    { id: 'mod-1', name: '-w-half', formula: '+ column-width/2', applyFrom: 1, applyTo: 11, hasFullVariant: false },
    { id: 'mod-2', name: '-w-margin', formula: '+ photo-margin', applyFrom: 1, applyTo: 12, hasFullVariant: true },
    { id: 'mod-3', name: '-to-edge', formula: '+ margin-m', applyFrom: 1, applyTo: 12, hasFullVariant: true },
    { id: 'mod-4', name: '-1G', formula: '+ gutter', applyFrom: 1, applyTo: 11, hasFullVariant: false },
  ],
  ratioFamilies: [
    { id: 'rf-1', name: 'horizontal', ratioA: 4, ratioB: 3 },
    { id: 'rf-2', name: 'vertical', ratioA: 3, ratioB: 4 },
    { id: 'rf-3', name: 'square', ratioA: 1, ratioB: 1 },
    { id: 'rf-4', name: 'panoramic-high', ratioA: 16, ratioB: 9 },
    { id: 'rf-5', name: 'panoramic-low', ratioA: 16, ratioB: 5 },
  ],
  responsiveVariants: [
    {
      id: 'rv-1',
      name: 'static',
      description: 'No responsive changes',
      ratioConfigs: [
        { ratioId: 'rf-1', enabled: true, enabledModifiers: ['mod-1', 'mod-2', 'mod-3'] },
        { ratioId: 'rf-2', enabled: true, enabledModifiers: ['mod-1', 'mod-2', 'mod-3'] },
        { ratioId: 'rf-3', enabled: true, enabledModifiers: ['mod-1', 'mod-2', 'mod-3'] },
        { ratioId: 'rf-4', enabled: true, enabledModifiers: ['mod-2'] },
        { ratioId: 'rf-5', enabled: true, enabledModifiers: ['mod-2'] },
      ],
      viewportBehaviors: [],
    },
    {
      id: 'rv-2',
      name: 'to-tab-6-col',
      description: 'Switches to 6 columns on tablet',
      ratioConfigs: [
        { ratioId: 'rf-1', enabled: true, enabledModifiers: ['mod-1', 'mod-2', 'mod-3'] },
        { ratioId: 'rf-2', enabled: true, enabledModifiers: ['mod-1', 'mod-2'] },
        { ratioId: 'rf-3', enabled: true, enabledModifiers: [] },
      ],
      viewportBehaviors: [
        { viewportId: 'vp-3', behavior: 'override', overrideColumns: 6 },
        { viewportId: 'vp-4', behavior: 'override', overrideColumns: 2 },
      ],
    },
  ],
  outputLayers: [
    { id: 'ol-1', path: 'grid/column', tokenCount: 48 },
    { id: 'ol-2', path: 'grid/container', tokenCount: 192 },
    { id: 'ol-3', path: 'grid/photo/width', tokenCount: 384 },
    { id: 'ol-4', path: 'grid/photo/height', tokenCount: 1920 },
  ],
  outputFolders: [
    {
      id: 'of-1',
      name: 'column',
      parentId: null,
      path: 'column/{viewport}',
      tokenPrefix: 'v-col-',
      enabledModifiers: ['mod-1', 'mod-2', 'mod-3', 'mod-4'],
      enabledResponsiveVariants: [],
      multiplyByRatio: false,
      enabledRatios: [],
      generateHeight: false,
      widthPrefix: '',
      heightPrefix: '',
      tokenCount: 0, // Will be calculated
    },
    {
      id: 'of-2',
      name: 'photo',
      parentId: null,
      path: '',
      tokenPrefix: '',
      enabledModifiers: [],
      enabledResponsiveVariants: [],
      multiplyByRatio: false,
      enabledRatios: [],
      generateHeight: false,
      widthPrefix: '',
      heightPrefix: '',
      tokenCount: 0,
    },
    {
      id: 'of-3',
      name: 'width',
      parentId: 'of-2',
      path: 'photo/{viewport}/width/{responsive}',
      tokenPrefix: 'w-col-',
      enabledModifiers: ['mod-1', 'mod-2', 'mod-3'],
      enabledResponsiveVariants: ['rv-1', 'rv-2'],
      multiplyByRatio: false,
      enabledRatios: [],
      generateHeight: false,
      widthPrefix: '',
      heightPrefix: '',
      tokenCount: 0,
    },
    {
      id: 'of-4',
      name: 'height',
      parentId: 'of-2',
      path: 'photo/{viewport}/height/{responsive}',
      tokenPrefix: 'w-col-',  // Base is width
      enabledModifiers: ['mod-1', 'mod-2', 'mod-3'],
      enabledResponsiveVariants: ['rv-1', 'rv-2'],
      multiplyByRatio: true,
      enabledRatios: ['rf-1', 'rf-2', 'rf-3'],
      generateHeight: true,
      widthPrefix: 'w-col-',
      heightPrefix: 'h-col-',
      tokenCount: 0,
    },
  ],
  selectedFolderId: 'of-1',
  selectedViewportId: 'vp-1',
  activeTab: 'parameters',
});

// === STORE ===
export const useGridStore = create<GridStore>((set, get) => ({
  ...initialState,
  ...createDemoData(),

  // === VIEWPORT ACTIONS ===
  addViewport: (viewport) => set((state) => ({
    viewports: [...state.viewports, { ...viewport, id: generateId() }],
  })),

  updateViewport: (id, updates) => {
    const state = get();
    
    // Update viewport in list
    const newViewports = state.viewports.map((vp) =>
      vp.id === id ? { ...vp, ...updates } : vp
    );
    
    // If this viewport is selected AND width changed, update base parameter "viewport"
    if (state.selectedViewportId === id && updates.width !== undefined) {
      const viewportParam = state.baseParameters.find(bp => bp.name === 'viewport');
      if (viewportParam) {
        const newValues: Record<string, number> = {};
        state.styles.forEach(style => {
          newValues[style.id] = updates.width as number;
        });
        
        set({
          viewports: newViewports,
          baseParameters: state.baseParameters.map(bp =>
            bp.name === 'viewport' ? { ...bp, values: newValues } : bp
          ),
        });
        
        // Recalculate computed values
        get().recalculateComputed();
        return;
      }
    }
    
    set({ viewports: newViewports });
  },

  removeViewport: (id) => set((state) => ({
    viewports: state.viewports.filter((vp) => vp.id !== id),
    selectedViewportId: state.selectedViewportId === id ? null : state.selectedViewportId,
  })),

  selectViewport: (id) => {
    const state = get();
    const viewport = state.viewports.find(vp => vp.id === id);
    if (!viewport) {
      set({ selectedViewportId: id });
      return;
    }
    
    // Update base parameter "viewport" for all styles with selected viewport's width
    const viewportParam = state.baseParameters.find(bp => bp.name === 'viewport');
    if (viewportParam) {
      const newValues: Record<string, number> = {};
      state.styles.forEach(style => {
        newValues[style.id] = viewport.width;
      });
      
      set((state) => ({
        selectedViewportId: id,
        baseParameters: state.baseParameters.map(bp =>
          bp.name === 'viewport' ? { ...bp, values: newValues } : bp
        ),
      }));
      
      // Recalculate computed values
      get().recalculateComputed();
    } else {
      set({ selectedViewportId: id });
    }
  },

  // === STYLE ACTIONS ===
  addStyle: (style) => set((state) => ({
    styles: [...state.styles, { ...style, id: generateId() }],
  })),

  updateStyle: (id, updates) => set((state) => ({
    styles: state.styles.map((st) =>
      st.id === id ? { ...st, ...updates } : st
    ),
  })),

  removeStyle: (id) => set((state) => ({
    styles: state.styles.filter((st) => st.id !== id),
  })),

  // === PARAMETER ACTIONS ===
  updateBaseParameter: (id, styleId, value) => {
    set((state) => ({
      baseParameters: state.baseParameters.map((bp) =>
        bp.id === id
          ? { ...bp, values: { ...bp.values, [styleId]: value } }
          : bp
      ),
    }));
    // Auto-recalculate after update
    get().recalculateComputed();
  },

  addBaseParameter: (param) => set((state) => ({
    baseParameters: [...state.baseParameters, { ...param, id: generateId() }],
  })),

  removeBaseParameter: (id) => set((state) => ({
    baseParameters: state.baseParameters.filter((bp) => bp.id !== id),
  })),

  // === MODIFIER ACTIONS ===
  addModifier: (modifier) => set((state) => ({
    modifiers: [...state.modifiers, { ...modifier, id: generateId() }],
  })),

  updateModifier: (id, updates) => set((state) => ({
    modifiers: state.modifiers.map((mod) =>
      mod.id === id ? { ...mod, ...updates } : mod
    ),
  })),

  removeModifier: (id) => set((state) => ({
    modifiers: state.modifiers.filter((mod) => mod.id !== id),
  })),

  // === RATIO ACTIONS ===
  addRatioFamily: (ratio) => set((state) => ({
    ratioFamilies: [...state.ratioFamilies, { ...ratio, id: generateId() }],
  })),

  updateRatioFamily: (id, updates) => set((state) => ({
    ratioFamilies: state.ratioFamilies.map((rf) =>
      rf.id === id ? { ...rf, ...updates } : rf
    ),
  })),

  removeRatioFamily: (id) => set((state) => ({
    ratioFamilies: state.ratioFamilies.filter((rf) => rf.id !== id),
  })),

  // === RESPONSIVE VARIANT ACTIONS ===
  addResponsiveVariant: (variant) => set((state) => ({
    responsiveVariants: [...state.responsiveVariants, { ...variant, id: generateId() }],
  })),

  updateResponsiveVariant: (id, updates) => set((state) => ({
    responsiveVariants: state.responsiveVariants.map((rv) =>
      rv.id === id ? { ...rv, ...updates } : rv
    ),
  })),

  removeResponsiveVariant: (id) => set((state) => ({
    responsiveVariants: state.responsiveVariants.filter((rv) => rv.id !== id),
  })),

  toggleRatioInVariant: (variantId, ratioId, enabled) => set((state) => ({
    responsiveVariants: state.responsiveVariants.map((rv) => {
      if (rv.id !== variantId) return rv;
      
      const existingConfig = rv.ratioConfigs.find((rc) => rc.ratioId === ratioId);
      if (existingConfig) {
        return {
          ...rv,
          ratioConfigs: rv.ratioConfigs.map((rc) =>
            rc.ratioId === ratioId ? { ...rc, enabled } : rc
          ),
        };
      } else {
        return {
          ...rv,
          ratioConfigs: [...rv.ratioConfigs, { ratioId, enabled, enabledModifiers: [] }],
        };
      }
    }),
  })),

  toggleModifierInRatio: (variantId, ratioId, modifierId, enabled) => set((state) => ({
    responsiveVariants: state.responsiveVariants.map((rv) => {
      if (rv.id !== variantId) return rv;
      
      return {
        ...rv,
        ratioConfigs: rv.ratioConfigs.map((rc) => {
          if (rc.ratioId !== ratioId) return rc;
          
          const newModifiers = enabled
            ? [...rc.enabledModifiers, modifierId]
            : rc.enabledModifiers.filter((m) => m !== modifierId);
          
          return { ...rc, enabledModifiers: newModifiers };
        }),
      };
    }),
  })),

  updateViewportBehavior: (variantId, viewportId, behavior, overrideColumns) => set((state) => ({
    responsiveVariants: state.responsiveVariants.map((rv) => {
      if (rv.id !== variantId) return rv;
      
      const existingBehavior = rv.viewportBehaviors.find(vb => vb.viewportId === viewportId);
      
      if (existingBehavior) {
        // Update existing
        return {
          ...rv,
          viewportBehaviors: rv.viewportBehaviors.map(vb => 
            vb.viewportId === viewportId 
              ? { ...vb, behavior, overrideColumns: behavior === 'override' ? overrideColumns : undefined }
              : vb
          ),
        };
      } else {
        // Add new
        return {
          ...rv,
          viewportBehaviors: [
            ...rv.viewportBehaviors,
            { viewportId, behavior, overrideColumns: behavior === 'override' ? overrideColumns : undefined },
          ],
        };
      }
    }),
  })),

  // === OUTPUT FOLDER ACTIONS ===
  addOutputFolder: (folder) => set((state) => ({
    outputFolders: [...state.outputFolders, { 
      ...folder, 
      id: generateId(),
      tokenCount: 0,
    }],
  })),

  updateOutputFolder: (id, updates) => set((state) => ({
    outputFolders: state.outputFolders.map((f) =>
      f.id === id ? { ...f, ...updates } : f
    ),
  })),

  removeOutputFolder: (id) => set((state) => {
    // Also remove any children
    const childIds = state.outputFolders
      .filter(f => f.parentId === id)
      .map(f => f.id);
    
    return {
      outputFolders: state.outputFolders.filter(
        (f) => f.id !== id && !childIds.includes(f.id)
      ),
      selectedFolderId: state.selectedFolderId === id ? null : state.selectedFolderId,
    };
  }),

  selectFolder: (id) => set({ selectedFolderId: id }),

  toggleFolderModifier: (folderId, modifierId, enabled) => set((state) => ({
    outputFolders: state.outputFolders.map((f) => {
      if (f.id !== folderId) return f;
      
      const newModifiers = enabled
        ? [...f.enabledModifiers, modifierId]
        : f.enabledModifiers.filter((m) => m !== modifierId);
      
      return { ...f, enabledModifiers: newModifiers };
    }),
  })),

  toggleFolderResponsive: (folderId, variantId, enabled) => set((state) => ({
    outputFolders: state.outputFolders.map((f) => {
      if (f.id !== folderId) return f;
      
      const newVariants = enabled
        ? [...f.enabledResponsiveVariants, variantId]
        : f.enabledResponsiveVariants.filter((v) => v !== variantId);
      
      return { ...f, enabledResponsiveVariants: newVariants };
    }),
  })),

  toggleFolderRatio: (folderId, ratioId, enabled) => set((state) => ({
    outputFolders: state.outputFolders.map((f) => {
      if (f.id !== folderId) return f;
      
      const newRatios = enabled
        ? [...f.enabledRatios, ratioId]
        : f.enabledRatios.filter((r) => r !== ratioId);
      
      return { ...f, enabledRatios: newRatios };
    }),
  })),

  // === TAB NAVIGATION ===
  setActiveTab: (tab) => set({ activeTab: tab }),

  // === RECALCULATION ===
  recalculateComputed: () => {
    const state = get();
    const newComputed = recalculateAllComputed(state.baseParameters, state.styles);
    
    // Update output layers with token counts
    const counts = countTokens(
      state.viewports,
      state.styles,
      state.modifiers,
      state.responsiveVariants
    );
    
    const outputLayers = [
      { id: 'ol-1', path: 'grid/column', tokenCount: counts.byLayer['grid/column'] || 0 },
      { id: 'ol-2', path: 'grid/photo/width', tokenCount: counts.byLayer['grid/photo/width'] || 0 },
      { id: 'ol-3', path: 'grid/photo/height', tokenCount: counts.byLayer['grid/photo/height'] || 0 },
    ];
    
    set({ 
      computedParameters: newComputed,
      outputLayers,
    });
  },

  regenerateTokens: () => {
    const state = get();
    
    // Generate tokens for preview (simplified - just column tokens for selected viewport)
    const selectedViewport = state.viewports.find(vp => vp.id === state.selectedViewportId);
    if (!selectedViewport) return;
    
    const tokens = state.styles.flatMap(style => {
      // Build context for this style
      const baseValues = {
        viewport: state.baseParameters.find(p => p.name === 'viewport')?.values[style.id] ?? 0,
        gutter: state.baseParameters.find(p => p.name === 'gutter-width')?.values[style.id] ?? 0,
        'margin-m': state.baseParameters.find(p => p.name === 'margin-m')?.values[style.id] ?? 0,
        'margin-xs': state.baseParameters.find(p => p.name === 'margin-xs')?.values[style.id] ?? 0,
        columns: state.baseParameters.find(p => p.name === 'number-of-columns')?.values[style.id] ?? 0,
      };
      
      const computedValues = {
        'column-width': state.computedParameters.find(p => p.name === 'column-width')?.values[style.id] ?? 0,
        'ingrid': state.computedParameters.find(p => p.name === 'ingrid')?.values[style.id] ?? 0,
        'photo-margin': state.computedParameters.find(p => p.name === 'photo-margin')?.values[style.id] ?? 0,
        'number-of-gutters': state.computedParameters.find(p => p.name === 'number-of-gutters')?.values[style.id] ?? 0,
      };
      
      const ctx = {
        styleId: style.id,
        styleName: style.name,
        columns: style.columns,
        base: baseValues,
        computed: computedValues,
      };
      
      return generateColumnTokensWithModifiers(ctx, state.modifiers).map(token => ({
        id: `${style.id}-${token.name}`,
        name: token.name,
        baseColumn: parseInt(token.name.match(/\d+/)?.[0] ?? '0'),
        modifier: token.modifier,
        values: { [style.id]: token.value },
      }));
    });
    
    set({ generatedTokens: tokens });
  },

  recalculateFolderTokenCounts: () => {
    const state = get();
    
    // Build context for token calculation
    const ctx: FolderGeneratorContext = {
      styles: state.styles,
      viewports: state.viewports,
      baseParameters: state.baseParameters,
      computedParameters: state.computedParameters,
      modifiers: state.modifiers,
      ratioFamilies: state.ratioFamilies,
      responsiveVariants: state.responsiveVariants,
    };
    
    // Calculate token count for each folder
    const updatedFolders = state.outputFolders.map(folder => {
      // Skip parent folders (no path = organizational only)
      if (!folder.path) {
        return { ...folder, tokenCount: 0 };
      }
      
      const tokenCount = calculateFolderTokenCount(folder, ctx);
      return { ...folder, tokenCount };
    });
    
    set({ outputFolders: updatedFolders });
  },

  // === IMPORT/EXPORT ===
  importFromJSON: (json) => {
    try {
      // Validate basic structure
      const session = json as { type?: string; version?: string; data?: unknown };
      
      if (session.type !== 'scale-session') {
        console.error('Invalid session type');
        return { success: false, errors: ['Invalid file type. Expected "scale-session"'] };
      }
      
      if (!session.data || typeof session.data !== 'object') {
        console.error('Missing data section');
        return { success: false, errors: ['Missing data section'] };
      }
      
      const data = session.data as Record<string, unknown>;
      
      // Validate required arrays
      const requiredArrays = ['viewports', 'styles', 'baseParameters'];
      for (const arr of requiredArrays) {
        if (!Array.isArray(data[arr])) {
          return { success: false, errors: [`Missing or invalid "${arr}" array`] };
        }
      }
      
      // Import data
      set({
        viewports: (data.viewports as Viewport[]) || [],
        styles: (data.styles as Style[]) || [],
        baseParameters: (data.baseParameters as BaseParameter[]) || [],
        computedParameters: (data.computedParameters as ComputedParameter[]) || [],
        modifiers: (data.modifiers as Modifier[]) || [],
        ratioFamilies: (data.ratioFamilies as RatioFamily[]) || [],
        responsiveVariants: (data.responsiveVariants as ResponsiveVariant[]) || [],
        outputFolders: (data.outputFolders as OutputFolder[]) || [],
        outputLayers: (data.outputLayers as OutputLayer[]) || [],
        selectedViewportId: (data.viewports as Viewport[])?.[0]?.id || null,
        selectedStyleId: null,
        selectedFolderId: (data.outputFolders as OutputFolder[])?.[0]?.id || null,
        activeTab: 'parameters',
      });
      
      // Recalculate computed values
      get().recalculateComputed();
      
      console.log('Session imported successfully');
      return { success: true, errors: [] };
    } catch (e) {
      const errorMsg = e instanceof Error ? e.message : 'Unknown error';
      console.error('Import error:', errorMsg);
      return { success: false, errors: [errorMsg] };
    }
  },

  exportSessionToJSON: () => {
    const state = get();
    
    const session: ScaleSession = {
      version: '1.0',
      type: 'scale-session',
      exportedAt: new Date().toISOString(),
      data: {
        viewports: state.viewports,
        styles: state.styles,
        baseParameters: state.baseParameters,
        computedParameters: state.computedParameters,
        modifiers: state.modifiers,
        ratioFamilies: state.ratioFamilies,
        responsiveVariants: state.responsiveVariants,
        outputFolders: state.outputFolders,
        outputLayers: state.outputLayers,
      },
    };
    
    return session;
  },

  exportToJSON: () => {
    const state = get();
    
    // Generate export in Figma Variables API format
    return generateFigmaExport(
      state.viewports,
      state.styles,
      state.baseParameters,
      state.computedParameters,
      state.modifiers,
      state.ratioFamilies,
      state.responsiveVariants,
      'Grid'  // Collection name
    );
  },

  // Clear workspace - reset to initial empty state
  clearWorkspace: () => {
    set({
      viewports: [],
      styles: [],
      baseParameters: [],
      computedParameters: [],
      generatedTokens: [],
      modifiers: [],
      ratioFamilies: [],
      responsiveVariants: [],
      outputFolders: [],
      outputLayers: [],
      selectedViewportId: null,
      selectedStyleId: null,
      selectedFolderId: null,
      activeTab: 'parameters',
    });
  },
}));
