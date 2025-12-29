# REZZON Studio – Arkusz testowy Checkpoint #3

**Wersja:** v0.5.0
**Data:** 2025-12-29
**Checkpoint:** #3 🔄 IN PROGRESS

---

## WYNIK KOŃCOWY: _________

---

## FAZA 5 — Aliasy

### 5.1 Widok Aliases — Sidebar

| ID | Test | Status | Uwagi |
|----|------|--------|-------|
| 5.1.1 | Przejście do widoku Aliases (kliknięcie w Header) | | |
| 5.1.2 | Sidebar wyświetla sekcję "Alias Summary" | | |
| 5.1.3 | Summary pokazuje liczniki: Internal, External, Broken, Disconnected | | |
| 5.1.4 | Sekcja "Libraries" wyświetla załadowane biblioteki | | |
| 5.1.5 | Library cards pokazują statystyki aliasów (internal/external/broken) | | |
| 5.1.6 | Kliknięcie na library card wybiera bibliotekę | | |
| 5.1.7 | Wybrana biblioteka ma active state (border accent) | | |
| 5.1.8 | Sekcja "Disconnected" wyświetla odłączone biblioteki | | |
| 5.1.9 | Przycisk "Restore" przy disconnected library | | |
| 5.1.10 | Empty state gdy brak bibliotek | | |
| 5.1.11 | Empty state gdy brak disconnected | | |

---

### 5.2 Widok Aliases — Main (Tabs & Table)

| ID | Test | Status | Uwagi |
|----|------|--------|-------|
| 5.2.1 | Tabs: All / Internal / External / Broken widoczne | | |
| 5.2.2 | Tab "All" pokazuje sumę aliasów | | |
| 5.2.3 | Tab "Internal" pokazuje liczbę internal aliasów | | |
| 5.2.4 | Tab "External" pokazuje liczbę external aliasów | | |
| 5.2.5 | Tab "Broken" pokazuje liczbę broken aliasów | | |
| 5.2.6 | Kliknięcie na tab filtruje tabelę | | |
| 5.2.7 | Tabela wyświetla kolumny: checkbox, Source, →, Target, Type, Actions | | |
| 5.2.8 | Wiersz aliasu pokazuje nazwę zmiennej źródłowej | | |
| 5.2.9 | Wiersz aliasu pokazuje ścieżkę (parent path) | | |
| 5.2.10 | Ikona typu aliasu (internal/external/broken) poprawna | | |
| 5.2.11 | Badge typu aliasu (Internal/External/Broken) z kolorami | | |
| 5.2.12 | Broken alias: Target pokazuje "Missing" + "Variable deleted" | | |

---

### 5.3 Connected External Libraries

| ID | Test | Status | Uwagi |
|----|------|--------|-------|
| 5.3.1 | Sekcja "Connected External Libraries" widoczna gdy są external aliasy | | |
| 5.3.2 | Karty external libraries pokazują nazwę biblioteki | | |
| 5.3.3 | Karty pokazują liczbę aliasów do danej biblioteki | | |
| 5.3.4 | Przycisk View (ikona oka) widoczny | | |
| 5.3.5 | Przycisk Disconnect (ikona link-off) widoczny | | |
| 5.3.6 | Kliknięcie Disconnect otwiera Disconnect Modal | | |
| 5.3.7 | Sekcja ukryta gdy brak external aliasów | | |

---

### 5.4 Selekcja aliasów

| ID | Test | Status | Uwagi |
|----|------|--------|-------|
| 5.4.1 | Checkbox w wierszu zaznacza alias | | |
| 5.4.2 | Checkbox "Select All" w headerze tabeli | | |
| 5.4.3 | Select All zaznacza wszystkie widoczne aliasy | | |
| 5.4.4 | Indeterminate state gdy część zaznaczona | | |
| 5.4.5 | Przycisk "Disconnect Selected (X)" pojawia się przy selekcji | | |

---

### 5.5 Search i filtrowanie

| ID | Test | Status | Uwagi |
|----|------|--------|-------|
| 5.5.1 | Globalny search (z headera) filtruje aliasy | | |
| 5.5.2 | Filtrowanie po source path | | |
| 5.5.3 | Filtrowanie po target path | | |
| 5.5.4 | Kombinacja search + tab działa poprawnie | | |

---

### 5.6 Empty States

| ID | Test | Status | Uwagi |
|----|------|--------|-------|
| 5.6.1 | Empty state gdy brak bibliotek | | |
| 5.6.2 | Empty state "No aliases yet" dla pustej biblioteki | | |
| 5.6.3 | Empty state "All aliases healthy" na tab Broken | | |
| 5.6.4 | Empty state "No external aliases" na tab External | | |
| 5.6.5 | Empty state "No aliases found" przy search bez wyników | | |

