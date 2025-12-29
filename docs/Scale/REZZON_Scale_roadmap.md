# REZZON Scale – Roadmapa implementacji

**Status:** Faza 0.1 (Briefing Grid zakończony)
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
- [x] Briefing v2 zapisany

---

## 🔄 BLOK 0: BRIEFING (wywiady)

### Faza 0.2 – Typography Briefing
- [ ] Wywiad pytanie po pytaniu
- [ ] Analiza danych (jeśli są)
- [ ] Briefing zapisany

### Faza 0.3 – Spacing Briefing
- [ ] Wywiad pytanie po pytaniu
- [ ] Analiza danych (jeśli są)
- [ ] Briefing zapisany

### Faza 0.4 – Radii Briefing
- [ ] Wywiad pytanie po pytaniu
- [ ] Analiza danych (jeśli są)
- [ ] Briefing zapisany

```
┌─────────────────────────────────────────────────────────────┐
│  🧪 TEST CHECKPOINT #0                                      │
├─────────────────────────────────────────────────────────────┤
│  Zakres: Wszystkie briefingi                                │
│  Cel: Potwierdzić pełen zakres aplikacji przed mockupami   │
│                                                             │
│  Checklistka:                                               │
│  □ Grid briefing kompletny                                  │
│  □ Typography briefing kompletny                            │
│  □ Spacing briefing kompletny                               │
│  □ Radii briefing kompletny                                 │
│  □ Zasada elastyczności potwierdzona dla wszystkich sekcji │
│                                                             │
│  ⚠️  DECISION POINT: Kolejność mockupów                     │
└─────────────────────────────────────────────────────────────┘
```

---

## 🔄 BLOK 1: HTML MOCKUPY

### Faza 1.1 – Grid Mockup
- [ ] Layout główny (nawigacja sekcji)
- [ ] Macierz viewport × styl
- [ ] Edycja base values
- [ ] Widok computed/generated
- [ ] UI modyfikatorów
- [ ] UI ratio families
- [ ] UI wariantów responsywnych
- [ ] Preview wygenerowanych tokenów

```
┌─────────────────────────────────────────────────────────────┐
│  🧪 TEST CHECKPOINT #1                                      │
├─────────────────────────────────────────────────────────────┤
│  Zakres: Grid mockup                                        │
│  Cel: Walidacja UI przed implementacją                     │
│                                                             │
│  Checklistka:                                               │
│  □ Macierz czytelna i edytowalna                           │
│  □ Typy wartości (#, ƒ, =) rozróżnialne                    │
│  □ Modyfikatory definiowalne                                │
│  □ Ratios definiowalne                                      │
│  □ Responsywność definiowalna                               │
│  □ Preview tokenów działa                                   │
│                                                             │
│  🎨 UI feedback: TAK                                        │
└─────────────────────────────────────────────────────────────┘
```

### Faza 1.2 – Typography Mockup
- [ ] (zakres z briefingu)

### Faza 1.3 – Spacing Mockup
- [ ] (zakres z briefingu)

### Faza 1.4 – Radii Mockup
- [ ] (zakres z briefingu)

```
┌─────────────────────────────────────────────────────────────┐
│  🧪 TEST CHECKPOINT #2                                      │
├─────────────────────────────────────────────────────────────┤
│  Zakres: Wszystkie mockupy                                  │
│  Cel: Spójność UI między sekcjami                          │
│                                                             │
│  Checklistka:                                               │
│  □ Wspólny design system                                    │
│  □ Nawigacja między sekcjami                                │
│  □ Spójne wzorce interakcji                                 │
│                                                             │
│  ⚠️  DECISION POINT: Gotowe do React?                       │
└─────────────────────────────────────────────────────────────┘
```

---

## 🔄 BLOK 2: REACT IMPLEMENTACJA

### Faza 2.1 – Szkielet
- [ ] Vite + React + TypeScript
- [ ] CSS z mockupów (rezzon-scale-styles.css)
- [ ] Layout + routing (Grid / Typography / Spacing / Radii)
- [ ] Zustand store z podstawowymi akcjami
- [ ] TypeScript types

### Faza 2.2 – Grid Core
- [ ] Parser/import danych (JSON/Excel)
- [ ] Macierz viewport × styl (reaktywna)
- [ ] Edycja inline base values
- [ ] Computed values (auto-przeliczanie)
- [ ] Generated tokens (seria v-col-1...n)

