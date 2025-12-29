import type { Library, Variable, AliasType, AliasInfo, VariableValue } from '../types';

/**
 * Określa typ aliasu dla danej wartości
 */
export function getAliasType(
  value: VariableValue,
  sourceLibrary: Library,
  allLibraries: Library[]
): AliasType {
  if (value.type !== 'VARIABLE_ALIAS' || !value.variableId) {
    return 'none';
  }

  // Sprawdź czy alias jest w tej samej bibliotece
  if (sourceLibrary.file.variables[value.variableId]) {
    return 'internal';
  }

  // Sprawdź w innych bibliotekach
  for (const lib of allLibraries) {
    if (lib.id === sourceLibrary.id) continue;
    if (lib.file.variables[value.variableId]) {
      return 'external';
    }
  }

  // Nie znaleziono - broken
  return 'broken';
}

/**
 * Pobiera informacje o aliasie
 */
export function getAliasInfo(
  sourceVariable: Variable,
  modeId: string,
  sourceLibrary: Library,
  allLibraries: Library[]
): AliasInfo | null {
  const value = sourceVariable.valuesByMode[modeId];
  if (!value || value.type !== 'VARIABLE_ALIAS' || !value.variableId) {
    return null;
  }

  const type = getAliasType(value, sourceLibrary, allLibraries);
  
  // Znajdź target variable
  let targetVariable: Variable | undefined;
  let targetLibrary = sourceLibrary.name;

  if (type === 'internal') {
    targetVariable = sourceLibrary.file.variables[value.variableId];
  } else if (type === 'external') {
    for (const lib of allLibraries) {
      if (lib.id === sourceLibrary.id) continue;
      const found = lib.file.variables[value.variableId];
      if (found) {
        targetVariable = found;
        targetLibrary = lib.name;
        break;
      }
    }
  }

  return {
    sourceVariableId: sourceVariable.id,
    sourceVariablePath: sourceVariable.name,
    targetVariableId: value.variableId,
    targetVariablePath: targetVariable?.name || value.variableName || 'Unknown',
    targetLibrary,
    type,
    modeId,
  };
}

/**
 * Zbiera wszystkie aliasy z biblioteki
 */
export function collectAliases(
  library: Library,
  allLibraries: Library[]
): AliasInfo[] {
  const aliases: AliasInfo[] = [];

  for (const variable of Object.values(library.file.variables)) {
    for (const modeId of Object.keys(variable.valuesByMode)) {
      const info = getAliasInfo(variable, modeId, library, allLibraries);
      if (info) {
        aliases.push(info);
      }
    }
  }

  return aliases;
}

/**
 * Oblicza statystyki aliasów dla biblioteki
 */
export function calculateAliasStats(
  library: Library,
  allLibraries: Library[]
): { internal: number; external: number; broken: number } {
  const stats = { internal: 0, external: 0, broken: 0 };
  const seen = new Set<string>(); // Unikaj duplikatów (ta sama zmienna w różnych modes)

  for (const variable of Object.values(library.file.variables)) {
    for (const [, value] of Object.entries(variable.valuesByMode)) {
      if (value.type !== 'VARIABLE_ALIAS' || !value.variableId) continue;
      
      const key = `${variable.id}-${value.variableId}`;
      if (seen.has(key)) continue;
      seen.add(key);

      const type = getAliasType(value, library, allLibraries);
      if (type === 'internal') stats.internal++;
      else if (type === 'external') stats.external++;
      else if (type === 'broken') stats.broken++;
    }
  }

  return stats;
}

/**
 * Znajduje wszystkie external libraries połączone z daną biblioteką
 */
export function findConnectedExternalLibraries(
  library: Library,
  allLibraries: Library[]
): { libraryId: string; libraryName: string; aliasCount: number }[] {
  const connections = new Map<string, { libraryId: string; libraryName: string; aliasCount: number }>();

  for (const variable of Object.values(library.file.variables)) {
    for (const value of Object.values(variable.valuesByMode)) {
      if (value.type !== 'VARIABLE_ALIAS' || !value.variableId) continue;

      // Sprawdź czy alias jest w innej bibliotece
      for (const lib of allLibraries) {
        if (lib.id === library.id) continue;
        if (lib.file.variables[value.variableId]) {
          const existing = connections.get(lib.id);
          if (existing) {
            existing.aliasCount++;
          } else {
            connections.set(lib.id, {
              libraryId: lib.id,
              libraryName: lib.name,
              aliasCount: 1,
            });
          }
          break;
        }
      }
    }
  }

  return Array.from(connections.values());
}

/**
 * Rozwiązuje alias do wartości bezpośredniej
 */
export function resolveAliasValue(
  value: VariableValue,
  modeId: string,
  sourceLibrary: Library,
  allLibraries: Library[],
  maxDepth = 10
): VariableValue {
  if (value.type !== 'VARIABLE_ALIAS' || !value.variableId || maxDepth <= 0) {
    return value;
  }

  // Znajdź target variable
  let targetVariable: Variable | undefined;
  
  // Najpierw w tej samej bibliotece
  targetVariable = sourceLibrary.file.variables[value.variableId];
  
  // Potem w innych
  if (!targetVariable) {
    for (const lib of allLibraries) {
      if (lib.id === sourceLibrary.id) continue;
      targetVariable = lib.file.variables[value.variableId];
      if (targetVariable) break;
    }
  }

  if (!targetVariable) {
    return value; // Broken alias - zwróć jak jest
  }

  const targetValue = targetVariable.valuesByMode[modeId];
  if (!targetValue) {
    return value;
  }

  // Rekurencyjnie rozwiąż jeśli target też jest aliasem
  return resolveAliasValue(targetValue, modeId, sourceLibrary, allLibraries, maxDepth - 1);
}

/**
 * Matchuje zmienne po nazwie dla bulk alias
 */
export function matchVariablesByName(
  sourceVariables: Variable[],
  targetVariables: Variable[]
): { matched: { source: Variable; target: Variable }[]; unmatched: Variable[] } {
  const matched: { source: Variable; target: Variable }[] = [];
  const unmatched: Variable[] = [];

  // Stwórz mapę targetów po końcowej nazwie (bez ścieżki)
  const targetMap = new Map<string, Variable>();
  for (const target of targetVariables) {
    const name = target.name.split('/').pop() || target.name;
    targetMap.set(name, target);
  }

  for (const source of sourceVariables) {
    const sourceName = source.name.split('/').pop() || source.name;
    const target = targetMap.get(sourceName);
    
    if (target && target.resolvedType === source.resolvedType) {
      matched.push({ source, target });
    } else {
      unmatched.push(source);
    }
  }

  return { matched, unmatched };
}
