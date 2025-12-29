# REZZON Scale – Roadmapa implementacji v2

**Status:** Faza 1.1 zakończona (Grid mockupy done)
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
- [x] Briefing v3 zapisany (z hierarchią konfiguracji generatorów)

### Faza 1.1 – Grid Mockupy (DONE)
- [x] Layout główny (header, sidebar, main)
- [x] Parameters view (macierz viewport × styl)
- [x] Generators view (responsive → ratio → modifiers)
- [x] Preview view (tabela tokenów z filtrami)
- [x] Wspólny CSS (rezzon-scale-styles.css)

**Pliki mockupów:**
- `rezzon-scale-v0.1.0-grid-matrix.html`
- `rezzon-scale-v0.1.0-grid-generators.html`
- `rezzon-scale-v0.1.0-grid-preview.html`
- `rezzon-scale-styles.css`

---

## 🔄 BLOK 2: REACT IMPLEMENTACJA

### Faza 2.1 – Szkielet (Est. 1 dzień)
- [ ] Vite + React + TypeScript setup
- [ ] CSS z mockupów (import stylów)
- [ ] Layout + routing (Parameters / Generators / Preview)
- [ ] Zustand store z podstawowymi akcjami
- [ ] TypeScript types dla Grid

### Faza 2.2 – Import i Parser (Est. 1 dzień)
- [ ] Parser JSON R4-Grid
- [ ] Ekstrakcja struktury (viewports, styles, parameters)
- [ ] Ekstrakcja konfiguracji (modifiers, ratios, responsive)
- [ ] Walidacja importu

```
┌─────────────────────────────────────────────────────────────┐
│  🧪 TEST CHECKPOINT #1                                      │
├─────────────────────────────────────────────────────────────┤
│  Zakres: Import działa                                      │
│  Cel: Wczytanie prawdziwego R4-Grid JSON                   │
│                                                             │
│  Checklistka:                                               │
│  □ Import JSON bez błędów                                   │
│  □ Store wypełniony danymi                                  │
│  □ Console.log pokazuje strukturę                           │
└─────────────────────────────────────────────────────────────┘
```

### Faza 2.3 – Parameters View (Est. 2 dni)
- [ ] Sidebar: lista viewportów
- [ ] Macierz: style jako kolumny
- [ ] Sekcje: Base / Computed / Generated
- [ ] Inline editing base values
- [ ] Auto-przeliczanie computed
- [ ] Auto-generowanie tokenów (v-col-1...n)

```
┌─────────────────────────────────────────────────────────────┐
│  🧪 TEST CHECKPOINT #2                                      │
├─────────────────────────────────────────────────────────────┤
│  Zakres: Parameters działa                                  │
│  Cel: Edycja base → przeliczenie computed → generated      │
│                                                             │
│  Checklistka:                                               │
│  □ Macierz renderuje się poprawnie                         │
│  □ Edycja base przelicza computed                          │
│  □ Generated tokeny się aktualizują                         │
│  □ Zmiana viewport przełącza widok                          │
└─────────────────────────────────────────────────────────────┘
```

### Faza 2.4 – Generators View (Est. 2-3 dni)
- [ ] Panel responsive variants (lista, add, edit, delete)
- [ ] Ratio cards per variant (toggle on/off)
- [ ] Modifier chips per ratio (checkboxy)
- [ ] Viewport behavior (dropdown per viewport)
- [ ] Sidebar: globalne definicje modifiers i ratios
- [ ] Add/edit modifier modal
- [ ] Add/edit ratio modal

```
┌─────────────────────────────────────────────────────────────┐
│  🧪 TEST CHECKPOINT #3                                      │
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

### Faza 2.5 – Preview View (Est. 1-2 dni)
- [ ] Tabela tokenów z wartościami per mode
- [ ] Filtry: layer, viewport, responsive, modifier
- [ ] Search
- [ ] Sidebar: warstwy z licznikami
- [ ] Podświetlanie modyfikatorów w nazwach

```
┌─────────────────────────────────────────────────────────────┐
│  🧪 TEST CHECKPOINT #4                                      │
├─────────────────────────────────────────────────────────────┤
│  Zakres: Preview działa                                     │
│  Cel: Podgląd wszystkich wygenerowanych tokenów            │
│                                                             │
│  Checklistka:                                               │
│  □ Wszystkie tokeny się wyświetlają                        │
│  □ Filtry działają                                          │
│  □ Search działa                                            │
│  □ Liczniki w sidebar poprawne                              │
└─────────────────────────────────────────────────────────────┘
```

### Faza 2.6 – Eksport (Est. 1 dzień)
- [ ] Format JSON zgodny z Figma Variables
- [ ] Metadane Scale w description (do ponownego importu)
- [ ] Walidacja przed eksportem
- [ ] Download pliku

### Faza 2.7 – Import sesji (Est. 0.5 dnia)
- [ ] Rozpoznanie typu pliku (Figma vs Scale session)
- [ ] Restore pełnej konfiguracji z sesji

```
┌─────────────────────────────────────────────────────────────┐
│  🧪 TEST CHECKPOINT #5 – GRID MVP                           │
├─────────────────────────────────────────────────────────────┤
│  Zakres: Pełny flow Grid                                    │
│  Cel: Import → Edycja → Generowanie → Eksport              │
│                                                             │
│  Checklistka:                                               │
│  □ Import R4-Grid JSON                                      │
│  □ Edycja parameters                                        │
│  □ Konfiguracja generators                                  │
│  □ Preview pokazuje wszystko                                │
│  □ Eksport do Figmy (Portal importuje)                     │
│  □ Re-import sesji działa                                   │
│                                                             │
│  🎨 UI feedback: PEŁNY PRZEGLĄD                            │
│                                                             │
│  ⚠️  DECISION POINT: Grid MVP wystarczający?                │
└─────────────────────────────────────────────────────────────┘
```

---

## 🔄 BLOK 3: POZOSTAŁE SEKCJE

### Faza 3.1 – Typography
- [ ] Briefing (wywiad)
- [ ] Dostosowanie UI (jeśli potrzebne)
- [ ] Implementacja

### Faza 3.2 – Spacing
- [ ] Briefing (wywiad)
- [ ] Dostosowanie UI (jeśli potrzebne)
- [ ] Implementacja

### Faza 3.3 – Radii
- [ ] Briefing (wywiad)
- [ ] Dostosowanie UI (jeśli potrzebne)
- [ ] Implementacja

---

## 🔄 BLOK 4: POLISH

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
- [ ] Wirtualizacja (jeśli potrzebna przy dużej liczbie tokenów)
- [ ] React.memo
- [ ] Debounce

```
┌─────────────────────────────────────────────────────────────┐
│  🧪 TEST CHECKPOINT #6 – FINAL                              │
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
| **React Grid** | 2.1–2.7 | 🔄 W TOKU |
| **Inne sekcje** | 3.1–3.3 | ☐ TODO |
| **Polish** | 4.1–4.3 | ☐ TODO |

---

## 🎯 NASTĘPNY KROK

**Faza 2.1: Szkielet React**

Vite + React + TypeScript + CSS + Layout + Routing + Store
