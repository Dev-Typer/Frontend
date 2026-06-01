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
  const k = name.endsWith('.md')  ? { c: '#8BE9FD', g: 'M' }
          : name.endsWith('.tsx') ? { c: '#50FA7B', g: 'X' }
          : name.endsWith('.ts')  ? { c: '#50FA7B', g: 'T' }
          : name.endsWith('.sql') ? { c: '#FFB86C', g: 'S' }
          : { c: 'var(--dt-text-3)', g: '?' };
  return (
    <span style={{ width: 14, height: 14, color: k.c, display: 'inline-flex', alignItems: 'center', justifyContent: 'center', fontSize: 10, fontWeight: 700, flexShrink: 0 }}>
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

const ShellNode = ({ node, depth, activeFile }: ShellNodeProps) => {
  const [open, setOpen] = useState(true);
  const navigate = useNavigate();

  const rowStyle = (d: number, active: boolean): React.CSSProperties => ({
    display: 'flex', alignItems: 'center', gap: 7, width: '100%',
    padding: `5px 8px 5px ${10 + d * 16}px`,
    background: active ? 'var(--dt-hover)' : 'transparent',
    boxShadow: active ? 'inset 2px 0 0 0 var(--dt-primary)' : 'none',
    border: 0, color: active ? 'var(--dt-text)' : 'var(--dt-text-2)',
    fontFamily: 'inherit', fontSize: 13, cursor: 'default', textAlign: 'left',
    transition: 'background 100ms',
  });

  if (node.type === 'folder') {
    return (
      <div>
        <button onClick={() => setOpen((o) => !o)} style={rowStyle(depth, false)}>
          <span style={{ fontSize: 14, lineHeight: 1, flexShrink: 0, userSelect: 'none' }}>
            {open ? '📂' : '📁'}
          </span>
          <span style={{ color: 'var(--dt-text-2)' }}>{node.name}</span>
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
      style={rowStyle(depth, active)}
      onMouseEnter={(e) => { if (!active) (e.currentTarget as HTMLButtonElement).style.background = 'rgba(255,255,255,0.03)'; }}
      onMouseLeave={(e) => { if (!active) (e.currentTarget as HTMLButtonElement).style.background = 'transparent'; }}
    >
      <ShellFileIcon name={node.name} />
      <span style={{ flex: 1, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
        {node.name}
      </span>
    </button>
  );
};

// ─── Sidebar ──────────────────────────────────────────────────────────────────

const ADMIN_TREE = [
  { type: 'folder' as const, name: 'admin', children: [
    { type: 'file' as const, name: 'snippets.ts', route: 'admin/snippets' },
  ]},
];

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
    <aside style={{ background: 'var(--dt-surface)', overflow: 'hidden', display: 'flex', flexDirection: 'column', minWidth: 0 }}>
      {/* Logo */}
      <button
        onClick={() => navigate('/')}
        style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '16px', background: 'transparent', border: 0, cursor: 'default', color: 'inherit', boxShadow: 'inset 0 -1px 0 var(--dt-border)', textAlign: 'left', flexShrink: 0 }}
      >
        <img src="/assets/logo.png" alt="" style={{ width: 48, height: 48, display: 'block', flexShrink: 0 }} />
        <span style={{ fontFamily: "'Archivo Black', 'Archivo', system-ui, sans-serif", fontWeight: 900, fontSize: 18, color: 'var(--dt-text)', letterSpacing: '-0.02em', lineHeight: 1, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
          DevTyper
        </span>
      </button>

      {/* Explorer header */}
      <div style={{ padding: '14px 16px 6px', fontSize: 10.5, fontWeight: 500, letterSpacing: '0.12em', textTransform: 'uppercase', color: 'var(--dt-text-3)', display: 'flex', alignItems: 'center', gap: 6, flexShrink: 0 }}>
        <span style={{ fontSize: 9 }}>▾</span> EXPLORER
      </div>

      {/* Tree */}
      <div style={{ padding: '0 0 8px', flex: 1, overflowY: 'auto', overflowX: 'hidden' }}>
        {EDITOR_TREE.map((n, i) => (
          <ShellNode key={i} node={n} depth={0} activeFile={activeFile} />
        ))}
        {isAdmin && (
          <>
            <div style={{ height: '0.5px', background: 'var(--dt-border)', margin: '6px 8px' }} />
            {ADMIN_TREE.map((n, i) => (
              <ShellNode key={`admin-${i}`} node={n} depth={0} activeFile={activeFile} />
            ))}
          </>
        )}
      </div>

      {/* User / login strip */}
      <div style={{ boxShadow: 'inset 0 1px 0 var(--dt-border)', padding: '10px 8px', flexShrink: 0 }}>
        {isLoggedIn ? (
          <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
            <button
              onClick={() => navigate('/mypage')}
              style={{ display: 'flex', alignItems: 'center', gap: 10, flex: 1, padding: '8px 10px', background: 'transparent', border: 0, borderRadius: 6, cursor: 'default', textAlign: 'left', color: 'inherit', fontFamily: 'inherit', transition: 'background 100ms' }}
              onMouseEnter={(e) => { (e.currentTarget as HTMLButtonElement).style.background = 'var(--dt-hover)'; }}
              onMouseLeave={(e) => { (e.currentTarget as HTMLButtonElement).style.background = 'transparent'; }}
            >
              <Avatar handle={me.handle} hue={me.avatarHue} size={28} ring="var(--dt-primary)" />
              <div className="dt-stack" style={{ gap: 0, minWidth: 0, flex: 1 }}>
                <span style={{ fontSize: 12.5, color: 'var(--dt-text)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{me.handle}</span>
                <span style={{ fontSize: 10.5, color: 'var(--dt-text-3)' }}>★ {me.rating} · {t(me.tier)}</span>
              </div>
            </button>
            <button
              onClick={onLogout}
              title="로그아웃"
              style={{ flexShrink: 0, padding: '6px 8px', background: 'transparent', border: 0, borderRadius: 6, cursor: 'default', color: 'var(--dt-text-3)', fontSize: 13, transition: 'background 100ms' }}
              onMouseEnter={(e) => { (e.currentTarget as HTMLButtonElement).style.background = 'var(--dt-hover)'; }}
              onMouseLeave={(e) => { (e.currentTarget as HTMLButtonElement).style.background = 'transparent'; }}
            >↩</button>
          </div>
        ) : (
          <button
            onClick={onLogin}
            style={{ display: 'flex', alignItems: 'center', gap: 8, width: '100%', padding: '10px 12px', background: 'var(--dt-card)', color: 'var(--dt-text)', boxShadow: 'inset 0 1px 0 rgba(255,255,255,0.05), inset 0 0 0 1px var(--dt-border)', border: 0, borderRadius: 6, cursor: 'default', textAlign: 'left', fontFamily: 'inherit', fontSize: 13 }}
          >
            <GithubMark size={16} />
            <span style={{ flex: 1 }}>{t('Sign in with GitHub')}</span>
          </button>
        )}

        {/* Theme toggle */}
        <div style={{ display: 'flex', gap: 4, padding: '6px 2px 0', justifyContent: 'space-between', alignItems: 'center' }}>
          <span style={{ color: 'var(--dt-text-3)', fontSize: 10.5, paddingLeft: 8 }}>theme</span>
          <button
            onClick={onTheme}
            style={{ display: 'inline-flex', alignItems: 'center', gap: 6, background: 'transparent', border: 0, color: 'var(--dt-text-2)', padding: '4px 8px', borderRadius: 4, cursor: 'default', fontFamily: 'inherit', fontSize: 11 }}
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
    style={{
      width: 5,
      cursor: 'col-resize',
      background: 'var(--dt-border)',
      flexShrink: 0,
      position: 'relative',
      transition: 'background 150ms',
    }}
    onMouseEnter={(e) => { (e.currentTarget as HTMLDivElement).style.background = 'var(--dt-primary)'; }}
    onMouseLeave={(e) => { (e.currentTarget as HTMLDivElement).style.background = 'var(--dt-border)'; }}
  />
);

// ─── Tab bar ──────────────────────────────────────────────────────────────────

const ShellTabBar = ({ activeFile }: { activeFile: string }) => (
  <div style={{ display: 'flex', alignItems: 'stretch', background: 'var(--dt-surface)', boxShadow: 'inset 0 -1px 0 var(--dt-border)' }}>
    <div style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '0 16px 0 14px', background: 'var(--dt-bg)', boxShadow: 'inset 0 2px 0 var(--dt-primary), 1px 0 0 var(--dt-border), -1px 0 0 var(--dt-border)', color: 'var(--dt-text)', fontSize: 12.5, minWidth: 0 }}>
      <ShellFileIcon name={activeFile} />
      <span>{activeFile}</span>
      <span style={{ color: 'var(--dt-text-3)', fontSize: 10, marginLeft: 4 }}>●</span>
    </div>
    <div style={{ flex: 1, padding: '0 16px', display: 'flex', alignItems: 'center', gap: 8, color: 'var(--dt-text-3)', fontSize: 11, justifyContent: 'flex-end' }}>
      <span style={{ color: 'var(--dt-text-2)' }}>devtyper</span>
      <span>›</span>
      <span style={{ color: 'var(--dt-text)' }}>{activeFile}</span>
    </div>
  </div>
);

// ─── Status bar ───────────────────────────────────────────────────────────────

const ShellStatusBar = ({ activeFile, me, isLoggedIn }: { activeFile: string; me: User; isLoggedIn: boolean }) => (
  <div style={{ background: 'var(--dt-primary)', color: '#0D0E12', fontFamily: 'var(--dt-font-mono)', fontSize: 11, display: 'flex', alignItems: 'center', padding: '0 12px', gap: 16, boxShadow: 'inset 0 1px 0 rgba(255,255,255,0.18)' }}>
    <span>⌥ main</span>
    <span>● 0 errors</span>
    <span style={{ opacity: 0.7 }}>● 0 warnings</span>
    <span style={{ flex: 1 }} />
    {isLoggedIn
      ? <span style={{ opacity: 0.85 }}>{me.handle} · ★ {me.rating}</span>
      : <span style={{ opacity: 0.85 }}>guest</span>
    }
    <span style={{ opacity: 0.85 }}>{activeFile}</span>
    <span style={{ opacity: 0.85 }}>UTF-8</span>
    <span style={{ opacity: 0.85 }}>LF</span>
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
    <div style={{ background: 'var(--dt-bg)', color: 'var(--dt-text)', fontFamily: 'var(--dt-font-mono)', minHeight: '100vh', display: 'grid', gridTemplateRows: '1fr 24px' }}>
      <div style={{ display: 'grid', gridTemplateColumns: `${sidebarWidth}px 5px 1fr`, minHeight: 0 }}>
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
        <div style={{ display: 'grid', gridTemplateRows: '38px 1fr', minHeight: 0 }}>
          <ShellTabBar activeFile={activeFile} />
          <div style={{ overflow: 'auto', background: 'var(--dt-bg)' }}>
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
    <div style={{ padding: '20px 28px 12px', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', gap: 16 }}>
      <div>
        <div style={{ color: 'var(--dt-text-3)', fontSize: 12, marginBottom: 4 }}>
          <span style={{ color: '#6272A4' }}>// {path}</span>
        </div>
        <h1 style={{ margin: 0, fontFamily: 'var(--dt-font-mono)', fontSize: 26, fontWeight: 500, letterSpacing: '-0.01em' }}>{t(title)}</h1>
        {subtitle && <p style={{ margin: '6px 0 0', fontSize: 13, color: 'var(--dt-text-2)' }}>{t(subtitle)}</p>}
      </div>
      {action}
    </div>
  );
};
