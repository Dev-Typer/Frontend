import { useState } from 'react';
import { createSnippet, updateSnippet, type Snippet, type SnippetLanguage, type SnippetDifficulty } from '@/apis/snippetApi';

interface Props {
  snippet?: Snippet;
  onClose: () => void;
  onSaved: () => void;
}

const LANGS: SnippetLanguage[] = ['JavaScript', 'TypeScript', 'Python', 'Java', 'Go', 'C++', 'C#', 'C', 'Rust', 'Kotlin'];
const DIFFS: SnippetDifficulty[] = ['EASY', 'MEDIUM', 'HARD'];

const SnippetFormModal = ({ snippet, onClose, onSaved }: Props) => {
  const isEdit = !!snippet;
  const [title, setTitle]       = useState(snippet?.title      ?? '');
  const [language, setLanguage] = useState<SnippetLanguage>(snippet?.language   ?? 'JavaScript');
  const [difficulty, setDiff]   = useState<SnippetDifficulty>(snippet?.difficulty ?? 'EASY');
  const [content, setContent]   = useState(snippet?.content    ?? '');
  const [source, setSource]     = useState(snippet?.source     ?? '');
  const [saving, setSaving]     = useState(false);
  const [error, setError]       = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !content.trim()) { setError('제목과 코드 내용은 필수입니다.'); return; }
    setSaving(true); setError('');
    try {
      const body = { title: title.trim(), language, difficulty, content, source: source.trim() || undefined };
      if (isEdit) await updateSnippet(snippet!.id, body);
      else await createSnippet(body);
      onSaved();
    } catch { setError('저장에 실패했습니다.'); }
    finally { setSaving(false); }
  };

  const btn: React.CSSProperties = { padding: '5px 12px', fontSize: 12, border: 0, borderRadius: 'var(--dt-radius)', cursor: 'pointer', fontFamily: 'inherit' };
  const activeBg = 'color-mix(in oklab, var(--dt-primary) 15%, transparent)';
  const activeShadow = 'inset 0 0 0 1px var(--dt-primary)';

  return (
    <div style={{ position: 'fixed', inset: 0, zIndex: 100, background: 'rgba(0,0,0,0.6)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 24 }} onClick={onClose}>
      <div className="dt-card" style={{ width: '100%', maxWidth: 640, maxHeight: '90vh', overflowY: 'auto', padding: 32 }} onClick={(e) => e.stopPropagation()}>
        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 24 }}>
          <h2 className="dt-h3" style={{ margin: 0 }}>{isEdit ? '스니펫 수정' : '스니펫 등록'}</h2>
          <button onClick={onClose} style={{ background: 'transparent', border: 0, color: 'var(--dt-text-3)', fontSize: 20, cursor: 'pointer' }}>×</button>
        </div>
        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>
          <div><div className="dt-label" style={{ marginBottom: 6 }}>제목 *</div><input className="dt-input" style={{ width: '100%' }} value={title} onChange={(e) => setTitle(e.target.value)} placeholder="스니펫 제목" /></div>
          <div style={{ display: 'flex', gap: 16 }}>
            <div style={{ flex: 1 }}>
              <div className="dt-label" style={{ marginBottom: 6 }}>언어 *</div>
              <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
                {LANGS.map((l) => <button key={l} type="button" onClick={() => setLanguage(l)} style={{ ...btn, background: language === l ? activeBg : 'var(--dt-hover)', color: language === l ? 'var(--dt-primary)' : 'var(--dt-text-2)', boxShadow: language === l ? activeShadow : 'none', fontWeight: language === l ? 600 : 400 }}>{l}</button>)}
              </div>
            </div>
            <div style={{ flex: 1 }}>
              <div className="dt-label" style={{ marginBottom: 6 }}>난이도 *</div>
              <div style={{ display: 'flex', gap: 6 }}>
                {DIFFS.map((d) => <button key={d} type="button" onClick={() => setDiff(d)} style={{ ...btn, background: difficulty === d ? activeBg : 'var(--dt-hover)', color: difficulty === d ? 'var(--dt-primary)' : 'var(--dt-text-2)', boxShadow: difficulty === d ? activeShadow : 'none', fontWeight: difficulty === d ? 600 : 400 }}>{d}</button>)}
              </div>
            </div>
          </div>
          <div><div className="dt-label" style={{ marginBottom: 6 }}>코드 내용 *</div><textarea className="dt-input" style={{ width: '100%', minHeight: 200, resize: 'vertical', fontFamily: 'var(--dt-font-mono)', fontSize: 13, lineHeight: 1.7 }} value={content} onChange={(e) => setContent(e.target.value)} placeholder="코드를 입력하세요…" spellCheck={false} /></div>
          <div><div className="dt-label" style={{ marginBottom: 6 }}>출처 (선택)</div><input className="dt-input" style={{ width: '100%' }} value={source} onChange={(e) => setSource(e.target.value)} placeholder="MDN 등" /></div>
          {error && <p style={{ margin: 0, fontSize: 13, color: 'var(--dt-error)' }}>{error}</p>}
          <div style={{ display: 'flex', gap: 8, justifyContent: 'flex-end' }}>
            <button type="button" className="dt-btn dt-btn-secondary" onClick={onClose}>취소</button>
            <button type="submit" className="dt-btn dt-btn-primary" disabled={saving}>{saving ? '저장 중…' : isEdit ? '수정 완료' : '등록'}</button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default SnippetFormModal;
