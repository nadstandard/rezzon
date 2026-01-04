# REZZON Scale – Briefing

**Data aktualizacji:** 2025-01-02 (v2)  
**Status:** Implementacja w toku (v0.3.7)

---

## 1. Czym jest Scale

**REZZON Scale** to edytor wartości tokenów oparty na formułach matematycznych.

**Ekosystem REZZON:**
- **Studio** → struktura, aliasy, zarządzanie
- **Scale** → wartości, formuły, generowanie ← *ten projekt*
- **Portal** → import/eksport do Figmy

**Kluczowa idea:**
> "Cała ta apka to zbiór prostych obliczeń matematycznych i warunków wyznaczanych przez usera"

Scale to **kalkulator z UI** w formie **edytora** (nie generatora) – user widzi dane, manipuluje nimi na żywo, widzi efekty, iteruje.

---

## 2. ZASADA ELASTYCZNOŚCI

**Wszystkie listy w Scale są OTWARTE.** User może dodawać własne elementy:

| Element | Przykłady w arkuszu | User może dodać |
|---------|---------------------|-----------------|
| Viewporty | 1920, 1366, 768, 390 | dowolne |
| Style | Cross, Circle, Triangle, Square | dowolne |
| Parametry base | viewport, columns, gutter, margin-m, margin-xs | własne |
| Modyfikatory | -w-half, -w-margin, -to-edge | własne (-1g, -2g, cokolwiek) |
| Ratio families | horizontal, vertical, square, panoramic-high, panoramic-low | własne |
| Warianty responsywne | static, to-tab-6-col, to-mobile-2col | własne |
| **Foldery output** | column, container, photo | własne (pełna dowolność) |

**Scale nie hardcoduje żadnej z tych list.**

---

## 3. Sekcje Scale

1. **Grid** (główna, w trakcie implementacji)
2. **Typography** (TODO)
3. **Spacing** (TODO)
4. **Radii** (TODO)

---

## 4. Grid – Macierz

### Struktura danych

**Viewporty = Wiersze w macierzy** (max 10, lista otwarta)
- Desktop (1920px), Laptop (1366px), Tablet (768px), Mobile (390px)

**Style = Mode'y / Kolumny w Figma** (max 10, lista otwarta)
- CROSS, CIRCLE, TRIANGLE, SQUARE
- Każdy styl ma własną szerokość kolumny i guttera

### WAŻNE: Mode vs Viewport

W Figma Variables JSON:
- **Modes** = style grida (CROSS/CIRCLE/TRIANGLE/SQUARE)
- **Viewporty** = w ścieżce tokena (`column/desktop/v-col-1`)

To NIE są responsive breakpointy w sensie Figma modes!

### UI – jak Figma Variables

Tabela z mode'ami jako kolumny, zmiennymi jako wiersze, inline editing.

---

## 5. Typy wartości

| Ikona | Typ | Opis |
|-------|-----|------|
| `#` | **Base** | User edytuje (input) |
| `ƒ` | **Computed** | Automatycznie obliczane z formuły |
| `=` | **Generated** | Seria tokenów (v-col-1, v-col-2, ...) |

User edytuje tylko **Base**. Reszta się przelicza automatycznie.

---

## 6. Parametry Base (lista otwarta)

Obecne w arkuszu:
```
viewport
number-of-columns
number-of-gutters      (computed: columns - 1)
column-width           (computed)
gutter-width
margin-m
margin-xs
photo-margin           (computed: margin-m - margin-xs)
ingrid                 (computed)
```

User może dodać własne parametry.

---

## 7. Formuły Computed

```
number-of-gutters = number-of-columns - 1
column-width = (viewport - (2 × margin-m) - ((number-of-columns - 1) × gutter-width)) / number-of-columns
ingrid = viewport - (2 × margin-m)
photo-margin = margin-m - margin-xs
```

---

## 8. Generowane serie tokenów

```
v-col-1 = column-width × 1 + gutter × 0
v-col-2 = column-width × 2 + gutter × 1
v-col-n = column-width × n + gutter × (n-1)
v-col-viewport = viewport
v-full = ingrid
```

---

## 9. Modyfikatory (lista otwarta)

### Obecne w arkuszu:

| Modifier | Zakres | Wariant full? | Formuła |
|----------|--------|---------------|---------|
| `-w-half` | 1 to n-1 | NIE | `value + col-width/2` |
| `-w-margin` | 1 to n | TAK (×2) | `value + photo-margin` |
| `-to-edge` | 1 to n | TAK (×2) | `value + margin-m` |
| `-1G` | 1 to n-1 | NIE | `value + gutter` |
| `-2G` | 1 to n-2 | NIE | `value + 2×gutter` |

### User może dodać własne

### Kolejność modifiers = kolejność tokenów

Tokeny generują się według kolejności modifiers na liście globalnej.

