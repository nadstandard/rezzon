# REZZON Scale Editor — Product Requirements Document

## 1. Problem

Zarządzanie bibliotekami skali w REZZON Design System jest obecnie:

- **Czasochłonne** — zmiana wartości bazowej wymaga ręcznego przeliczenia setek/tysięcy zależnych wartości
- **Podatne na błędy** — łatwo pomylić się przy edycji formuł w arkuszu, brak walidacji
- **Nieelastyczne** — dodanie nowego tagu (np. responsywna proporcja zdjęcia) wymaga ręcznego dodania wierszy i formuł
- **Trudne w utrzymaniu** — wyjątki (np. "na mobile 390 zachowaj się inaczej") są ukryte w komórkach, trzeba pamiętać gdzie są
- **Brak zarządzania strukturą** — zmiana kolejności, nazewnictwa, dodawanie/usuwanie modów wymaga przebudowy arkusza

### Skala problemu

| Biblioteka | Zmiennych | Wartości bazowych | Wyliczanych |
|------------|-----------|-------------------|-------------|
| Grid | ~5,966 | 46 | ~5,920 |
| Spacing (Vertical + Horizontal) | 772 | ~58 | ~714 |
| Typography (Size + Line Height) | 562 | ~31 | ~531 |
| Radius | ~75 | ~7 | ~68 |
| **Razem** | **~7,375** | ~142 | ~7,233 |

### Ograniczenie Figma
- Maksymalnie **10 modów (stylów)** per kolekcja zmiennych

## 2. Rozwiązanie

**REZZON Scale Editor** — aplikacja webowa do zarządzania bibliotekami skali.

### Kluczowe zasady

1. **Edytujesz reguły, nie wartości** — definiujesz logikę raz, aplikacja przelicza wszystko
2. **Wyjątki są jawne** — widzisz co jest standardem, a co wyjątkiem
3. **Zero konsoli** — przyjazny UI, klikasz zamiast pisać komendy
4. **Output to JSON** — kompatybilny z REZZON Portal do importu do Figmy

## 3. Użytkownicy

**Główny użytkownik:** Projektant (właściciel design systemu)

**Potrzeby:**
- Szybko modyfikować wartości bazowe i widzieć efekt
- Dodawać nowe tagi/kombinacje bez ręcznego tworzenia formuł
- Definiować zachowania responsywne (np. "16:9 na desktop → 4:3 na mobile")
- Eksportować gotowy JSON do Figmy

## 4. Funkcje MVP

### 4.1 Struktura aplikacji

Trzy główne sekcje (zakładki):
- **Grid** — siatka, kolumny, kontenery, photo
- **Spacing** — skala Vertical + Horizontal
- **Typography** — Size + Line Height
- **Radius** — promienie zaokrągleń

### 4.2 Zarządzanie modami (stylami)

**Mody to warianty systemu** (np. CROSS, CIRCLE, TRIANGLE, SQUARE, N10).
Każdy mode może mieć inne wartości dla wszystkich parametrów.

**Funkcje:**
- Dodawanie nowego modu (np. "N10" z 10 kolumnami)
- Usuwanie modu
- Zmiana nazwy modu
- Zmiana kolejności modów
- Limit: max 10 modów (ograniczenie Figma)

**Każdy mode definiuje osobno:**
- Parametry per viewport (columns, gutter, margin)
- Proporcje (mogą się różnić między modami!)
- Wartości bazowe dla wszystkich skal

### 4.3 Grid Editor

**Viewporty:**
- desktop (1920)
- laptop (1366)
- tablet (768)
- mobile (390)

**Wartości bazowe (edytowalne, suffix `-edit`):**
Per viewport × per mode:
- `viewport-edit` — szerokość viewport
- `number-of-columns-edit` — liczba kolumn (może być różna per mode!)
- `gutter-width-edit` — szerokość guttera
- `margin-m-edit` — margines główny
- `margin-xs-edit` — margines mały

**Proporcje (per mode, mogą się różnić!):**
- horizontal-a/b (domyślnie 4:3)
- vertical-a/b (domyślnie 3:4)
- square-a/b (domyślnie 1:1)
- panoramic-high-a/b (domyślnie 16:9)
- panoramic-low-a/b (domyślnie 16:5)
- Możliwość dodawania własnych proporcji

**Wartości wyliczane automatycznie:**
- `number-of-gutters` = columns - 1
- `column-width` = (viewport - 2×margin - gutters×gutter) / columns
- `ingrid` = szerokość siatki bez marginesów
- `photo-margin` = margin-m - margin-xs

