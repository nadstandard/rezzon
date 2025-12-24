import { 
  Maximize2, 
  Minimize2, 
  Edit3, 
  Copy, 
  Trash2, 
  Link, 
  Undo2, 
  Redo2, 
  Filter, 
  PanelRight,
  Hash,
  ArrowRight
} from 'lucide-react';
import { useAppStore } from '../../stores/appStore';
import { VariablesSidebar } from '../../components/layout/VariablesSidebar';
import { DetailsPanel } from '../../components/layout/DetailsPanel';

export function VariablesView() {
  const libraries = useAppStore((state) => state.libraries);
  const selectedLibraryId = useAppStore((state) => state.ui.selectedLibraryId);
  const selectedCollectionId = useAppStore((state) => state.ui.selectedCollectionId);
  const detailsPanelOpen = useAppStore((state) => state.ui.detailsPanelOpen);
  const toggleDetailsPanel = useAppStore((state) => state.toggleDetailsPanel);
  const expandAllFolders = useAppStore((state) => state.expandAllFolders);
  const collapseAllFolders = useAppStore((state) => state.collapseAllFolders);
  
  const selectedLibrary = libraries.find((l) => l.id === selectedLibraryId);
  const selectedCollection = selectedLibrary?.file.variableCollections?.[selectedCollectionId || ''];
  
  // Pobierz zmienne dla wybranej kolekcji
  const variables = selectedCollection?.variableIds
    .map((id) => selectedLibrary?.file.variables?.[id])
    .filter(Boolean) || [];
  
  // Pobierz modes
  const modes = selectedCollection?.modes || [];

  return (
    <>
      <VariablesSidebar />
      
      <main className="main">
        {/* Toolbar */}
        <div className="toolbar">
          <div className="toolbar__group">
            <button className="tool-btn" title="Expand all" onClick={expandAllFolders}>
              <Maximize2 className="icon" />
            </button>
            <button className="tool-btn" title="Collapse all" onClick={collapseAllFolders}>
              <Minimize2 className="icon" />
            </button>
          </div>
          
          <div className="toolbar__sep" />
          
          <div className="toolbar__group">
            <button className="tool-btn" title="Rename">
              <Edit3 className="icon" />
            </button>
            <button className="tool-btn" title="Duplicate">
              <Copy className="icon" />
            </button>
            <button className="tool-btn" title="Delete">
              <Trash2 className="icon" />
            </button>
          </div>
          
          <div className="toolbar__sep" />
          
          <button className="tool-btn" title="Bulk Alias">
            <Link className="icon" />
          </button>
          
          <div className="toolbar__sep" />
          
          <div className="toolbar__group">
            <button className="tool-btn" title="Undo">
              <Undo2 className="icon" />
            </button>
            <button className="tool-btn" title="Redo" disabled>
              <Redo2 className="icon" />
            </button>
          </div>
          
          <div className="toolbar__sep" />
          
          <button className="filter-btn">
            <Filter className="icon sm" />
            Filter
          </button>
          
          <div className="toolbar__sep" />
          
          <button 
            className={`tool-btn ${detailsPanelOpen ? 'active' : ''}`}
            title="Details panel"
            onClick={toggleDetailsPanel}
          >
            <PanelRight className="icon" />
          </button>
          
          <div className="toolbar__spacer" />
          
          <div className="breadcrumb">
            <span className="breadcrumb__item">{selectedLibrary?.name || 'Select library'}</span>
            {selectedCollection && (
              <>
                <span className="breadcrumb__sep">›</span>
                <span className="breadcrumb__current">{selectedCollection.name}</span>
              </>
            )}
          </div>
        </div>

        {/* Table */}
        <div className="table-wrap">
          {!selectedCollection ? (
            <div style={{ 
              display: 'flex', 
              alignItems: 'center', 
              justifyContent: 'center', 
              height: '100%',
              color: 'var(--text-muted)'
            }}>
              Select a library and collection to view variables
            </div>
          ) : (
            <table className="table var-table">
              <thead>
                <tr>
                  <th className="col-check">
                    <div className="checkbox" />
                  </th>
                  <th className="col-name">Name</th>
                  {modes.map((mode) => (
                    <th key={mode.modeId} className="col-mode">
                      <div className="mode-header">
                        <span className="mode-header__label">{mode.name}</span>
                      </div>
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {variables.length === 0 ? (
                  <tr>
                    <td colSpan={2 + modes.length} style={{ textAlign: 'center', color: 'var(--text-muted)', padding: '40px' }}>
                      No variables in this collection
                    </td>
                  </tr>
                ) : (
                  variables.map((variable) => (
                    <tr key={variable!.id} className="row-var">
                      <td>
                        <div className="table__check-cell">
                          <div className="checkbox" />
                        </div>
                      </td>
                      <td>
                        <div className="var-cell">
                          <div className="type-badge">
                            <Hash className="icon sm" />
                          </div>
                          <span className="var-cell__name">
                            {variable!.name.split('/').pop()}
                          </span>
                        </div>
                      </td>
                      {modes.map((mode) => {
                        const value = variable!.valuesByMode?.[mode.modeId];
                        const isAlias = value && typeof value === 'object' && 'type' in value && value.type === 'VARIABLE_ALIAS';
                        
                        return (
                          <td key={mode.modeId} className="val-cell">
                            {isAlias ? (
                              <div className="val-alias val-alias--internal">
                                <ArrowRight className="icon sm" />
                                <span className="val-alias__path">alias</span>
                              </div>
                            ) : (
                              <span className="val-text">
                                {typeof value === 'object' && value && 'value' in value
                                  ? String(value.value)
                                  : String(value ?? '-')}
                              </span>
                            )}
                          </td>
                        );
                      })}
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          )}
        </div>
      </main>
      
      {detailsPanelOpen && <DetailsPanel />}
    </>
  );
}
