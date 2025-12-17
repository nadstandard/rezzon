import { useState } from 'react';
import { Sidebar } from './components/Sidebar';
import { Tabs } from './components/Tabs';
import { RadiusEditor } from './components/RadiusEditor';
import { useRadiusStore } from './stores/radiusStore';
import type { CollectionType } from './types';

const TABS = [
  { type: 'typography' as const, label: 'Typography Scale' },
  { type: 'spacing' as const, label: 'Spacing Scale' },
  { type: 'grid' as const, label: 'Grid' },
  { type: 'radius' as const, label: 'Radius' },
];

function App() {
  const [activeTab, setActiveTab] = useState<CollectionType>('radius');
  const [activeGroup, setActiveGroup] = useState('All');
  
  const radiusStore = useRadiusStore();
  const refCount = radiusStore.refScale.length;
  const radiusVarCount = 4 * (refCount + 1) + 5; // 4 viewports * (refs + pill) + params

  const collections = [
    { type: 'typography' as const, name: 'Typography', count: null },
    { type: 'spacing' as const, name: 'Spacing', count: null },
    { type: 'grid' as const, name: 'Grid', count: null },
    { type: 'radius' as const, name: 'Radius', count: radiusVarCount },
  ];

  const getSidebarGroups = () => {
    if (activeTab === 'radius') {
      const refCount = radiusStore.refScale.length;
      const perViewport = refCount + 1; // +1 for pill
      
      return [
        { name: 'All', count: 4 * perViewport + 5 }, // 4 viewports + params
        { name: 'Desktop', count: perViewport, indent: 0 },
        { name: 'Laptop', count: perViewport, indent: 0 },
        { name: 'Tablet', count: perViewport, indent: 0 },
        { name: 'Mobile', count: perViewport, indent: 0 },
      ];
    }
    return [{ name: 'All', count: 0 }];
  };

  return (
    <div className="app-layout">
      <Sidebar
        collections={collections}
        activeCollection={activeTab}
        onCollectionSelect={setActiveTab}
        groups={getSidebarGroups()}
        activeGroup={activeGroup}
        onGroupSelect={setActiveGroup}
      />

      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
        <Tabs
          tabs={TABS}
          activeTab={activeTab}
          onTabChange={setActiveTab}
        />

        {activeTab === 'radius' && <RadiusEditor activeGroup={activeGroup} />}
        
        {activeTab === 'typography' && (
          <div className="empty-state">Typography Editor — coming soon</div>
        )}
        
        {activeTab === 'spacing' && (
          <div className="empty-state">Spacing Editor — coming soon</div>
        )}
        
        {activeTab === 'grid' && (
          <div className="empty-state">Grid Editor — coming soon</div>
        )}
      </div>
    </div>
  );
}

export default App;
