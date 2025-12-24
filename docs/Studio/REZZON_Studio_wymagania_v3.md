# REZZON Studio – wymagania aplikacji v3

Skompilowany dokument wymagań na podstawie wersji v1 i v2.
Data kompilacji: 2025-12-24

---

## 1. Zarządzanie plikami i bibliotekami

- Projekt w REZZON Studio reprezentuje jeden ekosystem bibliotek:
  - jedną bibliotekę główną,
  - oraz powiązane z nią biblioteki towarzyszące.
- Użytkownik może wskazać folder z plikami JSON lub wybrać wiele plików JSON jednocześnie.
- Aplikacja automatycznie analizuje nazwy i strukturę plików.
- Plik oznaczony jako REZZON jest rozpoznawany jako główna biblioteka.
- Pliki zawierające "R4" w nazwie są rozpoznawane jako biblioteki towarzyszące.
- Biblioteki są agregowane logicznie (główna + towarzyszące).
- Główna biblioteka jest zawsze wyświetlana na szczycie listy.
- Biblioteki towarzyszące są wyświetlane w kolejności numerycznej (rosnąco).

---

## 2. Interfejs użytkownika (UI / UX)

### 2.1 Ogólne zasady

- Wygląd i struktura aplikacji przywodzą na myśl panel Variables w Figmie.
- Dodatkowym benchmarkiem wizualnym i UX jest TOKENS STUDIO.
- Interfejs jest techniczny, tabelaryczny i uporządkowany, z naciskiem na czytelność danych.
- Układ sprzyja pracy z bibliotekami, kolekcjami i wartościami zmiennych.

### 2.2 Layout główny

- **3-kolumnowy layout** z collapsible sidebar i toggleable details panel:

```
┌─────────────────────────────────────────────────────────────────┐
│ Header: Logo | Nav (Variables/Aliases/Snapshots) | Search | Import/Export │
├────────────┬────────────────────────────────┬───────────────────┤
│ Sidebar    │ Main                           │ Details Panel     │
│ 240px      │ (toolbar + table)              │ 280px (toggle)    │
│            │                                │                   │
│ Libraries  │                                │                   │
│ Collections│                                │                   │
│ Folders    │                                │                   │
├────────────┴────────────────────────────────┴───────────────────┤
│ Statusbar: stats + keyboard shortcuts                           │
└─────────────────────────────────────────────────────────────────┘
```

### 2.3 Nawigacja główna

- 3 główne widoki (tabs w headerze):
  1. **Variables** – główny widok z tabelą zmiennych (domyślny)
  2. **Aliases** – Alias Manager (lista aliasów, disconnect, restore)
  3. **Snapshots** – zarządzanie snapshotami

### 2.4 Sidebar – 3 sekcje (każda collapsible)

1. **Libraries** – lista bibliotek (REZZON główna + R4-* towarzyszące)
   - Ikona package dla głównej, cube dla towarzyszących
   - Licznik zmiennych przy każdej

2. **Collections** – kolekcje z aktualnie wybranej biblioteki
   - Ikona stack/layers
   - Licznik zmiennych przy każdej

3. **Folders** – drzewo folderów zsynchronizowane z tabelą
   - Hierarchia z wcięciami
   - Checkboxy zsynchronizowane z tabelą (dla bulk operations)
   - Rozwijanie/zwijanie zsynchronizowane z tabelą (real-time)

### 2.5 Tabela zmiennych

- Aplikacja operuje na maksymalnie 10 stylach w jednej kolekcji (do 10 kolumn).
- Przy większej liczbie kolumn interfejs zapewnia horyzontalny scroll tabeli.

**Kolumny:**
- Checkbox (do bulk operations)
- Name (zmienna + type badge)
- Mode columns (1920, 1366, 768, 390... max 10)

**Hierarchia wizualna:**
- Folder row (tło surface, chevron do rozwijania)
- Subfolder row (tło elevated, większe wcięcie)
- Variable row (tło transparent, największe wcięcie)

- Foldery wartości są zwijane i rozwijane po kliknięciu w belkę folderu (nie w samą nazwę).
- Istnieje globalna funkcja EXPAND / COLLAPSE (jak w Figma Variables).

### 2.6 Details panel

- Toggle przyciskiem w toolbarze, pozostaje aktywny do ręcznego zamknięcia (X).

**Zawartość:**
- **Name** – nazwa zmiennej
- **Path** – pełna ścieżka (Collection / Folder / ... / Variable)
- **Type** – typ z badge
- **Alias target** – jeśli zmienna jest aliasem: cel + źródło (internal/external)
- **Resolved values** – lista wartości dla wszystkich modes

### 2.7 Toolbar

```
[Expand] [Collapse] | [Rename] [Copy] [Delete] | [Bulk Alias] | [Undo] [Redo] | [Filter ▾] | [Details toggle]
```

**Filtry (dropdown w toolbarze):**
- **By type:** All / Number / Boolean / String / Color
- **By alias:** All / No alias / Internal / External / Broken

Filtry są kombinowalne (AND logic).

### 2.8 Statusbar

