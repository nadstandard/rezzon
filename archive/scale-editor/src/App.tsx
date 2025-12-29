import { useState } from 'react';
import { Sidebar } from './components/Sidebar';
import { Tabs } from './components/Tabs';
import { RadiusEditor } from './components/RadiusEditor';
import { SpacingEditor } from './components/SpacingEditor';
import { TypographyEditor } from './components/TypographyEditor';
import { GridEditor } from './components/GridEditor';
import { useRadiusStore } from './stores/radiusStore';
import { useSpacingStore, buildSidebarGroups } from './stores/spacingStore';
import { useTypographyStore, buildTypographySidebarGroups } from './stores/typographyStore';
import { useGridStore } from './stores/gridStore';
import type { CollectionType } from './types';

const TABS = [
  { type: 'typography' as const, label: 'Typography Scale' },
  { type: 'spacing' as const, label: 'Spacing Scale' },
  { type: 'grid' as const, label: 'Grid' },
  { type: 'radius' as const, label: 'Radius' },
];

function App() {
  const [activeTab, setActiveTab] = useState<CollectionType>('typography');
  const [activeGroup, setActiveGroup] = useState('All');
  
  const radiusStore = useRadiusStore();
  const spacingStore = useSpacingStore();
  const typographyStore = useTypographyStore();
  const gridStore = useGridStore();
  
  const activeSpacingCollection = spacingStore.collections[spacingStore.activeCollectionIndex];
  const activeTypographyCollection = typographyStore.collections[typographyStore.activeCollectionIndex];
  
  const radiusRefCount = radiusStore.refScale.length;
  const radiusVarCount = 4 * (radiusRefCount + 1) + 5;

  // Calculate spacing var count from active collection
  const spacingRefCount = activeSpacingCollection?.refScale.length ?? 0;
  const spacingTypes = Object.keys(activeSpacingCollection?.scales ?? {});
  const spacingViewports = spacingTypes.length > 0 
    ? Object.keys(activeSpacingCollection?.scales[spacingTypes[0]] ?? {}) 
    : [];
  const spacingVarCount = spacingRefCount * spacingTypes.length * spacingViewports.length;

  // Calculate typography var count
  const typographyRefCount = activeTypographyCollection?.refScale.length ?? 0;
  const typographyViewports = activeTypographyCollection?.groups.length ?? 0;
  const typographyCategories = activeTypographyCollection?.categories?.length ?? 1;
  const typographyVarCount = typographyRefCount * typographyViewports * typographyCategories;

  // Calculate grid var count
  const gridVarCount = 4 * (5 + 8 + 80 + 40) + gridStore.folders.length * 48;

  const collections = [
    { type: 'typography' as const, name: 'Typography', count: typographyVarCount },
    { type: 'spacing' as const, name: 'Spacing', count: spacingVarCount },
    { type: 'grid' as const, name: 'Grid', count: gridVarCount },
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
      const dynamicGroups = buildSidebarGroups(activeSpacingCollection.groups, spacingRefCount);
      return [
        { name: 'All', path: 'All', count: spacingVarCount, indent: 0 },
        ...dynamicGroups,
      ];
    }
    if (activeTab === 'typography' && activeTypographyCollection) {
      const dynamicGroups = buildTypographySidebarGroups(
        activeTypographyCollection.groups,
        typographyRefCount,
        activeTypographyCollection.categories
      );
      return [
        { name: 'All', path: 'All', count: typographyVarCount, indent: 0 },
        ...dynamicGroups,
      ];
    }
    // Grid has its own sidebar, return empty
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

  // Get typography collections for sidebar (Size, Line Height)
  const getTypographyCollections = () => {
    return typographyStore.collections.map((coll, idx) => ({
      name: coll.name,
      count: coll.refScale.length * coll.groups.length * (coll.categories?.length ?? 1),
      active: idx === typographyStore.activeCollectionIndex,
      onClick: () => {
        typographyStore.setActiveCollection(idx);
        setActiveGroup('All');
      },
    }));
  };

  const getSubCollections = () => {
    if (activeTab === 'spacing') return getSpacingCollections();
    if (activeTab === 'typography') return getTypographyCollections();
    return undefined;
  };

  // Grid has its own layout with integrated sidebar
  if (activeTab === 'grid') {
    return (
      <div className="app-layout app-layout-grid">
        <Tabs
          tabs={TABS}
          activeTab={activeTab}
          onTabChange={(type) => {
            setActiveTab(type);
            setActiveGroup('All');
          }}
        />
        <GridEditor />
      </div>
    );
  }

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
        subCollections={getSubCollections()}
      />

      <main className="main-content">
        <Tabs
          tabs={TABS}
          activeTab={activeTab}
          onTabChange={(type) => {
            setActiveTab(type);
            setActiveGroup('All');
          }}
        />

        {activeTab === 'typography' && <TypographyEditor activeGroup={activeGroup} />}
        
        {activeTab === 'spacing' && <SpacingEditor activeGroup={activeGroup} />}
        
        {activeTab === 'radius' && <RadiusEditor activeGroup={activeGroup} />}
      </main>
    </div>
  );
}

export default App;
