import { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useT } from '@/i18n';
import { SOLO_TRACKS, GLOBAL_RANKING, LANG_ICON } from '@/data';
import Avatar from '@/components/Avatar';
import UserHover from '@/components/UserHover';
import {
  IconCode, IconPlay, IconX, IconSearch, IconTrash,
  IconArrowsSort, IconChevronDown, IconCheck, IconHeart,
} from '@/components/icons/Icons';
import type { SoloTrack } from '@/types';

// ─── Static maps ──────────────────────────────────────────────────────────────
const LANG_COLOR: Record<string, string> = {
  javascript: '#F7DF1E', typescript: '#3178C6', python: '#3776AB',
  go: '#00ADD8', java: '#F89820', kotlin: '#7F52FF',
  'c++': '#00599C', cpp: '#00599C', 'c#': '#9B4F96', csharp: '#9B4F96',
  c: '#5C6BC0', rust: '#DEA584',
};
const SNIP_SOURCE: Record<string, string> = {
  javascript: 'MDN Web Docs', typescript: 'TS Handbook', python: 'Python Docs',
  go: 'Go by Example', java: 'Java SE Docs', kotlin: 'Kotlin Docs',
  'c++': 'cppreference', 'c#': '.NET Docs', c: 'cppreference', rust: 'The Rust Book',
};
const DIFF_COLOR: Record<string, string> = {
  easy: '#3DD68C', medium: '#57E5FF', hard: '#B93CFF',
};

function langLabel(lang: string): string {
  return ({ javascript: 'JavaScript', typescript: 'TypeScript', python: 'Python',
    go: 'Go', java: 'Java', kotlin: 'Kotlin', 'c++': 'C++', cpp: 'C++',
    'c#': 'C#', csharp: 'C#', c: 'C', rust: 'Rust' } as Record<string, string>)[lang] || lang;
}
function fileExt(lang: string): string {
  return ({ javascript: '.js', typescript: '.ts', python: '.py', go: '.go',
    java: '.java', kotlin: '.kt', 'c++': '.cpp', cpp: '.cpp',
    'c#': '.cs', csharp: '.cs', c: '.c', rust: '.rs' } as Record<string, string>)[lang] || '';
}
function diffLabel(d: string): string {
  return ({ easy: 'Easy', medium: 'Medium', hard: 'Hard' } as Record<string, string>)[d] || d;
}

// ─── Deterministic synthetic metadata per snippet ─────────────────────────────
function snipMeta(s: SoloTrack) {
  const seed = s.id.split('').reduce((a, c) => a + c.charCodeAt(0), 0);
  const core = 80 + (seed * 7) % 380;
  const races = 1 + (seed * 3) % 60;
  const users = 1 + (seed * 5) % 24;
  const myRank = 1 + (seed % 40);
  const likes = (seed * 11) % 90;
  const dd = 1 + (seed % 27);
  const date = `06/${String(dd).padStart(2, '0')}/2026`;
  const handle = GLOBAL_RANKING[seed % GLOBAL_RANKING.length].handle;
  return { core, races, users, myRank, likes, date, handle };
}

// ─── Sidebar helpers ───────────────────────────────────────────────────────────
function FilterSection({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <div className="dt-label mb-[10px]">{label}</div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>{children}</div>
    </div>
  );
}

function LangFilterRow({ active, onClick, iconImg, children }: {
  active: boolean; onClick: () => void; iconImg?: string | null; children: React.ReactNode;
}) {
  return (
    <button onClick={onClick} style={{
      display: 'flex', alignItems: 'center', gap: 10, cursor: 'default', textAlign: 'left',
      padding: '7px 10px', borderRadius: 9, border: 0, width: '100%',
      background: active ? 'color-mix(in oklab, var(--dt-primary) 12%, transparent)' : 'transparent',
      boxShadow: active ? 'inset 0 0 0 1px color-mix(in oklab, var(--dt-primary) 35%, transparent)' : 'none',
      transition: 'background 120ms',
    }}>
      {iconImg
        ? <img src={iconImg} alt="" style={{ width: 18, height: 18, objectFit: 'contain' }} />
        : <IconCode size={16} style={{ color: 'var(--dt-text-3)' }} />}
      <span style={{ fontSize: 13.5, fontWeight: active ? 600 : 400, color: active ? 'var(--dt-primary)' : 'var(--dt-text-2)' }}>
        {children}
      </span>
    </button>
  );
}

