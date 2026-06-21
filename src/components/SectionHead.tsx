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
    <div className="flex items-end justify-between mb-5 gap-4">
      <div>
        {kicker && <div className="dt-label text-dt-primary mb-1.5">{t(kicker)}</div>}
        <h2 className="dt-h1 m-0">{t(title)}</h2>
      </div>
      {action}
    </div>
  );
};

export default SectionHead;
