# REZZON Studio — Roadmapa implementacji v5

**Status:** v0.8.5
**Data:** 2025-01-05

---

## ✅ ZREALIZOWANE

### Faza 1 — Szkielet (DONE)
- [x] Vite + React + TypeScript setup
- [x] CSS z makiet (design-system.css)
- [x] Layout (Header, Sidebar, Main, Panel, Statusbar)
- [x] Routing (Variables / Aliases / Snapshots)
- [x] Zustand store z podstawowymi akcjami
- [x] TypeScript types dla Figma Variables

### Faza 2 — Import i wyświetlanie (DONE)
- [x] Parser JSON z eksportu Figma Variables
- [x] Modal importu z drag & drop
- [x] Walidacja plików przed importem
- [x] Wyświetlanie bibliotek i kolekcji w sidebar
- [x] Hierarchia folderów w tabeli
- [x] Expand/Collapse folderów
- [x] Ikony typów (FLOAT, STRING, BOOLEAN, COLOR)
- [x] Wyświetlanie wartości (kolory z podglądem, aliasy)
- [x] Clear Workspace z modalem potwierdzenia

### Faza 3 — Selekcja + Search + Filtry (DONE)
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

### Faza 4 — Operacje CRUD (DONE)
- [x] Inline rename (double-click)
- [x] Bulk rename z Match/Replace
- [x] Delete z potwierdzeniem
- [x] Duplicate folder
- [x] Propagacja rename do aliasów

### Faza 5 — Aliasy (~80% DONE)
- [x] 5.3 Alias Manager (widok Aliases)
  - [x] Lista wszystkich aliasów
  - [x] Tabs: All / Internal / External / Broken
  - [x] Tabela: Source → Target, Type
  - [x] Connected External Libraries section
  - [x] Statystyki (internal/external/broken count)
  - [x] Alias Details panel (fixed position)
- [x] 5.4 Disconnect
  - [x] Multi-collection mode selection
  - [x] Zamiana aliasów na resolved values
  - [x] Zapis do `disconnectedLibraries`
  - [x] Sekcja DISCONNECTED w sidebar
- [x] 5.5 Restore
  - [x] Modal restore z preview
  - [x] Przywracanie aliasów z previousAliases
  - [x] Usuwanie z disconnectedLibraries
  - [x] Zapisywanie collectionName przy restore (v0.8.4)
- [ ] 5.1 Alias Picker (single) — trigger w Variables view (komponent gotowy)
- [ ] 5.2 Bulk Alias — trigger w UI (komponent gotowy)

### Faza 6 — UNDO/REDO (DONE)
- [x] Stack past/future w store
- [x] Limit 30 kroków
- [x] Obsługiwane operacje: rename, delete, alias, bulkRename, duplicateFolder, removeAlias, disconnect, restore
- [x] Przyciski Undo/Redo w toolbarze (aktywne/disabled)
- [x] Dynamiczne tooltips z opisem operacji
- [x] Skróty klawiszowe: ⌘Z / ⌘⇧Z / ⌘Y

### Faza 8.2 — Eksport do Figmy (DONE)
- [x] Walidacja przed eksportem (broken aliases, conflicts)
- [x] Statystyki w modalu (variables, internal/external aliases)
- [x] Format JSON zgodny z Figma Variables
- [x] Download pliku z datą
- [x] Export dropdown z listą bibliotek (v0.8.3)

---

## 🔄 DO ZROBIENIA

### Faza 8.3 — Eksport sesji (Priorytet: WYSOKI)
- [ ] Pełny stan: biblioteki + disconnectedLibraries + UI
- [ ] Format JSON
- [ ] Download pliku

### Faza 8.4 — Import sesji (Priorytet: WYSOKI)
- [ ] Rozpoznawanie typu pliku (Figma vs Session)
- [ ] Restore pełnego stanu z sesji

### Faza 5.1-5.2 — Alias Picker trigger (Priorytet: ŚREDNI)
- [ ] Kliknięcie w komórkę aliasu otwiera picker
- [ ] Bulk alias z selection bar

