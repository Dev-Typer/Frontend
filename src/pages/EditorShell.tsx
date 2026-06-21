import type { ReactNode } from 'react';
import { useState, useCallback } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useT } from '@/i18n';
import Avatar from '@/components/Avatar';
import { IconSun, IconMoon, GithubMark } from '@/components/icons/Icons';
import type { User } from '@/types';

const ROUTE_TO_FILE: Record<string, string> = {
  '':               'README.md',
  'solo':           'solo.ts',
  'battle':         'battle.ts',
  'daily':          'daily.ts',
  'ranking':        'ranking.sql',
  'mypage':         'profile.tsx',
  'admin/snippets': 'snippets.ts',
};

const ADMIN_TREE = [
  { type: 'folder' as const, name: 'admin', children: [
    { type: 'file' as const, name: 'snippets.ts', route: 'admin/snippets' },
  ]},
];

const EDITOR_TREE = [
  { type: 'file' as const,   name: 'README.md',   route: '' },
  { type: 'folder' as const, name: 'play', children: [
    { type: 'file' as const, name: 'solo.ts',   route: 'solo'   },
    { type: 'file' as const, name: 'battle.ts', route: 'battle' },
    { type: 'file' as const, name: 'daily.ts',  route: 'daily'  },
  ]},
  { type: 'folder' as const, name: 'compete', children: [
    { type: 'file' as const, name: 'ranking.sql', route: 'ranking' },
    { type: 'file' as const, name: 'profile.tsx', route: 'mypage'  },
  ]},
];

const SIDEBAR_MIN = 180;
const SIDEBAR_MAX = 480;
const SIDEBAR_DEFAULT = 244;

// ─── File icon ────────────────────────────────────────────────────────────────

interface ShellFileIconProps { name: string }

const ShellFileIcon = ({ name }: ShellFileIconProps) => {
  const k = name.endsWith('.md')  ? { c: 'text-[#8BE9FD]', g: 'M' }
          : name.endsWith('.tsx') ? { c: 'text-[#50FA7B]', g: 'X' }
          : name.endsWith('.ts')  ? { c: 'text-[#50FA7B]', g: 'T' }
          : name.endsWith('.sql') ? { c: 'text-[#FFB86C]', g: 'S' }
          : { c: 'text-dt-text-3', g: '?' };
  return (
    <span className={`w-[14px] h-[14px] ${k.c} inline-flex items-center justify-center text-[10px] font-bold shrink-0`}>
      {k.g}
    </span>
  );
};

// ─── Tree node ────────────────────────────────────────────────────────────────

type TreeNode = typeof EDITOR_TREE[number];

interface ShellNodeProps {
  node: TreeNode;
  depth: number;
  activeFile: string;
}

const rowClass = (active: boolean) =>
  `flex items-center gap-[7px] w-full py-[5px] pr-2 border-0 font-[inherit] text-[13px] cursor-default text-left transition-colors duration-100 ${
    active ? 'bg-dt-hover text-dt-text shadow-[inset_2px_0_0_0_var(--dt-primary)]' : 'bg-transparent text-dt-text-2 shadow-none hover:bg-white/[0.03]'
  }`;

const ShellNode = ({ node, depth, activeFile }: ShellNodeProps) => {
  const [open, setOpen] = useState(true);
  const navigate = useNavigate();

  if (node.type === 'folder') {
    return (
      <div>
        <button onClick={() => setOpen((o) => !o)} className={rowClass(false)} style={{ paddingLeft: 10 + depth * 16 }}>
          <span className="text-sm leading-none shrink-0 select-none">
            {open ? '📂' : '📁'}
          </span>
          <span className="text-dt-text-2">{node.name}</span>
        </button>
        {open && node.children?.map((c, i) => (
          <ShellNode key={i} node={c} depth={depth + 1} activeFile={activeFile} />
        ))}
      </div>
    );
  }

  const active = node.name === activeFile;
  return (
    <button
      onClick={() => navigate(node.route === '' ? '/' : `/${node.route}`)}
      className={rowClass(active)}
      style={{ paddingLeft: 10 + depth * 16 }}
    >
      <ShellFileIcon name={node.name} />
      <span className="flex-1 overflow-hidden text-ellipsis whitespace-nowrap">
        {node.name}
      </span>
    </button>
  );
};

// ─── Sidebar ──────────────────────────────────────────────────────────────────

interface ShellSidebarProps {
  activeFile: string;
  me: User;
  isLoggedIn: boolean;
  isAdmin: boolean;
  onLogin: () => void;
  onLogout: () => void;
  theme: string;
  onTheme: () => void;
}

