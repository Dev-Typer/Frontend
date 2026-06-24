import { useState, useEffect, useCallback, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useT } from '@/i18n';
import { LANG_ICON } from '@/data';
import {
  IconCode, IconPlay, IconX, IconSearch, IconTrash,
  IconArrowsSort, IconChevronDown, IconCheck, IconHeart,
} from '@/components/icons/Icons';
import {
  getPublicSnippets, likeSnippet, unlikeSnippet,
} from '@/apis/snippetApi';
import type { Snippet, SnippetLanguage, SnippetDifficulty, SnippetSort } from '@/apis/snippetApi';
import { useUserStore } from '@/stores/userStore';

// ─── Language / difficulty helpers ────────────────────────────────────────────
type BackendLang = SnippetLanguage;

function toLangKey(lang: BackendLang): string {
  return lang.toLowerCase();
}

const LANG_LABEL: Record<string, string> = {
  javascript: 'JavaScript', typescript: 'TypeScript', python: 'Python',
  java: 'Java', go: 'Go', 'c++': 'C++', 'c#': 'C#', c: 'C', rust: 'Rust', kotlin: 'Kotlin',
};
const LANG_COLOR: Record<string, string> = {
  javascript: '#F7DF1E', typescript: '#3178C6', python: '#3776AB',
  java: '#F89820', go: '#00ADD8', 'c++': '#00599C', 'c#': '#9B4F96',
  c: '#5C6BC0', rust: '#DEA584', kotlin: '#7F52FF',
};
const DIFF_COLOR: Record<string, string> = {
  easy: '#3DD68C', medium: '#57E5FF', hard: '#B93CFF',
};

function diffLabel(d: string): string {
  return ({ EASY: 'Easy', MEDIUM: 'Medium', HARD: 'Hard' } as Record<string, string>)[d] || d;
}

const BACKEND_LANGS: BackendLang[] = ['JavaScript', 'TypeScript', 'Python', 'Java', 'Go', 'C++', 'C#', 'C', 'Rust', 'Kotlin'];
const BACKEND_DIFFS: SnippetDifficulty[] = ['EASY', 'MEDIUM', 'HARD'];
const SORT_OPTIONS: { value: SnippetSort; label: string }[] = [
  { value: 'newest',     label: 'Newest'     },
  { value: 'oldest',     label: 'Oldest'     },
  { value: 'most-liked', label: 'Most liked' },
  { value: 'least-liked', label: 'Least liked' },
];

const PAGE_SIZE = 20;

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
          fontSize: 14, cursor: 'default', appearance: 'none', WebkitAppearance: 'none', minWidth: 140,
        }}>
        {options.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
      </select>
      <span style={{ position: 'absolute', right: 11, pointerEvents: 'none', color: 'var(--dt-text-3)', display: 'flex' }}>
        {sortIcon ? <IconArrowsSort size={15} /> : <IconChevronDown size={16} />}
      </span>
    </div>
  );
}

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