### Faza 2.3 – Grid Generators
- [ ] Modyfikatory (UI definiowania + logika generowania)
- [ ] Ratio families (UI + logika)
- [ ] Warianty responsywne (UI + logika)
- [ ] Warstwy output (column, container, photo)
- [ ] Preview wygenerowanych tokenów

```
┌─────────────────────────────────────────────────────────────┐
│  🧪 TEST CHECKPOINT #3                                      │
├─────────────────────────────────────────────────────────────┤
│  Zakres: Grid działa end-to-end                            │
│  Cel: Import → Edycja → Generowanie → Preview              │
│                                                             │
│  Checklistka:                                               │
│  □ Import danych działa                                     │
│  □ Edycja base przelicza computed                          │
│  □ Modyfikatory generują tokeny                             │
│  □ Ratios generują photo tokens                             │
│  □ Responsywność działa                                     │
│  □ Preview pokazuje wszystkie tokeny                        │
│                                                             │
│  🎨 UI feedback: TAK                                        │
└─────────────────────────────────────────────────────────────┘
```

### Faza 2.4 – Typography Core
- [ ] (implementacja wg briefingu)

### Faza 2.5 – Spacing Core
- [ ] (implementacja wg briefingu)

### Faza 2.6 – Radii Core
- [ ] (implementacja wg briefingu)

### Faza 2.7 – Eksport
- [ ] Format JSON (Figma Variables + Scale metadata)
- [ ] Walidacja przed eksportem
- [ ] Download pliku
- [ ] Import sesji (ponowna edycja)

```
┌─────────────────────────────────────────────────────────────┐
│  🧪 TEST CHECKPOINT #4 – MVP                                │
├─────────────────────────────────────────────────────────────┤
│  Zakres: Pełna aplikacja                                    │
│  Cel: Produkcyjne użycie z prawdziwymi danymi REZZON       │
│                                                             │
│  Checklistka:                                               │
│  □ Grid kompletny                                           │
│  □ Typography kompletny                                     │
│  □ Spacing kompletny                                        │
│  □ Radii kompletny                                          │
│  □ Eksport do Figmy działa (Portal importuje)              │
│  □ Import sesji działa (ponowna edycja)                    │
│  □ Test z prawdziwymi danymi REZZON (~3.5k tokenów grid)   │
│                                                             │
│  🎨 UI feedback: PEŁNY PRZEGLĄD                            │
│                                                             │
│  ⚠️  DECISION POINT: MVP wystarczający?                     │
└─────────────────────────────────────────────────────────────┘
```

---

## 🔄 BLOK 3: POLISH

### Faza 3.1 – Persystencja
- [ ] IndexedDB (Dexie.js)
- [ ] Auto-save przy zmianach
- [ ] Restore stanu przy starcie

### Faza 3.2 – UX Polish
- [ ] Skróty klawiszowe
- [ ] Tooltips
- [ ] Empty states
- [ ] Loading states
- [ ] Error states
- [ ] Toast notifications

### Faza 3.3 – Optymalizacje
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
│  □ Pełny flow z prawdziwymi danymi                          │
│  □ Wszystkie edge cases                                     │
│  □ Performance OK                                           │
│  □ UI spójne i dopracowane                                  │
│  □ Brak błędów w konsoli                                    │
│                                                             │
│  🎨 UI feedback: OSTATECZNE POPRAWKI                        │
└─────────────────────────────────────────────────────────────┘
```

---

## 📋 STRATEGIA ZBIERANIA FEEDBACKU

| Typ uwagi | Kiedy zgłaszać | Kiedy naprawiać |
|-----------|----------------|-----------------|
| 🔴 **Blocker** | NATYCHMIAST | NATYCHMIAST |
| 🟠 **Funkcjonalne** | Na checkpoincie | Przed kolejną fazą |
| 🟡 **Wizualne** | Na checkpoincie | Faza 3.2 (Polish) |
| 🟢 **Nice-to-have** | Kiedykolwiek | Backlog |

---

## 📊 PODSUMOWANIE

| Blok | Fazy | Opis |
|------|------|------|
| **Briefing** | 0.1–0.4 | Wywiady dla Grid, Typography, Spacing, Radii |
| **Mockupy** | 1.1–1.4 | HTML mockupy wszystkich sekcji |
| **React** | 2.1–2.7 | Implementacja + eksport |
| **Polish** | 3.1–3.3 | Persystencja, UX, optymalizacje |

---

## 🎯 NASTĘPNY KROK

**Faza 0.2: Typography Briefing**

Wywiad pytanie po pytaniu.
