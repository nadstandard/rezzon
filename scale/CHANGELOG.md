# REZZON Scale — Changelog

## [0.3.7] - 2025-01-02

### Breaking Changes
- **Removed `generateHeight`** — No longer a toggle; create separate folders instead
- **Removed `widthPrefix`/`heightPrefix`** — Use `tokenPrefix` on each folder
- **Single ratio selection** — `multiplyByRatio` now uses ONE ratio (radio buttons instead of checkboxes)

### Changed
- **Simplified architecture** — Each folder generates one set of tokens with one configuration
  - For heights: Create folder with `h-col-` prefix and enable `multiplyByRatio` with selected ratio
  - For widths: Create folder with `w-col-` prefix without ratio multiplication
- **Ratio multiplication** — When enabled, all values are multiplied by ratioB/ratioA
- **Responsive Variants** — Hidden in UI ("Coming soon") until redesigned

### Updated Demo Data
- `column` folder — Standard viewport columns (v-col-*)
- `photo/width` folder — Photo widths (w-col-*)
- `photo/height-horizontal` folder — Heights with 16:9 ratio (h-col-*)
- `photo/height-square` folder — Heights with 1:1 ratio (h-col-*)

### Added
- Radio button styling for single ratio selection
- "Coming soon" badge for disabled features
- Config hint text for upcoming features

---

## [0.3.6] - 2025-01-02

### Fixed
- **Responsive Variants** — Now properly respect their configuration:
  - `viewportBehaviors.overrideColumns` — when a responsive variant specifies different column count per viewport, it's now used
  - `ratioConfigs` — ratio configurations per responsive variant are now used instead of folder defaults
  - `ratioConfigs.enabledModifiers` — modifiers can now be configured per ratio within a responsive variant

### Changed
- Token generation now creates tokens with correct column counts per viewport/responsive combination
- Height token generation uses ratio-specific modifier configuration from responsive variants

---

## [0.3.5] - 2025-01-02

### Added
- **Formula Parser** — Real parser for modifier formulas replacing hardcoded patterns
  - Supports: `+ gutter`, `+ margin-m`, `+ column-width/2`, `+ gutter * 2`, etc.
  - Variables available: viewport, gutter, margin-m, margin-xs, columns, column-width, ingrid, photo-margin
  - Supports arithmetic: `+`, `-`, `*`, `/`, parentheses
- **Drag & Drop Reordering** — Using @dnd-kit library
  - Viewports in sidebar — drag to reorder
  - Modifiers in Generators — drag to change global order
- **Token Generation Order** — Grouped by modifier
  - Base tokens first (v-col-1, v-col-2, ..., v-full)
  - Then all tokens for modifier 1 (v-col-1-w-half, v-col-2-w-half, ...)
  - Then all tokens for modifier 2, etc.
  - Order controlled by global modifier ordering

### Changed
- Modifier formulas now use real parsing instead of string matching
- Token generation respects global modifier order for consistent output

---

## [0.3.4] - 2025-01-02

### Added
- **Clear Workspace** — Button in header to reset application to empty state with confirmation modal

### Changed
- **Preview tab completely rewritten** — Now shows ALL tokens from ALL outputFolders with working filters
  - Filter by Folder, Viewport, Responsive variant
  - Search across token paths
  - Shows total token count with filter status
  - Empty state when no folders configured
- **Full token preview in Generators** — Panel shows ALL tokens for selected folder (no limit)
- **Subfolder preview** — Selecting a grouping folder shows tokens from all its children recursively
- **All styles default to 12 columns** — Triangle and Square changed from 6/4 to 12
- **Statistics** — Sidebar and Statusbar now calculate totals from outputFolders dynamically

### Removed
- **Output Layers section** — Removed deprecated section from left sidebar (replaced by Output Folders in Generators)

---

## [0.3.3] - 2025-01-01

### Fixed
- **Statistics Total Tokens** — Now calculated dynamically using `calculateFolderTokenCount()`
- **Duplicate Token Names** — Height tokens now include ratio name suffix: `h-col-1-horizontal`, `h-col-1-square`
- **generateHeight Logic** — Folders with `generateHeight: true` now generate ONLY height tokens (width tokens are in separate folders)

### Changed
- `folderTokenCounts` computed map for real-time token count display in UI
- Height folder no longer duplicates width tokens

---

## [0.3.2] - 2025-01-01

### Added
- **Path Template Parsing** — Full support for `{viewport}`, `{responsive}`, `{ratio}` variables in output paths
  - `parsePathTemplate()` — Detects template variables
  - `resolvePathTemplate()` — Resolves variables to actual values
  - Token count calculation respects path template expansion

- **Height Generation from Ratios** — Generate height tokens from width tokens
  - `generateHeightTokensForRatio()` — Calculate heights using ratio multiplier
  - Separate width/height prefixes (`widthPrefix`, `heightPrefix`)
  - Preview shows both width and height tokens

- **Full Token Export** — `generateAllTokensForFolder()` generates tokens with:
  - Full paths resolved from templates
  - Viewport/responsive/ratio metadata per token
  - Expansion across all viewports and responsive variants

### Changed
- `generateBaseWidthTokens()` extracted as internal helper
- `calculateFolderTokenCount()` now respects path template variables
- Demo data updated with proper path templates

---

## [0.3.1] - 2025-01-01

### Added
- **Generator connected to OutputFolders** — Token preview shows real calculated values
  - `getTokenPreviewForFolder()` — Get preview tokens for UI
  - `FolderGeneratorContext` — Context object for token generation

### Fixed
- Token preview no longer shows hardcoded placeholder values
- Token count dynamically recalculates on folder configuration changes

---

## [0.3.0] - 2025-12-30

### Added
- **Output Folders Architecture** — Complete redesign of Generators view with user-configurable output folder system
  - Folder tree panel with hierarchical nesting support
  - Folder configuration panel with path templates, token prefixes
  - Per-folder modifier, responsive variant, and ratio selection
  - Token preview panel showing generated tokens for selected folder

### New Types
- `OutputFolder` interface with full configuration:
  - `path` — Output path template with `{viewport}`, `{responsive}`, `{ratio}` variables
  - `tokenPrefix` — Prefix for generated token names
  - `enabledModifiers` — Selected modifier IDs
  - `enabledResponsiveVariants` — Selected responsive variant IDs
  - `multiplyByRatio` — Toggle for ratio multiplication
  - `generateHeight` — Toggle for height generation from ratios

### New Store Actions
- `addOutputFolder`, `updateOutputFolder`, `removeOutputFolder`
- `selectFolder` — Folder selection in tree
- `toggleFolderModifier`, `toggleFolderResponsive`, `toggleFolderRatio`
- `recalculateFolderTokenCounts`

### UI Components
- New `GeneratorsView` with 4-column layout:
  1. Folders panel (260px) — tree view with CRUD
  2. Preview panel (flex) — token preview table
  3. Config panel (320px) — folder configuration
  4. Sidebar (220px) — global definitions

- `FolderModal` for add/edit output folders

### Changed
- Store now includes `selectedFolderId` for folder selection state
- Session export/import includes `outputFolders` array

---

## [0.2.0] - 2025-12-24

### Added
- Generators view with responsive variants
- Modifier management (add/edit/delete)
- Ratio families (add/edit/delete)
- Viewport behaviors per responsive variant
- Token count calculations

---

## [0.1.0] - 2025-12-22

### Added
- Initial Parameters view
- Viewport and Style management
- Base and Computed parameters
- Basic token generation engine
