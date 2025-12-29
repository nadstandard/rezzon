# REZZON Scale – Briefing v3

**Data:** 2025-12-29  
**Status:** Koncept / Pre-mockup

---

## 1. Czym jest Scale

**REZZON Scale** to edytor wartości tokenów oparty na formułach matematycznych.

**Ekosystem REZZON:**
- **Studio** → struktura, aliasy, zarządzanie
- **Scale** → wartości, formuły, generowanie
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
| Warstwy output | column, container, photo | własne |

**Scale nie hardcoduje żadnej z tych list.**

---

## 3. Sekcje Scale

1. **Grid** (główna, opisana poniżej)
2. **Spacing** (TODO)
3. **Typography** (TODO)
4. **Radius** (TODO)

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

### User może dodać własne, np.:
- `-1g` → `value + gutter`
- `-2g` → `value + (2 × gutter)`
- cokolwiek innego

### Wizualizacja zasięgów:

```
|←── margin-xs ──→|←──────────── ingrid ────────────→|←── margin-xs ──→|
|←───────────── margin-m ─────────────→|←───────────── margin-m ─────────────→|
|←─────────────────────── viewport ───────────────────────→|

v-col-12           = ingrid
v-col-12-w-margin  = ingrid + photo-margin
v-col-12-to-edge   = ingrid + margin-m

v-full-w-margin    = ingrid + 2 × photo-margin    (symetria)
v-full-to-edge     = viewport                      (symetria)
```

### UI definiowania modyfikatora:

User określa:
1. **Name** (np. `-w-half`)
2. **Formula** (z dropdownów: value, col-width, gutter, margin-m, margin-xs, ingrid, stała + operatory)
3. **Apply to** (zakres kolumn: od–do)
4. **Has "full" variant** (checkbox, ×2 dla symetrii)

### Modyfikatory to sufiksy, nie subfoldery

Modyfikatory generują tokeny z sufiksem w nazwie:
```
h-col-1
h-col-1-w-half      ← modifier jako sufiks
h-col-1-w-margin    ← modifier jako sufiks
h-col-1-to-edge     ← modifier jako sufiks
```

Modyfikatory NIE tworzą dodatkowych subfolderów w strukturze.

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

### Struktura w Figmie:

```
grid/photo/width/{responsive-variant}/w-col-1...
grid/photo/height/{responsive-variant}/{ratio-family}/h-col-1...
```

Width jest płaskie (nie zależy od ratio).
Height ma podfoldery per ratio family.

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

### Logika:

Wariant responsywny = **osobny zestaw tokenów** z własnymi regułami per viewport.

Nazwa opisuje zachowanie: `to-tab-6-col` = "na tablecie przechodzi na 6 kolumn".

User decyduje per zestaw, jak ma się zachować na różnych viewportach.

---

## 12. HIERARCHIA KONFIGURACJI GENERATORÓW

To jest kluczowa sekcja opisująca jak user konfiguruje co się generuje.

### Struktura folderów w eksporcie

```
base/{viewport}/                              ← parametry wejściowe
column/{viewport}/                            ← v-col-1, v-col-1-w-half, ...
container/{viewport}/                         ← responsive variants
margin/{viewport}/                            ← marginesy
photo/{viewport}/width/{responsive}/          ← w-col-1, w-col-1-w-half, ...
photo/{viewport}/height/{responsive}/{ratio}/ ← h-col-1, h-col-1-w-half, ...
```

### Hierarchia decyzji usera

User konfiguruje **kaskadowo**:

```
1. RESPONSIVE VARIANT (np. to-tab-6-col)
   │
   ├── 2. RATIO (np. horizontal, square)
   │   │   User wybiera KTÓRE ratios są dostępne w tym responsive variant
   │   │   Przykład: static ma 5 ratios, to-tab-6-col ma tylko 3
   │   │
   │   └── 3. MODIFIERS (np. -w-half, -w-margin, -to-edge)
   │           User wybiera KTÓRE modifiers generować dla tego ratio
   │           Przykład: panoramic-high może mieć tylko -w-margin
   │
   └── Generowane tokeny = kombinacja powyższych
```

### Przykład konfiguracji

```
Responsive: to-tab-6-col
├── Ratio: horizontal
│   ├── ☑ -w-half
│   ├── ☑ -w-margin
│   ├── ☑ -to-edge
│   └── ☐ -1G
├── Ratio: vertical
│   ├── ☑ -w-half
│   ├── ☐ -w-margin
│   └── ☐ -to-edge
└── Ratio: square
    └── (brak modyfikatorów)

Responsive: static
├── Ratio: horizontal (wszystkie modifiers)
├── Ratio: vertical (wszystkie modifiers)
├── Ratio: square (wszystkie modifiers)
├── Ratio: panoramic-high (tylko -w-margin)
└── Ratio: panoramic-low (tylko -w-margin)
```

### Responsywność ratio

Ratio może się **zmieniać per viewport** w ramach responsive variant.

Przykład: `panoramic-high` (16:9) na desktop może stać się `square` (1:1) na mobile.

User definiuje te przejścia per responsive variant.

### Co to generuje

Dla konfiguracji `to-tab-6-col/horizontal` z modifiers `-w-half, -w-margin, -to-edge`:

```
photo/desktop/height/to-tab-6-col/horizontal/h-col-1
photo/desktop/height/to-tab-6-col/horizontal/h-col-1-w-half
photo/desktop/height/to-tab-6-col/horizontal/h-col-1-w-margin
photo/desktop/height/to-tab-6-col/horizontal/h-col-1-to-edge
photo/desktop/height/to-tab-6-col/horizontal/h-col-2
photo/desktop/height/to-tab-6-col/horizontal/h-col-2-w-half
...
```

---

## 13. Warstwy output (lista otwarta)

### Obecne w arkuszu:

| Warstwa | Opis |
|---------|------|
| `base/` | Parametry wejściowe per viewport |
| `column/` | Bazowe szerokości kolumn + modifiers |
| `container/` | Responsive variants |
| `margin/` | Marginesy |
| `photo/width/` | Szerokości dla zdjęć + responsywność |
| `photo/height/` | Wysokości per ratio family + responsywność |

User może dodać własne warstwy.

Container używa tej samej formuły co column – to tylko inna organizacja z responsywnością.

---

## 14. Ograniczenia techniczne

- Max **10 viewportów** (kolekcji) – ograniczenie Figmy
- Max **10 stylów** (mode'ów/kolumn) – ograniczenie Figmy
- Nazwy folderów bez `:` – ograniczenie Figmy

---

## 15. Eksport

**Jeden format eksportu**, który:
1. Figma łyka przez Portal
2. Portal potrafi wyeksportować z powrotem do Scale
3. Zawiera wygenerowane tokeny + definicje Scale (viewporty, style, modyfikatory, ratio, responsywność)

Definicje Scale mogą siedzieć w metadanych/description – Figma zignoruje, Portal odczyta.

---

## 16. Następne kroki

1. ✅ Analiza arkusza Excel `R4_1_GRID.xlsx`
2. ✅ Analiza JSON `1-R4-Grid_2025-12-18.json`
3. ☐ HTML mockup Grid editora
4. ☐ Briefing sekcji Spacing
5. ☐ Briefing sekcji Typography
6. ☐ Briefing sekcji Radius
7. ☐ React implementacja

---

## 17. Pliki referencyjne

- Arkusz Excel: `R4_1_GRID.xlsx`
- JSON eksport: `1-R4-Grid_2025-12-18.json`
- Wspólny CSS: `rezzon-studio-styles.css`