### Modyfikatory to sufiksy, nie subfoldery

Modyfikatory generują tokeny z sufiksem w nazwie:
```
h-col-1
h-col-1-w-half      ← modifier jako sufiks
h-col-1-w-margin    ← modifier jako sufiks
h-col-1-to-edge     ← modifier jako sufiks
```

---

## 10. Ratio Families (lista otwarta)

### Obecne w arkuszu:

| Family | Ratio |
|--------|-------|
| horizontal | 4:3 |
| vertical | 3:4 |
| square | 1:1 |
| panoramic-high | 16:9 |
| panoramic-low | 16:5 |

User może dodać własne.

### Obliczenia:

```
width = v-col-n (z grida)
height = width × (ratio-b / ratio-a)
```

### Width vs Height

**Szerokość generuje się RAZ** – nie zależy od ratio.
**Wysokość generuje się × ilość ratios** – każde ratio to subfolder.

---

## 11. Warianty responsywne (lista otwarta)

### Obecne w arkuszu:

- `static` (brak zmian responsywnych)
- `to-tab-6-col`
- `to-tab-12-col`
- `to-tab-viewport`
- `to-mobile-6-col`
- `to-mobile-2col`
- `heading`
- `margin-to-tab-margin`
- `margin-to-tab-viewport`

User może dodać własne.

---

## 12. MECHANIZM RESPONSIVE VARIANTS (KLUCZOWE!)

### Czym są responsive variants?

Responsive variants to **NIE osobne viewporty**. To **alternatywne zachowania** tokenów w ramach tego samego viewportu.

### Viewport Behaviors

Każdy responsive variant definiuje zachowanie per viewport:

| Behavior | Opis |
|----------|------|
| **Inherit** | Używa domyślnej liczby kolumn z parametrów |
| **Override columns** | Wymusza konkretną liczbę kolumn (collapse) |

### Przykład: `to-tab-6-col`

```
Viewport     | Behavior | Columns | Co się dzieje
-------------|----------|---------|------------------
Desktop      | Inherit  | 12      | Wartości normalne
Laptop       | Inherit  | 12      | Wartości normalne
Tablet       | Override | 6       | WSZYSTKO = wartość 6 kolumn
Mobile       | Override | 6       | WSZYSTKO = wartość 6 kolumn
```

### Efekt w tokenach (z analizy JSON R4-Grid):

**Normalne tokeny (static):**
```
container/tablet/v-col-1  = 36   (1 kolumna)
container/tablet/v-col-6  = 316  (6 kolumn)
container/tablet/v-col-8  = 428  (8 kolumn)
container/tablet/v-col-12 = 652  (12 kolumn)
```

**Z responsive variant `to-tab-6-col`:**
```
container/tablet/to-tab-6-col/v-col-1  = 316  ← collapsed!
container/tablet/to-tab-6-col/v-col-6  = 316  ← collapsed!
container/tablet/to-tab-6-col/v-col-8  = 316  ← collapsed!
container/tablet/to-tab-6-col/v-col-12 = 316  ← collapsed!
```

**WSZYSTKIE tokeny w tym wariancie mają tę samą wartość** = wartość dla 6 kolumn.

### Zastosowanie UX

Pozwala designerowi powiedzieć:
> "Ten element ma 8 kolumn na desktopie, ale na tablecie kolapsuje się do 6 kolumn"

Zamiast ręcznie ustawiać aliasy, designer wybiera odpowiedni wariant.

### Konfiguracja w Scale

```typescript
interface ViewportBehavior {
  viewportId: string;
  behavior: 'inherit' | 'override';
  overrideColumns?: number;  // jeśli override
}

interface ResponsiveVariant {
  id: string;
  name: string;              // "to-tab-6-col"
  viewportBehaviors: ViewportBehavior[];
}
```

### Logika generatora

```
Dla każdego tokena v-col-N:
  Dla każdego viewport:
    Jeśli behavior === 'inherit':
      value = normalna wartość dla N kolumn
    Jeśli behavior === 'override':
      value = wartość dla overrideColumns kolumn (np. 6)
```

---

## 13. ARCHITEKTURA FOLDERÓW OUTPUT

### Filozofia: "Głupi" generator

**Aplikacja nie wie co to column, photo, margin.** User sam buduje drzewo folderów i konfiguruje każdy.

### Folder = konfiguracja

Każdy folder ma:

| Pole | Opis |
|------|------|
| **Nazwa/ścieżka** | User tworzy dowolną strukturę |
| **Token prefix** | np. `v-col-`, `w-col-`, `mosaic-` |
| **Modifiers** | Które z globalnej listy zastosować |
| **Multiply by ratio?** | Toggle: tak/nie (jeden ratio na folder) |
| **Responsive variants** | Które (tworzą subfolders) |

### Uproszczenia w v0.3.7