**Generowane zmienne:**
- `column/*` — szerokości kolumn (1-N, viewport, warianty -w-half, -w-margin, -to-edge)
- `container/*` — szerokości kontenerów + warianty responsywne
- `margin/*` — marginesy
- `photo/*` — width + height dla wszystkich proporcji i kolumn

**Formuła obliczeniowa:**
```
wartość = (DL_Col × column-width) + (DL_Gutter × gutter-width) 
        + (Add_Half × gutter/2) + (Add_Margin × margin-m) 
        + (Add_Edge × margin-xs)
```

### 4.4 Wyjątki i reguły responsywne

**Istniejące wzorce:**
- `to-tab-6-col` — na tablet/mobile zwija do 6 kolumn
- `to-tab-12-col` — na tablet/mobile zwija do pełnego ingrid
- `to-mobile-6-col` — na mobile zwija do połowy (2 kolumny przy 4-kolumnowym mobile)
- `margin-to-tab-*` — jak wyżej ale z marginesem

**Responsywne proporcje (nowe):**
- Możliwość definiowania proporcji per viewport w ramach jednego tagu
- Np. `panoramic-to-horizontal`: 16:9 na desktop → 4:3 na mobile

**Funkcje zarządzania wyjątkami:**
- Dodawanie nowych wyjątków
- Edycja parametrów wyjątku (które viewporty, jakie wartości)
- Usuwanie wyjątków
- Podgląd gdzie wyjątek jest zastosowany

### 4.5 Zarządzanie strukturą

**Zmiana kolejności:**
- Przestawianie zmiennych
- Przestawianie grup (column przed container)
- Przestawianie modów

**Nazewnictwo:**
- Zmiana nazwy tagu (np. `to-tab-6-col` → `collapse-tablet-half`)
- Zmiana nazwy proporcji
- Zmiana prefiksów/struktury ścieżek

**Tworzenie nowych tagów:**
- UI do definiowania nowych kombinacji
- Automatyczne generowanie wszystkich wariantów

### 4.6 Spacing Editor

**Skala referencji (edytowalna):**
- Dodatnie: 2, 4, 6, 8, 10, 12, 14, 16, 18, 20, 24, 32, 40, 48, 56, 64, 72, 80, 96, 128, 160, 192, 224, 256
- Zero: 0
- Ujemne: -2, -4, -6, -8, -10, -12, -14, -16, -18, -20, -24, -32, -40, -48, -56, -64

**Scale per kierunek × typ × viewport:**

| Direction  | Type    | Desktop | Laptop | Tablet | Mobile |
|------------|---------|---------|--------|--------|--------|
| Vertical   | Spacing | 1.0     | 0.9    | 0.82   | 0.72   |
| Vertical   | Padding | 1.0     | 0.9    | 0.82   | 0.72   |
| Horizontal | Spacing | 1.0     | 0.84   | 0.84   | 0.70   |
| Horizontal | Padding | 1.0     | 0.84   | 0.84   | 0.70   |

**Formuła:**
```
Spacing = ref × scale[direction][type][viewport]
```

**Przykład:** ref-16, Vertical/Spacing, Tablet = 16 × 0.82 = 13.12

**Generowane kategorie:**
- `space/spacing/v-spacing-X` — główny spacing (vertical)
- `space/padding-x/v-padding-x-aaX` — padding horizontal
- `space/padding-x-dl/` — padding x dla desktop/laptop
- `space/padding-x-tm/` — padding x dla tablet/mobile
- `space/padding-y/v-padding-y-X` — padding vertical
- `space/padding-y-dl/` — padding y dla desktop/laptop
- `space/padding-y-tm/` — padding y dla tablet/mobile
- `space/break/` — break spacing

### 4.7 Typography Editor

**Wartości bazowe:**
- Skala referencji (edytowalna): 10, 12, 14, 16, 18, 20, 22, 24, 28, 32, 36, 40, 44, 48, 56, 60, 64, 72, 80, 96, 128

**Scale per kontekst × viewport:**

| Context  | Desktop | Laptop | Tablet | Mobile |
|----------|---------|--------|--------|--------|
| on-bg    | 1.0     | 0.9    | 0.8    | 0.7    |
| on-card  | 1.0     | 0.8    | 0.7    | 0.6    |

**Formuła Size:**
```
Size = ref × scale[context][viewport]
```

**Przykład:** ref-16, on-bg, Tablet = 16 × 0.8 = 12.8

---

**Line Height — nieliniowa krzywa:**

```
Line Height = Size × (A + B / Size)
```

**Parametry A/B per kategoria:**

| Kategoria | A    | B | Opis |
|-----------|------|---|------|
| xl        | 1.40 | 6 | Najluźniejszy |
| l         | 1.35 | 4 | Luźny |
| m         | 1.25 | 2 | Średni |
| s         | 1.02 | 2 | Ciasny |
| xs        | 1.00 | 0 | Tight (LH = Size) |

