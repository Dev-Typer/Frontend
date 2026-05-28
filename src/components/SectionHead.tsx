import type { ReactNode } from 'react';
import { useT } from '@/i18n';

interface Props {
  kicker?: string;
  title: string;
  action?: ReactNode;
}

const SectionHead = ({ kicker, title, action }: Props) => {
  const t = useT();
  return (
    <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', marginBottom: 20, gap: 16 }}>
      <div>
        {kicker && <div className="dt-label" style={{ color: 'var(--dt-primary)', marginBottom: 6 }}>{t(kicker)}</div>}
        <h2 className="dt-h1" style={{ margin: 0 }}>{t(title)}</h2>
      </div>
      {action}
    </div>
  );
};

export default SectionHead;
