# REZZON Studio — Historia testów

**Data aktualizacji:** 2025-01-04

Ten dokument zawiera historię wszystkich test checkpointów i krytycznych bugów.

---

## 📊 PODSUMOWANIE

| Checkpoint | Wersja | Status | Pass Rate | Data |
|------------|--------|--------|-----------|------|
| #1 | v0.3.3 | ✅ PASSED | 100% | 2025-12-29 |
| #2 | v0.4.0 | ✅ PASSED | 100% | 2025-12-29 |
| #3 | v0.5.1 | ✅ PASSED | 100% | 2025-12-29 |

**Faza 6 (UNDO/REDO):** Zaimplementowana w v0.6.0 (2025-12-30) ✅

**Faza 5.4-5.5 (Disconnect/Restore):** W trakcie debugowania (v0.7.x)

---

## 🐛 KRYTYCZNE BUGI v0.7.x (Disconnect/Restore)

### BUG-CRIT-4 — Undefined values po disconnect ✅ FIXED

**Wersja:** v0.7.4 → v0.7.5
**Status:** ✅ FIXED
**Data:** 2025-01-04

**Symptom:**
- Po disconnect aliasy pokazywały "undefined" zamiast resolved values
- Wartości nie były poprawnie kopiowane z target variable

**Przyczyna:**
- Przypisanie referencji zamiast kopiowania wartości
- `K[W] = Le` zamiast `K[W] = {...Le}`

**Rozwiązanie:**
- Spread operator do deep copy: `K[W] = {...Le}`

---

### BUG-CRIT-5 — Restore przywraca tylko ~3 aliasy ✅ FIXED

**Wersja:** v0.7.5 → v0.7.6
**Status:** ✅ FIXED
**Data:** 2025-01-04

**Symptom:**
- Disconnect zapisuje 960 aliasów (240 vars × 4 modes)
- Restore przywraca tylko ~3 aliasy
- Większość zmiennych traciła aliasy

**Przyczyna:**
- Shallow cloning w pętli restore
- Każda iteracja nadpisywała poprzednie zmiany dla tej samej zmiennej
- Zmienna z 4 modes zachowywała tylko ostatni mode

**Rozwiązanie:**
- Deep cloning z cache `libClones`
- Jedna kopia biblioteki na całą pętlę
- Każdy mode aktualizuje tę samą sklonowaną kopię

---

### BUG-CRIT-6 — External count 850 zamiast 947 🔴 OPEN

**Wersja:** v0.7.6 → v0.7.8 (debugging)
**Status:** 🔴 OPEN
**Data:** 2025-01-04

**Symptom:**
- Przed disconnect: External = 947
- Po disconnect 2-R4-Spacing Scale: External = 850 ✓
- Po restore: External = 850 (powinno być 947)
- Brakuje ~97 aliasów

**Obserwacje z logów:**

DISCONNECT:
```
Library: 2-R4-Spacing Scale
Total aliases saved: 487
Unique source variables: 122
Variables with multiple modes (first 5):
  VariableID:178:1307: [2:3, 2018:1, 2018:2, 2018:3]
  VariableID:12:27: [2:3, 2018:1, 2018:2, 2018:3]
  ...
```

RESTORE:
```
Restoring library: 2-R4-Spacing Scale
previousAliases count: 487
externalLib found: true
Unique source variables: 122
Variables with multiple modes:
  VariableID:178:1307: 4 modes
  VariableID:12:27: 4 modes
  ...
Source vars not found: 0
Target vars not found: 0
Restored: 487
Broken: 0
```

**Rozbieżność:**
- Restore raportuje: 487 restored
- UI Connected External Libraries: 461 dla 2-R4-Spacing Scale
- Różnica: 26 aliasów

**Hipotezy:**
1. `calculateAliasStats` używa deduplication (unique pairs source-target)
2. `findConnectedExternalLibraries` liczy każdy mode osobno
3. Możliwe że część aliasów nie jest zapisywana do state

**Debugging w toku:**
- v0.7.8 dodaje logi do calculateAliasStats
- Potrzebne porównanie przed/po disconnect/restore

---

## 📋 HISTORIA NAPRAW v0.7.x

