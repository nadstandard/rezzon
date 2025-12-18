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
| Grid | ~3,595 | ~56 | ~3,539 |
| Spacing (Vertical + Horizontal) | 772 | ~58 | ~714 |
| Typography (Size + Line Height) | 562 | ~31 | ~531 |
| Radius | ~75 | ~7 | ~68 |
| **Razem** | **~5,004** | ~152 | ~4,852 |

### Ograniczenie Figma
- Maksymalnie **10 modów (stylów)** per kolekcja zmiennych

## 2. Rozwiązanie

**REZZON Scale Editor** — aplikacja webowa do zarządzania bibliotekami skali.

### Kluczowe zasady

1. **Edytujesz reguły, nie wartości** — definiujesz logikę raz, aplikacja przelicza wszystko
2. **Wyjątki są jawne** — widzisz co jest standardem, a co wyjątkiem
3. **Zero konsoli** — przyjazny UI, klikasz zamiast pisać komendy
4. **Output to JSON** — kompatybilny z REZZON Portal do importu do Figmy
5. **Konfiguracja w Figma Variables** — metadane zapisane w `description`, przetrwają eksport/import

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
- **Typography** — Size + Line Height (✅ implemented)
- **Spacing** — skala Vertical + Horizontal (✅ implemented)
- **Grid** — siatka, kolumny, kontenery, photo (🔲 in design)
- **Radius** — promienie zaokrągleń (✅ implemented)

### 4.2 Zarządzanie modami (stylami)

**Mody to warianty systemu** (np. CROSS, CIRCLE, TRIANGLE, SQUARE).
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

### 4.4 Spacing Editor (✅ Implemented v0.0.22)

**Formula:** `round(ref × scale[type][viewport])`

**Sub-collections:** Vertical, Horizontal

**Types:** Padding, Spacing (dynamicznie parsowane z JSON)

**Viewports:** Desktop, Laptop, Tablet, Mobile

**Skala ref:** 2, 4, 6, 8, 10, 12, 14, 16, 18, 20, 24, 32, 40, 48, 56, 64 (+ negative values)

**Generowane:** `{Type}/{Viewport}/ref-{ref}`

### 4.5 Typography Editor (✅ Implemented v0.0.24)

**Sub-collections:** Size, Line Height

**Formuła Size:** `Size = round(ref × scale[viewport])`

**Formuła Line Height:** `LH = round(Size × (A + B / Size))`

**Viewports:** Desktop, Laptop, Tablet, Mobile (dynamicznie parsowane z JSON)

**Skala ref:** 10, 12, 14, 16, 18, 20, 22, 24, 28, 32, 36, 40, 44, 48, 56, 60, 64, 72, 80, 96, 128

**Kategorie Line Height:** xl, l, m, s, xs

### 4.6 Grid Builder (🔲 In Design)

Grid Builder to narzędzie do **projektowania całego systemu siatki od zera** lub edycji istniejącej biblioteki.

#### 4.6.1 Koncepcja

W przeciwieństwie do innych editorów, Grid Builder nie tylko edytuje wartości, ale pozwala:
- Tworzyć bibliotekę od zera
- Definiować własne warianty kolumn (w-half, w-margin, to-edge, 1G, 2G...)
- Definiować własne warianty responsywne (to-tab-6-col, to-tab-viewport...)
- Zapisywać konfigurację w Figma Variables (pole `description`)

#### 4.6.2 Struktura Grid

**Viewporty (edytowalne per mode):**
| Viewport | Width | Columns | Gutter | Margin-M | Margin-XS |
|----------|-------|---------|--------|----------|-----------|
| Desktop | 1920 | 12 | 24 | 204 | 20 |
| Laptop | 1366 | 12 | 20 | 45 | 15 |
| Tablet | 768 | 12 | 20 | 58 | 16 |
| Mobile | 390 | 4 | 20 | 20 | 10 |

**Proporcje zdjęć (edytowalne):**
| Ratio | A | B |
|-------|---|---|
| horizontal | 4 | 3 |
| vertical | 3 | 4 |
| square | 1 | 1 |
| panoramic-high | 16 | 9 |
| panoramic-low | 16 | 5 |

**Wartości wyliczane:**
- `column-width = (viewport - 2×margin-m - (columns-1)×gutter) / columns`
- `ingrid = viewport - 2×margin-m`
- `photo-margin = margin-m - margin-xs`

#### 4.6.3 Uniwersalna formuła kolumn

Każda wartość kolumnowa wyliczana jest według formuły:
```
wartość = (DL_Col × column-width) + (DL_Gutter × gutter) + (Add_Half × column-width/2) + (Add_Margin × photo-margin) + (Add_Edge × margin-m)
```

Gdzie parametry per wariant:

| Wariant | DL Col | DL Gutter | Add Half | Add Margin | Add Edge |
|---------|--------|-----------|----------|------------|----------|
| v-col-6 | 6 | 5 | 0 | 0 | 0 |
| v-col-6-1G | 6 | 6 | 0 | 0 | 0 |
| v-col-6-2G | 6 | 7 | 0 | 0 | 0 |
| v-col-6-w-half | 6 | 5 | 1 | 0 | 0 |
| v-col-6-w-margin | 6 | 5 | 0 | 1 | 0 |
| v-col-6-to-edge | 6 | 5 | 0 | 0 | 1 |

