# REZZON Studio – wymagania aplikacji

Ten dokument będzie na bieżąco uzupełniany na podstawie Twoich luźnych notatek.

**Nazwa aplikacji:** REZZON Studio

## Zasady agregacji

- Każdą nową notatkę analizuję i dopasowuję do istniejących sekcji lub tworzę nowe.
- Eliminuję powtórzenia.
- Porządkuję wymagania w logiczne obszary (funkcjonalne, UX, techniczne itd.).
- Zachowuję sens oryginalnych notatek (bez interpretacji biznesowej, chyba że poprosisz).

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

### 2.1 Ogólne założenia

- Wygląd i struktura aplikacji przywodzą na myśl panel Variables w Figmie.
- Dodatkowym benchmarkiem wizualnym i UX jest TOKENS STUDIO.
- Interfejs jest techniczny, tabelaryczny i uporządkowany, z naciskiem na czytelność danych.
- Układ sprzyja pracy z bibliotekami, kolekcjami i wartościami zmiennych.
- Aplikacja operuje na maksymalnie 10 stylach w jednej kolekcji (do 10 kolumn).
- Przy większej liczbie kolumn interfejs zapewnia horyzontalny scroll tabeli / widoku danych.

### 2.2 Layout aplikacji

Layout aplikacji składa się z:

- **Header:** logo, nawigacja główna (Variables / Aliases / Snapshots), globalne wyszukiwanie, przyciski Import/Export
- **Sidebar (lewa kolumna, 240px):** trzy zwijalne sekcje – Libraries, Collections, Folders
- **Main (środek):** toolbar z akcjami + tabela zmiennych
- **Details panel (prawa kolumna, 280px):** podgląd szczegółów wybranej zmiennej, włączany/wyłączany przyciskiem toggle
- **Statusbar:** statystyki (liczba zmiennych, changed, broken) + skróty klawiszowe

### 2.3 Sidebar

Sidebar zawiera trzy zwijalne (collapsible) sekcje:

1. **Libraries** – lista wszystkich bibliotek w projekcie (główna + towarzyszące)
2. **Collections** – kolekcje z aktualnie wybranej biblioteki
3. **Folders** – drzewo folderów z aktualnie wybranej kolekcji

Sekcja Folders w sidebar wyświetla drzewo folderów zsynchronizowane w czasie rzeczywistym z rozwiniętymi folderami w tabeli.

Checkboxy w sekcji Folders są zsynchronizowane z checkboxami wierszy w tabeli (wspólny selection dla bulk operations).

### 2.4 Tabela zmiennych

- Tabela zmiennych wyświetla do 10 kolumn modes; przy większej liczbie – horyzontalny scroll.
- Kolumny tabeli: Checkbox | Name | Mode1 | Mode2 | ... | ModeN
- Hierarchia wierszy: Folder → Subfolder → Variable (z wizualnymi wcięciami)
- Foldery wartości są zwijane i rozwijane po kliknięciu w belkę folderu, a nie w samą nazwę folderu.

### 2.5 Type badges i wyświetlanie wartości

