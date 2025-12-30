# REZZON Scale

**Edytor wartości tokenów oparty na formułach matematycznych.**

Część ekosystemu REZZON:
- **Studio** → struktura, aliasy, zarządzanie
- **Scale** → wartości, formuły, generowanie ← *ten projekt*
- **Portal** → import/eksport do Figmy

## Status

**Wersja:** 0.2.6  
**Faza:** Grid MVP (~75% complete)

## Funkcjonalności

### ✅ Zaimplementowane

**Parameters View**
- Macierz viewport × style z inline editing
- CRUD viewportów (add/edit/delete)
- CRUD stylów (add/edit/delete)
- Sekcje: Base / Computed / Generated

**Formula Engine**
- Automatyczne przeliczanie computed values
- Auto-recalculation przy zmianie base parameters

**Token Generator**
- Generowanie v-col-X, w-col-X, h-col-X
- Aplikowanie modyfikatorów
- Eksport JSON

**Generators View**
- CRUD Modifiers (name, formula, range, full variant)
- CRUD Ratio Families (name, ratio A:B, enabled)
- CRUD Responsive Variants (name, description)
- Toggle ratios per variant
- Toggle modifiers per ratio
- **Viewport Behaviors** – column override per viewport

**Preview View**
- Tabela wszystkich tokenów z wartościami per style
- Filtry: layer, viewport
- Search

**UI**
- Dark mode (Figma-inspired)
- Left-aligned values
- Smooth hover transitions
- Compact layout

### 🔄 W toku

- Import JSON (sesji Scale)
- Format eksportu zgodny z Figma Variables API
- Preview polish (liczniki, podświetlanie)

### ☐ Planowane

- Sekcje: Typography, Spacing, Radii
- Persystencja (IndexedDB)
- Skróty klawiszowe

## Uruchomienie

```bash
npm install
npm run dev
```

## Struktura projektu

```
src/
├── components/
│   ├── layout/          # Header, Sidebar, Statusbar
│   ├── grid/            # ParametersView, GeneratorsView, PreviewView
│   └── Icons.tsx        # SVG sprites
├── engine/
│   ├── formulas.ts      # Silnik formuł (computed values)
│   └── generator.ts     # Generator tokenów
├── store/
│   └── gridStore.ts     # Zustand store
├── types/
│   └── grid.ts          # TypeScript interfaces
├── styles/
│   └── rezzon-scale-styles.css
└── App.tsx
```

## Formuły

**Base parameters (edytowalne):**
- viewport, number-of-columns, gutter-width, margin-m, margin-xs

**Computed parameters (automatyczne):**
```
number-of-gutters = columns - 1
column-width = (viewport - 2×margin-m - (columns-1)×gutter) / columns
ingrid = viewport - 2×margin-m
photo-margin = margin-m - margin-xs
```

**Generated tokens:**
```
v-col-n = column-width × n + gutter × (n-1)
v-full = ingrid
v-full-w-margin = ingrid + 2×photo-margin
v-full-to-edge = viewport
```

## Dokumentacja

- `REZZON_Scale_roadmap.md` – plan implementacji
- `REZZON_Scale_briefing.md` – pełny briefing Grid
- `CHANGELOG.md` – historia zmian

## Technologie

- Vite + React 19 + TypeScript
- Zustand (state management)
- CSS (bez frameworków)
