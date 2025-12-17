import { useState } from 'react';
import { Sidebar } from './components/Sidebar';
import { Tabs } from './components/Tabs';
import { RadiusEditor } from './components/RadiusEditor';
import { SpacingEditor } from './components/SpacingEditor';
import { useRadiusStore } from './stores/radiusStore';
import { useSpacingStore } from './stores/spacingStore';
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
  const spacingStore = useSpacingStore();
  
  const radiusRefCount = radiusStore.refScale.length;
  const radiusVarCount = 4 * (radiusRefCount + 1) + 5;
  
  const spacingRefCount = spacingStore.refScale.length;
  const spacingVarCount = spacingRefCount * 8 + 8; // refs * (4 viewports * 2 types) + 8 scale params

  const collections = [
    { type: 'typography' as const, name: 'Typography', count: null },
    { type: 'spacing' as const, name: 'Spacing', count: spacingVarCount },
    { type: 'grid' as const, name: 'Grid', count: null },
    { type: 'radius' as const, name: 'Radius', count: radiusVarCount },
  ];

  const getSidebarGroups = () => {
    if (activeTab === 'radius') {
      const perViewport = radiusRefCount + 1;
      return [
        { name: 'All', count: 4 * perViewport + 5 },
        { name: 'Desktop', count: perViewport, indent: 0 },
        { name: 'Laptop', count: perViewport, indent: 0 },
        { name: 'Tablet', count: perViewport, indent: 0 },
        { name: 'Mobile', count: perViewport, indent: 0 },
      ];
    }
    if (activeTab === 'spacing') {
      const perTypeViewport = spacingRefCount * 4; // 4 viewports
      return [
        { name: 'All', count: spacingVarCount },
        { name: 'Padding', count: perTypeViewport, indent: 0 },
        { name: 'Spacing', count: perTypeViewport, indent: 0 },
      ];
    }
    return [{ name: 'All', count: 0 }];
  };

  return (
    <div className="app-layout">
      <Sidebar
        collections={collections}
        activeCollection={activeTab}
        onCollectionSelect={(type) => {
          setActiveTab(type);
          setActiveGroup('All');
        }}
        groups={getSidebarGroups()}
        activeGroup={activeGroup}
        onGroupSelect={setActiveGroup}
      />

      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
        <Tabs
          tabs={TABS}
          activeTab={activeTab}
          onTabChange={(type) => {
            setActiveTab(type);
            setActiveGroup('All');
          }}
        />

        {activeTab === 'radius' && <RadiusEditor activeGroup={activeGroup} />}
        
        {activeTab === 'spacing' && <SpacingEditor activeGroup={activeGroup} />}
        
        {activeTab === 'typography' && (
          <div className="empty-state">Typography Editor — coming soon</div>
        )}
        
        {activeTab === 'grid' && (
          <div className="empty-state">Grid Editor — coming soon</div>
        )}
      </div>
    </div>
  );
}

export default App;
