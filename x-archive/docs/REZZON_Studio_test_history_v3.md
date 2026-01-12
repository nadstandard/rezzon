# REZZON Studio — Historia testów i bugów v3

**Data:** 2025-01-05
**Wersja:** v0.8.5

---

## 🐛 ROZWIĄZANE BUGI

### BUG-CRIT-6: External count 850 zamiast 947 po restore

**Status:** ✅ FIXED (v0.8.2 + v0.8.4 + v0.8.5)

**Symptom:**
- Przed disconnect: External = 947
- Po disconnect 2-R4-Spacing Scale: External = 460 (poprawnie)
- Po restore: External = 850 (powinno być 947)
- Brakuje ~97 aliasów

**Przyczyny (3 osobne problemy):**

#### Problem 1: WeakMap cache (v0.8.2)
- `nameIndexCache` w aliasUtils.ts nie był czyszczony po restore
- `library.file` reference pozostaje ta sama, więc WeakMap zwraca stary index
- **Fix:** Dodano `clearNameIndexCache()` wywoływane po disconnect/restore

#### Problem 2: Brak collectionName (v0.8.4)
- `restoreLibrary` nie zapisywał `collectionName` dla przywróconych aliasów
- Po restore aliasy miały puste `collectionName`
- **Fix:** Restore teraz znajduje i zapisuje nazwę kolekcji targetu

#### Problem 3: False positive short name match (v0.8.5)
- `findVariableInLibrary` szukało też po short name (ostatni segment)
- `Size/Desktop/ref-10` matchowało `Spacing/Desktop/ref-10` przez `ref-10`
- Disconnect rozłączał aliasy do ZŁEJ biblioteki (Size zamiast Spacing)
- **Fix:** Usunięto search by short name z funkcji

**Analiza danych:**
```
Original REZZON:
- External aliases: 1012 (unique pairs)
- By library: Line Height: 420, Vertical: 263, Size: 168, Horizontal: 97, Radius: 64

After disconnect 2-R4-Spacing Scale:
- Removed: Vertical: 263, Horizontal: 97
- BŁĘDNIE removed: Size: 127 (przez short name match!)

After restore (przed fix):
- Restored: 487 aliasów
- ALE: Size aliasy przywrócone do złych targetów
```

---

### BUG-CRIT-5: Restore przywraca tylko ~3 aliasy

**Status:** ✅ FIXED (v0.7.6)

**Symptom:**
- Disconnect zapisuje 961 aliasów
- Restore logs: `Restored: 3, Broken: 0`
- Oczekiwane: ~961 restored

**Przyczyna:**
- Shallow cloning w pętli nadpisywał zmiany
- Każda iteracja tworzyła nowy klon z tego samego źródła
- Tylko ostatnia zmiana dla każdej biblioteki była zachowana

**Rozwiązanie:**
- Deep cloning z `libClones` cache
- Klon tworzony raz per biblioteka, potem modyfikowany

---

### BUG-CRIT-4: Po disconnect wartości "undefined"

**Status:** ✅ FIXED (v0.7.5)

**Symptom:**
- Po disconnect zmienne pokazują "undefined" zamiast resolved values
- Oczekiwane: wartości z target variable

**Przyczyna:**
- Przypisanie referencji zamiast kopii wartości
- `newValuesByMode[modeId] = resolvedValue` — referencja
- Późniejsze modyfikacje wpływały na oryginał

**Rozwiązanie:**
- Spread operator: `{ ...resolvedValue }`

---

## ✅ TESTY PASSED

### Test: Import bibliotek
- [x] Import REZZON (2793 vars)
- [x] Import 5 bibliotek R4-* (łącznie ~5700 vars)
- [x] Sidebar pokazuje wszystkie biblioteki
- [x] Alias Summary pokazuje poprawne liczby

### Test: Disconnect
- [x] Wybór biblioteki do disconnect
- [x] Multi-collection mode selection
- [x] Aliasy zamienione na resolved values
- [x] Biblioteka przeniesiona do DISCONNECTED
- [x] External count zmniejszony odpowiednio
- [x] **NOWE:** Disconnect rozłącza TYLKO aliasy do wybranej biblioteki

### Test: Restore
- [x] Modal z preview
- [x] Aliasy przywrócone
- [x] Biblioteka wraca do Connected
- [x] External count wraca do poprzedniej wartości
- [x] **NOWE:** collectionName poprawnie zapisany

### Test: Export
- [x] Export dropdown pokazuje wszystkie biblioteki
- [x] Główna biblioteka (REZZON) pierwsza na liście
- [x] Walidacja pokazuje błędy/ostrzeżenia
- [x] Statystyki internal/external poprawne
- [x] Download JSON działa

### Test: UNDO/REDO
- [x] Undo cofa operacje
- [x] Redo przywraca cofnięte
- [x] Limit 30 kroków
- [x] Skróty klawiszowe działają

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
  uniqueVars: new Set(previousAliases.map(a => a.sourceVarId)).size
});

// Restore
console.log('RESTORE:', {
  libraryName,
  restored: result.restored,
  broken: result.broken
});

// Alias stats
console.log('ALIAS_STATS:', {
  internal, external, broken,
  total: internal + external + broken
});
```

### WeakMap cache issue:
Jeśli liczby aliasów się nie zgadzają po operacji, sprawdź czy `clearNameIndexCache()` jest wywoływane:
- Po `disconnectLibrary` (linia ~874 w appStore.ts)
- Po `restoreLibrary` (linia ~1042 w appStore.ts)

---

## 📝 NOTATKI Z DEBUGOWANIA

### Analiza JSON-ów (sesja 2025-01-05)

Użytkownik dostarczył 3 pliki JSON:
- `REZZON_export_2026-01-05_before-disconnect.json`
- `REZZON_export_2026-01-05_disconnect.json`
- `REZZON_export_2026-01-05_restore.json`

**Kluczowe odkrycie:**
Po restore, 487 aliasów miało puste `collectionName`:
```
External by library:
  : 487          ← puste collectionName!
  Line Height: 420
  Radius: 64
  Size: 41
```

**Drugie kluczowe odkrycie:**
Disconnect usuwał aliasy do `Size` (127) mimo że `Size` jest w Typography Scale, nie Spacing Scale:
```
Removed at disconnect:
  Vertical: 263   ← poprawnie (w Spacing Scale)
  Horizontal: 97  ← poprawnie (w Spacing Scale)
  Size: 127       ← BŁĄD! (jest w Typography Scale!)
```

Przyczyna: short name `ref-10` matchował zarówno:
- `Size/Desktop/ref-10` (Typography)
- `Spacing/Desktop/ref-10` (Spacing)
