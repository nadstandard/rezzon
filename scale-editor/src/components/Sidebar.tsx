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
    <div className="sidebar">
      {/* Collections */}
      <div className="sidebar-header">
        <span>Collections</span>
        <button>+</button>
      </div>

      <div className="sidebar-section">
        {collections.map((col) => (
          <button
            key={col.type}
            onClick={() => onCollectionSelect(col.type)}
            className={`sidebar-item ${activeCollection === col.type ? 'active' : ''}`}
          >
            <span>{col.name}</span>
            {col.count !== null && <span className="count">{col.count}</span>}
          </button>
        ))}
      </div>

      {/* Sub-collections (e.g., Vertical/Horizontal for Spacing) */}
      {subCollections && subCollections.length > 0 && (
        <>
          <div className="sidebar-header">
            <span>Sub-Collections</span>
          </div>
          <div className="sidebar-section">
            {subCollections.map((sub) => (
              <button
                key={sub.name}
                onClick={sub.onClick}
                className={`sidebar-item ${sub.active ? 'active' : ''}`}
              >
                <span>{sub.name}</span>
                <span className="count">{sub.count}</span>
              </button>
            ))}
          </div>
        </>
      )}

      {/* Groups */}
      <div className="sidebar-header">
        <span>Groups</span>
      </div>

      <div className="sidebar-section" style={{ flex: 1, overflowY: 'auto' }}>
        {groups.map((group) => (
          <button
            key={group.path || group.name}
            onClick={() => onGroupSelect(group.path || group.name)}
            className={`sidebar-item ${activeGroup === (group.path || group.name) ? 'active' : ''}`}
            style={{ paddingLeft: `${16 + (group.indent || 0) * 16}px` }}
          >
            <span>{group.name}</span>
            <span className="count">{group.count}</span>
          </button>
        ))}
      </div>
    </div>
  );
}
