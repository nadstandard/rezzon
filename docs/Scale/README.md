# REZZON Scale

**Edytor wartości tokenów oparty na formułach matematycznych.**

Część ekosystemu REZZON:
- **Studio** → struktura, aliasy, zarządzanie
- **Scale** → wartości, formuły, generowanie ← *ten projekt*
- **Portal** → import/eksport do Figmy

## Status

**Wersja:** 0.2.0  
**Faza:** React implementacja (Silnik formuł + Generator tokenów done)

## Funkcjonalności

### ✅ Zaimplementowane

- **Parameters View** – macierz viewport × style z inline editing
- **Silnik formuł** – automatyczne przeliczanie computed values
- **Generator tokenów** – generowanie v-col-X, w-col-X, h-col-X z modyfikatorami
- **Preview View** – podgląd tokenów z filtrami
- **Eksport JSON** – pobieranie konfiguracji + wygenerowanych tokenów

### 🔄 W toku

- Generators View – konfiguracja responsive/ratio/modifiers
- Import JSON
- CRUD viewportów/stylów

### ☐ Planowane

- Sekcje: Typography, Spacing, Radii
- Persystencja (IndexedDB)
- Format zgodny z Figma Variables API

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
│   ├── rezzon-studio-styles.css
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

- `REZZON_Scale_roadmap_v3.md` – plan implementacji
- `CHANGELOG.md` – historia zmian
- `/mnt/user-data/uploads/REZZON_Scale_briefing_v3.md` – pełny briefing

## Technologie

- Vite + React 19 + TypeScript
- Zustand (state management)
- CSS (bez frameworków)
