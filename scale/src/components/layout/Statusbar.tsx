import { useMemo } from 'react';
import { useGridStore } from '../../store';
import { calculateFolderTokenCount, type FolderGeneratorContext } from '../../engine/generator';

export function Statusbar() {
  const { 
    viewports, styles, outputFolders, 
    baseParameters, computedParameters, modifiers, ratioFamilies, responsiveVariants 
  } = useGridStore();
  
  // Calculate total tokens from outputFolders
  const totalTokens = useMemo(() => {
    const ctx: FolderGeneratorContext = {
      styles, viewports, baseParameters, computedParameters,
      modifiers, ratioFamilies, responsiveVariants,
    };
    return outputFolders.reduce((sum, f) => {
      if (!f.path) return sum;
      return sum + calculateFolderTokenCount(f, ctx);
    }, 0);
  }, [outputFolders, styles, viewports, baseParameters, computedParameters, modifiers, ratioFamilies, responsiveVariants]);

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
