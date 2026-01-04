# REZZON Scale – Roadmapa implementacji

**Status:** v0.3.7 – Architektura uproszczona  
**Data aktualizacji:** 2025-01-02 (v2)

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
- [x] Viewport Behaviors – column override per viewport (UI gotowe)

#### 2.5 Preview View
- [x] Tabela tokenów z wartościami per style
- [x] Filtry: layer, viewport
- [x] Search

#### 2.6 Eksport
- [x] Format Figma Variables API (v0.2.8)
- [x] Struktura: collections → modes → variables → valuesByMode

### Faza 3 – Architektura Folderów Output (DONE)

- [x] Nowy typ `OutputFolder` z pełną konfiguracją
- [x] Drzewo folderów zamiast flat listy
- [x] UI drzewa folderów (lewa strona)
- [x] Panel konfiguracji folderu (prawa strona)
- [x] Generator według konfiguracji folderów
- [x] Podgląd generowanych tokenów

### Faza 3.5 – Uproszczenia architektury (DONE - v0.3.7)

- [x] Usunięto `generateHeight` toggle
- [x] Usunięto `widthPrefix` / `heightPrefix` (zastąpione `tokenPrefix`)
- [x] Jeden ratio na folder (radio buttons)
- [x] Ukryto UI Responsive Variants (do reimplementacji)

```
┌─────────────────────────────────────────────────────────────┐
│  🧪 TEST CHECKPOINT #2 – PASSED                             │
│  Zakres: Architektura folderów + uproszczenia               │
│  ☑ User tworzy własną strukturę folderów                    │
│  ☑ Każdy folder ma własną konfigurację                      │
│  ☑ Modifiers przypisane per folder                          │
│  ☑ Ratio multiplication działa (jeden ratio)                │
│  ☑ Eksport generuje według konfiguracji                     │
└─────────────────────────────────────────────────────────────┘
```

---

## 🔄 W TOKU

### Faza 4 – Responsive Variants w generatorze (Est. 2-3 dni)

**Problem:** Typy `ViewportBehavior` i `ResponsiveVariant` są gotowe, ale generator ich **NIE UŻYWA**.

**Cel:** Implementacja mechanizmu "collapse to N columns" w generatorze.

#### ✅ PODJĘTE DECYZJE (2025-01-03)

| # | Pytanie | Decyzja |
|---|---------|---------|
| **O1** | Gdzie żyją definicje wariantów? | **Globalnie** (checkbox per folder) |
| **O2** | Czy "static" wbudowany? | **Nie** (user tworzy sam) |
| **O3** | Override columns – skąd opcje? | **Dynamicznie z maxColumns** |
| **O4** | Nazewnictwo wariantu | **Ręczne** |
| **O5** | Nazewnictwo ścieżek | **Placeholder `{responsive}`** jako mnożnik |

**Szczegóły w:** `REZZON_Scale_decyzje.md` → sekcja "PODJĘTE DECYZJE"

#### 4.1 Analiza (DONE)
- [x] Zrozumienie struktury R4-Grid JSON
- [x] Dokumentacja mechanizmu ViewportBehaviors
- [x] Identyfikacja luk w generatorze
- [x] Propozycja UI dla Responsive Variants Editor
- [x] Podjęcie decyzji O1-O5

#### 4.2 UI – Responsive Variants Editor
- [ ] Panel globalnych definicji wariantów
- [ ] Tabela ViewportBehaviors per variant (Inherit/Override radio)
- [ ] Dropdown columns (dynamicznie z maxColumns)
- [ ] Nazwa wariantu (ręczna)
- [ ] Checkbox włączania wariantów per folder
- [ ] Obsługa placeholdera `{responsive}` w ścieżce