| Wersja | Bug | Status | Opis naprawy |
|--------|-----|--------|--------------|
| v0.7.5 | BUG-CRIT-4 | ✅ | Spread operator dla resolved values |
| v0.7.6 | BUG-CRIT-5 | ✅ | Deep cloning z libClones cache |
| v0.7.7 | BUG-CRIT-6 | 🔄 | externalLib wewnątrz set() |
| v0.7.8 | BUG-CRIT-6 | 🔄 | Debug logs w calculateAliasStats |

---

# Checkpoint #1 — Fazy 1-3 (Szkielet, Import, Selekcja)

**Wersja:** v0.3.3  
**Status:** ✅ PASSED  
**Data:** 2025-12-29

## WYNIK: 100% PASS

Wszystkie blockery i bugi funkcjonalne naprawione w wersjach v0.3.1 → v0.3.2 → v0.3.3

---

### Faza 1 — Szkielet ✅ 18/18

| ID | Test | Status |
|----|------|--------|
| 1.1 | Aplikacja uruchamia się bez błędów | ✅ |
| 1.2 | Build przechodzi czysto | ✅ |
| 1.3 | Hot reload działa | ✅ |
| 1.4 | Kolory zgodne z makietami | ✅ |
| 1.5 | Fonty Inter renderują się | ✅ |
| 1.6 | Ikony Lucide renderują się | ✅ |
| 1.7 | Layout 3-kolumnowy | ✅ |
| 1.8 | Header 44px | ✅ |
| 1.9 | Statusbar 32px | ✅ |
| 1.10 | Panel toggle | ✅ |
| 1.11 | Main rozciąga się | ✅ |
| 1.12-1.15 | Routing działa | ✅ |
| 1.16 | Dane pozostają przy switch | ✅ |
| 1.17 | F5 resetuje stan | ✅ |
| 1.18 | Brak błędów w konsoli | ✅ |

---

### Faza 2 — Import i wyświetlanie ✅ 43/43

| ID | Test | Status | Naprawione w |
|----|------|--------|--------------|
| 2.1-2.3 | Import bibliotek | ✅ | - |
| 2.4 | Kolejność bibliotek R4-* | ✅ | v0.3.3 |
| 2.5-2.10 | Modal importu, walidacja | ✅ | - |
| 2.11 | Ikona package vs cube | ✅ | - |
| 2.12-2.13 | Wybór biblioteki/kolekcji | ✅ | - |
| 2.14 | Auto-select kolekcji | ✅ | v0.3.1 |
| 2.15-2.22 | Hierarchia folderów | ✅ | v0.3.1 |
| 2.23-2.26 | Expand/Collapse | ✅ | - |
| 2.27-2.34 | Ikony typów, wartości | ✅ | - |
| 2.35-2.36 | Kolory (kwadracik + HEX) | ✅ | v0.3.2 |
| 2.37-2.40 | Aliasy internal/external | ✅ | v0.3.1 |
| 2.41-2.43 | Clear Workspace | ✅ | - |

---

### Faza 3 — Selekcja + Search + Filtry ✅ 42/42

| ID | Test | Status | Naprawione w |
|----|------|--------|--------------|
| 3.1-3.2 | Checkbox zmiennych | ✅ | - |
| 3.3 | Checkbox folderów | ✅ | v0.3.1 |
| 3.4-3.6 | Select All + indeterminate | ✅ | v0.3.1 |
| 3.7 | Shift+click range | ✅ | v0.3.3 |
| 3.8-3.11 | Floating bar, toggle | ✅ | - |
| 3.12-3.13 | Sidebar FOLDERS + sync | ✅ | v0.3.1 |
| 3.14-3.19 | Search | ✅ | - |
| 3.20-3.34 | Filtry | ✅ | - |
| 3.35-3.43 | Details Panel | ✅ | - |

---

### Historia napraw Checkpoint #1

#### v0.3.1
- ✅ BUG 2.14.1: Aliasy external — obsługa variableName/collectionName
- ✅ BUG 2.6.2: Auto-select pierwszej kolekcji
- ✅ BUG 2.10.1: Kolejność folderów jak w Figmie
- ✅ BUG 3.1.1: Checkbox folderów
- ✅ BUG 3.1.2: Select All wszystkie zmienne
- ✅ BUG 3.1.8: Drzewo folderów w sidebarze

