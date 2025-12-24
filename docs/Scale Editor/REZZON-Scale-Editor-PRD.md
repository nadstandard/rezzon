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

### 4.6 Grid Editor (🔲 In Design — NOWA KONCEPCJA)

Grid Editor to narzędzie do **projektowania całego systemu siatki od zera** lub edycji istniejącej biblioteki po wgraniu JSON.

#### 4.6.1 Architektura UI

**Panel sterowania (globalny):**
- Viewporty na sztywno: Desktop, Laptop, Tablet, Mobile
- Definiowanie BASE per viewport
- Automatyczne generowanie `/column/` i `/margin/`

**Podgląd wyników:**
- Read-only
- Drzewo z tokenami i wartościami per tryb (CROSS, CIRCLE, TRIANGLE, SQUARE)

**Edycja folderów (container, photo, custom):**
- Tworzenie z poziomu drzewa
- Konfiguracja wyjątków responsywnych per folder
- Opcjonalne override per wiersz

#### 4.6.2 BASE — Wartości źródłowe per viewport

| Parametr | Typ | Opis |
|----------|-----|------|
| viewport | input | szerokość viewportu (px) |
| number of columns | input | liczba fizycznych kolumn (12/6/4/2) |
| gutter width | input | szerokość guttera (px) |
| margin m | input | margines główny (px) |
| margin xs | input | margines mniejszy (px) |

**Wartości wyliczane:**
```
number of gutters = columns - 1
ingrid = viewport - (2 × margin m)
column width = (ingrid - (gutters × gutter width)) / columns
```

**Przykładowe wartości:**

| Viewport | Width | Columns | Gutter | Margin-M | Margin-XS |
|----------|-------|---------|--------|----------|-----------|
| Desktop | 1920 | 12 | 24 | 204 | 20 |
| Laptop | 1366 | 12 | 20 | 45 | 15 |
| Tablet | 768 | 12 | 20 | 58 | 16 |
| Mobile | 390 | 2 | 20 | 20 | 10 |

#### 4.6.3 Automatycznie generowane foldery

##### `{viewport}/column/`

Generowane tokeny:
- `v-col-1` do `v-col-12`
- `v-col-1-w-half` do `v-col-11-w-half`
- `v-col-1-w-margin` do `v-col-12-w-margin`
- `v-col-1-to-edge` do `v-col-12-to-edge`
- `v-col-1-1g` do `v-col-12-1g`
- `v-col-1-2g` do `v-col-12-2g`
- `v-col-viewport`
- `v-col-viewport-w-margin`

**Formuły column:**

| Token | Formuła |
|-------|---------|
| v-col-n | (n × column width) + ((n-1) × gutter width) |
| v-col-viewport | viewport |
| v-col-n-w-half | v-col-n + gutter width + (column width / 2) |
| v-col-n-w-margin | v-col-n + (margin m - margin xs) |
| v-col-viewport-w-margin | ingrid + 2 × (margin m - margin xs) |
| v-col-n-to-edge | v-col-n + margin m |
| v-col-n-1g | v-col-n + gutter width |
| v-col-n-2g | v-col-n + (2 × gutter width) |

**Zasada dla mobile/column:** jeśli n > number of columns → wartość = ingrid

##### `{viewport}/margin/`

Generowane tokeny (każdy z wariantami -DL i -TM):
- `v-xs`, `v-xs-DL`, `v-xs-TM`
- `v-m`, `v-m-DL`, `v-m-TM`
- `v-l`, `v-l-DL`, `v-l-TM`
- `v-xl`, `v-xl-DL`, `v-xl-TM`
- `v-xxl`, `v-xxl-DL`, `v-xxl-TM`
- `v-xxxl`, `v-xxxl-DL`, `v-xxxl-TM`
- `v-ingrid-l`, `v-ingrid-l-DL`, `v-ingrid-l-TM`
- `v-ingrid-xl`, `v-ingrid-xl-DL`, `v-ingrid-xl-TM`
- `v-ingrid-xxl`, `v-ingrid-xxl-DL`, `v-ingrid-xxl-TM`
- `v-ingrid-xxxl`, `v-ingrid-xxxl-DL`, `v-ingrid-xxxl-TM`

**Formuły margin:**

| Token | Formuła |
|-------|---------|
| v-xs | margin xs |
| v-m | margin m |
| v-l | margin m + 1 cw + 0g |
| v-xl | margin m + 2 cw + 1g |
| v-xxl | margin m + 3 cw + 2g |
| v-xxxl | margin m + 4 cw + 3g |
| v-ingrid-l | 1 cw + 1g |
| v-ingrid-xl | 2 cw + 2g |
| v-ingrid-xxl | 3 cw + 3g |
| v-ingrid-xxxl | 4 cw + 4g |

**Warianty -DL / -TM:**
- `-DL` (Desktop-Laptop): wartość na Desktop/Laptop, 0 na Tablet/Mobile
- `-TM` (Tablet-Mobile): wartość na Tablet/Mobile, 0 na Desktop/Laptop

#### 4.6.4 Tworzenie folderów w drzewie (container, photo, custom)

