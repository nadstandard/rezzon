# REZZON Design System

Multibrand design system dla Figmy, zaprojektowany do projektowania i budowy stron internetowych.

---

## 📊 Statystyki

| Biblioteka | Kolekcje | Zmienne |
|------------|----------|---------|
| REZZON (główna) | 4 | 2,793 |
| 1-R4-Grid | 1 | 3,590 |
| 2-R4-Spacing-Scale | 2 | 772 |
| 3-R4-Typography-Scale | 2 | 562 |
| 4-R4-Color-Library | 1 | 794 |
| **RAZEM** | **10** | **8,511** |

---

## 🏗️ Architektura

```
REZZON (główna biblioteka)
├── Theme      → Kolory tematyczne
├── Viewport   → Breakpointy
├── BG         → Kolory tła
└── Color      → System kolorów

Biblioteki towarzyszące (Scale Libraries)
├── 1-R4-Grid           → Siatka, kolumny, kontenery, photo
├── 2-R4-Spacing-Scale  → Spacing vertical/horizontal
├── 3-R4-Typography-Scale → Size + Line Height
└── 4-R4-Color-Library  → Rozszerzona paleta kolorów
```

---

## 🛠️ Narzędzia

### REZZON Portal (Figma Plugin)
Plugin do eksportu/importu zmiennych między Figma a JSON.

### REZZON Studio
Aplikacja webowa do zarządzania **strukturą** design systemu:
- Import/eksport bibliotek (JSON ↔ Figma)
- Zarządzanie aliasami (internal/external/broken)
- Bulk rename z propagacją
- Snapshots i UNDO/REDO
- Disconnect/restore bibliotek zewnętrznych

**Status:** W trakcie implementacji (Faza 2 zakończona)

### REZZON Scale Editor
Aplikacja webowa do zarządzania **wartościami i formułami** bibliotek skali:
- Typography Editor (Size + Line Height)
- Spacing Editor (Vertical + Horizontal)
- Grid Editor (Column, Margin, Container, Photo)
- Radius Editor

**Status:** Typography, Spacing, Radius zaimplementowane. Grid w fazie projektowania.

---

## 🔄 Workflow

```
                              FIGMA
                                │
                        REZZON Portal
                         (export JSON)
                                │
                    ┌───────────┴───────────┐
                    │                       │
                    ▼                       ▼
            ┌───────────────┐       ┌───────────────┐
            │ REZZON Studio │       │ Scale Editor  │
            │               │       │               │
            │ • Struktura   │       │ • Wartości    │
            │ • Aliasy      │       │ • Formuły     │
            │ • Rename      │       │ • Generowanie │
            │ • Snapshots   │       │   tokenów     │
            └───────────────┘       └───────────────┘
                    │                       │
                    └───────────┬───────────┘
                                │
                        REZZON Portal
                         (import JSON)
                                │
                              FIGMA
```

### Który tool do czego?

| Zadanie | Narzędzie |
|---------|-----------|
| Zmiana nazwy folderu | Studio |
| Zmiana wartości bazowej spacing | Scale Editor |
| Bulk aliasowanie | Studio |
| Dodanie nowego viewport | Scale Editor |
| Usunięcie zmiennych | Studio |
| Zmiana proporcji zdjęć | Scale Editor (Grid) |
| Disconnect biblioteki | Studio |

---

## 📁 Struktura repozytorium

```
rezzon-studio/
├── docs/
│   ├── REZZON-Scale-Editor-PRD.md          # PRD Scale Editora
│   ├── REZZON_Studio_wymagania_v3.md       # Wymagania Studio
│   ├── REZZON_Studio_decyzje_v3.md         # Decyzje projektowe
│   ├── REZZON_Studio_roadmap.md            # Roadmapa implementacji
│   ├── SCALE-EDITOR-CHANGELOG.md           # Changelog Scale Editora
│   ├── GRID-EDITOR-ISSUES.md               # Issues Grid Editora
│   └── mockups/                            # Makiety HTML
│       ├── rezzon-studio-styles.css        # Wspólne style
│       ├── rezzon-studio-v0.4.0-*.html     # Makiety Studio
│       └── scale-editor-v0.5.0-*.html      # Makiety Scale Editor
├── json/                                   # Eksporty z REZZON Portal
│   ├── REZZON_2025-12-17.json
│   ├── 1-R4-Grid_2025-12-17.json
│   ├── 2-R4-Spacing-Scale_2025-12-17.json
│   ├── 3-R4-Typography-Scale_2025-12-17.json
│   └── 4-R4-Color-Library_2025-12-17.json
├── scale-editor/                           # Implementacja Scale Editora
│   ├── src/
│   │   ├── components/
│   │   ├── stores/
│   │   └── hooks/
│   └── package.json
├── studio/                                 # Implementacja Studio (planned)
│   └── ...
└── plugin/                                 # REZZON Portal plugin (Figma)
    └── (kod pluginu)
```

---

## 🎨 Mody (Style)

System wspiera do 10 modów per kolekcja:
- CROSS, CIRCLE, TRIANGLE, SQUARE (podstawowe)
- Legacy, Minimal, Balanced, Contrast, Hero-Friendly, Premium, UX First (Typography)

Każdy mod może mieć inne wartości dla wszystkich parametrów.

---

## 📐 Viewporty

| Viewport | Width | Columns | Gutter | Margin-M | Margin-XS |
|----------|-------|---------|--------|----------|-----------|
| Desktop | 1920px | 12 | 24px | 204px | 20px |
| Laptop | 1366px | 12 | 20px | 45px | 15px |
| Tablet | 768px | 12 | 20px | 58px | 16px |
| Mobile | 390px | 2 | 20px | 20px | 10px |

---

## 📝 Dokumentacja

- [Scale Editor PRD](docs/REZZON-Scale-Editor-PRD.md)
- [Studio Wymagania](docs/REZZON_Studio_wymagania_v3.md)
- [Studio Decyzje](docs/REZZON_Studio_decyzje_v3.md)
- [Studio Roadmapa](docs/REZZON_Studio_roadmap.md)
- [Scale Editor Changelog](docs/SCALE-EDITOR-CHANGELOG.md)
- [Grid Editor Issues](docs/GRID-EDITOR-ISSUES.md)

---

## 📝 Licencja

Prywatne repozytorium. Wszelkie prawa zastrzeżone.