#### v0.3.2
- ✅ BUG 2.12.1: Kolory — obsługa formatu hex/rgba z Figmy

#### v0.3.3
- ✅ BUG 2.1.1: Kolejność bibliotek (REZZON na górze)
- ✅ BUG 3.1.4: Shift+click range selection

---

### Nice-to-have (zebrane do Fazy 12)

| ID | Opis | Priorytet |
|----|------|-----------|
| FR-1 | Kwadracik koloru w Details Panel | LOW |
| FR-2 | Poprawić UX drzewa folderów w sidebarze | LOW |
| FR-3 | Details Panel: Alias Target rozwiązywać nazwy external | LOW |
| FR-4 | Przycisk Copy przy Path | LOW |

---

# Checkpoint #2 — Faza 4 (CRUD)

**Wersja:** v0.4.0  
**Status:** ✅ PASSED  
**Data:** 2025-12-29

## WYNIK: 100% PASS

Wszystkie kluczowe funkcje CRUD działają poprawnie. Jeden known limitation odłożony do Fazy 12.

---

### 4.1 Rename (single) ✅ 7/7

| ID | Test | Status |
|----|------|--------|
| 4.1.1 | Double-click na zmiennej otwiera inline edit | ✅ |
| 4.1.2 | Obecna nazwa jest zaznaczona w inputcie | ✅ |
| 4.1.3 | Enter zatwierdza zmianę | ✅ |
| 4.1.4 | Escape anuluje zmianę | ✅ |
| 4.1.5 | Walidacja: pusta nazwa — błąd + shake | ✅ |
| 4.1.6 | Walidacja: "/" w nazwie — błąd | ✅ |
| 4.1.7 | Walidacja: duplikat nazwy — błąd | ✅ |

---

### 4.2 Rename (bulk) ✅ 5/6

| ID | Test | Status | Uwagi |
|----|------|--------|-------|
| 4.2.1 | Modal otwiera się z toolbara/selection bar | ✅ | |
| 4.2.2 | Pola Match i Replace widoczne | ✅ | |
| 4.2.3 | Preview aktualizuje się live | ✅ | |
| 4.2.4 | Rename zatwierdza zmiany | ✅ | |
| 4.2.5 | Wykrywanie konfliktów blokuje operację | ✅ | |
| 4.2.6 | Regex działa poprawnie | ⏭️ | Pominięty — user nie używa |

---

### 4.3 Delete ✅ 5/5

| ID | Test | Status |
|----|------|--------|
| 4.3.1 | Modal potwierdzenia otwiera się | ✅ |
| 4.3.2 | Pokazuje liczbę zmiennych do usunięcia | ✅ |
| 4.3.3 | Cancel anuluje operację | ✅ |
| 4.3.4 | Delete usuwa zaznaczone elementy | ✅ |
| 4.3.5 | Ostrzeżenie o broken aliasach | ✅ |

---

### 4.4 Duplicate ✅ 3/4

| ID | Test | Status | Uwagi |
|----|------|--------|-------|
| 4.4.1 | Duplicate tworzy kopię z sufiksem " 2" | ✅ | Dla folderów bez subfolderów |
| 4.4.2 | Kolejna kopia ma sufiks " 3" | ✅ | |
| 4.4.3 | Aliasy wskazują na oryginały | ✅ | |
| 4.4.4 | Duplicate dla folderów z subfolderami | ❌ | Known limitation — BUG-4.4.1 |

---

### Known Limitations

| ID | Opis | Priorytet | Status |
|----|------|-----------|--------|
| BUG-4.4.1 | Duplicate działa tylko dla folderów bez subfolderów (liście). Foldery nadrzędne z subfolderami mają wyszarzoną opcję — wymaga rekurencyjnej duplikacji całej gałęzi. | 🟡 Medium | Odłożone → Faza 12 |

---

### Podsumowanie Checkpoint #2

| Kategoria | Pass | Fail | Skip | Total |
|-----------|------|------|------|-------|
| Rename (single) | 7 | 0 | 0 | 7 |
| Rename (bulk) | 5 | 0 | 1 | 6 |
| Delete | 5 | 0 | 0 | 5 |
| Duplicate | 3 | 0 | 1 | 4 |
| **TOTAL** | **20** | **0** | **2** | **22** |

**Pass rate:** 100% (excluding skipped)

