import type { Library, Variable, VariableCollection, VariableValue, VariableType } from '../types';

/**
 * Format eksportu z Figma Variables (przez plugin)
 */
interface FigmaExportFormat {
  version: string;
  exportedAt: string;
  fileName: string;
  collections: FigmaExportCollection[];
}

interface FigmaExportCollection {
  id: string;
  name: string;
  defaultModeId: string;
  hiddenFromPublishing: boolean;
  modes: { id: string; name: string }[];
  variables: FigmaExportVariable[];
}

interface FigmaExportVariable {
  id: string;
  name: string;
  type: string;
  description: string;
  hiddenFromPublishing: boolean;
  scopes: string[];
  codeSyntax: Record<string, string>;
  valuesByMode: Record<string, FigmaExportValue>;
}

interface FigmaExportValue {
  type: string;
  value?: any;
  // Color fields
  hex?: string;
  rgba?: { r: number; g: number; b: number; a: number };
  // Alias fields
  collectionName?: string;
  collectionId?: string;
  variableName?: string;
  variableId?: string;
}

/**
 * Mapuje typ z Figma na nasz typ
 */
function mapVariableType(figmaType: string): VariableType {
  switch (figmaType) {
    case 'COLOR':
      return 'COLOR';
    case 'FLOAT':
      return 'FLOAT';
    case 'STRING':
      return 'STRING';
    case 'BOOLEAN':
      return 'BOOLEAN';
    default:
      return 'STRING';
  }
}

/**
 * Konwertuje wartość z formatu Figma na nasz format
 */
function convertValue(figmaValue: FigmaExportValue): VariableValue {
  if (figmaValue.type === 'ALIAS') {
    return {
      type: 'VARIABLE_ALIAS',
      variableId: figmaValue.variableId,
      // Zachowujemy dodatkowe info o aliasie dla external
      variableName: figmaValue.variableName,
      collectionName: figmaValue.collectionName,
    };
  }
  
  // Dla kolorów - Figma eksportuje jako { type: "COLOR", hex: "#...", rgba: { r, g, b, a } }
  if (figmaValue.type === 'COLOR') {
    // Preferuj rgba jeśli dostępne (osobne pole, nie w value!)
    if (figmaValue.rgba) {
      return {
        type: 'DIRECT',
        value: figmaValue.rgba,
      };
    }
    // Fallback na hex (osobne pole)
    if (figmaValue.hex) {
      const hex = figmaValue.hex.replace('#', '');
      const r = parseInt(hex.substring(0, 2), 16) / 255;
      const g = parseInt(hex.substring(2, 4), 16) / 255;
      const b = parseInt(hex.substring(4, 6), 16) / 255;
      const a = hex.length === 8 ? parseInt(hex.substring(6, 8), 16) / 255 : 1;
      return {
        type: 'DIRECT',
        value: { r, g, b, a },
      };
    }
    // Stary format - value jako obiekt RGBA
    if (figmaValue.value && typeof figmaValue.value === 'object' && 'r' in figmaValue.value) {
      return {
        type: 'DIRECT',
        value: figmaValue.value,
      };
    }
  }
  
  return {
    type: 'DIRECT',
    value: figmaValue.value,
  };
}

/**
 * Parsuje plik JSON z eksportu Figma Variables
 */
export function parseFigmaVariablesFile(jsonContent: string, fileName: string): Library {
  const data: FigmaExportFormat = JSON.parse(jsonContent);
  
  // Konwertuj kolekcje
  const variableCollections: Record<string, VariableCollection> = {};
  const variables: Record<string, Variable> = {};
  
  for (const col of data.collections) {
    // Dodaj kolekcję
    variableCollections[col.id] = {
      id: col.id,
      name: col.name,
      modes: col.modes.map((m) => ({ modeId: m.id, name: m.name })),
      defaultModeId: col.defaultModeId,
      variableIds: col.variables.map((v) => v.id),
      hiddenFromPublishing: col.hiddenFromPublishing,
    };
    
    // Dodaj zmienne
    for (const v of col.variables) {
      const valuesByMode: Record<string, VariableValue> = {};
      
      for (const [modeId, value] of Object.entries(v.valuesByMode)) {
        valuesByMode[modeId] = convertValue(value);
      }
      
      variables[v.id] = {
        id: v.id,
        name: v.name,
        resolvedType: mapVariableType(v.type),
        valuesByMode,
        scopes: v.scopes,
        hiddenFromPublishing: v.hiddenFromPublishing,
        description: v.description,
        codeSyntax: v.codeSyntax,
      };
    }
  }
  
  // Określ czy to główna biblioteka
  const libraryName = data.fileName || fileName.replace('.json', '');
  // Główna biblioteka to REZZON (bez prefiksu numerycznego i bez R4-)
  // Biblioteki towarzyszące: 1-R4-Grid, 2-R4-Spacing, R4-Color, etc.
  const isMain = libraryName.toUpperCase() === 'REZZON' || 
    (libraryName.toUpperCase().includes('REZZON') && !libraryName.match(/^\d+-/) && !libraryName.startsWith('R4-'));
  
  // Policz zmienne
  const variableCount = Object.keys(variables).length;
  
  return {
    id: crypto.randomUUID(),
    name: libraryName,
    isMain,
    file: {
      version: data.version,
      variableCollections,
      variables,
    },
    variableCount,
  };
}

/**
 * Waliduje plik JSON przed parsowaniem
 */
export function validateFigmaFile(jsonContent: string): { valid: boolean; error?: string } {
  try {
    const data = JSON.parse(jsonContent);
    
    if (!data.collections || !Array.isArray(data.collections)) {
      return { valid: false, error: 'Missing or invalid "collections" array' };
    }
    
    if (data.collections.length === 0) {
      return { valid: false, error: 'File contains no collections' };
    }
    
    // Sprawdź czy każda kolekcja ma wymagane pola
    for (const col of data.collections) {
      if (!col.id || !col.name || !col.modes || !col.variables) {
        return { valid: false, error: `Invalid collection structure: ${col.name || 'unknown'}` };
      }
    }
    
    return { valid: true };
  } catch (e) {
    return { valid: false, error: `Invalid JSON: ${(e as Error).message}` };
  }
}

/**
 * Pobiera statystyki z pliku bez pełnego parsowania
 */
export function getFileStats(jsonContent: string): {
  fileName: string;
  collections: { name: string; variableCount: number; modes: string[] }[];
  totalVariables: number;
} {
  const data: FigmaExportFormat = JSON.parse(jsonContent);
  
  const collections = data.collections.map((col) => ({
    name: col.name,
    variableCount: col.variables.length,
    modes: col.modes.map((m) => m.name),
  }));
  
  const totalVariables = collections.reduce((sum, col) => sum + col.variableCount, 0);
  
  return {
    fileName: data.fileName,
    collections,
    totalVariables,
  };
}
