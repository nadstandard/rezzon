# REZZON Studio – Roadmapa implementacji v2

**Status:** v0.6.3 (Faza 5 w toku, Faza 6 zakończona)
**Data:** 2025-12-30

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

### Faza 5 – Aliasy (CZĘŚCIOWO)
- [x] 5.3 Alias Manager (widok Aliases)
  - [x] Lista wszystkich aliasów
  - [x] Tabs: All / Internal / External / Broken
  - [x] Tabela: Source → Target, Type
  - [x] Connected External Libraries section
  - [x] Statystyki (internal/external/broken count)
  - [x] Alias Details panel (fixed position)
- [ ] 5.1 Alias Picker (single) — TODO
- [ ] 5.2 Bulk Alias — TODO
- [ ] 5.4 Disconnect — TODO
- [ ] 5.5 Restore — TODO

### Faza 6 – UNDO/REDO (DONE)
- [x] Stack past/future w store
- [x] Limit 30 kroków
- [x] Obsługiwane operacje: rename, delete, alias, bulkRename, duplicateFolder, removeAlias
- [x] Przyciski Undo/Redo w toolbarze (aktywne/disabled)
- [x] Dynamiczne tooltips z opisem operacji
- [x] Skróty klawiszowe: ⌘Z / ⌘⇧Z / ⌘Y

---

## 🔄 BLOK 1: Core MVP (W TOKU)
┌─────────────────────────────────────────────────────────────┐
│  🧪 TEST CHECKPOINT #1                                      │
├─────────────────────────────────────────────────────────────┤
│  Zakres: Selekcja, search, filtry                           │
│  Cel: Sprawdzić czy interakcje działają płynnie             │
│                                                             │
│  Checklistka:                                               │
│  □ Zaznaczanie pojedyncze i multi-select                    │
│  □ Search filtruje wyniki live                              │
│  □ Filtry działają osobno i łącznie                         │
│  □ Details panel pokazuje poprawne dane                     │
│  □ Sync sidebar ↔ tabela                                    │
│                                                             │
│  🎨 UI feedback: TAK – zgłoś drobne uwagi wizualne          │
│     (zostaną zebrane, ale NIE blokują dalszej pracy)        │
└─────────────────────────────────────────────────────────────┘
```

---

### Faza 5 – Aliasy (W TOKU)

**Zrealizowane:**
- [x] 5.3 Alias Manager (widok Aliases)

**Do zrobienia:**

#### 5.1 Alias Picker (single)
- [ ] Kliknięcie na komórkę wartości → picker
- [ ] Search w pickerze
- [ ] Lista zmiennych tego samego typu
- [ ] Kontekst (sąsiednie zmienne)
- [ ] Podział: internal / external

#### 5.2 Bulk Alias
- [ ] Modal bulk alias
- [ ] Wybór source folder
- [ ] Wybór target library/collection
- [ ] Wybór modes (kolumn) do zastosowania
- [ ] Matchowanie po nazwie
- [ ] Lista niezmatchowanych po operacji

#### 5.4 Disconnect
- [ ] Wybór biblioteki do odłączenia
- [ ] Modal: "Z którego mode'a wziąć resolved values?"
- [ ] Zamiana aliasów na wartości
- [ ] Zapis do `disconnectedLibraries`

#### 5.5 Restore
- [ ] Lista odłączonych bibliotek w sidebar
- [ ] Modal restore z preview
- [ ] "X aliasów zostanie przywróconych, Y będzie broken"
- [ ] All-or-nothing per library

```
┌─────────────────────────────────────────────────────────────┐
│  🧪 TEST CHECKPOINT #3                                      │
├─────────────────────────────────────────────────────────────┤
│  Zakres: Aliasy                                             │
│  Cel: Pełny flow aliasowania                                │
│                                                             │
│  Checklistka:                                               │
│  □ Single alias picker działa                               │
│  □ Bulk alias matchuje po nazwie                            │
│  □ Niezmatchowane są raportowane                            │
│  □ Alias Manager wyświetla wszystko                         │
│  □ Disconnect zamienia na resolved values                   │
│  □ Restore przywraca aliasy                                 │
│                                                             │
│  🎨 UI feedback: TAK – zbieramy uwagi                       │
└─────────────────────────────────────────────────────────────┘
```

---

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

#### 8.4 Import sesji
- [ ] Rozpoznawanie typu pliku (Figma vs Session)
- [ ] Restore pełnego stanu z sesji

```
┌─────────────────────────────────────────────────────────────┐
│  🧪 TEST CHECKPOINT #4 – MVP COMPLETE                       │
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
│  🎨 UI feedback: TAK – PEŁNY PRZEGLĄD UI                    │
│     (to jest moment na zebranie wszystkich uwag wizualnych) │
│                                                             │
│  ⚠️  DECISION POINT: Czy MVP jest wystarczający?            │
│      Można wdrożyć do użytku lub kontynuować do Bloku 2     │
└─────────────────────────────────────────────────────────────┘
```

---

## 🔄 BLOK 2: Bezpieczeństwo i wydajność

### Faza 6 – UNDO/REDO (Est. 2 dni)

#### 6.1 Historia operacji
- [ ] Stack past/future w store
- [ ] Limit 20-30 kroków
- [ ] Obsługiwane operacje: rename, delete, alias, disconnect

#### 6.2 UI
- [ ] Przyciski Undo/Redo w toolbarze (aktywne/disabled)
- [ ] Skróty klawiszowe: ⌘Z / ⌘⇧Z
- [ ] Tooltip z opisem operacji do cofnięcia

---

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

#### 7.4 Compare (opcjonalne)
- [ ] Compare snapshot vs current
- [ ] Lista zmian

---

### Faza 9 – Wirtualizacja (Est. 2-3 dni)

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
│                                                             │
│  🎨 UI feedback: Tylko krytyczne                            │
└─────────────────────────────────────────────────────────────┘
```

