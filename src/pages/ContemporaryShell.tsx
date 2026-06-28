import type { ReactNode } from 'react';
import { useState, useEffect, useRef } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useT } from '@/i18n';
import Avatar from '@/components/Avatar';
import Logo from '@/components/Logo';
import { formatCore } from '@/utils/formatCore';
import { IconSun, IconMoon, IconArrowLeft, GithubMark } from '@/components/icons/Icons';
import { useUserStore } from '@/stores/userStore';

interface TreeFile {
  name: string;
  route?: string;
  action?: 'stargaze';
  emoji: string;
}

const CONTEM_TREE: TreeFile[] = [
  { name: 'README.md',   route: '',                emoji: '📖' },
  { name: 'snippets.ts', route: 'snippets',         emoji: '📚' },
  { name: 'challenge.ts', route: 'daily',           emoji: '📅' },
  { name: 'leaderboard.sql', route: 'ranking',       emoji: '🏆' },
  { name: 'profile.tsx', route: 'mypage',           emoji: '👤' },
  { name: 'stargaze.gl', action: 'stargaze',        emoji: '🪐' },
];

const ADMIN_NODE: TreeFile = { name: 'admin-snippets.ts', route: 'admin/snippets', emoji: '⚙️' };

const contemRowClass = (active: boolean) =>
  `flex items-center gap-2 w-full py-[9px] px-3.5 border-0 text-left cursor-default font-dt-sans text-[14.5px] tracking-[-0.01em] transition-colors duration-100 ${
    active ? 'text-dt-primary font-semibold' : 'text-dt-text font-medium hover:bg-dt-hover'
  }`;

const ContemNode = ({ node, route, navigate, onStargaze }: {
  node: TreeFile; route: string; navigate: (r: string) => void; onStargaze: () => void;
}) => {
  const active = node.route !== undefined && node.route === route;
  return (
    <button
      onClick={() => (node.action === 'stargaze' ? onStargaze() : navigate(node.route ?? ''))}
      className={contemRowClass(active)}
      style={{
        background: active ? 'var(--dt-gradient-soft)' : 'transparent',
        boxShadow: active ? 'inset 3px 0 0 0 var(--dt-primary)' : 'none',
      }}
    >
      <span className="w-3" />
      <span className="text-base leading-none w-5 text-center" style={{ filter: active ? 'none' : 'saturate(0.85)' }}>
        {node.emoji}
      </span>
      <span className="flex-1 overflow-hidden text-ellipsis whitespace-nowrap">{node.name}</span>
    </button>
  );
};

interface ExplorerProps {
  route: string;
  navigate: (r: string) => void;
  theme: string;
  onTheme: () => void;
  isLoggedIn: boolean;
  isAdmin: boolean;
  onLogin: () => void;
  onLogout: () => void;
  onStargaze: () => void;
}

const ContemExplorer = ({ route, navigate, theme, onTheme, isLoggedIn, isAdmin, onLogin, onLogout, onStargaze }: ExplorerProps) => {
  const t = useT();
  const profileUrl = useUserStore((s) => s.profileUrl);
  const username = useUserStore((s) => s.username);
  const totalCore = useUserStore((s) => s.totalCore);
  const tree = isAdmin ? [...CONTEM_TREE, ADMIN_NODE] : CONTEM_TREE;
  return (
    <aside
      className="sticky top-0 flex flex-col"
      style={{
        height: '100vh',
        background: 'color-mix(in oklab, var(--dt-surface) 70%, transparent)',
        backdropFilter: 'blur(16px) saturate(1.4)',
        WebkitBackdropFilter: 'blur(16px) saturate(1.4)',
        boxShadow: 'inset -1px 0 0 var(--dt-border)',
      }}
    >
      {/* Brand */}
      <button
        onClick={() => navigate('')}
        className="flex items-center gap-2.5 px-[18px] py-[18px] bg-transparent border-0 cursor-default text-inherit text-left"
        style={{ boxShadow: 'inset 0 -1px 0 var(--dt-border)' }}
      >
        <Logo size={19} />
      </button>

      {/* Explorer label */}
      <div className="px-[18px] pt-3.5 pb-1.5 text-[10.5px] font-semibold tracking-[0.14em] uppercase text-dt-text-3 flex items-center gap-1.5">
        <span className="text-[9px]">▾</span> EXPLORER
      </div>

      {/* Tree */}
      <div className="flex-1 overflow-y-auto py-0.5 pb-3">
        {tree.map((n) => (
          <ContemNode key={n.name} node={n} route={route} navigate={navigate} onStargaze={onStargaze} />
        ))}
      </div>

      {/* Bottom: profile/login + theme */}
      <div className="p-2.5" style={{ boxShadow: 'inset 0 1px 0 var(--dt-border)' }}>
        {isLoggedIn ? (
          <div className="flex items-center gap-1">
            <button
              onClick={() => navigate('mypage')}
              className="flex items-center gap-2.5 flex-1 min-w-0 py-2 px-2.5 bg-transparent border-0 rounded-xl cursor-default text-left text-inherit font-[inherit] transition-colors duration-100 hover:bg-dt-hover"
            >
              <Avatar handle={username ?? ''} size={30} ring="var(--dt-primary)" src={profileUrl} />
              <div className="dt-stack gap-0 min-w-0 flex-1">
                <span className="text-[13px] text-dt-text whitespace-nowrap overflow-hidden text-ellipsis">{username}</span>
                <span className="text-[11px] text-dt-text-3">{formatCore(totalCore)} CORE</span>
              </div>
            </button>
            <button
              onClick={onLogout}
              title={t('Sign out')}
              className="shrink-0 py-1.5 px-2 bg-transparent border-0 rounded-md cursor-default text-dt-text-3 text-[13px] transition-colors duration-100 hover:bg-dt-hover"
            >↩</button>
          </div>
        ) : (
          <button onClick={onLogin} className="dt-btn dt-btn-primary dt-btn-sm w-full inline-flex items-center gap-2">
            <GithubMark size={15} fill="#fff" /> {t('Sign in')}
          </button>
        )}
        <div className="flex items-center justify-between pt-2 px-1.5 pb-0.5">
          <span className="text-dt-text-3 text-[10.5px] pl-1.5">theme</span>
          <button
            onClick={onTheme}
            className="inline-flex items-center gap-1.5 bg-transparent border-0 text-dt-text-2 py-1 px-2 rounded-lg text-[11px] font-[inherit] cursor-default transition-colors duration-100 hover:bg-dt-hover hover:text-dt-text"
          >
            {theme === 'dark' ? <IconSun size={13} /> : <IconMoon size={13} />}
            <span>{theme === 'dark' ? 'dark' : 'light'}</span>
          </button>
        </div>
      </div>
    </aside>
  );
};