#### 4.6.4 Builder wariantów kolumn

UI do definiowania własnych wariantów:
- Nazwa wariantu (np. "w-half", "to-edge", "1G")
- Parametry formuły (DL_Col offset, DL_Gutter offset, Add_Half, Add_Margin, Add_Edge)
- Możliwość dodawania/usuwania wariantów

#### 4.6.5 Builder wariantów responsywnych

Warianty responsywne definiują **skąd brać wartość** per viewport:

| Wariant | Desktop | Laptop | Tablet | Mobile |
|---------|---------|--------|--------|--------|
| static | desktop | laptop | tablet | mobile |
| to-tab-6-col | desktop | laptop | half | mobile |
| to-tab-12-col | desktop | laptop | full | mobile |
| to-tab-viewport | desktop | laptop | viewport | viewport |
| to-mobile-6-col | desktop | laptop | tablet | half |
| heading | desktop | laptop | tablet | mobile |

Gdzie źródła mogą być:
- `desktop` / `laptop` / `tablet` / `mobile` — użyj gridu tego viewportu
- `half` — połowa ingridu danego viewportu
- `full` — pełny ingrid danego viewportu
- `viewport` — pełna szerokość ekranu (bez marginesów)
- `0` — zeruj wartość (dla wariantów DL/TM)

#### 4.6.6 Warianty marginesów

**Rozmiary:** xs, m, l, xl, xxl, xxxl, ingrid-l, ingrid-xl, ingrid-xxl, ingrid-xxxl

**Sufiksy:**
- bez sufiksu — widoczne wszędzie
- `-DL` — tylko Desktop/Laptop (Tablet/Mobile = 0)
- `-TM` — tylko Tablet/Mobile (Desktop/Laptop = 0)

#### 4.6.7 Generowane zmienne (~3,595)

```
base/ratio/{ratio}-a, base/ratio/{ratio}-b
base/{viewport}/viewport-edit, column-width, ingrid, ...
column/{viewport}/v-col-{N}, v-col-{N}-w-half, v-col-{N}-w-margin, ...
container/{viewport}/v-col-{N}
container/{viewport}/{responsive-variant}/v-col-{N}
photo/{viewport}/width/{responsive-variant}/w-col-{N}
photo/{viewport}/height/{responsive-variant}/{ratio}/h-col-{N}
margin/{viewport}/v-{size}, v-{size}-DL, v-{size}-TM
```

#### 4.6.8 Persystencja konfiguracji

Konfiguracja buildera zapisywana w polu `description` zmiennych Figma:
- Przetrwa eksport/import z Figmy
- Nie wymaga osobnego pliku konfiguracyjnego
- Edytowalna z poziomu Scale Editor

Propozycja struktury:
```
Variable: base/_config
Value: 0
Description: {
  "columnVariants": [...],
  "responsiveVariants": [...],
  "marginSizes": [...]
}
```

## 5. UI Components (✅ Implemented)

| Component | Status | Description |
|-----------|--------|-------------|
| Sidebar | ✅ | Collections, sub-collections, groups |
| Tabs | ✅ | Przełączanie editorów |
| Toolbar | ✅ | Import/Export, formula tooltip |
| Modal | ✅ | Add ref value, keyboard support |
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
│   │   ├── TypographyEditor.tsx
│   │   ├── GridBuilder.tsx (planned)
│   │   ├── Sidebar.tsx
│   │   ├── Tabs.tsx
│   │   ├── Toolbar.tsx
│   │   ├── Modal.tsx
│   │   └── Toast.tsx
│   ├── stores/
│   │   ├── radiusStore.ts
│   │   ├── spacingStore.ts
│   │   ├── typographyStore.ts
│   │   └── gridStore.ts (planned)
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
    "name": "Grid",
    "modes": [{ "id": "46:3", "name": "CROSS" }],
    "variables": [{
      "name": "base/desktop/viewport-edit",
      "description": "",
      "valuesByMode": { "46:3": { "value": 1920 } }
    }]
  }]
}
```

## 7. Roadmap

| Phase | Scope | Status |
|-------|-------|--------|
| 1 | Radius Editor | ✅ v0.0.22 |
| 2 | Spacing Editor | ✅ v0.0.22 |
| 3 | Typography Editor | ✅ v0.0.24 |
| 4 | Grid Builder — analiza i design | 🔄 in progress |
| 5 | Grid Builder — implementacja | 🔲 planned |
| 6 | Undo/Redo | 🔲 planned |

## 8. Znane limitacje

- Viewports hardcoded w Radius (dynamic w Spacing i Typography)
- Brak undo/redo
- Brak localStorage persistence (celowe — dane w Figma Variables)
- Single user, local only

---

**Wersja:** 0.7  
**Data:** 2025-12-18  
**Autor:** Claude + Marcin

**Changelog:**
- 0.7: Dodano szczegółową koncepcję Grid Builder (warianty kolumn, warianty responsywne, persystencja w description)
- 0.6: Dodano Typography Editor (v0.0.24)
- 0.5: Zaktualizowano status implementacji (v0.0.22)
- 0.4: Dodano sekcję UI Design
- 0.3: Dodano szczegółowe formuły i parametry
- 0.2: Dodano zarządzanie modami, strukturą
- 0.1: Wersja inicjalna
