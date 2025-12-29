# REZZON Scale – CHANGELOG

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
- **CSS z mockupów** – rezzon-studio-styles.css + rezzon-scale-styles.css
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
