import type { CollectionType } from '../types';

interface SidebarProps {
  collections: { type: CollectionType; name: string; count: number | null }[];
  activeCollection: CollectionType;
  onCollectionSelect: (type: CollectionType) => void;
  groups: { name: string; count: number; indent?: number }[];
  activeGroup: string;
  onGroupSelect: (name: string) => void;
}

export function Sidebar({
  collections,
  activeCollection,
  onCollectionSelect,
  groups,
  activeGroup,
  onGroupSelect,
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

      {/* Groups */}
      <div className="sidebar-header">
        <span>Groups</span>
      </div>

      <div className="sidebar-section" style={{ flex: 1, overflowY: 'auto' }}>
        {groups.map((group) => (
          <button
            key={group.name}
            onClick={() => onGroupSelect(group.name)}
            className={`sidebar-item ${activeGroup === group.name ? 'active' : ''}`}
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
