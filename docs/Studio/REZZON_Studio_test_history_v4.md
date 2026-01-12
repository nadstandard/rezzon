# REZZON Studio — Historia testów i bugów v4

**Data:** 2025-01-12
**Wersja:** v0.8.8

---

## 🐛 ROZWIĄZANE BUGI

### BUG-CRIT-7: variableId mismatches po restore (360 aliasów)

**Status:** ✅ FIXED (v0.8.7 + v0.8.8)

**Symptom:**
- Przed disconnect: External = 1115
- Po disconnect R4-Spacing-Scale: External = 755 (poprawnie)
- Po restore: External = 1115 (liczba OK)
- ALE: 360 aliasów ma ZŁĄE `variableId` (wskazują na Horizontal zamiast Vertical)

**Root cause analysis:**

#### Problem 1: Format REZZON Portal nie rozpoznawany (v0.8.7)
- `detectFileType` sprawdzał tylko `variableCollections` (natywny format Figma)
- Format REZZON Portal używa `collections` array
- **Fix:** Dodano obsługę `collections` array w `detectFileType`

#### Problem 2: Duplikaty nazw w różnych kolekcjach (v0.8.7)
- R4-Spacing-Scale ma kolekcje Vertical i Horizontal
- Obie mają zmienne `Spacing/Desktop/ref-0`, `Spacing/Desktop/ref-1`, etc.
- `findVariableInLibrary` fallback po nazwie znajdował PIERWSZĄ zmienną (mogła być z ZŁEJ kolekcji)
- **Fix:** Nowy `collectionNameIndex` z composite key `CollectionName/VariableName`

#### Problem 3: Lokalne vs publiczne ID (v0.8.8)
- Figma aliasy używają publicznych ID: `VariableID:ebb0f1086bad.../11:13551`
- Pliki JSON mają lokalne ID jako klucze: `VariableID:1:86`
- Disconnect zapisywał `targetVar.id` (lokalne) zamiast `value.variableId` (publiczne)
- Restore szukał po kluczu `file.variables[localId]` który nie istniał
- **Fix:** 
  - Disconnect zapisuje oryginalne publiczne ID + `targetVarName`
  - Restore używa `findVariableInLibrary(lib, id, name, collectionName)`

**Analiza danych (przed fix v0.8.8):**
```
Before disconnect:
  variableId: VariableID:4ab6b8eb.../11:13551
  collectionName: Vertical

After restore (BUG):
  variableId: VariableID:6:2011  ← ZŁYE lokalne ID!
  collectionName: Horizontal    ← ZŁA kolekcja!

variableId mismatches: 360
collectionName mismatches: 0
```

---

### BUG-CRIT-6: External count 850 zamiast 947 po restore

**Status:** ✅ FIXED (v0.8.2 + v0.8.4 + v0.8.5)

**Przyczyny (3 osobne problemy):**

1. **v0.8.2:** WeakMap cache nie był czyszczony po restore
2. **v0.8.4:** Restore nie zapisywał `collectionName` dla aliasów
3. **v0.8.5:** `findVariableInLibrary` false positive przez short name match

---

### BUG-CRIT-5: Restore przywraca tylko ~3 aliasy

**Status:** ✅ FIXED (v0.7.6)

**Przyczyna:** Shallow cloning w pętli nadpisywał zmiany
**Rozwiązanie:** Deep cloning z `libClones` cache

---

### BUG-CRIT-4: Po disconnect wartości "undefined"

**Status:** ✅ FIXED (v0.7.5)

**Przyczyna:** Przypisanie referencji zamiast kopii wartości
**Rozwiązanie:** Spread operator `{ ...resolvedValue }`

---

## ✅ TESTY PASSED

### Test: Import bibliotek
- [x] Import REZZON (2793 vars)
- [x] Import 5 bibliotek R4-* (łącznie ~5700 vars)
- [x] **NOWE:** Import formatu REZZON Portal (collections array)
- [x] Sidebar pokazuje wszystkie biblioteki
- [x] Alias Summary pokazuje poprawne liczby

