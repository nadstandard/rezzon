# REZZON Studio – Roadmapa implementacji v2

**Status:** v0.2.0 (Faza 2 zakończona)
**Data:** 2025-12-24

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

---

## 🔄 BLOK 1: Core MVP

### Faza 3 – Selekcja + Search + Filtry (Est. 2-3 dni)

#### 3.1 Checkboxy i selekcja
- [ ] Checkbox w wierszach (folder, zmienna)
- [ ] Checkbox "select all" w headerze tabeli
- [ ] Multi-select (Shift+click dla zakresu)
- [ ] Sync checkboxów: sidebar folders ↔ tabela
- [ ] Floating selection bar ("X selected" + akcje)

#### 3.2 Wyszukiwanie
- [ ] Live search w headerze
- [ ] Filtrowanie wyników w tabeli
- [ ] Podświetlanie dopasowań
- [ ] Zakres wyszukiwania (wybrany folder)

#### 3.3 Filtry
- [ ] Dropdown w toolbarze
- [ ] Filtr by type: All / Number / Boolean / String / Color
- [ ] Filtr by alias: All / No alias / Internal / External / Broken
- [ ] Kombinowanie filtrów (AND logic)
- [ ] Badge z liczbą aktywnych filtrów

#### 3.4 Details Panel – pełna implementacja
- [ ] Pełna zawartość: Name, Path, Type, Alias target, Resolved values
- [ ] Kliknięcie na zmienną → pokazuje w panelu
- [ ] Multi-select → pokazuje podsumowanie

```
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

**Faza 3: Selekcja + Search + Filtry**

Po zakończeniu → Test Checkpoint #1 z feedbackiem UI.