```
┌──────────────────────────────────────────────────────────────┐
│ RESPONSIVE VARIANTS                                   [+ Add]│
├──────────────────────────────────────────────────────────────┤
│ ┌──────────────────────────────────────────────────────────┐ │
│ │ static                                          [✎] [🗑] │ │
│ │  Desktop: Inherit  Laptop: Inherit                       │ │
│ │  Tablet: Inherit   Mobile: Inherit                       │ │
│ └──────────────────────────────────────────────────────────┘ │
│ ┌──────────────────────────────────────────────────────────┐ │
│ │ to-tab-6-col                                    [✎] [🗑] │ │
│ │  Desktop: Inherit  Laptop: Inherit                       │ │
│ │  Tablet: Override→6  Mobile: Override→6                  │ │
│ └──────────────────────────────────────────────────────────┘ │
└──────────────────────────────────────────────────────────────┘

OUTPUT FOLDER:
path: "photo/{viewport}/width/{responsive}"
Responsive Variants: ☑ static ☑ to-tab-6-col ☐ heading
```

#### 4.3 Implementacja generatora
- [ ] Iteracja po `enabledResponsiveVariants` w folderze
- [ ] Pobieranie `viewportBehaviors` dla każdego variant
- [ ] Logika: `inherit` vs `override` columns
- [ ] Generowanie ścieżek z responsive variant w nazwie (placeholder `{responsive}`)
- [ ] Obliczanie wartości z `overrideColumns`

#### 4.4 Logika collapse
```typescript
// Pseudokod
for (variant of folder.enabledResponsiveVariants) {
  for (viewport of viewports) {
    const behavior = variant.viewportBehaviors[viewport.id];
    
    if (behavior === 'inherit') {
      // Normalne wartości
      columns = style.columns;
    } else {
      // Collapse: WSZYSTKIE tokeny = wartość dla N kolumn
      columns = behavior.overrideColumns;
    }
    
    generateTokens(folder, viewport, variant, columns);
  }
}
```

```
┌─────────────────────────────────────────────────────────────┐
│  🧪 TEST CHECKPOINT #3 – Responsive Variants                │
├─────────────────────────────────────────────────────────────┤
│  Zakres: Pełny flow z responsive variants                   │
│                                                             │
│  Checklistka:                                               │
│  ☐ Variant "static" generuje normalne wartości              │
│  ☐ Variant "to-tab-6-col" kolapsuje tablet/mobile do 6 col  │
│  ☐ Eksport zawiera subfoldery responsive                    │
│  ☐ Wartości collapse są poprawne (sprawdzić z JSON R4-Grid) │
│  ☐ UI pozwala konfigurować ViewportBehaviors                │
│  ☐ Nazewnictwo ścieżek zgodne z R4-Grid                     │
└─────────────────────────────────────────────────────────────┘
```

---

## 📋 BLOK 2: WALIDACJA I UZUPEŁNIENIA

### Faza 5 – Brakujące warstwy R4-Grid (Est. 2-3 dni)

Po responsive variants – walidacja przez odtworzenie R4-Grid:

- [ ] Warstwa container (392 tokeny)
- [ ] Warstwa margin (120 tokenów)
- [ ] Modifier -2G
- [ ] Specjalne tokeny: v-col-0-w-half, v-col-viewport, v-full-w-margin
- [ ] Warianty kondycyjne: -DL, -TM (Desktop-Laptop, Tablet-Mobile)

### Faza 6 – Import/Eksport sesji (Est. 1-2 dni)

- [ ] Import JSON Scale session
- [ ] Modal importu z drag & drop
- [ ] Metadane Scale w eksporcie (do re-importu)
- [ ] Walidacja przed eksportem

### Faza 7 – Preview Polish (Est. 1 dzień)

- [ ] Sidebar: warstwy z licznikami (live update)
- [ ] Podświetlanie modyfikatorów w nazwach
- [ ] Wszystkie warstwy (photo/width, photo/height)
- [ ] Filtry: responsive, modifier

