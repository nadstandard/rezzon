import { ChevronDown, Package, Box, Layers } from 'lucide-react';
import { useState } from 'react';
import { useAppStore } from '../../stores/appStore';

interface SidebarSectionProps {
  title: string;
  children: React.ReactNode;
  defaultExpanded?: boolean;
}

function SidebarSection({ title, children, defaultExpanded = true }: SidebarSectionProps) {
  const [expanded, setExpanded] = useState(defaultExpanded);
  
  return (
    <div className={`sidebar__section ${expanded ? '' : 'collapsed'}`}>
      <div className="sidebar__header" onClick={() => setExpanded(!expanded)}>
        <ChevronDown className="icon xs sidebar__chevron" />
        <span className="sidebar__title">{title}</span>
      </div>
      {expanded && <div className="sidebar__content">{children}</div>}
    </div>
  );
}

export function VariablesSidebar() {
  const libraries = useAppStore((state) => state.libraries);
  const selectedLibraryId = useAppStore((state) => state.ui.selectedLibraryId);
  const selectedCollectionId = useAppStore((state) => state.ui.selectedCollectionId);
  const selectLibrary = useAppStore((state) => state.selectLibrary);
  const selectCollection = useAppStore((state) => state.selectCollection);
  
  const selectedLibrary = libraries.find((l) => l.id === selectedLibraryId);
  const collections = selectedLibrary 
    ? Object.values(selectedLibrary.file.variableCollections || {})
    : [];

  return (
    <aside className="sidebar">
      <div className="sidebar__scroll">
        <SidebarSection title="Libraries">
          {libraries.length === 0 ? (
            <div className="sidebar-item" style={{ color: 'var(--text-muted)' }}>
              No libraries loaded
            </div>
          ) : (
            libraries.map((lib) => (
              <div
                key={lib.id}
                className={`sidebar-item ${selectedLibraryId === lib.id ? 'active' : ''}`}
                onClick={() => selectLibrary(lib.id)}
              >
                {lib.isMain ? (
                  <Package className="icon" />
                ) : (
                  <Box className="icon" />
                )}
                <span className="sidebar-item__name">{lib.name}</span>
                <span className="sidebar-item__count">{lib.variableCount.toLocaleString()}</span>
              </div>
            ))
          )}
        </SidebarSection>
        
        <SidebarSection title="Collections">
          {collections.length === 0 ? (
            <div className="sidebar-item" style={{ color: 'var(--text-muted)' }}>
              Select a library
            </div>
          ) : (
            collections.map((col) => (
              <div
                key={col.id}
                className={`sidebar-item ${selectedCollectionId === col.id ? 'active' : ''}`}
                onClick={() => selectCollection(col.id)}
              >
                <Layers className="icon" />
                <span className="sidebar-item__name">{col.name}</span>
                <span className="sidebar-item__count">{col.variableIds.length.toLocaleString()}</span>
              </div>
            ))
          )}
        </SidebarSection>
        
        <SidebarSection title="Folders">
          <div className="sidebar-item" style={{ color: 'var(--text-muted)' }}>
            {/* TODO: Folder tree */}
            Select a collection
          </div>
        </SidebarSection>
      </div>
    </aside>
  );
}