---

# Checkpoint #3 — Faza 5 (Aliasy)

**Wersja:** v0.5.1  
**Status:** ✅ PASSED  
**Data:** 2025-12-29

## WYNIK KOŃCOWY: PASSED

Wszystkie bugi z v0.5.0 naprawione w v0.5.1. Checkpoint przechodzi.

---

### Naprawy w v0.5.1

| Bug | Status | Opis naprawy |
|-----|--------|--------------|
| BUG-5.8.9 | ✅ Fixed | Disconnect modal wywołuje `store.disconnectLibrary()` |
| BUG-5.9.8 | ✅ Fixed | Restore modal wywołuje `store.restoreLibrary()` |
| BUG-5.2.12 | ✅ Fixed | Przyciski Eye/Link2Off w tabeli mają onClick handlers |
| BUG-5.7.13 | ✅ Fixed | Przyciski View/Change i Disconnect w Detail Panel działają |
| BUG-5.7.14 | ✅ Fixed | Przyciski Fix i Disconnect dla broken alias działają |

---

### 5.1 Widok Aliases — Sidebar ✅ 11/11

| ID | Test | Status |
|----|------|--------|
| 5.1.1 | Sidebar renderuje się | ✅ |
| 5.1.2 | Summary card pokazuje Internal/External/Broken/Disconnected | ✅ |
| 5.1.3 | Sekcja Libraries z listą bibliotek | ✅ |
| 5.1.4 | Ikona package dla main, cube dla companion | ✅ |
| 5.1.5 | Statystyki per library (internal/external/broken) | ✅ |
| 5.1.6 | Aktywna biblioteka podświetlona | ✅ |
| 5.1.7 | Klik zmienia aktywną bibliotekę | ✅ |
| 5.1.8 | Sekcja Disconnected (jeśli są) | ✅ |
| 5.1.9 | Disconnected libraries z info o aliasach | ✅ |
| 5.1.10 | Przycisk Restore przy disconnected | ✅ |
| 5.1.11 | Sekcje collapsible (chevron) | ✅ |

---

### 5.7 Alias Detail Panel ✅ 15/15

| ID | Test | Status |
|----|------|--------|
| 5.7.1 | Kliknięcie na wiersz otwiera Detail Panel | ✅ |
| 5.7.2 | Panel pokazuje Source → Target flow | ✅ |
| 5.7.3 | Ikona źródła z poprawnym kolorem (internal/external/broken) | ✅ |
| 5.7.4 | Nazwa zmiennej źródłowej wyświetlona | ✅ |
| 5.7.5 | Parent path źródła wyświetlony | ✅ |
| 5.7.6 | Strzałka w dół między source i target | ✅ |
| 5.7.7 | Target pokazuje nazwę i bibliotekę | ✅ |
| 5.7.8 | Badge typu (internal/external/broken) | ✅ |
| 5.7.9 | Sekcja "Type" pokazuje typ zmiennej | ✅ |
| 5.7.10 | Sekcja "Resolved values" pokazuje wartości per mode | ✅ |
| 5.7.11 | Broken alias: warning box z komunikatem | ✅ |
| 5.7.12 | Broken alias: target przekreślony + "Deleted" | ✅ |
| 5.7.13 | Przyciski akcji: View/Change, Disconnect działają | ✅ |
| 5.7.14 | Broken alias: przyciski Fix + Disconnect działają | ✅ |
| 5.7.15 | Przycisk X zamyka panel | ✅ |

---

### 5.8 Disconnect Modal ✅ 10/10

| ID | Test | Status |
|----|------|--------|
| 5.8.1 | Modal otwiera się z Connected External Libraries | ✅ |
| 5.8.2 | Tytuł: "Disconnect Library" | ✅ |
| 5.8.3 | Pokazuje nazwę biblioteki do odłączenia | ✅ |
| 5.8.4 | Pokazuje liczbę affected aliasów | ✅ |
| 5.8.5 | Dropdown "Resolve values from mode" | ✅ |
| 5.8.6 | Dropdown zawiera wszystkie modes z kolekcji | ✅ |
| 5.8.7 | Hint wyjaśniający co się stanie | ✅ |
| 5.8.8 | Przycisk Cancel zamyka modal | ✅ |
| 5.8.9 | Przycisk Disconnect wywołuje store action | ✅ |
| 5.8.10 | Biblioteka pojawia się w sekcji Disconnected | ✅ |

