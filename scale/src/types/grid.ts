// ============================================
// REZZON Scale – Grid Types
// ============================================

// === VALUE TYPES ===
export type ValueType = 'base' | 'computed' | 'generated';

// === VIEWPORT ===
export interface Viewport {
  id: string;
  name: string;        // e.g., "Desktop", "Tablet", "Mobile"
  width: number;       // e.g., 1920, 768, 390
  icon: 'monitor' | 'laptop' | 'tablet' | 'phone';
}

// === STYLE (Mode/Column) ===
export interface Style {
  id: string;
  name: string;        // e.g., "Cross", "Circle", "Triangle", "Square"
  columns: number;     // number of columns for this style
}

// === BASE PARAMETER ===
export interface BaseParameter {
  id: string;
  name: string;                          // e.g., "viewport", "gutter-width", "margin-m"
  type: 'base';
  values: Record<string, number>;        // styleId -> value
  editable: boolean;
}

// === COMPUTED PARAMETER ===
export interface ComputedParameter {
  id: string;
  name: string;                          // e.g., "column-width", "number-of-gutters", "ingrid"
  type: 'computed';
  formula: string;                       // e.g., "(viewport - (2 × margin-m) - ((columns - 1) × gutter)) / columns"
  values: Record<string, number>;        // styleId -> computed value (auto-calculated)
}

// === GENERATED TOKEN ===
export interface GeneratedToken {
  id: string;
  name: string;                          // e.g., "v-col-1", "v-col-2-w-half"
  baseColumn: number;                    // 1, 2, 3, ... 12
  modifier?: string;                     // "-w-half", "-w-margin", "-to-edge"
  values: Record<string, number>;        // styleId -> value
}

// === MODIFIER ===
export interface Modifier {
  id: string;
  name: string;                          // e.g., "-w-half", "-w-margin", "-to-edge"
  formula: string;                       // e.g., "+ col-width/2", "+ photo-margin"
  applyFrom: number;                     // start column (1-based)
  applyTo: number;                       // end column (1-based)
  hasFullVariant: boolean;               // whether to generate "full" variant with ×2 symmetry
}

// === RATIO FAMILY ===
export interface RatioFamily {
  id: string;
  name: string;                          // e.g., "horizontal", "vertical", "square"
  ratioA: number;                        // e.g., 4 (for 4:3)
  ratioB: number;                        // e.g., 3 (for 4:3)
}

// === RESPONSIVE VARIANT ===
export interface ResponsiveVariant {
  id: string;
  name: string;                          // e.g., "static", "to-tab-6-col", "to-mobile-2col"
  description?: string;
  ratioConfigs: RatioConfig[];           // which ratios are enabled and their modifier configs
  viewportBehaviors: ViewportBehavior[]; // how this variant behaves per viewport
}

// === RATIO CONFIG (per responsive variant) ===
export interface RatioConfig {
  ratioId: string;
  enabled: boolean;
  enabledModifiers: string[];            // modifier IDs that are enabled for this ratio
}

// === VIEWPORT BEHAVIOR ===
export interface ViewportBehavior {
  viewportId: string;
  behavior: 'inherit' | 'override';
  overrideColumns?: number;              // if override, how many columns
  overrideRatioId?: string;              // if override, which ratio to use
}

// === OUTPUT LAYER (legacy - for backwards compatibility) ===
export interface OutputLayer {
  id: string;
  path: string;                          // e.g., "grid/column", "grid/photo/width"
  tokenCount: number;
}

// === OUTPUT FOLDER (new architecture) ===
export interface OutputFolder {
  id: string;
  name: string;                          // e.g., "column", "photo/width"
  parentId: string | null;               // null = root level
  path: string;                          // full path e.g., "photo/{viewport}/width/{responsive}"
  tokenPrefix: string;                   // e.g., "v-col-", "w-col-"
  
  // Configuration
  enabledModifiers: string[];            // modifier IDs to apply
  enabledResponsiveVariants: string[];   // responsive variant IDs
  
  // Ratio options
  multiplyByRatio: boolean;              // if true, generates subfolder per ratio
  enabledRatios: string[];               // ratio family IDs (used if multiplyByRatio)
  
  // Height generation
  generateHeight: boolean;               // if true, calculates height = width × ratio
  widthPrefix: string;                   // e.g., "w-col-" (used if generateHeight)
  heightPrefix: string;                  // e.g., "h-col-" (used if generateHeight)
  
  // Computed (auto-calculated)
  tokenCount: number;
}

