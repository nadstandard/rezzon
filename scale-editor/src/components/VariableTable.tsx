import { useState } from 'react';

interface Variable {
  name: string;
  type: 'base' | 'parameter' | 'computed';
  values: Record<string, number>;
}

interface Group {
  name: string;
  variables: Variable[];
}

interface VariableTableProps {
  modes: string[];
  groups: Group[];
  activeGroup: string;
  onValueChange?: (groupName: string, varName: string, mode: string, value: number) => void;
  onAddRefValue?: () => void;
}

function TypeIcon({ type }: { type: Variable['type'] }) {
  const icons = {
    base: '#',
    parameter: 'ƒ',
    computed: '=',
  };
  return <span className="cell-icon">{icons[type]}</span>;
}

function EditableCell({
  value,
  type,
  onChange,
}: {
  value: number;
  type: Variable['type'];
  onChange?: (value: number) => void;
}) {
  const [isEditing, setIsEditing] = useState(false);
  const [editValue, setEditValue] = useState(String(value));

  const isEditable = type !== 'computed' && onChange;
  const displayValue = Math.round(value * 100) / 100;

  const handleBlur = () => {
    setIsEditing(false);
    const num = parseFloat(editValue);
    if (!isNaN(num) && onChange) {
      onChange(num);
    } else {
      setEditValue(String(value));
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleBlur();
    } else if (e.key === 'Escape') {
      setIsEditing(false);
      setEditValue(String(value));
    }
  };

  const handleClick = () => {
    if (isEditable) {
      setEditValue(String(value));
      setIsEditing(true);
    }
  };

  return (
    <div className="cell-wrapper">
      {isEditing && isEditable ? (
        <input
          type="text"
          value={editValue}
          onChange={(e) => setEditValue(e.target.value)}
          onBlur={handleBlur}
          onKeyDown={handleKeyDown}
          autoFocus
          className="cell-input"
        />
      ) : (
        <span
          onClick={handleClick}
          className={`cell-value ${type === 'computed' ? 'computed' : ''} ${isEditable ? 'editable' : ''}`}
        >
          {displayValue}
        </span>
      )}
    </div>
  );
}

export function VariableTable({
  modes,
  groups,
  activeGroup,
  onValueChange,
  onAddRefValue,
}: VariableTableProps) {
  // Filter groups based on activeGroup
  const getFilteredGroups = () => {
    if (activeGroup === 'All') return groups;
    
    // Direct match
    const directMatch = groups.filter(g => g.name === activeGroup);
    if (directMatch.length > 0) return directMatch;
    
    // Viewport match (Desktop, Laptop, etc.)
    const viewportMatch = groups.filter(g => g.name === `Values ${activeGroup}`);
    if (viewportMatch.length > 0) return viewportMatch;
    
    // "Values" shows all Values groups
    if (activeGroup === 'Values') {
      return groups.filter(g => g.name.startsWith('Values '));
    }
    
    // "Ref Scale" shows Ref Scale + all Values
    if (activeGroup === 'Ref Scale') {
      return groups.filter(g => g.name === 'Ref Scale' || g.name.startsWith('Values '));
    }
    
    return groups;
  };

  const filteredGroups = getFilteredGroups();

  return (
    <>
      <div className="table-container">
        <table className="data-table">
          <thead>
            <tr>
              <th>Name</th>
              {modes.map((mode) => (
                <th key={mode}>{mode}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {filteredGroups.map((group) => (
              <>
                {/* Group header */}
                <tr key={`group-${group.name}`} className="group-header">
                  <td colSpan={modes.length + 1}>{group.name}</td>
                </tr>
                {/* Variables */}
                {group.variables.map((variable) => (
                  <tr key={`${group.name}-${variable.name}`}>
                    <td>
                      <div className="cell-name">
                        <TypeIcon type={variable.type} />
                        <span>{variable.name}</span>
                      </div>
                    </td>
                    {modes.map((mode) => (
                      <td key={mode}>
                        <EditableCell
                          value={variable.values[mode] ?? 0}
                          type={variable.type}
                          onChange={
                            onValueChange
                              ? (v) => onValueChange(group.name, variable.name, mode, v)
                              : undefined
                          }
                        />
                      </td>
                    ))}
                  </tr>
                ))}
              </>
            ))}
          </tbody>
        </table>
      </div>

      {/* Footer */}
      {onAddRefValue && activeGroup === 'All' && (
        <div className="table-footer">
          <button onClick={onAddRefValue} className="add-row">
            <span>+</span> Add ref value
          </button>
        </div>
      )}
    </>
  );
}