```
┌─────────────────────────────────────────────────────────────┐
│  🧪 TEST CHECKPOINT #4 – GRID MVP                           │
├─────────────────────────────────────────────────────────────┤
│  Zakres: Pełny flow Grid                                    │
│  Cel: Tworzenie → Edycja → Generowanie → Eksport            │
│                                                             │
│  Checklistka:                                               │
│  ☐ Odtworzenie R4-Grid (3590 zmiennych)                     │
│  ☐ Import sesji działa                                      │
│  ☐ Eksport do Figmy (Portal importuje)                      │
│  ☐ Re-import sesji działa                                   │
│                                                             │
│  🎨 UI feedback: PEŁNY PRZEGLĄD                             │
│  ⚠️  DECISION POINT: Grid MVP wystarczający?                │
└─────────────────────────────────────────────────────────────┘
```

---

## 📋 BLOK 3: POZOSTAŁE SEKCJE

### Faza 8 – Typography
- [ ] Briefing (wywiad)
- [ ] Mockupy HTML
- [ ] Implementacja React

### Faza 9 – Spacing
- [ ] Briefing (wywiad)
- [ ] Mockupy HTML
- [ ] Implementacja React

### Faza 10 – Radii
- [ ] Briefing (wywiad)
- [ ] Mockupy HTML
- [ ] Implementacja React

---

## 📋 BLOK 4: POLISH

### Faza 11 – UX
- [ ] Drag & drop (kolejność modifiers, folderów)
- [ ] Skróty klawiszowe
- [ ] Tooltips
- [ ] Empty/Loading/Error states
- [ ] Toast notifications

### Faza 12 – Persystencja
- [ ] IndexedDB (Dexie.js)
- [ ] Auto-save przy zmianach
- [ ] Restore stanu przy starcie

### Faza 13 – Optymalizacje
- [ ] Wirtualizacja (jeśli potrzebna)
- [ ] React.memo
- [ ] Debounce

```
┌─────────────────────────────────────────────────────────────┐
│  🧪 TEST CHECKPOINT #5 – FINAL                              │
├─────────────────────────────────────────────────────────────┤
│  Zakres: Produkcja                                          │
│  Cel: Gotowe do codziennego użytku                          │
│                                                             │
│  Checklistka:                                               │
│  ☐ Wszystkie sekcje działają                                │
│  ☐ Pełny flow z prawdziwymi danymi                          │
│  ☐ Performance OK                                           │
│  ☐ UI spójne i dopracowane                                  │
│  ☐ Brak błędów w konsoli                                    │
└─────────────────────────────────────────────────────────────┘
```

---

## 📊 PODSUMOWANIE POSTĘPU

| Blok | Fazy | Status |
|------|------|--------|
| **Briefing & Mockupy** | 0 | ✅ DONE |
| **Szkielet React** | 1 | ✅ DONE |
| **Grid Core** | 2 | ✅ DONE |
| **Architektura Folderów** | 3, 3.5 | ✅ DONE |
| **Responsive Variants** | 4 | 🔄 NEXT |
| **Walidacja R4-Grid** | 5-7 | ☐ TODO |
| **Pozostałe sekcje** | 8-10 | ☐ TODO |
| **Polish** | 11-13 | ☐ TODO |

**Szacowany postęp Grid MVP:** ~70%

---

## 🎯 NASTĘPNY KROK

**Faza 4: Responsive Variants w generatorze**

1. Implementacja logiki `inherit` / `override` w `generateAllTokensForFolder()`
2. Iteracja po `enabledResponsiveVariants`
3. Sprawdzanie `viewportBehaviors` dla każdego viewport
4. Generowanie ścieżek z responsive variant
5. Test na danych R4-Grid

---

## 📝 ZNANE PROBLEMY

### Generator ignoruje responsive variants

**Lokalizacja:** `src/engine/generator.ts`, linia 1153-1154

```typescript
// For now, skip responsive variants (will be redesigned later)
// Just generate tokens per viewport
```

**Do naprawy w Fazie 4.**
