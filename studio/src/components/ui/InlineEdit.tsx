import { useState, useRef, useEffect, type KeyboardEvent } from 'react';

interface InlineEditProps {
  value: string;
  onSave: (newValue: string) => { success: boolean; error?: string };
  onCancel: () => void;
  className?: string;
}

export function InlineEdit({ value, onSave, onCancel, className }: InlineEditProps) {
  const [editValue, setEditValue] = useState(value);
  const [error, setError] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  
  useEffect(() => {
    // Focus i select all przy mount
    if (inputRef.current) {
      inputRef.current.focus();
      inputRef.current.select();
    }
  }, []);
  
  const handleKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      handleSave();
    } else if (e.key === 'Escape') {
      e.preventDefault();
      onCancel();
    }
  };
  
  const handleSave = () => {
    if (editValue.trim() === value) {
      onCancel();
      return;
    }
    
    const result = onSave(editValue.trim());
    if (!result.success) {
      setError(result.error || 'Failed to rename');
      // Shake animation
      if (inputRef.current) {
        inputRef.current.style.animation = 'shake 0.3s';
        setTimeout(() => {
          if (inputRef.current) inputRef.current.style.animation = '';
        }, 300);
      }
    }
  };
  
  const handleBlur = () => {
    // Zapisz przy blur (kliknięcie poza)
    if (editValue.trim() !== value) {
      handleSave();
    } else {
      onCancel();
    }
  };
  
  return (
    <div style={{ position: 'relative', display: 'inline-flex', alignItems: 'center', flex: 1 }}>
      <input
        ref={inputRef}
        type="text"
        value={editValue}
        onChange={(e) => { setEditValue(e.target.value); setError(null); }}
        onKeyDown={handleKeyDown}
        onBlur={handleBlur}
        className={className}
        style={{
          background: 'var(--bg-app)',
          border: error ? '1px solid var(--red)' : '1px solid var(--accent)',
          borderRadius: '4px',
          padding: '2px 6px',
          color: 'var(--text)',
          fontSize: '12px',
          outline: 'none',
          width: '100%',
          minWidth: '100px',
        }}
      />
      {error && (
        <div style={{
          position: 'absolute',
          top: '100%',
          left: 0,
          marginTop: '4px',
          background: 'var(--red)',
          color: 'white',
          fontSize: '10px',
          padding: '4px 8px',
          borderRadius: '4px',
          whiteSpace: 'nowrap',
          zIndex: 100,
        }}>
          {error}
        </div>
      )}
      <style>{`
        @keyframes shake {
          0%, 100% { transform: translateX(0); }
          25% { transform: translateX(-4px); }
          75% { transform: translateX(4px); }
        }
      `}</style>
    </div>
  );
}