const ShellSidebar = ({ activeFile, me, isLoggedIn, isAdmin, onLogin, onLogout, theme, onTheme }: ShellSidebarProps) => {
  const t = useT();
  const navigate = useNavigate();
  return (
    <aside className="bg-dt-surface overflow-hidden flex flex-col min-w-0">
      {/* Logo */}
      <button
        onClick={() => navigate('/')}
        className="flex items-center gap-3 p-4 bg-transparent border-0 cursor-default text-inherit shadow-[inset_0_-1px_0_var(--dt-border)] text-left shrink-0"
      >
        <img src="/assets/logo.png" alt="" className="w-12 h-12 block shrink-0" />
        <span
          className="font-black text-lg text-dt-text tracking-[-0.02em] leading-none whitespace-nowrap overflow-hidden text-ellipsis"
          style={{ fontFamily: "'Archivo Black', 'Archivo', system-ui, sans-serif" }}
        >
          DevTyper
        </span>
      </button>

      {/* Explorer header */}
      <div className="pt-3.5 px-4 pb-1.5 text-[10.5px] font-medium tracking-[0.12em] uppercase text-dt-text-3 flex items-center gap-1.5 shrink-0">
        <span className="text-[9px]">▾</span> EXPLORER
      </div>

      {/* Tree */}
      <div className="pb-2 flex-1 overflow-y-auto overflow-x-hidden">
        {EDITOR_TREE.map((n, i) => (
          <ShellNode key={i} node={n} depth={0} activeFile={activeFile} />
        ))}
        {isAdmin && (
          <>
            <div className="h-[0.5px] bg-dt-border mx-2 my-1.5" />
            {ADMIN_TREE.map((n, i) => (
              <ShellNode key={`admin-${i}`} node={n} depth={0} activeFile={activeFile} />
            ))}
          </>
        )}
      </div>

      {/* User / login strip */}
      <div className="shadow-[inset_0_1px_0_var(--dt-border)] py-2.5 px-2 shrink-0">
        {isLoggedIn ? (
          <div className="flex items-center gap-1">
            <button
              onClick={() => navigate('/mypage')}
              className="flex items-center gap-2.5 flex-1 py-2 px-2.5 bg-transparent border-0 rounded-md cursor-default text-left text-inherit font-[inherit] transition-colors duration-100 hover:bg-dt-hover"
            >
              <Avatar handle={me.handle} hue={me.avatarHue} size={28} ring="var(--dt-primary)" />
              <div className="dt-stack gap-0 min-w-0 flex-1">
                <span className="text-[12.5px] text-dt-text whitespace-nowrap overflow-hidden text-ellipsis">{me.handle}</span>
                <span className="text-[10.5px] text-dt-text-3">★ {me.rating} · {t(me.tier)}</span>
              </div>
              <span className="text-dt-text-3 text-[11px]">›</span>
            </button>
            <button
              onClick={onLogout}
              title="로그아웃"
              className="shrink-0 py-1.5 px-2 bg-transparent border-0 rounded-md cursor-default text-dt-text-3 text-[13px] transition-colors duration-100 hover:bg-dt-hover"
            >↩</button>
          </div>
        ) : (
          <button
            onClick={onLogin}
            className="flex items-center gap-2 w-full py-2.5 px-3 bg-dt-card text-dt-text shadow-[inset_0_1px_0_rgba(255,255,255,0.05),inset_0_0_0_1px_var(--dt-border)] border-0 rounded-md cursor-default text-left font-[inherit] text-[13px]"
          >
            <GithubMark size={16} />
            <span className="flex-1">{t('Sign in with GitHub')}</span>
          </button>
        )}

        {/* Theme toggle */}
        <div className="flex gap-1 pt-1.5 px-0.5 justify-between items-center">
          <span className="text-dt-text-3 text-[10.5px] pl-2">theme</span>
          <button
            onClick={onTheme}
            className="inline-flex items-center gap-1.5 bg-transparent border-0 text-dt-text-2 py-1 px-2 rounded text-[11px] font-[inherit] cursor-default"
          >
            {theme === 'dark' ? <IconSun size={13} /> : <IconMoon size={13} />}
            <span>{theme === 'dark' ? 'dark' : 'light'}</span>
          </button>
        </div>
      </div>
    </aside>
  );
};

// ─── Resize handle ────────────────────────────────────────────────────────────

interface ResizeHandleProps {
  onMouseDown: (e: React.MouseEvent) => void;
}

const ResizeHandle = ({ onMouseDown }: ResizeHandleProps) => (
  <div
    onMouseDown={onMouseDown}
    className="w-[5px] cursor-col-resize bg-dt-border shrink-0 relative transition-colors duration-150 hover:bg-dt-primary"
  />
);

// ─── Tab bar ──────────────────────────────────────────────────────────────────

