import type { SVGProps } from 'react';

interface IconProps extends Omit<SVGProps<SVGSVGElement>, 'stroke'> {
  size?: number;
  stroke?: number;
}

const Icon = ({ size = 20, stroke = 1.6, children, style, className, ...rest }: IconProps) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width={size} height={size} viewBox="0 0 24 24"
    fill="none" stroke="currentColor"
    strokeWidth={stroke} strokeLinecap="round" strokeLinejoin="round"
    className={`shrink-0${className ? ` ${className}` : ''}`}
    style={style}
    {...rest}
  >{children}</svg>
);

export const IconBolt = (p: IconProps) => <Icon {...p}><path d="M13 3 4 14h7l-1 7 9-11h-7l1-7z"/></Icon>;
export const IconKeyboard = (p: IconProps) => <Icon {...p}><rect x="2" y="6" width="20" height="13" rx="2"/><path d="M6 10h.01M10 10h.01M14 10h.01M18 10h.01M6 14h.01M18 14h.01M9 14h6"/></Icon>;
export const IconSwords = (p: IconProps) => <Icon {...p}><path d="M14.5 17.5 3 6V3h3l11.5 11.5"/><path d="M13 19l6-6"/><path d="m16 16 4 4"/><path d="m19 21 2-2"/><path d="M9.5 17.5 21 6V3h-3L6.5 14.5"/><path d="m5 14 6 6"/><path d="m4 17-2 2"/><path d="m3 19 2 2"/></Icon>;
export const IconCalendar = (p: IconProps) => <Icon {...p}><rect x="3" y="4" width="18" height="18" rx="2"/><path d="M3 10h18M8 2v4M16 2v4"/></Icon>;
export const IconTrophy = (p: IconProps) => <Icon {...p}><path d="M6 4h12v6a6 6 0 0 1-12 0V4z"/><path d="M6 6H4a2 2 0 0 0-2 2v1a3 3 0 0 0 3 3h1"/><path d="M18 6h2a2 2 0 0 1 2 2v1a3 3 0 0 1-3 3h-1"/><path d="M10 17h4v3h-4z"/><path d="M8 21h8"/></Icon>;
export const IconUser = (p: IconProps) => <Icon {...p}><circle cx="12" cy="8" r="4"/><path d="M4 21a8 8 0 0 1 16 0"/></Icon>;
export const IconSun = (p: IconProps) => <Icon {...p}><circle cx="12" cy="12" r="4"/><path d="M12 2v2M12 20v2M4.93 4.93l1.41 1.41M17.66 17.66l1.41 1.41M2 12h2M20 12h2M4.93 19.07l1.41-1.41M17.66 6.34l1.41-1.41"/></Icon>;
export const IconMoon = (p: IconProps) => <Icon {...p}><path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"/></Icon>;
export const IconChevronRight = (p: IconProps) => <Icon {...p}><path d="m9 6 6 6-6 6"/></Icon>;
export const IconChevronDown = (p: IconProps) => <Icon {...p}><path d="m6 9 6 6 6-6"/></Icon>;
export const IconArrowRight = (p: IconProps) => <Icon {...p}><path d="M5 12h14M13 6l6 6-6 6"/></Icon>;
export const IconArrowLeft = (p: IconProps) => <Icon {...p}><path d="M19 12H5M11 6l-6 6 6 6"/></Icon>;
export const IconArrowUp = (p: IconProps) => <Icon {...p}><path d="M12 19V5M5 12l7-7 7 7"/></Icon>;
export const IconArrowDown = (p: IconProps) => <Icon {...p}><path d="M12 5v14M5 12l7 7 7-7"/></Icon>;
export const IconPlay = (p: IconProps) => <Icon {...p}><path d="M6 4v16l14-8z"/></Icon>;
export const IconRefresh = (p: IconProps) => <Icon {...p}><path d="M3 12a9 9 0 0 1 15.4-6.4L21 8"/><path d="M21 3v5h-5"/><path d="M21 12a9 9 0 0 1-15.4 6.4L3 16"/><path d="M3 21v-5h5"/></Icon>;
export const IconClock = (p: IconProps) => <Icon {...p}><circle cx="12" cy="12" r="9"/><path d="M12 7v5l3 2"/></Icon>;
export const IconTarget = (p: IconProps) => <Icon {...p}><circle cx="12" cy="12" r="9"/><circle cx="12" cy="12" r="5"/><circle cx="12" cy="12" r="1"/></Icon>;
export const IconFlame = (p: IconProps) => <Icon {...p}><path d="M8.5 14.5A2.5 2.5 0 0 0 11 17c2 0 3-1.5 3-3.5 0-1.5-1-2.5-1-4 0-1 .5-1.5 1-2 .5 1 2 2.5 2 5a6 6 0 1 1-12 0c0-2 1-3.5 2.5-5C7 9.5 7.5 12 8.5 14.5z"/></Icon>;
export const IconCheck = (p: IconProps) => <Icon {...p}><path d="M5 12l5 5L20 7"/></Icon>;
export const IconX = (p: IconProps) => <Icon {...p}><path d="M18 6 6 18M6 6l12 12"/></Icon>;
export const IconCopy = (p: IconProps) => <Icon {...p}><rect x="8" y="8" width="13" height="13" rx="2"/><path d="M16 8V6a2 2 0 0 0-2-2H5a2 2 0 0 0-2 2v9a2 2 0 0 0 2 2h2"/></Icon>;
export const IconUsers = (p: IconProps) => <Icon {...p}><circle cx="9" cy="8" r="4"/><path d="M2 21a7 7 0 0 1 14 0"/><path d="M17 11a4 4 0 0 0 0-8M22 21a7 7 0 0 0-5-6.7"/></Icon>;
export const IconLanguage = (p: IconProps) => <Icon {...p}><path d="m5 8 6 6"/><path d="m4 14 6-6 2-3"/><path d="M2 5h12"/><path d="M7 2h1"/><path d="m22 22-5-10-5 10"/><path d="M14 18h6"/></Icon>;
export const IconGithub = (p: IconProps) => <Icon {...p}><path d="M9 19c-5 1.5-5-2.5-7-3m14 6v-3.87a3.37 3.37 0 0 0-.94-2.61c3.14-.35 6.44-1.54 6.44-7A5.44 5.44 0 0 0 20 4.77 5.07 5.07 0 0 0 19.91 1S18.73.65 16 2.48a13.38 13.38 0 0 0-7 0C6.27.65 5.09 1 5.09 1A5.07 5.07 0 0 0 5 4.77a5.44 5.44 0 0 0-1.5 3.78c0 5.42 3.3 6.61 6.44 7A3.37 3.37 0 0 0 9 18.13V22"/></Icon>;
export const IconGoogle = (p: IconProps) => <Icon {...p} stroke={0}><path fill="currentColor" d="M21.35 11.1H12v3.18h5.35c-.23 1.5-1.74 4.4-5.35 4.4-3.22 0-5.85-2.67-5.85-5.96s2.63-5.96 5.85-5.96c1.83 0 3.06.78 3.76 1.45l2.56-2.46C16.45 3.96 14.42 3 12 3 6.94 3 2.85 7.04 2.85 12s4.09 9 9.15 9c5.28 0 8.78-3.7 8.78-8.92 0-.6-.07-1.05-.43-1.98z"/></Icon>;
export const IconMail = (p: IconProps) => <Icon {...p}><rect x="3" y="5" width="18" height="14" rx="2"/><path d="m3 7 9 6 9-6"/></Icon>;
export const IconSettings = (p: IconProps) => <Icon {...p}><circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.7 1.7 0 0 0 .3 1.8l.1.1a2 2 0 1 1-2.8 2.8l-.1-.1a1.7 1.7 0 0 0-1.8-.3 1.7 1.7 0 0 0-1 1.5V21a2 2 0 1 1-4 0v-.1a1.7 1.7 0 0 0-1.1-1.5 1.7 1.7 0 0 0-1.8.3l-.1.1a2 2 0 1 1-2.8-2.8l.1-.1a1.7 1.7 0 0 0 .3-1.8 1.7 1.7 0 0 0-1.5-1H3a2 2 0 1 1 0-4h.1a1.7 1.7 0 0 0 1.5-1.1 1.7 1.7 0 0 0-.3-1.8l-.1-.1a2 2 0 1 1 2.8-2.8l.1.1a1.7 1.7 0 0 0 1.8.3h0a1.7 1.7 0 0 0 1-1.5V3a2 2 0 1 1 4 0v.1a1.7 1.7 0 0 0 1 1.5 1.7 1.7 0 0 0 1.8-.3l.1-.1a2 2 0 1 1 2.8 2.8l-.1.1a1.7 1.7 0 0 0-.3 1.8v0a1.7 1.7 0 0 0 1.5 1H21a2 2 0 1 1 0 4h-.1a1.7 1.7 0 0 0-1.5 1z"/></Icon>;
export const IconSparkle = (p: IconProps) => <Icon {...p}><path d="M12 3v3M12 18v3M3 12h3M18 12h3M5.6 5.6l2.1 2.1M16.3 16.3l2.1 2.1M5.6 18.4l2.1-2.1M16.3 7.7l2.1-2.1"/></Icon>;
export const IconCrown = (p: IconProps) => <Icon {...p}><path d="M3 7l4 5 5-7 5 7 4-5-2 12H5z"/></Icon>;
export const IconCode = (p: IconProps) => <Icon {...p}><path d="m8 8-5 4 5 4"/><path d="m16 8 5 4-5 4"/><path d="m14 4-4 16"/></Icon>;
export const IconMedal = (p: IconProps) => <Icon {...p}><circle cx="12" cy="15" r="6"/><path d="M7 8 4 2h6l3 6"/><path d="m17 8 3-6h-6l-3 6"/></Icon>;
export const IconSearch = (p: IconProps) => <Icon {...p}><circle cx="11" cy="11" r="7"/><path d="m21 21-4.3-4.3"/></Icon>;
export const IconTrash = (p: IconProps) => <Icon {...p}><path d="M3 6h18M8 6V4a1 1 0 0 1 1-1h6a1 1 0 0 1 1 1v2M6 6l1 14a1 1 0 0 0 1 1h8a1 1 0 0 0 1-1l1-14"/></Icon>;
export const IconArrowsSort = (p: IconProps) => <Icon {...p}><path d="M7 4v16M7 4 4 7M7 4l3 3M17 20V4M17 20l3-3M17 20l-3-3"/></Icon>;
export const IconHeart = ({ filled, ...p }: IconProps & { filled?: boolean }) => (
  <Icon {...p} style={{ ...(p.style || {}), fill: filled ? 'currentColor' : 'none' }}>
    <path d="M12 21s-7-4.6-9.5-9A5 5 0 0 1 12 6a5 5 0 0 1 9.5 6c-2.5 4.4-9.5 9-9.5 9z"/>
  </Icon>
);

