# REZZON Scale – Roadmapa implementacji

**Status:** v0.2.8 – Eksport Figma działa  
**Data aktualizacji:** 2025-12-30

---

## ✅ ZREALIZOWANE

### Faza 0 – Briefing & Mockupy (DONE)

- [x] Grid Briefing kompletny (macierz, formuły, modyfikatory, ratios, responsive)
- [x] Analiza Excel R4_1_GRID.xlsx
- [x] Analiza JSON 1-R4-Grid (3590 zmiennych, pełna dokumentacja struktury)
- [x] HTML Mockupy Grid (Parameters, Generators, Preview)
- [x] Wspólny CSS (rezzon-scale-styles.css)

### Faza 1 – Szkielet React (DONE)

- [x] Vite + React 19 + TypeScript setup
- [x] CSS z mockupów (import stylów)
- [x] Layout (Header, Sidebar, Statusbar)
- [x] Routing (tabs: Parameters / Generators / Preview)
- [x] Zustand store z demo danymi
- [x] TypeScript types dla Grid

### Faza 2 – Grid Core (DONE)

#### 2.1 Parameters View
- [x] Sidebar: lista viewportów z CRUD (add/edit/delete)
- [x] Macierz: style jako kolumny z CRUD (add/edit/delete)
- [x] Sekcje: Base / Computed / Generated
- [x] Inline editing base values
- [x] Auto-przeliczanie computed (Formula Engine)
- [x] Auto-generowanie tokenów (v-col-1...n)

#### 2.2 Formula Engine
- [x] `buildContext()` – buduje kontekst z base parameters
- [x] `calculateComputed()` – oblicza computed values
- [x] `recalculateAllComputed()` – przelicza wszystkie computed
- [x] Auto-recalculation przy zmianie base parameter

#### 2.3 Token Generator
- [x] `generateColumnTokens()` – v-col-1...n, v-full, v-col-viewport
- [x] `applyModifier()` – aplikuje formułę modyfikatora
- [x] `generateColumnTokensWithModifiers()` – tokeny z modyfikatorami
- [x] `generatePhotoWidthTokens()` – w-col-X
- [x] `generatePhotoHeightTokens()` – h-col-X z ratio
- [x] `generateFigmaExport()` – format Figma Variables API

#### 2.4 Generators View (globalne listy)
- [x] Panel Modifiers z CRUD
- [x] Panel Ratio Families z CRUD
- [x] Panel Responsive Variants z CRUD
- [x] Viewport Behaviors – column override per viewport

#### 2.5 Preview View
- [x] Tabela tokenów z wartościami per style
- [x] Filtry: layer, viewport
- [x] Search

#### 2.6 Eksport
- [x] Format Figma Variables API (v0.2.8)
- [x] Struktura: collections → modes → variables → valuesByMode

```
┌─────────────────────────────────────────────────────────────┐
│  🧪 TEST CHECKPOINT #1 – PASSED                             │
│  Zakres: Parameters + Formuły + Eksport                     │
│  ☑ Macierz renderuje się poprawnie                         │
│  ☑ Edycja base przelicza computed                          │
│  ☑ Generated tokeny się aktualizują                         │
│  ☑ CRUD viewportów/stylów działa                           │
│  ☑ Eksport Figma działa                                     │
└─────────────────────────────────────────────────────────────┘
```

---

## 🔄 W TOKU

### Faza 3 – Architektura Folderów Output (Est. 3-4 dni)

**Cel:** User sam buduje drzewo folderów, aplikacja jest "głupia".

#### 3.1 Model danych
- [ ] Nowy typ `OutputFolder` z pełną konfiguracją
- [ ] Drzewo folderów zamiast flat listy
- [ ] Powiązania: folder → modifiers, ratios, responsive

#### 3.2 Konfiguracja folderu
- [ ] Ścieżka/nazwa (user tworzy)
- [ ] Token prefix (user ustala)
- [ ] Wybór modifiers z globalnej listy
- [ ] Toggle "Multiply by ratio?" + wybór ratios
- [ ] Wybór responsive variants
- [ ] Toggle "Generate height?" + prefixy width/height

#### 3.3 UI Generators View
- [ ] Drzewo folderów (lewa strona)
- [ ] Panel konfiguracji folderu (prawa strona)
- [ ] Podgląd generowanych tokenów

#### 3.4 Generator refactor
- [ ] Generowanie według konfiguracji folderów
- [ ] Kolejność tokenów = kolejność modifiers
- [ ] Eksport z nową strukturą

```
┌─────────────────────────────────────────────────────────────┐
│  🧪 TEST CHECKPOINT #2 – Architektura folderów              │
├─────────────────────────────────────────────────────────────┤
│  Zakres: Elastyczne foldery output                          │
│                                                             │
│  Checklistka:                                               │
│  ▢ User tworzy własną strukturę folderów                    │
│  ▢ Każdy folder ma własną konfigurację                      │
│  ▢ Modifiers/ratios/responsive przypisane per folder        │
│  ▢ Eksport generuje według konfiguracji                     │
│  ▢ Odtworzenie struktury R4-Grid możliwe                    │
└─────────────────────────────────────────────────────────────┘
```

