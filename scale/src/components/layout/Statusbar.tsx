import { useGridStore } from '../../store';

export function Statusbar() {
  const { viewports, styles, outputLayers } = useGridStore();
  
  // Calculate total tokens
  const totalTokens = outputLayers.reduce((sum, layer) => sum + layer.tokenCount, 0);

  return (
    <footer className="statusbar">
      <div className="status-item">
        <span className="status-dot status-dot--ok" />
        {viewports.length} viewports
      </div>
      <div className="status-item">{styles.length} styles</div>
      <div className="status-item">{totalTokens.toLocaleString()} tokens</div>
      <div className="statusbar__spacer" />
      <div className="shortcut">
        <kbd>Tab</kbd> Next cell
      </div>
      <div className="shortcut">
        <kbd>Enter</kbd> Confirm
      </div>
    </footer>
  );
}
