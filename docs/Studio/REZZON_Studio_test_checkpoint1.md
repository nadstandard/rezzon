# REZZON Studio – Arkusz testowy

**Wersja:** v0.3.0
**Data:** 2025-12-29
**Checkpoint:** #1

---

## FAZA 1 – Szkielet

| ID | Test | Status | Uwagi |
|----|------|--------|-------|
| 1.1 | Aplikacja uruchamia się bez błędów (npm run dev) | ✅ PASS | |
| 1.2 | Build przechodzi czysto (npm run build) | ✅ PASS | |
| 1.3 | Hot reload działa | ✅ PASS | |
| 1.4 | Kolory zgodne z makietami (dark theme) | ✅ PASS | |
| 1.5 | Fonty Inter renderują się poprawnie | ✅ PASS | |
| 1.6 | Ikony Lucide renderują się prawidłowo | ✅ PASS | |
| 1.7 | Layout 3-kolumnowy wyświetla się poprawnie | ✅ PASS | |
| 1.8 | Header ma stałą wysokość 44px | ✅ PASS | |
| 1.9 | Statusbar przyklejony do dołu (32px) | ✅ PASS | |
| 1.10 | Panel zamyka się/otwiera bez nakładania | ✅ PASS | |
| 1.11 | Main rozciąga się przy zamkniętym panelu | ✅ PASS | |
| 1.12 | Routing Variables działa | ✅ PASS | |
| 1.13 | Routing Aliases działa | ✅ PASS | |
| 1.14 | Routing Snapshots działa | ✅ PASS | |
| 1.15 | Aktywna zakładka jest wyróżniona | ✅ PASS | |
| 1.16 | Dane pozostają przy przełączaniu widoków | ✅ PASS | |
| 1.17 | F5 resetuje stan (brak persystencji) | ✅ PASS | Oczekiwane |
| 1.18 | Brak błędów w konsoli | ✅ PASS | |

**Wynik Fazy 1:** 18/18 ✅

---

## FAZA 2 – Import i wyświetlanie

| ID | Test | Status | Uwagi |
|----|------|--------|-------|
| 2.1 | Import rozpoznaje biblioteki | ✅ PASS | 6 bibliotek |
| 2.2 | Nazwy bibliotek poprawne | ✅ PASS | |
| 2.3 | Liczba zmiennych zgadza się | ✅ PASS | 8,471 |
| 2.4 | Kolejność bibliotek R4-* numeryczna | ❌ FAIL | BUG 2.1.1: 4,3,2,1,5 zamiast 1,2,3,4,5 |
| 2.5 | Modal importu otwiera się | ✅ PASS | |
| 2.6 | Drag & drop działa | ✅ PASS | |
| 2.7 | Browse file działa | ✅ PASS | |
| 2.8 | Nazwa pliku przed zatwierdzeniem | ✅ PASS | |
| 2.9 | Walidacja: nie-JSON odrzucony | ✅ PASS | |
| 2.10 | Walidacja: nieprawidłowy JSON odrzucony | ✅ PASS | |
| 2.11 | Ikona package dla biblioteki głównej | ❌ FAIL | BUG 2.4.1: Wszystkie mają tę samą ikonę |
| 2.12 | Kliknięcie w bibliotekę zaznacza ją | ✅ PASS | |
| 2.13 | Kolekcje aktualizują się po wyborze biblioteki | ✅ PASS | |
| 2.14 | Wybranie biblioteki auto-wybiera kolekcję | ❌ FAIL | BUG 2.6.2 |
| 2.15 | Kolekcje pokazują licznik | ✅ PASS | |
| 2.16 | Kliknięcie w kolekcję zaznacza ją | ✅ PASS | |
| 2.17 | Tabela pokazuje zmienne z kolekcji | ✅ PASS | |
| 2.18 | Foldery wyświetlają się z ikoną | ✅ PASS | |
| 2.19 | Foldery zagnieżdżone mają wcięcie | ✅ PASS | |
| 2.20 | Zmienne mają większe wcięcie niż foldery | ✅ PASS | |
| 2.21 | Widok tabeli spójny między kolekcjami | ❌ FAIL | BUG 2.6.1: Rozstrzelony, niespójny |
| 2.22 | Kolejność folderów jak w Figmie | ❌ FAIL | BUG 2.10.1: Alfabetycznie |
| 2.23 | Kliknięcie w folder rozwija/zwija | ✅ PASS | |
| 2.24 | Chevron obraca się przy rozwijaniu | ✅ PASS | |
| 2.25 | Expand All działa | ✅ PASS | |
| 2.26 | Collapse All działa | ✅ PASS | |
| 2.27 | Number: ikona # | ✅ PASS | |
| 2.28 | String: ikona Aa | ✅ PASS | |
| 2.29 | Boolean: ikona toggle | ✅ PASS | |
| 2.30 | Color: ikona palety | ✅ PASS | |
| 2.31 | Wartości liczbowe bez .00 | ✅ PASS | |
| 2.32 | Wartości dziesiętne z miejscami | ✅ PASS | |
| 2.33 | Boolean jako true/false | ✅ PASS | |
| 2.34 | String wyświetla się poprawnie | ✅ PASS | |
| 2.35 | Color: kwadracik z podglądem | ❌ FAIL | BUG 2.12.1: Wyświetla "-" |
| 2.36 | Color: wartość HEX | ❌ FAIL | BUG 2.12.1 |
| 2.37 | Alias internal: zielone tło + strzałka | ✅ PASS | |
| 2.38 | Alias internal: nazwa zmiennej docelowej | ✅ PASS | |
| 2.39 | Alias external: pomarańczowe tło + ikona | ❌ FAIL | BUG 2.14.1 |
| 2.40 | Alias external: ścieżka zmiennej docelowej | ❌ FAIL | BUG 2.14.1: Pokazuje ID lub "unknown" |
| 2.41 | Clear Workspace: przycisk istnieje | ✅ PASS | |
| 2.42 | Clear Workspace: modal potwierdzenia | ✅ PASS | |
| 2.43 | Clear Workspace: usuwa wszystko | ✅ PASS | |