export const GithubMark = ({ size = 18, fill }: { size?: number; fill?: string }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill={fill || 'currentColor'} className="shrink-0">
    <path d="M12 .5C5.7.5.5 5.7.5 12c0 5.1 3.3 9.4 7.9 10.9.6.1.8-.2.8-.5v-2c-3.2.7-3.9-1.5-3.9-1.5-.5-1.3-1.3-1.7-1.3-1.7-1-.7.1-.7.1-.7 1.1.1 1.7 1.2 1.7 1.2 1 1.7 2.7 1.2 3.4.9.1-.7.4-1.2.7-1.5-2.6-.3-5.3-1.3-5.3-5.8 0-1.3.5-2.3 1.2-3.2-.1-.3-.5-1.5.1-3.1 0 0 1-.3 3.3 1.2 1-.3 2-.4 3-.4s2 .1 3 .4c2.3-1.6 3.3-1.2 3.3-1.2.7 1.6.2 2.8.1 3.1.8.9 1.2 1.9 1.2 3.2 0 4.5-2.7 5.5-5.3 5.8.4.4.8 1.1.8 2.2v3.3c0 .3.2.7.8.5C20.2 21.4 23.5 17.1 23.5 12 23.5 5.7 18.3.5 12 .5z"/>
  </svg>
);
