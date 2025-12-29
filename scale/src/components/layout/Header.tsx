import { Icon } from '../Icons';
import { useGridStore } from '../../store';

type Section = 'grid' | 'typography' | 'spacing' | 'radii';

interface HeaderProps {
  activeSection: Section;
  onSectionChange: (section: Section) => void;
}

export function Header({ activeSection, onSectionChange }: HeaderProps) {
  const exportToJSON = useGridStore((state) => state.exportToJSON);
  
  const sections: { id: Section; name: string; icon: string }[] = [
    { id: 'grid', name: 'Grid', icon: 'grid' },
    { id: 'typography', name: 'Typography', icon: 'type' },
    { id: 'spacing', name: 'Spacing', icon: 'spacing' },
    { id: 'radii', name: 'Radii', icon: 'radius' },
  ];

  const handleExport = () => {
    const data = exportToJSON();
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `scale-export-${new Date().toISOString().split('T')[0]}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
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
        <button className="btn btn--ghost">
          <Icon name="dl" size="sm" />
          Import
        </button>
        <button className="btn btn--primary" onClick={handleExport}>
          <Icon name="ul" size="sm" />
          Export
        </button>
      </div>
    </header>
  );
}
