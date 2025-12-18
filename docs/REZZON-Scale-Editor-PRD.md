# REZZON Scale Editor — Product Requirements Document

## 1. Problem

Zarządzanie bibliotekami skali w REZZON Design System jest obecnie:

- **Czasochłonne** — zmiana wartości bazowej wymaga ręcznego przeliczenia setek/tysięcy zależnych wartości
- **Podatne na błędy** — łatwo pomylić się przy edycji formuł w arkuszu, brak walidacji
- **Nieelastyczne** — dodanie nowego tagu (np. responsywna proporcja zdjęcia) wymaga ręcznego dodania wierszy i formuł
- **Trudne w utrzymaniu** — wyjątki (np. "na mobile 390 zachowaj się inaczej") są ukryte w komórkach, trzeba pamiętać gdzie są
- **Brak zarządzania strukturą** — zmiana kolejności, nazewnictwa, dodawanie/usuwanie modów wymaga przebudowy arkusza

### Skala problemu

| Biblioteka | Zmiennych | Wartości bazowych | Wyliczanych |
|------------|-----------|-------------------|-------------|
| Grid | ~5,966 | 46 | ~5,920 |
| Spacing (Vertical + Horizontal) | 772 | ~58 | ~714 |
| Typography (Size + Line Height) | 562 | ~31 | ~531 |
| Radius | ~75 | ~7 | ~68 |
| **Razem** | **~7,375** | ~142 | ~7,233 |

### Ograniczenie Figma
- Maksymalnie **10 modów (stylów)** per kolekcja zmiennych

## 2. Rozwiązanie

**REZZON Scale Editor** — aplikacja webowa do zarządzania bibliotekami skali.

### Kluczowe zasady

1. **Edytujesz reguły, nie wartości** — definiujesz logikę raz, aplikacja przelicza wszystko
2. **Wyjątki są jawne** — widzisz co jest standardem, a co wyjątkiem
3. **Zero konsoli** — przyjazny UI, klikasz zamiast pisać komendy
4. **Output to JSON** — kompatybilny z REZZON Portal do importu do Figmy

## 3. Użytkownicy

**Główny użytkownik:** Projektant (właściciel design systemu)

**Potrzeby:**
- Szybko modyfikować wartości bazowe i widzieć efekt
- Dodawać nowe tagi/kombinacje bez ręcznego tworzenia formuł
- Definiować zachowania responsywne (np. "16:9 na desktop → 4:3 na mobile")
- Eksportować gotowy JSON do Figmy

## 4. Funkcje MVP

### 4.1 Struktura aplikacji

Cztery główne sekcje (zakładki):
- **Typography** — Size + Line Height (🔲 planned)
- **Spacing** — skala Vertical + Horizontal (✅ implemented)
- **Grid** — siatka, kolumny, kontenery, photo (🔲 planned)
- **Radius** — promienie zaokrągleń (✅ implemented)

### 4.2 Zarządzanie modami (stylami)

**Mody to warianty systemu** (np. CROSS, CIRCLE, TRIANGLE, SQUARE, N10).
Każdy mode może mieć inne wartości dla wszystkich parametrów.

**Funkcje:**
- ✅ Automatyczne wykrywanie modów z JSON
- 🔲 Dodawanie nowego modu
- 🔲 Usuwanie modu
- 🔲 Zmiana nazwy modu
- 🔲 Zmiana kolejności modów
- Limit: max 10 modów (ograniczenie Figma)

### 4.3 Radius Editor (✅ Implemented v0.0.22)

**Formula:** `(ref / 2) × base-value × multiplier[viewport]`

**Viewports:** Desktop, Laptop, Tablet, Mobile

**Wartości bazowe (edytowalne):**
- `base-value` = 2 (jednostka bazowa)
- `multiplier-{viewport}` — mnożnik per viewport
- `pill-{viewport}` = 999 (dla pill buttons)

**Skala ref:** 2, 4, 6, 8, 10, 12, 16, 20, 24, 28, 32, 48, 64, 96

**Generowane:** `{Viewport}/v-{ref}`, `{Viewport}/v-pill`

**Funkcje:**
- ✅ Import JSON (Figma format)
- ✅ Export JSON (Figma format)
- ✅ Edycja parametrów (base-value, multipliers, pill)
- ✅ Dodawanie ref values
- ✅ Usuwanie ref values (context menu)
- ✅ Filtrowanie po viewport (sidebar)
- ✅ Walidacja + error feedback (Toast)

### 4.4 Spacing Editor (✅ Implemented v0.0.22)

**Formula:** `round(ref × scale[type][viewport])`

**Sub-collections:** Vertical, Horizontal

**Types:** Padding, Spacing (dynamicznie parsowane z JSON)

**Viewports:** Desktop, Laptop, Tablet, Mobile

**Skala ref:** 2, 4, 6, 8, 10, 12, 14, 16, 18, 20, 24, 32, 40, 48, 56, 64 (+ negative values)

**Generowane:** `{Type}/{Viewport}/ref-{ref}`

**Funkcje:**
- ✅ Multi-collection support (Vertical/Horizontal)
- ✅ Dynamic group parsing z JSON
- ✅ Scale parameters per type/viewport
- ✅ Import/Export JSON
- ✅ Dodawanie/usuwanie ref values

### 4.5 Typography Editor (🔲 Planned)

**Wartości bazowe:**
- Skala referencji: 10, 12, 14, 16, 18, 20, 22, 24, 28, 32, 36, 40, 44, 48, 56, 60, 64, 72, 80, 96, 128

