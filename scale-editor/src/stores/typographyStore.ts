import { create } from 'zustand';

interface Mode {
  id: string;
  name: string;
}

interface Collection {
  id: string;
  name: string;
  modes: Mode[];
  // For Size: scales[viewport] -> modeId -> value
  // For Line Height: scalesA[category] -> modeId -> value, scalesB[category] -> modeId -> value
  scales: Record<string, Record<string, number>>;
  scalesA?: Record<string, Record<string, number>>; // Line Height A parameter
  scalesB?: Record<string, Record<string, number>>; // Line Height B parameter
  refScale: number[];
  groups: string[]; // e.g. ["Desktop", "Laptop", "Tablet", "Mobile"]
  categories?: string[]; // For Line Height: ["xl", "l", "m", "s", "xs"]
}

interface TypographyState {
  collections: Collection[];
  activeCollectionIndex: number;

  loadFromJSON: (data: unknown) => void;
  setActiveCollection: (index: number) => void;
  setScale: (key: string, modeId: string, value: number) => void;
  setScaleA: (category: string, modeId: string, value: number) => void;
  setScaleB: (category: string, modeId: string, value: number) => void;
  addRefValue: (value: number) => void;
  removeRefValue: (value: number) => void;
  exportToJSON: () => object;
}

const sortRefScale = (refs: number[]): number[] => {
  return [...refs].sort((a, b) => a - b);
};

const createDefaultCollection = (name: string, isLineHeight = false): Collection => {
  const defaultModes = [{ id: 'mode:0', name: 'Default' }];
  const defaultScales: Record<string, Record<string, number>> = {
    Desktop: { 'mode:0': 1 },
    Laptop: { 'mode:0': 0.9 },
    Tablet: { 'mode:0': 0.8 },
    Mobile: { 'mode:0': 0.7 },
  };
  
  const base: Collection = {
    id: `collection:${name.toLowerCase().replace(/\s+/g, '-')}`,
    name,
    modes: defaultModes,
    scales: isLineHeight ? {} : defaultScales,
    refScale: [10, 12, 14, 16, 18, 20, 22, 24, 28, 32, 36, 40, 44, 48, 56, 60, 64, 72, 80, 96, 128],
    groups: ['Desktop', 'Laptop', 'Tablet', 'Mobile'],
  };

  if (isLineHeight) {
    base.scalesA = {
      xl: { 'mode:0': 1.4 },
      l: { 'mode:0': 1.35 },
      m: { 'mode:0': 1.25 },
      s: { 'mode:0': 1.02 },
      xs: { 'mode:0': 1.0 },
    };
    base.scalesB = {
      xl: { 'mode:0': 6 },
      l: { 'mode:0': 4 },
      m: { 'mode:0': 2 },
      s: { 'mode:0': 2 },
      xs: { 'mode:0': 0 },
    };
    base.categories = ['xl', 'l', 'm', 's', 'xs'];
  }

  return base;
};

