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

- Wygląd i struktura aplikacji przywodzą na myśl panel Variables w Figmie.
- Dodatkowym benchmarkiem wizualnym i UX jest TOKENS STUDIO.
- Interfejs jest techniczny, tabelaryczny i uporządkowany, z naciskiem na czytelność danych.
- Układ sprzyja pracy z bibliotekami, kolekcjami i wartościami zmiennych.
- Aplikacja operuje na maksymalnie 10 stylach w jednej kolekcji (do 10 kolumn).
- Przy większej liczbie kolumn interfejs zapewnia horyzontalny scroll tabeli / widoku danych.
- Foldery wartości są zwijane i rozwijane po kliknięciu w belkę folderu, a nie w samą nazwę folderu.
- Istnieje globalna funkcja EXPAND / COLLAPSE, analogiczna do tej z Figma Variables, umożliwiająca szybkie rozwinięcie lub zwinięcie wszystkich folderów.
- Istnieje funkcja bulk rename dla wybranych folderów, z opcjonalnym polem Match (optional), działająca analogicznie do mechanizmu znanego z Figmy.
- Aplikacja zapamiętuje pełny stan UI między sesjami, w tym:
  - rozwinięcie / zwinięcie folderów,
  - aktywne filtry,
  - ostatnio wybraną bibliotekę,
  - stan Alias Managera.
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
  - zmienne z aliasem,
  - broken aliasy,
  - zmienne zmienione w bieżącej sesji,
  - zmienne objęte operacjami bulk.
- Aplikacja umożliwia podgląd metadanych zmiennej (np. źródło: biblioteka główna / towarzysząca, informacja o aliasie i jego celu), bez eksponowania identyfikatorów (ID).
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
- Aplikacja umożliwia filtrowanie zmiennych (variables) według:
  - rodzaju zmiennej (np. boolean, number, color itd.),
  - statusu aliasu:
    1. brak aliasu (bezpośrednia wartość),
    2. alias zewnętrzny (do zewnętrznej biblioteki),
    3. alias wewnętrzny (pomiędzy kolekcjami w bibliotece głównej lub aktualnie wybranej bibliotece).
- Filtry nie wykluczają się wzajemnie i mogą być łączone.
- Istnieje Alias Manager, który:
  - wylistowuje wszystkie aliasy w bibliotece,
  - rozdziela aliasy na internal i external,
  - umożliwia odłączanie (disconnect) poszczególnych bibliotek zewnętrznych od aktualnej biblioteki,
  - przy odłączaniu biblioteki pozwala wybrać źródło, które ma zostać użyte do resolved values,
  - posiada funkcję restore umożliwiającą przywracanie wcześniej odłączonych bibliotek wraz z ich aliasami,
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
  - **eksport sesji projektu** – zawiera pełny stan sesji, w tym dane nieistotne dla Figmy (stan UI, snapshoty, zakresy filtrów, kontekst pracy).
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
- Zakres historii UNDO / REDO (głębokość, limit kroków) pozostaje do doprecyzowania.
