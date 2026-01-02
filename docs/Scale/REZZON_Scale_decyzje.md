# REZZON Scale – Decyzje projektowe

**Data aktualizacji:** 2025-01-02

---

## 1. Zasada elastyczności

**Decyzja:** Wszystkie listy są OTWARTE – user może dodawać własne elementy.

Dotyczy: viewportów, stylów, parametrów base, modyfikatorów, ratio families, responsive variants, **folderów output**.

Scale nie hardcoduje żadnej z tych list.

---

## 2. Typy wartości

**Decyzja:** Trzy typy wartości z wizualnym rozróżnieniem:

| Ikona | Typ | Edytowalny? |
|-------|-----|-------------|
| `#` | Base | TAK |
| `ƒ` | Computed | NIE (auto) |
| `=` | Generated | NIE (auto) |

User edytuje tylko Base. Reszta przelicza się automatycznie.

---

## 3. Modyfikatory jako sufiksy

**Decyzja:** Modyfikatory generują tokeny z sufiksem w nazwie, NIE tworzą subfolderów.

```
h-col-1
h-col-1-w-half      ← sufiks
h-col-1-w-margin    ← sufiks
```

Uzasadnienie: Płaska struktura, łatwiejsze wyszukiwanie w Figmie.

---

## 4. Kolejność modifiers = kolejność tokenów

**Decyzja:** Tokeny generują się według kolejności modifiers na liście globalnej.

Przykład: jeśli lista to `[-w-half, -w-margin, -to-edge]`, to tokeny:
```
v-col-1
v-col-1-w-half      ← pierwszy modifier
v-col-1-w-margin    ← drugi modifier
v-col-1-to-edge     ← trzeci modifier
v-col-2
v-col-2-w-half
...
```

User kontroluje kolejność przez UI (drag & drop w przyszłości).

---

## 5. Viewport Behaviors – mechanizm collapse

**Decyzja:** Każdy responsive variant definiuje zachowanie per viewport poprzez ViewportBehaviors.

### Model danych

```typescript
interface ViewportBehavior {
  viewportId: string;
  behavior: 'inherit' | 'override';
  overrideColumns?: number;
}
```

### Opcje per viewport:
- **Inherit** – używa domyślnej liczby kolumn z parametrów
- **Override columns** – wymusza konkretną liczbę (collapse)

### Logika generatora

```
Dla tokena v-col-N w viewport V:
  behavior = variant.viewportBehaviors[V]
  
  if behavior === 'inherit':
    return normalValue(N)
  
  if behavior === 'override':
    targetCols = behavior.overrideColumns
    return normalValue(targetCols)  // WSZYSTKIE tokeny = ta sama wartość
```

### Przykład: `to-tab-6-col`

| Viewport | Behavior | Columns | v-col-8 = |
|----------|----------|---------|-----------|
| Desktop  | Inherit  | 12      | 888 (8 kolumn) |
| Laptop   | Inherit  | 12      | 888 (8 kolumn) |
| Tablet   | Override | 6       | **316** (6 kolumn!) |
| Mobile   | Override | 6       | **316** (6 kolumn!) |

Uzasadnienie: Pozwala na "collapse" layoutów na mniejszych ekranach bez ręcznego aliasowania.

---

## 6. Format eksportu: Figma Variables API

**Decyzja:** Eksport w formacie zgodnym z Figma Variables REST API.