function CheckRow({ checked, onToggle, accent = 'var(--dt-primary)', children }: {
  checked: boolean; onToggle: () => void; accent?: string; children: React.ReactNode;
}) {
  return (
    <button onClick={onToggle} style={{
      display: 'flex', alignItems: 'center', gap: 10, cursor: 'default',
      background: 'transparent', border: 0, padding: '2px 0', textAlign: 'left',
    }}>
      <span style={{
        width: 18, height: 18, borderRadius: 5, flexShrink: 0,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        background: checked ? accent : 'transparent',
        boxShadow: checked ? 'none' : 'inset 0 0 0 1.5px var(--dt-border)',
        transition: 'all 120ms',
      }}>
        {checked && <IconCheck size={13} style={{ color: '#0A0E1A' }} />}
      </span>
      <span style={{ fontSize: 13.5, color: checked ? 'var(--dt-text)' : 'var(--dt-text-2)' }}>{children}</span>
    </button>
  );
}

function SelectBox({ value, onChange, options, sortIcon }: {
  value: string; onChange: (v: string) => void;
  options: { value: string; label: string }[];
  sortIcon?: boolean;
}) {
  return (
    <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
      <select value={value} onChange={(e) => onChange(e.target.value)} className="dt-input dt-mono"
        style={{
          height: 46, paddingLeft: 16, paddingRight: 34, borderRadius: 12,
          fontSize: 14, cursor: 'default', appearance: 'none', WebkitAppearance: 'none', minWidth: 130,
        }}>
        {options.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
      </select>
      <span style={{ position: 'absolute', right: 11, pointerEvents: 'none', color: 'var(--dt-text-3)', display: 'flex' }}>
        {sortIcon ? <IconArrowsSort size={15} /> : <IconChevronDown size={16} />}
      </span>
    </div>
  );
}

// ─── MetaPill ─────────────────────────────────────────────────────────────────
function MetaPill({ children, mono, style }: { children: React.ReactNode; mono?: boolean; style?: React.CSSProperties }) {
  return (
    <span className={mono ? 'dt-mono tabular-nums' : ''} style={{
      display: 'inline-flex', alignItems: 'center', gap: 4,
      padding: '4px 10px', borderRadius: 999, fontSize: 12, fontWeight: 600,
      color: 'var(--dt-text-2)', background: 'var(--dt-hover)',
      boxShadow: 'inset 0 0 0 1px var(--dt-border)', whiteSpace: 'nowrap' as const,
      ...style,
    }}>
      {children}
    </span>
  );
}

// ─── Snippet leaderboard (expanded view) ──────────────────────────────────────
function SnippetLeaderboard({ snippet }: { snippet: SoloTrack }) {
  const t = useT();
  const seedBase = snippet.id.split('').reduce((a, c) => a + c.charCodeAt(0), 0);
  const rows = GLOBAL_RANKING.slice(0, 6).map((r, i) => {
    const seed = seedBase + r.handle.charCodeAt(0) * 3 + i * 7;
    const nWpm = Math.round((snippet.avgWpm + 30 - i * 3 + (seed % 7)) * 10) / 10;
    const acc = Math.round((90 + (seed % 9)) * 10) / 10;
    return { ...r, nWpm, acc };
  }).sort((a, b) => b.nWpm - a.nWpm).map((r, i) => ({ ...r, rank: i + 1 }));

  return (
    <div style={{ borderRadius: 12, boxShadow: 'inset 0 0 0 1px var(--dt-border)', overflow: 'hidden' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '11px 14px', boxShadow: 'inset 0 -1px 0 var(--dt-border)' }}>
        <span style={{ fontSize: 14 }}>🏆</span>
        <span style={{ fontSize: 13, fontWeight: 600, color: 'var(--dt-text)' }}>{t('Snippet leaderboard')}</span>
        <span className="dt-caption" style={{ marginLeft: 'auto' }}>{t('by nWPM')}</span>
      </div>
      {rows.map((r, i) => (
        <div key={r.handle} style={{
          display: 'grid', gridTemplateColumns: '28px 1fr 86px', gap: 10, alignItems: 'center',
          padding: '8px 14px',
          background: r.me ? 'color-mix(in oklab, var(--dt-primary) 8%, transparent)' : 'transparent',
          boxShadow: i > 0 ? 'inset 0 1px 0 var(--dt-border)' : 'none',
        }}>
          <span className="dt-mono tabular-nums" style={{ fontSize: 13, fontWeight: r.rank <= 3 ? 700 : 500, color: r.rank === 1 ? 'var(--dt-primary)' : 'var(--dt-text-2)' }}>
            {r.rank}
          </span>
          <UserHover handle={r.handle} tier={r.tier}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, minWidth: 0 }}>
              <Avatar handle={r.handle} hue={(r.handle.charCodeAt(0) * 7) % 360} size={20} />
              <span className="dt-mono" style={{ fontSize: 12.5, color: r.me ? 'var(--dt-primary)' : 'var(--dt-text)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                {r.handle}{r.me && ' (you)'}
              </span>
            </div>
          </UserHover>
          <span className="dt-mono tabular-nums" style={{ textAlign: 'right', fontSize: 13, fontWeight: 600, color: 'var(--dt-primary)' }}>
            {r.nWpm}<span style={{ fontSize: 9, color: 'var(--dt-text-3)' }}> nWPM</span>
          </span>
        </div>
      ))}
    </div>
  );
}

// ─── Snippet card ─────────────────────────────────────────────────────────────
function SnippetCard({
  snippet, open, onToggle, liked, onLike, onPractice,
}: {
  snippet: SoloTrack; open: boolean; onToggle: () => void;
  liked: boolean; onLike: () => void; onPractice: () => void;
}) {
  const t = useT();
  const [hover, setHover] = useState(false);
  const meta = snipMeta(snippet);
  const lc = LANG_COLOR[snippet.lang] || 'var(--dt-primary)';
  const diffColor = DIFF_COLOR[snippet.difficulty] || 'var(--dt-text-2)';
  const previewLines = snippet.code.split('\n').slice(0, 2);
  const lines = snippet.code.split('\n');
  const icon = LANG_ICON[snippet.lang];

  return (
    <div id={`snip-${snippet.id}`} className="dt-card" style={{
      padding: 0, overflow: 'hidden',
      boxShadow: hover
        ? `inset 0 0 0 1px color-mix(in oklab, ${lc} 45%, var(--dt-border))`
        : 'inset 0 0 0 1px var(--dt-border)',
      transition: 'box-shadow 140ms',
    }}>
      <div
        onClick={onToggle}
        onMouseEnter={() => setHover(true)}
        onMouseLeave={() => setHover(false)}
        style={{ display: 'flex', gap: 18, padding: 16, cursor: 'default' }}>

        {/* Thumbnail */}
        <div style={{
          width: 104, height: 104, borderRadius: 12, flexShrink: 0, position: 'relative',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          background: `linear-gradient(150deg, color-mix(in oklab, ${lc} 26%, #0B0E16), #0B0E16)`,
          boxShadow: `inset 0 0 0 1px color-mix(in oklab, ${lc} 30%, transparent)`,
        }}>
          {icon
            ? <img src={icon} alt="" style={{ width: 46, height: 46, objectFit: 'contain' }} />
            : <IconCode size={40} style={{ color: lc }} />}
          <span style={{
            position: 'absolute', bottom: 8, left: 8, fontSize: 10, fontWeight: 600,
            padding: '3px 8px', borderRadius: 999, color: diffColor,
            background: 'rgba(8,12,22,0.7)', backdropFilter: 'blur(4px)',
          }}>{t(diffLabel(snippet.difficulty))}</span>
        </div>

        {/* Middle */}
        <div style={{ flex: 1, minWidth: 0, display: 'flex', flexDirection: 'column', gap: 5 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, flexWrap: 'wrap' }}>
            <span className="dt-mono" style={{ fontSize: 16, fontWeight: 700, color: 'var(--dt-text)' }}>{snippet.title}</span>
            <span style={{ fontSize: 13, color: 'var(--dt-text-3)', fontStyle: 'italic' }}>{langLabel(snippet.lang)}</span>
            <span style={{
              fontSize: 11, fontWeight: 700, padding: '2px 8px', borderRadius: 6,
              color: 'var(--dt-text-2)', background: 'var(--dt-hover)',
            }} className="dt-mono">#{meta.myRank}</span>
          </div>
          <div style={{ fontSize: 13, color: 'var(--dt-text-2)' }}>
            {t('from')} {SNIP_SOURCE[snippet.lang] || 'Open source'}
          </div>
          <div className="dt-mono" style={{
            fontSize: 12.5, color: 'var(--dt-text-3)', lineHeight: 1.55,
            whiteSpace: 'pre', overflow: 'hidden', textOverflow: 'ellipsis', maxWidth: '100%',
          }}>
            {previewLines.map((ln, i) => (
              <div key={i} style={{ overflow: 'hidden', textOverflow: 'ellipsis' }}>
                {ln || ' '}{i === 1 && lines.length > 2 ? ' …' : ''}
              </div>
            ))}
          </div>
          <div className="dt-caption" style={{ marginTop: 2 }}>
            {t('Added by')} {meta.handle} · {meta.date}
          </div>
        </div>

        {/* Right meta */}
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: 8, flexShrink: 0 }}>
          <div style={{ display: 'flex', gap: 7 }}>
            <MetaPill mono style={{ color: 'var(--dt-primary)', boxShadow: 'inset 0 0 0 1px color-mix(in oklab, var(--dt-primary) 40%, transparent)' }}>
              {meta.core} <span style={{ fontSize: 10, opacity: 0.7 }}>CORE</span>
            </MetaPill>
            <MetaPill mono>
              {snippet.avgWpm} <span style={{ fontSize: 10, opacity: 0.7 }}>WPM</span>
            </MetaPill>
          </div>
          <div style={{ display: 'flex', gap: 7 }}>
            <MetaPill style={{ color: lc, boxShadow: `inset 0 0 0 1px color-mix(in oklab, ${lc} 38%, transparent)` }}>
              {langLabel(snippet.lang)}
            </MetaPill>
          </div>
          <div style={{ display: 'flex', gap: 7 }}>
            <MetaPill mono>{meta.races} {t('Races')}</MetaPill>
            <MetaPill mono>{meta.users} {t('Users')}</MetaPill>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginTop: 2 }}>
            <button onClick={(e) => { e.stopPropagation(); onPractice(); }} title={t('Practice')} style={{
              background: 'transparent', border: 0, cursor: 'default', color: 'var(--dt-text-3)', display: 'flex',
            }}>
              <IconPlay size={17} />
            </button>
            <button onClick={(e) => { e.stopPropagation(); onLike(); }} title={t('Like')} style={{
              background: 'transparent', border: 0, cursor: 'default', display: 'flex', alignItems: 'center', gap: 5,
              color: liked ? '#FF5F8F' : 'var(--dt-text-3)',
            }}>
              <IconHeart size={17} filled={liked} />
              <span className="dt-mono" style={{ fontSize: 12 }}>{meta.likes + (liked ? 1 : 0)}</span>
            </button>
          </div>
        </div>
      </div>

      {/* Expanded: code preview + leaderboard */}
      {open && (
        <div style={{ padding: '0 16px 18px', display: 'grid', gridTemplateColumns: '1.4fr 1fr', gap: 16 }}>
          {/* Code viewer */}
          <div style={{
            borderRadius: 12, overflow: 'hidden', background: '#0B0E16',
            boxShadow: 'inset 0 0 0 1px rgba(120,150,255,0.16)', fontFamily: 'var(--dt-font-mono)',
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 7, padding: '10px 14px', boxShadow: 'inset 0 -1px 0 rgba(120,150,255,0.14)' }}>
              <span style={{ width: 10, height: 10, borderRadius: '50%', background: '#FF5F57' }} />
              <span style={{ width: 10, height: 10, borderRadius: '50%', background: '#FFBD2E' }} />
              <span style={{ width: 10, height: 10, borderRadius: '50%', background: '#28C840' }} />
              <span style={{ marginLeft: 8, fontSize: 12, color: '#7A8195' }}>
                {snippet.title}{fileExt(snippet.lang)}
              </span>
              <button className="dt-btn dt-btn-primary dt-btn-sm" style={{ marginLeft: 'auto' }}
                onClick={(e) => { e.stopPropagation(); onPractice(); }}>
                <IconPlay size={13} /> {t('Practice')}
              </button>
            </div>
            <div style={{ padding: '14px 0', display: 'grid', gridTemplateColumns: '46px 1fr', fontSize: 13.5, lineHeight: 1.7, maxHeight: 320, overflowY: 'auto' }}>
              <div style={{ textAlign: 'right', paddingRight: 14, color: '#3A4660', userSelect: 'none', boxShadow: 'inset -1px 0 0 rgba(120,150,255,0.1)' }}>
                {lines.map((_, i) => <div key={i}>{i + 1}</div>)}
              </div>
              <div style={{ paddingLeft: 16, whiteSpace: 'pre', overflowX: 'auto', color: '#A9B1C6' }}>
                {lines.map((ln, i) => <div key={i}>{ln || ' '}</div>)}
              </div>
            </div>
          </div>
          <SnippetLeaderboard snippet={snippet} />
        </div>
      )}
    </div>
  );
}

