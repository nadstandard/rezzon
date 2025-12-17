# Scale Editor Changelog

## 2024-12-17 — UI Mockups v1.0

### Added
- Typography Scale mockup (`docs/mockups/typography-mockup.html`)
- Radius mockup (`docs/mockups/radius-mockup.html`)

### UI Design Decisions
- Layout based on Figma Variables panel
- Left sidebar: Collections + Groups navigation
- Main area: Table with modes as columns (max 10)
- Sticky columns: Name + Group headers (horizontal scroll)
- Sticky header row (vertical scroll)
- Dark theme matching Figma

### Visual Language
- `#` icon = base value (editable)
- `ƒ` icon = parameter/multiplier (editable)  
- `=` icon = computed value (green, read-only)
- Formula available via `ƒ` tooltip in toolbar

### File Recognition (planned)
- `R4-Typography*.json` → Typography tab
- `R4-Spacing*.json` → Spacing tab
- `R4-Grid*.json` → Grid tab
- `R4-Radius*.json` → Radius tab

### Next Steps
- [ ] Implement React app with this UI
- [ ] JSON import (drag & drop multiple files)
- [ ] Auto-calculation engine
- [ ] JSON export for Portal
