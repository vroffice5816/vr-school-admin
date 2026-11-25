type IconProps = { className?: string };

const base = (className = 'h-4 w-4') => ({
  className,
  viewBox: '0 0 24 24',
  fill: 'none',
  stroke: 'currentColor',
  strokeWidth: 2,
  strokeLinecap: 'round' as const,
  strokeLinejoin: 'round' as const,
  'aria-hidden': true,
});

export const SearchIcon = ({ className }: IconProps) => (
  <svg {...base(className)}><circle cx="11" cy="11" r="7" /><path d="m20 20-3.5-3.5" /></svg>
);

export const PrinterIcon = ({ className }: IconProps) => (
  <svg {...base(className)}><path d="M6 9V3h12v6" /><rect x="3" y="9" width="18" height="8" rx="2" /><path d="M6 14h12v7H6z" /></svg>
);

export const DownloadIcon = ({ className }: IconProps) => (
  <svg {...base(className)}><path d="M12 3v12" /><path d="m7 10 5 5 5-5" /><path d="M5 21h14" /></svg>
);

export const LogoutIcon = ({ className }: IconProps) => (
  <svg {...base(className)}><path d="M15 3h4a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2h-4" /><path d="m10 17-5-5 5-5" /><path d="M5 12h12" /></svg>
);

export const PhoneIcon = ({ className }: IconProps) => (
  <svg {...base(className)}><path d="M5 3h3l2 5-2.5 1.5a11 11 0 0 0 7 7L16 14l5 2v3a2 2 0 0 1-2 2A16 16 0 0 1 3 5a2 2 0 0 1 2-2Z" /></svg>
);

export const XIcon = ({ className }: IconProps) => (
  <svg {...base(className)}><path d="M18 6 6 18" /><path d="m6 6 12 12" /></svg>
);

export const CopyIcon = ({ className }: IconProps) => (
  <svg {...base(className)}><rect x="9" y="9" width="12" height="12" rx="2" /><path d="M5 15H4a1 1 0 0 1-1-1V4a1 1 0 0 1 1-1h10a1 1 0 0 1 1 1v1" /></svg>
);
