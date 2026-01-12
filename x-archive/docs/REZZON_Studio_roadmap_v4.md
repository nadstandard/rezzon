# REZZON Studio – Roadmapa implementacji v4

**Status:** v0.7.8 (Faza 5 w toku — debugging Disconnect/Restore)
**Data:** 2025-01-04

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

### Faza 6 – UNDO/REDO (DONE)
- [x] Stack past/future w store
- [x] Limit 30 kroków
- [x] Obsługiwane operacje: rename, delete, alias, bulkRename, duplicateFolder, removeAlias, disconnect, restore
- [x] Przyciski Undo/Redo w toolbarze (aktywne/disabled)
- [x] Dynamiczne tooltips z opisem operacji
- [x] Skróty klawiszowe: ⌘Z / ⌘⇧Z / ⌘Y

---

## 🔄 W TOKU

### Faza 5 – Aliasy (W TOKU — debugging)

#### Zrealizowane:
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

#### 🐛 Aktywne bugi:
- [ ] **BUG-CRIT-6:** External count po restore: 850 zamiast 947 (brakuje ~97 aliasów)
  - Disconnect zapisuje 487 aliasów (122 unique vars × 4 modes)
  - Restore raportuje restored=487
  - Ale UI pokazuje tylko 461 dla tej biblioteki
  - calculateAliasStats vs findConnectedExternalLibraries liczą różnie

#### Do zrobienia:
- [ ] 5.1 Alias Picker (single) — trigger w Variables view
- [ ] 5.2 Bulk Alias — trigger w UI

---

## 📋 HISTORIA BUGÓW FAZY 5

### BUG-CRIT-4 (FIXED v0.7.5)
**Problem:** Po disconnect wartości pokazywały "undefined" zamiast resolved values
**Przyczyna:** Niepoprawne kopiowanie wartości z target variable
**Rozwiązanie:** Spread operator `{...Le}` zamiast przypisania referencji

### BUG-CRIT-5 (FIXED v0.7.6)
**Problem:** Restore przywracał tylko ~3 aliasy zamiast ~960
**Przyczyna:** Shallow cloning w pętli nadpisywał zmiany dla zmiennych z wieloma modes
**Rozwiązanie:** Deep cloning z libClones cache

### BUG-CRIT-6 (OPEN v0.7.8)
**Problem:** External count 850 zamiast 947 po restore
**Obserwacje:**
- Disconnect: 487 aliasów (122 vars × 4 modes avg)
- Restore logs: restored=487, broken=0
- UI pokazuje: 461 aliasów dla 2-R4-Spacing Scale
- Różnica: 26 aliasów ginie między restore a UI

**Hipoteza:** Problem w sposobie liczenia (calculateAliasStats używa deduplication po parach source-target)

---

## 📊 DO ZROBIENIA

### Faza 8 – Eksport (Po naprawie bugów)

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

#### 8.4 Import sesji
- [ ] Rozpoznawanie typu pliku (Figma vs Session)
- [ ] Restore pełnego stanu z sesji

---

### Faza 7 – Snapshots

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

---

### Faza 9 – Wirtualizacja

#### 9.1 Wirtualizacja tabeli
- [ ] @tanstack/react-virtual
- [ ] Płynne przewijanie przy 8.5k+ wierszy
- [ ] Expand All bez lag

#### 9.2 Optymalizacje
- [ ] React.memo dla komponentów
- [ ] Debounce dla search/filter
- [ ] Lazy loading

---

## 📋 CHANGELOG

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

## 🎯 NASTĘPNY KROK

**Naprawić BUG-CRIT-6:** Zbadać różnicę między disconnect (487) a UI display (461)

Potrzebne testy:
1. Logi calculateAliasStats przed disconnect
2. Logi calculateAliasStats po disconnect
3. Logi calculateAliasStats po restore
4. Porównanie z findConnectedExternalLibraries
