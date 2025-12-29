# REZZON Studio — Roadmapa implementacji v3.3

**Status:** v0.4.0 (Faza 4 ukończona, Checkpoint #2 PASSED)
**Data:** 2025-12-29

---

## ✅ ZREALIZOWANE

### Faza 1 — Szkielet (DONE) ✅
- [x] Vite + React + TypeScript setup
- [x] CSS z makiet (design-system.css)
- [x] Layout (Header, Sidebar, Main, Panel, Statusbar)
- [x] Routing (Variables / Aliases / Snapshots)
- [x] Zustand store z podstawowymi akcjami
- [x] TypeScript types dla Figma Variables

### Faza 2 — Import i wyświetlanie (DONE) ✅
- [x] Parser JSON z eksportu Figma Variables
- [x] Modal importu z drag & drop
- [x] Walidacja plików przed importem
- [x] Wyświetlanie bibliotek i kolekcji w sidebar
- [x] Hierarchia folderów w tabeli
- [x] Expand/Collapse folderów
- [x] Ikony typów (FLOAT, STRING, BOOLEAN, COLOR)
- [x] Wyświetlanie wartości (kolory z podglądem + HEX)
- [x] Wyświetlanie aliasów (internal/external)
- [x] Clear Workspace z modalem potwierdzenia
- [x] Kolejność bibliotek (REZZON na górze, R4-* numerycznie)
- [x] Auto-select pierwszej kolekcji
- [x] Kolejność folderów jak w Figmie

### Faza 3 — Selekcja + Search + Filtry (DONE) ✅
- [x] Checkbox w wierszach (folder, zmienna)
- [x] Checkbox "select all" w headerze tabeli
- [x] Multi-select (Shift+click dla zakresu)
- [x] Sync checkboxów: sidebar folders ↔ tabela
- [x] Floating selection bar ("X selected" + akcje)
- [x] Live search w headerze
- [x] Filtrowanie wyników w tabeli
- [x] Podświetlanie dopasowań
- [x] Dropdown filtrów w toolbarze
- [x] Filtr by type: All / Number / Boolean / String / Color
- [x] Filtr by alias: All / No alias / Internal / External / Broken
- [x] Kombinowanie filtrów (AND logic)
- [x] Badge z liczbą aktywnych filtrów
- [x] Details Panel toggle i zawartość
- [x] Drzewo folderów w sidebarze z checkboxami

### Faza 4 — Operacje CRUD (DONE) ✅
- [x] Rename (single) — double-click, inline edit, Enter/Esc, walidacja
- [x] Rename (bulk) — modal z Match/Replace, preview, regex, konflikty
- [x] Delete — modal potwierdzenia, info o broken aliasach
- [x] Duplicate folder — kopiowanie z sufiksem " 2", aliasy na oryginały

---

## ✅ TEST CHECKPOINT #1 — Import & Display (PASSED)

**Data:** 2025-12-29
**Wynik:** 100% PASS (po naprawkach v0.3.1 → v0.3.2 → v0.3.3)

---

## ✅ TEST CHECKPOINT #2 — CRUD (PASSED)

**Data:** 2025-12-29

**Wyniki:**
- [x] Inline rename działa (double-click, edit, Enter/Esc)
- [x] Walidacja: pusty, duplikat, "/" w nazwie
- [x] Bulk rename z Match/Replace + preview
- [ ] Bulk rename z regex — pominięty (user nie używa)
- [x] Delete z potwierdzeniem
- [x] Info o broken aliasach przy delete
- [x] Duplicate folder tworzy kopię z sufiksem
- [x] Toolbar i Selection Bar działają

**Known Limitations:**

| ID | Opis | Priorytet |
|----|------|-----------|
| BUG-4.4.1 | Duplicate działa tylko dla folderów bez subfolderów (liście). Foldery nadrzędne z subfolderami mają wyszarzoną opcję — wymaga rekurencyjnej duplikacji. | 🟡 Medium → Faza 12 |

---

## 📝 NICE-TO-HAVE (do Fazy 12)

| ID | Opis | Źródło |
|----|------|--------|
| FR-1 | Kwadracik koloru w Details Panel | Checkpoint #1 |
| FR-2 | Poprawić UX drzewa folderów w sidebarze | Checkpoint #1 |
| FR-3 | Details Panel: Alias Target rozwiązywać nazwy dla external | Checkpoint #1 |
| FR-4 | Przycisk Copy przy Path w Details Panel | Checkpoint #1 |
| BUG-4.4.1 | Duplicate dla folderów z subfolderami (rekurencyjna duplikacja) | Checkpoint #2 |

---

## 🔄 BLOK 1: Core MVP (continued)

### Faza 5 — Aliasy (Est. 3-4 dni) ⬅️ NEXT

#### 5.1 Alias Picker (single)
- [ ] Kliknięcie na komórkę wartości → picker
- [ ] Search w pickerze
- [ ] Lista zmiennych tego samego typu
- [ ] Podział: internal / external

#### 5.2 Bulk Alias
- [ ] Modal bulk alias
- [ ] Wybór source folder
- [ ] Wybór target library/collection
- [ ] Wybór modes (kolumn) do zastosowania
- [ ] Matchowanie po nazwie
- [ ] Lista niezmatchowanych po operacji

#### 5.3 Alias Manager (widok Aliases)
- [ ] Lista wszystkich aliasów
- [ ] Tabs: All / Internal / External / Broken
- [ ] Tabela: Source → Target, Type, Mode
- [ ] Connected External Libraries section

#### 5.4 Disconnect
- [ ] Wybór biblioteki do odłączenia
- [ ] Modal: "Z którego mode'a wziąć resolved values?"
- [ ] Zamiana aliasów na wartości

#### 5.5 Restore
- [ ] Lista odłączonych bibliotek
- [ ] Modal restore z preview
- [ ] All-or-nothing per library

---

### Faza 8 — Eksport (Est. 2-3 dni)

- [ ] Walidacja przed eksportem
- [ ] Eksport do Figmy (format JSON)
- [ ] Eksport sesji (pełny stan)
- [ ] Import sesji

---

## 🔄 BLOK 2: Bezpieczeństwo i wydajność

### Faza 6 — UNDO/REDO (Est. 2 dni)
- [ ] Stack past/future, limit 20-30 kroków
- [ ] Przyciski Undo/Redo + skróty klawiszowe

### Faza 7 — Snapshots (Est. 2-3 dni)
- [ ] Tworzenie, lista, restore

### Faza 9 — Wirtualizacja (Est. 2-3 dni)
- [ ] @tanstack/react-virtual dla 8.5k+ wierszy

---

## 🔄 BLOK 3: Polish

### Faza 10-12 — Persystencja, Skróty, Polish (Est. 4-6 dni)
- [ ] IndexedDB, auto-save
- [ ] Skróty klawiszowe
- [ ] Empty/loading/error states
- [ ] Nice-to-have fixes (FR-1 do FR-4, BUG-4.4.1)

---

## 📊 PODSUMOWANIE

| Blok | Fazy | Status |
|------|------|--------|
| **Fazy 1-4** | 1, 2, 3, 4 | ✅ DONE |
| **Checkpoint #1** | Import & Display | ✅ PASSED |
| **Checkpoint #2** | CRUD | ✅ PASSED |
| **MVP** | 5, 8 | ⬅️ NEXT |
| **Safety** | 6, 7, 9 | ⏳ |
| **Polish** | 10, 11, 12 | ⏳ |

**Łącznie pozostało:** ~15-22 dni roboczych

---

## 🎯 NASTĘPNY KROK

**Faza 5: Aliasy**
