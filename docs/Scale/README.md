# REZZON Scale

**Edytor wartości tokenów oparty na formułach matematycznych.**

Część ekosystemu REZZON:
- **Studio** → struktura, aliasy, zarządzanie
- **Scale** → wartości, formuły, generowanie ← *ten projekt*
- **Portal** → import/eksport do Figmy

## Status

**Wersja:** 0.2.8  
**Faza:** Architektura Folderów (~60% Grid MVP)

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
- **Eksport w formacie Figma Variables API**

**Generators View**
- CRUD Modifiers (name, formula, range, full variant)
- CRUD Ratio Families (name, ratio A:B, enabled)
- CRUD Responsive Variants (name, description)
- Toggle ratios per variant
- Toggle modifiers per ratio
- Viewport Behaviors – column override per viewport

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

**Architektura Folderów Output**
- User sam buduje drzewo folderów
- Każdy folder: ścieżka, prefix, modifiers, ratios, responsive
- Generator według konfiguracji użytkownika

### ☐ Planowane

- Sekcje: Typography, Spacing, Radii
- Persystencja (IndexedDB)
- Drag & drop (kolejność modifiers, folderów)
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
│   └── generator.ts     # Generator tokenów + eksport Figma
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

## Eksport

Format zgodny z Figma Variables API:

```json
{
  "collections": [{
    "name": "Grid",
    "modes": [{ "id": "mode:1", "name": "CROSS" }],
    "variables": [{
      "name": "column/desktop/v-col-1",
      "type": "FLOAT",
      "valuesByMode": { "mode:1": { "value": 104 } }
    }]
  }]
}
```

## Dokumentacja

- `REZZON_Scale_roadmap.md` – plan implementacji
- `REZZON_Scale_briefing.md` – pełny briefing Grid
- `REZZON_Scale_decyzje.md` – decyzje projektowe
- `CHANGELOG.md` – historia zmian

## Technologie

- Vite + React 19 + TypeScript
- Zustand (state management)
- CSS (bez frameworków)
