# Scale Editor Changelog

## [0.0.24] - 2024-12-18

### Fixed
- Modal focus stealing — focus tylko przy otwarciu, nie przy każdym renderze
- Zaokrąglanie wartości — `Math.round()` do liczb całkowitych

### Changed
- Typography Editor startuje z pustym stanem (jak Spacing)

---

## [0.0.23] - 2024-12-18

### Added
- **Typography Editor** — pełna implementacja
- `typographyStore.ts` — Zustand store z dynamic parsing
- `TypographyEditor.tsx` — komponent edytora
- Sub-collections: Size, Line Height
- Formuła Size: `round(ref × scale[viewport])`
- Formuła Line Height: `round(Size × (A + B / Size))`
- Kategorie LH: xl, l, m, s, xs z parametrami A/B
- Dynamic group parsing z JSON (viewports)
- Scale parameters per viewport (Size)
- A/B parameters per category (Line Height)

---

## [0.0.22] - 2024-12-18

### Fixed
- Nested `<tbody>` → `<React.Fragment>` (invalid HTML)
- Missing keys in React Fragments
- Import error handling (was silent console.log)
- Modal keyboard support (Escape to close, focus trap)
- Removed non-functional "+" button in Sidebar

### Added
- `useFileHandling` hook — reusable import/export z walidacją JSON
- `Modal` component — accessible, keyboard support, focus trap
- `Toast` component — error/success notifications
- Context menu na wierszach (right-click → Delete ref value)
- Validation feedback w modalu "Add ref value"
- Accessibility: aria-labels, role, focus-visible

### Removed
- `VariableTable.tsx` — unused component (dead code)

### Changed
- Inline styles → CSS classes
- Sidebar: `<div>` → `<nav>` z aria-label

---

## [0.0.21] - 2024-12-18

### Added
- Dynamic group parsing z JSON variable names
- `buildSidebarGroups()` — hierarchical sidebar groups
- Multi-level indent w sidebar

### Changed
- Groups nie są hardcoded — parsowane z imported JSON
- SpacingEditor filtruje po path (np. "Padding/Desktop")

---

## [0.0.20] - 2024-12-17

### Added
- Spacing Editor z multi-collection support (Vertical/Horizontal)
- Sub-collections w Sidebar
- Scale parameters per type/viewport

---

## [0.0.19] - 2024-12-17

### Fixed
- Spacing store refScale sorting (positive asc, 0, negative desc)

---

## [0.0.17-0.0.18] - 2024-12-17

### Added
- Spacing Editor podstawowa wersja
- spacingStore z Zustand

---

## [0.0.10-0.0.16] - 2024-12-17

### Added
- Radius Editor z pełną funkcjonalnością
- Import/Export JSON (Figma format)
- Parameters: base-value, multipliers, pill values
- Viewports filtering w sidebar
- Computed values display

---

## [0.0.1-0.0.9] - 2024-12-17

### Added
- Initial project setup (Vite + React + TypeScript)
- Basic layout: Sidebar, Tabs, Toolbar
- radiusStore z Zustand
- CSS styling (dark theme, Figma-like)

---

## UI Mockups v1.0 - 2024-12-17

### Added
- Typography Scale mockup (`docs/mockups/typography-mockup.html`)
- Radius mockup (`docs/mockups/radius-mockup.html`)

### UI Design Decisions
- Layout based on Figma Variables panel
- Left sidebar: Collections + Groups navigation
- Main area: Table with modes as columns (max 10)
- Sticky columns: Name + Group headers (horizontal scroll)
- Sticky header row (vertical scroll)
- Dark theme matching Figma

### Visual Language
- `#` icon = base value (editable)
- `ƒ` icon = parameter/multiplier (editable)
- `=` icon = computed value (green, read-only)

---

## Grid Builder Design Notes (2025-12-18)

### Kluczowe ustalenia z analizy JSON

**Uniwersalna formuła kolumn:**
```
wartość = (DL_Col × column-width) + (DL_Gutter × gutter) + (Add_Half × col-width/2) + (Add_Margin × photo-margin) + (Add_Edge × margin-m)
```

**Warianty kolumn:**
- `v-col-N` — N kolumn + (N-1) gutterów
- `v-col-N-1G` — dodaj 1 gutter
- `v-col-N-2G` — dodaj 2 guttery
- `v-col-N-w-half` — dodaj pół kolumny (nie pół guttera!)
- `v-col-N-w-margin` — dodaj photo-margin
- `v-col-N-to-edge` — dodaj margin-m

**Warianty responsywne:**
- `static` — użyj gridu danego viewportu
- `to-tab-6-col` — od tabletu użyj połowy ingridu
- `to-tab-viewport` — od tabletu użyj pełnego viewportu
- `heading` — placeholder na przyszłość (obecnie = static)
- `margin-to-tab-margin` — dodaj photo-margin (= margin-m - margin-xs)

**Marginesy z sufiksami:**
- `-DL` — widoczne tylko na Desktop/Laptop (Tablet/Mobile = 0)
- `-TM` — widoczne tylko na Tablet/Mobile (Desktop/Laptop = 0)

**Viewporty w REZZON:**
- Desktop: 1920px, 12 kolumn
- Laptop: 1366px, 12 kolumn
- Tablet: 768px, 12 kolumn
- Mobile: 390px, 4 kolumny

**Persystencja:**
- Konfiguracja buildera w polu `description` zmiennych Figma
- Przetrwa eksport/import

---

## Notes dla Claude AI

### Architektura
- Zustand stores w `src/stores/` — każdy editor ma swój store
- Komponenty są "głupie" — logika w stores i hooks
- JSON format musi być zgodny z Figma Variables export

### Znane limitacje
- Brak undo/redo
- Brak localStorage persistence (celowe)
- Viewports hardcoded w Radius (ale dynamic w Spacing i Typography)

### Jak dodać nowy editor (np. Grid)
1. Stwórz `gridStore.ts` w `src/stores/`
2. Stwórz `GridBuilder.tsx` w `src/components/`
3. Dodaj do `App.tsx` w renderowaniu tabów
4. Dodaj grupy do `getSidebarGroups()`
5. Opcjonalnie: dodaj sub-collections do `getSubCollections()`

### File Recognition Pattern
- `*Typography*.json` → Typography tab
- `*Spacing*.json` → Spacing tab
- `*Grid*.json` → Grid tab
- `*Radii*.json` lub `*Radius*.json` → Radius tab