**Scale per kontekst × viewport:**

| Context  | Desktop | Laptop | Tablet | Mobile |
|----------|---------|--------|--------|--------|
| on-bg    | 1.0     | 0.9    | 0.8    | 0.7    |
| on-card  | 1.0     | 0.8    | 0.7    | 0.6    |

**Formuła Size:** `Size = ref × scale[context][viewport]`

**Line Height — nieliniowa krzywa:** `Line Height = Size × (A + B / Size)`

**Parametry A/B per kategoria:**

| Kategoria | A    | B | Opis |
|-----------|------|---|------|
| xl        | 1.40 | 6 | Najluźniejszy |
| l         | 1.35 | 4 | Luźny |
| m         | 1.25 | 2 | Średni |
| s         | 1.02 | 2 | Ciasny |
| xs        | 1.00 | 0 | Tight (LH = Size) |

### 4.6 Grid Editor (🔲 Planned)

**Viewporty:** desktop (1920), laptop (1366), tablet (768), mobile (390)

**Wartości bazowe per viewport × mode:**
- `viewport-edit` — szerokość viewport
- `number-of-columns-edit` — liczba kolumn
- `gutter-width-edit` — szerokość guttera
- `margin-m-edit` — margines główny
- `margin-xs-edit` — margines mały

**Proporcje:** horizontal (4:3), vertical (3:4), square (1:1), panoramic-high (16:9), panoramic-low (16:5)

**Formuła:**
```
wartość = (DL_Col × column-width) + (DL_Gutter × gutter-width) 
        + (Add_Half × gutter/2) + (Add_Margin × margin-m) 
        + (Add_Edge × margin-xs)
```

## 5. UI Components (✅ Implemented)

| Component | Status | Description |
|-----------|--------|-------------|
| Sidebar | ✅ | Collections, sub-collections, groups |
| Tabs | ✅ | Przełączanie editorów |
| Toolbar | ✅ | Import/Export, formula tooltip |
| Modal | ✅ | Add ref value, keyboard support (Escape, Enter, focus trap) |
| Toast | ✅ | Error/success notifications |
| Context Menu | ✅ | Delete ref value (right-click) |
| Data Table | ✅ | Editable parameters, computed display |

## 6. Technical Implementation

### Stack
- **Frontend:** React 19 + TypeScript
- **UI:** Tailwind CSS
- **State:** Zustand
- **Build:** Vite
- **Bez backendu** — wszystko działa lokalnie

### Struktura plików
```
scale-editor/
├── src/
│   ├── components/
│   │   ├── RadiusEditor.tsx
│   │   ├── SpacingEditor.tsx
│   │   ├── Sidebar.tsx
│   │   ├── Tabs.tsx
│   │   ├── Toolbar.tsx
│   │   ├── Modal.tsx
│   │   └── Toast.tsx
│   ├── stores/
│   │   ├── radiusStore.ts
│   │   └── spacingStore.ts
│   ├── hooks/
│   │   └── useFileHandling.ts
│   ├── types/
│   │   └── index.ts
│   └── App.tsx
├── README.md
└── package.json
```

### JSON Format (Figma compatible)
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

## 7. UI Design

### Layout
```
┌─────────────────────────────────────────────────────────────┐
│  [Typography Scale] [Spacing Scale] [Grid] [Radius]  tabs   │
├──────────────┬──────────────────────────────────────────────┤
│ COLLECTIONS  │  Radius                    [ƒ] [Import] [Export] │
│ Typography   │  ───────────────────────────────────────────  │
│ Spacing      │  Name          │ CROSS │ CIRCLE │ TRIANGLE │ │
│ Grid         │  ─────────────────────────────────────────── │
│ ● Radius     │  PARAMETERS                                  │
│              │  # base-value  │  2    │   2    │    2     │ │
│ GROUPS       │  ƒ multiplier  │ 1.0   │  1.0   │   1.0    │ │
│ ● All        │  ─────────────────────────────────────────── │
│   Desktop    │  DESKTOP                                     │
│   Laptop     │  = v-16        │  16   │   16   │    16    │ │
│   Tablet     │  = v-32        │  32   │   32   │    32    │ │
│   Mobile     │  ─────────────────────────────────────────── │
└──────────────┴──────────────────────────────────────────────┘
```

### Visual Language
- `#` icon = base value (editable)
- `ƒ` icon = parameter/multiplier (editable)
- `=` icon = computed value (green, read-only)

### Keyboard Shortcuts
- `Escape` — zamyka modal
- `Enter` — potwierdza w modal
- `Right-click` — context menu (delete)

## 8. Roadmap

| Phase | Scope | Status |
|-------|-------|--------|
| 1 | Radius Editor | ✅ v0.0.22 |
| 2 | Spacing Editor | ✅ v0.0.22 |
| 3 | Typography Editor | 🔲 planned |
| 4 | Grid Editor | 🔲 planned |
| 5 | Undo/Redo, Persistence | 🔲 planned |

## 9. Znane limitacje

- Viewports hardcoded w Radius (dynamic w Spacing)
- Brak undo/redo
- Brak localStorage persistence
- Single user, local only

---

**Wersja:** 0.5  
**Data:** 2024-12-18  
**Autor:** Claude + Marcin

**Changelog:**
- 0.5: Zaktualizowano status implementacji (v0.0.22), dodano sekcję Technical Implementation
- 0.4: Dodano sekcję UI Design
- 0.3: Dodano szczegółowe formuły i parametry
- 0.2: Dodano zarządzanie modami, strukturą
- 0.1: Wersja inicjalna
