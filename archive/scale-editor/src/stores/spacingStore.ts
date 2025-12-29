import { create } from 'zustand';

interface Mode {
  id: string;
  name: string;
}

interface Collection {
  id: string;
  name: string;
  modes: Mode[];
  scales: Record<string, Record<string, Record<string, number>>>; // type -> viewport -> modeId -> value
  refScale: number[];
  groups: string[]; // parsed from JSON variable names, e.g. ["Padding", "Padding/Desktop", "Spacing", ...]
}

interface SpacingState {
  collections: Collection[];
  activeCollectionIndex: number;
  
  loadFromJSON: (data: unknown) => void;
  setActiveCollection: (index: number) => void;
  setScale: (type: string, viewport: string, modeId: string, value: number) => void;
  addRefValue: (value: number) => void;
  removeRefValue: (value: number) => void;
  exportToJSON: () => object;
}

// Sort ref scale: positive (asc), 0, negative (desc by abs)
const sortRefScale = (refs: number[]): number[] => {
  return [...refs].sort((a, b) => {
    if (a > 0 && b > 0) return a - b;
    if (a > 0 && b <= 0) return -1;
    if (a <= 0 && b > 0) return 1;
    if (a === 0 && b < 0) return -1;
    if (a < 0 && b === 0) return 1;
    return b - a;
  });
};


const createDefaultCollection = (name: string): Collection => {
  const defaultModes = [{ id: 'mode:0', name: 'Default' }];
  return {
    id: `collection:${name.toLowerCase()}`,
    name,
    modes: defaultModes,
    scales: {},
    refScale: [2, 4, 6, 8, 10, 12, 14, 16, 18, 20, 24, 32, 40, 48, 56, 64],
    groups: [],
  };
};

