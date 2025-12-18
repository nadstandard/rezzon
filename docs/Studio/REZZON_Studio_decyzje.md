# REZZON Studio – decyzje projektowe

Notatki z wywiadu z 2025-12-18. Uzupełnienie do głównej specyfikacji wymagań.

---

## 1. Bulk alias – mechanizm matchowania

**Decyzja:** Użytkownik sam wybiera do których modes (kolumn) zastosować bulk alias.

Przykłady:
- Bulk alias Grid → Viewport: użytkownik zaznacza kolumny 1920, 1366, 768, 390
- Bulk alias Color-Library → Color: użytkownik zaznacza kolumnę TWO

Matchowanie zmiennych odbywa się po **nazwie** – zmienna `Amber/1` w źródle szuka `Amber/1` w celu (w wybranej kolumnie).

---

## 2. Niezmatchowane zmienne przy bulk alias

**Decyzja:** Opcja B – zbieramy listę "niezmatchowanych" i pokazujemy użytkownikowi po operacji.

Nie blokujemy operacji, nie pomijamy cicho.

---

## 3. Disconnect biblioteki

**Decyzja:** Przy disconnect aliasy zostają zamienione na **resolved values**.

Flow:
1. Użytkownik wybiera bibliotekę do odłączenia
2. Aplikacja pyta: "Z którego mode'a wziąć resolved values?" (np. Desktop / 1920 / Light)
3. Wszystkie aliasy do tej biblioteki zostają zamienione na konkretne wartości z wybranego mode'a

---

## 4. Restore po disconnect

**Decyzja:** Punkt otwarty – do rozstrzygnięcia w praktyce.

Opcje:
- A) Przy disconnect zapisujemy "snapshot aliasów" i restore odtwarza połączenia
- C) Inne podejście

---

## 5. UNDO/REDO – limit kroków

**Decyzja:** 20-30 kroków (rozsądny limit, żeby nie obciążać pamięci).

---

## 6. Wirtualizacja listy

**Decyzja:** Krytyczna od dnia 1.

Użytkownik często używa "Expand All" przy ~8.5k zmiennych. Bez wirtualizacji przeglądarka padnie.

---

## 7. Walidacja przed eksportem

**Decyzja:** Może być dokładna (nie musi być błyskawiczna).

Użytkownik eksportuje raz na koniec sesji, nie w trakcie pracy.

---

## 8. Podział Scale Editor vs Studio

**Decyzja:** Dwie osobne aplikacje, docelowo Scale Editor jako moduł Studio.

- REZZON Studio = struktura, aliasy, rename
- Scale Editor = wartości, formuły

---

## 9. Alias picker dla pojedynczej zmiennej

**Decyzja:** Picker pokazuje wszystkie dostępne zmienne (tego samego typu) – zarówno internal jak i external.

Interfejs jak w Figma Variables: search → lista z kontekstem (sąsiednie zmienne w folderze) → wybór.

---

## 10. Identyfikacja zmiennych przy rename

**Decyzja:** Figma identyfikuje zmienne po ID.

Plugin REZZON Portal przy imporcie:
1. Szuka po `variableId` (priorytet)
2. Jeśli nie znajdzie – szuka po nazwie
3. Jeśli ID się zgadza ale nazwa inna → aktualizuje nazwę (nie tworzy duplikatu)

Rename w REZZON Studio zadziała poprawnie dopóki zachowamy oryginalne `id` z JSON.