### Faza 7 — Snapshots (Priorytet: NISKI)
- [ ] 7.1 Tworzenie snapshotu
- [ ] 7.2 Lista i podgląd
- [ ] 7.3 Restore

### Faza 9 — Wirtualizacja (Priorytet: NISKI)
- [ ] @tanstack/react-virtual
- [ ] Płynne przewijanie przy 8.5k+ wierszy

### Faza 10-12 — Polish
- [ ] UX improvements
- [ ] Testy
- [ ] Dokumentacja

---

## 📋 HISTORIA BUGÓW

### BUG-CRIT-4 (FIXED v0.7.5)
**Problem:** Po disconnect wartości pokazywały "undefined"
**Rozwiązanie:** Spread operator `{...value}` zamiast przypisania referencji

### BUG-CRIT-5 (FIXED v0.7.6)
**Problem:** Restore przywracał tylko ~3 aliasy zamiast ~960
**Rozwiązanie:** Deep cloning z libClones cache

### BUG-CRIT-6 (FIXED v0.8.2 + v0.8.4 + v0.8.5)
**Problem:** External count 850 zamiast 947 po restore

**Przyczyny (3 osobne problemy):**
1. WeakMap cache nie był czyszczony po restore (v0.8.2)
2. Restore nie zapisywał `collectionName` dla aliasów (v0.8.4)
3. `findVariableInLibrary` false positive przez short name match (v0.8.5)

**Szczegóły problemu #3:**
- `Size/Desktop/ref-10` matchowało `Spacing/Desktop/ref-10` przez short name `ref-10`
- Disconnect rozłączał aliasy do ZŁEJ biblioteki
- Restore przywracał do złych targetów

**Rozwiązania:**
- v0.8.2: `clearNameIndexCache()` po disconnect/restore
- v0.8.4: Dodano `collectionName` w restore
- v0.8.5: Usunięto search by short name z `findVariableInLibrary`

---

## 📋 CHANGELOG

### v0.8.5 (2025-01-05)
- **FIX:** CRITICAL - `findVariableInLibrary` false positive przez short name match
  - `Size/Desktop/ref-10` matchowało `Spacing/Desktop/ref-10` przez `ref-10`
  - Usunięto search by short name (ostatni segment ścieżki)
  - Disconnect teraz rozłącza tylko aliasy do wybranej biblioteki

### v0.8.4 (2025-01-05)
- **FIX:** Restore nie zapisywał `collectionName` dla aliasów
- **FIX:** validateForExport pokazywał "0 external" — teraz używa findVariableInLibrary

### v0.8.3 (2025-01-05)
- **UX:** Export dropdown z listą wszystkich bibliotek
  - Główna biblioteka (REZZON) zawsze pierwsza
  - Pokazuje liczbę zmiennych przy każdej bibliotece

### v0.8.2 (2025-01-05)
- **FIX:** BUG-CRIT-6 — WeakMap cache nie był czyszczony po restore
  - Dodano `clearNameIndexCache()` w aliasUtils.ts
  - Wywołanie po disconnect i restore w appStore.ts

### v0.8.1 (2025-01-05)
- **QUALITY:** Merge TypeScript improvements z no-context version
  - Type safety: `any` → proper types
  - React anti-patterns: `useEffect` → `useMemo` / derive-during-render
  - Lint fixes: unused variables

### v0.8.0 (2025-01-05)
- **FEAT:** Eksport do Figmy
  - Modal z walidacją (błędy/ostrzeżenia)
  - Statystyki (variables, aliases)
  - Download JSON

### v0.7.8 — v0.7.0 (2025-01-02 — 2025-01-04)
- Disconnect/Restore implementation
- Multi-collection mode selection
- Debugging cycle dla BUG-CRIT-4, 5, 6

### v0.6.x (2025-12-30)
- UNDO/REDO (30 kroków)
- Performance cache (WeakMap)
- External alias recognition fixes

---

## 🎯 NASTĘPNY KROK

**Eksport/Import sesji (Faza 8.3 + 8.4)** — żeby można było zapisać stan pracy i wczytać później

Szacunek: ~3-4h pracy
