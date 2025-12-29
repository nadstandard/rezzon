import { create } from 'zustand';
import type { GridStore } from '../types';

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
  outputLayers: [],
  selectedViewportId: null,
  selectedStyleId: null,
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
    { id: 'st-3', name: 'Triangle', columns: 6 },
    { id: 'st-4', name: 'Square', columns: 4 },
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

  updateViewport: (id, updates) => set((state) => ({
    viewports: state.viewports.map((vp) =>
      vp.id === id ? { ...vp, ...updates } : vp
    ),
  })),

  removeViewport: (id) => set((state) => ({
    viewports: state.viewports.filter((vp) => vp.id !== id),
    selectedViewportId: state.selectedViewportId === id ? null : state.selectedViewportId,
  })),

  selectViewport: (id) => set({ selectedViewportId: id }),

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
  updateBaseParameter: (id, styleId, value) => set((state) => ({
    baseParameters: state.baseParameters.map((bp) =>
      bp.id === id
        ? { ...bp, values: { ...bp.values, [styleId]: value } }
        : bp
    ),
  })),

  addBaseParameter: (param) => set((state) => ({
    baseParameters: [...state.baseParameters, { ...param, id: generateId() }],
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

  // === TAB NAVIGATION ===
  setActiveTab: (tab) => set({ activeTab: tab }),

  // === RECALCULATION (placeholder) ===
  recalculateComputed: () => {
    // TODO: Implement formula engine
    console.log('Recalculating computed values...');
  },

  regenerateTokens: () => {
    // TODO: Implement token generation
    console.log('Regenerating tokens...');
  },

  // === IMPORT/EXPORT (placeholder) ===
  importFromJSON: (json) => {
    console.log('Importing from JSON...', json);
    // TODO: Implement JSON parser
  },

  exportToJSON: () => {
    const state = get();
    return {
      viewports: state.viewports,
      styles: state.styles,
      baseParameters: state.baseParameters,
      computedParameters: state.computedParameters,
      modifiers: state.modifiers,
      ratioFamilies: state.ratioFamilies,
      responsiveVariants: state.responsiveVariants,
    };
  },
}));
