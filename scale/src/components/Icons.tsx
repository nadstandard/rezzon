// SVG Icon component using symbols
interface IconProps {
  name: string;
  size?: 'xs' | 'sm' | 'md' | 'lg';
  className?: string;
  style?: React.CSSProperties;
}

export function Icon({ name, size = 'md', className = '', style }: IconProps) {
  const sizeClass = size === 'md' ? '' : size;
  return (
    <svg className={`icon ${sizeClass} ${className}`.trim()} style={style}>
      <use href={`#i-${name}`} />
    </svg>
  );
}

// SVG Symbol definitions - include once in app
export function IconSprites() {
  return (
    <svg style={{ display: 'none' }}>
      {/* Navigation */}
      <symbol id="i-search" viewBox="0 0 24 24"><circle cx="11" cy="11" r="8"/><path d="m21 21-4.3-4.3"/></symbol>
      <symbol id="i-chev-d" viewBox="0 0 24 24"><path d="m6 9 6 6 6-6"/></symbol>
      <symbol id="i-chev-r" viewBox="0 0 24 24"><path d="m9 18 6-6-6-6"/></symbol>
      <symbol id="i-chev-l" viewBox="0 0 24 24"><path d="m15 18-6-6 6-6"/></symbol>
      <symbol id="i-x" viewBox="0 0 24 24"><path d="M18 6 6 18M6 6l12 12"/></symbol>
      <symbol id="i-check" viewBox="0 0 24 24"><path d="M20 6 9 17l-5-5"/></symbol>
      <symbol id="i-plus" viewBox="0 0 24 24"><path d="M5 12h14"/><path d="M12 5v14"/></symbol>
      <symbol id="i-minus" viewBox="0 0 24 24"><path d="M5 12h14"/></symbol>
      
      {/* Scale sections */}
      <symbol id="i-grid" viewBox="0 0 24 24"><rect width="7" height="7" x="3" y="3" rx="1"/><rect width="7" height="7" x="14" y="3" rx="1"/><rect width="7" height="7" x="14" y="14" rx="1"/><rect width="7" height="7" x="3" y="14" rx="1"/></symbol>
      <symbol id="i-type" viewBox="0 0 24 24"><polyline points="4 7 4 4 20 4 20 7"/><line x1="9" x2="15" y1="20" y2="20"/><line x1="12" x2="12" y1="4" y2="20"/></symbol>
      <symbol id="i-spacing" viewBox="0 0 24 24"><path d="M21 6H3M21 12H3M21 18H3"/></symbol>
      <symbol id="i-radius" viewBox="0 0 24 24"><path d="M12 3a9 9 0 1 0 9 9"/><path d="M12 12 3 12"/><path d="M12 12V3"/></symbol>
      
      {/* Devices */}
      <symbol id="i-monitor" viewBox="0 0 24 24"><rect width="20" height="14" x="2" y="3" rx="2"/><line x1="8" x2="16" y1="21" y2="21"/><line x1="12" x2="12" y1="17" y2="21"/></symbol>
      <symbol id="i-tablet" viewBox="0 0 24 24"><rect width="16" height="20" x="4" y="2" rx="2"/><line x1="12" x2="12.01" y1="18" y2="18"/></symbol>
      <symbol id="i-phone" viewBox="0 0 24 24"><rect width="14" height="20" x="5" y="2" rx="2"/><line x1="12" x2="12.01" y1="18" y2="18"/></symbol>
      
      {/* Actions */}
      <symbol id="i-dl" viewBox="0 0 24 24"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" x2="12" y1="15" y2="3"/></symbol>
      <symbol id="i-ul" viewBox="0 0 24 24"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="17 8 12 3 7 8"/><line x1="12" x2="12" y1="3" y2="15"/></symbol>
      <symbol id="i-edit" viewBox="0 0 24 24"><path d="M17 3a2.85 2.83 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5Z"/></symbol>
      <symbol id="i-trash" viewBox="0 0 24 24"><path d="M3 6h18M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2"/></symbol>
      <symbol id="i-copy" viewBox="0 0 24 24"><rect width="14" height="14" x="8" y="8" rx="2"/><path d="M4 16c-1.1 0-2-.9-2-2V4c0-1.1.9-2 2-2h10c1.1 0 2 .9 2 2"/></symbol>
      <symbol id="i-eye" viewBox="0 0 24 24"><path d="M2.062 12.348a1 1 0 0 1 0-.696 10.75 10.75 0 0 1 19.876 0 1 1 0 0 1 0 .696 10.75 10.75 0 0 1-19.876 0"/><circle cx="12" cy="12" r="3"/></symbol>
      <symbol id="i-settings" viewBox="0 0 24 24"><circle cx="12" cy="12" r="3"/><path d="M12 1v2M12 21v2M4.22 4.22l1.42 1.42M18.36 18.36l1.42 1.42M1 12h2M21 12h2M4.22 19.78l1.42-1.42M18.36 5.64l1.42-1.42"/></symbol>
      
      {/* Misc */}
      <symbol id="i-layers" viewBox="0 0 24 24"><path d="m12.83 2.18a2 2 0 0 0-1.66 0L2.6 6.08a1 1 0 0 0 0 1.83l8.58 3.91a2 2 0 0 0 1.66 0l8.58-3.9a1 1 0 0 0 0-1.83Z"/><path d="m22 12.5-8.58 3.91a2 2 0 0 1-1.66 0L2 12.5"/><path d="m22 17.5-8.58 3.91a2 2 0 0 1-1.66 0L2 17.5"/></symbol>
      <symbol id="i-folder" viewBox="0 0 24 24"><path d="M20 20a2 2 0 0 0 2-2V8a2 2 0 0 0-2-2h-7.9a2 2 0 0 1-1.69-.9L9.6 3.9A2 2 0 0 0 7.93 3H4a2 2 0 0 0-2 2v13a2 2 0 0 0 2 2h16Z"/></symbol>
      <symbol id="i-list" viewBox="0 0 24 24"><line x1="8" x2="21" y1="6" y2="6"/><line x1="8" x2="21" y1="12" y2="12"/><line x1="8" x2="21" y1="18" y2="18"/><line x1="3" x2="3.01" y1="6" y2="6"/><line x1="3" x2="3.01" y1="12" y2="12"/><line x1="3" x2="3.01" y1="18" y2="18"/></symbol>
      <symbol id="i-tree" viewBox="0 0 24 24"><path d="M21 12a9 9 0 0 0-9-9M3.6 9a9 9 0 0 0 8.4 12"/><circle cx="12" cy="12" r="3"/></symbol>
    </svg>
  );
}