// ─── Main ─────────────────────────────────────────────────────────────────────
const Snippets = () => {
  const t = useT();
  const navigate = useNavigate();
  const all = SOLO_TRACKS;

  const [query, setQuery] = useState('');
  const [lang, setLang] = useState('all');
  const [sort, setSort] = useState('created');
  const [diffSet, setDiffSet] = useState<Set<string>>(new Set());
  const [likedOnly, setLikedOnly] = useState(false);
  const [maxLen, setMaxLen] = useState(1000);
  const [liked, setLiked] = useState<Set<string>>(() => new Set());
  const [openId, setOpenId] = useState<string | null>(null);

  const LANGS = ['all', ...Array.from(new Set(all.map(s => s.lang)))];
  const longest = useMemo(() => Math.max(...all.map(s => s.code.length)), [all]);

  const toggleDiff = (d: string) => setDiffSet(p => {
    const n = new Set(p); n.has(d) ? n.delete(d) : n.add(d); return n;
  });
  const toggleLike = (id: string) => setLiked(p => {
    const n = new Set(p); n.has(id) ? n.delete(id) : n.add(id); return n;
  });
  const clearFilters = () => {
    setDiffSet(new Set()); setLikedOnly(false); setMaxLen(1000); setLang('all'); setQuery('');
  };

  const filtered = useMemo(() => {
    let r = all.filter(s => {
      const q = query.trim().toLowerCase();
      const okQ = !q || s.title.toLowerCase().includes(q) || s.code.toLowerCase().includes(q) || s.lang.includes(q);
      const okL = lang === 'all' || s.lang === lang;
      const okD = diffSet.size === 0 || diffSet.has(s.difficulty);
      const okLen = s.code.length <= maxLen;
      const okLk = !likedOnly || liked.has(s.id);
      return okQ && okL && okD && okLen && okLk;
    });
    r = [...r].sort((a, b) => {
      if (sort === 'wpm') return b.avgWpm - a.avgWpm;
      if (sort === 'length') return b.code.length - a.code.length;
      if (sort === 'title') return a.title.localeCompare(b.title);
      return all.indexOf(b) - all.indexOf(a);
    });
    return r;
  }, [all, query, lang, sort, diffSet, maxLen, likedOnly, liked]);

  const activeChips: { key: string; label: string; onClear: () => void }[] = [];
  if (lang !== 'all') activeChips.push({ key: 'lang', label: langLabel(lang), onClear: () => setLang('all') });
  [...diffSet].forEach(d => activeChips.push({ key: 'd' + d, label: t(diffLabel(d)), onClear: () => toggleDiff(d) }));
  if (likedOnly) activeChips.push({ key: 'liked', label: t('Liked'), onClear: () => setLikedOnly(false) });
  if (maxLen < 1000) activeChips.push({ key: 'len', label: `≤ ${maxLen} ${t('chars')}`, onClear: () => setMaxLen(1000) });

  return (
    <div className="dt-page" style={{ paddingTop: 8 }}>
      <div style={{ display: 'grid', gridTemplateColumns: '256px 1fr', gap: 24, alignItems: 'start' }}>

        {/* ── Left sidebar ─────────────────────────────────────────────── */}
        <aside style={{ position: 'sticky', top: 16, display: 'flex', flexDirection: 'column', gap: 16 }}>
          <div className="dt-card" style={{ padding: 20 }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 18 }}>
              <span style={{ fontSize: 15, fontWeight: 600, color: 'var(--dt-text)' }}>{t('Filters')}</span>
              <button onClick={clearFilters} style={{
                background: 'transparent', border: 0, cursor: 'default',
                color: 'var(--dt-error)', fontSize: 12.5, fontWeight: 600,
                display: 'flex', alignItems: 'center', gap: 5,
              }}>
                <IconTrash size={14} /> {t('Clear')}
              </button>
            </div>

            <FilterSection label={t('Language')}>
              {LANGS.map(l => (
                <LangFilterRow key={l} active={lang === l} onClick={() => setLang(l)}
                  iconImg={l !== 'all' ? LANG_ICON[l] : null}>
                  {l === 'all' ? t('All languages') : langLabel(l)}
                </LangFilterRow>
              ))}
            </FilterSection>

            <div style={{ height: 1, background: 'var(--dt-border)', margin: '16px 0' }} />

            <FilterSection label={t('Difficulty')}>
              {(['easy', 'medium', 'hard'] as const).map(d => (
                <CheckRow key={d} checked={diffSet.has(d)} onToggle={() => toggleDiff(d)}
                  accent={DIFF_COLOR[d]}>
                  {t(diffLabel(d))}
                </CheckRow>
              ))}
            </FilterSection>

            <div style={{ height: 1, background: 'var(--dt-border)', margin: '16px 0' }} />

            <FilterSection label={t('Show')}>
              <CheckRow checked={likedOnly} onToggle={() => setLikedOnly(v => !v)} accent="#FF5F8F">
                {t('Liked only')}
              </CheckRow>
            </FilterSection>

            <div style={{ height: 1, background: 'var(--dt-border)', margin: '16px 0' }} />

            <FilterSection label={`${t('Max length')} (${maxLen})`}>
              <input type="range" min={120} max={longest || 1000} step={20} value={maxLen}
                onChange={(e) => setMaxLen(Number(e.target.value))}
                style={{ width: '100%', accentColor: 'var(--dt-primary)' }} />
              <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 4 }}>
                <span className="dt-caption">120</span>
                <span className="dt-caption">{longest || 1000} {t('chars')}</span>
              </div>
            </FilterSection>
          </div>

          <div className="dt-card" style={{ padding: 16, display: 'flex', flexDirection: 'column', gap: 8 }}>
            <span className="dt-caption" style={{ marginBottom: 2 }}>{t('Library')}</span>
            <div style={{ display: 'flex', alignItems: 'baseline', gap: 8 }}>
              <span className="dt-mono tabular-nums" style={{ fontSize: 28, fontWeight: 700, color: 'var(--dt-primary)' }}>
                {all.length}
              </span>
              <span className="dt-caption">{t('snippets')}</span>
            </div>
            <span className="dt-caption" style={{ lineHeight: 1.5 }}>
              {t('Curated patterns from real codebases.')}
            </span>
          </div>
        </aside>

        {/* ── Main column ──────────────────────────────────────────────── */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16, minWidth: 0 }}>

          {/* Sticky search/sort header */}
          <div style={{
            position: 'sticky', top: 0, zIndex: 20,
            display: 'flex', flexDirection: 'column', gap: 12,
            paddingTop: 8, paddingBottom: 10, marginTop: -8,
            background: 'color-mix(in oklab, var(--dt-bg) 82%, transparent)',
            backdropFilter: 'blur(10px)', WebkitBackdropFilter: 'blur(10px)',
          }}>
            <div className="dt-card" style={{ padding: 14, display: 'flex', gap: 12, alignItems: 'center' }}>
              <div style={{ position: 'relative', flex: 1 }}>
                <input className="dt-input" value={query} onChange={(e) => setQuery(e.target.value)}
                  placeholder={t('Search snippets, code, language…')}
                  style={{ width: '100%', paddingLeft: 16, paddingRight: query ? 40 : 16, height: 46, fontSize: 15, borderRadius: 12 }} />
                {query && (
                  <button onClick={() => setQuery('')} style={{
                    position: 'absolute', right: 12, top: '50%', transform: 'translateY(-50%)',
                    background: 'transparent', border: 0, color: 'var(--dt-text-3)', cursor: 'default', display: 'flex',
                  }}>
                    <IconX size={16} />
                  </button>
                )}
              </div>
              <button title={t('Search')} style={{
                height: 46, width: 50, flexShrink: 0, borderRadius: 12, border: 0, cursor: 'default',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                color: 'var(--dt-text)', background: 'var(--dt-hover)',
                boxShadow: 'inset 0 0 0 1px var(--dt-border)',
              }}>
                <IconSearch size={19} />
              </button>
              <SelectBox value={sort} onChange={setSort} sortIcon
                options={[
                  { value: 'created', label: t('Newest') },
                  { value: 'wpm',     label: t('Avg WPM') },
                  { value: 'length',  label: t('Longest') },
                  { value: 'title',   label: t('Name') },
                ]} />
            </div>

            {/* Active filter chips + count */}
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '0 4px', minHeight: 28, flexWrap: 'wrap' }}>
              {activeChips.map(c => (
                <button key={c.key} onClick={c.onClear} style={{
                  display: 'inline-flex', alignItems: 'center', gap: 7, cursor: 'default',
                  padding: '6px 12px', borderRadius: 999, fontSize: 12.5, fontWeight: 500,
                  color: 'var(--dt-text)', background: 'var(--dt-hover)',
                  boxShadow: 'inset 0 0 0 1px var(--dt-border)', border: 0,
                }}>
                  {c.label} <IconX size={13} style={{ opacity: 0.6 }} />
                </button>
              ))}
              <span className="dt-caption" style={{ marginLeft: 'auto' }}>
                <span className="dt-mono" style={{ color: 'var(--dt-text)' }}>{filtered.length}</span> {t('snippets found')}
              </span>
            </div>
          </div>

          {/* Card list */}
          {filtered.length === 0 ? (
            <div className="dt-card" style={{ padding: 48, textAlign: 'center', color: 'var(--dt-text-2)' }}>
              <div style={{ fontSize: 32, marginBottom: 10 }}>🔍</div>
              {t('No snippets match your filters.')}
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              {filtered.map(s => (
                <SnippetCard
                  key={s.id}
                  snippet={s}
                  open={openId === s.id}
                  onToggle={() => setOpenId(p => p === s.id ? null : s.id)}
                  liked={liked.has(s.id)}
                  onLike={() => toggleLike(s.id)}
                  onPractice={() => navigate('/solo')}
                />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Snippets;
