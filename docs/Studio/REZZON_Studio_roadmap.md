# REZZON Studio — Roadmapa implementacji

**Status:** v0.5.0 (Faza 5 ukończona, Checkpoint #3 w trakcie)  
**Data aktualizacji:** 2025-12-29

---

## 📊 PRZEGLĄD POSTĘPU

| Blok | Fazy | Status | Checkpointy |
|------|------|--------|-------------|
| **Setup** | 1, 2 | ✅ DONE | — |
| **Core** | 3, 4, 5 | ✅ DONE | #1 ✅, #2 ✅, #3 🔄 |
| **Safety** | 6, 7, 8, 9 | ⏳ TODO | #4, #5 |
| **Polish** | 10, 11, 12 | ⏳ TODO | #6 |

**Pozostało:** ~12-18 dni roboczych

---

## ✅ ZREALIZOWANE

### Faza 1 — Szkielet ✅
- [x] Vite + React + TypeScript setup
- [x] CSS z makiet (design-system.css)
- [x] Layout (Header, Sidebar, Main, Panel, Statusbar)
- [x] Routing (Variables / Aliases / Snapshots)
- [x] Zustand store z podstawowymi akcjami
- [x] TypeScript types dla Figma Variables

### Faza 2 — Import i wyświetlanie ✅
- [x] Parser JSON z eksportu Figma Variables
- [x] Modal importu z drag & drop
- [x] Walidacja plików przed importem
- [x] Wyświetlanie bibliotek i kolekcji w sidebar
- [x] Hierarchia folderów w tabeli
- [x] Expand/Collapse folderów
- [x] Ikony typów (FLOAT, STRING, BOOLEAN, COLOR)
- [x] Wyświetlanie wartości (kolory z podglądem + HEX)
- [x] Wyświetlanie aliasów (internal/external/broken)
- [x] Clear Workspace z modalem potwierdzenia
- [x] Kolejność bibliotek (REZZON na górze, R4-* numerycznie)
- [x] Auto-select pierwszej kolekcji
- [x] Kolejność folderów jak w Figmie

### Faza 3 — Selekcja + Search + Filtry ✅
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
- [x] Details Panel — pełna zawartość
- [x] Drzewo folderów w sidebarze z checkboxami

**Test Checkpoint #1:** ✅ PASSED (v0.3.3)

### Faza 4 — Operacje CRUD ✅
- [x] Rename (single) — double-click → inline edit, Enter/Esc
- [x] Walidacja: pusta nazwa, duplikaty, "/" w nazwie
- [x] Animacja shake przy błędzie
- [x] Rename (bulk) — modal z Match/Replace, live preview
- [x] Obsługa regex w bulk rename
- [x] Wykrywanie konfliktów przed zatwierdzeniem
- [x] Delete — modal potwierdzenia z liczbą zmiennych
- [x] Ostrzeżenie o aliasach które staną się broken
- [x] Duplicate folder — kopiowanie z automatycznym sufiksem " 2", " 3"
- [x] Aliasy w kopiach wskazują na oryginalne zmienne

**Test Checkpoint #2:** ✅ PASSED (v0.4.0)

### Faza 5 — Aliasy ✅
- [x] Alias Manager — widok wszystkich aliasów
- [x] Tabs: All / Internal / External / Broken z licznikami
- [x] Summary card ze statystykami
- [x] Library cards z statystykami per biblioteka
- [x] Connected External Libraries grid
- [x] Tabela aliasów z checkboxami i akcjami
- [x] Filtrowanie i wyszukiwanie aliasów
- [x] Detail Panel dla aliasów (flow source→target)
- [x] Empty states (no aliases, no broken, no search results)
- [x] Alias Picker (UI komponent)
- [x] Bulk Alias Modal (Configure → Preview → Result)
- [x] Disconnect Modal (wybór mode dla resolved values)
- [x] Restore Modal (preview: X restored, Y broken)
- [x] Store actions: setAlias, removeAlias, bulkAlias
- [x] Store actions: disconnectLibrary, restoreLibrary

**Test Checkpoint #3:** 🔄 PARTIAL PASS (v0.5.0) — 94.7% pass, wymaga napraw

---

## 🐛 AKTYWNE BUGI (z Checkpoint #3)

### 🔴 Krytyczne (blokujące)

| ID | Opis | Status |
|----|------|--------|
| BUG-5.8.9 | Disconnect modal tylko loguje, nie wywołuje store.disconnectLibrary() | TODO |
| BUG-5.9.8 | Restore modal tylko loguje, nie wywołuje store.restoreLibrary() | TODO |

### 🟡 Średnie

| ID | Opis | Status |
|----|------|--------|
| BUG-5.2.12 | Przyciski akcji w tabeli aliasów (Eye, Link2Off) nie mają onClick handlers | TODO |
| BUG-5.7.13 | Przyciski View/Change i Disconnect w Detail Panel nie działają | TODO |
| BUG-5.7.14 | Przyciski Fix i Disconnect dla broken alias w Detail Panel nie działają | TODO |

### 📝 Known Limitations

| ID | Opis | Priorytet |
|----|------|-----------|
| KL-5.10 | AliasPicker nie jest podpięty do widoku Variables | Medium |
| KL-5.11 | BulkAliasModal nie ma triggera w UI (brak przycisku w toolbarze Variables) | Medium |
| BUG-4.4.1 | Duplicate działa tylko dla folderów bez subfolderów | Medium |

---

## 📝 NICE-TO-HAVE (Faza 12)

| ID | Opis | Źródło |
|----|------|--------|
| FR-1 | Kwadracik koloru w Details Panel | Checkpoint #1 |
| FR-2 | Poprawić UX drzewa folderów w sidebarze | Checkpoint #1 |
| FR-3 | Details Panel: Alias Target — rozwiązywać nazwy dla external | Checkpoint #1 |
| FR-4 | Przycisk Copy przy Path w Details Panel | Checkpoint #1 |

---

## 🔄 DO ZROBIENIA

### Faza 6 — UNDO/REDO (Est. 2 dni)

#### 6.1 Historia operacji
- [ ] Stack past/future w store
- [ ] Limit 20-30 kroków
- [ ] Obsługiwane operacje: rename, delete, alias, disconnect

#### 6.2 UI
- [ ] Przyciski Undo/Redo w toolbarze (aktywne/disabled)
- [ ] Skróty klawiszowe: ⌘Z / ⌘⇧Z
- [ ] Tooltip z opisem operacji do cofnięcia

---

### Faza 7 — Snapshots (Est. 2-3 dni)

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

#### 7.4 Compare (opcjonalne)
- [ ] Compare snapshot vs current
- [ ] Lista zmian

---

### Faza 8 — Eksport (Est. 2-3 dni)

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

```
┌─────────────────────────────────────────────────────────────┐
│  🧪 TEST CHECKPOINT #4 — MVP COMPLETE                       │
├─────────────────────────────────────────────────────────────┤
│  Zakres: Pełny flow Import → Edycja → Eksport               │
│  Cel: End-to-end test z prawdziwymi danymi REZZON           │
│                                                             │
│  Checklistka:                                               │
│  □ Import REZZON + R4-* bibliotek                           │
│  □ Rename, alias, delete                                    │
│  □ Eksport do Figmy                                         │
│  □ Import eksportu do Figmy (via plugin)                    │
│  □ Eksport/import sesji                                     │
│                                                             │
│  ⚠️  DECISION POINT: Czy MVP jest wystarczający?            │
└─────────────────────────────────────────────────────────────┘
```

---

### Faza 9 — Wirtualizacja (Est. 2-3 dni)

#### 9.1 Wirtualizacja tabeli
- [ ] @tanstack/react-virtual
- [ ] Płynne przewijanie przy 8.5k+ wierszy
- [ ] Expand All bez lag

#### 9.2 Optymalizacje
- [ ] React.memo dla komponentów
- [ ] Debounce dla search/filter
- [ ] Lazy loading

```
┌─────────────────────────────────────────────────────────────┐
│  🧪 TEST CHECKPOINT #5                                      │
├─────────────────────────────────────────────────────────────┤
│  Zakres: UNDO/REDO, Snapshots, Wydajność                    │
│  Cel: Stress test z pełnym REZZON (~8.5k zmiennych)         │
│                                                             │
│  Checklistka:                                               │
│  □ UNDO/REDO działa dla wszystkich operacji                 │
│  □ Snapshots tworzą się i przywracają                       │
│  □ Expand All przy 8.5k zmiennych < 1s                      │
│  □ Scroll płynny (60fps)                                    │
│  □ Search/filter responsywne                                │
└─────────────────────────────────────────────────────────────┘
```

---

### Faza 10 — Persystencja (Est. 1-2 dni)
- [ ] IndexedDB (Dexie.js)
- [ ] Auto-save przy zmianach
- [ ] Restore stanu przy starcie
- [ ] Zapamiętywanie: expanded folders, filters, selected library

---

### Faza 11 — Skróty klawiszowe (Est. 1 dzień)
- [ ] ⌘K — fokus na search
- [ ] ⌘Z / ⌘⇧Z — undo/redo
- [ ] Delete — usuń zaznaczone
- [ ] Enter — rename
- [ ] ⌘A — select all
- [ ] Esc — close modal / clear selection

---

### Faza 12 — Polish & QA (Est. 2-3 dni)

#### 12.1 Empty states
- [ ] Pusty projekt
- [ ] Pusta kolekcja
- [ ] Brak wyników search
- [ ] Brak snapshotów

#### 12.2 Loading states
- [ ] Spinner przy imporcie
- [ ] Skeleton dla tabeli

#### 12.3 Error states
- [ ] Błąd importu
- [ ] Błąd walidacji
- [ ] Konflikt nazw

#### 12.4 UX
- [ ] Tooltips
- [ ] Toast notifications
- [ ] Animacje

#### 12.5 UI Fixes
- [ ] Wszystkie zebrane uwagi z poprzednich checkpointów
- [ ] Nice-to-have (FR-1 do FR-4)
- [ ] Known Limitations
- [ ] Przegląd spójności wizualnej

```
┌─────────────────────────────────────────────────────────────┐
│  🧪 TEST CHECKPOINT #6 — FINAL                              │
├─────────────────────────────────────────────────────────────┤
│  Zakres: Kompletna aplikacja                                │
│  Cel: Produkcyjne użycie                                    │
│                                                             │
│  Checklistka:                                               │
│  □ Pełny flow z prawdziwymi danymi                          │
│  □ Wszystkie edge cases                                     │
│  □ Performance OK                                           │
│  □ UI spójne i dopracowane                                  │
│  □ Brak błędów w konsoli                                    │
└─────────────────────────────────────────────────────────────┘
```

---

## 📜 CHANGELOG

### v0.5.0 (2025-12-29)
- ✅ Faza 5: Aliasy
- Alias Manager z tabs i statystykami
- Library cards z per-library stats
- Connected External Libraries grid
- Alias Detail Panel z flow visualization
- Empty states dla różnych stanów
- Bulk Alias Modal (3 kroki)
- Disconnect/Restore modals
- Store actions dla aliasów
- 🔄 Checkpoint #3: PARTIAL PASS (94.7%)

### v0.4.0 (2025-12-29)
- ✅ Faza 4: Operacje CRUD
- Inline rename (double-click, walidacja, shake)
- Bulk rename (Match/Replace, regex, preview)
- Delete z potwierdzeniem i warning o broken aliases
- Duplicate folder z auto-sufiksem
- ✅ Checkpoint #2: PASSED

### v0.3.3 (2025-12-29)
- ✅ Checkpoint #1: PASSED
- Fix: Kolejność bibliotek (REZZON na górze, R4-* numerycznie)
- Fix: Shift+click range selection

### v0.3.2 (2025-12-29)
- Fix: Kolory — obsługa formatu hex/rgba z Figmy

### v0.3.1 (2025-12-29)
- Fix: Aliasy external — obsługa variableName/collectionName
- Fix: Auto-select pierwszej kolekcji
- Fix: Kolejność folderów jak w Figmie
- Fix: Checkbox folderów
- Fix: Select All wszystkie zmienne
- Fix: Drzewo folderów w sidebarze

### v0.3.0 (2025-12-24)
- ✅ Faza 3: Selekcja, Search, Filtry
- Checkboxy i multi-select
- Live search
- Dropdown filtrów
- Details Panel

### v0.2.0 (2025-12-24)
- ✅ Faza 2: Import i wyświetlanie
- Parser JSON
- Modal importu
- Hierarchia folderów
- Typy i wartości

### v0.1.0 (2025-12-24)
- ✅ Faza 1: Szkielet
- Vite + React + TypeScript
- Layout i routing
- Zustand store

---

## 🎯 NASTĘPNY KROK

1. **Naprawić bugi z Checkpoint #3** (BUG-5.8.9, BUG-5.9.8 — krytyczne)
2. **Re-test Checkpoint #3**
3. **Faza 6: UNDO/REDO**
