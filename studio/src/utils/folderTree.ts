import type { Variable } from '../types';

export interface FolderNode {
  id: string;
  name: string;
  path: string;
  depth: number;
  children: FolderNode[];
  variables: Variable[];
}

/**
 * Buduje drzewo folderów ze zmiennych na podstawie ich nazw (ścieżek)
 * Zachowuje oryginalną kolejność z Figmy (nie sortuje alfabetycznie)
 */
export function buildFolderTree(variables: Variable[]): FolderNode {
  const root: FolderNode = {
    id: 'root',
    name: 'Root',
    path: '',
    depth: 0,
    children: [],
    variables: [],
  };

  for (const variable of variables) {
    const parts = variable.name.split('/');
    parts.pop(); // usuwamy nazwę zmiennej, zostają tylko foldery
    
    let current = root;
    let currentPath = '';
    
    // Przejdź przez foldery
    for (let i = 0; i < parts.length; i++) {
      const folderName = parts[i];
      currentPath = currentPath ? `${currentPath}/${folderName}` : folderName;
      
      let folder = current.children.find((c) => c.name === folderName);
      
      if (!folder) {
        folder = {
          id: `folder:${currentPath}`,
          name: folderName,
          path: currentPath,
          depth: i + 1,
          children: [],
          variables: [],
        };
        current.children.push(folder);
      }
      
      current = folder;
    }
    
    // Dodaj zmienną do ostatniego folderu
    current.variables.push(variable);
  }

  // NIE sortujemy - zachowujemy kolejność z Figmy

  return root;
}

/**
 * Spłaszcza drzewo do listy wierszy (dla renderowania tabeli)
 */
export interface FlatRow {
  type: 'folder' | 'variable';
  id: string;
  name: string;
  path: string;
  depth: number;
  folder?: FolderNode;
  variable?: Variable;
  childCount?: number;
}

export function flattenTree(
  node: FolderNode, 
  expandedFolders: string[],
  depth: number = 0
): FlatRow[] {
  const rows: FlatRow[] = [];
  
  // Najpierw foldery
  for (const child of node.children) {
    const isExpanded = expandedFolders.includes(child.id);
    const childCount = countAllVariables(child);
    
    rows.push({
      type: 'folder',
      id: child.id,
      name: child.name,
      path: child.path,
      depth,
      folder: child,
      childCount,
    });
    
    if (isExpanded) {
      rows.push(...flattenTree(child, expandedFolders, depth + 1));
    }
  }
  
  // Potem zmienne
  for (const variable of node.variables) {
    rows.push({
      type: 'variable',
      id: variable.id,
      name: variable.name.split('/').pop() || variable.name,
      path: variable.name,
      depth,
      variable,
    });
  }
  
  return rows;
}

function countAllVariables(node: FolderNode): number {
  let count = node.variables.length;
  for (const child of node.children) {
    count += countAllVariables(child);
  }
  return count;
}

/**
 * Zbiera wszystkie ID folderów w drzewie
 */
export function getAllFolderIds(node: FolderNode): string[] {
  const ids: string[] = [];
  
  for (const child of node.children) {
    ids.push(child.id);
    ids.push(...getAllFolderIds(child));
  }
  
  return ids;
}
