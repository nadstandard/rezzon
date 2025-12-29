import { useState } from 'react';
import { IconSprites } from './components/Icons';
import { Header, Sidebar, Statusbar } from './components/layout';
import { GridEditor } from './components/grid';

// Import styles
import './styles/rezzon-studio-styles.css';
import './styles/rezzon-scale-styles.css';

type Section = 'grid' | 'typography' | 'spacing' | 'radii';

function App() {
  const [activeSection, setActiveSection] = useState<Section>('grid');

  return (
    <div className="app app--scale">
      {/* SVG Icon sprites */}
      <IconSprites />

      {/* Header */}
      <Header activeSection={activeSection} onSectionChange={setActiveSection} />

      {/* Sidebar */}
      <Sidebar />

      {/* Main content based on section */}
      {activeSection === 'grid' && <GridEditor />}
      {activeSection === 'typography' && (
        <main className="main">
          <div className="empty-state">
            <div className="empty-state__icon">T</div>
            <div className="empty-state__title">Typography</div>
            <div className="empty-state__desc">
              Typography scale editor coming soon.
            </div>
          </div>
        </main>
      )}
      {activeSection === 'spacing' && (
        <main className="main">
          <div className="empty-state">
            <div className="empty-state__icon">S</div>
            <div className="empty-state__title">Spacing</div>
            <div className="empty-state__desc">
              Spacing scale editor coming soon.
            </div>
          </div>
        </main>
      )}
      {activeSection === 'radii' && (
        <main className="main">
          <div className="empty-state">
            <div className="empty-state__icon">R</div>
            <div className="empty-state__title">Radii</div>
            <div className="empty-state__desc">
              Border radius scale editor coming soon.
            </div>
          </div>
        </main>
      )}

      {/* Statusbar */}
      <Statusbar />
    </div>
  );
}

export default App;