**Wynik Fazy 2:** 34/43 (79%) — 9 FAIL

---

## FAZA 3 – Selekcja + Search + Filtry

| ID | Test | Status | Uwagi |
|----|------|--------|-------|
| 3.1 | Checkbox przy zmiennych | ✅ PASS | |
| 3.2 | Kliknięcie checkbox zaznacza/odznacza | ✅ PASS | |
| 3.3 | Checkbox folderów działa | ❌ FAIL | BUG 3.1.1 |
| 3.4 | Checkbox "select all" w headerze | ✅ PASS | |
| 3.5 | Select All zaznacza wszystkie zmienne | ❌ FAIL | BUG 3.1.2: Tylko rozwinięte |
| 3.6 | Indeterminate state | ✅ PASS | |
| 3.7 | Shift+click zaznacza zakres | ❌ FAIL | BUG 3.1.4 |
| 3.8 | Floating selection bar pojawia się | ✅ PASS | |
| 3.9 | Selection bar: liczba zaznaczonych | ✅ PASS | |
| 3.10 | Selection bar: przyciski akcji | ✅ PASS | |
| 3.11 | Kliknięcie w wiersz toggle'uje | ✅ PASS | |
| 3.12 | Drzewo folderów w sidebarze | ❌ FAIL | BUG 3.1.8: Sekcja pusta |
| 3.13 | Sync sidebar ↔ tabela | ❌ FAIL | BUG 3.1.8 |
| 3.14 | Pole search w headerze | ✅ PASS | |
| 3.15 | Live search filtruje tabelę | ✅ PASS | |
| 3.16 | Foldery z pasującymi zmiennymi widoczne | ✅ PASS | |
| 3.17 | Highlight pasujących fragmentów | ✅ PASS | |
| 3.18 | Empty state "No variables match" | ✅ PASS | |
| 3.19 | Zakres search do wybranego folderu | ❌ FAIL | BUG 3.2.5 |
| 3.20 | Przycisk Filter w toolbarze | ✅ PASS | |
| 3.21 | Dropdown otwiera się po kliknięciu | ✅ PASS | |
| 3.22 | Filtr by type: Number | ✅ PASS | |
| 3.23 | Filtr by type: Boolean | ✅ PASS | |
| 3.24 | Filtr by type: String | ✅ PASS | |
| 3.25 | Filtr by type: Color | ✅ PASS | |
| 3.26 | Filtr by alias: No alias | ✅ PASS | |
| 3.27 | Filtr by alias: Internal | ✅ PASS | |
| 3.28 | Filtr by alias: External | ✅ PASS | |
| 3.29 | Filtr by alias: Broken | ✅ PASS | |
| 3.30 | Kombinowanie filtrów (AND) | ✅ PASS | |
| 3.31 | Badge z liczbą aktywnych filtrów | ✅ PASS | |
| 3.32 | Liczniki przy opcjach filtra | ✅ PASS | |
| 3.33 | Zamykanie dropdown po kliknięciu poza | ✅ PASS | |
| 3.34 | Przycisk "Clear all" | ✅ PASS | |
| 3.35 | Details Panel toggle | ✅ PASS | |
| 3.36 | Details: Name | ✅ PASS | |
| 3.37 | Details: Path | ✅ PASS | Ale niespójna interpunkcja (BUG 3.4.3a) |
| 3.38 | Details: Type z badge | ✅ PASS | |
| 3.39 | Details: Alias target | ✅ PASS | |
| 3.40 | Details: Values per mode | ✅ PASS | |
| 3.41 | Details: Description (jeśli istnieje) | ⏸️ SKIP | Nie zweryfikowane |
| 3.42 | Multi-select → podsumowanie | ✅ PASS | |
| 3.43 | Empty state "Select a variable" | ✅ PASS | |

