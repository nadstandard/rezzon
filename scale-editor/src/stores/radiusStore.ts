import { create } from 'zustand';

interface Mode {
  id: string;
  name: string;
}

interface RadiusState {
  // From JSON
  modes: Mode[];
  
  // Editable parameters - per mode
  baseValue: Record<string, number>; // modeId -> value
  multipliers: Record<string, Record<string, number>>; // viewport -> modeId -> value
  refScale: number[];
  pillValues: Record<string, Record<string, number>>; // viewport -> modeId -> value
  
  // Actions
  loadFromJSON: (data: unknown) => void;
  setBaseValue: (modeId: string, value: number) => void;
  setMultiplier: (viewport: string, modeId: string, value: number) => void;
  setPillValue: (viewport: string, modeId: string, value: number) => void;
  addRefValue: (value: number) => void;
  removeRefValue: (value: number) => void;
  exportToJSON: () => object;
}

const VIEWPORTS = ['Desktop', 'Laptop', 'Tablet', 'Mobile'];

const defaultModes = [
  { id: 'mode:0', name: 'CROSS' },
  { id: 'mode:1', name: 'CIRCLE' },
  { id: 'mode:2', name: 'TRIANGLE' },
  { id: 'mode:3', name: 'SQUARE' },
];

// Helper to create default values for all modes
const createModeValues = (modes: Mode[], value: number): Record<string, number> => 
  Object.fromEntries(modes.map(m => [m.id, value]));

const createViewportModeValues = (modes: Mode[], viewports: string[], value: number): Record<string, Record<string, number>> =>
  Object.fromEntries(viewports.map(v => [v, createModeValues(modes, value)]));

export const useRadiusStore = create<RadiusState>((set, get) => ({
  modes: defaultModes,
  
  baseValue: createModeValues(defaultModes, 2),
  multipliers: {
    Desktop: createModeValues(defaultModes, 1.0),
    Laptop: createModeValues(defaultModes, 0.9),
    Tablet: createModeValues(defaultModes, 0.85),
    Mobile: createModeValues(defaultModes, 0.8),
  },
  refScale: [2, 4, 6, 8, 10, 12, 16, 20, 24, 28, 32, 48, 64, 96],
  pillValues: createViewportModeValues(defaultModes, VIEWPORTS, 999),

  loadFromJSON: (data) => {
    try {
      const json = data as {
        collections: Array<{
          modes: Array<{ id: string; name: string }>;
          variables: Array<{
            name: string;
            valuesByMode: Record<string, { value: number }>;
          }>;
        }>;
      };

      const collection = json.collections[0];
      if (!collection) return;

      // Extract modes
      const modes = collection.modes.map((m) => ({ id: m.id, name: m.name }));

      // Extract ref scale from variable names (Desktop/v-2 -> 2)
      const refSet = new Set<number>();
      const pillValues: Record<string, Record<string, number>> = {};

      // Initialize pill values structure
      VIEWPORTS.forEach(vp => {
        pillValues[vp] = {};
        modes.forEach(m => {
          pillValues[vp][m.id] = 999;
        });
      });

      collection.variables.forEach((v) => {
        const [viewport, varName] = v.name.split('/');
        
        if (varName === 'v-pill' && VIEWPORTS.includes(viewport)) {
          // Get pill value per mode
          modes.forEach(m => {
            pillValues[viewport][m.id] = v.valuesByMode[m.id]?.value ?? 999;
          });
        } else if (varName?.startsWith('v-')) {
          const refNum = parseInt(varName.replace('v-', ''), 10);
          if (!isNaN(refNum)) {
            refSet.add(refNum);
          }
        }
      });

      const refScale = Array.from(refSet).sort((a, b) => a - b);

      // Create default base and multiplier values for new modes
      const baseValue = createModeValues(modes, 2);
      const multipliers: Record<string, Record<string, number>> = {
        Desktop: createModeValues(modes, 1.0),
        Laptop: createModeValues(modes, 0.9),
        Tablet: createModeValues(modes, 0.85),
        Mobile: createModeValues(modes, 0.8),
      };

      set({
        modes,
        baseValue,
        multipliers,
        refScale: refScale.length > 0 ? refScale : get().refScale,
        pillValues,
      });

      console.log('Loaded:', { modes, refScale, pillValues });
    } catch (err) {
      console.error('Failed to parse JSON:', err);
    }
  },

  setBaseValue: (modeId, value) =>
    set((state) => ({
      baseValue: { ...state.baseValue, [modeId]: value },
    })),
  
  setMultiplier: (viewport, modeId, value) =>
    set((state) => ({
      multipliers: {
        ...state.multipliers,
        [viewport]: { ...state.multipliers[viewport], [modeId]: value },
      },
    })),
  
  setPillValue: (viewport, modeId, value) =>
    set((state) => ({
      pillValues: {
        ...state.pillValues,
        [viewport]: { ...state.pillValues[viewport], [modeId]: value },
      },
    })),
  
  addRefValue: (value) =>
    set((state) => ({
      refScale: [...state.refScale, value].sort((a, b) => a - b),
    })),
  
  removeRefValue: (value) =>
    set((state) => ({
      refScale: state.refScale.filter((v) => v !== value),
    })),

  exportToJSON: () => {
    const state = get();
    const { modes, baseValue, multipliers, refScale, pillValues } = state;

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

    // Generate variables per viewport
    VIEWPORTS.forEach((viewport) => {
      // v-2, v-4, etc.
      refScale.forEach((ref) => {
        variables.push({
          id: `VariableID:${varIdx++}`,
          name: `${viewport}/v-${ref}`,
          type: 'FLOAT',
          description: '',
          hiddenFromPublishing: false,
          scopes: ['CORNER_RADIUS'],
          codeSyntax: {},
          valuesByMode: Object.fromEntries(
            modes.map((m) => {
              const base = baseValue[m.id] ?? 2;
              const mult = multipliers[viewport]?.[m.id] ?? 1;
              const computed = Math.round((ref / 2) * base * mult * 100) / 100;
              return [m.id, { type: 'FLOAT', value: computed }];
            })
          ),
        });
      });

      // v-pill
      variables.push({
        id: `VariableID:${varIdx++}`,
        name: `${viewport}/v-pill`,
        type: 'FLOAT',
        description: '',
        hiddenFromPublishing: false,
        scopes: ['CORNER_RADIUS'],
        codeSyntax: {},
        valuesByMode: Object.fromEntries(
          modes.map((m) => [m.id, { type: 'FLOAT', value: pillValues[viewport]?.[m.id] ?? 999 }])
        ),
      });
    });

    return {
      version: '1.0',
      exportedAt: new Date().toISOString(),
      fileName: '5-R4-Radii',
      collections: [
        {
          id: 'VariableCollectionId:radius',
          name: 'Radius',
          defaultModeId: modes[0]?.id ?? 'mode:0',
          hiddenFromPublishing: false,
          modes,
          variables,
        },
      ],
    };
  },
}));

// Calculate computed value
export function calculateRadius(ref: number, baseValue: number, multiplier: number): number {
  return Math.round((ref / 2) * baseValue * multiplier * 100) / 100;
}
