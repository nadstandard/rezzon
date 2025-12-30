# REZZON Scale – Decyzje projektowe

**Data aktualizacji:** 2025-12-30

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

## 5. Viewport Behaviors

**Decyzja:** Każdy responsive variant może mieć override liczby kolumn per viewport.

Opcje per viewport:
- **Inherit** – używa domyślnej liczby kolumn z parametrów
- **Override columns** – wymusza konkretną liczbę

Uzasadnienie: Responsive variants często potrzebują różnych siatek na różnych breakpointach.

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
1. Grid (zaimplementowane)
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

## 13. Width vs Height – oddzielne generowanie

**Decyzja:** Szerokość generuje się RAZ, wysokość × ilość ratios.

Uzasadnienie: Szerokość nie zależy od ratio. Tylko wysokość = width × ratio.

Struktura:
```
photo/{viewport}/width/{responsive}/     → jeden zestaw szerokości
photo/{viewport}/height/{responsive}/
   horizontal/   → wysokości dla 4:3
   vertical/     → wysokości dla 3:4
   square/       → wysokości dla 1:1
```

---

## 14. ARCHITEKTURA FOLDERÓW (NOWA)

**Decyzja:** Aplikacja jest "głupia" – nie wie co to column, photo, margin. User sam buduje drzewo folderów.

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
| **Width prefix** | Jeśli generuje szerokości |
| **Height prefix** | Jeśli generuje wysokości |
| **Generate height?** | Czy w ogóle obliczać wysokość |

### Semantyka = nazwy

`column`, `photo/width`, `margin` to tylko nazwy które USER nadaje folderom. Scale nie interpretuje – składa tokeny według konfiguracji.

### Przykład konfiguracji

```
📁 column
   path: "column/{viewport}"
   prefix: "v-col-"
   modifiers: [-w-half, -w-margin, -to-edge, -1G, -2G]
   generate height: NIE

📁 photo-mosaic
   path: "photo/{viewport}/mosaic"
   prefix: "mosaic-"
   modifiers: [-w-margin]
   generate height: TAK
   ratios: [square, horizontal]
   responsive: [static]
```

---

## 15. Warstwy output jako foldery

**Decyzja:** Stare "warstwy output" → nowe "foldery output" z pełną konfiguracją.

User nie wybiera z predefiniowanej listy warstw. User TWORZY foldery i konfiguruje każdy osobno.

---

## 16. Wersjonowanie

**Decyzja:** Semantic versioning dla aplikacji.

- `0.x.y` – development
- `1.0.0` – produkcyjna wersja z pełnym Grid
- Minor dla nowych sekcji (Typography, Spacing, Radii)
