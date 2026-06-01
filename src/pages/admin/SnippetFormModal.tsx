import { useState } from 'react';
import { createSnippet, updateSnippet, type Snippet, type SnippetLanguage, type SnippetDifficulty } from '@/apis/snippetApi';

interface Props {
  snippet?: Snippet;
  onClose: () => void;
  onSaved: () => void;
}

const LANGS: SnippetLanguage[] = ['JAVASCRIPT', 'PYTHON', 'JAVA', 'CPP'];
const DIFFS: SnippetDifficulty[] = ['EASY', 'MEDIUM', 'HARD'];

const fieldStyle: React.CSSProperties = {
  display: 'flex', flexDirection: 'column', gap: 6,
};

const labelStyle: React.CSSProperties = {
  fontSize: 11, fontWeight: 500, letterSpacing: '0.08em',
  textTransform: 'uppercase', color: 'var(--dt-text-2)',
};

const SnippetFormModal = ({ snippet, onClose, onSaved }: Props) => {
  const isEdit = !!snippet;

  const [title,      setTitle]    = useState(snippet?.title      ?? '');
  const [language,   setLanguage] = useState<SnippetLanguage>(snippet?.language   ?? 'JAVASCRIPT');
  const [difficulty, setDiff]     = useState<SnippetDifficulty>(snippet?.difficulty ?? 'EASY');
  const [content,    setContent]  = useState(snippet?.content    ?? '');
  const [source,     setSource]   = useState(snippet?.source     ?? '');
  const [saving,     setSaving]   = useState(false);
  const [error,      setError]    = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !content.trim()) {
      setError('제목과 코드 내용은 필수입니다.');
      return;
    }
    setSaving(true);
    setError('');
    try {
      const body = { title: title.trim(), language, difficulty, content, source: source.trim() || undefined };
      if (isEdit) {
        await updateSnippet(snippet!.id, body);
      } else {
        await createSnippet(body);
      }
      onSaved();
    } catch {
      setError('저장에 실패했습니다. 다시 시도해주세요.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div style={{ position: 'fixed', inset: 0, zIndex: 100, background: 'rgba(0,0,0,0.6)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 24 }} onClick={onClose}>
      <div className="dt-card" style={{ width: '100%', maxWidth: 640, maxHeight: '90vh', overflowY: 'auto', padding: 32 }} onClick={(e) => e.stopPropagation()}>

        {/* Modal Header */}
        <div className="dt-row" style={{ marginBottom: 28 }}>
          <h2 className="dt-h3" style={{ margin: 0, flex: 1 }}>{isEdit ? '스니펫 수정' : '스니펫 등록'}</h2>
          <button onClick={onClose} style={{ background: 'transparent', border: 0, color: 'var(--dt-text-3)', fontSize: 20, cursor: 'pointer', padding: '0 4px', lineHeight: 1 }}>×</button>
        </div>

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>

          {/* Title */}
          <div style={fieldStyle}>
            <label style={labelStyle}>제목 *</label>
            <input className="dt-input" style={{ width: '100%' }} placeholder="스니펫 제목" value={title} onChange={(e) => setTitle(e.target.value)} />
          </div>

          {/* Language + Difficulty */}
          <div className="dt-row" style={{ gap: 16 }}>
            <div style={{ ...fieldStyle, flex: 1 }}>
              <label style={labelStyle}>언어 *</label>
              <div className="dt-row" style={{ gap: 6, flexWrap: 'wrap' }}>
                {LANGS.map((l) => (
                  <button key={l} type="button" onClick={() => setLanguage(l)}
                    style={{ padding: '5px 12px', fontSize: 12, border: 0, borderRadius: 'var(--dt-radius)', cursor: 'pointer', fontFamily: 'inherit', fontWeight: language === l ? 600 : 400, background: language === l ? 'color-mix(in oklab, var(--dt-primary) 15%, transparent)' : 'var(--dt-hover)', color: language === l ? 'var(--dt-primary)' : 'var(--dt-text-2)', boxShadow: language === l ? 'inset 0 0 0 1px var(--dt-primary)' : 'none' }}>
                    {l}
                  </button>
                ))}
              </div>
            </div>
            <div style={{ ...fieldStyle, flex: 1 }}>
              <label style={labelStyle}>난이도 *</label>
              <div className="dt-row" style={{ gap: 6 }}>
                {DIFFS.map((d) => (
                  <button key={d} type="button" onClick={() => setDiff(d)}
                    style={{ padding: '5px 12px', fontSize: 12, border: 0, borderRadius: 'var(--dt-radius)', cursor: 'pointer', fontFamily: 'inherit', fontWeight: difficulty === d ? 600 : 400, background: difficulty === d ? 'color-mix(in oklab, var(--dt-primary) 15%, transparent)' : 'var(--dt-hover)', color: difficulty === d ? 'var(--dt-primary)' : 'var(--dt-text-2)', boxShadow: difficulty === d ? 'inset 0 0 0 1px var(--dt-primary)' : 'none' }}>
                    {d}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Content */}
          <div style={fieldStyle}>
            <label style={labelStyle}>코드 내용 *</label>
            <textarea
              className="dt-input"
              style={{ width: '100%', minHeight: 200, resize: 'vertical', fontFamily: 'var(--dt-font-mono)', fontSize: 13, lineHeight: 1.7, whiteSpace: 'pre', overflowWrap: 'normal', overflowX: 'auto' }}
              placeholder="코드를 입력하세요…"
              value={content}
              onChange={(e) => setContent(e.target.value)}
              spellCheck={false}
            />
          </div>

          {/* Source */}
          <div style={fieldStyle}>
            <label style={labelStyle}>출처 (선택)</label>
            <input className="dt-input" style={{ width: '100%' }} placeholder="MDN, GitHub 등" value={source} onChange={(e) => setSource(e.target.value)} />
          </div>

          {error && <p style={{ margin: 0, fontSize: 13, color: 'var(--dt-error)' }}>{error}</p>}

          {/* Actions */}
          <div className="dt-row" style={{ gap: 8, justifyContent: 'flex-end', marginTop: 4 }}>
            <button type="button" className="dt-btn dt-btn-secondary" onClick={onClose}>취소</button>
            <button type="submit" className="dt-btn dt-btn-primary" disabled={saving}>
              {saving ? '저장 중…' : isEdit ? '수정 완료' : '등록'}
            </button>
          </div>

        </form>
      </div>
    </div>
  );
};

export default SnippetFormModal;
