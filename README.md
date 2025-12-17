# REZZON Design System

Multibrand design system dla Figmy, zaprojektowany do projektowania i budowy stron internetowych.

## 📊 Statystyki

| Biblioteka | Kolekcje | Zmienne |
|------------|----------|---------|
| REZZON (główna) | 4 | 2,793 |
| 1-R4-Grid | 1 | 3,590 |
| 2-R4-Spacing-Scale | 2 | 772 |
| 3-R4-Typography-Scale | 2 | 562 |
| 4-R4-Color-Library | 1 | 794 |
| **RAZEM** | **10** | **8,511** |

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

## 📁 Struktura repo

```
rezzon-studio/
├── docs/
│   ├── REZZON-Scale-Editor-PRD.md    # Product Requirements Document
│   ├── SCALE-EDITOR-CHANGELOG.md     # Changelog Scale Editora
│   └── mockups/                      # Makiety UI
│       ├── typography-mockup.html
│       └── radius-mockup.html
├── json/                             # Eksporty z REZZON Portal
│   ├── REZZON_2025-12-17.json
│   ├── 1-R4-Grid_2025-12-17.json
│   ├── 2-R4-Spacing-Scale_2025-12-17.json
│   ├── 3-R4-Typography-Scale_2025-12-17.json
│   └── 4-R4-Color-Library_2025-12-17.json
└── plugin/                           # REZZON Portal plugin (Figma)
    └── (kod pluginu)
```

## 🛠️ Narzędzia

### REZZON Portal (Figma Plugin)
Plugin do eksportu/importu zmiennych między Figma a JSON.

### REZZON Scale Editor (w budowie)
Aplikacja webowa do zarządzania bibliotekami skali — edycja parametrów, automatyczne przeliczanie wartości, eksport JSON.

Zobacz: [PRD Scale Editora](docs/REZZON-Scale-Editor-PRD.md)

## 🎨 Mody (Style)

System wspiera do 10 modów per kolekcja:
- CROSS, CIRCLE, TRIANGLE, SQUARE (podstawowe)
- Legacy, Minimal, Balanced, Contrast, Hero-Friendly, Premium, UX First (Typography)

Każdy mod może mieć inne wartości dla wszystkich parametrów.

## 📝 Licencja

Prywatne repozytorium. Wszelkie prawa zastrzeżone.
