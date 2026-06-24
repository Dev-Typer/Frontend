import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { getSnippetRanking, type RankingItem } from '@/apis/snippetResultApi';
import Avatar from '@/components/Avatar';
import ReplayViewer from './ReplayViewer';

const PAGE_SIZE = 20;

const SnippetRankingPage = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const snippetId = Number(id);

  const [items, setItems] = useState<RankingItem[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [replayResultId, setReplayResultId] = useState<number | null>(null);

  useEffect(() => {
    setLoading(true);
    getSnippetRanking(snippetId, page, PAGE_SIZE)
      .then((res) => { setItems(res.items); setTotal(res.total); })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [snippetId, page]);

  const totalPages = Math.ceil(total / PAGE_SIZE);

  if (loading && page === 1) {
    return <div className="dt-page" style={{ color: 'var(--dt-text-3)', fontFamily: 'var(--dt-font-mono)', textAlign: 'center', paddingTop: 80 }}>loading...</div>;
  }

  return (
    <div className="dt-page-narrow">
      <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 28 }}>
        <button className="dt-btn dt-btn-secondary dt-btn-sm" onClick={() => navigate(-1)}>← Back</button>
        <h1 className="dt-h2" style={{ margin: 0 }}>Snippet Ranking</h1>
        {total > 0 && <span className="dt-caption">— {total.toLocaleString()} entries</span>}
      </div>

      <div className="dt-card" style={{ padding: 0, overflow: 'hidden' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13 }}>
          <thead>
            <tr style={{ borderBottom: '0.5px solid var(--dt-border)', background: 'var(--dt-surface)' }}>
              {['순위', '유저', 'CORE', 'WPM', 'rawWPM', '정확도', '소요시간', '기록일', ''].map((h) => (
                <th key={h} style={{ padding: '10px 16px', textAlign: 'left', color: 'var(--dt-text-2)', fontWeight: 500, fontSize: 11, letterSpacing: '0.06em', textTransform: 'uppercase' }}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {items.length === 0 ? (
              <tr><td colSpan={9} style={{ padding: '40px 16px', textAlign: 'center', color: 'var(--dt-text-3)' }}>아직 기록이 없습니다.</td></tr>
            ) : items.map((item) => (
              <tr key={item.userId} style={{ borderBottom: '0.5px solid var(--dt-border)' }}>
                <td style={{ padding: '12px 16px', fontFamily: 'var(--dt-font-mono)', color: item.rank <= 3 ? 'var(--dt-primary)' : 'var(--dt-text-2)', fontWeight: item.rank <= 3 ? 600 : 400 }}>
                  #{item.rank}
                </td>
                <td style={{ padding: '12px 16px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    <Avatar handle={item.username} hue={(item.username.charCodeAt(0) * 7) % 360} size={24} src={item.profileUrl ?? undefined} />
                    <span className="dt-mono" style={{ fontSize: 13 }}>{item.username}</span>
                  </div>
                </td>
                <td style={{ padding: '12px 16px', fontFamily: 'var(--dt-font-mono)', color: 'var(--dt-primary)', fontWeight: 700 }}>{item.core.toFixed(1)}</td>
                <td style={{ padding: '12px 16px', fontFamily: 'var(--dt-font-mono)', color: 'var(--dt-text)' }}>{item.wpm.toFixed(1)}</td>
                <td style={{ padding: '12px 16px', fontFamily: 'var(--dt-font-mono)', color: 'var(--dt-text-2)' }}>{item.rawWpm.toFixed(1)}</td>
                <td style={{ padding: '12px 16px', fontFamily: 'var(--dt-font-mono)', color: 'var(--dt-text-2)' }}>{item.accuracy.toFixed(1)}%</td>
                <td style={{ padding: '12px 16px', fontFamily: 'var(--dt-font-mono)', color: 'var(--dt-text-2)' }}>{item.durationSec.toFixed(1)}s</td>
                <td style={{ padding: '12px 16px', color: 'var(--dt-text-3)', fontSize: 12 }}>
                  {new Date(item.createdAt).toLocaleDateString('ko-KR')}
                </td>
                <td style={{ padding: '12px 16px' }}>
                  <button
                    className="dt-btn dt-btn-secondary dt-btn-sm"
                    style={{ fontSize: 12 }}
                    onClick={() => setReplayResultId(item.userId)}
                  >
                    리플레이
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {totalPages > 1 && (
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, marginTop: 20 }}>
          <button
            className="dt-btn dt-btn-secondary dt-btn-sm"
            disabled={page <= 1}
            onClick={() => setPage(p => p - 1)}
          >← Prev</button>
          <span className="dt-caption">{page} / {totalPages}</span>
          <button
            className="dt-btn dt-btn-secondary dt-btn-sm"
            disabled={page >= totalPages}
            onClick={() => setPage(p => p + 1)}
          >Next →</button>
        </div>
      )}

      {replayResultId !== null && (
        <ReplayViewer
          resultId={replayResultId}
          onClose={() => setReplayResultId(null)}
        />
      )}
    </div>
  );
};

export default SnippetRankingPage;
