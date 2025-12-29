// Collection types
export type CollectionType = 'typography' | 'spacing' | 'grid' | 'radius';

export interface CollectionConfig {
  name: string;
  type: CollectionType;
  modes: string[];
  groups: Group[];
  formula?: string;
}

export interface Group {
  name: string;
  variables: Variable[];
  subgroups?: Group[];
}

export interface Variable {
  name: string;
  type: 'base' | 'parameter' | 'computed';
  values: Record<string, number>; // mode -> value
}

// Radius specific
export interface RadiusConfig {
  baseValue: number;
  basePill: number;
  multipliers: Record<string, Record<string, number>>; // mode -> viewport -> multiplier
  refScale: number[];
  modes: string[];
}

export const DEFAULT_VIEWPORTS = ['Desktop', 'Laptop', 'Tablet', 'Mobile'] as const;
export type Viewport = typeof DEFAULT_VIEWPORTS[number];

// File import
export interface ImportedFile {
  name: string;
  type: CollectionType | null;
  data: unknown;
}

export function detectCollectionType(filename: string): CollectionType | null {
  const lower = filename.toLowerCase();
  if (lower.includes('typography')) return 'typography';
  if (lower.includes('spacing')) return 'spacing';
  if (lower.includes('grid')) return 'grid';
  if (lower.includes('radius')) return 'radius';
  return null;
}
