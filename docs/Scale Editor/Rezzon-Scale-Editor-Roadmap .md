# REZZON Scale Editor – Roadmapa implementacji v1

**Status:** v0.0.24 (Typography, Spacing, Radius zaimplementowane)  
**Data:** 2025-12-25

---

## ✅ ZREALIZOWANE

### Faza 0 – Fundament (DONE)
- [x] Vite + React 19 + TypeScript setup
- [x] Tailwind CSS styling (dark theme)
- [x] Basic layout: Sidebar, Tabs, Toolbar
- [x] Zustand stores architecture
- [x] JSON parser (Figma Variables format)
- [x] Import/Export z walidacją
- [x] Modal component (accessible, focus trap)
- [x] Toast notifications

### Faza 1 – Radius Editor (DONE v0.0.22)
- [x] radiusStore z Zustand
- [x] Formuła: `(ref / 2) × base-value × multiplier[viewport]`
- [x] Edytowalne parametry: base-value, multipliers, pill
- [x] Viewports: Desktop, Laptop, Tablet, Mobile
- [x] Skala ref z computed values
- [x] Import/Export JSON

### Faza 2 – Spacing Editor (DONE v0.0.22)
- [x] spacingStore z Zustand
- [x] Sub-collections: Vertical, Horizontal
- [x] Dynamic group parsing z JSON
- [x] Formuła: `round(ref × scale[type][viewport])`
- [x] Scale parameters per type/viewport
- [x] Skala ref (positive + negative values)

### Faza 3 – Typography Editor (DONE v0.0.24)
- [x] typographyStore z Zustand
- [x] Sub-collections: Size, Line Height
- [x] Formuła Size: `round(ref × scale[viewport])`
- [x] Formuła Line Height: `round(Size × (A + B / Size))`
- [x] Kategorie LH: xl, l, m, s, xs z parametrami A/B
- [x] Dynamic viewport parsing

---

## 🔄 BLOK 1: HTML Mockups

### Faza 4 – Makiety HTML v0.5.0 (Est. 2-3 dni)