**Przykład:** Size=10, kategoria xl = 10 × (1.4 + 6/10) = 10 × 2.0 = 20

**Generowane:**
- `typography/base/ref-X` — wartości bazowe
- `typography/base/scale/on-bg/size-parameter` — parametry scale
- `typography/on-bg/v-size-X` — wyliczone size per kontekst/viewport
- `typography/on-card/v-size-X`
- `typography/on-bg/v-lineH-X-{xl|l|m|s|xs}` — line height per size i kategoria

### 4.8 Radius Editor

**Wartości bazowe:**
- `base-value` = 2 (jednostka bazowa)
- `base-pill` = 999 (dla pill buttons)
- `base-multiplier` per viewport:

| Viewport | Multiplier |
|----------|------------|
| Desktop  | 1.0        |
| Laptop   | 0.9        |
| Tablet   | 0.85       |
| Mobile   | 0.8        |

**Skala ref (edytowalna):**
0, 2, 4, 6, 8, 10, 12, 14, 16, 18, 20, 24, 32, 40, 48, 56, 64, pill

**Formuła:**
```
Radius = (ref / 2) × base-value × base-multiplier[viewport]
```

**Przykład:** ref-16 na Laptop = (16/2) × 2 × 0.9 = 14.4

**Generowane:**
- `radius/v-0`, `radius/v-2`, ... `radius/v-64`, `radius/v-pill`
- `radius/base-value`, `radius/base-pill`, `radius/base-multiplier`

### 4.10 Zarządzanie skalą bazową (Base Scale)

Każda biblioteka ma skalę referencji (ref-X). Scale Editor pozwala:

**Operacje:**
- Dodać nowy stopień (np. ref-288)
- Usunąć istniejący stopień
- Zmienić wartość stopnia (np. ref-96 → ref-100)
- Zmienić kolejność

**Po zmianie skali bazowej:**
- Wszystkie zależne wartości przeliczają się automatycznie
- JSON output zawiera nowe/zmienione zmienne

**Uwaga:** Usunięcie stopnia może złamać istniejące referencje w Figma. Scale Editor powinien ostrzegać przed destrukcyjnymi zmianami.

### 4.11 Eksport

- Przycisk "Eksportuj" per sekcja lub wszystko razem
- Format JSON kompatybilny z REZZON Portal
- Możliwość pobrania pliku lub kopiowania do schowka
- Walidacja przed eksportem

## 5. User Flow

```
1. Otwierasz aplikację
2. Wybierasz sekcję (Grid / Spacing / Typography)
3. Widzisz wartości bazowe — edytujesz co trzeba
4. Widzisz podgląd wygenerowanych wartości
5. Definiujesz reguły/wyjątki jeśli potrzeba
6. Klikasz "Eksportuj"
7. Pobierasz JSON
8. Importujesz przez REZZON Portal do Figmy
```

## 6. Wymagania techniczne

### Stack (propozycja)
- **Frontend:** React + TypeScript
- **UI:** Tailwind CSS + shadcn/ui
- **State:** Zustand lub React Context
- **Bez backendu** — wszystko działa lokalnie w przeglądarce
- **Persystencja:** localStorage lub eksport/import configu

### Format danych

Input (config):
```json
{
  "grid": {
    "viewports": {
      "1920": { "columns": 12, "gutter": 24, "margin_m": 204 },
      "1366": { "columns": 12, "gutter": 20, "margin_m": 45 }
    },
    "modes": {
      "CROSS": { ... },
      "CIRCLE": { ... }
    },
    "rules": { ... }
  }
}
```

Output (JSON dla Figma):
```json
{
  "version": "1.0",
  "collections": [
    {
      "name": "Grid",
      "modes": ["CROSS", "CIRCLE", "TRIANGLE", "SQUARE"],
      "variables": [...]
    }
  ]
}
```

## 7. UI Design

### 7.1 Referencja
UI wzorowany na **Figma Variables panel** — sprawdzony wzorzec, znajomy dla projektantów.

### 7.2 Layout