**Wynik Fazy 3:** 35/42 (83%) — 6 FAIL, 1 SKIP

---

## PODSUMOWANIE CHECKPOINTU #1

| Faza | Pass | Fail | Skip | % |
|------|------|------|------|---|
| Faza 1 – Szkielet | 18 | 0 | 0 | 100% |
| Faza 2 – Import | 34 | 9 | 0 | 79% |
| Faza 3 – Selekcja | 35 | 6 | 1 | 83% |
| **SUMA** | **87** | **15** | **1** | **85%** |

---

## LISTA BUGÓW

### 🔴 BLOCKERY

| ID | Opis | Priorytet |
|----|------|-----------|
| 2.12.1 | Wartości COLOR wyświetlają się jako "-" | BLOCKER |
| 2.14.1 | Aliasy external pokazują ID/"unknown" zamiast nazwy | BLOCKER |

### 🟠 FUNKCJONALNE

| ID | Opis | Priorytet |
|----|------|-----------|
| 2.6.1 | Niespójny/rozstrzelony widok tabeli folderów | HIGH |
| 2.6.2 | Wybranie biblioteki nie auto-wybiera kolekcji | HIGH |
| 2.10.1 | Foldery sortowane alfabetycznie (nie jak w Figmie) | HIGH |
| 3.1.1 | Checkbox folderów nie działa | HIGH |
| 3.1.2 | Select All tylko dla rozwiniętych folderów | HIGH |
| 3.1.4 | Shift+click nie zaznacza zakresu | MEDIUM |
| 3.1.8 | Brak drzewa folderów w sidebarze | HIGH |

### 🟡 WIZUALNE

| ID | Opis | Priorytet |
|----|------|-----------|
| 2.1.1 | Kolejność bibliotek R4-* nieprawidłowa | LOW |
| 2.4.1 | Brak rozróżnienia ikon bibliotek | LOW |
| 3.2.5 | Brak zakresu search do folderu | LOW |
| 3.4.3a | Niespójna interpunkcja w Path | LOW |

### 🟢 FEATURE REQUESTS

| ID | Opis | Priorytet |
|----|------|-----------|
| 3.4.3b | Przycisk Copy przy Path | NICE-TO-HAVE |

---

## NASTĘPNE KROKI

1. **NAPRAWIĆ BLOCKERY** (Faza 3.5):
   - BUG 2.12.1 – Wartości COLOR
   - BUG 2.14.1 – Aliasy external

2. **Przejść do Fazy 4** – Operacje CRUD

3. **Bugi 🟠 naprawić przed MVP** (Checkpoint #4)

4. **Bugi 🟡 naprawić w Fazie 12** (Polish)
