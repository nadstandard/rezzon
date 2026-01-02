import { useState } from 'react';
import { Icon } from '../Icons';
import { ImportModal, ExportModal, ConfirmDeleteModal } from '../Modals';
import { useGridStore } from '../../store';
import { countTokens } from '../../engine/generator';

type Section = 'grid' | 'typography' | 'spacing' | 'radii';

interface HeaderProps {
  activeSection: Section;
  onSectionChange: (section: Section) => void;
}

export function Header({ activeSection, onSectionChange }: HeaderProps) {
  const [importModalOpen, setImportModalOpen] = useState(false);
  const [exportModalOpen, setExportModalOpen] = useState(false);
  const [clearModalOpen, setClearModalOpen] = useState(false);
  
  const exportToJSON = useGridStore((state) => state.exportToJSON);
  const exportSessionToJSON = useGridStore((state) => state.exportSessionToJSON);
  const importFromJSON = useGridStore((state) => state.importFromJSON);
  const clearWorkspace = useGridStore((state) => state.clearWorkspace);
  
  // Get token count for export modal
  const viewports = useGridStore((state) => state.viewports);
  const styles = useGridStore((state) => state.styles);
  const modifiers = useGridStore((state) => state.modifiers);
  const responsiveVariants = useGridStore((state) => state.responsiveVariants);
  
  const { total: tokenCount } = countTokens(viewports, styles, modifiers, responsiveVariants);
  
  const sections: { id: Section; name: string; icon: string }[] = [
    { id: 'grid', name: 'Grid', icon: 'grid' },
    { id: 'typography', name: 'Typography', icon: 'type' },
    { id: 'spacing', name: 'Spacing', icon: 'spacing' },
    { id: 'radii', name: 'Radii', icon: 'radius' },
  ];

  const handleExportSession = () => {
    const data = exportSessionToJSON();
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `scale-session-${new Date().toISOString().split('T')[0]}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };
  
  const handleExportTokens = () => {
    const data = exportToJSON();
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `scale-tokens-${new Date().toISOString().split('T')[0]}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleImport = (data: unknown): { success: boolean; errors: string[] } => {
    return importFromJSON(data);
  };

  return (
    <>
      <header className="header">
        {/* Logo */}
        <div className="logo">
          <div className="logo__icon logo__icon--scale">S</div>
          <span className="logo__text">REZZON Scale</span>
        </div>

        {/* Section tabs */}
        <div className="scale-tabs">
          {sections.map((section) => (
            <div
              key={section.id}
              className={`scale-tab ${activeSection === section.id ? 'active' : ''}`}
              onClick={() => onSectionChange(section.id)}
            >
              <Icon name={section.icon} size="sm" />
              {section.name}
            </div>
          ))}
        </div>

        <div className="header__spacer" />

        {/* Actions */}
        <div className="header__actions">
          <button className="btn btn--ghost" onClick={() => setClearModalOpen(true)} title="Clear Workspace">
            <Icon name="trash" size="sm" />
          </button>
          <button className="btn btn--ghost" onClick={() => setImportModalOpen(true)}>
            <Icon name="dl" size="sm" />
            Import
          </button>
          <button className="btn btn--primary" onClick={() => setExportModalOpen(true)}>
            <Icon name="ul" size="sm" />
            Export
          </button>
        </div>
      </header>
      
      {/* Modals */}
      <ImportModal
        isOpen={importModalOpen}
        onClose={() => setImportModalOpen(false)}
        onImport={handleImport}
      />
      
      <ExportModal
        isOpen={exportModalOpen}
        onClose={() => setExportModalOpen(false)}
        onExportSession={handleExportSession}
        onExportTokens={handleExportTokens}
        tokenCount={tokenCount}
      />
      
      <ConfirmDeleteModal
        isOpen={clearModalOpen}
        onClose={() => setClearModalOpen(false)}
        onConfirm={() => { clearWorkspace(); setClearModalOpen(false); }}
        title="Clear Workspace"
        message="This will remove all viewports, styles, parameters, modifiers, ratios, and output folders. This action cannot be undone."
      />
    </>
  );
}