```json
{
  "version": "1.0",
  "exportedAt": "...",
  "collections": [{
    "id": "VariableCollectionId:...",
    "name": "Grid",
    "modes": [
      { "id": "mode:1", "name": "CROSS" },
      { "id": "mode:2", "name": "CIRCLE" }
    ],
    "variables": [{
      "id": "VariableID:...",
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

## 7. Ograniczenia Figmy

**Decyzja:** Respektujemy limity Figmy:
- Max 10 viewportów (kolekcji)
- Max 10 stylów (mode'ów)
- Nazwy bez `:` (niedozwolony znak)

UI blokuje przekroczenie limitów.

---

## 8. UI inspirowane Figma Variables

**Decyzja:** Dark mode, tabelaryczny układ, inline editing.

- Macierz: viewporty jako wiersze sidebar, style jako kolumny
- Wartości wyrównane do lewej (jak w Figma Variables)
- Hover actions z płynnym transition (opacity, nie display)

---

## 9. Sekcje aplikacji

**Decyzja:** 4 sekcje z osobnymi briefingami i implementacjami:
1. Grid (w trakcie implementacji)
2. Typography (TODO)
3. Spacing (TODO)
4. Radii (TODO)

Każda sekcja może mieć inną strukturę UI, ale wspólny design system.

---

## 10. Persystencja (planowane)

**Decyzja:** IndexedDB z auto-save.

- Auto-save przy każdej zmianie
- Restore przy starcie aplikacji
- Eksport/import sesji jako backup

---

## 11. Computed vs Generated

**Decyzja:** Rozróżnienie:

- **Computed** = pojedyncza wartość obliczona z formuły (np. `column-width`)
- **Generated** = seria tokenów z wzorca (np. `v-col-1`, `v-col-2`, ..., `v-col-n`)

Computed pokazywane w Parameters jako osobna sekcja.
Generated pokazywane w Preview jako lista tokenów.

---

## 12. Formuły modyfikatorów

**Decyzja:** User definiuje formułę przez wybór z dropdownów:

- Zmienna bazowa: `value`, `column-width`, `gutter`, `margin-m`, `margin-xs`, `ingrid`
- Operator: `+`, `-`, `×`, `÷`
- Wartość: zmienna lub stała

Przykład: `-w-half` = `value + column-width / 2`

---

## 13. Jeden ratio na folder

**Decyzja (v0.3.7):** Folder może mieć JEDEN ratio do mnożenia, nie wiele.

Uzasadnienie: Upraszcza model. Jeśli potrzeba wielu ratios – tworzymy osobne foldery:
- `photo-height-horizontal` (ratio 4:3)
- `photo-height-vertical` (ratio 3:4)
- `photo-height-square` (ratio 1:1)

UI: Radio buttons zamiast checkboxów.

---

## 14. ARCHITEKTURA FOLDERÓW

**Decyzja:** Aplikacja jest "głupia" – nie wie co to column, photo, margin. User sam buduje drzewo folderów.

### Folder = konfiguracja

Każdy folder ma:

| Pole | Opis |
|------|------|
| **Nazwa/ścieżka** | User tworzy dowolną strukturę |
| **Token prefix** | np. `v-col-`, `w-col-`, `mosaic-` |
| **Modifiers** | Które z globalnej listy zastosować |
| **Multiply by ratio?** | Toggle + wybór JEDNEGO ratio |
| **Responsive variants** | Które (tworzą subfolders) |

### Semantyka = nazwy

`column`, `photo/width`, `margin` to tylko nazwy które USER nadaje folderom. Scale nie interpretuje – składa tokeny według konfiguracji.

---

## 15. Responsive variants to subfoldery

**Decyzja:** Responsive variants tworzą subfoldery w ścieżce tokena.

```
photo/{viewport}/width/static/w-col-1
photo/{viewport}/width/to-tab-6-col/w-col-1
photo/{viewport}/width/to-mobile-6-col/w-col-1
```

NIE są to osobne wartości w modach Figma. Są to osobne TOKENY z różnymi wartościami.

---

## 16. Wersjonowanie

**Decyzja:** Semantic versioning dla aplikacji.

- `0.x.y` – development
- `1.0.0` – produkcyjna wersja z pełnym Grid
- Minor dla nowych sekcji (Typography, Spacing, Radii)

---

## 17. Uproszczenia v0.3.7

**Decyzja:** Usunięto zbędne opcje z UI folderów:

| Usunięte | Zastąpione przez |
|----------|------------------|
| `generateHeight` toggle | Jeden folder = jeden typ tokena |
| `widthPrefix` / `heightPrefix` | Jeden `tokenPrefix` |
| Multi-select ratios | Jeden ratio na folder (radio) |
| Responsive Variants UI | Ukryte (do reimplementacji) |

Filozofia: **Jeden folder = jeden zestaw tokenów = jedna konfiguracja.**
