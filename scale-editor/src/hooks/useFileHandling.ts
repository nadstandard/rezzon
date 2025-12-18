import { useState, useCallback } from 'react';

interface UseFileHandlingOptions {
  onImport: (data: unknown) => void;
  exportData: () => object;
  exportFilename: string;
  validateJson?: (data: unknown) => { valid: boolean; error?: string };
}

interface UseFileHandlingReturn {
  importError: string | null;
  isImporting: boolean;
  clearError: () => void;
  handleImport: (file: File) => void;
  handleExport: () => void;
}

// Default validator - checks basic Figma variables JSON structure
const defaultValidator = (data: unknown): { valid: boolean; error?: string } => {
  if (!data || typeof data !== 'object') {
    return { valid: false, error: 'Invalid JSON structure' };
  }
  
  const json = data as Record<string, unknown>;
  
  if (!Array.isArray(json.collections)) {
    return { valid: false, error: 'Missing "collections" array in JSON' };
  }
  
  if (json.collections.length === 0) {
    return { valid: false, error: 'JSON contains no collections' };
  }
  
  for (const coll of json.collections) {
    if (!coll || typeof coll !== 'object') {
      return { valid: false, error: 'Invalid collection structure' };
    }
    const c = coll as Record<string, unknown>;
    if (!Array.isArray(c.modes)) {
      return { valid: false, error: 'Collection missing "modes" array' };
    }
    if (!Array.isArray(c.variables)) {
      return { valid: false, error: 'Collection missing "variables" array' };
    }
  }
  
  return { valid: true };
};

export function useFileHandling({
  onImport,
  exportData,
  exportFilename,
  validateJson = defaultValidator,
}: UseFileHandlingOptions): UseFileHandlingReturn {
  const [importError, setImportError] = useState<string | null>(null);
  const [isImporting, setIsImporting] = useState(false);

  const clearError = useCallback(() => {
    setImportError(null);
  }, []);

  const handleImport = useCallback((file: File) => {
    setIsImporting(true);
    setImportError(null);
    
    const reader = new FileReader();
    
    reader.onload = (e) => {
      try {
        const text = e.target?.result as string;
        const data = JSON.parse(text);
        
        const validation = validateJson(data);
        if (!validation.valid) {
          setImportError(validation.error || 'Invalid JSON format');
          setIsImporting(false);
          return;
        }
        
        onImport(data);
        setIsImporting(false);
      } catch (err) {
        const message = err instanceof SyntaxError 
          ? 'Invalid JSON syntax' 
          : 'Failed to read file';
        setImportError(message);
        setIsImporting(false);
      }
    };
    
    reader.onerror = () => {
      setImportError('Failed to read file');
      setIsImporting(false);
    };
    
    reader.readAsText(file);
  }, [onImport, validateJson]);

  const handleExport = useCallback(() => {
    try {
      const output = exportData();
      const blob = new Blob([JSON.stringify(output, null, 2)], {
        type: 'application/json',
      });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = exportFilename.endsWith('.json') ? exportFilename : `${exportFilename}.json`;
      a.click();
      URL.revokeObjectURL(url);
    } catch (err) {
      console.error('Export failed:', err);
    }
  }, [exportData, exportFilename]);

  return {
    importError,
    isImporting,
    clearError,
    handleImport,
    handleExport,
  };
}