Zawsze widoczny na dole, zawiera:
- Statystyki: "8,571 variables" | "24 changed" | "1 broken"
- Kropki statusu (zielona/pomarańczowa/czerwona)
- Skróty klawiszowe: `⌘K` Search | `⌘Z` Undo

### 2.9 Wyszukiwanie

- Globalne wyszukiwanie obejmujące: nazwy, ścieżki, wartości, aliasy
- Respektuje aktualnie zaznaczony folder jako zakres
- Tryb live search (wyniki aktualizują się w trakcie pisania)

### 2.10 Skróty klawiszowe

Inspirowane Figmą, m.in. dla: rename, delete, expand/collapse, undo/redo, fokus na wyszukiwanie.

### 2.11 Wizualne sygnalizowanie stanów

Za pomocą ikon, kolorów lub badge'y:
- zmienne z aliasem (internal/external)
- broken aliasy
- zmienne zmienione w bieżącej sesji
- zmienne objęte operacjami bulk

### 2.12 Stan UI

- Aplikacja zapamiętuje pełny stan UI między sesjami:
  - rozwinięcie / zwinięcie folderów,
  - aktywne filtry,
  - ostatnio wybraną bibliotekę,
  - stan Alias Managera.

### 2.13 Ograniczenia UI

- Aplikacja nie oferuje sortowania zmiennych – struktura folderów jest wystarczająca.
- Import i eksport nie mogą zmieniać struktury ani kolejności zmiennych w Figmie.
- Aplikacja nie obsługuje drag & drop do zmiany struktury.
- Zmiany struktury realizowane są wyłącznie poprzez operacje logiczne (rename, bulk rename, delete, duplicate).

---

## 3. Logika aplikacji

### 3.1 Typy zmiennych

- Aplikacja automatycznie identyfikuje typ zmiennej (boolean, number, string, color).
- Typ zmiennej jest nienaruszalny:
  - aplikacja nie pozwala na zmianę typu,
  - aliasowanie dozwolone wyłącznie między zmiennymi tego samego typu,
  - operacje naruszające zgodność typów są blokowane.

### 3.2 Aliasowanie

- Aliasowanie ma charakter dynamiczny (jak w Figmie):
  - zmiana nazwy zmiennej propaguje się wszędzie,
  - jeśli rename przywraca poprawną ścieżkę, broken alias zostaje automatycznie naprawiony.

**Alias picker dla pojedynczej zmiennej:**
- Pokazuje wszystkie dostępne zmienne tego samego typu (internal i external)
- Interfejs jak w Figma Variables: search → lista z kontekstem → wybór

### 3.3 Bulk alias

- Funkcja bulk alias umożliwia masowe aliasowanie zmiennych.
- Użytkownik sam wybiera do których modes (kolumn) zastosować bulk alias.
- Matchowanie zmiennych odbywa się po **nazwie** (np. `Amber/1` → `Amber/1`).
- Dopuszcza mapowanie wielu zmiennych do jednego targetu (one-to-many) bez ostrzeżeń.
- Obsługuje mapowanie do bibliotek zewnętrznych.
- Administrator może wskazywać foldery objęte operacją.
- **Niezmatchowane zmienne:** zbieramy listę i pokazujemy użytkownikowi po operacji (nie blokujemy, nie pomijamy cicho).

### 3.4 Alias Manager

- Wylistowuje wszystkie aliasy w bibliotece
- Rozdziela aliasy na internal i external
- Umożliwia odłączanie (disconnect) poszczególnych bibliotek zewnętrznych
- Przy odłączaniu biblioteki pozwala wybrać mode (źródło) dla resolved values
- Przechowuje dane o odłączonych bibliotekach w eksporcie sesji (pole `disconnectedLibraries`)
- Posiada funkcję restore umożliwiającą przywracanie wcześniej odłączonych bibliotek
- Restore działa również po ponownym imporcie sesji
- Przy restore pokazuje preview: "X aliasów zostanie przywróconych, Y będzie broken"
- Restore = wszystko albo nic (cała biblioteka naraz)
- Wykrywa i oznacza broken aliasy oraz udostępnia osobny status i filtr

### 3.5 Operacje rename

- Funkcja bulk rename dla wybranych folderów z opcjonalnym polem Match.
- Każda operacja rename (pojedyncza i bulk) oferuje mechanizm Match.
- Rename automatycznie aktualizuje aliasy zależne od zmienianych ścieżek.
- W przypadku konfliktów po rename aplikacja blokuje operację i wyświetla listę konfliktów.

### 3.6 Zakres operacji bulk

Może być definiowany przez:
- zaznaczony folder,
- aktywne filtry,
- wyniki wyszukiwania (search).

Filtry i search bezpośrednio definiują zakres dla operacji bulk.

### 3.7 Duplikowanie folderów

- Umożliwia duplikowanie folderów wraz z ich strukturą i zawartością.
- Automatycznie nadaje nazwę z sufiksem " 2".
- Po duplikacji aliasy pozostają podpięte do oryginalnych zmiennych.

### 3.8 Usuwanie folderów

