# REZZON Studio – Roadmapa implementacji v4

**Status:** v0.8.7
**Data:** 2025-01-12

---

## 📋 CHANGELOG

### v0.8.8 (2025-01-12)
**FIX: Restore zapisywał lokalne ID zamiast publicznych**
- Disconnect zapisywał `targetVar.id` (lokalne ID z pliku) zamiast `value.variableId` (publiczne ID z Figmy)
- Restore używał bezpośredniego lookup `file.variables[targetVar]` który nie działał dla publicznych ID
- Teraz disconnect zapisuje oryginalne publiczne ID oraz `targetVarName`
- Restore używa `findVariableInLibrary` z `targetVarName` i `targetCollectionName`
- Typ DisconnectedLibrary rozszerzony o pole `targetVarName`

### v0.8.7 (2025-01-12)
**FIX: Disconnect/Restore dla bibliotek z duplikatami nazw zmiennych**
- Problem: Biblioteki jak R4-Spacing-Scale mają kolekcje (Vertical, Horizontal) z identycznymi nazwami zmiennych
- `findVariableInLibrary` fallback po nazwie znajdował ZŁĄ zmienną (z innej kolekcji)
- Dodano nowy indeks `collectionNameIndex` który uwzględnia nazwę kolekcji
- `findVariableInLibrary` teraz przyjmuje opcjonalny parametr `collectionName`
- Disconnect zapisuje `targetCollectionName` w `previousAliases`
- Typ `DisconnectedLibrary` rozszerzony o pole `targetCollectionName`

**FIX: detectFileType nie rozpoznawał formatu REZZON Portal**
- `detectFileType` sprawdzał tylko natywny format Figma (`variableCollections`)
- Dodano obsługę formatu REZZON Portal (`collections` array)

### v0.8.6 (2025-01-05)

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

### Faza 5 – Aliasy (CZĘŚCIOWO)
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
  - 🐛 **BUG-CRIT-6:** FIXED w v0.8.2

### Faza 6 – UNDO/REDO (DONE)
- [x] Stack past/future w store
- [x] Limit 30 kroków
- [x] Obsługiwane operacje: rename, delete, alias, bulkRename, duplicateFolder, removeAlias, disconnect, restore
- [x] Przyciski Undo/Redo w toolbarze (aktywne/disabled)
- [x] Dynamiczne tooltips z opisem operacji
- [x] Skróty klawiszowe: ⌘Z / ⌘⇧Z / ⌘Y

### Faza 8.2 – Eksport do Figmy (DONE)
- [x] Format JSON zgodny z Figma Variables
- [x] Walidacja przed eksportem (błędy/ostrzeżenia)
- [x] Statystyki (variables, aliases)
- [x] Zachowanie oryginalnych ID
- [x] Metadane (data eksportu)
- [x] Download pliku

---

## 🔄 W TOKU / DO ZROBIENIA

### Faza 5 – Aliasy (pozostałe)
- [ ] 5.1 Alias Picker (single) — trigger w Variables view
- [ ] 5.2 Bulk Alias — trigger w UI

### Faza 7 – Snapshots
- [ ] 7.1 Tworzenie (Modal, nazwa + opis)
- [ ] 7.2 Lista i podgląd w sidebar
- [ ] 7.3 Restore z potwierdzeniem

### Faza 8 – Eksport (pozostałe)
- [ ] 8.1 Walidacja przed eksportem (rozszerzona)
- [x] 8.3 Eksport sesji (pełny stan) ✅ v0.8.6
- [x] 8.4 Import sesji ✅ v0.8.6

### Faza 9 – Wirtualizacja
- [ ] @tanstack/react-virtual
- [ ] Wydajność przy 8.5k+ zmiennych

---

## 📋 CHANGELOG

### v0.8.6 (2025-01-05)
- **NEW:** Eksport sesji (Export → Export Session)
  - Zapisuje pełny stan: biblioteki, disconnected, UI
  - Format `REZZON_session_YYYY-MM-DD.json`
- **NEW:** Import sesji
  - Import automatycznie rozpoznaje typ pliku (Figma vs Session)
  - Session file ma badge "SESSION" w preview
  - Przywraca pełny stan workspace
