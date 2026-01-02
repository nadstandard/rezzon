# REZZON Studio — Raport audytu kodu v0.7.2

**Data:** 2025-01-02  
**Wersja:** v0.7.2  
**Postęp:** ~75% (Fazy 1-6 ukończone)

---

## 📊 Podsumowanie

| Kategoria | Ilość |
|-----------|-------|
| 🔴 Błędy krytyczne | 2 |
| 🟠 Błędy funkcjonalne | 5 |
| 🟡 Niedociągnięcia UI/UX | 12 |
| 🟢 Propozycje usprawnień | 8 |

---

## 🔴 BŁĘDY KRYTYCZNE

### BUG-CRIT-1: Multi-mode Disconnect Logic (KNOWN)

**Lokalizacja:** `appStore.ts` → `disconnectLibrary()`

**Problem:** Przy disconnect wszystkie modes źródła otrzymują wartość z JEDNEGO wybranego mode'a.

```
Aktualnie:
Theme(1m) → Viewport(4m): OK ✅
BG(4m) → Theme(1m): PROBLEM ❌ 
  - BGA1 → Alfa (24)
  - BGA2 → Alfa (24)  ← powinno być inne!
  - BGA3 → Alfa (24)  ← powinno być inne!
  - BGZ  → Alfa (24)  ← powinno być inne!
```

**Wymagana zmiana:** Mode dropdown = FALLBACK, domyślnie resolve mode-by-mode.

---

### BUG-CRIT-2: Snapshots nie zapisują pełnego stanu

**Lokalizacja:** `appStore.ts` → `createSnapshot()`

**Problem:** Snapshot nie liczy aliasCount i nie zapisuje disconnectedLibraries.

```typescript
// Linia 322-337 - brakuje:
aliasCount: 0,  // ← zawsze 0!
data: {
  libraries: JSON.parse(JSON.stringify(state.libraries)),
  // ← brakuje: disconnectedLibraries
}
```

**Fix:**
```typescript
createSnapshot: (name, description) => set((state) => {
  // Oblicz aliasCount
  let aliasCount = 0;
  for (const lib of state.libraries) {
    for (const v of Object.values(lib.file.variables)) {
      for (const val of Object.values(v.valuesByMode)) {
        if (val.type === 'VARIABLE_ALIAS') aliasCount++;
      }
    }
  }
  
  return {
    snapshots: [...state.snapshots, {
      // ...
      aliasCount,
      data: {
        libraries: JSON.parse(JSON.stringify(state.libraries)),
        disconnectedLibraries: JSON.parse(JSON.stringify(state.disconnectedLibraries)),
      },
    }],
  };
}),
```

---

## 🟠 BŁĘDY FUNKCJONALNE

### BUG-FUNC-1: Snapshots View — niekompletna implementacja

**Lokalizacja:** `views/Snapshots/index.tsx`

**Problemy:**
1. `prompt()` zamiast modala (linia 9)
2. Zawsze pokazuje `snapshots[0]` zamiast wybranego
3. Przyciski "Compare", "Restore", "Delete" nie działają
4. Brak stanu `selectedSnapshotId`

**Priorytet:** Wysoki (Faza 7 wymaga pełnej implementacji)

---

### BUG-FUNC-2: Shift+Click range selection nie działa

**Lokalizacja:** `views/Variables/index.tsx`

**Problem:** Brak implementacji zaznaczania zakresu przez Shift+Click.

**Obecna implementacja (linia 393-410):**
```typescript
const handleRowClick = (variableId: string, isVariable: boolean, e: React.MouseEvent) => {
  if (!isVariable) return;
  
  if (e.metaKey || e.ctrlKey) {
    toggleVariable(variableId);
  } else {
    selectVariables([variableId]);
  }
};
```

**Brakuje:** Obsługi `e.shiftKey` z zapamiętaniem `lastSelectedId`.

---

### BUG-FUNC-3: Keyboard navigation w AliasPicker

**Lokalizacja:** `components/ui/AliasPicker.tsx`

**Problem:** Footer mówi "↑↓ navigate · Enter select" ale nawigacja klawiaturą nie jest zaimplementowana.

---

### BUG-FUNC-4: "Disconnect Selected" w Aliases view nie działa

**Lokalizacja:** `views/Aliases/index.tsx` (linia 296)

**Problem:** Przycisk jest wyświetlany ale nie ma obsługi onClick.

```tsx
{selectedAliases.length > 0 && (
  <button className="btn btn--ghost">  // ← brak onClick!
    <Link2Off className="icon sm" /> Disconnect Selected
  </button>
)}
```

---

### BUG-FUNC-5: restoreSnapshot nie przywraca disconnectedLibraries

**Lokalizacja:** `appStore.ts` → `restoreSnapshot()`

```typescript
restoreSnapshot: (id) => set((state) => {
  // ...
  return {
    libraries: JSON.parse(JSON.stringify(snapshot.data.libraries)),
    // ← brakuje: disconnectedLibraries
    history: newHistory,
  };
}),
```

---

## 🟡 NIEDOCIĄGNIĘCIA UI/UX

### UI-1: AliasPicker — brak ikony typu zmiennej
Użytkownik nie wie jakiego typu są zmienne w liście.

### UI-2: AliasPicker — duży indicator aliasu
Wystarczyłaby mała kropka zamiast pełnej ikony + tła.

### UI-3: AliasPicker — brak separatorów folderów
Lista jest płaska, trudno nawigować przy dużej ilości zmiennych.

