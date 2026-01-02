# REZZON Scale – CHANGELOG

## [0.3.8] – 2025-01-02

### Added
- **Analiza mechanizmu Responsive Variants z JSON R4-Grid**
  - Udokumentowano ViewportBehaviors (inherit/override columns)
  - Potwierdzono mechanizm "collapse" – wszystkie tokeny w override mają tę samą wartość
  - Dowody: desktop inherit (normalne wartości) vs tablet override (wszystko = 6 col)

- **5 otwartych decyzji do Responsive Variants**
  - O1: Gdzie żyją definicje wariantów? (globalnie vs per-folder)
  - O2: Czy "static" jest wbudowany?
  - O3: Override columns – skąd opcje w dropdown?
  - O4: Nazewnictwo wariantu (ręczne/auto/z sugestią)
  - O5: Elastyczne nazewnictwo pełnych ścieżek tokenów

- **Propozycja UI: Responsive Variants Editor**
  - Globalna lista wariantów z ViewportBehaviors per viewport
  - Inherit/Override radio + dropdown columns
  - Checkbox włączania wariantów per folder

### Documentation
- Zaktualizowano briefing, decyzje, roadmap o otwarte pytania
- Dodano ASCII mockup Responsive Variants Editor

---

## [0.3.7] – 2025-01-02

### Changed
- **Uproszczenie architektury folderów**
  - Usunięto `generateHeight` toggle (jeden folder = jeden typ tokena)
  - Usunięto `widthPrefix` / `heightPrefix` (zastąpione jednym `tokenPrefix`)
  - Jeden ratio na folder (radio buttons zamiast checkboxów)
  - Ukryto UI Responsive Variants (do reimplementacji)

### Technical
- Filozofia: jeden folder = jeden zestaw tokenów = jedna konfiguracja
- Uproszczony model `OutputFolder`

---

## [0.3.0] – 2025-01-01

### Added
- **Architektura Output Folders**
  - Nowy typ `OutputFolder` z pełną konfiguracją
  - UI drzewa folderów w Generators View
  - Panel konfiguracji folderu (prawa strona)
  - Generator według konfiguracji użytkownika
  - Podgląd generowanych tokenów per folder

### Changed
- **Nowa filozofia:** Aplikacja jest "głupia" – nie wie co to column, photo, margin
- User sam buduje drzewo folderów i konfiguruje każdy osobno
- Zastąpiono hardcoded warstwy (column, photo/width, photo/height) elastycznymi folderami

### Technical
- Nowy typ `OutputFolder` w types/grid.ts
- Funkcje `generateTokensForFolder()`, `generateAllTokensForFolder()`
- `calculateFolderTokenCount()` dla live preview

---

## [0.2.8] – 2025-12-30

