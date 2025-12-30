# REZZON Scale – Roadmapa implementacji

**Status:** v0.2.6 – Generators View funkcjonalny  
**Data aktualizacji:** 2025-12-30

---

## ✅ ZREALIZOWANE

### Faza 0 – Briefing & Mockupy (DONE)

- [x] Grid Briefing kompletny (macierz, formuły, modyfikatory, ratios, responsive)
- [x] Analiza Excel R4_1_GRID.xlsx
- [x] Analiza JSON 1-R4-Grid_2025-12-18.json
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

#### 2.2 Formula Engine (`src/engine/formulas.ts`)
- [x] `buildContext()` – buduje kontekst z base parameters
- [x] `calculateComputed()` – oblicza computed values
- [x] `recalculateAllComputed()` – przelicza wszystkie computed
- [x] Auto-recalculation przy zmianie base parameter

#### 2.3 Token Generator (`src/engine/generator.ts`)
- [x] `generateColumnTokens()` – v-col-1...n, v-full, v-col-viewport
- [x] `applyModifier()` – aplikuje formułę modyfikatora
- [x] `generateColumnTokensWithModifiers()` – tokeny z modyfikatorami
- [x] `generatePhotoWidthTokens()` – w-col-X
- [x] `generatePhotoHeightTokens()` – h-col-X z ratio
- [x] `generateExportData()` – kompletne dane eksportu
- [x] `countTokens()` – zlicza tokeny per warstwa

#### 2.4 Generators View
- [x] Panel Modifiers z CRUD (add/edit/delete)
- [x] Panel Ratio Families z CRUD (add/edit/delete)
- [x] Panel Responsive Variants z CRUD (add/edit/delete)
- [x] Ratio cards per variant (toggle on/off)
- [x] Modifier chips per ratio (checkboxy)
- [x] **Viewport Behaviors** – column override per viewport

#### 2.5 Preview View
- [x] Tabela tokenów z wartościami per style
- [x] Pełna lista tokenów (bez truncacji)
- [x] Filtry: layer, viewport
- [x] Search

#### 2.6 UI Polish (v0.2.5-v0.2.6)
- [x] Left-aligned values (Figma Variables style)
- [x] Smooth opacity transitions for hover actions
- [x] Compact layout (smaller cards, tighter spacing)

```
┌─────────────────────────────────────────────────────────────┐
│  🧪 TEST CHECKPOINT #1 – PASSED                             │
├─────────────────────────────────────────────────────────────┤
│  Zakres: Parameters + Formuły                               │
│  ☑ Macierz renderuje się poprawnie                         │
│  ☑ Edycja base przelicza computed                          │
│  ☑ Generated tokeny się aktualizują                         │
│  ☑ CRUD viewportów/stylów działa                           │
└─────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────┐
│  🧪 TEST CHECKPOINT #2 – PASSED                             │
├─────────────────────────────────────────────────────────────┤
│  Zakres: Generators działa                                  │
│  ☑ CRUD modifiers                                           │
│  ☑ CRUD ratio families                                      │
│  ☑ CRUD responsive variants                                 │
│  ☑ Toggle ratios per variant                                │
│  ☑ Toggle modifiers per ratio                               │
│  ☑ Viewport behaviors (column override)                     │
└─────────────────────────────────────────────────────────────┘
```

---

## 🔄 W TOKU

### Faza 3 – Import/Export (Est. 1-2 dni)

- [ ] Import JSON Scale session
- [ ] Modal importu z drag & drop
- [ ] Format eksportu zgodny z Figma Variables API
- [ ] Metadane Scale w description (do re-importu)
- [ ] Walidacja przed eksportem
- [ ] Modal eksportu z podsumowaniem

### Faza 4 – Preview Polish (Est. 1 dzień)

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
│  □ Import sesji działa                                      │
│  □ Edycja parameters                                        │
│  □ Konfiguracja generators                                  │
│  □ Preview pokazuje wszystko                                │
│  □ Eksport do Figmy (Portal importuje)                     │
│  □ Re-import sesji działa                                   │
│                                                             │
│  🎨 UI feedback: PEŁNY PRZEGLĄD                            │
│  ⚠️  DECISION POINT: Grid MVP wystarczający?                │
└─────────────────────────────────────────────────────────────┘
```

---

## 📋 BLOK 2: POZOSTAŁE SEKCJE

### Faza 5 – Typography
- [ ] Briefing (wywiad)
- [ ] Mockupy HTML
- [ ] Implementacja React

### Faza 6 – Spacing
- [ ] Briefing (wywiad)
- [ ] Mockupy HTML
- [ ] Implementacja React

### Faza 7 – Radii
- [ ] Briefing (wywiad)
- [ ] Mockupy HTML
- [ ] Implementacja React

---

## 📋 BLOK 3: POLISH

### Faza 8 – Persystencja
- [ ] IndexedDB (Dexie.js)
- [ ] Auto-save przy zmianach
- [ ] Restore stanu przy starcie

### Faza 9 – UX Polish
- [ ] Skróty klawiszowe
- [ ] Tooltips
- [ ] Empty states
- [ ] Loading states
- [ ] Error states
- [ ] Toast notifications

### Faza 10 – Optymalizacje
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
│  □ Wszystkie sekcje działają                                │
│  □ Pełny flow z prawdziwymi danymi                          │
│  □ Performance OK                                           │
│  □ UI spójne i dopracowane                                  │
│  □ Brak błędów w konsoli                                    │
└─────────────────────────────────────────────────────────────┘
```

---

## 📊 PODSUMOWANIE POSTĘPU

| Blok | Fazy | Status |
|------|------|--------|
| **Briefing & Mockupy** | 0 | ✅ DONE |
| **Szkielet React** | 1 | ✅ DONE |
| **Grid Core** | 2.1–2.6 | ✅ DONE |
| **Import/Export** | 3 | 🔄 TODO |
| **Preview Polish** | 4 | 🔄 Częściowo |
| **Typography** | 5 | ☐ TODO |
| **Spacing** | 6 | ☐ TODO |
| **Radii** | 7 | ☐ TODO |
| **Polish** | 8–10 | ☐ TODO |

**Szacowany postęp Grid MVP:** ~75%

---

## 🎯 NASTĘPNY KROK

**Faza 3: Import/Export** – funkcjonalność importu sesji + dopracowanie eksportu

Lub alternatywnie: **UI Polish session** – przegląd całości przed kontynuacją
