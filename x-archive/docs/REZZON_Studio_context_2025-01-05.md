# REZZON Studio — Kontekst dla nowej rozmowy

**Data:** 2025-01-05
**Aktualna wersja:** v0.8.0

---

## 📍 AKTUALNY STAN PROJEKTU

### Zrealizowane fazy:
- ✅ Faza 1 — Szkielet (Vite + React + TypeScript)
- ✅ Faza 2 — Import i wyświetlanie
- ✅ Faza 3 — Selekcja, Search, Filtry
- ✅ Faza 4 — CRUD (rename, delete, duplicate)
- ✅ Faza 6 — UNDO/REDO (30 kroków)
- ✅ Faza 8.2 — Eksport do Figmy (v0.8.0)

### W toku:
- 🔄 Faza 5 — Aliasy (częściowo)
  - ✅ Alias Manager (widok Aliases)
  - ✅ Disconnect/Restore (implementacja)
  - 🐛 BUG-CRIT-6: Restore nie przywraca wszystkich aliasów
  - ❌ Alias Picker (single) — brak triggera w Variables
  - ❌ Bulk Alias — brak triggera w UI

### Do zrobienia:
- Faza 7 — Snapshots
- Faza 8.1, 8.3, 8.4 — Walidacja, eksport/import sesji
- Faza 9 — Wirtualizacja (performance)
- Faza 10-12 — Polish

---

## 🐛 OTWARTY BUG: BUG-CRIT-6

**Problem:** Po restore External count pokazuje 850 zamiast 947 (brakuje ~97 aliasów)

**Obserwacje:**
- Disconnect zapisuje 487 aliasów (122 unique vars × ~4 modes)
- Restore raportuje w logach: `Restored: 487, Broken: 0`
- Ale UI pokazuje External: 850 (powinno być 947)
- `calculateAliasStats` nie widzi przywróconych aliasów

**Gdzie szukać:**
- `/studio/src/stores/appStore.ts` — funkcja `restoreLibrary` (linia ~920)
- `/studio/src/utils/aliasUtils.ts` — funkcja `calculateAliasStats`

**Hipoteza:** Problem może być w:
1. Tym jak `libClones` jest zapisywany do state
2. WeakMap cache w `aliasUtils.ts` który nie jest invalidowany po restore
3. Różnicy między tym jak restore zapisuje aliasy a jak calculateAliasStats je liczy

**Status:** Odłożony — użytkownik zdecydował przejść do eksportu

---

## 📂 STRUKTURA PROJEKTU

```
/home/claude/rezzon-studio/studio/
├── src/
│   ├── components/
│   │   ├── layout/
│   │   │   ├── Header.tsx        ← Import/Export buttons
│   │   │   ├── DetailsPanel.tsx
│   │   │   ├── VariablesSidebar.tsx
│   │   │   └── Statusbar.tsx
│   │   └── ui/
│   │       ├── CrudModals.tsx    ← BulkRename, Delete, Duplicate, Export modals
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
│   │   ├── figmaParser.ts        ← Import/Export funkcje
│   │   ├── aliasUtils.ts         ← calculateAliasStats, getAliasType
│   │   └── folderTree.ts
│   └── types/index.ts
```

---

## 🔑 KLUCZOWE PLIKI

### appStore.ts
- `disconnectLibrary()` — zamienia aliasy na resolved values, zapisuje do disconnectedLibraries
- `restoreLibrary()` — przywraca aliasy z previousAliases
- Historia UNDO/REDO z limitem 30 kroków

### figmaParser.ts
- `parseFigmaVariablesFile()` — import z JSON
- `exportLibraryToFigma()` — eksport do JSON (nowe w v0.8.0)
- `validateForExport()` — walidacja przed eksportem
- `downloadJson()` — pobieranie pliku

### aliasUtils.ts
- `calculateAliasStats()` — liczy internal/external/broken
- `findConnectedExternalLibraries()` — znajduje połączone biblioteki
- `getAliasType()` — określa typ aliasu
- WeakMap cache dla wydajności (może być przyczyną buga)

---

## 📋 DOKUMENTY PROJEKTOWE

W kontekście projektu Claude:
- `REZZON_Studio_decyzje_v3.md` — decyzje projektowe
- `REZZON_Studio_roadmap.md` — stara roadmapa (nieaktualna)
- `REZZON_Studio_wymagania_v3.md` — wymagania funkcjonalne

Zaktualizowane (w outputs):
- `REZZON_Studio_roadmap_v4.md` — aktualna roadmapa
- `REZZON_Studio_test_history_v2.md` — historia testów i bugów

---

## 🎯 NASTĘPNE KROKI (do wyboru)

### Opcja A: Naprawić BUG-CRIT-6 (Restore)
- Zbadać czy WeakMap cache nie blokuje odświeżenia
- Dodać więcej logów do calculateAliasStats
- Porównać dane w state przed/po restore

### Opcja B: Eksport sesji (Faza 8.3)
- Zapisanie pełnego stanu (libraries + disconnectedLibraries + UI)
- Import sesji z przywróceniem stanu

### Opcja C: Snapshots (Faza 7)
- Tworzenie snapshotów
- Lista w sidebarze
- Restore do snapshotu

### Opcja D: Wirtualizacja (Faza 9)
- @tanstack/react-virtual
- Wydajność przy 8.5k zmiennych

---

## 💡 WSKAZÓWKI DLA CLAUDE

1. **Projekt REZZON Studio** to aplikacja do zarządzania Figma Variables
2. **Główna biblioteka** = REZZON, **towarzyszące** = R4-Grid, R4-Spacing Scale, etc.
3. **Aliasy external** wskazują z REZZON do bibliotek R4-*
4. **Disconnect** zamienia aliasy na resolved values
5. **Restore** przywraca aliasy (ale jest bug)
6. **Eksport** działa — generuje JSON zgodny z formatem Figma

---

## 📝 OSTATNIE ZMIANY (v0.8.0)

```
### v0.8.0 (2025-01-05)
- **FEAT:** Eksport do Figmy
  - Modal z walidacją (błędy/ostrzeżenia)
  - Statystyki (variables, aliases)
  - Download JSON
- **FEAT:** Przycisk Export w headerze (aktywny gdy wybrana biblioteka)
```

---

## 🔗 TRANSKRYPTY

Poprzednie rozmowy:
- `/mnt/transcripts/2026-01-04-22-39-56-restore-alias-count-debug-v078.txt`
- `/mnt/transcripts/2026-01-04-22-19-27-restore-debug-console-access.txt`

Journal:
- `/mnt/transcripts/journal.txt`
