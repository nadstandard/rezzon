import { useState } from 'react';
import { Sidebar } from './components/Sidebar';
import { Tabs } from './components/Tabs';
import { RadiusEditor } from './components/RadiusEditor';
import { SpacingEditor } from './components/SpacingEditor';
import { useRadiusStore } from './stores/radiusStore';
import { useSpacingStore, buildSidebarGroups } from './stores/spacingStore';
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
  const activeSpacingCollection = spacingStore.collections[spacingStore.activeCollectionIndex];
  
  const radiusRefCount = radiusStore.refScale.length;
  const radiusVarCount = 4 * (radiusRefCount + 1) + 5;

  // Calculate spacing var count from active collection
  const spacingRefCount = activeSpacingCollection?.refScale.length ?? 0;
  const spacingTypes = Object.keys(activeSpacingCollection?.scales ?? {});
  const spacingViewports = spacingTypes.length > 0 
    ? Object.keys(activeSpacingCollection?.scales[spacingTypes[0]] ?? {}) 
    : [];
  const spacingVarCount = spacingRefCount * spacingTypes.length * spacingViewports.length;

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
        { name: 'All', path: 'All', count: 4 * perViewport + 5, indent: 0 },
        { name: 'Desktop', path: 'Desktop', count: perViewport, indent: 0 },
        { name: 'Laptop', path: 'Laptop', count: perViewport, indent: 0 },
        { name: 'Tablet', path: 'Tablet', count: perViewport, indent: 0 },
        { name: 'Mobile', path: 'Mobile', count: perViewport, indent: 0 },
      ];
    }
    if (activeTab === 'spacing' && activeSpacingCollection) {
      // Dynamic groups from JSON
      const dynamicGroups = buildSidebarGroups(activeSpacingCollection.groups, spacingRefCount);
      return [
        { name: 'All', path: 'All', count: spacingVarCount, indent: 0 },
        ...dynamicGroups,
      ];
    }
    return [{ name: 'All', path: 'All', count: 0, indent: 0 }];
  };

  // Get spacing collections for sidebar
  const getSpacingCollections = () => {
    return spacingStore.collections.map((coll, idx) => ({
      name: coll.name,
      count: coll.refScale.length * Object.keys(coll.scales).length * 
        (Object.keys(coll.scales[Object.keys(coll.scales)[0]] || {}).length || 1),
      active: idx === spacingStore.activeCollectionIndex,
      onClick: () => {
        spacingStore.setActiveCollection(idx);
        setActiveGroup('All');
      },
    }));
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
        subCollections={activeTab === 'spacing' ? getSpacingCollections() : undefined}
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
