import { useAppStore } from '../../stores/appStore';

export function Statusbar() {
  const libraries = useAppStore((state) => state.libraries);
  const selectedVariables = useAppStore((state) => state.ui.selectedVariables);
  
  // Oblicz statystyki
  const totalVariables = libraries.reduce((acc, lib) => {
    return acc + Object.keys(lib.file.variables || {}).length;
  }, 0);
  
  const selectedCount = selectedVariables.length;
  
  // TODO: Policzyć broken aliases
  const brokenCount = 0;

  return (
    <footer className="statusbar">
      <div className="status-item">
        <span className="status-dot status-dot--ok" />
        {totalVariables.toLocaleString()} variables
      </div>
      
      {selectedCount > 0 && (
        <div className="status-item">
          <span className="status-dot status-dot--warn" />
          {selectedCount} selected
        </div>
      )}
      
      {brokenCount > 0 && (
        <div className="status-item">
          <span className="status-dot status-dot--err" />
          {brokenCount} broken
        </div>
      )}
      
      <div className="statusbar__spacer" />
      
      <div className="shortcut">
        <kbd>⌘</kbd><kbd>K</kbd> Search
      </div>
      <div className="shortcut">
        <kbd>⌘</kbd><kbd>Z</kbd> Undo
      </div>
    </footer>
  );
}
