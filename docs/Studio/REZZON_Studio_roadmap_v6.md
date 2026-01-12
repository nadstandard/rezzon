# REZZON Studio — Roadmapa implementacji v6

**Status:** v0.8.8
**Data:** 2025-01-12

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
- [x] **NOWE:** Obsługa formatu REZZON Portal (collections array)
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

### Faza 5 — Aliasy (~85% DONE)
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
  - [x] **NOWE:** Zapisuje publiczne ID (nie lokalne)
  - [x] **NOWE:** Zapisuje targetVarName i targetCollectionName
- [x] 5.5 Restore
  - [x] Modal restore z preview
  - [x] Przywracanie aliasów z previousAliases
  - [x] Usuwanie z disconnectedLibraries
  - [x] **NOWE:** Używa findVariableInLibrary z collectionName
  - [x] **NOWE:** Zachowuje publiczne ID
- [ ] 5.1 Alias Picker (single) — trigger w Variables view (komponent gotowy)
- [ ] 5.2 Bulk Alias — trigger w UI (komponent gotowy)

### Faza 6 — UNDO/REDO (DONE)
- [x] Stack past/future w store
- [x] Limit 30 kroków
- [x] Obsługiwane operacje: rename, delete, alias, bulkRename, duplicateFolder, removeAlias, disconnect, restore
- [x] Przyciski Undo/Redo w toolbarze (aktywne/disabled)
- [x] Dynamiczne tooltips z opisem operacji
- [x] Skróty klawiszowe: ⌘Z / ⌘⇧Z / ⌘Y

### Faza 8 — Eksport/Import (DONE)
- [x] 8.1 Walidacja przed eksportem
- [x] 8.2 Eksport do Figmy (JSON)
- [x] 8.3 Eksport sesji
- [x] 8.4 Import sesji

---

## 🔄 DO ZROBIENIA

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

### BUG-CRIT-7 (FIXED v0.8.7 + v0.8.8)
**Problem:** 360 aliasów ma złe variableId po restore (Horizontal zamiast Vertical)
**Przyczyny:**
1. detectFileType nie rozpoznawał formatu REZZON Portal
2. Duplikaty nazw w różnych kolekcjach (R4-Spacing-Scale)
3. Disconnect zapisywał lokalne ID zamiast publicznych

**Rozwiązania:**
- v0.8.7: Obsługa `collections` array + `collectionNameIndex`
- v0.8.8: Zapisywanie publicznych ID + `targetVarName`, restore używa `findVariableInLibrary`

### BUG-CRIT-6 (FIXED v0.8.2 + v0.8.4 + v0.8.5)
**Problem:** External count 850 zamiast 947 po restore

### BUG-CRIT-5 (FIXED v0.7.6)
**Problem:** Restore przywracał tylko ~3 aliasy zamiast ~960

### BUG-CRIT-4 (FIXED v0.7.5)
**Problem:** Po disconnect wartości pokazywały "undefined"

---

## 📋 CHANGELOG

### v0.8.8 (2025-01-12)
- **FIX:** Disconnect zapisywał lokalne ID zamiast publicznych
- **FIX:** Restore używa findVariableInLibrary z targetVarName i collectionName
- Typ DisconnectedLibrary rozszerzony o `targetVarName`

### v0.8.7 (2025-01-12)
- **FIX:** detectFileType nie rozpoznawał formatu REZZON Portal (collections array)
- **FIX:** collectionNameIndex dla bibliotek z duplikatami nazw zmiennych
- findVariableInLibrary przyjmuje opcjonalny `collectionName`
- Security: react-router 7.0.0 → 7.12.0+ (fixed CSRF, XSS)

### v0.8.6 (2025-01-05)
- **FIX:** External alias recognition dla bibliotek z wieloma kolekcjami

### v0.8.5 (2025-01-05)
- **FIX:** findVariableInLibrary false positive przez short name match

### v0.8.4 (2025-01-05)
- **FIX:** Restore nie zapisywał `collectionName` dla aliasów

### v0.8.3 (2025-01-05)
- **UX:** Export dropdown z listą wszystkich bibliotek

### v0.8.2 (2025-01-05)
- **FIX:** WeakMap cache nie był czyszczony po restore

### v0.8.1 (2025-01-05)
- **QUALITY:** TypeScript improvements merge

### v0.8.0 (2025-01-05)
- **FEAT:** Eksport do Figmy

---

## 🎯 NASTĘPNY KROK

**Przetestować v0.8.8 disconnect/restore:**
1. Import REZZON + wszystkie biblioteki R4-*
2. Sprawdzić External count (powinno być ~1115)
3. Disconnect R4-Spacing-Scale
4. Sprawdzić External count (powinno spaść o ~360)
5. Restore R4-Spacing-Scale
6. Sprawdzić External count (powinno wrócić do ~1115)
7. **Eksportować JSON i porównać variableId przed/po** ← KLUCZOWE!

Jeśli variableId są identyczne → BUG NAPRAWIONY ✅