---

### 5.7 Alias Detail Panel

| ID | Test | Status | Uwagi |
|----|------|--------|-------|
| 5.7.1 | Kliknięcie na wiersz otwiera Detail Panel | | |
| 5.7.2 | Panel pokazuje Source → Target flow | | |
| 5.7.3 | Ikona źródła z poprawnym kolorem (internal/external/broken) | | |
| 5.7.4 | Nazwa zmiennej źródłowej wyświetlona | | |
| 5.7.5 | Parent path źródła wyświetlony | | |
| 5.7.6 | Strzałka w dół między source i target | | |
| 5.7.7 | Target pokazuje nazwę i bibliotekę | | |
| 5.7.8 | Badge typu (internal/external/broken) | | |
| 5.7.9 | Sekcja "Type" pokazuje typ zmiennej | | |
| 5.7.10 | Sekcja "Resolved values" pokazuje wartości per mode | | |
| 5.7.11 | Broken alias: warning box z komunikatem | | |
| 5.7.12 | Broken alias: target przekreślony + "Deleted" | | |
| 5.7.13 | Przyciski akcji: View/Change, Disconnect | | |
| 5.7.14 | Broken alias: przyciski Fix + Disconnect | | |
| 5.7.15 | Przycisk X zamyka panel | | |

---

### 5.8 Disconnect Modal

| ID | Test | Status | Uwagi |
|----|------|--------|-------|
| 5.8.1 | Modal otwiera się z Connected External Libraries | | |
| 5.8.2 | Tytuł: "Disconnect Library" | | |
| 5.8.3 | Pokazuje nazwę biblioteki do odłączenia | | |
| 5.8.4 | Pokazuje liczbę affected aliasów | | |
| 5.8.5 | Dropdown "Resolve values from mode" | | |
| 5.8.6 | Dropdown zawiera wszystkie modes z kolekcji | | |
| 5.8.7 | Hint wyjaśniający co się stanie | | |
| 5.8.8 | Przycisk Cancel zamyka modal | | |
| 5.8.9 | Przycisk Disconnect wykonuje operację | | |
| 5.8.10 | Biblioteka pojawia się w sekcji Disconnected | | |

---

### 5.9 Restore Modal

| ID | Test | Status | Uwagi |
|----|------|--------|-------|
| 5.9.1 | Modal otwiera się z przycisku Restore przy disconnected library | | |
| 5.9.2 | Tytuł: "Restore Library Connection" | | |
| 5.9.3 | Pokazuje nazwę biblioteki | | |
| 5.9.4 | Pokazuje liczbę aliasów do przywrócenia | | |
| 5.9.5 | Pokazuje liczbę aliasów które staną się broken (jeśli > 0) | | |
| 5.9.6 | Hint gdy część aliasów będzie broken | | |
| 5.9.7 | Przycisk Cancel zamyka modal | | |
| 5.9.8 | Przycisk Restore wykonuje operację | | |
| 5.9.9 | Biblioteka znika z sekcji Disconnected | | |

---

### 5.10 Alias Picker (komponent UI)

| ID | Test | Status | Uwagi |
|----|------|--------|-------|
| 5.10.1 | Picker renderuje się poprawnie (test izolowany) | | |
| 5.10.2 | Search input z ikoną lupy | | |
| 5.10.3 | Tabs: All / Internal / External z licznikami | | |
| 5.10.4 | Lista zmiennych z sekcjami Internal/External | | |
| 5.10.5 | Sekcja Internal pokazuje zmienne z tej samej biblioteki | | |
| 5.10.6 | Sekcja External pokazuje zmienne z innych bibliotek | | |
| 5.10.7 | Filtrowanie po typie zmiennej (tylko matching type) | | |
| 5.10.8 | Search filtruje listę zmiennych | | |
| 5.10.9 | Highlight dopasowania w nazwie | | |
| 5.10.10 | Kliknięcie na zmienną wywołuje onSelect | | |
| 5.10.11 | Current alias zaznaczony jako selected | | |
| 5.10.12 | Footer z hints (↑↓ navigate · Enter select · Esc close) | | |
| 5.10.13 | Przycisk "Remove alias" gdy jest current alias | | |
| 5.10.14 | Esc zamyka picker | | |
| 5.10.15 | Click outside zamyka picker | | |
| 5.10.16 | Empty state gdy brak zmiennych | | |

---

### 5.11 Bulk Alias Modal