#### 4.1 Style bazowe
- [ ] `scale-editor-styles.css` — rozszerzenie Studio styles
- [ ] Komponenty specyficzne: value icons (#, ƒ, =)
- [ ] Tabela z edytowalnymi/computed kolumnami
- [ ] Sub-collections w sidebar

#### 4.2 Radius Mockup
- [ ] `scale-editor-v0.5.0-radius.html`
- [ ] Sidebar: Viewports jako grupy
- [ ] Tabela: ref scale + computed values
- [ ] Parameters section (base-value, multipliers)
- [ ] Ikony: # (base), ƒ (parameter), = (computed)

#### 4.3 Spacing Mockup
- [ ] `scale-editor-v0.5.0-spacing.html`
- [ ] Sidebar: Vertical/Horizontal → Types → Viewports
- [ ] Tabela: ref scale + computed per viewport
- [ ] Scale parameters per type/viewport
- [ ] Negative values handling

#### 4.4 Typography Mockup
- [ ] `scale-editor-v0.5.0-typography.html`
- [ ] Sidebar: Size/Line Height sub-collections
- [ ] Size: ref scale + scale parameters
- [ ] Line Height: kategorie (xl, l, m, s, xs) + A/B params
- [ ] Powiązanie Size → Line Height

```
┌─────────────────────────────────────────────────────────────┐
│  🧪 TEST CHECKPOINT #1 – MOCKUPS REVIEW                     │
├─────────────────────────────────────────────────────────────┤
│  Zakres: Makiety HTML (Radius, Spacing, Typography)         │
│  Cel: Walidacja UI przed implementacją Grid                 │
│                                                             │
│  Checklistka:                                               │
│  □ Layout spójny z REZZON Studio                            │
│  □ Ikony wartości (#, ƒ, =) czytelne                        │
│  □ Sidebar hierarchia intuicyjna                            │
│  □ Tabela: edytowalne vs read-only rozróżnialne             │
│  □ Responsive (opcjonalne)                                  │
│                                                             │
│  🎨 UI feedback: TAK – zbieramy uwagi przed Grid            │
└─────────────────────────────────────────────────────────────┘
```

---

## 🔄 BLOK 2: Grid Editor

### Faza 5 – Grid Editor: Mockup (Est. 2-3 dni)

#### 5.1 Layout specyficzny dla Grid
- [ ] Panel BASE (górny) — 5 parametrów × 4 viewporty
- [ ] Sidebar: drzewo folderów (BASE, column, margin, container, photo)
- [ ] Main: przełącznik Configuration / Table view
- [ ] Computed values w BASE (gutters, ingrid, column width)

#### 5.2 Mockup BASE + auto-generated
- [ ] `scale-editor-v0.5.0-grid-base.html`
- [ ] Formularz BASE per viewport
- [ ] Preview: column/ tokens (v-col-1 do v-col-12 + warianty)
- [ ] Preview: margin/ tokens (v-xs do v-xxxl + -DL/-TM)

#### 5.3 Mockup folder configuration
- [ ] `scale-editor-v0.5.0-grid-folder.html`
- [ ] Sidebar z expanded container/photo
- [ ] Configuration view: responsive exceptions
- [ ] Checkboxy variants (-w-half, -w-margin, -to-edge, -1g, -2g)
- [ ] Photo: ratio dropdowns per viewport

#### 5.4 Modal Create Folder
- [ ] Parent dropdown (container / photo)
- [ ] Folder name input
- [ ] Validation (no duplicates, valid chars)

```
┌─────────────────────────────────────────────────────────────┐
│  🧪 TEST CHECKPOINT #2 – GRID MOCKUP REVIEW                 │
├─────────────────────────────────────────────────────────────┤
│  Zakres: Grid Editor makiety                                │
│  Cel: Walidacja koncepcji UI przed implementacją            │
│                                                             │
│  Checklistka:                                               │
│  □ BASE panel intuicyjny                                    │
│  □ Sidebar folder tree czytelny                             │
│  □ Configuration vs Table view przełączanie                 │
│  □ Responsive exceptions UX OK                              │
│  □ Photo ratio per viewport działa                          │
│  □ Modal Create Folder kompletny                            │
│                                                             │
│  🎨 UI feedback: TAK – krytyczne przed implementacją        │
│                                                             │
│  ⚠️  DECISION POINT: Czy UI Grid jest gotowy do kodu?       │
└─────────────────────────────────────────────────────────────┘
```

---

### Faza 6 – Grid Editor: Store (Est. 3-4 dni)

#### 6.1 gridStore.ts
- [ ] State: BASE values per viewport per mode
- [ ] State: folders (container/, photo/)
- [ ] State: folder configurations (exceptions, variants, ratios)
- [ ] Computed: gutters, ingrid, column width

#### 6.2 Token generation
- [ ] generateColumnTokens(viewport, baseConfig)
- [ ] generateMarginTokens(viewport, baseConfig)
- [ ] generateContainerTokens(folder, baseConfig)
- [ ] generatePhotoTokens(folder, baseConfig) — width + height

#### 6.3 Formuły
- [ ] v-col-n = (n × cw) + ((n-1) × gutter)
- [ ] Warianty: -w-half, -w-margin, -to-edge, -1g, -2g
- [ ] Mobile rule: n > columns → ingrid
- [ ] Photo height: width × (ratio-b / ratio-a)

#### 6.4 Import/Export
- [ ] Parse existing Grid JSON
- [ ] Detect BASE values from JSON
- [ ] Export full Grid JSON (Figma compatible)
- [ ] Config persistence in `description` field

```
┌─────────────────────────────────────────────────────────────┐
│  🧪 TEST CHECKPOINT #3 – GRID STORE                         │
├─────────────────────────────────────────────────────────────┤
│  Zakres: gridStore logic                                    │
│  Cel: Sprawdzić czy formuły działają poprawnie              │
│                                                             │
│  Checklistka:                                               │
│  □ BASE values edytowalne                                   │
│  □ Computed values (gutters, ingrid, cw) poprawne           │
│  □ Column tokens generują się poprawnie                     │
│  □ Margin tokens z wariantami -DL/-TM                       │
│  □ Mobile rule (n > columns → ingrid)                       │
│  □ Photo height z ratio                                     │
│  □ Import existing R4-Grid.json                             │
│  □ Export zgodny z Figma                                    │
│                                                             │
│  🎨 UI feedback: NIE – focus na logice                      │
└─────────────────────────────────────────────────────────────┘
```

---

### Faza 7 – Grid Editor: Components (Est. 3-4 dni)

#### 7.1 GridEditor.tsx
- [ ] Integracja z gridStore
- [ ] Routing: BASE / folder view
- [ ] Sync sidebar selection → main content

#### 7.2 GridBasePanel.tsx
- [ ] Formularz 5 parametrów × 4 viewporty
- [ ] Inputs z walidacją (min/max)
- [ ] Computed values display (read-only)
- [ ] Mode switcher (CROSS, CIRCLE, TRIANGLE, SQUARE)

#### 7.3 GridFolderConfig.tsx
- [ ] Responsive exceptions checkboxes + dropdowns
- [ ] Variants checkboxes
- [ ] Photo: ratio dropdowns per viewport
- [ ] Custom ratio inputs

#### 7.4 GridTokenTable.tsx
- [ ] Tabela wygenerowanych tokenów
- [ ] Kolumny: Name, Desktop, Laptop, Tablet, Mobile
- [ ] Sortowanie po nazwie/wartości
- [ ] Grupowanie per folder

#### 7.5 CreateFolderModal.tsx
- [ ] Parent dropdown
- [ ] Name input z walidacją
- [ ] Submit → dodaje do store

```
┌─────────────────────────────────────────────────────────────┐
│  🧪 TEST CHECKPOINT #4 – GRID EDITOR COMPLETE               │
├─────────────────────────────────────────────────────────────┤
│  Zakres: Pełny Grid Editor                                  │
│  Cel: End-to-end test z prawdziwymi danymi R4-Grid          │
│                                                             │
│  Checklistka:                                               │
│  □ Import R4-Grid.json → rozpoznaje BASE                    │
│  □ Edycja BASE → przelicza wszystkie tokeny                 │
│  □ Tworzenie container folder                               │
│  □ Tworzenie photo folder z ratio                           │
│  □ Responsive exceptions działają                           │
│  □ Eksport → import do Figmy (via plugin)                   │
│  □ Config persistence w description                         │
│                                                             │
│  🎨 UI feedback: TAK – PEŁNY PRZEGLĄD UI                    │
│                                                             │
│  ⚠️  DECISION POINT: Czy Grid Editor jest production-ready? │
└─────────────────────────────────────────────────────────────┘
```

---

## 🔄 BLOK 3: Ulepszenia Core Editors

### Faza 8 – Refactor existing editors (Est. 2-3 dni)

#### 8.1 Ujednolicenie UI
- [ ] Wspólne komponenty: ValueCell, ParameterRow, ComputedRow
- [ ] Spójne ikony (#, ƒ, =) we wszystkich editorach
- [ ] Wspólny styl tabeli

#### 8.2 Spacing Editor improvements
- [ ] Dodanie/usuwanie ref values (modal)
- [ ] Context menu (right-click → delete)
- [ ] Bulk edit scale parameters

#### 8.3 Typography Editor improvements
- [ ] Dodanie/usuwanie ref values
- [ ] Edycja kategorii Line Height
- [ ] Preview font-size w px

#### 8.4 Radius Editor improvements
- [ ] Dynamic viewports (parsowane z JSON)
- [ ] Dodanie/usuwanie ref values

```
┌─────────────────────────────────────────────────────────────┐
│  🧪 TEST CHECKPOINT #5 – UNIFIED EDITORS                    │
├─────────────────────────────────────────────────────────────┤
│  Zakres: Wszystkie 4 edytory                                │
│  Cel: Spójność UI i kompletność funkcji                     │
│                                                             │
│  Checklistka:                                               │
│  □ Radius: dodaj/usuń ref, dynamic viewports                │
│  □ Spacing: dodaj/usuń ref, bulk edit scale                 │
│  □ Typography: dodaj/usuń ref, edycja kategorii LH          │
│  □ Grid: pełna funkcjonalność                               │
│  □ Wspólne komponenty działają wszędzie                     │
│  □ UI spójne między edytorami                               │
│                                                             │
│  🎨 UI feedback: TAK – zbieramy ostatnie uwagi              │
└─────────────────────────────────────────────────────────────┘
```

---

## 🔄 BLOK 4: Safety & Polish

### Faza 9 – UNDO/REDO (Est. 2 dni)

#### 9.1 Historia operacji
- [ ] Wspólny history store dla wszystkich editorów
- [ ] Stack past/future
- [ ] Limit 20-30 kroków
- [ ] Obsługiwane: parameter change, add/remove ref, folder create/delete

#### 9.2 UI
- [ ] Przyciski Undo/Redo w toolbarze
- [ ] Skróty: ⌘Z / ⌘⇧Z
- [ ] Tooltip z opisem operacji

---

### Faza 10 – Keyboard shortcuts (Est. 1 dzień)

- [ ] ⌘K – fokus na search (jeśli jest)
- [ ] ⌘Z / ⌘⇧Z – undo/redo
- [ ] ⌘S – export current editor JSON
- [ ] ⌘I – import JSON
- [ ] Tab – navigate between inputs
- [ ] Enter – confirm edit
- [ ] Esc – cancel edit / close modal

---

### Faza 11 – Polish & QA (Est. 2-3 dni)

#### 11.1 Empty states
- [ ] Pusty editor (no JSON imported)
- [ ] Pusta kolekcja
- [ ] Grid: brak folderów

#### 11.2 Loading states
- [ ] Spinner przy imporcie
- [ ] Skeleton dla tabeli

#### 11.3 Error states
- [ ] Błąd importu (invalid JSON)
- [ ] Błąd walidacji (np. ratio 0)
- [ ] Konflikt nazw (Grid folders)

#### 11.4 UX improvements
- [ ] Tooltips z opisem formuł
- [ ] Toast notifications (success/error)
- [ ] Animacje (expand/collapse, modal)

#### 11.5 Accessibility
- [ ] Focus management
- [ ] Aria labels
- [ ] Keyboard navigation

```
┌─────────────────────────────────────────────────────────────┐
│  🧪 TEST CHECKPOINT #6 – FINAL                              │
├─────────────────────────────────────────────────────────────┤
│  Zakres: Kompletna aplikacja Scale Editor                   │
│  Cel: Produkcyjne użycie z pełnym REZZON                    │
│                                                             │
│  Checklistka:                                               │
│  □ Import wszystkich R4-* bibliotek                         │
│  □ Edycja parametrów → przeliczenie                         │
│  □ Eksport → import do Figmy                                │
│  □ UNDO/REDO działa                                         │
│  □ Keyboard shortcuts                                       │
│  □ Brak błędów w konsoli                                    │
│  □ UI spójne i dopracowane                                  │
│                                                             │
│  🎨 UI feedback: OSTATECZNE POPRAWKI                        │
└─────────────────────────────────────────────────────────────┘
```

---

## 📋 STRATEGIA ZBIERANIA FEEDBACKU UI

### Kiedy zgłaszać uwagi?

| Typ uwagi | Kiedy zgłaszać | Kiedy naprawiać |
|-----------|----------------|-----------------|
| 🔴 **Blocker** (nie można kontynuować) | NATYCHMIAST | NATYCHMIAST |
| 🟠 **Funkcjonalne** (działa źle) | Na checkpoincie | Przed kolejną fazą |
| 🟡 **Wizualne** (wygląda źle) | Na checkpoincie | Faza 11 (Polish) |
| 🟢 **Nice-to-have** (pomysły) | Kiedykolwiek | Backlog |

### Format zgłoszenia

```markdown
## UI Feedback – Checkpoint #X

### 🟠 Funkcjonalne
- Input nie przyjmuje wartości ujemnych
- Computed nie przelicza się po zmianie parametru

### 🟡 Wizualne
- Za mały kontrast ikon # i ƒ
- Brak separatora między sekcjami

### 🟢 Nice-to-have
- Może preview w tooltipie?
```

---

## 📊 PODSUMOWANIE

| Blok | Fazy | Estymacja | Checkpointy |
|------|------|-----------|-------------|
| **Mockups** | 4 | 2-3 dni | #1 |
| **Grid Editor** | 5, 6, 7 | 8-11 dni | #2, #3, #4 |
| **Core Refactor** | 8 | 2-3 dni | #5 |
| **Safety & Polish** | 9, 10, 11 | 5-6 dni | #6 |

**Łącznie:** ~17-23 dni roboczych (od teraz)

**Już zrealizowane:** Fazy 0-3 (Radius, Spacing, Typography)

---

## 🎯 NASTĘPNY KROK

**Faza 4: Makiety HTML v0.5.0**

Kolejność:
1. `scale-editor-styles.css` — wspólne style
2. `scale-editor-v0.5.0-radius.html` — najprostszy (wzorzec)
3. `scale-editor-v0.5.0-spacing.html` — średnia złożoność
4. `scale-editor-v0.5.0-typography.html` — pełna złożoność

Po zakończeniu → **Test Checkpoint #1** z feedbackiem UI.

---

## 📝 BACKLOG (poza MVP)

### Priorytet średni
- [ ] Modes management (add/remove/rename modes)
- [ ] Drag & drop reordering (Grid folders)
- [ ] Duplicate folder (Grid)
- [ ] Compare before/after export

### Priorytet niski
- [ ] Dark/light theme toggle
- [ ] LocalStorage persistence (session restore)
- [ ] Search/filter w tabelach
- [ ] CSV export (dla arkuszy)

---

## 🔗 POWIĄZANE DOKUMENTY

- PRD: `REZZON-Scale-Editor-PRD.md`
- Issues: `GRID-EDITOR-ISSUES.md`
- Changelog: `SCALE-EDITOR-CHANGELOG.md`
- Studio Roadmap: `REZZON_Studio_roadmap.md`