// === GRID STATE ===
export interface GridState {
  // Core data
  viewports: Viewport[];
  styles: Style[];
  
  // Parameters
  baseParameters: BaseParameter[];
  computedParameters: ComputedParameter[];
  generatedTokens: GeneratedToken[];
  
  // Configuration
  modifiers: Modifier[];
  ratioFamilies: RatioFamily[];
  responsiveVariants: ResponsiveVariant[];
  
  // Output (new architecture)
  outputFolders: OutputFolder[];
  
  // Output (legacy)
  outputLayers: OutputLayer[];
  
  // UI State
  selectedViewportId: string | null;
  selectedStyleId: string | null;
  selectedFolderId: string | null;
  activeTab: 'parameters' | 'generators' | 'preview';
}

// === GRID ACTIONS ===
export interface GridActions {
  // Viewport actions
  addViewport: (viewport: Omit<Viewport, 'id'>) => void;
  updateViewport: (id: string, updates: Partial<Viewport>) => void;
  removeViewport: (id: string) => void;
  selectViewport: (id: string | null) => void;
  
  // Style actions
  addStyle: (style: Omit<Style, 'id'>) => void;
  updateStyle: (id: string, updates: Partial<Style>) => void;
  removeStyle: (id: string) => void;
  
  // Parameter actions
  updateBaseParameter: (id: string, styleId: string, value: number) => void;
  addBaseParameter: (param: Omit<BaseParameter, 'id'>) => void;
  removeBaseParameter: (id: string) => void;
  
  // Modifier actions
  addModifier: (modifier: Omit<Modifier, 'id'>) => void;
  updateModifier: (id: string, updates: Partial<Modifier>) => void;
  removeModifier: (id: string) => void;
  
  // Ratio actions
  addRatioFamily: (ratio: Omit<RatioFamily, 'id'>) => void;
  updateRatioFamily: (id: string, updates: Partial<RatioFamily>) => void;
  removeRatioFamily: (id: string) => void;
  
  // Responsive variant actions
  addResponsiveVariant: (variant: Omit<ResponsiveVariant, 'id'>) => void;
  updateResponsiveVariant: (id: string, updates: Partial<ResponsiveVariant>) => void;
  removeResponsiveVariant: (id: string) => void;
  toggleRatioInVariant: (variantId: string, ratioId: string, enabled: boolean) => void;
  toggleModifierInRatio: (variantId: string, ratioId: string, modifierId: string, enabled: boolean) => void;
  updateViewportBehavior: (variantId: string, viewportId: string, behavior: 'inherit' | 'override', overrideColumns?: number) => void;
  
  // Output folder actions (new)
  addOutputFolder: (folder: Omit<OutputFolder, 'id' | 'tokenCount'>) => void;
  updateOutputFolder: (id: string, updates: Partial<OutputFolder>) => void;
  removeOutputFolder: (id: string) => void;
  selectFolder: (id: string | null) => void;
  toggleFolderModifier: (folderId: string, modifierId: string, enabled: boolean) => void;
  toggleFolderResponsive: (folderId: string, variantId: string, enabled: boolean) => void;
  toggleFolderRatio: (folderId: string, ratioId: string, enabled: boolean) => void;
  
  // Tab navigation
  setActiveTab: (tab: 'parameters' | 'generators' | 'preview') => void;
  
  // Recalculation
  recalculateComputed: () => void;
  regenerateTokens: () => void;
  recalculateFolderTokenCounts: () => void;
  
  // Import/Export
  importFromJSON: (json: unknown) => { success: boolean; errors: string[] };
  exportToJSON: () => unknown;
  exportSessionToJSON: () => ScaleSession;
  
  // Workspace
  clearWorkspace: () => void;
}

// === FULL STORE TYPE ===
export type GridStore = GridState & GridActions;

// === SESSION FORMAT (for Import/Export) ===
export interface ScaleSessionData {
  viewports: Viewport[];
  styles: Style[];
  baseParameters: BaseParameter[];
  computedParameters: ComputedParameter[];
  modifiers: Modifier[];
  ratioFamilies: RatioFamily[];
  responsiveVariants: ResponsiveVariant[];
  outputFolders: OutputFolder[];
  outputLayers: OutputLayer[]; // legacy
}

export interface ScaleSession {
  version: string;                // "1.0"
  type: 'scale-session';
  exportedAt: string;             // ISO date string
  data: ScaleSessionData;
}

// === VALIDATION ===
export interface ValidationResult {
  valid: boolean;
  errors: string[];
  warnings: string[];
}