| ID | Test | Status | Uwagi |
|----|------|--------|-------|
| 5.11.1 | Modal renderuje się (test izolowany lub z toolbara) | | |
| 5.11.2 | Step 1 (Configure): Source card z folder path | | |
| 5.11.3 | Source card pokazuje library/collection | | |
| 5.11.4 | Source card pokazuje liczbę zmiennych | | |
| 5.11.5 | Target dropdown z dostępnymi bibliotekami | | |
| 5.11.6 | Target pokazuje liczbę dopasowanych zmiennych | | |
| 5.11.7 | Sekcja "Apply to modes" z checkboxami | | |
| 5.11.8 | Przycisk "Select all / Deselect all" dla modes | | |
| 5.11.9 | Hint wyjaśniający działanie modes | | |
| 5.11.10 | Przycisk "Preview Matching" → Step 2 | | |
| 5.11.11 | Disabled gdy brak target lub modes | | |
| 5.11.12 | Step 2 (Preview): statystyki matched/unmatched | | |
| 5.11.13 | Lista matched z ikoną ✓ | | |
| 5.11.14 | Lista unmatched z ikoną → | | |
| 5.11.15 | Przycisk "Back" → Step 1 | | |
| 5.11.16 | Przycisk "Apply Aliases" → Step 3 | | |
| 5.11.17 | Disabled gdy 0 matched | | |
| 5.11.18 | Step 3 (Result): ikona sukcesu | | |
| 5.11.19 | Statystyki: Aliases created / Unmatched | | |
| 5.11.20 | Lista unmatched variables | | |
| 5.11.21 | Przycisk "Done" zamyka modal | | |

---

### 5.12 Store Actions

| ID | Test | Status | Uwagi |
|----|------|--------|-------|
| 5.12.1 | setAlias tworzy alias w valuesByMode | | |
| 5.12.2 | removeAlias zamienia alias na DIRECT value | | |
| 5.12.3 | bulkAlias tworzy wiele aliasów w wybranych modes | | |
| 5.12.4 | disconnectLibrary zamienia aliasy na resolved values | | |
| 5.12.5 | disconnectLibrary dodaje do disconnectedLibraries | | |
| 5.12.6 | restoreLibrary przywraca aliasy | | |
| 5.12.7 | restoreLibrary zwraca liczbę restored/broken | | |
| 5.12.8 | restoreLibrary usuwa z disconnectedLibraries | | |

---

### 5.13 Utils — aliasUtils

| ID | Test | Status | Uwagi |
|----|------|--------|-------|
| 5.13.1 | getAliasType zwraca 'internal' dla tej samej biblioteki | | |
| 5.13.2 | getAliasType zwraca 'external' dla innej biblioteki | | |
| 5.13.3 | getAliasType zwraca 'broken' gdy target nie istnieje | | |
| 5.13.4 | getAliasType zwraca 'none' dla DIRECT value | | |
| 5.13.5 | collectAliases zbiera wszystkie aliasy z biblioteki | | |
| 5.13.6 | calculateAliasStats oblicza poprawne statystyki | | |
| 5.13.7 | findConnectedExternalLibraries zwraca unikalne biblioteki | | |
| 5.13.8 | resolveAliasValue rozwiązuje łańcuch aliasów | | |
| 5.13.9 | matchVariablesByName dopasowuje po nazwie końcowej | | |
| 5.13.10 | matchVariablesByName sprawdza zgodność typów | | |

---

## 🐛 ZNALEZIONE BUGI

| ID | Opis | Priorytet | Status |
|----|------|-----------|--------|
| | | | |
| | | | |
| | | | |

---

## 🎨 UWAGI UI/UX

| ID | Opis | Priorytet |
|----|------|-----------|
| | | |
| | | |
| | | |

---

## PODSUMOWANIE

| Kategoria | Pass | Fail | Skip | Total |
|-----------|------|------|------|-------|
| 5.1 Sidebar | | | | 11 |
| 5.2 Main (Tabs & Table) | | | | 12 |
| 5.3 Connected External | | | | 7 |
| 5.4 Selekcja | | | | 5 |
| 5.5 Search | | | | 4 |
| 5.6 Empty States | | | | 5 |
| 5.7 Detail Panel | | | | 15 |
| 5.8 Disconnect Modal | | | | 10 |
| 5.9 Restore Modal | | | | 9 |
| 5.10 Alias Picker | | | | 16 |
| 5.11 Bulk Alias Modal | | | | 21 |
| 5.12 Store Actions | | | | 8 |
| 5.13 Utils | | | | 10 |
| **TOTAL** | | | | **133** |

**Pass rate:** ____%

---

## NASTĘPNY KROK

Po Checkpoint #3:
- [ ] Naprawa znalezionych bugów
- [ ] Faza 6: UNDO/REDO
