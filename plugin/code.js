// REZZON Portal - Figma Plugin
// Import & Export zmiennych z pełnym wsparciem metadanych

figma.showUI(__html__, { width: 560, height: 700 });

// ============ HELPERS ============

function rgbToHex(r, g, b, a) {
  const toHex = (n) => {
    const hex = Math.round(n * 255).toString(16);
    return hex.length === 1 ? '0' + hex : hex;
  };
  const hex = '#' + toHex(r) + toHex(g) + toHex(b);
  if (a !== undefined && a < 1) {
    return hex + toHex(a);
  }
  return hex;
}

function hexToRgb(hex) {
  if (typeof hex !== 'string') return null;
  hex = hex.replace(/^#/, '');
  
  let r, g, b, a = 1;
  
  if (hex.length === 6) {
    r = parseInt(hex.substring(0, 2), 16) / 255;
    g = parseInt(hex.substring(2, 4), 16) / 255;
    b = parseInt(hex.substring(4, 6), 16) / 255;
  } else if (hex.length === 8) {
    r = parseInt(hex.substring(0, 2), 16) / 255;
    g = parseInt(hex.substring(2, 4), 16) / 255;
    b = parseInt(hex.substring(4, 6), 16) / 255;
    a = parseInt(hex.substring(6, 8), 16) / 255;
  } else {
    return null;
  }
  
  if (isNaN(r) || isNaN(g) || isNaN(b)) return null;
  return { r, g, b, a };
}

// ============ EXPORT ============

async function exportVariables() {
  const collections = await figma.variables.getLocalVariableCollectionsAsync();
  
  const result = {
    version: '1.0',
    exportedAt: new Date().toISOString(),
    fileName: figma.root.name,
    collections: []
  };

  for (const collection of collections) {
    const collectionData = {
      id: collection.id,
      name: collection.name,
      defaultModeId: collection.defaultModeId,
      hiddenFromPublishing: collection.hiddenFromPublishing,
      modes: collection.modes.map(m => ({
        id: m.modeId,
        name: m.name
      })),
      variables: []
    };

    for (const varId of collection.variableIds) {
      const variable = await figma.variables.getVariableByIdAsync(varId);
      if (!variable) continue;

      const varData = {
        id: variable.id,
        name: variable.name,
        type: variable.resolvedType,
        description: variable.description || '',
        hiddenFromPublishing: variable.hiddenFromPublishing,
        scopes: variable.scopes,
        codeSyntax: variable.codeSyntax,
        valuesByMode: {}
      };

      for (const mode of collection.modes) {
        const value = variable.valuesByMode[mode.modeId];
        
        if (value === undefined) {
          varData.valuesByMode[mode.modeId] = null;
        } else if (typeof value === 'object' && value.type === 'VARIABLE_ALIAS') {
          // Alias - zapisz pełną referencję
          const aliasedVar = await figma.variables.getVariableByIdAsync(value.id);
          if (aliasedVar) {
            const aliasedCollection = await figma.variables.getVariableCollectionByIdAsync(aliasedVar.variableCollectionId);
            varData.valuesByMode[mode.modeId] = {
              type: 'ALIAS',
              collectionName: aliasedCollection ? aliasedCollection.name : null,
              collectionId: aliasedVar.variableCollectionId,
              variableName: aliasedVar.name,
              variableId: value.id
            };
          } else {
            varData.valuesByMode[mode.modeId] = null;
          }
        } else if (typeof value === 'object' && 'r' in value) {
          // Kolor
          varData.valuesByMode[mode.modeId] = {
            type: 'COLOR',
            hex: rgbToHex(value.r, value.g, value.b, value.a),
            rgba: { r: value.r, g: value.g, b: value.b, a: value.a !== undefined ? value.a : 1 }
          };
        } else {
          // Liczba, string, boolean
          varData.valuesByMode[mode.modeId] = {
            type: variable.resolvedType,
            value: value
          };
        }
      }

      collectionData.variables.push(varData);
    }

    result.collections.push(collectionData);
  }

  return result;
}

// ============ IMPORT ============

async function importVariables(data, options) {
  const stats = {
    collectionsCreated: 0,
    collectionsUpdated: 0,
    variablesCreated: 0,
    variablesUpdated: 0,
    variablesRenamed: 0,
    aliasesResolved: 0,
    aliasesFailed: 0,
    skipped: 0,
    errors: []
  };

  if (!data.collections || !Array.isArray(data.collections)) {
    throw new Error('Nieprawidłowy format JSON - brak tablicy "collections"');
  }

  // Mapowanie istniejących kolekcji i zmiennych
  const existingCollections = {};
  const existingVariablesById = {};
  const existingVariablesByName = {};
  
  if (options.updateExisting) {
    const localColls = await figma.variables.getLocalVariableCollectionsAsync();
    for (const coll of localColls) {
      existingCollections[coll.name] = coll;
      
      for (const varId of coll.variableIds) {
        const variable = await figma.variables.getVariableByIdAsync(varId);
        if (variable) {
          existingVariablesById[variable.id] = variable;
          existingVariablesByName[coll.name + '::' + variable.name] = variable;
        }
      }
    }
  }

  // Mapa nowych zmiennych do rozwiązywania aliasów
  const variableMap = {}; // "collectionName::varName" -> variable
  const aliasesToResolve = [];

  // Pierwszy przebieg: twórz/aktualizuj kolekcje i zmienne
  for (const collData of data.collections) {
    try {
      let collection;
      const modeIdMap = {}; // stare modeId -> nowe modeId
      const isExisting = options.updateExisting && existingCollections[collData.name];
      
      if (isExisting) {
        collection = existingCollections[collData.name];
        stats.collectionsUpdated++;
        
        // Mapuj istniejące mode'y po nazwie
        for (const existingMode of collection.modes) {
          const importMode = collData.modes.find(m => m.name === existingMode.name);
          if (importMode) {
            modeIdMap[importMode.id] = existingMode.modeId;
          }
        }
        
        // Dodaj brakujące mode'y
        for (const importMode of collData.modes) {
          if (!modeIdMap[importMode.id]) {
            try {
              const newModeId = collection.addMode(importMode.name);
              modeIdMap[importMode.id] = newModeId;
            } catch (e) {
              stats.errors.push(`Mode ${importMode.name}: ${e.message}`);
            }
          }
        }
      } else {
        // Utwórz nową kolekcję
        collection = figma.variables.createVariableCollection(collData.name);
        stats.collectionsCreated++;
        
        // Ustaw hiddenFromPublishing
        if (collData.hiddenFromPublishing !== undefined) {
          collection.hiddenFromPublishing = collData.hiddenFromPublishing;
        }

        // Ustaw mode'y
        const firstMode = collData.modes[0];
        collection.renameMode(collection.modes[0].modeId, firstMode.name);
        modeIdMap[firstMode.id] = collection.modes[0].modeId;

        for (let i = 1; i < collData.modes.length; i++) {
          try {
            const newModeId = collection.addMode(collData.modes[i].name);
            modeIdMap[collData.modes[i].id] = newModeId;
          } catch (e) {
            stats.errors.push(`Mode ${collData.modes[i].name}: ${e.message}`);
          }
        }
      }

      // Przetwórz zmienne
      for (const varData of collData.variables) {
        try {
          let variable;
          const varKey = collData.name + '::' + varData.name;
          
          // Szukaj istniejącej zmiennej
          const existingById = options.updateExisting && existingVariablesById[varData.id];
          const existingByName = options.updateExisting && existingVariablesByName[varKey];
          
          if (existingById) {
            variable = existingById;
            
            // Sprawdź czy trzeba zmienić nazwę
            if (variable.name !== varData.name) {
              try {
                variable.name = varData.name;
                stats.variablesRenamed++;
              } catch (e) {
                stats.errors.push(`Rename ${variable.name}: ${e.message}`);
              }
            }
            stats.variablesUpdated++;
          } else if (existingByName) {
            variable = existingByName;
            stats.variablesUpdated++;
          } else {
            // Utwórz nową zmienną
            variable = figma.variables.createVariable(varData.name, collection, varData.type);
            stats.variablesCreated++;
          }
          
          variableMap[varKey] = variable;

          // Ustaw metadane
          if (varData.description) {
            variable.description = varData.description;
          }
          
          if (varData.hiddenFromPublishing !== undefined) {
            variable.hiddenFromPublishing = varData.hiddenFromPublishing;
          }
          
          if (varData.scopes && Array.isArray(varData.scopes)) {
            try {
              variable.scopes = varData.scopes;
            } catch (e) {
              // Niektóre scopes mogą być niedostępne
            }
          }
          
          if (varData.codeSyntax) {
            try {
              for (const [platform, syntax] of Object.entries(varData.codeSyntax)) {
                variable.setVariableCodeSyntax(platform, syntax);
              }
            } catch (e) {
              // Ignoruj błędy codeSyntax
            }
          }

          // Ustaw wartości dla każdego mode'a
          for (const [oldModeId, valueData] of Object.entries(varData.valuesByMode)) {
            const newModeId = modeIdMap[oldModeId];
            if (!newModeId || valueData === null) continue;

            if (valueData.type === 'ALIAS') {
              // Zapisz do późniejszego rozwiązania
              aliasesToResolve.push({
                variable,
                modeId: newModeId,
                targetCollection: valueData.collectionName,
                targetVariable: valueData.variableName,
                targetId: valueData.variableId
              });
            } else if (valueData.type === 'COLOR') {
              const rgb = valueData.rgba || hexToRgb(valueData.hex);
              if (rgb) {
                try {
                  variable.setValueForMode(newModeId, rgb);
                } catch (e) {
                  stats.errors.push(`${varData.name} (color): ${e.message}`);
                }
              }
            } else {
              // FLOAT, STRING, BOOLEAN
              try {
                variable.setValueForMode(newModeId, valueData.value);
              } catch (e) {
                stats.errors.push(`${varData.name}: ${e.message}`);
              }
            }
          }

        } catch (e) {
          stats.errors.push(`Variable ${varData.name}: ${e.message}`);
          stats.skipped++;
        }
      }

    } catch (e) {
      stats.errors.push(`Collection ${collData.name}: ${e.message}`);
    }
  }

  // Drugi przebieg: rozwiąż aliasy
  for (const alias of aliasesToResolve) {
    const targetKey = alias.targetCollection + '::' + alias.targetVariable;
    let targetVar = variableMap[targetKey];
    
    // Jeśli nie znaleziono w nowych, szukaj w istniejących
    if (!targetVar && options.updateExisting) {
      targetVar = existingVariablesByName[targetKey];
    }
    
    // Ostatnia szansa - szukaj po ID
    if (!targetVar && alias.targetId) {
      targetVar = await figma.variables.getVariableByIdAsync(alias.targetId);
    }
    
    if (targetVar) {
      try {
        alias.variable.setValueForMode(alias.modeId, {
          type: 'VARIABLE_ALIAS',
          id: targetVar.id
        });
        stats.aliasesResolved++;
      } catch (e) {
        stats.errors.push(`Alias -> ${alias.targetVariable}: ${e.message}`);
        stats.aliasesFailed++;
      }
    } else {
      stats.aliasesFailed++;
      stats.errors.push(`Alias nierozwiązany: ${alias.targetVariable} (kolekcja: ${alias.targetCollection})`);
    }
  }

  return stats;
}

// ============ MESSAGE HANDLER ============

figma.ui.onmessage = async (msg) => {
  if (msg.type === 'export') {
    try {
      const data = await exportVariables();
      figma.ui.postMessage({ type: 'exportResult', success: true, data });
      figma.notify(`✅ Wyeksportowano ${data.collections.length} kolekcji`);
    } catch (e) {
      figma.ui.postMessage({ type: 'exportResult', success: false, error: e.message });
      figma.notify(`❌ Błąd eksportu: ${e.message}`, { error: true });
    }
  }

  if (msg.type === 'import') {
    try {
      const data = JSON.parse(msg.json);
      const options = {
        updateExisting: msg.updateExisting || false
      };
      const stats = await importVariables(data, options);
      figma.ui.postMessage({ type: 'importResult', success: true, stats });
      
      let message = '✅ Import zakończony: ';
      const parts = [];
      if (stats.variablesCreated > 0) parts.push(`+${stats.variablesCreated} nowych`);
      if (stats.variablesUpdated > 0) parts.push(`${stats.variablesUpdated} zaktualizowanych`);
      if (stats.aliasesResolved > 0) parts.push(`${stats.aliasesResolved} aliasów`);
      message += parts.join(', ');
      
      figma.notify(message);
    } catch (e) {
      figma.ui.postMessage({ type: 'importResult', success: false, error: e.message });
      figma.notify(`❌ Błąd importu: ${e.message}`, { error: true });
    }
  }

  if (msg.type === 'cancel') {
    figma.closePlugin();
  }
};