const ShellTabBar = ({ activeFile }: { activeFile: string }) => (
  <div className="flex items-stretch bg-dt-surface shadow-[inset_0_-1px_0_var(--dt-border)]">
    <div className="flex items-center gap-2.5 pr-4 pl-3.5 bg-dt-bg shadow-[inset_0_2px_0_var(--dt-primary),1px_0_0_var(--dt-border),-1px_0_0_var(--dt-border)] text-dt-text text-[12.5px] min-w-0">
      <ShellFileIcon name={activeFile} />
      <span>{activeFile}</span>
      <span className="text-dt-text-3 text-[10px] ml-1">●</span>
    </div>
    <div className="flex-1 px-4 flex items-center gap-2 text-dt-text-3 text-[11px] justify-end">
      <span className="text-dt-text-2">devtyper</span>
      <span>›</span>
      <span className="text-dt-text">{activeFile}</span>
    </div>
  </div>
);

// ─── Status bar ───────────────────────────────────────────────────────────────

const ShellStatusBar = ({ activeFile, me, isLoggedIn }: { activeFile: string; me: User; isLoggedIn: boolean }) => (
  <div className="bg-dt-primary text-[#0D0E12] font-dt-mono text-[11px] flex items-center px-3 gap-4 shadow-[inset_0_1px_0_rgba(255,255,255,0.18)]">
    <span>⌥ main</span>
    <span>● 0 errors</span>
    <span className="opacity-70">● 0 warnings</span>
    <span className="flex-1" />
    {isLoggedIn
      ? <span className="opacity-[0.85]">{me.handle} · ★ {me.rating}</span>
      : <span className="opacity-[0.85]">guest</span>
    }
    <span className="opacity-[0.85]">{activeFile}</span>
    <span className="opacity-[0.85]">UTF-8</span>
    <span className="opacity-[0.85]">LF</span>
    <span>● devtyper</span>
  </div>
);

// ─── EditorShell ──────────────────────────────────────────────────────────────

interface Props {
  me: User;
  isLoggedIn: boolean;
  isAdmin: boolean;
  onLogin: () => void;
  onLogout: () => void;
  theme: string;
  onTheme: () => void;
  children: ReactNode;
}

const EditorShell = ({ me, isLoggedIn, isAdmin, onLogin, onLogout, theme, onTheme, children }: Props) => {
  const location = useLocation();
  const route = location.pathname.slice(1);
  const activeFile = ROUTE_TO_FILE[route] || 'README.md';

  const [sidebarWidth, setSidebarWidth] = useState(SIDEBAR_DEFAULT);

  const handleResizeStart = useCallback((e: React.MouseEvent) => {
    e.preventDefault();
    const startX = e.clientX;
    const startWidth = sidebarWidth;

    const onMouseMove = (ev: MouseEvent) => {
      const next = Math.min(SIDEBAR_MAX, Math.max(SIDEBAR_MIN, startWidth + ev.clientX - startX));
      setSidebarWidth(next);
    };
    const onMouseUp = () => {
      window.removeEventListener('mousemove', onMouseMove);
      window.removeEventListener('mouseup', onMouseUp);
    };
    window.addEventListener('mousemove', onMouseMove);
    window.addEventListener('mouseup', onMouseUp);
  }, [sidebarWidth]);

  return (
    <div className="bg-dt-bg text-dt-text font-dt-mono min-h-screen grid grid-rows-[1fr_24px]">
      <div className="grid min-h-0" style={{ gridTemplateColumns: `${sidebarWidth}px 5px 1fr` }}>
        <ShellSidebar
          activeFile={activeFile}
          me={me}
          isLoggedIn={isLoggedIn}
          isAdmin={isAdmin}
          onLogin={onLogin}
          onLogout={onLogout}
          theme={theme}
          onTheme={onTheme}
        />
        <ResizeHandle onMouseDown={handleResizeStart} />
        <div className="grid grid-rows-[38px_1fr] min-h-0">
          <ShellTabBar activeFile={activeFile} />
          <div className="overflow-auto bg-dt-bg">
            {children}
          </div>
        </div>
      </div>
      <ShellStatusBar activeFile={activeFile} me={me} isLoggedIn={isLoggedIn} />
    </div>
  );
};

export default EditorShell;

// ─── FileHeader (사용처: 각 page 상단 헤더) ───────────────────────────────────

export const FileHeader = ({ path, title, subtitle, action }: { path: string; title: string; subtitle?: string; action?: ReactNode }) => {
  const t = useT();
  return (
    <div className="pt-5 px-7 pb-3 flex justify-between items-end gap-4">
      <div>
        <div className="text-dt-text-3 text-xs mb-1">
          <span className="text-[#6272A4]">// {path}</span>
        </div>
        <h1 className="m-0 font-dt-mono text-[26px] font-medium tracking-[-0.01em]">{t(title)}</h1>
        {subtitle && <p className="mt-1.5 mb-0 text-[13px] text-dt-text-2">{t(subtitle)}</p>}
      </div>
      {action}
    </div>
  );
};
