# REZZON Studio – Roadmapa implementacji v3

**Status:** v0.3.0 (Checkpoint #1 zakończony)
**Data:** 2025-12-29

---

## ✅ ZREALIZOWANE

### Faza 1 – Szkielet (DONE) ✅
- [x] Vite + React + TypeScript setup
- [x] CSS z makiet (design-system.css)
- [x] Layout (Header, Sidebar, Main, Panel, Statusbar)
- [x] Routing (Variables / Aliases / Snapshots)
- [x] Zustand store z podstawowymi akcjami
- [x] TypeScript types dla Figma Variables

### Faza 2 – Import i wyświetlanie (DONE z bugami)
- [x] Parser JSON z eksportu Figma Variables
- [x] Modal importu z drag & drop
- [x] Walidacja plików przed importem
- [x] Wyświetlanie bibliotek i kolekcji w sidebar
- [x] Hierarchia folderów w tabeli
- [x] Expand/Collapse folderów
- [x] Ikony typów (FLOAT, STRING, BOOLEAN, COLOR)
- [x] Wyświetlanie wartości liczbowych i boolean
- [x] Wyświetlanie aliasów internal
- [x] Clear Workspace z modalem potwierdzenia
- [ ] ⚠️ Wyświetlanie wartości COLOR (BUG 2.12.1)
- [ ] ⚠️ Wyświetlanie aliasów external (BUG 2.14.1)

### Faza 3 – Selekcja + Search + Filtry (DONE z bugami)
- [x] Checkbox w wierszach zmiennych
- [x] Checkbox "select all" w headerze tabeli (z indeterminate)
- [x] Floating selection bar ("X selected" + akcje)
- [x] Kliknięcie na wiersz toggle'uje zaznaczenie
- [x] Live search w headerze
- [x] Filtrowanie wyników w tabeli
- [x] Podświetlanie dopasowań (highlight)
- [x] Empty state "No variables match"
- [x] Dropdown filtrów w toolbarze
- [x] Filtry by type: Number / Boolean / String / Color
- [x] Filtry by alias: No alias / Internal / External / Broken
- [x] Kombinowanie filtrów (AND logic)
- [x] Badge z liczbą aktywnych filtrów
- [x] Liczniki przy każdej opcji filtra
- [x] Zamykanie dropdown po kliknięciu poza
- [x] Przycisk "Clear all"
- [x] Details Panel toggle
- [x] Details Panel: Name, Path, Type, Alias target, Values per mode
- [x] Multi-select → podsumowanie
- [x] Empty state "Select a variable"
- [ ] ⚠️ Checkbox folderów nie działa (BUG 3.1.1)
- [ ] ⚠️ Select All tylko dla rozwiniętych folderów (BUG 3.1.2)
- [ ] ⚠️ Shift+click nie zaznacza zakresu (BUG 3.1.4)
- [ ] ⚠️ Brak drzewa folderów w sidebarze (BUG 3.1.8)

---

## 🐛 BUGI Z CHECKPOINTU #1

### 🔴 BLOCKERY (naprawić przed Fazą 4)

| ID | Opis | Faza |
|----|------|------|
| 2.12.1 | Wartości COLOR wyświetlają się jako "-" zamiast podglądu koloru + HEX | 2 |
| 2.14.1 | Aliasy external nie działają — pokazują ID lub "unknown" zamiast nazwy | 2 |

### 🟠 FUNKCJONALNE (naprawić przed MVP)

| ID | Opis | Faza |
|----|------|------|
| 2.6.1 | Niespójny i rozstrzelony widok tabeli folderów | 2 |
| 2.6.2 | Wybranie biblioteki nie wybiera automatycznie pierwszej kolekcji | 2 |
| 2.10.1 | Foldery sortowane alfabetycznie zamiast kolejności z Figmy | 2 |
| 3.1.1 | Checkbox folderów nie działa (nie zaznacza zmiennych wewnątrz) | 3 |
| 3.1.2 | Select All zaznacza tylko zmienne w rozwiniętych folderach | 3 |
| 3.1.4 | Shift+click nie zaznacza zakresu | 3 |
| 3.1.8 | Brak drzewa folderów w sidebarze (sekcja FOLDERS pusta) | 3 |

### 🟡 WIZUALNE (do Fazy 12)

| ID | Opis | Faza |
|----|------|------|
| 2.1.1 | Kolejność bibliotek towarzyszących (4,3,2,1,5 zamiast 1,2,3,4,5) | 2 |
| 2.4.1 | Brak rozróżnienia ikon biblioteki głównej vs towarzyszących | 2 |
| 3.2.5 | Brak możliwości ograniczenia zakresu wyszukiwania do folderu | 3 |
| 3.4.3a | Niespójna interpunkcja w ścieżce Path (spacja tylko przy Collection) | 3 |

### 🟢 FEATURE REQUESTS

| ID | Opis | Faza |
|----|------|------|
| 3.4.3b | Przycisk Copy przy Path w Details Panel | 3 |

---

## 🔧 FAZA 3.5 – Naprawy blockerów (Est. 1-2 dni)

### Przed przejściem do Fazy 4 naprawić:

#### 🔴 BUG 2.12.1 – Wartości COLOR
- [ ] Parser poprawnie odczytuje wartości RGBA z JSON
- [ ] Komórka wyświetla kwadracik z kolorem + wartość HEX
- [ ] Obsługa przezroczystości (alpha)

#### 🔴 BUG 2.14.1 – Aliasy external
- [ ] Parser rozpoznaje aliasy do zewnętrznych bibliotek
- [ ] Wyświetlanie nazwy zmiennej zamiast ID
- [ ] Rozróżnienie wizualne: internal (zielone) vs external (pomarańczowe)
- [ ] Obsługa "broken" aliasów (czerwone)

---

## 🔄 BLOK 1: Core MVP

### Faza 4 – Operacje CRUD (Est. 3-4 dni)

#### 4.1 Rename (single)
- [ ] Double-click na nazwie → inline edit
- [ ] Enter = zatwierdź, Esc = anuluj
- [ ] Walidacja (brak duplikatów, poprawne znaki)
- [ ] Propagacja do aliasów

#### 4.2 Rename (bulk)
- [ ] Modal bulk rename
- [ ] Pole "Match" (regex/string)
- [ ] Pole "Replace with"
- [ ] Preview zmian przed zatwierdzeniem
- [ ] Lista konfliktów (jeśli są)

#### 4.3 Delete
- [ ] Usuwanie zaznaczonych zmiennych/folderów
- [ ] Modal potwierdzenia z podglądem konsekwencji
- [ ] Info o broken aliasach które powstaną

#### 4.4 Duplicate folder
- [ ] Duplikacja folderu z zawartością
- [ ] Automatyczny sufiks " 2"
- [ ] Aliasy wskazują na oryginały

```
┌─────────────────────────────────────────────────────────────┐
│  🧪 TEST CHECKPOINT #2                                      │
├─────────────────────────────────────────────────────────────┤
│  Zakres: Operacje CRUD                                      │
│  Cel: Sprawdzić czy edycja danych działa poprawnie          │
│                                                             │
│  Checklistka:                                               │
│  □ Inline rename działa                                     │
│  □ Bulk rename z Match/Replace                              │
│  □ Delete z potwierdzeniem                                  │
│  □ Duplicate folder tworzy kopię                            │
│  □ Aliasy aktualizują się po rename                         │
│  □ Konflikty są wykrywane i blokowane                       │
│                                                             │
│  🎨 UI feedback: TAK – zbieramy uwagi                       │
└─────────────────────────────────────────────────────────────┘
```

---

### Faza 5 – Aliasy (Est. 3-4 dni)

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

#### 5.3 Alias Manager (widok Aliases)
- [ ] Lista wszystkich aliasów
- [ ] Tabs: All / Internal / External / Broken
- [ ] Tabela: Source → Target, Type, Mode
- [ ] Connected External Libraries section
- [ ] Statystyki (internal/external/broken count)

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

#### 12.5 🎨 UI Fixes z Checkpointu #1
- [ ] BUG 2.1.1: Kolejność bibliotek towarzyszących
- [ ] BUG 2.4.1: Ikony biblioteki głównej vs towarzyszących
- [ ] BUG 3.2.5: Zakres wyszukiwania do folderu
- [ ] BUG 3.4.3a: Interpunkcja w ścieżce Path
- [ ] FR 3.4.3b: Przycisk Copy przy Path

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

## 📊 PODSUMOWANIE

| Blok | Fazy | Estymacja | Checkpointy | Status |
|------|------|-----------|-------------|--------|
| **Naprawy** | 3.5 | 1-2 dni | - | 🔄 NEXT |
| **MVP** | 4, 5, 8 | 8-11 dni | #2, #3, #4 | ⏳ |
| **Safety** | 6, 7, 9 | 6-8 dni | #5 | ⏳ |
| **Polish** | 10, 11, 12 | 4-6 dni | #6 | ⏳ |

**Łącznie:** ~19-27 dni roboczych

---

## 🎯 NASTĘPNY KROK

**Faza 3.5: Naprawy blockerów**

1. BUG 2.12.1 – Wartości COLOR
2. BUG 2.14.1 – Aliasy external

Po naprawie → przejście do Fazy 4 (CRUD).