export const useSpacingStore = create<SpacingState>((set, get) => ({
  collections: [createDefaultCollection('Vertical'), createDefaultCollection('Horizontal')],
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
        const scales: Collection['scales'] = {};

        coll.variables.forEach((v) => {
          const parts = v.name.split('/');
          
          // Build group paths from variable name (excluding last part which is ref-X)
          // e.g. "Vertical/Padding/Desktop/ref-2" -> groups: ["Vertical", "Vertical/Padding", "Vertical/Padding/Desktop"]
          // But we skip the collection name itself since it's redundant
          const pathParts = parts.slice(0, -1); // remove ref-X
          
          for (let i = 1; i <= pathParts.length; i++) {
            // Skip if first part equals collection name
            const startIdx = pathParts[0] === coll.name ? 1 : 0;
            if (i > startIdx) {
              const groupPath = pathParts.slice(startIdx, i).join('/');
              if (groupPath) groupSet.add(groupPath);
            }
          }

          // Parse ref from last part
          const lastPart = parts[parts.length - 1];
          if (lastPart?.startsWith('ref-')) {
            const refStr = lastPart.replace('ref-', '');
            const refNum = parseInt(refStr, 10);
            if (!isNaN(refNum)) {
              refSet.add(refNum);
            }
          }

          // Parse scale parameters: Scale/Type/Viewport
          if (parts[0] === 'Scale' && parts.length === 3) {
            const type = parts[1];
            const viewport = parts[2];
            if (!scales[type]) scales[type] = {};
            if (!scales[type][viewport]) scales[type][viewport] = {};
            modes.forEach((m) => {
              const val = v.valuesByMode[m.id]?.value;
              if (val !== undefined) {
                scales[type][viewport][m.id] = Math.round(val * 100) / 100;
              }
            });
          }
        });

        // If no scales found from Scale/ variables, try to infer from group structure
        if (Object.keys(scales).length === 0) {
          // Get types and viewports from groups
          const groupArray = Array.from(groupSet);
          const types = new Set<string>();
          const viewportsPerType: Record<string, Set<string>> = {};
          
          groupArray.forEach(g => {
            const parts = g.split('/');
            if (parts.length >= 1) {
              types.add(parts[0]);
              if (!viewportsPerType[parts[0]]) viewportsPerType[parts[0]] = new Set();
              if (parts.length >= 2) {
                viewportsPerType[parts[0]].add(parts[1]);
              }
            }
          });
          
          // Create default scales
          types.forEach(type => {
            scales[type] = {};
            const viewports = viewportsPerType[type] || new Set(['Desktop', 'Laptop', 'Tablet', 'Mobile']);
            let i = 0;
            viewports.forEach(vp => {
              scales[type][vp] = {};
              const defaultVal = [1, 0.9, 0.85, 0.72][i % 4];
              modes.forEach(m => {
                scales[type][vp][m.id] = defaultVal;
              });
              i++;
            });
          });
        }

        const refScale = sortRefScale(Array.from(refSet));
        const groups = Array.from(groupSet).sort();

        return {
          id: coll.id,
          name: coll.name,
          modes,
          scales,
          refScale: refScale.length > 0 ? refScale : [2, 4, 6, 8, 10, 12, 14, 16, 18, 20, 24, 32, 40, 48, 56, 64],
          groups,
        };
      });

      set({ collections, activeCollectionIndex: 0 });
      console.log('Loaded collections:', collections.map(c => ({ name: c.name, groups: c.groups, scales: Object.keys(c.scales) })));
    } catch (err) {
      console.error('Failed to parse JSON:', err);
    }
  },

  setActiveCollection: (index) => set({ activeCollectionIndex: index }),

  setScale: (type, viewport, modeId, value) =>
    set((state) => {
      const collections = [...state.collections];
      const coll = { ...collections[state.activeCollectionIndex] };
      coll.scales = {
        ...coll.scales,
        [type]: {
          ...coll.scales[type],
          [viewport]: {
            ...coll.scales[type]?.[viewport],
            [modeId]: value,
          },
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
      const types = Object.keys(coll.scales);
      
      types.forEach((type) => {
        const viewports = Object.keys(coll.scales[type] || {});
        viewports.forEach((viewport) => {
          coll.refScale.forEach((ref) => {
            variables.push({
              id: `VariableID:${varIdx++}`,
              name: `${type}/${viewport}/ref-${ref}`,
              type: 'FLOAT',
              description: '',
              hiddenFromPublishing: false,
              scopes: [],
              codeSyntax: {},
              valuesByMode: Object.fromEntries(
                coll.modes.map((m) => {
                  const scale = coll.scales[type]?.[viewport]?.[m.id] ?? 1;
                  const computed = Math.round(ref * scale);
                  return [m.id, { type: 'FLOAT', value: computed }];
                })
              ),
            });
          });
        });
      });

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
      fileName: '2-R4-Spacing-Scale',
      collections,
    };
  },
}));

// Helper to get active collection
export const useActiveCollection = () => {
  const store = useSpacingStore();
  return store.collections[store.activeCollectionIndex];
};

export function calculateSpacing(ref: number, scale: number): number {
  return Math.round(ref * scale);
}

// Build sidebar groups with hierarchy from collection.groups
export function buildSidebarGroups(groups: string[], refCount: number): { name: string; path: string; count: number; indent: number }[] {
  const result: { name: string; path: string; count: number; indent: number }[] = [];
  
  groups.forEach(path => {
    const parts = path.split('/');
    const depth = parts.length - 1;
    const name = parts[parts.length - 1];
    
    // Count: leaf groups have refCount, parent groups sum of children
    const childGroups = groups.filter(g => g.startsWith(path + '/'));
    const isLeaf = childGroups.length === 0;
    const count = isLeaf ? refCount : childGroups.filter(g => {
      const remaining = g.slice(path.length + 1);
      return !remaining.includes('/'); // direct children only
    }).length * refCount;
    
    result.push({ name, path, count, indent: depth });
  });
  
  return result;
}
