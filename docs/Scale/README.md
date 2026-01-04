# REZZON Scale

**Edytor wartości tokenów oparty na formułach matematycznych.**

Część ekosystemu REZZON:
- **Studio** → struktura, aliasy, zarządzanie
- **Scale** → wartości, formuły, generowanie ← *ten projekt*
- **Portal** → import/eksport do Figmy

## Status

**Wersja:** 0.3.13  
**Faza:** Responsive Variants (~80% Grid MVP)

## Ostatnie zmiany (v0.3.10-v0.3.13)

### ✅ Columns per Viewport (v0.3.10)

Nowa architektura: liczba kolumn jest właściwością **viewportu**, nie parametrem globalnym.

| Viewport | Columns | Efekt |
|----------|---------|-------|
| Desktop  | 12      | v-col-1...12 obliczone normalnie |
| Laptop   | 12      | v-col-1...12 obliczone normalnie |
| Tablet   | 12      | v-col-1...12 obliczone normalnie |
| Mobile   | 2       | v-col-1,2 obliczone, v-col-3...12 = ingrid (clamp) |

**Clamp to ingrid:** Tokeny v-col-N gdzie N > viewport.columns są ustawiane na wartość `ingrid`.

### ✅ Dynamic column-width (v0.3.12-v0.3.13)

`column-width` jest teraz obliczane per viewport:

```
Mobile (390px, 2 kolumny):
  column-width = (390 - 2×24 - 1×24) / 2 = 135
  v-col-1 = 135
  v-col-2 = 294 (ingrid)

Desktop (1920px, 12 kolumn):
  column-width = (1920 - 2×24 - 11×24) / 12 = 134
  v-col-1 = 134
  v-col-12 = 1872
```

### ⚠️ Migracja

**Wyczyść localStorage przed użyciem!** Stare viewporty nie mają pola `columns`.

```
DevTools → Application → Local Storage → localhost:5173 → Delete "rezzon-scale"
```

## Funkcjonalności

### ✅ Zaimplementowane

**Parameters View**
- Macierz viewport × style z inline editing
- CRUD viewportów (add/edit/delete) + **pole columns**
- CRUD stylów (add/edit/delete)
- Sekcje: Base / Computed / Generated
- **Computed przeliczane per viewport.columns**

**Formula Engine**
- Automatyczne przeliczanie computed values
- Auto-recalculation przy zmianie base parameters
- **Dynamic column-width per viewport**

**Token Generator**
- Generowanie v-col-X, w-col-X, h-col-X
- Aplikowanie modyfikatorów
- **Clamp to ingrid dla col > viewport.columns**
- Eksport w formacie Figma Variables API

**Generators View**
- CRUD Modifiers (name, formula, range, full variant)
- CRUD Ratio Families (name, ratio A:B)
- CRUD Responsive Variants (name, ViewportBehaviors)
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

### 🔄 W toku

**Responsive Variants w generatorze**
- Typy `ViewportBehavior` i `ResponsiveVariant` są gotowe
- UI do konfiguracji ViewportBehaviors istnieje
- Generator częściowo używa tych danych (override columns działa)
- Brakuje: iteracja po `enabledResponsiveVariants` w folderze

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
│   └── Modals.tsx       # ViewportModal, StyleModal, ResponsiveVariantModal
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
- viewport, gutter-width, margin-m, margin-xs

**Viewport properties:**
- columns (per viewport, edytowalne w ViewportModal)

**Computed parameters (automatyczne, per viewport):**
```
number-of-gutters = viewport.columns - 1
column-width = (viewport - 2×margin-m - (viewport.columns-1)×gutter) / viewport.columns
ingrid = viewport - 2×margin-m
photo-margin = margin-m - margin-xs
```

**Generated tokens:**
```
v-col-n = column-width × n + gutter × (n-1)   // dla n ≤ viewport.columns
v-col-n = ingrid                               // dla n > viewport.columns (clamp)
v-full = ingrid
v-full-w-margin = ingrid + 2×photo-margin
v-full-to-edge = viewport
```

## Mechanizm Columns per Viewport

### Cel
Pozwala na różną liczbę kolumn w różnych viewportach – Mobile może mieć 2 kolumny, Desktop 12.

### Konfiguracja

W ViewportModal:
```
┌─────────────────────────────────────────────────┐
│ Edit Viewport                                   │
├─────────────────────────────────────────────────┤
│ Name:     [Mobile        ]                      │
│ Width:    [390           ] px                   │
│ Columns:  [2             ]                      │
│           Tokens v-col-N where N > columns      │
│           will be clamped to ingrid             │
└─────────────────────────────────────────────────┘
```

### Efekt na tokeny

**Mobile (390px, 2 kolumny):**
```
column-width = 135
v-col-1 = 135
v-col-2 = 294 (ingrid)
v-col-3 = 294 (clamped)
v-col-4 = 294 (clamped)
...
v-col-12 = 294 (clamped)
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