### Changed
- **Eksport w formacie Figma Variables API**
  - Pełna kompatybilność z Figma REST API
  - Struktura: collections → modes → variables → valuesByMode
  - Automatyczne generowanie ID dla collections, modes, variables
  - Eksportowane warstwy: base/*, column/*, photo/*

### Technical
- Nowa funkcja `generateFigmaExport()` w engine/generator.ts
- Typy: FigmaExport, FigmaCollection, FigmaVariable, FigmaMode

---

## [0.2.7] – 2025-12-30

### Added
- **Analiza R4-Grid JSON** – pełna dokumentacja struktury 3590 zmiennych
  - Warstwy: base (46), column (288), container (392), margin (120), photo (2744)
  - Modifiers: -1G, -2G, -w-half, -w-margin, -to-edge
  - Warianty kondycyjne: -DL (Desktop-Laptop), -TM (Tablet-Mobile)

### Identified Gaps
- Brakujące warstwy: container, margin
- Brakujący modifier: -2G
- Specjalne tokeny: v-col-0-w-half, v-col-viewport, v-full-w-margin
- Konfiguracja per-folder (architektura do przeprojektowania)

---

## [0.2.6] – 2025-12-30

### Added
- **Viewport Behaviors** – column override per viewport in responsive variants
  - Each responsive variant can now specify custom column count per viewport
  - Options: "Inherit" (use default) or "Override columns" (custom value)
  - UI: dropdown + number input per viewport in Generators panel

### Changed
- Compact layout across Generators view
  - Smaller ratio cards, modifier chips
  - Tighter spacing throughout
- Generator panel body padding reduced (14px → 10px 12px)
- Ratio grid: smaller minimums, less gap
- Modifier chips: smaller text and padding

---

## [0.2.5] – 2025-12-30

### Changed
- **Left-aligned values** – all value cells now left-aligned (Figma Variables style)
- **Smooth hover transitions** – action buttons use opacity transitions instead of display toggle
  - No more layout jumps on hover
  - Affected: viewport-card, style-header, param-cell, modifier-row actions

### Fixed
- Layout stability on hover interactions

---

## [0.2.4] – 2025-12-30

### Fixed
- **Viewport edit updates computed values** – editing viewport now triggers recalculation
- Full token list display in Preview (removed truncation to 100)

---

## [0.2.3] – 2025-12-30

### Added
- **Responsive Variants CRUD**
  - Add new variant with name and description
  - Edit existing variants
  - Delete variants
  - Collapsible panels per variant
  - Ratio toggles per variant
  - Modifier toggles per ratio within variant

---

## [0.2.2] – 2025-12-30

### Added
- **Ratio Families CRUD**
  - Add new ratio family (name, ratio A:B)
  - Edit existing ratio families
  - Delete ratio families
  - Enable/disable toggle per family

---

## [0.2.1] – 2025-12-30

### Added
- **Modifiers CRUD** in Generators View
  - Add new modifier with name, formula type, range (from-to), full variant option
  - Edit existing modifiers
  - Delete modifiers
  - Visual feedback for enabled/disabled states

### Changed
- Generators sidebar reorganized into collapsible sections

---

## [0.2.0] – 2025-12-29

### Added
- **Formula Engine** (`src/engine/formulas.ts`)
  - `buildContext()` – buduje kontekst obliczeń z base parameters
  - `calculateComputed()` – oblicza wszystkie computed values
  - `recalculateAllComputed()` – przelicza computed dla wszystkich stylów
  - Auto-recalculation przy zmianie dowolnego base parameter

- **Token Generator** (`src/engine/generator.ts`)
  - `generateColumnTokens()` – generuje v-col-1...n, v-full, v-col-viewport
  - `applyModifier()` – aplikuje formułę modyfikatora do wartości
  - `generateColumnTokensWithModifiers()` – pełny zestaw tokenów kolumn
  - `generatePhotoWidthTokens()` – w-col-X (szerokości zdjęć)
  - `generatePhotoHeightTokens()` – h-col-X z uwzględnieniem ratio
  - `generateAllTokens()` – kompletny zestaw dla viewport/style
  - `countTokens()` – zlicza tokeny per warstwa
  - `generateExportData()` – dane gotowe do eksportu

- **Eksport JSON**
  - Przycisk "Export" w header pobiera plik JSON
  - Format zawiera: config (viewports, styles, params, modifiers, ratios) + tokens + metadata

### Changed
- ParametersView używa teraz prawdziwego silnika do wyświetlania computed i generated
- PreviewView generuje tokeny przez engine zamiast demo danych
- Store automatycznie przelicza computed przy zmianach base parameters

### Technical
- Nowy folder `src/engine/` z logiką obliczeń
- TypeScript interfaces dla GeneratorContext, ExportData, ExportToken

---

## [0.1.0] – 2025-12-29

### Added
- **Vite + React + TypeScript** projekt setup
- **CSS z mockupów** – rezzon-scale-styles.css
- **Layout komponentów**
  - Header z nawigacją sekcji (Grid/Typography/Spacing/Radii)
  - Sidebar z viewportami i warstwami output
  - Statusbar ze statystykami

- **Grid widoki**
  - ParametersView – macierz viewport × style z inline editing
  - GeneratorsView – konfiguracja responsive variants, ratios, modifiers
  - PreviewView – tabela tokenów z filtrami

- **Zustand store** z demo danymi
  - 4 viewporty (Desktop, Laptop, Tablet, Mobile)
  - 4 style (Cross, Circle, Triangle, Square)
  - 5 base parameters
  - 4 computed parameters
  - 4 modifiers (-w-half, -w-margin, -to-edge, -1G)
  - 5 ratio families
  - 2 responsive variants

- **TypeScript types** (`src/types/grid.ts`)
  - Viewport, Style, BaseParameter, ComputedParameter
  - GeneratedToken, Modifier, RatioFamily
  - ResponsiveVariant, RatioConfig, ViewportBehavior
  - OutputLayer, GridState, GridActions, GridStore

### Technical
- Folder structure: components/layout/, components/grid/, store/, types/, styles/
- Icon system z SVG sprites

---

## [0.0.1] – 2025-12-29

### Added
- **HTML Mockups** (pre-React)
  - `rezzon-scale-v0.1.0-grid-matrix.html` – Parameters view
  - `rezzon-scale-v0.1.0-grid-generators.html` – Generators view
  - `rezzon-scale-v0.1.0-grid-preview.html` – Preview view
  - `rezzon-scale-styles.css` – shared styles

- **Briefing documents**
  - Grid briefing complete (macierz, formuły, modyfikatory, ratios, responsive)
  - Excel analysis (R4_1_GRID.xlsx)
  - JSON analysis (1-R4-Grid_2025-12-18.json)

---

## Known Issues

### Generator nie używa Responsive Variants

**Lokalizacja:** `src/engine/generator.ts`, linia 1153-1154

```typescript
// For now, skip responsive variants (will be redesigned later)
// Just generate tokens per viewport
```

**Status:** Do naprawy w Fazie 4 roadmapy.

**Obejście:** Typy `ViewportBehavior` i `ResponsiveVariant` są zdefiniowane, UI ViewportBehaviors istnieje (v0.2.6), ale generator ignoruje te dane.
