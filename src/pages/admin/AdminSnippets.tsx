import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { getSnippets, deactivateSnippet, type Snippet, type SnippetLanguage, type SnippetDifficulty } from '@/apis/snippetApi';
import SnippetFormModal from './SnippetFormModal';

const diffColor: Record<SnippetDifficulty, string> = {
  EASY: 'var(--dt-success)', MEDIUM: 'var(--dt-warning)', HARD: 'var(--dt-error)',
};

const sel: React.CSSProperties = { background: 'var(--dt-card)', color: 'var(--dt-text)', border: '0.5px solid var(--dt-border)', borderRadius: 'var(--dt-radius)', padding: '6px 10px', fontSize: 13, fontFamily: 'inherit', outline: 'none', cursor: 'default' };

const AdminSnippets = () => {
  const navigate = useNavigate();
  const [snippets, setSnippets] = useState<Snippet[]>([]);
  const [total, setTotal]       = useState(0);
  const [page, setPage]         = useState(1);
  const [loading, setLoading]   = useState(false);
  const [lang, setLang]         = useState<SnippetLanguage | ''>('');
  const [diff, setDiff]         = useState<SnippetDifficulty | ''>('');
  const [isActive, setIsActive] = useState<'' | 'true' | 'false'>('');
  const [modal, setModal]       = useState<{ open: boolean; snippet?: Snippet }>({ open: false });
  const limit = 20;

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const res = await getSnippets({ language: lang || undefined, difficulty: diff || undefined, isActive: isActive === '' ? undefined : isActive === 'true', page, size: limit });
      setSnippets(res.data); setTotal(res.total);
    } catch { /* ignore */ }
    finally { setLoading(false); }
  }, [page, lang, diff, isActive]);

  useEffect(() => { load(); }, [load]);

  const handleDeactivate = async (id: number) => {
    if (!confirm('비활성화하시겠습니까?')) return;
    try { await deactivateSnippet(id); load(); } catch { alert('실패했습니다.'); }
  };

  const totalPages = Math.ceil(total / limit);

  return (
    <div className="dt-page">
      <div style={{ display: 'flex', alignItems: 'center', marginBottom: 24, gap: 12 }}>
        <div style={{ flex: 1 }}>
          <h1 className="dt-h2" style={{ margin: 0, color: 'var(--dt-primary)' }}>Snippet Admin</h1>
          <p className="dt-caption" style={{ marginTop: 4 }}>전체 {total}개</p>
        </div>
        <button className="dt-btn dt-btn-secondary dt-btn-sm" onClick={() => navigate('/')}>← 홈</button>
        <button className="dt-btn dt-btn-primary dt-btn-sm" onClick={() => setModal({ open: true })}>+ 스니펫 등록</button>
      </div>

      <div style={{ display: 'flex', gap: 8, marginBottom: 16, flexWrap: 'wrap' }}>
        <select style={sel} value={lang} onChange={(e) => { setLang(e.target.value as SnippetLanguage | ''); setPage(1); }}>
          <option value="">전체 언어</option>
          {(['JAVASCRIPT','PYTHON','JAVA','CPP'] as SnippetLanguage[]).map((l) => <option key={l} value={l}>{l}</option>)}
        </select>
        <select style={sel} value={diff} onChange={(e) => { setDiff(e.target.value as SnippetDifficulty | ''); setPage(1); }}>
          <option value="">전체 난이도</option>
          {(['EASY','MEDIUM','HARD'] as SnippetDifficulty[]).map((d) => <option key={d} value={d}>{d}</option>)}
        </select>
        <select style={sel} value={isActive} onChange={(e) => { setIsActive(e.target.value as '' | 'true' | 'false'); setPage(1); }}>
          <option value="">전체 상태</option>
          <option value="true">활성</option>
          <option value="false">비활성</option>
        </select>
      </div>

      <div className="dt-card" style={{ padding: 0, overflow: 'hidden' }}>
        {loading ? (
          <div style={{ padding: '60px 0', textAlign: 'center', color: 'var(--dt-text-3)' }}>로딩 중…</div>
        ) : (
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13 }}>
            <thead>
              <tr style={{ borderBottom: '0.5px solid var(--dt-border)', background: 'var(--dt-surface)' }}>
                {['ID','제목','언어','난이도','평균WPM','플레이','상태',''].map((h) => (
                  <th key={h} style={{ padding: '10px 16px', textAlign: 'left', color: 'var(--dt-text-2)', fontWeight: 500, fontSize: 11, letterSpacing: '0.06em', textTransform: 'uppercase' }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {snippets.length === 0 ? (
                <tr><td colSpan={8} style={{ padding: '40px 16px', textAlign: 'center', color: 'var(--dt-text-3)' }}>스니펫이 없습니다.</td></tr>
              ) : snippets.map((s) => (
                <tr key={s.id} style={{ borderBottom: '0.5px solid var(--dt-border)', opacity: s.isActive ? 1 : 0.45 }}>
                  <td style={{ padding: '12px 16px', fontFamily: 'var(--dt-font-mono)', color: 'var(--dt-text-3)' }}>{s.id}</td>
                  <td style={{ padding: '12px 16px', maxWidth: 260, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{s.title}</td>
                  <td style={{ padding: '12px 16px' }}><span className="dt-chip">{s.language}</span></td>
                  <td style={{ padding: '12px 16px' }}><span style={{ fontSize: 12, fontWeight: 600, color: diffColor[s.difficulty] }}>{s.difficulty}</span></td>
                  <td style={{ padding: '12px 16px', fontFamily: 'var(--dt-font-mono)', color: 'var(--dt-text-2)' }}>{s.avgWpm.toFixed(1)}</td>
                  <td style={{ padding: '12px 16px', fontFamily: 'var(--dt-font-mono)', color: 'var(--dt-text-2)' }}>{s.playCount}</td>
                  <td style={{ padding: '12px 16px' }}>
                    <span style={{ fontSize: 11, fontWeight: 600, padding: '2px 8px', borderRadius: 4, background: s.isActive ? 'rgba(22,163,74,0.15)' : 'var(--dt-hover)', color: s.isActive ? 'var(--dt-success)' : 'var(--dt-text-3)' }}>
                      {s.isActive ? '활성' : '비활성'}
                    </span>
                  </td>
                  <td style={{ padding: '12px 16px' }}>
                    <div style={{ display: 'flex', gap: 6 }}>
                      <button className="dt-btn dt-btn-secondary dt-btn-sm" style={{ fontSize: 12 }} onClick={() => setModal({ open: true, snippet: s })}>수정</button>
                      {s.isActive && <button className="dt-btn dt-btn-sm" style={{ fontSize: 12, background: 'rgba(220,38,38,0.12)', color: 'var(--dt-error)', border: 0 }} onClick={() => handleDeactivate(s.id)}>비활성화</button>}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {totalPages > 1 && (
        <div style={{ display: 'flex', justifyContent: 'center', gap: 6, marginTop: 20 }}>
          <button className="dt-btn dt-btn-secondary dt-btn-sm" disabled={page === 1} onClick={() => setPage((p) => p - 1)}>‹</button>
          {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => (
            <button key={p} className={`dt-btn dt-btn-sm ${p === page ? 'dt-btn-primary' : 'dt-btn-secondary'}`} style={{ minWidth: 36 }} onClick={() => setPage(p)}>{p}</button>
          ))}
          <button className="dt-btn dt-btn-secondary dt-btn-sm" disabled={page === totalPages} onClick={() => setPage((p) => p + 1)}>›</button>
        </div>
      )}

      {modal.open && (
        <SnippetFormModal snippet={modal.snippet} onClose={() => setModal({ open: false })} onSaved={() => { setModal({ open: false }); load(); }} />
      )}
    </div>
  );
};

export default AdminSnippets;