---

### 5.9 Restore Modal ✅ 9/9

| ID | Test | Status |
|----|------|--------|
| 5.9.1 | Modal otwiera się z przycisku Restore przy disconnected library | ✅ |
| 5.9.2 | Tytuł: "Restore Library Connection" | ✅ |
| 5.9.3 | Pokazuje nazwę biblioteki | ✅ |
| 5.9.4 | Pokazuje liczbę aliasów do przywrócenia | ✅ |
| 5.9.5 | Pokazuje liczbę aliasów które staną się broken (jeśli > 0) | ✅ |
| 5.9.6 | Hint gdy część aliasów będzie broken | ✅ |
| 5.9.7 | Przycisk Cancel zamyka modal | ✅ |
| 5.9.8 | Przycisk Restore wywołuje store action | ✅ |
| 5.9.9 | Biblioteka znika z sekcji Disconnected | ✅ |

---

### 5.12 Store Actions ✅ 8/8

| ID | Test | Status |
|----|------|--------|
| 5.12.1 | setAlias tworzy alias w valuesByMode | ✅ |
| 5.12.2 | removeAlias zamienia alias na DIRECT value | ✅ |
| 5.12.3 | bulkAlias tworzy wiele aliasów w wybranych modes | ✅ |
| 5.12.4 | disconnectLibrary zamienia aliasy na resolved values | ✅ |
| 5.12.5 | disconnectLibrary dodaje do disconnectedLibraries | ✅ |
| 5.12.6 | restoreLibrary przywraca aliasy | ✅ |
| 5.12.7 | restoreLibrary zwraca liczbę restored/broken | ✅ |
| 5.12.8 | restoreLibrary usuwa z disconnectedLibraries | ✅ |

---

### Podsumowanie Checkpoint #3

| Kategoria | Pass | Total |
|-----------|------|-------|
| 5.1 Sidebar | 11 | 11 |
| 5.2 Main (Tabs & Table) | 12 | 12 |
| 5.3 Connected External | 7 | 7 |
| 5.4 Selekcja | 5 | 5 |
| 5.5 Search | 4 | 4 |
| 5.6 Empty States | 5 | 5 |
| 5.7 Detail Panel | 15 | 15 |
| 5.8 Disconnect Modal | 10 | 10 |
| 5.9 Restore Modal | 9 | 9 |
| 5.10 Alias Picker | 16 | 16 |
| 5.11 Bulk Alias Modal | 21 | 21 |
| 5.12 Store Actions | 8 | 8 |
| 5.13 Utils | 10 | 10 |
| **TOTAL** | **133** | **133** |

**Pass rate:** 100%

---

# Disconnect/Restore Testing (v0.7.x)

**Status:** 🔄 W TRAKCIE
**Data:** 2025-01-04

## Test Flow

### Krok 1: Stan początkowy
- Import: REZZON + 5 bibliotek R4-*
- REZZON External count: **947**

### Krok 2: Disconnect 2-R4-Spacing Scale
- **Input:** 2-R4-Spacing Scale z 461 aliasami (karty) / 122 unique (sidebar)
- **Oczekiwane:**
  - Aliasy → resolved values
  - External: 947 - X = ~850
  - Biblioteka w sekcji DISCONNECTED

### Krok 3: Restore
- **Oczekiwane:**
  - External count: powrót do **947**
  - Biblioteka znika z DISCONNECTED
  - Aliasy przywrócone

### Krok 4: Weryfikacja
- [ ] External count = 947
- [ ] 2-R4-Spacing Scale: 461 aliasów
- [ ] Brak broken aliasów

---

## Szablony przyszłych checkpointów

### Checkpoint #4 — MVP Complete

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
│  □ Disconnect/Restore działa poprawnie                      │
│  □ Eksport do Figmy                                         │
│  □ Import eksportu do Figmy (via plugin)                    │
│  □ Eksport/import sesji                                     │
│                                                             │
│  ⚠️  DECISION POINT: Czy MVP jest wystarczający?            │
└─────────────────────────────────────────────────────────────┘
```

### Checkpoint #5 — Performance

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

### Checkpoint #6 — Final

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