---

## 📋 BLOK 2: UZUPEŁNIENIA

### Faza 4 – Brakujące warstwy R4-Grid (Est. 2-3 dni)

Po architekturze folderów – walidacja przez odtworzenie R4-Grid:

- [ ] Warstwa container (392 tokeny)
- [ ] Warstwa margin (120 tokenów)
- [ ] Modifier -2G
- [ ] Specjalne tokeny: v-col-0-w-half, v-col-viewport, v-full-w-margin
- [ ] Warianty kondycyjne: -DL, -TM (Desktop-Laptop, Tablet-Mobile)

### Faza 5 – Import/Eksport sesji (Est. 1-2 dni)

- [ ] Import JSON Scale session
- [ ] Modal importu z drag & drop
- [ ] Metadane Scale w eksporcie (do re-importu)
- [ ] Walidacja przed eksportem

### Faza 6 – Preview Polish (Est. 1 dzień)

- [ ] Sidebar: warstwy z licznikami (live update)
- [ ] Podświetlanie modyfikatorów w nazwach
- [ ] Wszystkie warstwy (photo/width, photo/height)
- [ ] Filtry: responsive, modifier

```
┌─────────────────────────────────────────────────────────────┐
│  🧪 TEST CHECKPOINT #3 – GRID MVP                           │
├─────────────────────────────────────────────────────────────┤
│  Zakres: Pełny flow Grid                                    │
│  Cel: Tworzenie → Edycja → Generowanie → Eksport           │
│                                                             │
│  Checklistka:                                               │
│  ▢ Odtworzenie R4-Grid (3590 zmiennych)                     │
│  ▢ Import sesji działa                                      │
│  ▢ Eksport do Figmy (Portal importuje)                     │
│  ▢ Re-import sesji działa                                   │
│                                                             │
│  🎨 UI feedback: PEŁNY PRZEGLĄD                            │
│  ⚠️  DECISION POINT: Grid MVP wystarczający?                │
└─────────────────────────────────────────────────────────────┘
```

---

## 📋 BLOK 3: POZOSTAŁE SEKCJE

### Faza 7 – Typography
- [ ] Briefing (wywiad)
- [ ] Mockupy HTML
- [ ] Implementacja React

### Faza 8 – Spacing
- [ ] Briefing (wywiad)
- [ ] Mockupy HTML
- [ ] Implementacja React

### Faza 9 – Radii
- [ ] Briefing (wywiad)
- [ ] Mockupy HTML
- [ ] Implementacja React

---

## 📋 BLOK 4: POLISH

### Faza 10 – UX
- [ ] Drag & drop (kolejność modifiers, folderów)
- [ ] Skróty klawiszowe
- [ ] Tooltips
- [ ] Empty/Loading/Error states
- [ ] Toast notifications

### Faza 11 – Persystencja
- [ ] IndexedDB (Dexie.js)
- [ ] Auto-save przy zmianach
- [ ] Restore stanu przy starcie

### Faza 12 – Optymalizacje
- [ ] Wirtualizacja (jeśli potrzebna)
- [ ] React.memo
- [ ] Debounce

```
┌─────────────────────────────────────────────────────────────┐
│  🧪 TEST CHECKPOINT #4 – FINAL                              │
├─────────────────────────────────────────────────────────────┤
│  Zakres: Produkcja                                          │
│  Cel: Gotowe do codziennego użytku                         │
│                                                             │
│  Checklistka:                                               │
│  ▢ Wszystkie sekcje działają                                │
│  ▢ Pełny flow z prawdziwymi danymi                          │
│  ▢ Performance OK                                           │
│  ▢ UI spójne i dopracowane                                  │
│  ▢ Brak błędów w konsoli                                    │
└─────────────────────────────────────────────────────────────┘
```

---

## 📊 PODSUMOWANIE POSTĘPU

| Blok | Fazy | Status |
|------|------|--------|
| **Briefing & Mockupy** | 0 | ✅ DONE |
| **Szkielet React** | 1 | ✅ DONE |
| **Grid Core** | 2 | ✅ DONE |
| **Architektura Folderów** | 3 | 🔄 NEXT |
| **Uzupełnienia** | 4-6 | ☐ TODO |
| **Pozostałe sekcje** | 7-9 | ☐ TODO |
| **Polish** | 10-12 | ☐ TODO |

**Szacowany postęp Grid MVP:** ~60%

---

## 🎯 NASTĘPNY KROK

**Faza 3: Architektura Folderów Output**

1. Nowy model danych `OutputFolder`
2. UI drzewa folderów
3. Panel konfiguracji folderu
4. Refactor generatora
