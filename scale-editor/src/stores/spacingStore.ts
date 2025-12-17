import { create } from 'zustand';

interface Mode {
  id: string;
  name: string;
}

type ViewportType = 'Desktop' | 'Laptop' | 'Tablet' | 'Mobile';
type ScaleType = 'Padding' | 'Spacing';

interface SpacingState {
  modes: Mode[];
  collectionName: 'Vertical' | 'Horizontal';
  scales: Record<ScaleType, Record<ViewportType, Record<string, number>>>;
  refScale: number[];
  
  loadFromJSON: (data: unknown) => void;
  setScale: (type: ScaleType, viewport: ViewportType, modeId: string, value: number) => void;
  addRefValue: (value: number) => void;
  removeRefValue: (value: number) => void;
  setCollectionName: (name: 'Vertical' | 'Horizontal') => void;
  exportToJSON: () => object;
}

const VIEWPORTS: ViewportType[] = ['Desktop', 'Laptop', 'Tablet', 'Mobile'];
const SCALE_TYPES: ScaleType[] = ['Padding', 'Spacing'];

const defaultModes: Mode[] = [
  { id: 'mode:0', name: 'Legacy' },
  { id: 'mode:1', name: 'Test' },
];

const createModeValues = (modes: Mode[], value: number): Record<string, number> =>
  Object.fromEntries(modes.map((m) => [m.id, value]));

const defaultScales = (modes: Mode[]): SpacingState['scales'] => ({
  Padding: {
    Desktop: createModeValues(modes, 1.0),
    Laptop: createModeValues(modes, 0.9),
    Tablet: createModeValues(modes, 0.85),
    Mobile: createModeValues(modes, 0.72),
  },
  Spacing: {
    Desktop: createModeValues(modes, 1.0),
    Laptop: createModeValues(modes, 0.9),
    Tablet: createModeValues(modes, 0.85),
    Mobile: createModeValues(modes, 0.72),
  },
});

const defaultRefScale = [
  -64, -56, -48, -40, -32, -24, -20, -18, -16, -14, -12, -10, -8, -6, -4, -2,
  0, 2, 4, 6, 8, 10, 12, 14, 16, 18, 20, 24, 32, 40, 48, 56, 64, 72, 80, 96, 128, 160, 192, 200, 224, 256,
];

export const useSpacingStore = create<SpacingState>((set, get) => ({
  modes: defaultModes,
  collectionName: 'Vertical',
  scales: defaultScales(defaultModes),
  refScale: defaultRefScale,

  loadFromJSON: (data) => {
    try {
      const json = data as {
        collections: Array<{
          name: string;
          modes: Array<{ id: string; name: string }>;
          variables: Array<{
            name: string;
            valuesByMode: Record<string, { value: number }>;
          }>;
        }>;
      };

      const collection = json.collections[0];
      if (!collection) return;

      const collectionName = collection.name as 'Vertical' | 'Horizontal';
      const modes = collection.modes.map((m) => ({ id: m.id, name: m.name }));

      const refSet = new Set<number>();
      const scales: SpacingState['scales'] = defaultScales(modes);

      collection.variables.forEach((v) => {
        const parts = v.name.split('/');

        if (parts[0] === 'Base' && parts[1]?.startsWith('ref-')) {
          const refStr = parts[1].replace('ref-', '');
          const refNum = parseInt(refStr, 10);
          if (!isNaN(refNum)) {
            refSet.add(refNum);
          }
        } else if (parts[0] === 'Scale' && parts.length === 3) {
          const type = parts[1] as ScaleType;
          const viewport = parts[2] as ViewportType;
          if (SCALE_TYPES.includes(type) && VIEWPORTS.includes(viewport)) {
            modes.forEach((m) => {
              const val = v.valuesByMode[m.id]?.value;
              if (val !== undefined) {
                scales[type][viewport][m.id] = Math.round(val * 100) / 100;
              }
            });
          }
        }
      });

      const refScale = Array.from(refSet).sort((a, b) => a - b);

      set({
        modes,
        collectionName,
        scales,
        refScale: refScale.length > 0 ? refScale : get().refScale,
      });
    } catch (err) {
      console.error('Failed to parse Spacing JSON:', err);
    }
  },

  setScale: (type, viewport, modeId, value) =>
    set((state) => ({
      scales: {
        ...state.scales,
        [type]: {
          ...state.scales[type],
          [viewport]: {
            ...state.scales[type][viewport],
            [modeId]: value,
          },
        },
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

  setCollectionName: (name) => set({ collectionName: name }),

  exportToJSON: () => {
    const state = get();
    const { modes, collectionName, scales, refScale } = state;

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

    // Base/ref-X values
    refScale.forEach((ref) => {
      variables.push({
        id: `VariableID:${varIdx++}`,
        name: `Base/ref-${ref}`,
        type: 'FLOAT',
        description: '',
        hiddenFromPublishing: true,
        scopes: [],
        codeSyntax: {},
        valuesByMode: Object.fromEntries(
          modes.map((m) => [m.id, { type: 'FLOAT', value: ref }])
        ),
      });
    });

    // Scale values
    SCALE_TYPES.forEach((type) => {
      VIEWPORTS.forEach((viewport) => {
        variables.push({
          id: `VariableID:${varIdx++}`,
          name: `Scale/${type}/${viewport}`,
          type: 'FLOAT',
          description: '',
          hiddenFromPublishing: true,
          scopes: [],
          codeSyntax: {},
          valuesByMode: Object.fromEntries(
            modes.map((m) => [m.id, { type: 'FLOAT', value: scales[type][viewport][m.id] ?? 1 }])
          ),
        });
      });
    });

    // Computed values
    SCALE_TYPES.forEach((type) => {
      VIEWPORTS.forEach((viewport) => {
        refScale.forEach((ref) => {
          variables.push({
            id: `VariableID:${varIdx++}`,
            name: `${collectionName}/${type}/${viewport}/ref-${ref}`,
            type: 'FLOAT',
            description: `{{ Math.round( $Base/ref-${ref} * $Scale/${type}/${viewport}) }}`,
            hiddenFromPublishing: false,
            scopes: [],
            codeSyntax: {},
            valuesByMode: Object.fromEntries(
              modes.map((m) => {
                const scale = scales[type][viewport][m.id] ?? 1;
                const computed = Math.round(ref * scale);
                return [m.id, { type: 'FLOAT', value: computed }];
              })
            ),
          });
        });
      });
    });

    return {
      version: '1.0',
      exportedAt: new Date().toISOString(),
      fileName: '2-R4-Spacing-Scale',
      collections: [
        {
          id: `VariableCollectionId:spacing`,
          name: collectionName,
          defaultModeId: modes[0]?.id ?? 'mode:0',
          hiddenFromPublishing: false,
          modes,
          variables,
        },
      ],
    };
  },
}));

export function calculateSpacing(ref: number, scale: number): number {
  return Math.round(ref * scale);
}
