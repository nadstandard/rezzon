import { Icon } from '../Icons';
import { useGridStore } from '../../store';
import { ParametersView } from './ParametersView';
import { GeneratorsView } from './GeneratorsView';
import { PreviewView } from './PreviewView';

export function GridEditor() {
  const { activeTab, setActiveTab, selectedViewportId, viewports } = useGridStore();

  const selectedViewport = viewports.find((vp) => vp.id === selectedViewportId);

  return (
    <main className="main">
      {/* Toolbar with tabs */}
      <div className="toolbar">
        <div className="tabs">
          <div
            className={`tab ${activeTab === 'parameters' ? 'active' : ''}`}
            onClick={() => setActiveTab('parameters')}
          >
            Parameters
          </div>
          <div
            className={`tab ${activeTab === 'generators' ? 'active' : ''}`}
            onClick={() => setActiveTab('generators')}
          >
            Generators
          </div>
          <div
            className={`tab ${activeTab === 'preview' ? 'active' : ''}`}
            onClick={() => setActiveTab('preview')}
          >
            Preview
          </div>
        </div>

        <div className="toolbar__spacer" />

        {/* Current viewport indicator */}
        {selectedViewport && activeTab === 'parameters' && (
          <div className="toolbar__info">
            <Icon name={selectedViewport.icon} size="sm" />
            <strong>{selectedViewport.width}</strong>
            <span>{selectedViewport.name}</span>
          </div>
        )}
      </div>

      {/* Content based on active tab */}
      {activeTab === 'parameters' && <ParametersView />}
      {activeTab === 'generators' && <GeneratorsView />}
      {activeTab === 'preview' && <PreviewView />}

      {/* Legend (only for parameters view) */}
      {activeTab === 'parameters' && (
        <div className="legend">
          <div className="legend__item">
            <div className="legend__icon legend__icon--base">#</div>
            <span>Base value (editable)</span>
          </div>
          <div className="legend__item">
            <div className="legend__icon legend__icon--computed">ƒ</div>
            <span>Computed (auto-calculated)</span>
          </div>
          <div className="legend__item">
            <div className="legend__icon legend__icon--generated">=</div>
            <span>Generated token series</span>
          </div>
        </div>
      )}
    </main>
  );
}
