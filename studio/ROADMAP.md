# REZZON Studio – Roadmapa implementacji v2

**Status:** v0.7.3 (Faza 5 ZAKOŃCZONA, Faza 6 zakończona)
**Data:** 2025-01-02

---

## ✅ ZREALIZOWANE

### Faza 1 – Szkielet (DONE)
- [x] Vite + React + TypeScript setup
- [x] CSS z makiet (design-system.css)
- [x] Layout (Header, Sidebar, Main, Panel, Statusbar)
- [x] Routing (Variables / Aliases / Snapshots)
- [x] Zustand store z podstawowymi akcjami
- [x] TypeScript types dla Figma Variables

### Faza 2 – Import i wyświetlanie (DONE)
- [x] Parser JSON z eksportu Figma Variables
- [x] Modal importu z drag & drop
- [x] Walidacja plików przed importem
- [x] Wyświetlanie bibliotek i kolekcji w sidebar
- [x] Hierarchia folderów w tabeli
- [x] Expand/Collapse folderów
- [x] Ikony typów (FLOAT, STRING, BOOLEAN, COLOR)
- [x] Wyświetlanie wartości (kolory z podglądem, aliasy)
- [x] Clear Workspace z modalem potwierdzenia

### Faza 3 – Selekcja + Search + Filtry (DONE)
- [x] Checkbox w wierszach (folder, zmienna)
- [x] Checkbox "select all" w headerze tabeli
- [x] Multi-select (Shift+click dla zakresu)
- [x] Sync checkboxów: sidebar folders ↔ tabela
- [x] Floating selection bar ("X selected" + akcje)
- [x] Live search w headerze
- [x] Filtrowanie wyników w tabeli
- [x] Dropdown filtrów w toolbarze
- [x] Filtr by type: All / Number / Boolean / String / Color
- [x] Filtr by alias: All / No alias / Internal / External / Broken
- [x] Details Panel z pełną zawartością

### Faza 4 – Operacje CRUD (DONE)
- [x] Inline rename (double-click)
- [x] Bulk rename z Match/Replace
- [x] Delete z potwierdzeniem
- [x] Duplicate folder
- [x] Propagacja rename do aliasów

### Faza 5 – Aliasy (DONE)
- [x] 5.1 Alias Picker (single)
  - [x] Kliknięcie na komórkę wartości → picker
  - [x] Search w pickerze
  - [x] Lista zmiennych tego samego typu
  - [x] Podział: internal / external
  - [x] Remove alias
- [x] 5.2 Bulk Alias
  - [x] Modal bulk alias
  - [x] Wybór source folder
  - [x] Wybór target library
  - [x] Wybór modes (kolumn) do zastosowania
  - [x] Matchowanie po nazwie
  - [x] Lista niezmatchowanych po operacji
- [x] 5.3 Alias Manager (widok Aliases)
  - [x] Lista wszystkich aliasów
  - [x] Tabs: All / Internal / External / Broken
  - [x] Tabela: Source → Target, Type
  - [x] Connected External Libraries section
  - [x] Statystyki (internal/external/broken count)
  - [x] Alias Details panel (fixed position)
- [x] 5.4 Disconnect
  - [x] Wybór biblioteki do odłączenia
  - [x] Modal: "Z którego mode'a wziąć resolved values?"
  - [x] Zamiana aliasów na wartości
  - [x] Zapis do `disconnectedLibraries`
- [x] 5.5 Restore
  - [x] Lista odłączonych bibliotek w sidebar
  - [x] Modal restore z preview
  - [x] "X aliasów zostanie przywróconych, Y będzie broken"
  - [x] All-or-nothing per library

### Faza 6 – UNDO/REDO (DONE)
- [x] Stack past/future w store
- [x] Limit 30 kroków
- [x] Obsługiwane operacje: rename, delete, alias, bulkRename, duplicateFolder, removeAlias, bulkAlias
- [x] Przyciski Undo/Redo w toolbarze (aktywne/disabled)
- [x] Dynamiczne tooltips z opisem operacji
- [x] Skróty klawiszowe: ⌘Z / ⌘⇧Z / ⌘Y

---