- **IMPROVED:** Export dropdown z sekcjami
  - "Export to Figma" - lista bibliotek
  - "Export Session" - pełny stan

### v0.8.5 (2025-01-05)
- **FIX:** CRITICAL - `findVariableInLibrary` false positive przez short name match
  - `Size/Desktop/ref-10` matchowało `Spacing/Desktop/ref-10` przez `ref-10`
  - Usunięto search by short name (ostatni segment ścieżki)
  - Disconnect teraz rozłącza tylko aliasy do wybranej biblioteki

### v0.8.4 (2025-01-05)
- **FIX:** Restore nie zapisywał `collectionName` dla aliasów
  - Po restore aliasy miały puste collectionName
  - Teraz restore znajduje i zapisuje nazwę kolekcji
- **FIX:** validateForExport pokazywał "0 external"
  - Szukanie po variableId nie działa dla external (różne ID między plikami)
  - Teraz używa `findVariableInLibrary` które szuka też po nazwie

### v0.8.3 (2025-01-05)
- **UX:** Export dropdown z listą wszystkich bibliotek
  - Główna biblioteka (REZZON) zawsze pierwsza
  - Pokazuje liczbę zmiennych przy każdej bibliotece
  - Jasne wskazanie którą bibliotekę eksportujesz

### v0.8.2 (2025-01-05)
- **FIX:** BUG-CRIT-6 — WeakMap cache nie był invalidowany po restore
  - Dodano `clearNameIndexCache()` w `aliasUtils.ts`
  - Cache czyszczony po disconnect i restore
  - External alias count teraz poprawny po restore

### v0.8.1 (2025-01-05)
- **REFACTOR:** Merge poprawek TypeScript z wersji no-context
  - Lepsze typowanie (usunięcie `any`)
  - React anti-patterns: `useEffect` → `useMemo` dla preview
  - Funkcja `collectFolderVariableIds` poza komponentem
  - Poprawki lint: unused variables, catch blocks

### v0.8.0 (2025-01-05)
- **FEAT:** Eksport do Figmy
  - Modal z walidacją (błędy/ostrzeżenia)
  - Statystyki (variables, aliases)
  - Download JSON

### v0.7.8 (2025-01-04)
- **DEBUG:** Dodano logowanie do calculateAliasStats
- **DEBUG:** Sample broken aliases w logach

### v0.7.7 (2025-01-04)
- **FIX:** externalLib pobierany wewnątrz set() w restoreLibrary
- **DEBUG:** Dodano Source/Target vars not found tracking

### v0.7.6 (2025-01-04)
- **FIX:** BUG-CRIT-5 — Deep cloning z libClones cache w restoreLibrary
- **DEBUG:** Dodano logi disconnect/restore z unique vars i modes per var

### v0.7.5 (2025-01-04)
- **FIX:** BUG-CRIT-4 — Spread operator dla resolved values w disconnect
- **FIX:** Obsługa łańcuchów aliasów przy resolve

### v0.7.4 (2025-01-02)
- **FEAT:** Multi-collection disconnect z mode selection per collection

### v0.7.3 (2025-01-02)
- **FIX:** Disconnect/Restore dla multi-collection external libraries

### v0.7.2 (2025-01-02)
- **FIX:** External alias recognition z prefix stripping

### v0.7.0 (2025-01-02)
- **FEAT:** Disconnect library implementation
- **FEAT:** Restore library implementation
- **FEAT:** DisconnectedLibraries w store

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

## 🐛 ZNANE BUGI

### BUG-CRIT-6 (FIXED v0.8.2)
**Problem:** External count po restore: 850 zamiast 947 (brakuje ~97 aliasów)
**Przyczyna:** WeakMap cache w `aliasUtils.ts` nie był czyszczony po restore
**Rozwiązanie:** Dodano `clearNameIndexCache()` wywoływane po disconnect/restore

---

## 🎯 NASTĘPNY KROK

**Eksport sesji (Faza 8.3)** — pozwoli zapisać/wczytać pełny stan workspace
