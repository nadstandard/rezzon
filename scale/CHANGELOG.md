# REZZON Scale — Changelog

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