interface Props {
  isLoggedIn: boolean;
  isAdmin: boolean;
  onLogin: () => void;
  onLogout: () => void;
  theme: string;
  onTheme: () => void;
  children: ReactNode;
}

const ContemporaryShell = ({ isLoggedIn, isAdmin, onLogin, onLogout, theme, onTheme, children }: Props) => {
  const t = useT();
  const navigate = useNavigate();
  const location = useLocation();
  const route = location.pathname.slice(1);

  const atmosRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const el = atmosRef.current;
    if (!el) return;
    if (window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    let last = 0;
    const onMove = (e: MouseEvent) => {
      const now = window.performance ? performance.now() : Date.now();
      if (now - last < 16) return;
      last = now;
      const nx = e.clientX / window.innerWidth - 0.5;
      const ny = e.clientY / window.innerHeight - 0.5;
      el.style.setProperty('--ax', (nx * 18).toFixed(1));
      el.style.setProperty('--ay', (ny * 18).toFixed(1));
    };
    window.addEventListener('mousemove', onMove);
    return () => window.removeEventListener('mousemove', onMove);
  }, []);

  const [immersive, setImmersive] = useState(false);
  useEffect(() => {
    if (!immersive) return;
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') setImmersive(false); };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [immersive]);

  const goto = (r: string) => navigate(r === '' ? '/' : `/${r}`);

  return (
    <div
      className={`relative min-h-screen text-dt-text font-dt-sans${immersive ? ' dt-immersive' : ''}`}
      style={{ background: 'transparent' }}
    >
      {/* Abstract backdrop — deep-space starfield + planets, mouse parallax */}
      <div
        ref={atmosRef}
        aria-hidden="true"
        className="dt-atmos dt-bg-stars fixed pointer-events-none overflow-hidden"
        style={{ inset: -60, zIndex: 0 }}
      >
        <span className="dt-atmos-blob dt-atmos-1" />
        <span className="dt-atmos-blob dt-atmos-2" />
        <span className="dt-atmos-blob dt-atmos-3" />
        <div className="dt-atmos-planets">
          <span className="dt-planet dt-planet-1" />
          <span className="dt-planet dt-planet-2" />
          <span className="dt-planet dt-planet-3" />
        </div>
      </div>
      <div
        aria-hidden="true"
        className="fixed inset-0 pointer-events-none"
        style={{ zIndex: 0, background: 'linear-gradient(180deg, transparent 40%, color-mix(in oklab, var(--dt-bg) 32%, transparent) 100%)' }}
      />

      {/* Layout: left explorer + content — warps forward & fades in stargaze mode */}
      <div
        className={`dt-warp${immersive ? ' is-warping' : ''} relative grid`}
        style={{ zIndex: 1, gridTemplateColumns: '252px 1fr' }}
      >
        <ContemExplorer
          route={route} navigate={goto}
          theme={theme} onTheme={onTheme}
          isLoggedIn={isLoggedIn} isAdmin={isAdmin} onLogin={onLogin} onLogout={onLogout}
          onStargaze={() => setImmersive(true)}
        />
        <main className="min-w-0">{children}</main>
      </div>

      {immersive && (
        <button className="dt-stargaze-exit" onClick={() => setImmersive(false)}>
          <IconArrowLeft size={16} /> {t('Back to app')}
          <span className="dt-stargaze-esc">ESC</span>
        </button>
      )}
    </div>
  );
};

export default ContemporaryShell;