// ─── Snippet card ─────────────────────────────────────────────────────────────
function SnippetCard({
  snippet, likeCount, isLiked, onLike, onPractice, onRanking,
}: {
  snippet: Snippet;
  likeCount: number;
  isLiked: boolean;
  onLike: () => void;
  onPractice: () => void;
  onRanking: () => void;
}) {
  const t = useT();
  const [hover, setHover] = useState(false);
  const langKey = toLangKey(snippet.language);
  const lc = LANG_COLOR[langKey] || 'var(--dt-primary)';
  const diffColor = DIFF_COLOR[snippet.difficulty.toLowerCase()] || 'var(--dt-text-2)';
  const previewLines = snippet.content.split('\n').slice(0, 2);
  const icon = LANG_ICON[langKey];
  const addedAt = new Date(snippet.createdAt).toLocaleDateString('en-US', { month: '2-digit', day: '2-digit', year: 'numeric' });

  return (
    <div id={`snip-${snippet.id}`} className="dt-card" style={{
      padding: 0, overflow: 'hidden',
      boxShadow: hover
        ? `inset 0 0 0 1px color-mix(in oklab, ${lc} 45%, var(--dt-border))`
        : 'inset 0 0 0 1px var(--dt-border)',
      transition: 'box-shadow 140ms',
    }}>
      <div
        onClick={onPractice}
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
          }}>{diffLabel(snippet.difficulty)}</span>
        </div>

        {/* Middle */}
        <div style={{ flex: 1, minWidth: 0, display: 'flex', flexDirection: 'column', gap: 5 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, flexWrap: 'wrap' }}>
            <span className="dt-mono" style={{ fontSize: 16, fontWeight: 700, color: 'var(--dt-text)' }}>{snippet.title}</span>
            <span style={{ fontSize: 13, color: 'var(--dt-text-3)', fontStyle: 'italic' }}>{LANG_LABEL[langKey] || langKey}</span>
          </div>
          {snippet.source && (
            <div style={{ fontSize: 13, color: 'var(--dt-text-2)' }}>
              {t('from')} {snippet.source}
            </div>
          )}
          <div className="dt-mono" style={{
            fontSize: 12.5, color: 'var(--dt-text-3)', lineHeight: 1.55,
            whiteSpace: 'pre', overflow: 'hidden', textOverflow: 'ellipsis', maxWidth: '100%',
          }}>
            {previewLines.map((ln, i) => (
              <div key={i} style={{ overflow: 'hidden', textOverflow: 'ellipsis' }}>
                {ln || ' '}
              </div>
            ))}
          </div>
          <div className="dt-caption" style={{ marginTop: 2 }}>
            {addedAt}
          </div>
        </div>

        {/* Right meta */}
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: 8, flexShrink: 0 }}>
          <div style={{ display: 'flex', gap: 7 }}>
            <MetaPill mono>
              {snippet.avgWpm} <span style={{ fontSize: 10, opacity: 0.7 }}>WPM</span>
            </MetaPill>
          </div>
          <div style={{ display: 'flex', gap: 7 }}>
            <MetaPill style={{ color: lc, boxShadow: `inset 0 0 0 1px color-mix(in oklab, ${lc} 38%, transparent)` }}>
              {LANG_LABEL[langKey] || langKey}
            </MetaPill>
          </div>
          <div style={{ display: 'flex', gap: 7 }}>
            <MetaPill mono>{snippet.playCount} {t('Plays')}</MetaPill>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginTop: 2 }}>
            <button onClick={(e) => { e.stopPropagation(); onPractice(); }} title={t('Practice')} style={{
              background: 'transparent', border: 0, cursor: 'default', color: 'var(--dt-text-3)', display: 'flex',
            }}>
              <IconPlay size={17} />
            </button>
            <button onClick={(e) => { e.stopPropagation(); onLike(); }} title={t('Like')} style={{
              background: 'transparent', border: 0, cursor: 'default', display: 'flex', alignItems: 'center', gap: 5,
              color: isLiked ? '#FF5F8F' : 'var(--dt-text-3)',
            }}>
              <IconHeart size={17} filled={isLiked} />
              <span className="dt-mono" style={{ fontSize: 12 }}>{likeCount}</span>
            </button>
            <button onClick={(e) => { e.stopPropagation(); onRanking(); }} style={{
              background: 'transparent', border: 0, cursor: 'default', display: 'flex', alignItems: 'center',
              fontSize: 11, fontWeight: 600, color: 'var(--dt-text-3)', gap: 4, letterSpacing: '0.02em',
            }}>
              🏆 {t('View leaderboard')}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── Main ─────────────────────────────────────────────────────────────────────
