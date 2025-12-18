import type { CollectionType } from '../types';

interface SubCollection {
  name: string;
  count: number;
  active: boolean;
  onClick: () => void;
}

interface SidebarProps {
  collections: { type: CollectionType; name: string; count: number | null }[];
  activeCollection: CollectionType;
  onCollectionSelect: (type: CollectionType) => void;
  groups: { name: string; path?: string; count: number; indent?: number }[];
  activeGroup: string;
  onGroupSelect: (name: string) => void;
  subCollections?: SubCollection[];
}

export function Sidebar({
  collections,
  activeCollection,
  onCollectionSelect,
  groups,
  activeGroup,
  onGroupSelect,
  subCollections,
}: SidebarProps) {
  return (
    <nav className="sidebar" aria-label="Main navigation">
      {/* Collections */}
      <div className="sidebar-header" id="collections-header">
        <span>Collections</span>
      </div>

      <div className="sidebar-section" role="listbox" aria-labelledby="collections-header">
        {collections.map((col) => (
          <button
            key={col.type}
            onClick={() => onCollectionSelect(col.type)}
            className={`sidebar-item ${activeCollection === col.type ? 'active' : ''}`}
            role="option"
            aria-selected={activeCollection === col.type}
            aria-label={`${col.name}${col.count !== null ? `, ${col.count} variables` : ''}`}
          >
            <span>{col.name}</span>
            {col.count !== null && <span className="count" aria-hidden="true">{col.count}</span>}
          </button>
        ))}
      </div>

      {/* Sub-collections (e.g., Vertical/Horizontal for Spacing) */}
      {subCollections && subCollections.length > 0 && (
        <>
          <div className="sidebar-header" id="subcollections-header">
            <span>Sub-Collections</span>
          </div>
          <div className="sidebar-section" role="listbox" aria-labelledby="subcollections-header">
            {subCollections.map((sub) => (
              <button
                key={sub.name}
                onClick={sub.onClick}
                className={`sidebar-item ${sub.active ? 'active' : ''}`}
                role="option"
                aria-selected={sub.active}
                aria-label={`${sub.name}, ${sub.count} variables`}
              >
                <span>{sub.name}</span>
                <span className="count" aria-hidden="true">{sub.count}</span>
              </button>
            ))}
          </div>
        </>
      )}

      {/* Groups */}
      <div className="sidebar-header" id="groups-header">
        <span>Groups</span>
      </div>

      <div className="sidebar-section sidebar-section-scrollable" role="listbox" aria-labelledby="groups-header">
        {groups.map((group) => (
          <button
            key={group.path || group.name}
            onClick={() => onGroupSelect(group.path || group.name)}
            className={`sidebar-item ${activeGroup === (group.path || group.name) ? 'active' : ''}`}
            style={{ paddingLeft: `${16 + (group.indent || 0) * 16}px` }}
            role="option"
            aria-selected={activeGroup === (group.path || group.name)}
            aria-label={`${group.name}, ${group.count} variables`}
          >
            <span>{group.name}</span>
            <span className="count" aria-hidden="true">{group.count}</span>
          </button>
        ))}
      </div>
    </nav>
  );
}