export const useTypographyStore = create<TypographyState>((set, get) => ({
  collections: [createDefaultCollection('Size'), createDefaultCollection('Line Height', true)],
  activeCollectionIndex: 0,

  loadFromJSON: (data) => {
    try {
      const json = data as {
        collections: Array<{
          id: string;
          name: string;
          modes: Array<{ id: string; name: string }>;
          variables: Array<{
            name: string;
            valuesByMode: Record<string, { value: number }>;
          }>;
        }>;
      };

      const collections: Collection[] = json.collections.map((coll) => {
        const modes = coll.modes.map((m) => ({ id: m.id, name: m.name }));
        const refSet = new Set<number>();
        const groupSet = new Set<string>();
        const categorySet = new Set<string>();
        const scales: Collection['scales'] = {};
        const scalesA: Record<string, Record<string, number>> = {};
        const scalesB: Record<string, Record<string, number>> = {};
        
        const isLineHeight = coll.name === 'Line Height';

        coll.variables.forEach((v) => {
          const parts = v.name.split('/');

          // Skip Base/ variables (just extract ref values)
          if (parts[0] === 'Base' && parts[1]?.startsWith('ref-')) {
            const refNum = parseInt(parts[1].replace('ref-', ''), 10);
            if (!isNaN(refNum)) {
              refSet.add(refNum);
            }
            return;
          }

          // Parse Scale/ variables
          if (parts[0] === 'Scale') {
            if (isLineHeight) {
              // Line Height scales: Scale/A-XL, Scale/B-L, etc.
              const scaleKey = parts[1];
              if (scaleKey?.startsWith('A-')) {
                const category = scaleKey.replace('A-', '').toLowerCase();
                if (!scalesA[category]) scalesA[category] = {};
                modes.forEach((m) => {
                  const val = v.valuesByMode[m.id]?.value;
                  if (val !== undefined) {
                    scalesA[category][m.id] = Math.round(val * 100) / 100;
                  }
                });
                categorySet.add(category);
              } else if (scaleKey?.startsWith('B-')) {
                const category = scaleKey.replace('B-', '').toLowerCase();
                if (!scalesB[category]) scalesB[category] = {};
                modes.forEach((m) => {
                  const val = v.valuesByMode[m.id]?.value;
                  if (val !== undefined) {
                    scalesB[category][m.id] = Math.round(val * 100) / 100;
                  }
                });
              }
            } else {
              // Size scales: Scale/Desktop, Scale/Laptop, etc.
              const viewport = parts[1];
              if (viewport && !viewport.startsWith('A-') && !viewport.startsWith('B-') && viewport !== 'Test') {
                if (!scales[viewport]) scales[viewport] = {};
                modes.forEach((m) => {
                  const val = v.valuesByMode[m.id]?.value;
                  if (val !== undefined) {
                    scales[viewport][m.id] = Math.round(val * 100) / 100;
                  }
                });
              }
            }
            return;
          }

          // Parse computed variables to extract groups (viewports)
          // Size/Desktop/ref-16 or Line Height/Desktop/ref-16-xl
          if (parts.length >= 3 && parts[0] === coll.name) {
            const viewport = parts[1];
            groupSet.add(viewport);

            // Extract ref value
            const lastPart = parts[parts.length - 1];
            if (lastPart?.startsWith('ref-')) {
              // Handle ref-16 or ref-16-xl
              const refPart = lastPart.replace('ref-', '');
              const dashIndex = refPart.indexOf('-');
              if (dashIndex > 0) {
                // Line Height: ref-16-xl
                const refNum = parseInt(refPart.substring(0, dashIndex), 10);
                const category = refPart.substring(dashIndex + 1);
                if (!isNaN(refNum)) refSet.add(refNum);
                if (category) categorySet.add(category);
              } else {
                // Size: ref-16
                const refNum = parseInt(refPart, 10);
                if (!isNaN(refNum)) refSet.add(refNum);
              }
            }
          }
        });

        // If no scales found, create defaults
        const groups = Array.from(groupSet).sort((a, b) => {
          const order = ['Desktop', 'Laptop', 'Tablet', 'Mobile'];
          return order.indexOf(a) - order.indexOf(b);
        });

        if (Object.keys(scales).length === 0 && !isLineHeight) {
          groups.forEach((viewport, i) => {
            scales[viewport] = {};
            const defaultVal = [1, 0.9, 0.8, 0.7][i % 4];
            modes.forEach((m) => {
              scales[viewport][m.id] = defaultVal;
            });
          });
        }

        const categories = Array.from(categorySet).sort((a, b) => {
          const order = ['xl', 'l', 'm', 's', 'xs'];
          return order.indexOf(a) - order.indexOf(b);
        });

        // Default A/B scales for Line Height if not found
        if (isLineHeight && Object.keys(scalesA).length === 0) {
          const defaultA: Record<string, number> = { xl: 1.4, l: 1.35, m: 1.25, s: 1.02, xs: 1.0 };
          const defaultB: Record<string, number> = { xl: 6, l: 4, m: 2, s: 2, xs: 0 };
          categories.forEach((cat) => {
            scalesA[cat] = {};
            scalesB[cat] = {};
            modes.forEach((m) => {
              scalesA[cat][m.id] = defaultA[cat] ?? 1.25;
              scalesB[cat][m.id] = defaultB[cat] ?? 2;
            });
          });
        }

        const refScale = sortRefScale(Array.from(refSet));

        const result: Collection = {
          id: coll.id,
          name: coll.name,
          modes,
          scales,
          refScale: refScale.length > 0 ? refScale : [10, 12, 14, 16, 18, 20, 22, 24, 28, 32, 36, 40, 44, 48, 56, 60, 64, 72, 80, 96, 128],
          groups: groups.length > 0 ? groups : ['Desktop', 'Laptop', 'Tablet', 'Mobile'],
        };

        if (isLineHeight) {
          result.scalesA = scalesA;
          result.scalesB = scalesB;
          result.categories = categories.length > 0 ? categories : ['xl', 'l', 'm', 's', 'xs'];
        }

        return result;
      });

      set({ collections, activeCollectionIndex: 0 });
      console.log('Loaded typography collections:', collections.map((c) => ({
        name: c.name,
        groups: c.groups,
        scales: Object.keys(c.scales),
        categories: c.categories,
      })));
    } catch (err) {
      console.error('Failed to parse JSON:', err);
    }
  },

  setActiveCollection: (index) => set({ activeCollectionIndex: index }),

  setScale: (key, modeId, value) =>
    set((state) => {
      const collections = [...state.collections];
      const coll = { ...collections[state.activeCollectionIndex] };
      coll.scales = {
        ...coll.scales,
        [key]: {
          ...coll.scales[key],
          [modeId]: value,
        },
      };
      collections[state.activeCollectionIndex] = coll;
      return { collections };
    }),

  setScaleA: (category, modeId, value) =>
    set((state) => {
      const collections = [...state.collections];
      const coll = { ...collections[state.activeCollectionIndex] };
      coll.scalesA = {
        ...coll.scalesA,
        [category]: {
          ...coll.scalesA?.[category],
          [modeId]: value,
        },
      };
      collections[state.activeCollectionIndex] = coll;
      return { collections };
    }),

  setScaleB: (category, modeId, value) =>
    set((state) => {
      const collections = [...state.collections];
      const coll = { ...collections[state.activeCollectionIndex] };
      coll.scalesB = {
        ...coll.scalesB,
        [category]: {
          ...coll.scalesB?.[category],
          [modeId]: value,
        },
      };
      collections[state.activeCollectionIndex] = coll;
      return { collections };
    }),

  addRefValue: (value) =>
    set((state) => {
      const collections = [...state.collections];
      const coll = { ...collections[state.activeCollectionIndex] };
      coll.refScale = sortRefScale([...coll.refScale, value]);
      collections[state.activeCollectionIndex] = coll;
      return { collections };
    }),

  removeRefValue: (value) =>
    set((state) => {
      const collections = [...state.collections];
      const coll = { ...collections[state.activeCollectionIndex] };
      coll.refScale = coll.refScale.filter((v) => v !== value);
      collections[state.activeCollectionIndex] = coll;
      return { collections };
    }),

  exportToJSON: () => {
    const state = get();

    const collections = state.collections.map((coll) => {
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
      const isLineHeight = coll.name === 'Line Height';

      if (isLineHeight) {
        // Line Height: {CollectionName}/{Viewport}/ref-{N}-{category}
        coll.groups.forEach((viewport) => {
          coll.refScale.forEach((ref) => {
            (coll.categories || []).forEach((category) => {
              variables.push({
                id: `VariableID:${varIdx++}`,
                name: `${coll.name}/${viewport}/ref-${ref}-${category}`,
                type: 'FLOAT',
                description: '',
                hiddenFromPublishing: false,
                scopes: ['FONT_SIZE'], // Actually line height, but Figma uses this
                codeSyntax: {},
                valuesByMode: Object.fromEntries(
                  coll.modes.map((m) => {
                    const a = coll.scalesA?.[category]?.[m.id] ?? 1.25;
                    const b = coll.scalesB?.[category]?.[m.id] ?? 2;
                    // Line Height = ref × (A + B / ref)
                    // But we need Size first, which depends on viewport scale
                    // For now, assume Size = ref (scale = 1)
                    const computed = Math.round(ref * (a + b / ref) * 100) / 100;
                    return [m.id, { type: 'FLOAT', value: computed }];
                  })
                ),
              });
            });
          });
        });
      } else {
        // Size: {CollectionName}/{Viewport}/ref-{N}
        coll.groups.forEach((viewport) => {
          coll.refScale.forEach((ref) => {
            variables.push({
              id: `VariableID:${varIdx++}`,
              name: `${coll.name}/${viewport}/ref-${ref}`,
              type: 'FLOAT',
              description: '',
              hiddenFromPublishing: false,
              scopes: ['FONT_SIZE'],
              codeSyntax: {},
              valuesByMode: Object.fromEntries(
                coll.modes.map((m) => {
                  const scale = coll.scales[viewport]?.[m.id] ?? 1;
                  const computed = Math.round(ref * scale * 100) / 100;
                  return [m.id, { type: 'FLOAT', value: computed }];
                })
              ),
            });
          });
        });
      }

      return {
        id: coll.id,
        name: coll.name,
        defaultModeId: coll.modes[0]?.id ?? 'mode:0',
        hiddenFromPublishing: false,
        modes: coll.modes,
        variables,
      };
    });

    return {
      version: '1.0',
      exportedAt: new Date().toISOString(),
      fileName: '3-R4-Typography-Scale',
      collections,
    };
  },
}));

// Helper to get active collection
export const useActiveTypographyCollection = () => {
  const store = useTypographyStore();
  return store.collections[store.activeCollectionIndex];
};

// Calculate Size
export function calculateSize(ref: number, scale: number): number {
  return Math.round(ref * scale * 100) / 100;
}

// Calculate Line Height
export function calculateLineHeight(size: number, a: number, b: number): number {
  return Math.round(size * (a + b / size) * 100) / 100;
}

// Build sidebar groups - flat list of viewports (no nesting needed)
export function buildTypographySidebarGroups(
  groups: string[],
  refCount: number,
  categories?: string[]
): { name: string; path: string; count: number; indent: number }[] {
  const multiplier = categories ? categories.length : 1;
  return groups.map((group) => ({
    name: group,
    path: group,
    count: refCount * multiplier,
    indent: 0,
  }));
}