const Snippets = () => {
  const t = useT();
  const navigate = useNavigate();
  const isLoggedIn = useUserStore((s) => s.isLoggedIn);

  const [snippets, setSnippets] = useState<Snippet[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(false);
  const [hasMore, setHasMore] = useState(true);

  const [query, setQuery] = useState('');
  const [debouncedQuery, setDebouncedQuery] = useState('');
  const [langs, setLangs] = useState<Set<BackendLang>>(new Set());
  const [sort, setSort] = useState<SnippetSort>('newest');
  const [diff, setDiff] = useState<SnippetDifficulty | null>(null);
  const [likedOnly, setLikedOnly] = useState(false);
  const [playedByMe, setPlayedByMe] = useState(false);

  // Optimistic like state: override per snippet id
  const [likeOverrides, setLikeOverrides] = useState<Map<number, { isLiked: boolean; likeCount: number }>>(new Map());
  const pendingLike = useRef<Set<number>>(new Set());

  // Debounce search query
  useEffect(() => {
    const t = setTimeout(() => setDebouncedQuery(query), 400);
    return () => clearTimeout(t);
  }, [query]);

  const fetchSnippets = useCallback(async (p: number, reset: boolean) => {
    setLoading(true);
    try {
      const langArr = [...langs];
      const res = await getPublicSnippets({
        language: langArr.length > 0 ? langArr : undefined,
        sort,
        keyword: debouncedQuery || undefined,
        likedByMe: likedOnly ? true : undefined,
        playedByMe: playedByMe ? 'played' : undefined,
        difficulty: diff ?? undefined,
        page: p,
        size: PAGE_SIZE,
      });
      if (reset) {
        setSnippets(res.data);
      } else {
        setSnippets(prev => [...prev, ...res.data]);
      }
      setTotal(res.total);
      setHasMore(p * PAGE_SIZE < res.total);
    } catch {
      // network error — keep current list
    } finally {
      setLoading(false);
    }
  }, [langs, sort, debouncedQuery, likedOnly, playedByMe, diff]);

  // Reset and fetch on filter change
  useEffect(() => {
    setPage(1);
    setLikeOverrides(new Map());
    fetchSnippets(1, true);
  }, [langs, sort, debouncedQuery, likedOnly, playedByMe, diff]); // eslint-disable-line react-hooks/exhaustive-deps

  const loadMore = () => {
    const next = page + 1;
    setPage(next);
    fetchSnippets(next, false);
  };

  const toggleLang = (l: BackendLang) => setLangs(p => {
    const n = new Set(p); n.has(l) ? n.delete(l) : n.add(l); return n;
  });

  const toggleDiff = (d: SnippetDifficulty) => setDiff(p => p === d ? null : d);

  const clearFilters = () => {
    setDiff(null); setLikedOnly(false); setPlayedByMe(false);
    setLangs(new Set()); setQuery('');
  };

  const handleLike = async (snippet: Snippet) => {
    if (!isLoggedIn) return;
    if (pendingLike.current.has(snippet.id)) return;

    const override = likeOverrides.get(snippet.id);
    const curIsLiked = override !== undefined ? override.isLiked : snippet.isLiked;
    const curCount = override !== undefined ? override.likeCount : snippet.likeCount;

    // Optimistic update
    const nextIsLiked = !curIsLiked;
    const nextCount = curIsLiked ? curCount - 1 : curCount + 1;
    setLikeOverrides(m => new Map(m).set(snippet.id, { isLiked: nextIsLiked, likeCount: nextCount }));
    pendingLike.current.add(snippet.id);

    try {
      const res = curIsLiked
        ? await unlikeSnippet(snippet.id)
        : await likeSnippet(snippet.id);
      setLikeOverrides(m => new Map(m).set(snippet.id, { isLiked: res.isLiked, likeCount: res.likeCount }));
    } catch {
      // revert
      setLikeOverrides(m => new Map(m).set(snippet.id, { isLiked: curIsLiked, likeCount: curCount }));
    } finally {
      pendingLike.current.delete(snippet.id);
    }
  };

  const activeChips: { key: string; label: string; onClear: () => void }[] = [];
  [...langs].forEach(l => activeChips.push({ key: 'lang-' + l, label: LANG_LABEL[toLangKey(l)] || l, onClear: () => toggleLang(l) }));
  if (diff) activeChips.push({ key: 'diff', label: diffLabel(diff), onClear: () => setDiff(null) });
  if (likedOnly) activeChips.push({ key: 'liked', label: t('Liked only'), onClear: () => setLikedOnly(false) });
  if (playedByMe) activeChips.push({ key: 'played', label: t('Played'), onClear: () => setPlayedByMe(false) });

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
              {BACKEND_LANGS.map(l => {
                const key = toLangKey(l);
                return (
                  <LangFilterRow key={l} active={langs.has(l)} onClick={() => toggleLang(l)}
                    iconImg={LANG_ICON[key] || null}>
                    {LANG_LABEL[key] || key}
                  </LangFilterRow>
                );
              })}
            </FilterSection>

            <div style={{ height: 1, background: 'var(--dt-border)', margin: '16px 0' }} />

            <FilterSection label={t('Difficulty')}>
              {BACKEND_DIFFS.map(d => (
                <CheckRow key={d} checked={diff === d} onToggle={() => toggleDiff(d)}
                  accent={DIFF_COLOR[d.toLowerCase()]}>
                  {diffLabel(d)}
                </CheckRow>
              ))}
            </FilterSection>

            <div style={{ height: 1, background: 'var(--dt-border)', margin: '16px 0' }} />

            <FilterSection label={t('Show')}>
              {isLoggedIn && (
                <CheckRow checked={likedOnly} onToggle={() => setLikedOnly(v => !v)} accent="#FF5F8F">
                  {t('Liked only')}
                </CheckRow>
              )}
              {isLoggedIn && (
                <CheckRow checked={playedByMe} onToggle={() => setPlayedByMe(v => !v)}>
                  {t('Played')}
                </CheckRow>
              )}
            </FilterSection>
          </div>

          <div className="dt-card" style={{ padding: 16, display: 'flex', flexDirection: 'column', gap: 8 }}>
            <span className="dt-caption" style={{ marginBottom: 2 }}>{t('Library')}</span>
            <div style={{ display: 'flex', alignItems: 'baseline', gap: 8 }}>
              <span className="dt-mono tabular-nums" style={{ fontSize: 28, fontWeight: 700, color: 'var(--dt-primary)' }}>
                {total}
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
                  placeholder={t('Search snippets, title, language…')}
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
              <SelectBox value={sort} onChange={(v) => setSort(v as SnippetSort)} sortIcon
                options={SORT_OPTIONS.map(o => ({ ...o, label: t(o.label) }))} />
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
                <span className="dt-mono" style={{ color: 'var(--dt-text)' }}>{total}</span> {t('snippets found')}
              </span>
            </div>
          </div>

          {/* Card list */}
          {snippets.length === 0 && !loading ? (
            <div className="dt-card" style={{ padding: 48, textAlign: 'center', color: 'var(--dt-text-2)' }}>
              <div style={{ fontSize: 32, marginBottom: 10 }}>🔍</div>
              {t('No snippets match your filters.')}
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              {snippets.map(s => {
                const ov = likeOverrides.get(s.id);
                return (
                  <SnippetCard
                    key={s.id}
                    snippet={s}
                    likeCount={ov !== undefined ? ov.likeCount : s.likeCount}
                    isLiked={ov !== undefined ? ov.isLiked : s.isLiked}
                    onLike={() => handleLike(s)}
                    onPractice={() => navigate(`/solo?snippetId=${s.id}`)}
                    onRanking={() => navigate(`/ranking/snippets/${s.id}`)}
                  />
                );
              })}
            </div>
          )}

          {/* Loading skeleton */}
          {loading && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              {[1, 2, 3].map(i => (
                <div key={i} className="dt-card" style={{ height: 120, opacity: 0.4, animation: 'pulse 1.5s ease-in-out infinite' }} />
              ))}
            </div>
          )}

          {/* Load more */}
          {hasMore && !loading && snippets.length > 0 && (
            <div style={{ display: 'flex', justifyContent: 'center', paddingBottom: 32 }}>
              <button className="dt-btn dt-btn-secondary" onClick={loadMore}>
                {t('Load more')}
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Snippets;