- Wymaga potwierdzenia i podglądu konsekwencji.
- Po potwierdzeniu usuwa wszystkie zmienne i aliasy bezpowrotnie.
- Aplikacja nie pozwala na istnienie pustych folderów (ograniczenie Figmy).

### 3.9 Ograniczenia

- Aplikacja nie umożliwia edycji wartości zmiennych (kolorów, liczb).
- Zakres aplikacji: zarządzanie strukturą, aliasami, operacje rename.
- Brak trybu dry run – do cofania służą UNDO/REDO oraz Snapshots.
- Brak logu operacji użytkownika.
- Brak wykrywania/walidacji nieużywanych zmiennych.

---

## 4. Import / eksport danych

### 4.1 Import

- Import plików JSON lub projektu stanowi źródło prawdy dla danej sesji.
- Stan po imporcie jest traktowany jako obowiązujący baseline sesji.
- Import wymaga jawnego resetu aktualnego projektu (potwierdzenie przez użytkownika).
- Import zastępuje w całości aktualny projekt po potwierdzeniu.

### 4.2 Clear Workspace

Funkcja która:
- całkowicie czyści aktualny stan sesji (projekt, snapshoty, stan UI),
- przywraca aplikację do stanu początkowego,
- jest przeznaczona do rozpoczęcia pracy od nowego importu.

### 4.3 Walidacja przed eksportem

Obowiązkowa walidacja obejmująca:
- brak konfliktów nazw i ścieżek,
- zgodność typów zmiennych,
- wykrycie broken aliasów (eksport możliwy z ostrzeżeniem).

Walidacja może być dokładna (nie musi być błyskawiczna) – użytkownik eksportuje raz na koniec sesji.

### 4.4 Typy eksportu

1. **Eksport do Figmy** – zawiera wyłącznie dane wymagane przez Figmę (biblioteki, zmienne, aliasy), bez danych sesyjnych.

2. **Eksport sesji projektu** – zawiera pełny stan sesji:
   - dane nieistotne dla Figmy (stan UI, snapshoty, zakresy filtrów, kontekst pracy),
   - pole `disconnectedLibraries` z historią odłączonych bibliotek i mapowaniami aliasów (umożliwia restore po ponownym imporcie).

### 4.5 Zachowanie ciągłości

- Eksport po operacjach bulk rename musi powodować aktualizację nazw istniejących zmiennych w Figmie (nie tworzenie nowych).
- Mechanizm eksportu zachowuje ciągłość identyfikatorów/mapowanie zmiennych.

### 4.6 Metadane

Eksport (zarówno do Figmy, jak i sesji) zawiera metadane daty i godziny wygenerowania pliku.

---

## 5. UNDO/REDO i Snapshots

### 5.1 UNDO/REDO

- Obsługa dla operacji: rename, bulk rename, alias, delete, disconnect.
- **Limit kroków:** 20-30 (rozsądny limit, żeby nie obciążać pamięci).

### 5.2 Snapshots

Mechanizm zapisujący pełny stan aplikacji:
1. strukturę folderów i kolekcji,
2. nazwy i ścieżki zmiennych,
3. aliasowanie (internal/external wraz z mapowaniami),
4. faktyczne wartości zmiennych.

**Funkcje:**
- Powrót do wcześniejszego snapshotu jako hard restore (pełne nadpisanie aktualnego stanu).
- Snapshoty pełnią rolę punktów bezpieczeństwa przed operacjami bulk.

---

## 6. Wymagania techniczne

### 6.1 Identyfikacja zmiennych

- Podejście hybrydowe:
  - pierwotnie wykorzystywane są identyfikatory z plików JSON Figmy (jeśli dostępne i stabilne),
  - fallback na logiczną ścieżkę zmiennej (folder/ścieżka/nazwa).

- Figma identyfikuje zmienne po ID.
- Plugin REZZON Portal przy imporcie:
  1. Szuka po `variableId` (priorytet)
  2. Jeśli nie znajdzie – szuka po nazwie
  3. Jeśli ID się zgadza ale nazwa inna → aktualizuje nazwę (nie tworzy duplikatu)

- Rename w REZZON Studio zadziała poprawnie dopóki zachowamy oryginalne `id` z JSON.

### 6.2 Platforma

- REZZON Studio działa jako aplikacja webowa (web app).
- Aplikacja działa w trybie single-user (brak kont użytkowników i autoryzacji).

### 6.3 Przechowywanie stanu

Charakter hybrydowy:
- stan roboczy (projekt, pełna sesja, snapshoty, stan UI) przechowywany lokalnie w przeglądarce (np. IndexedDB),
- aplikacja umożliwia eksport i import pełnej sesji projektu do pliku.

### 6.4 Skala i wydajność

- Docelowa skala: do ok. 10–20 tys. zmiennych przy zachowaniu płynności UI i operacji bulk.
- **Wirtualizacja listy:** krytyczna od dnia 1. Użytkownik często używa "Expand All" przy ~8.5k zmiennych.

---

## 7. Podział aplikacji

**Decyzja:** Dwie osobne aplikacje, docelowo Scale Editor jako moduł Studio.

- **REZZON Studio** = struktura, aliasy, rename
- **Scale Editor** = wartości, formuły
