import { Icon } from '../Icons';

type Section = 'grid' | 'typography' | 'spacing' | 'radii';

interface HeaderProps {
  activeSection: Section;
  onSectionChange: (section: Section) => void;
}

export function Header({ activeSection, onSectionChange }: HeaderProps) {
  const sections: { id: Section; name: string; icon: string }[] = [
    { id: 'grid', name: 'Grid', icon: 'grid' },
    { id: 'typography', name: 'Typography', icon: 'type' },
    { id: 'spacing', name: 'Spacing', icon: 'spacing' },
    { id: 'radii', name: 'Radii', icon: 'radius' },
  ];

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
        <button className="btn btn--primary">
          <Icon name="ul" size="sm" />
          Export
        </button>
      </div>
    </header>
  );
}