- Type badges są ujednolicone wizualnie (neutralne szare tło, różne ikony dla typów: #, toggle, Aa, color swatch).
- Aliasy w kolumnach wartości są rozróżniane kolorem tła (zielony = internal, pomarańczowy = external, czerwony = broken), bez dodatkowych badge'ów przy nazwie.
- Wartości bezpośrednie (nie-aliasy) wyświetlane są bez dodatkowego tła.

### 2.6 Details panel

- Details panel jest włączany/wyłączany przyciskiem toggle w toolbarze.
- Panel pozostaje aktywny do ręcznego zamknięcia (przycisk X).
- Zawartość panelu: Name, Path, Type, Alias target (jeśli dotyczy), Resolved values dla wszystkich modes.

### 2.7 Filtry

- Filtry dostępne są z dropdown w toolbarze (nie w sidebar).
- Filtry obejmują:
  - rodzaj zmiennej (boolean, number, color, string),
  - status aliasu (brak, internal, external, broken).
- Filtry nie wykluczają się wzajemnie i mogą być łączone (AND logic).

### 2.8 Toolbar

Toolbar zawiera następujące grupy akcji:

1. Expand All / Collapse All
2. Rename / Duplicate / Delete
3. Bulk Alias
4. Undo / Redo
5. Filter (dropdown)
6. Details panel toggle

Breadcrumb po prawej stronie toolbara pokazuje aktualną ścieżkę: Library › Collection › Folder.

### 2.9 Pozostałe elementy UI

- Istnieje globalna funkcja EXPAND / COLLAPSE, analogiczna do tej z Figma Variables, umożliwiająca szybkie rozwinięcie lub zwinięcie wszystkich folderów.
- Istnieje funkcja bulk rename dla wybranych folderów, z opcjonalnym polem Match (optional), działająca analogicznie do mechanizmu znanego z Figmy.
- Aplikacja zapamiętuje pełny stan UI między sesjami, w tym:
  - rozwinięcie / zwinięcie folderów,
  - aktywne filtry,
  - ostatnio wybraną bibliotekę,
  - stan Alias Managera,
  - stan Details panel (otwarty/zamknięty).
- Aplikacja udostępnia globalne wyszukiwanie (search), obejmujące:
  - nazwy zmiennych,
  - ścieżki zmiennych,
  - wartości zmiennych,
  - aliasy (internal i external).
- Wyszukiwanie respektuje aktualnie zaznaczony folder jako zakres (działa w jego obrębie).
- Wyszukiwanie działa w trybie live search (wyniki aktualizują się w trakcie pisania).
- Aplikacja obsługuje skróty klawiaturowe, inspirowane Figmą, m.in. dla:
  - rename,
  - delete,
  - expand / collapse,
  - undo / redo,
  - fokus na wyszukiwanie.
- Aplikacja wizualnie sygnalizuje stany zmiennych za pomocą ikon, kolorów lub badge'y, m.in.:
  - zmienne z aliasem (przez kolor tła wartości),
  - broken aliasy (czerwone tło + ikona warning),
  - zmienne zmienione w bieżącej sesji,
  - zmienne objęte operacjami bulk.
- Aplikacja umożliwia podgląd metadanych zmiennej (w Details panel), bez eksponowania identyfikatorów (ID).
- Aplikacja nie oferuje sortowania zmiennych – struktura folderów jest wystarczająca.
- Import i eksport nie mogą zmieniać struktury ani kolejności zmiennych w Figmie (brak automatycznego resortowania lub reorganizacji).
- Aplikacja nie obsługuje drag & drop do zmiany struktury (zmienne i foldery nie są przenoszone przez przeciąganie).
- Zmiany struktury realizowane są wyłącznie poprzez operacje logiczne (rename, bulk rename, delete, duplicate).

---

## 3. Logika aplikacji

- Istnieje funkcja bulk alias umożliwiająca masowe aliasowanie zmiennych.
- Bulk alias dopuszcza mapowanie wielu zmiennych do jednego targetu aliasu (one-to-many) bez ostrzeżeń i blokad, o ile spełniona jest zgodność typów.
- Bulk alias obsługuje mapowanie do bibliotek zewnętrznych.
- Administrator może wskazywać foldery objęte operacją bulk alias.
- Sposób automatyzacji identyfikacji i mapowania aliasów pozostaje do doprecyzowania (punkt otwarty).
- Aplikacja automatycznie identyfikuje typ zmiennej (variable), np. boolean, number, string, color itp.
- Typ zmiennej jest nienaruszalny:
  - aplikacja nie pozwala na zmianę typu zmiennej,
  - aliasowanie jest dozwolone wyłącznie pomiędzy zmiennymi tego samego typu,
  - operacje naruszające zgodność typów są blokowane na poziomie logiki aplikacji.
- Aplikacja nie umożliwia edycji wartości zmiennych (np. kolorów, liczb).
- Zakres aplikacji obejmuje zarządzanie strukturą, aliasami oraz operacje rename.
- Istnieje Alias Manager, który:
  - wylistowuje wszystkie aliasy w bibliotece,
  - rozdziela aliasy na internal i external,
  - umożliwia odłączanie (disconnect) poszczególnych bibliotek zewnętrznych od aktualnej biblioteki,
  - przy odłączaniu biblioteki pozwala wybrać źródło (mode), które ma zostać użyte do resolved values,
  - przechowuje dane o odłączonych bibliotekach w eksporcie sesji (pole `disconnectedLibraries`),
  - posiada funkcję restore umożliwiającą przywracanie wcześniej odłączonych bibliotek wraz z ich aliasami,
  - restore działa również po ponownym imporcie sesji (dane przechowywane w eksporcie sesji),
  - przy restore pokazuje preview: ile aliasów zostanie przywróconych, ile będzie broken (jeśli target nie istnieje),
  - restore przywraca całą bibliotekę naraz (wszystko albo nic),
  - wykrywa i oznacza broken aliasy oraz udostępnia osobny status i filtr dla nich.
- Operacje rename / bulk rename działają na zaznaczonym zakresie zmiennych.
- Zakres operacji bulk może być definiowany przez:
  - zaznaczony folder,
  - aktywne filtry,
  - wyniki wyszukiwania (search).
- Filtry i search bezpośrednio definiują zakres dla operacji bulk (rename, alias, delete, duplicate).
- Aplikacja nie oferuje trybu dry run dla operacji bulk – do cofania skutków służą UNDO / REDO oraz Snapshots.
- Aplikacja nie prowadzi logu operacji użytkownika (undo / redo oraz snapshoty są wystarczającym mechanizmem kontroli zmian).
- Rename folderów jest traktowane jako operacja zakresowa na zmiennych.
- Każda operacja rename (pojedyncza i bulk) oferuje opcjonalny mechanizm Match.
- Rename automatycznie aktualizuje aliasy, które zależą od zmienianych ścieżek.
- Aliasowanie ma charakter dynamiczny (jak w Figmie):
  - zmiana nazwy zmiennej propaguje się wszędzie,
  - jeśli rename przywraca poprawną ścieżkę, broken alias zostaje automatycznie naprawiony.
- W przypadku konfliktów po rename / bulk rename aplikacja blokuje operację i wyświetla listę konfliktów.
- Aplikacja umożliwia duplikowanie folderów (wraz z ich strukturą i zawartością).
- Przy duplikacji folderu aplikacja automatycznie nadaje nazwę z sufiksem " 2".
- Po duplikacji folderów aliasy pozostają podpięte do oryginalnych zmiennych.
- Aplikacja umożliwia usuwanie folderów:
  - wymaga potwierdzenia i podglądu konsekwencji,
  - po potwierdzeniu usuwa wszystkie zmienne i aliasy bezpowrotnie.
- Aplikacja nie pozwala na istnienie pustych folderów (zgodnie z ograniczeniami Figmy).
- Aplikacja nie wykrywa ani nie waliduje nieużywanych zmiennych (poza zakresem REZZON Studio).

---

## 4. Import / eksport danych

- Import plików JSON lub projektu stanowi źródło prawdy dla danej sesji REZZON Studio.
- Stan po imporcie jest traktowany jako obowiązujący baseline sesji.
- Zakłada się, że zmiany w Figmie mogą następować poza REZZON Studio; w takim przypadku kolejne rozpoczęcie pracy w REZZON Studio wymaga ponownego eksportu z Figmy i importu do aplikacji, który staje się nowym źródłem prawdy.
- Import plików JSON lub projektu wymaga jawnego resetu aktualnego projektu (potwierdzenie przez użytkownika).
- Import zastępuje w całości aktualny projekt po potwierdzeniu resetu.
- Aplikacja posiada funkcję Clear Workspace, która:
  - całkowicie czyści aktualny stan sesji (projekt, snapshoty, stan UI),
  - przywraca aplikację do stanu początkowego,
  - jest przeznaczona do rozpoczęcia pracy od nowego importu.
- Przed eksportem aplikacja wykonuje obowiązkową walidację, obejmującą:
  - brak konfliktów nazw i ścieżek,
  - zgodność typów zmiennych (aliasowanie tylko w obrębie tego samego typu),
  - wykrycie broken aliasów (eksport możliwy z ostrzeżeniem).
- Aplikacja rozróżnia dwa typy eksportu:
  - **eksport do Figmy** – zawiera wyłącznie dane wymagane przez Figmę (biblioteki, zmienne, aliasy), bez danych sesyjnych,
  - **eksport sesji projektu** – zawiera pełny stan sesji, w tym:
    - dane nieistotne dla Figmy (stan UI, snapshoty, zakresy filtrów, kontekst pracy),
    - pole `disconnectedLibraries` z historią odłączonych bibliotek i mapowaniami aliasów (umożliwia restore po ponownym imporcie).
- Eksport plików do Figmy po operacjach bulk rename musi powodować aktualizację nazw istniejących zmiennych w Figmie, a nie tworzenie nowych pozycji.
- Mechanizm eksportu do Figmy zachowuje ciągłość identyfikatorów / mapowanie zmiennych, tak aby zmiana nazwy była traktowana jako edycja, a nie nowa definicja.
- W przypadku występowania broken aliasów eksport do Figmy jest możliwy, ale aplikacja wyświetla ostrzeżenie informujące o ich obecności.
- Eksport (zarówno do Figmy, jak i sesji) zawiera metadane daty i godziny wygenerowania pliku.

---

## 5. Wymagania techniczne

- Identyfikacja zmiennych opiera się na podejściu hybrydowym:
  - pierwotnie wykorzystywane są identyfikatory z plików JSON Figmy (jeśli dostępne i stabilne),
  - w przypadku braku lub niestabilności ID stosowany jest fallback na logiczną ścieżkę zmiennej (np. folder/ścieżka/nazwa).
- Docelowy mechanizm identyfikacji (zakres użycia ID vs fallback) pozostaje do ostatecznego rozstrzygnięcia przez twórcę aplikacji.
- Mechanizm identyfikacji musi zapewniać, że operacje rename / bulk rename / alias / restore są traktowane jako edycja istniejących zmiennych, a nie tworzenie nowych.
- REZZON Studio działa jako aplikacja webowa (web app).
- Aplikacja działa w trybie single-user (brak kont użytkowników i autoryzacji).
- Przechowywanie stanu ma charakter hybrydowy:
  - stan roboczy (projekt, pełna sesja, snapshoty, stan UI) przechowywany jest lokalnie w przeglądarce (np. IndexedDB),
  - aplikacja umożliwia eksport i import pełnej sesji projektu do pliku (nie tylko samej biblioteki).
- Docelowa skala projektu zakłada obsługę do ok. 10–20 tys. zmiennych przy zachowaniu płynności UI i operacji bulk.
- **Wirtualizacja listy jest krytyczna od dnia 1** – użytkownik często używa "Expand All" przy ~8.5k zmiennych; bez wirtualizacji przeglądarka nie udźwignie renderowania.

---

## 6. Inne / otwarte kwestie

- Istnieje mechanizm Snapshots w aplikacji:
  - zapisuje pełny stan aplikacji, obejmujący:
    1. strukturę folderów i kolekcji,
    2. nazwy i ścieżki zmiennych,
    3. aliasowanie (internal / external wraz z mapowaniami),
    4. faktyczne wartości zmiennych (np. kolory, liczby, booleany itd.).
  - umożliwia powrót do wcześniejszego snapshotu jako hard restore (pełne nadpisanie aktualnego stanu),
  - snapshoty pełnią rolę punktów bezpieczeństwa przed operacjami bulk (rename, alias, disconnect, delete).
- Aplikacja obsługuje UNDO / REDO dla operacji wykonywanych przez użytkownika (w tym rename, bulk rename, alias, delete, disconnect).
- Limit historii UNDO / REDO: **20-30 kroków** (rozsądny limit, żeby nie obciążać pamięci).

---

## 7. Widoki aplikacji

Aplikacja posiada trzy główne widoki (nawigacja w header):

### 7.1 Variables (widok domyślny)

Główny widok do pracy ze zmiennymi:
- Sidebar z Libraries / Collections / Folders
- Tabela zmiennych z wartościami per mode
- Details panel z podglądem wybranej zmiennej

### 7.2 Aliases (Alias Manager)

Widok do zarządzania aliasami:
- Lista wszystkich aliasów w bibliotece
- Podział na internal / external
- Funkcje disconnect i restore dla bibliotek zewnętrznych
- Filtr i oznaczenie broken aliasów

### 7.3 Snapshots

Widok do zarządzania snapshotami:
- Lista zapisanych snapshotów z datą i opisem
- Podgląd zawartości snapshotu
- Funkcje: Create snapshot, Restore, Delete
