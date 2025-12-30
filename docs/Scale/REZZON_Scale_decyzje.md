# REZZON Scale – Decyzje projektowe

**Data kompilacji:** 2025-12-30

---

## 1. Zasada elastyczności

**Decyzja:** Wszystkie listy są OTWARTE – user może dodawać własne elementy.

Dotyczy: viewportów, stylów, parametrów base, modyfikatorów, ratio families, responsive variants, warstw output.

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

## 4. Hierarchia konfiguracji generatorów

**Decyzja:** Kaskadowa konfiguracja: Responsive Variant → Ratio → Modifiers.

User wybiera:
1. Które ratios są dostępne w danym responsive variant
2. Które modifiers generować dla danego ratio

Przykład: `static` może mieć 5 ratios ze wszystkimi modifiers, `to-tab-6-col` tylko 3 ratios z ograniczonymi modifiers.

---

## 5. Viewport Behaviors

**Decyzja:** Każdy responsive variant może mieć override liczby kolumn per viewport.

Opcje per viewport:
- **Inherit** – używa domyślnej liczby kolumn z parametrów
- **Override columns** – wymusza konkretną liczbę

Uzasadnienie: Responsive variants często potrzebują różnych siatek na różnych breakpointach.

---

## 6. Jeden format eksportu

**Decyzja:** Jeden plik JSON zawierający:
1. Wygenerowane tokeny (format Figma Variables)
2. Metadane Scale (konfiguracja do re-importu)

Metadane Scale w description – Figma zignoruje, Portal/Scale odczyta.

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

## 13. Ratio w responsive variants

**Decyzja:** Ratio może się zmieniać per viewport w ramach responsive variant.

Przykład: `panoramic-high` (16:9) na desktop → `square` (1:1) na mobile.

User definiuje te przejścia w konfiguracji responsive variant.

---

## 14. Warstwy output

**Decyzja:** Predefiniowane warstwy z możliwością rozszerzenia:

| Warstwa | Zawartość |
|---------|-----------|
| `base/` | Parametry wejściowe |
| `column/` | v-col-X + modifiers |
| `container/` | Responsive variants |
| `margin/` | Marginesy |
| `photo/width/` | w-col-X |
| `photo/height/` | h-col-X per ratio |

User może dodać własne warstwy.

---

## 15. Wersjonowanie

**Decyzja:** Semantic versioning dla aplikacji.

- `0.x.y` – development
- `1.0.0` – produkcyjna wersja z pełnym Grid
- Minor dla nowych sekcji (Typography, Spacing, Radii)