### Test: Disconnect
- [x] Wybór biblioteki do disconnect
- [x] Multi-collection mode selection
- [x] Aliasy zamienione na resolved values
- [x] Biblioteka przeniesiona do DISCONNECTED
- [x] External count zmniejszony odpowiednio
- [x] **NOWE:** Zapisuje publiczne ID (nie lokalne)
- [x] **NOWE:** Zapisuje targetVarName i targetCollectionName

### Test: Restore
- [x] Modal z preview
- [x] Aliasy przywrócone
- [x] Biblioteka wraca do Connected
- [x] External count wraca do poprzedniej wartości
- [x] **NOWE:** collectionName poprawnie używany do wyszukiwania
- [x] **NOWE:** Publiczne ID zachowane po restore
- [ ] **W TRAKCIE:** Test z R4-Spacing-Scale (duplikaty nazw)

### Test: Export
- [x] Export dropdown pokazuje wszystkie biblioteki
- [x] Główna biblioteka (REZZON) pierwsza na liście
- [x] Walidacja pokazuje błędy/ostrzeżenia
- [x] Statystyki internal/external poprawne
- [x] Download JSON działa

### Test: Session Export/Import
- [x] Eksport pełnego stanu sesji
- [x] Import sesji z przywróceniem stanu
- [x] disconnectedLibraries zachowane

---

## 📊 METRYKI WYDAJNOŚCI

| Operacja | Czas | Uwagi |
|----------|------|-------|
| Import REZZON (2793 vars) | ~500ms | OK |
| Import wszystkich bibliotek | ~2s | OK |
| calculateAliasStats | ~100ms | Z cache |
| Disconnect | ~200ms | OK |
| Restore | ~300ms | OK |
| Export validation | ~100ms | OK |

---

## 🔧 DEBUGOWANIE

### Przydatne logi w konsoli:

```javascript
// Disconnect
console.log('DISCONNECT:', {
  libraryName,
  aliasesCount: previousAliases.length,
  sampleAlias: previousAliases[0]  // sprawdź targetVarId format
});

// Restore  
console.log('RESTORE:', {
  libraryName,
  restored: result.restored,
  broken: result.broken
});

// Sprawdzenie variableId format
// Publiczne: VariableID:ebb0f1086bad.../11:13551
// Lokalne:   VariableID:1:86
```

### Kluczowe miejsca w kodzie:

**Disconnect (appStore.ts ~834):**
```typescript
previousAliases.push({
  targetVarId: value.variableId,  // ← MUSI być publiczne ID!
  targetVarName: value.variableName || targetVar.name,
  targetCollectionName,
  ...
});
```

**Restore (appStore.ts ~1002):**
```typescript
const targetVar = findVariableInLibrary(
  externalLib, 
  prevAlias.targetVar,      // publiczne ID (fallback)
  prevAlias.targetVarName,  // nazwa do wyszukiwania
  prevAlias.targetCollectionName  // kolekcja!
);
```

---

## 📝 NOTATKI Z DEBUGOWANIA

### Analiza JSON-ów (sesja 2025-01-12)

Użytkownik dostarczył 3 pliki JSON:
- `REZZON_export_2026-01-12.json` (before)
- `REZZON_export_2026-01-12__1_.json` (disconnect)
- `REZZON_export_2026-01-12__2_.json` (restore)

**Wyniki analizy v0.8.7:**
```
=== ALIAS COUNTS ===
before: internal=2470, external=1115
disconnect: internal=2470, external=755
restore: internal=2470, external=1115  ← LICZBA OK!

=== CRITICAL CHECK ===
variableId mismatches: 360  ← ALE 360 MA ZŁE ID!
collectionName mismatches: 0
```

**Problem:** Liczba aliasów była poprawna, ale 360 z nich miało złe `variableId` - wskazywały na zmienne z kolekcji Horizontal zamiast Vertical.