## 🔄 W KOLEJCE

### Faza 7 – Snapshots (Est. 2-3 dni)

#### 7.1 Tworzenie
- [ ] Modal "Create Snapshot"
- [ ] Nazwa + opis (opcjonalny)
- [ ] Zapis pełnego stanu

#### 7.2 Lista i podgląd
- [ ] Lista snapshotów w sidebar
- [ ] Karta snapshotu: nazwa, data, typ, stats
- [ ] Detail view

#### 7.3 Restore
- [ ] Przycisk "Restore" → modal potwierdzenia
- [ ] Hard restore

### Faza 8 – Eksport (Est. 2-3 dni)

#### 8.1 Walidacja przed eksportem
- [ ] Sprawdzenie konfliktów nazw/ścieżek
- [ ] Sprawdzenie zgodności typów
- [ ] Wykrycie broken aliasów
- [ ] Modal z wynikami walidacji

#### 8.2 Eksport do Figmy
- [ ] Format JSON zgodny z Figma Variables
- [ ] Zachowanie oryginalnych ID
- [ ] Metadane (data eksportu)
- [ ] Download pliku

#### 8.3 Eksport sesji
- [ ] Pełny stan: biblioteki + UI + snapshots
- [ ] Pole `disconnectedLibraries`
- [ ] Format JSON
- [ ] Download pliku

---

## 📋 CHANGELOG

### v0.7.3 (2025-01-02)
- **FIX:** Disconnect modal — pokazuje modes z TARGET library zamiast z source (REZZON)

### v0.7.2 (2025-12-30)
- **FIX:** Disconnect library — używa getAliasType do poprawnej identyfikacji external aliasów
- **FIX:** Disconnect library — blokuje wielokrotne odłączanie tej samej biblioteki
- **FIX:** Disconnect library — zapisuje ID zmiennych zamiast nazw (dla restore)
- **FIX:** Restore library — poprawne przywracanie aliasów po ID
- **FIX:** Usunięto niedziałającą ikonę Eye przy Connected External Libraries

### v0.7.1 (2025-12-30)
- **FIX:** BUG-5.12.5 — Remove alias teraz pokazuje resolved value zamiast "-"

### v0.7.0 (2025-12-30)
- **FEAT:** 5.1 AliasPicker zintegrowany z widokiem Variables
  - Kliknięcie w komórkę wartości otwiera picker
  - Wybór aliasu z Internal/External zmiennych
  - Remove alias dla istniejących aliasów
- **FEAT:** 5.2 BulkAliasModal zintegrowany z widokiem Variables
  - Przycisk "Bulk Alias" w toolbarze aktywny
  - Pełny flow: Configure → Preview → Apply

### v0.6.3 (2025-12-30)
- **PERF:** Cache dla wyszukiwania zmiennych po nazwie (WeakMap + Map index)
- **FIX:** Optymalizacja widoku Aliases — usunięcie lagów przy dużej ilości aliasów

### v0.6.2 (2025-12-30)
- **FIX:** BUG-5.1 — External aliasy rozpoznawane poprawnie (szukanie po ID + nazwie)
- **FIX:** BUG-5.2 — Alias Details panel w prawidłowej pozycji (fixed right)
- **FEAT:** FR-5 — Ostrzeżenie beforeunload przed zamknięciem z danymi
- **FEAT:** FR-6 — Przycisk X w polu search do czyszczenia

### v0.6.0 (2025-12-30)
- **FEAT:** Faza 6 — pełne UNDO/REDO
- **FEAT:** Historia operacji z limitem 30 kroków
- **FEAT:** Przyciski Undo/Redo z dynamicznymi tooltipami
- **FEAT:** Skróty klawiszowe ⌘Z, ⌘⇧Z, ⌘Y

### v0.5.1 (2025-12-29)
- Fazy 3-5 (częściowo) — selekcja, search, filtry, CRUD, Alias Manager

---

## 🎯 NASTĘPNY KROK

**Faza 7: Snapshots** lub **Faza 8: Eksport**

Rekomendacja: Faza 8 (Eksport) - żeby móc testować pełny flow z prawdziwymi danymi.
