# REZZON Scale

**Edytor wartości tokenów oparty na formułach matematycznych.**

Część ekosystemu REZZON:
- **Studio** → struktura, aliasy, zarządzanie
- **Scale** → wartości, formuły, generowanie ← *ten projekt*
- **Portal** → import/eksport do Figmy

## Status

**Wersja:** 0.3.8  
**Faza:** Responsive Variants (~70% Grid MVP)

### 🔓 Otwarte decyzje (5)

Przed implementacją Fazy 4 wymagają podjęcia:

| # | Pytanie |
|---|---------|
| O1 | Gdzie żyją definicje wariantów? (globalnie vs per-folder) |
| O2 | Czy "static" jest wbudowany? |
| O3 | Override columns – skąd opcje? |
| O4 | Nazewnictwo wariantu |
| O5 | Elastyczne nazewnictwo pełnych ścieżek tokenów |

Szczegóły: `REZZON_Scale_decyzje.md` → sekcja "OTWARTE DECYZJE"

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
- CRUD Ratio Families (name, ratio A:B)
- CRUD Responsive Variants (name, description)
- Viewport Behaviors UI (inherit/override columns)

**Output Folders**
- Elastyczna architektura folderów
- User sam buduje drzewo folderów
- Konfiguracja per folder: prefix, modifiers, ratio
- Podgląd generowanych tokenów

**Preview View**
- Tabela wszystkich tokenów z wartościami per style
- Filtry: layer, viewport
- Search

**UI**
- Dark mode (Figma-inspired)
- Left-aligned values
- Smooth hover transitions
- Compact layout

### ❌ Niezaimplementowane

**Responsive Variants w generatorze**
- Typy `ViewportBehavior` i `ResponsiveVariant` są gotowe
- UI do konfiguracji ViewportBehaviors istnieje
- **Generator NIE UŻYWA tych danych** (do naprawy)

### 🔄 W toku

**Faza 4: Responsive Variants**
- Implementacja mechanizmu "collapse to N columns"
- Iteracja po `enabledResponsiveVariants` w folderze
- Logika: `inherit` vs `override` columns

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

## Mechanizm Responsive Variants

### Cel
Pozwala na "collapse" layoutów na mniejszych ekranach bez ręcznego aliasowania.

### ViewportBehaviors

Każdy responsive variant definiuje zachowanie per viewport:

| Behavior | Opis |
|----------|------|
| **Inherit** | Używa domyślnej liczby kolumn |
| **Override** | Wymusza konkretną liczbę (collapse) |

### Przykład: `to-tab-6-col`

| Viewport | Behavior | v-col-8 = |
|----------|----------|-----------|
| Desktop  | Inherit  | 888 (8 kolumn) |
| Tablet   | Override 6 | **316** (6 kolumn!) |
| Mobile   | Override 6 | **316** (6 kolumn!) |

**WSZYSTKIE tokeny w tym wariancie** mają wartość dla 6 kolumn.

### Dowody z analizy JSON R4-Grid

**Desktop – static vs to-tab-6-col (IDENTYCZNE):**
```
static/w-col-4  = 488     to-tab-6-col/w-col-4  = 488
static/w-col-8  = 1000    to-tab-6-col/w-col-8  = 1000
```
↑ Na desktop wariant dziedziczy normalne wartości (inherit)

**Tablet – static vs to-tab-6-col (COLLAPSED!):**
```
static/w-col-4  = 652     to-tab-6-col/w-col-4  = 316
static/w-col-8  = 652     to-tab-6-col/w-col-8  = 316
```
↑ Na tablet WSZYSTKO = 316 (wartość dla 6 kolumn)

### Status implementacji
- ✅ Typy: `ViewportBehavior`, `ResponsiveVariant`
- ✅ UI: Panel Viewport Behaviors w Generators
- ✅ Analiza: Mechanizm udokumentowany z dowodami
- ❌ Generator: **NIE UŻYWA** tych danych (linia 1153 generator.ts)

### Propozycja UI: Responsive Variants Editor

```
┌────────────────────────────────────────────────────────┐
│ to-tab-6-col                                [✎] [🗑]  │
├────────────────────────────────────────────────────────┤
│  Viewport   │ Behavior    │ Columns                   │
│ ────────────┼─────────────┼─────────                  │
│  Desktop    │ ○ Inherit   │ (default: 12)             │
│  Laptop     │ ○ Inherit   │ (default: 12)             │
│  Tablet     │ ● Override  │ [6 ▾]                     │
│  Mobile     │ ● Override  │ [6 ▾]                     │
└────────────────────────────────────────────────────────┘
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

## Known Issues

### Generator ignoruje Responsive Variants

**Lokalizacja:** `src/engine/generator.ts`, linia 1153-1154

```typescript
// For now, skip responsive variants (will be redesigned later)
// Just generate tokens per viewport
```

**Status:** Do naprawy w Fazie 4 roadmapy.

**Blokada:** 5 otwartych decyzji projektowych (O1-O5) musi zostać podjętych przed implementacją.
