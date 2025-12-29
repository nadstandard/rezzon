# Rezzon Scale Editor

Editor do zarządzania design tokens (Figma Variables) - radius, spacing, typography, grid.

## Stack

- React 19 + TypeScript
- Zustand (state management)
- Vite
- Tailwind CSS

## Struktura projektu

```
src/
├── components/
│   ├── RadiusEditor.tsx    # Editor dla Radius collection
│   ├── SpacingEditor.tsx   # Editor dla Spacing collection  
│   ├── Sidebar.tsx         # Nawigacja: collections, sub-collections, groups
│   ├── Tabs.tsx            # Przełączanie między editorami
│   ├── Toolbar.tsx         # Import/Export JSON, formula tooltip
│   ├── Modal.tsx           # Reusable modal z keyboard support
│   └── Toast.tsx           # Powiadomienia (error/success)
├── stores/
│   ├── radiusStore.ts      # Zustand store dla Radius
│   └── spacingStore.ts     # Zustand store dla Spacing (multi-collection)
├── hooks/
│   └── useFileHandling.ts  # Hook do import/export JSON z walidacją
├── types/
│   └── index.ts            # TypeScript types
└── App.tsx                 # Main layout
```

## Kluczowe koncepcje

### Collections & Modes
- **Collection** = zbiór zmiennych (np. Radius, Spacing)
- **Mode** = wariant wartości (np. CROSS, CIRCLE, TRIANGLE, SQUARE)
- Każda zmienna ma wartość per mode

### Radius Editor
- Formula: `(ref / 2) × base-value × multiplier[viewport]`
- Parametry: base-value, multiplier per viewport, pill per viewport
- Viewports: Desktop, Laptop, Tablet, Mobile
- Computed: v-2, v-4, ..., v-pill

### Spacing Editor
- Formula: `round(ref × scale[type][viewport])`
- Multi-collection: Vertical, Horizontal
- Dynamic groups parsowane z JSON (np. Padding/Desktop)
- Scale parameters per type/viewport

## Figma JSON Format

Import/export zgodny z Figma Variables JSON:

```json
{
  "collections": [{
    "name": "Radius",
    "modes": [{ "id": "mode:0", "name": "CROSS" }],
    "variables": [{
      "name": "Desktop/v-2",
      "valuesByMode": { "mode:0": { "value": 2 } }
    }]
  }]
}
```

## Keyboard shortcuts

- `Escape` — zamyka modal
- `Enter` — potwierdza w modal
- `Right-click` na wierszu — context menu (delete)

## Development

```bash
npm install
npm run dev     # http://localhost:5173
npm run build   # produkcja
```

## Pliki wyjściowe

- `5-R4-Radii.json` — export Radius
- `2-R4-Spacing-Scale.json` — export Spacing
