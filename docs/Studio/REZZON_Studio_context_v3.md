# REZZON Studio — Kontekst dla nowej rozmowy

**Data:** 2025-01-12
**Aktualna wersja:** v0.8.8

---

## 📍 AKTUALNY STAN PROJEKTU

### Zrealizowane fazy:
- ✅ Faza 1 — Szkielet (Vite + React + TypeScript)
- ✅ Faza 2 — Import i wyświetlanie
- ✅ Faza 3 — Selekcja, Search, Filtry
- ✅ Faza 4 — CRUD (rename, delete, duplicate)
- ✅ Faza 5 — Aliasy (~85%: Disconnect/Restore naprawione ✅)
- ✅ Faza 6 — UNDO/REDO (30 kroków)
- ✅ Faza 8.2 — Eksport do Figmy
- ✅ Faza 8.3 — Eksport sesji
- ✅ Faza 8.4 — Import sesji

### Pozostało (~10-15%):
- 🔲 Faza 5.1-5.2 — Alias Picker trigger (komponenty gotowe, brak triggera w UI)
- 🔲 Faza 7 — Snapshots (niski priorytet)
- 🔲 Faza 9 — Wirtualizacja (niski priorytet)

---

## ✅ NAPRAWIONE BUGI (sesja 2025-01-12)

### BUG-CRIT-7 — variableId mismatches po restore (360 aliasów)

**Problem:** Po restore aliasy miały ZŁĄE `variableId` - lokalne ID zamiast publicznych.

**Root cause (3 problemy):**

1. **v0.8.7:** `detectFileType` nie rozpoznawał formatu REZZON Portal
   - Sprawdzał tylko `variableCollections` (natywny Figma)
   - Dodano obsługę `collections` array (format REZZON Portal)

2. **v0.8.7:** Duplikaty nazw w różnych kolekcjach (np. R4-Spacing-Scale)
   - `Vertical/Spacing/Desktop/ref-0` vs `Horizontal/Spacing/Desktop/ref-0`
   - `findVariableInLibrary` fallback po nazwie znajdował ZŁĄĄ zmienną
   - Dodano `collectionNameIndex` (composite key: `CollectionName/VariableName`)
   - `findVariableInLibrary` przyjmuje opcjonalny `collectionName`

3. **v0.8.8:** Disconnect zapisywał lokalne ID zamiast publicznych
   - `targetVar.id` (lokalne: `VariableID:1:61`) zamiast `value.variableId` (publiczne)
   - Restore używał bezpośredniego lookup który nie działał
   - Teraz disconnect zapisuje oryginalne publiczne ID + `targetVarName`
   - Restore używa `findVariableInLibrary(lib, id, name, collectionName)`

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
│   │   ├── figmaParser.ts        ← Import/Export/Validate + detectFileType
│   │   ├── aliasUtils.ts         ← calculateAliasStats, findVariableInLibrary, collectionNameIndex
│   │   └── folderTree.ts
│   └── types/index.ts            ← DisconnectedLibrary z targetVarName
├── ROADMAP.md                    ← Wewnętrzna roadmapa
└── package.json                  ← version: 0.8.8
```

---

## 🔑 KLUCZOWE FUNKCJE

### appStore.ts
- `disconnectLibrary()` — zamienia aliasy na resolved values, zapisuje publiczne ID + targetVarName + collectionName
- `restoreLibrary()` — używa `findVariableInLibrary(lib, id, name, collectionName)` do znalezienia targetu

### aliasUtils.ts
- `findVariableInLibrary(lib, id, name?, collectionName?)` — szuka po ID → collectionNameIndex → nameIndex
- `collectionNameIndex` — composite key `CollectionName/VariableName` dla rozróżnienia duplikatów
- `clearNameIndexCache()` — czyści oba cache (wywoływane po disconnect/restore)

### figmaParser.ts
- `detectFileType()` — rozpoznaje format: session / figma (natywny) / figma (REZZON Portal)
- `exportLibraryToFigma()` — eksport do JSON
- `validateForExport()` — walidacja z użyciem findVariableInLibrary

### types/index.ts
- `DisconnectedLibrary.previousAliases` zawiera teraz:
  - `sourceVar`, `targetVar` (publiczne ID)
  - `targetVarName` (nazwa zmiennej - do wyszukiwania)
  - `targetCollectionName` (nazwa kolekcji - do rozróżnienia duplikatów)
  - `modeId`

---

## 📊 DANE TESTOWE

**REZZON (główna biblioteka):**
- 2793 zmiennych
- ~1115 external aliasów (do bibliotek R4-*)
- ~2470 internal aliasów

**Biblioteki R4-*:**
- 1-R4-Grid: 3590 vars
- 2-R4-Spacing-Scale: 672 vars (kolekcje: Vertical, Horizontal) ← DUPLIKATY NAZW!
- 3-R4-Typography-Scale: 562 vars (kolekcje: Size, Line Height)
- 4-R4-Color-Library: 794 vars
- 5-R4-Radii: 60 vars

---

## 🎯 NASTĘPNE KROKI (priorytet)

### 1. Przetestować v0.8.8 disconnect/restore
- Import wszystkich bibliotek
- Disconnect R4-Spacing-Scale
- Restore R4-Spacing-Scale
- Sprawdzić czy External count wraca do 1115 (nie 755)
- Sprawdzić czy variableId są identyczne przed/po

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
4. **Problem z duplikatami:** R4-Spacing-Scale ma Vertical i Horizontal z tymi samymi nazwami zmiennych
5. **Publiczne vs lokalne ID:** Figma używa publicznych ID w aliasach, pliki JSON mają lokalne ID jako klucze
6. **collectionName jest kluczowe** dla rozróżnienia duplikatów nazw w różnych kolekcjach

---

## 📋 CHANGELOG (ostatnie wersje)

```
v0.8.8 (2025-01-12)
- FIX: Disconnect zapisywał lokalne ID zamiast publicznych
- FIX: Restore używa findVariableInLibrary z targetVarName i collectionName
- Typ DisconnectedLibrary rozszerzony o targetVarName

v0.8.7 (2025-01-12)
- FIX: detectFileType nie rozpoznawał formatu REZZON Portal
- FIX: collectionNameIndex dla bibliotek z duplikatami nazw zmiennych
- findVariableInLibrary przyjmuje opcjonalny collectionName

v0.8.6 (2025-01-05)
- FIX: External alias recognition dla bibliotek z wieloma kolekcjami

v0.8.5 (2025-01-05)
- FIX: findVariableInLibrary false positive (short name match)
```
