# REZZON Scale – Briefing

**Data aktualizacji:** 2025-12-30  
**Status:** Implementacja w toku (v0.2.8)

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

1. **Grid** (główna, zaimplementowana)
2. **Typography** (TODO)
3. **Spacing** (TODO)
4. **Radii** (TODO)

---

## 4. Grid – Macierz

### Struktura danych

**Viewporty = Kolekcje** (max 10, lista otwarta)

**Style = Mode'y / Kolumny** (max 10, lista otwarta)

### Macierz viewport × styl

Każda komórka macierzy = zestaw parametrów base.

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

### Viewport Behaviors (v0.2.6)

W ramach każdego responsive variant user może określić per viewport:
- **Inherit** – używa domyślnej liczby kolumn z parametrów
- **Override columns** – wymusza inną liczbę kolumn dla tego viewportu

---

## 12. ARCHITEKTURA FOLDERÓW OUTPUT

### Stary model (hardcoded)

Generator miał sztywną strukturę:
```
column/{viewport}/...
photo/{viewport}/width/{responsive}/...
photo/{viewport}/height/{responsive}/{ratio}/...
```

User nie mógł zmienić ścieżek, prefixów, ani decydować co gdzie trafia.

### Nowy model (elastyczny)

**Aplikacja jest "głupia"** – nie wie co to column, photo, margin. User sam buduje drzewo folderów.

### Folder = konfiguracja

Każdy folder ma:

| Pole | Opis |
|------|------|
| **Nazwa/ścieżka** | User tworzy dowolną strukturę |
| **Token prefix** | np. `v-col-`, `w-col-`, `mosaic-` |
| **Modifiers** | Które z globalnej listy zastosować |
| **Multiply by ratio?** | Toggle: tak/nie |
| **Ratios** | Jeśli tak – które (tworzą subfolders) |
| **Responsive variants** | Które (tworzą subfolders) |
| **Generate height?** | Czy w ogóle obliczać wysokość |
| **Width prefix** | Jeśli generuje szerokości |
| **Height prefix** | Jeśli generuje wysokości |

### Semantyka = nazwy

`column`, `photo/width`, `margin` to tylko nazwy które USER nadaje folderom.

Generator nie interpretuje semantyki – składa tokeny według konfiguracji.

### Przykład konfiguracji

```
📁 column
   path: "column"
   prefix: "v-col-"
   modifiers: [-w-half, -w-margin, -to-edge, -1G, -2G]
   responsive: [static]
   generate height: NIE

📁 photo-width
   path: "photo/width"
   prefix: "w-col-"
   modifiers: [-w-half, -w-margin, -to-edge]
   responsive: [static, to-tab-6-col, to-mobile-6-col]
   generate height: NIE

📁 photo-height
   path: "photo/height"
   prefix: "h-col-"
   modifiers: [-w-half, -w-margin, -to-edge]
   responsive: [static, to-tab-6-col, to-mobile-6-col]
   ratios: [horizontal, vertical, square]
   generate height: TAK
   
📁 mosaic
   path: "photo/mosaic"
   prefix: "mosaic-"
   modifiers: [-w-margin]
   responsive: [static]
   ratios: [square]
   generate height: TAK
```

### Generowana struktura

Z powyższej konfiguracji:
```
column/{viewport}/v-col-1, v-col-1-w-half, ...
photo/width/{viewport}/{responsive}/w-col-1, w-col-1-w-half, ...
photo/height/{viewport}/{responsive}/horizontal/h-col-1, ...
photo/height/{viewport}/{responsive}/vertical/h-col-1, ...
photo/mosaic/{viewport}/static/square/mosaic-1, ...
```

---

## 13. Eksport – Format Figma Variables API

Eksport w formacie zgodnym z Figma REST API:

```json
{
  "version": "1.0",
  "exportedAt": "2025-12-30T...",
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

## 14. Ograniczenia techniczne

- Max **10 viewportów** (kolekcji) – ograniczenie Figmy
- Max **10 stylów** (mode'ów/kolumn) – ograniczenie Figmy
- Nazwy folderów bez `:` – ograniczenie Figmy

---

## 15. Pliki referencyjne

- Arkusz Excel: `R4_1_GRID.xlsx`
- JSON eksport R4-Grid: `1-R4-Grid_2025-12-30.json` (3590 zmiennych)
- Wspólny CSS: `rezzon-scale-styles.css`