---

## 🔄 BLOK 3: Polish

### Faza 10 – Persystencja (Est. 1-2 dni)
- [ ] IndexedDB (Dexie.js)
- [ ] Auto-save przy zmianach
- [ ] Restore stanu przy starcie
- [ ] Zapamiętywanie: expanded folders, filters, selected library

---

### Faza 11 – Skróty klawiszowe (Est. 1 dzień)
- [ ] ⌘K – fokus na search
- [ ] ⌘Z / ⌘⇧Z – undo/redo
- [ ] Delete – usuń zaznaczone
- [ ] Enter – rename
- [ ] ⌘A – select all
- [ ] Esc – close modal / clear selection

---

### Faza 12 – Polish & QA (Est. 2-3 dni)

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

#### 12.5 🎨 UI Fixes
- [ ] Wszystkie zebrane uwagi z poprzednich checkpointów
- [ ] Przegląd spójności wizualnej
- [ ] Responsywność (opcjonalne)

```
┌─────────────────────────────────────────────────────────────┐
│  🧪 TEST CHECKPOINT #6 – FINAL                              │
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
│                                                             │
│  🎨 UI feedback: OSTATECZNE POPRAWKI                        │
└─────────────────────────────────────────────────────────────┘
```

---

## 📋 STRATEGIA ZBIERANIA FEEDBACKU UI

### Kiedy zgłaszać uwagi?

| Typ uwagi | Kiedy zgłaszać | Kiedy naprawiać |
|-----------|----------------|-----------------|
| 🔴 **Blocker** (nie można kontynuować) | NATYCHMIAST | NATYCHMIAST |
| 🟠 **Funkcjonalne** (działa źle) | Na checkpoincie | Przed kolejną fazą |
| 🟡 **Wizualne** (wygląda źle) | Na checkpoincie | Faza 12 (Polish) |
| 🟢 **Nice-to-have** (pomysły) | Kiedykolwiek | Backlog |

### Jak zgłaszać?

Najlepiej jako lista:
```
## UI Feedback – Checkpoint #X

### 🟠 Funkcjonalne
- Checkbox nie zmienia stanu po kliknięciu
- Filter badge nie znika po reset

### 🟡 Wizualne
- Za mały padding w headerze tabeli
- Kolor hover na przyciskach za jasny
- Ikona "Folder" powinna być wypełniona

### 🟢 Nice-to-have
- Może dodać animację przy expand?
```

### Rekomendacja

**Zgłaszaj uwagi na bieżąco** (zapisuj je), ale **nie blokuj pracy** na drobnych wizualnych problemach. Faza 12 jest specjalnie zarezerwowana na:
1. Naprawę wszystkich zebranych uwag UI
2. Spójny przegląd całości
3. Dopracowanie detali

Wyjątek: Jeśli coś jest **tak złe wizualnie, że utrudnia testowanie funkcjonalności** – naprawiamy od razu.

---

## 📊 PODSUMOWANIE

| Blok | Fazy | Estymacja | Checkpointy |
|------|------|-----------|-------------|
| **MVP** | 3, 4, 5, 8 | 10-14 dni | #1, #2, #3, #4 |
| **Safety** | 6, 7, 9 | 6-8 dni | #5 |
| **Polish** | 10, 11, 12 | 4-6 dni | #6 |

**Łącznie:** ~20-28 dni roboczych

---

## 🎯 NASTĘPNY KROK

**Faza 5: Dokończenie Aliasów (5.1, 5.2, 5.4, 5.5)**

Priorytet: Disconnect/Restore (5.4, 5.5)

---

## 📋 CHANGELOG

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
