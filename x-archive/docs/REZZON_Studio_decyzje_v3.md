# REZZON Studio – decyzje projektowe v3

Skompilowany dokument decyzji na podstawie wersji v1 i v2.
Data kompilacji: 2025-12-24

---

## 1. Bulk alias – mechanizm matchowania

**Decyzja:** Użytkownik sam wybiera do których modes (kolumn) zastosować bulk alias.

Przykłady:
- Bulk alias Grid → Viewport: użytkownik zaznacza kolumny 1920, 1366, 768, 390
- Bulk alias Color-Library → Color: użytkownik zaznacza kolumnę TWO

Matchowanie zmiennych odbywa się po **nazwie** – zmienna `Amber/1` w źródle szuka `Amber/1` w celu (w wybranej kolumnie).

---

## 2. Niezmatchowane zmienne przy bulk alias

**Decyzja:** Zbieramy listę "niezmatchowanych" i pokazujemy użytkownikowi po operacji.

- Nie blokujemy operacji
- Nie pomijamy cicho

---

## 3. Disconnect biblioteki

**Decyzja:** Przy disconnect aliasy zostają zamienione na **resolved values**.

**Flow:**
1. Użytkownik wybiera bibliotekę do odłączenia
2. Aplikacja pyta: "Z którego mode'a wziąć resolved values?" (np. Desktop / 1920 / Light)
3. Wszystkie aliasy do tej biblioteki zostają zamienione na konkretne wartości z wybranego mode'a

---

## 4. Restore po disconnect

**Decyzja:** Restore działa również po ponownym imporcie sesji.

### 4.1 Przechowywanie danych o disconnectach

- Dedykowane pole `disconnectedLibraries` w eksporcie sesji
- Nie jako auto-snapshoty (żeby nie zaśmiecać listy snapshotów)
- Zawiera:
  - nazwę biblioteki
  - datę disconnect
  - wybrany mode dla resolved values
  - listę poprzednich mapowań aliasów

**Struktura w eksporcie sesji:**
```json
{
  "disconnectedLibraries": [
    {
      "libraryName": "R4-Color-Library",
      "disconnectedAt": "2025-12-24T14:30:00Z",
      "resolvedWithMode": "1920",
      "previousAliases": [
        {"sourceVar": "path/to/var", "targetVar": "path/to/target"},
        ...
      ]
    }
  ]
}
```

### 4.2 Restore gdy biblioteka zewnętrzna się zmieniła

- Restore pokazuje preview: "X aliasów zostanie przywróconych, Y będzie broken"
- User decyduje czy kontynuować
- Aliasy do usuniętych zmiennych stają się "broken" po Restore

### 4.3 Granularność Restore

- Restore = wszystko albo nic (cała biblioteka naraz)
- Granularna kontrola przez ręczne aliasowanie pojedynczych zmiennych

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

---

## 11. Styl wizualny

**Decyzja:** Dark mode, inspiracja Figma Variables.

### Kolory

| Token | Wartość | Użycie |
|-------|---------|--------|
| `--bg-app` | `#1a1a1a` | Tło aplikacji |
| `--bg-surface` | `#242424` | Tło powierzchni (sidebar, header) |
| `--bg-elevated` | `#2e2e2e` | Tło elevated (hover, karty) |
| `--bg-hover` | `#333333` | Tło hover |
| `--bg-selected` | `rgba(99, 102, 241, 0.15)` | Tło zaznaczenia |
| `--border` | `#3a3a3a` | Obramowania |
| `--border-subtle` | `#2e2e2e` | Subtelne obramowania |
| `--text` | `#f5f5f5` | Tekst główny |
| `--text-secondary` | `#a1a1a1` | Tekst secondary |
| `--text-muted` | `#666666` | Tekst muted |
| `--accent` | `#6366f1` | Akcent (fioletowy) |
| `--green` | `#22c55e` | Success / internal alias |
| `--orange` | `#f59e0b` | Warning / external alias |
| `--red` | `#ef4444` | Error / broken alias |

### Ikony

**Decyzja:** Lucide (SVG inline, stroke-based)

Phosphor Bold odrzucony jako zbyt ciężki wizualnie.

---

## 12. Layout główny

**Decyzja:** 3-kolumnowy layout z collapsible sidebar i toggleable details panel.

| Element | Szerokość |
|---------|-----------|
| Sidebar (Variables) | 240px |
| Sidebar (Aliases) | 260px |
| Sidebar (Snapshots) | 280px |
| Details Panel | 280px (toggleable) |
| Header | 44px (wysokość) |
| Statusbar | 32px (wysokość) |

---

## 13. Type badges

**Decyzja:** Ujednolicone – neutralne szare tło (`#2e2e2e`), różne ikony:

| Typ | Ikona | Uwagi |
|-----|-------|-------|
| Number | `#` (hash) | |
| Boolean | toggle icon | |
| String | `Aa` (text) | |
| Color | wypełniony kwadrat | Kolor = wartość zmiennej, border `#3a3a3a` |

---

## 14. Wyświetlanie aliasów w wartościach

**Decyzja:** Bez badge'ów przy nazwie – rozróżnienie przez kolor tła w komórce wartości:

| Typ aliasu | Tło | Border | Ikona |
|------------|-----|--------|-------|
| Internal | `rgba(34, 197, 94, 0.12)` | `#1a7f42` | arrow-right |
| External | `rgba(245, 158, 11, 0.12)` | `rgba(245, 158, 11, 0.3)` | arrow-square-out |
| Broken | `rgba(239, 68, 68, 0.12)` | `rgba(239, 68, 68, 0.3)` | warning |
| Direct value | brak | brak | brak |

---

## 15. Details panel

**Decyzja:** Toggle przyciskiem w toolbarze, pozostaje aktywny do ręcznego zamknięcia (X).

---

## 16. Filtry

**Decyzja:** Dropdown w toolbarze (nie w sidebar).

Uzasadnienie: Sidebar ma już 3 sekcje, filtry to kontekstowa akcja na widoku tabeli.

---

## 17. Bulk operations feedback

**Decyzja:** Do implementacji – floating bar lub toast na dole ekranu.

- Treść: "X folders, Y variables selected" + przyciski dostępnych akcji
- Pojawia się gdy zaznaczono więcej niż 1 element

---

## 18. Wersjonowanie makiet

**Decyzja:** Semantic versioning dla makiet HTML.

- `v0.x.y` – iteracje makiet
- `v1.0.0` – kompletna makieta gotowa do implementacji

**Aktualna wersja bazowa:** `v0.4.0`

Pliki:
- `rezzon-studio-styles.css`
- `rezzon-studio-v0.4.0-variables.html`
- `rezzon-studio-v0.4.0-aliases.html`
- `rezzon-studio-v0.4.0-snapshots.html`
