# REZZON Studio — Kontekst dla nowej rozmowy

**Data:** 2025-01-05
**Aktualna wersja:** v0.8.5

---

## 📍 AKTUALNY STAN PROJEKTU

### Zrealizowane fazy:
- ✅ Faza 1 — Szkielet (Vite + React + TypeScript)
- ✅ Faza 2 — Import i wyświetlanie
- ✅ Faza 3 — Selekcja, Search, Filtry
- ✅ Faza 4 — CRUD (rename, delete, duplicate)
- ✅ Faza 5 — Aliasy (~80%: Disconnect/Restore działa ✅)
- ✅ Faza 6 — UNDO/REDO (30 kroków)
- ✅ Faza 8.2 — Eksport do Figmy

### Pozostało (~15-20%):
- 🔲 Faza 5.1-5.2 — Alias Picker trigger (komponenty gotowe, brak triggera w UI)
- 🔲 Faza 8.3 — Eksport sesji
- 🔲 Faza 8.4 — Import sesji
- 🔲 Faza 7 — Snapshots (niski priorytet)
- 🔲 Faza 9 — Wirtualizacja (niski priorytet)

---

## ✅ NAPRAWIONE BUGI (sesja 2025-01-05)

### BUG-CRIT-6 — External count 850 zamiast 947 po restore

**Trzy osobne problemy znalezione i naprawione:**

1. **v0.8.2:** WeakMap cache nie był czyszczony po restore
   - Dodano `clearNameIndexCache()` wywoływane po disconnect/restore

2. **v0.8.4:** Restore nie zapisywał `collectionName` dla aliasów
   - Teraz restore znajduje i zapisuje nazwę kolekcji targetu

3. **v0.8.5:** `findVariableInLibrary` false positive przez short name
   - `Size/Desktop/ref-10` matchowało `Spacing/Desktop/ref-10` przez `ref-10`
   - Usunięto search by short name z funkcji
   - Disconnect teraz rozłącza TYLKO aliasy do wybranej biblioteki

---

## 📂 STRUKTURA PROJEKTU

```
/home/claude/studio/
├── src/
│   ├── components/
│   │   ├── layout/
│   │   │   ├── Header.tsx        ← Import/Export dropdown
│   │   │   ├── DetailsPanel.tsx
│   │   │   ├── VariablesSidebar.tsx
│   │   │   └── Statusbar.tsx
│   │   └── ui/
│   │       ├── CrudModals.tsx    ← BulkRename, Delete, Duplicate, Export
│   │       ├── AliasModals.tsx   ← Disconnect, Restore modals
│   │       ├── AliasPicker.tsx   ← Komponent gotowy, brak triggera
│   │       └── ImportModal.tsx
│   ├── views/
│   │   ├── Variables/index.tsx
│   │   ├── Aliases/index.tsx
│   │   └── Snapshots/index.tsx
│   ├── stores/
│   │   └── appStore.ts           ← Zustand store, cała logika
│   ├── utils/
│   │   ├── figmaParser.ts        ← Import/Export/Validate
│   │   ├── aliasUtils.ts         ← calculateAliasStats, findVariableInLibrary
│   │   └── folderTree.ts
│   └── types/index.ts
├── ROADMAP.md                    ← Wewnętrzna roadmapa
└── package.json                  ← version: 0.8.5
```

---

## 🔑 KLUCZOWE FUNKCJE

### appStore.ts
- `disconnectLibrary()` — zamienia aliasy na resolved values, zapisuje do disconnectedLibraries
- `restoreLibrary()` — przywraca aliasy z previousAliases (+ collectionName)
- Historia UNDO/REDO z limitem 30 kroków

### aliasUtils.ts
- `findVariableInLibrary()` — szuka po ID → pełnej nazwie → nazwie bez prefixu kolekcji
- `calculateAliasStats()` — liczy internal/external/broken (z deduplication)
- `clearNameIndexCache()` — czyści WeakMap cache (wywoływane po disconnect/restore)

### figmaParser.ts
- `exportLibraryToFigma()` — eksport do JSON
- `validateForExport()` — walidacja z użyciem findVariableInLibrary

---

## 📊 DANE TESTOWE

**REZZON (główna biblioteka):**
- 2793 zmiennych
- ~1003 external aliasów (do bibliotek R4-*)
- ~1584 internal aliasów
- ~100 broken aliasów

**Biblioteki R4-*:**
- 1-R4-Grid: 3590 vars
- 2-R4-Spacing Scale: 672 vars (kolekcje: Vertical, Horizontal)
- 3-R4-Typography Scale: 562 vars (kolekcje: Size, Line Height)
- 4-R4-Color Library: 794 vars
- 5-R4-Radii: 60 vars

---

## 🎯 NASTĘPNE KROKI (priorytet)

### 1. Eksport/Import sesji (Faza 8.3 + 8.4) — ~3-4h
- Zapisanie pełnego stanu workspace
- Wczytanie zapisanej sesji

### 2. Alias Picker trigger (Faza 5.1-5.2) — ~1-2h
- Kliknięcie w komórkę aliasu otwiera picker
- Komponenty już gotowe

### 3. Snapshots (Faza 7) — opcjonalne
### 4. Wirtualizacja (Faza 9) — opcjonalne

---

## 💡 WSKAZÓWKI DLA CLAUDE

1. **Projekt znajduje się w:** `/home/claude/studio/`
2. **Główna biblioteka** = REZZON, **towarzyszące** = R4-*
3. **Aliasy external** wskazują z REZZON do bibliotek R4-*
4. **Disconnect/Restore działa poprawnie** po naprawach v0.8.2-v0.8.5
5. **Export dropdown** pozwala wybrać którą bibliotekę eksportować
6. **Nie szukaj po short name** — to powodowało false positive matches

---

## 📋 CHANGELOG (dzisiejsza sesja)

```
v0.8.5 - FIX: findVariableInLibrary false positive (short name)
v0.8.4 - FIX: Restore zapisuje collectionName
v0.8.3 - UX: Export dropdown z listą bibliotek
v0.8.2 - FIX: clearNameIndexCache po disconnect/restore
v0.8.1 - QUALITY: TypeScript improvements merge
v0.8.0 - FEAT: Eksport do Figmy
```
