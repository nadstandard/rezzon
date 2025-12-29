import type { CollectionType } from '../types';

interface TabsProps {
  tabs: { type: CollectionType; label: string }[];
  activeTab: CollectionType;
  onTabChange: (type: CollectionType) => void;
}

export function Tabs({ tabs, activeTab, onTabChange }: TabsProps) {
  return (
    <div className="tabs">
      {tabs.map((tab) => (
        <button
          key={tab.type}
          onClick={() => onTabChange(tab.type)}
          className={`tab ${activeTab === tab.type ? 'active' : ''}`}
        >
          {tab.label}
        </button>
      ))}
    </div>
  );
}