### UI-4: AliasPicker — brak scroll-to-current
Jeśli zmienna ma alias, picker powinien scrollować do aktualnego targetu.

### UI-5: Brak wirtualizacji listy (KNOWN)
Przy 8.5k+ zmiennych "Expand All" może zamrozić przeglądarkę.
**Status:** Zaplanowane na Fazę 9

### UI-6: Statusbar — statyczne wartości
`24 changed` i `25 broken` są hardcoded, nie odzwierciedlają rzeczywistego stanu.

### UI-7: Search w headerze — brak scope indicator
Nie widać czy search działa globalnie czy w wybranym folderze.

### UI-8: Filter badge — nie aktualizuje się live
Badge pokazuje liczbę filtrów ale nie zmienia się dynamicznie.

### UI-9: Empty state dla "No results"
Brak dedykowanego empty state gdy filtry/search nie zwracają wyników.

### UI-10: Breadcrumb nie jest klikalny
Breadcrumb pokazuje ścieżkę ale nie można kliknąć żeby nawigować.

### UI-11: Details panel — brak obsługi multi-select
Gdy zaznaczono wiele zmiennych, panel pokazuje tylko pierwszą.

### UI-12: Brak loading states
Import dużego pliku nie pokazuje progressu ani spinnera.

---

## 🟢 PROPOZYCJE USPRAWNIEŃ

### ENH-1: Persystencja stanu w localStorage/IndexedDB

**Obecny stan:** Stan ginie przy odświeżeniu strony.

**Propozycja:** Automatyczny zapis do IndexedDB przy każdej zmianie (debounced).

```typescript
// Przykład z Dexie.js
const db = new Dexie('RezzonStudio');
db.version(1).stores({
  sessions: 'id, name, updatedAt',
});

// Auto-save po każdej operacji
useEffect(() => {
  const timeout = setTimeout(() => {
    db.sessions.put({ id: 'current', ...state });
  }, 1000);
  return () => clearTimeout(timeout);
}, [state]);
```

---

### ENH-2: Batch operations z progress bar

**Propozycja:** Dla operacji na >100 zmiennych pokazuj progress bar.

```typescript
async function bulkOperation(items: string[], operation: (id: string) => void) {
  const total = items.length;
  for (let i = 0; i < total; i++) {
    operation(items[i]);
    if (i % 50 === 0) {
      setProgress((i / total) * 100);
      await new Promise(r => setTimeout(r, 0)); // Yield to UI
    }
  }
}
```

---

### ENH-3: Export preview przed eksportem

**Propozycja:** Modal z podglądem co zostanie wyeksportowane:
- Ile bibliotek
- Ile zmiennych
- Ile aliasów (internal/external/broken)
- Walidacja konfliktów

---

### ENH-4: Diff view dla Snapshots

**Propozycja:** Przed restore pokazuj różnice między snapshotem a aktualnym stanem:
- Dodane zmienne
- Usunięte zmienne  
- Zmienione wartości/aliasy

---

### ENH-5: Drag & Drop reordering folderów

**Status:** Odrzucone w wymaganiach (ograniczenie Figmy)

**Alternatywa:** Bulk rename z numeracją prefixową dla porządkowania.

---

### ENH-6: Keyboard shortcuts panel

**Propozycja:** Modal z listą wszystkich skrótów klawiszowych (⌘?).

---

### ENH-7: Recent files w Import modal

**Propozycja:** Zapamiętuj ostatnie 5 importowanych plików dla szybkiego dostępu.

---

### ENH-8: Export do CSV/Excel

**Propozycja:** Opcjonalny eksport listy zmiennych do CSV dla dokumentacji.

---

## 📋 PRIORYTETY NAPRAW

### Natychmiastowe (przed Fazą 8):
1. ~~BUG-CRIT-2~~ — Snapshots nie zapisują pełnego stanu
2. BUG-FUNC-1 — Snapshots View niekompletna
3. BUG-FUNC-5 — restoreSnapshot nie przywraca disconnectedLibraries

### Ważne (backlog):
4. BUG-FUNC-2 — Shift+Click range selection
5. BUG-FUNC-3 — Keyboard nav w AliasPicker
6. BUG-FUNC-4 — Disconnect Selected nie działa
7. UI-6 — Statusbar statyczne wartości

### Do rozważenia:
8. BUG-CRIT-1 — Multi-mode disconnect (wymaga decyzji projektowej)
9. ENH-1 — Persystencja stanu
10. UI-5 — Wirtualizacja (Faza 9)

---

## 📁 STRUKTURA KODU — Obserwacje

### ✅ Dobrze:
- Czysta separacja: stores / views / components / utils
- TypeScript z dobrymi typami
- Zustand store dobrze zorganizowany
- CSS design system spójny

### ⚠️ Do poprawy:
- `views/Variables/index.tsx` — 1096 linii, warto rozbić
- `views/Aliases/index.tsx` — 627 linii, podobnie
- Brak testów jednostkowych
- Brak komentarzy JSDoc w utils

---

## 🎯 REKOMENDACJA

**Kolejność działań:**

1. **Napraw Snapshots** (BUG-CRIT-2, BUG-FUNC-1, BUG-FUNC-5) — 1 dzień
2. **Faza 8: Eksport** — 2-3 dni
3. **Bugfixy backlog** (Shift+Click, keyboard nav) — 1 dzień
4. **UI polish** — 1-2 dni

**Łącznie do MVP:** ~5-7 dni roboczych

---

*Raport wygenerowany przez Claude na podstawie analizy kodu v0.7.2*