- Usunięto toggle "Generate height?" (jeden folder = jeden typ tokena)
- Usunięto widthPrefix/heightPrefix (zastąpione jednym tokenPrefix)
- Jeden ratio na folder (radio buttons zamiast multi-select)
- UI responsive variants ukryte (do reimplementacji)

### Przykład konfiguracji

```
📁 column
   path: "column/{viewport}"
   prefix: "v-col-"
   modifiers: [-w-half, -w-margin, -to-edge, -1G, -2G]
   ratio: brak
   responsive: [static]

📁 photo-width
   path: "photo/{viewport}/width/{responsive}"
   prefix: "w-col-"
   modifiers: [-w-half, -w-margin, -to-edge]
   ratio: brak
   responsive: [static, to-tab-6-col, to-mobile-6-col]

📁 photo-height-horizontal
   path: "photo/{viewport}/height/{responsive}/horizontal"
   prefix: "h-col-"
   modifiers: [-w-half, -w-margin, -to-edge]
   ratio: horizontal (4:3)
   responsive: [static, to-tab-6-col, to-mobile-6-col]
```

---

## 14. Eksport – Format Figma Variables API

Eksport w formacie zgodnym z Figma REST API:

```json
{
  "version": "1.0",
  "exportedAt": "2025-01-02T...",
  "fileName": "Grid",
  "collections": [{
    "id": "VariableCollectionId:new:1",
    "name": "Grid",
    "modes": [
      { "id": "mode:1", "name": "CROSS" },
      { "id": "mode:2", "name": "CIRCLE" }
    ],
    "variables": [{
      "id": "VariableID:new:1",
      "name": "column/desktop/v-col-1",
      "type": "FLOAT",
      "valuesByMode": {
        "mode:1": { "type": "FLOAT", "value": 104 },
        "mode:2": { "type": "FLOAT", "value": 108 }
      }
    }]
  }]
}
```

Portal importuje bezpośrednio do Figmy.

---

## 15. Ograniczenia techniczne

- Max **10 viewportów** – ograniczenie Figmy (modes)
- Max **10 stylów** – ograniczenie Figmy (modes)
- Nazwy folderów bez `:` – ograniczenie Figmy

---

## 16. Pliki referencyjne

- Arkusz Excel: `R4_1_GRID.xlsx`
- JSON eksport R4-Grid: `1-R4-Grid_2025-12-30.json` (3590 zmiennych)
- Wspólny CSS: `rezzon-scale-styles.css`

---

## 17. Status implementacji

### ✅ Zaimplementowane
- Macierz viewport × style
- Formula Engine (computed values)
- Token Generator (base + modifiers)
- Eksport Figma Variables API
- OutputFolders architecture
- Ratio multiplication (jeden ratio na folder)

### ❌ Niezaimplementowane
- **Responsive variants w generatorze** (typy gotowe, generator ignoruje)
- ViewportBehaviors (override columns)
- Pełna struktura R4-Grid (3590 tokenów)

---

## 18. PODJĘTE DECYZJE – Responsive Variants (2025-01-03)

| # | Pytanie | Decyzja |
|---|---------|---------|
| **O1** | Gdzie żyją definicje wariantów? | **Globalnie** (checkbox per folder) |
| **O2** | Czy "static" wbudowany? | **Nie** (user tworzy sam) |
| **O3** | Override columns – skąd opcje? | **Dynamicznie z maxColumns** |
| **O4** | Nazewnictwo wariantu | **Ręczne** (user wpisuje) |
| **O5** | Nazewnictwo ścieżek | **Placeholder `{responsive}`** jako mnożnik |

### Kluczowe zasady

1. **Globalna definicja, lokalne włączanie** — warianty definiujesz raz w Generators View, w folderze tylko checkbox włącza/wyłącza
2. **User tworzy `static`** — brak wbudowanych wariantów, pełna kontrola
3. **Placeholder `{responsive}`** — działa jak `{viewport}`, mnoży folder przez włączone warianty
4. **Pozycja w ścieżce konfigurowalna** — user decyduje gdzie wstawić `{responsive}`

### Przykład pełnego flow

```
GENERATORS VIEW:
┌─────────────────────────────────────────────────────────────┐
│ static         → All: Inherit                               │
│ to-tab-6-col   → Desktop/Laptop: Inherit, Tablet/Mobile: →6 │
└─────────────────────────────────────────────────────────────┘

OUTPUT FOLDER:
📁 photo-width
   path: "photo/{viewport}/width/{responsive}"
   ☑ static  ☑ to-tab-6-col

WYNIK:
photo/desktop/width/static/w-col-8         = 1000
photo/desktop/width/to-tab-6-col/w-col-8   = 1000 (inherit)
photo/tablet/width/static/w-col-8          = 428
photo/tablet/width/to-tab-6-col/w-col-8    = 316  (collapsed!)
```

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