Użytkownik może tworzyć dodatkowe foldery z poziomu drzewa:

1. **Wpisuję nazwę** (np. `to-tab-6-col`, `static`, `panoramic-to-horizontal`)
2. **Wybieram typ:**
   - container — tylko szerokości
   - photo — szerokości + wysokości z ratio
3. **Konfiguruję dropdowny per viewport:**
   - Liczba kolumn (1-12)
   - Typ przeliczania (standard, -w-margin, -to-edge, itd.)
4. **Jeśli photo — definiuję ratio** (nazwa + proporcja, np. horizontal 4:3)
5. **Wybieram warianty do generowania** (-w-half, -w-margin, -to-edge, -1g, -2g)

#### 4.6.5 Wyjątki responsywne — dwa poziomy

**Per folder (główna zasada):**
```
Folder: to-tab-6-col
  desktop: [12] kolumn
  laptop:  [12] kolumn
  tablet:  [6] kolumn    ← dropdown
  mobile:  [2] kolumn    ← dropdown
```

Aplikacja przelicza wszystkie tokeny automatycznie według wybranej liczby kolumn per viewport.

**Per wiersz (opcjonalny override):**
Dla konkretnego tokena można nadpisać regułę folderu.

#### 4.6.6 Proporcje wysokości (photo)

Użytkownik dodaje proporcje wysokości:
1. Wpisuje **nazwę** (np. `horizontal`, `panoramic`, `square`, `vertical`)
2. Definiuje **ratio** (np. 4:3, 16:9, 1:1, 3:4)

**Formuła wysokości:**
```
h-col-n/{nazwa} = v-col-n × (ratio-b / ratio-a)
```

#### 4.6.7 Nazewnictwo wariantów

| Suffix | Znaczenie | Formuła |
|--------|-----------|---------|
| -w-half | z połową kolumny | + gutter width + (column width / 2) |
| -w-margin | z marginesem zdjęciowym | + (margin m - margin xs) |
| -to-edge | do krawędzi viewportu | + margin m |
| -1g | z jednym dodatkowym gutterem | + gutter width |
| -2g | z dwoma dodatkowymi gutterami | + (2 × gutter width) |

Specjalne tokeny:
- `v-col-viewport` = viewport
- `v-col-viewport-w-margin` = ingrid + 2 × (margin m - margin xs)

#### 4.6.8 Struktura generowanych zmiennych

```
desktop/
  └── column/
        └── v-col-1, v-col-1-w-half, v-col-1-w-margin, v-col-1-to-edge, v-col-1-1g, v-col-1-2g
        └── ...
        └── v-col-12, v-col-12-w-margin, v-col-12-to-edge, v-col-12-1g, v-col-12-2g
        └── v-col-viewport, v-col-viewport-w-margin
  └── margin/
        └── v-xs, v-xs-DL, v-xs-TM
        └── v-m, v-m-DL, v-m-TM
        └── v-l, v-l-DL, v-l-TM
        └── ...
  └── container/                     ← tworzone ręcznie
        └── static/
        └── to-tab-6-col/
        └── to-mobile-6-col/
  └── photo/                         ← tworzone ręcznie
        └── static/
              └── horizontal/
                    └── width/
                    └── height/
        └── dynamic/
              └── to-tab-6-col/
                    └── horizontal/
                          └── width/
                          └── height/
laptop/
  └── ...
tablet/
  └── ...
mobile/
  └── ...
```

#### 4.6.9 Persystencja konfiguracji

Konfiguracja buildera zapisywana w polu `description` zmiennych Figma:
- Przetrwa eksport/import z Figmy
- Nie wymaga osobnego pliku konfiguracyjnego
- Edytowalna z poziomu Scale Editor

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
│   │   ├── GridEditor.tsx (planned)
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
| 4 | Grid Editor — design | ✅ v0.8 PRD |
| 5 | Grid Editor — implementacja | 🔲 planned |
| 6 | Undo/Redo | 🔲 planned |

## 8. Znane limitacje

- Viewporty hardcoded w Radius (dynamic w Spacing i Typography)
- Viewporty hardcoded w Grid (Desktop, Laptop, Tablet, Mobile)
- Brak undo/redo
- Brak localStorage persistence (celowe — dane w Figma Variables)
- Single user, local only

---

**Wersja:** 0.8  
**Data:** 2025-12-24  
**Autor:** Claude + Marcin

**Changelog:**
- 0.8: **NOWA KONCEPCJA Grid Editor** — panel sterowania z BASE per viewport, automatyczne generowanie /column/ i /margin/, tworzenie folderów container/photo z drzewa, wyjątki responsywne per folder z dropdownami, warianty -DL/-TM dla marginesów, zasada mobile (n > columns = ingrid)
- 0.7: Poprzednia koncepcja Grid Builder (zastąpiona)
- 0.6: Dodano Typography Editor (v0.0.24)
- 0.5: Zaktualizowano status implementacji (v0.0.22)
- 0.4: Dodano sekcję UI Design
- 0.3: Dodano szczegółowe formuły i parametry
- 0.2: Dodano zarządzanie modami, strukturą
- 0.1: Wersja inicjalna