```
┌─────────────────────────────────────────────────────────────┐
│  [Typography Scale] [Spacing Scale] [Grid] [Radius]  tabs   │
├──────────────┬──────────────────────────────────────────────┤
│ COLLECTIONS  │  Radius                    [ƒ] [Import] [Export] │
│ Typography   │  ───────────────────────────────────────────  │
│ Spacing      │  Name          │ CROSS │ CIRCLE │ TRIANGLE │ │
│ Grid         │  ─────────────────────────────────────────── │
│ ● Radius     │  BASE                                        │
│              │  # base-value  │  2    │   2    │    2     │ │
│ GROUPS       │  # base-pill   │ 999   │  999   │   999    │ │
│ ● All        │  ─────────────────────────────────────────── │
│   Base       │  MULTIPLIER                                  │
│   Multiplier │  ƒ Desktop     │ 1.0   │  1.0   │   1.0    │ │
│   Ref Scale  │  ƒ Laptop      │ 0.9   │  0.9   │   0.9    │ │
│   Values     │  ─────────────────────────────────────────── │
│     Desktop  │  VALUES / DESKTOP                            │
│     Laptop   │  = v-16        │  16   │   16   │    16    │ │
│     Tablet   │  = v-32        │  32   │   32   │    32    │ │
│     Mobile   │  ─────────────────────────────────────────── │
│              │  + Add ref value                             │
└──────────────┴──────────────────────────────────────────────┘
```

### 7.3 Elementy UI

**Sidebar (lewy):**
- Collections — lista bibliotek (Typography, Spacing, Grid, Radius)
- Groups — hierarchia grup w wybranej kolekcji
- Countery pokazujące liczbę zmiennych

**Main area (prawy):**
- Tabs — przełączanie między kolekcjami
- Toolbar — tytuł + formuła (tooltip) + Import/Export
- Tabela — mody jako kolumny, zmienne jako wiersze

**Ikony typów wartości:**
- `#` — wartość bazowa (edytowalna)
- `ƒ` — parametr/mnożnik (edytowalny)
- `=` — wartość wyliczona (zielona, read-only)

### 7.4 Zachowania scrollowania

- **Kolumna Name** — sticky horizontal (przyklejona do lewej przy scrollu poziomym)
- **Nagłówki grup** (Base, Scale, Values/Desktop) — sticky horizontal
- **Nagłówek tabeli** (Name, CROSS, CIRCLE...) — sticky vertical (przyklejony do góry)
- **Scrollbar** — ciemny, dopasowany do dark theme

### 7.5 Import plików

**Drag & drop** wielu plików jednocześnie.

**Rozpoznawanie typu po nazwie pliku:**
- `R4-Typography*.json` → zakładka Typography
- `R4-Spacing*.json` → zakładka Spacing
- `R4-Grid*.json` → zakładka Grid
- `R4-Radius*.json` → zakładka Radius

**Automatyczne wykrywanie modów** z JSON — ile kolumn w pliku, tyle kolumn w tabeli (max 10).

### 7.6 Makiety

Statyczne makiety HTML dostępne w:
- `docs/mockups/typography-mockup.html`
- `docs/mockups/radius-mockup.html`

## 8. Czego NIE robimy w MVP

- Edycja biblioteki głównej (REZZON) — tylko biblioteki towarzyszące
- Edycja kolorów — to inna kategoria (wybór, nie obliczenia)
- Sync z Figma w czasie rzeczywistym — eksport ręczny przez JSON
- Multi-user / collaboration
- Historia zmian / undo (poza standardowym browser undo)

## 9. Metryki sukcesu

- Czas dodania nowego tagu: z godzin → minuty
- Czas zmiany wartości bazowej: z godzin → sekundy
- Błędy przy przeliczeniach: z "zdarza się" → zero (automatyczne)
- Frustracja użytkownika: z wysokiej → niska

## 10. Otwarte pytania

1. **Persystencja:** localStorage wystarczy, czy potrzebny eksport/import configu?
2. **Walidacja:** Jakie błędy pokazywać? (np. kolumna > viewport)
3. **Tworzenie nowych tagów:** Dokładny UX do zaprojektowania w trakcie budowy
4. **Import z Figma:** Czy Scale Editor ma umieć wczytać istniejący JSON z REZZON Portal?
5. **Historia zmian:** Czy potrzebny undo/redo wykraczający poza browser?

## 11. Kolejność implementacji

1. **Faza 1:** Radius (najprostszy, ~75 zmiennych) — walidacja podejścia
2. **Faza 2:** Typography (średni, 562 zmienne, 2 formuły)
3. **Faza 3:** Spacing (772 zmienne, prosta formuła)
4. **Faza 4:** Grid (najtrudniejszy, ~6000 zmiennych, wyjątki, photo)
5. **Faza 5:** Integracja w jeden UI + zarządzanie modami

---

**Wersja:** 0.4
**Data:** 2025-12-17
**Autor:** Claude + Marcin

**Changelog:**
- 0.4: Dodano sekcję 7 (UI Design) — layout, elementy, scrollowanie, import plików, makiety
- 0.3: Dodano szczegółowe formuły i parametry na podstawie analizy xlsx (Radius, Typography, Spacing)
- 0.2: Dodano zarządzanie modami, strukturą, responsywnymi proporcjami
- 0.1: Wersja inicjalna
