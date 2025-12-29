# REZZON Scale – Roadmapa implementacji v3

**Status:** Faza 2.3 zakończona (Silnik formuł + Generator tokenów)
**Data:** 2025-12-29

---

## ✅ ZREALIZOWANE

### Faza 0.1 – Grid Briefing (DONE)
- [x] Wywiad: macierz viewport × styl
- [x] Wywiad: typy wartości (#, ƒ, =)
- [x] Wywiad: formuły base/computed
- [x] Wywiad: modyfikatory
- [x] Wywiad: photo/ratios
- [x] Wywiad: warianty responsywne
- [x] Wywiad: warstwy output
- [x] Analiza Excel R4_1_GRID.xlsx
- [x] Analiza JSON 1-R4-Grid_2025-12-18.json
- [x] Briefing v3 zapisany

### Faza 1.1 – Grid Mockupy (DONE)
- [x] Layout główny (header, sidebar, main)
- [x] Parameters view (macierz viewport × styl)
- [x] Generators view (responsive → ratio → modifiers)
- [x] Preview view (tabela tokenów z filtrami)
- [x] Wspólny CSS (rezzon-scale-styles.css)

### Faza 2.1 – Szkielet React (DONE)
- [x] Vite + React + TypeScript setup
- [x] CSS z mockupów (import stylów)
- [x] Layout (Header, Sidebar, Statusbar)
- [x] Routing (tabs: Parameters / Generators / Preview)
- [x] Zustand store z demo danymi
- [x] TypeScript types dla Grid

### Faza 2.3 – Silnik formuł + Generator (DONE)
- [x] **Formula Engine** (`src/engine/formulas.ts`):
  - buildContext() – buduje kontekst z base parameters
  - calculateComputed() – oblicza computed values
  - recalculateAllComputed() – przelicza wszystkie computed
  - Auto-recalculation przy zmianie base parameter
- [x] **Token Generator** (`src/engine/generator.ts`):
  - generateColumnTokens() – v-col-1...n, v-full, v-col-viewport
  - applyModifier() – aplikuje modyfikator do wartości
  - generateColumnTokensWithModifiers() – tokeny z modyfikatorami
  - generatePhotoWidthTokens() – w-col-X
  - generatePhotoHeightTokens() – h-col-X z ratio
  - generateExportData() – kompletne dane eksportu
  - countTokens() – zlicza tokeny per warstwa
- [x] **Eksport** – przycisk "Export" pobiera JSON

**Formuły computed:**
```
number-of-gutters = columns - 1
column-width = (viewport - 2×margin-m - (columns-1)×gutter) / columns
ingrid = viewport - 2×margin-m
photo-margin = margin-m - margin-xs
```

**Generowane tokeny:**
```
v-col-1 = column-width × 1 + gutter × 0
v-col-n = column-width × n + gutter × (n-1)
v-full = ingrid
v-full-w-margin = ingrid + 2×photo-margin
v-full-to-edge = viewport
v-col-viewport = viewport
```

---

## 🔄 W TOKU

### Faza 2.2 – Parameters View Polish (Est. 1 dzień)
- [x] Sidebar: lista viewportów
- [x] Macierz: style jako kolumny
- [x] Sekcje: Base / Computed / Generated
- [x] Inline editing base values
- [x] Auto-przeliczanie computed
- [x] Auto-generowanie tokenów (v-col-1...n)
- [ ] Dodawanie/usuwanie viewportów
- [ ] Dodawanie/usuwanie stylów
- [ ] Dodawanie własnych base parameters

```
┌─────────────────────────────────────────────────────────────┐
│  🧪 TEST CHECKPOINT #1                                      │
├─────────────────────────────────────────────────────────────┤
│  Zakres: Parameters + Formuły                               │
│  Cel: Edycja base → przeliczenie computed → generated      │
│                                                             │
│  Checklistka:                                               │
│  ☑ Macierz renderuje się poprawnie                         │
│  ☑ Edycja base przelicza computed                          │
│  ☑ Generated tokeny się aktualizują                         │
│  ☑ Eksport działa                                           │
│  □ CRUD viewportów/stylów                                   │
└─────────────────────────────────────────────────────────────┘
```

### Faza 2.4 – Generators View (Est. 2 dni)
- [ ] Panel responsive variants (lista, add, edit, delete)
- [ ] Ratio cards per variant (toggle on/off)
- [ ] Modifier chips per ratio (checkboxy)
- [ ] Viewport behavior (dropdown per viewport)
- [ ] Sidebar: globalne definicje modifiers i ratios
- [ ] Add/edit modifier modal
- [ ] Add/edit ratio modal

```
┌─────────────────────────────────────────────────────────────┐
│  🧪 TEST CHECKPOINT #2                                      │
├─────────────────────────────────────────────────────────────┤
│  Zakres: Generators działa                                  │
│  Cel: Konfiguracja responsive/ratio/modifiers              │
│                                                             │
│  Checklistka:                                               │
│  □ Dodawanie/edycja responsive variant                      │
│  □ Toggle ratios per variant                                │
│  □ Toggle modifiers per ratio                               │
│  □ Definicje modifiers i ratios edytowalne                 │
│  □ Zmiany wpływają na liczbę tokenów                       │
└─────────────────────────────────────────────────────────────┘
```

### Faza 2.5 – Preview View Polish (Est. 1 dzień)
- [x] Tabela tokenów z wartościami per style
- [x] Filtry: layer, viewport, responsive, modifier
- [x] Search
- [ ] Sidebar: warstwy z licznikami (live update)
- [ ] Podświetlanie modyfikatorów w nazwach
- [ ] Wszystkie warstwy (photo/width, photo/height)

```
┌─────────────────────────────────────────────────────────────┐
│  🧪 TEST CHECKPOINT #3                                      │
├─────────────────────────────────────────────────────────────┤
│  Zakres: Preview działa w pełni                             │
│  Cel: Podgląd wszystkich wygenerowanych tokenów            │
│                                                             │
│  Checklistka:                                               │
│  □ Wszystkie warstwy tokenów się wyświetlają               │
│  □ Filtry działają dla wszystkich warstw                   │
│  □ Search działa                                            │
│  □ Liczniki w sidebar poprawne                              │
└─────────────────────────────────────────────────────────────┘
```

### Faza 2.6 – Eksport do Figmy (Est. 1 dzień)
- [x] Eksport JSON z konfiguracją + tokenami
- [ ] Format zgodny z Figma Variables API
- [ ] Metadane Scale w description (do re-importu)
- [ ] Walidacja przed eksportem
- [ ] Modal eksportu z podsumowaniem

### Faza 2.7 – Import (Est. 1 dzień)
- [ ] Import JSON Scale session
- [ ] Import JSON z Figmy (opcjonalny)
- [ ] Modal importu z drag & drop
- [ ] Walidacja i error handling

```
┌─────────────────────────────────────────────────────────────┐
│  🧪 TEST CHECKPOINT #4 – GRID MVP                           │
├─────────────────────────────────────────────────────────────┤
│  Zakres: Pełny flow Grid                                    │
│  Cel: Tworzenie → Edycja → Generowanie → Eksport           │
│                                                             │
│  Checklistka:                                               │
│  □ Tworzenie viewportów/stylów od zera                     │
│  □ Edycja parameters                                        │
│  □ Konfiguracja generators                                  │
│  □ Preview pokazuje wszystko                                │
│  □ Eksport do Figmy                                        │
│  □ Re-import sesji działa                                   │
│                                                             │
│  🎨 UI feedback: PEŁNY PRZEGLĄD                            │
│                                                             │
│  ⚠️  DECISION POINT: Grid MVP wystarczający?                │
└─────────────────────────────────────────────────────────────┘
```

---

## 📋 BLOK 3: POZOSTAŁE SEKCJE

### Faza 3.1 – Typography
- [ ] Briefing (wywiad)
- [ ] Mockupy HTML
- [ ] Implementacja React

### Faza 3.2 – Spacing
- [ ] Briefing (wywiad)
- [ ] Mockupy HTML
- [ ] Implementacja React

### Faza 3.3 – Radii
- [ ] Briefing (wywiad)
- [ ] Mockupy HTML
- [ ] Implementacja React

---

## 📋 BLOK 4: POLISH

### Faza 4.1 – Persystencja
- [ ] IndexedDB (Dexie.js)
- [ ] Auto-save przy zmianach
- [ ] Restore stanu przy starcie

### Faza 4.2 – UX Polish
- [ ] Skróty klawiszowe
- [ ] Tooltips
- [ ] Empty states
- [ ] Loading states
- [ ] Error states
- [ ] Toast notifications

### Faza 4.3 – Optymalizacje
- [ ] Wirtualizacja (jeśli potrzebna)
- [ ] React.memo
- [ ] Debounce

```
┌─────────────────────────────────────────────────────────────┐
│  🧪 TEST CHECKPOINT #5 – FINAL                              │
├─────────────────────────────────────────────────────────────┤
│  Zakres: Produkcja                                          │
│  Cel: Gotowe do codziennego użytku                         │
│                                                             │
│  Checklistka:                                               │
│  □ Wszystkie sekcje działają                                │
│  □ Pełny flow z prawdziwymi danymi                          │
│  □ Performance OK                                           │
│  □ UI spójne i dopracowane                                  │
│  □ Brak błędów w konsoli                                    │
└─────────────────────────────────────────────────────────────┘
```

---

## 📊 PODSUMOWANIE

| Blok | Fazy | Status |
|------|------|--------|
| **Briefing** | 0.1 | ✅ DONE |
| **Mockupy** | 1.1 | ✅ DONE |
| **React Szkielet** | 2.1 | ✅ DONE |
| **Silnik + Generator** | 2.3 | ✅ DONE |
| **Parameters Polish** | 2.2 | 🔄 Częściowo |
| **Generators View** | 2.4 | ☐ TODO |
| **Preview Polish** | 2.5 | 🔄 Częściowo |
| **Eksport Figma** | 2.6 | 🔄 Częściowo |
| **Import** | 2.7 | ☐ TODO |
| **Inne sekcje** | 3.x | ☐ TODO |
| **Polish** | 4.x | ☐ TODO |

---

## 🎯 NASTĘPNY KROK

**Faza 2.4: Generators View** – pełna funkcjonalność konfiguracji responsive/ratio/modifiers

Lub alternatywnie: **Faza 2.2 dokończenie** – CRUD viewportów/stylów/parameters
