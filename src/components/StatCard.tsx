import { useState } from 'react';

const InfoTooltip = ({ text }: { text: string }) => {
  const [visible, setVisible] = useState(false);
  return (
    <span style={{ position: 'relative', display: 'inline-flex', verticalAlign: 'middle' }}>
      <span
        onMouseEnter={() => setVisible(true)}
        onMouseLeave={() => setVisible(false)}
        style={{
          display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
          width: 14, height: 14, borderRadius: '50%',
          background: 'rgba(255,255,255,0.07)', border: '1px solid rgba(255,255,255,0.15)',
          fontSize: 9, fontWeight: 700, color: 'var(--dt-text-3)',
          cursor: 'help', lineHeight: 1, fontFamily: 'inherit',
        }}
      >i</span>
      {visible && (
        <div style={{
          position: 'absolute', bottom: '130%', left: '50%', transform: 'translateX(-50%)',
          background: 'var(--dt-card)', border: '1px solid var(--dt-border)',
          borderRadius: 8, padding: '8px 12px', width: 220,
          fontSize: 11.5, lineHeight: 1.55, color: 'var(--dt-text-2)',
          zIndex: 100, boxShadow: '0 8px 24px -8px rgba(0,0,0,0.5)',
          pointerEvents: 'none', whiteSpace: 'normal',
        }}>
          {text}
          <div style={{
            position: 'absolute', top: '100%', left: '50%', transform: 'translateX(-50%)',
            width: 0, height: 0,
            borderLeft: '5px solid transparent', borderRight: '5px solid transparent',
            borderTop: '5px solid var(--dt-border)',
          }} />
        </div>
      )}
    </span>
  );
};

export { InfoTooltip };

interface StatCardProps {
  label: string;
  value: string | number;
  unit?: string;
  sub?: string;
  info?: string;
}

const StatCard = ({ label, value, unit, sub, info }: StatCardProps) => (
  <div className="dt-card p-5">
    <div className="dt-label mb-1.5 flex items-center gap-1.5">
      {label}
      {info && <InfoTooltip text={info} />}
    </div>
    <div className="dt-mono dt-tabular text-[28px] font-medium">
      {value}{unit && <span className="text-[15px] text-dt-text-2">{unit}</span>}
    </div>
    {sub && <div className="dt-caption mt-1.5">{sub}</div>}
  </div>
);

export default StatCard;
