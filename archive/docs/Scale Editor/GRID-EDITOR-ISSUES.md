# Grid Editor — Konflikty i kwestie do rozwiązania

**Data:** 2025-12-24  
**Wersja:** v4  
**Status:** Do dyskusji z zespołem

---

## 🔴 KONFLIKTY PRD vs IMPLEMENTACJA

### 1. Struktura path dla photo folders

**PRD (sekcja 4.6.8) mówi:**
```
photo/
  └── static/
        └── horizontal/        ← dodatkowy poziom
              └── width/
              └── height/
```

**Implementacja generuje:**
```
photo/
  └── horizontal/              ← folder name bezpośrednio
        └── width/
        └── height/
```

**Pytanie:** Czy "horizontal", "panoramic" to:
- A) Nazwy folderów (obecna implementacja)
- B) Subfoldery wewnątrz folderu "static" (jak w PRD)

**Rekomendacja:** Obecna implementacja jest prostsza i wystarczająca. PRD prawdopodobnie pokazuje przykład z dwoma poziomami folderów, nie wymóg.

**Decyzja:** ⏳ Do potwierdzenia

---

### 2. Domyślne wartości dla folderów bez exceptions

**PRD nie precyzuje** co jest domyślną wartością gdy folder nie ma włączonych responsive exceptions.

**Implementacja:** Używa `ingrid` (pełna szerokość siatki minus marginesy).

**Alternatywa:** Można by używać `v-col-{columns}` gdzie columns = liczba kolumn z BASE dla danego viewportu.

**Pytanie:** Czy `ingrid` jako default jest OK?

**Decyzja:** ⏳ Do potwierdzenia

---

### 3. Warianty -w-half dla photo

**PRD (sekcja 4.6.5)** wymienia warianty:
> Checkboxy: v-col-n (base), -w-half, -w-margin, -to-edge, -1g, -2g

**Implementacja:** Photo folders nie mają `-w-half`, `-1g`, `-2g` — tylko `base`, `-w-margin`, `-to-edge`.

**Pytanie:** Czy photo powinno mieć wszystkie warianty jak container?

**Rekomendacja:** Photo typowo nie potrzebuje -w-half (połowa kolumny przy zdjęciu nie ma sensu). Obecna implementacja jest OK.

**Decyzja:** ⏳ Do potwierdzenia

---

## 🟡 KWESTIE UX DO ROZWAŻENIA

### 4. Przycisk "View generated tokens" vs "Save & generate"

**Obecne zachowanie:** Przycisk przełącza na widok tabeli (Table view).

**Potencjalny problem:** Użytkownik może oczekiwać że "generate" coś zapisuje/eksportuje.

**Alternatywy:**
- A) Zostawić "View generated tokens" (obecne)
- B) Zmienić na "Preview tokens"
- C) Dodać osobny przycisk "Export folder JSON"

**Decyzja:** ⏳ Do ustalenia

---

### 5. Automatyczny zapis vs manualny

**Obecne zachowanie:** Zmiany w konfiguracji zapisują się natychmiast do store (auto-save).

**Pytanie:** Czy użytkownik powinien mieć przycisk "Save" który commituje zmiany?

**Rekomendacja:** Auto-save jest wygodniejszy dla tego typu narzędzia. Undo/redo byłoby lepszym rozwiązaniem niż manual save.

**Decyzja:** ⏳ Do ustalenia

---

### 6. Walidacja nazw folderów

**Obecne zachowanie:** Sprawdza tylko czy nazwa nie jest pusta i czy nie istnieje duplikat.

**Brakuje:**
- Walidacja znaków (tylko a-z, 0-9, dash, underscore?)
- Maksymalna długość
- Zarezerwowane nazwy (column, margin, BASE?)

**Decyzja:** ⏳ Do implementacji

---

## 🟢 ROZWIĄZANE W v4

| # | Problem | Rozwiązanie |
|---|---------|-------------|
| 1 | Label "columns" zamiast "number of columns" | ✅ Poprawiono |
| 2 | Brak "number of gutters" w BASE | ✅ Dodano jako computed |
| 3 | Dead code `getEffectiveColumns()` | ✅ Usunięto |
| 4 | Brak walidacji ratio A/B > 0 | ✅ Dodano min=1 |
| 5 | Custom ratio nie działało poprawnie | ✅ Naprawiono logikę |

---

## 📋 BACKLOG TECHNICZNY

### Priorytet wysoki
- [ ] Undo/redo dla zmian w konfiguracji
- [ ] Keyboard shortcuts (Ctrl+S export, Ctrl+Z undo)

### Priorytet średni
- [ ] Drag & drop reordering folderów
- [ ] Duplikowanie folderów
- [ ] Bulk edit (zmiana ratio dla wszystkich viewportów naraz)

### Priorytet niski
- [ ] Dark/light theme toggle
- [ ] Collapse all/expand all w sidebar
- [ ] Search/filter w tabeli tokenów

---

## 🔗 POWIĄZANE DOKUMENTY

- PRD: `/home/claude/REZZON-Scale-Editor-PRD.md`
- Changelog: `/home/claude/SCALE-EDITOR-CHANGELOG.md`
- Mockup HTML: `/home/claude/grid-editor-mockup.html`
