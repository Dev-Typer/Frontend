interface Props {
  label: string;
  value: string | number;
  unit?: string;
  accent?: boolean;
  hint?: string;
  big?: boolean;
}

const Stat = ({ label, value, unit, accent, hint, big }: Props) => (
  <div className="dt-stack" style={{ gap: 4 }}>
    <span className="dt-label">{label}</span>
    <span
      className={big ? 'dt-display' : 'dt-h1'}
      style={{ fontFamily: 'var(--dt-font-mono)', color: accent ? 'var(--dt-primary)' : 'var(--dt-text)' }}
    >
      <span className="dt-tabular">{value}</span>
      {unit && <span style={{ fontSize: '0.5em', color: 'var(--dt-text-2)', marginLeft: 4 }}>{unit}</span>}
    </span>
    {hint && <span className="dt-caption">{hint}</span>}
  </div>
);

export default Stat;
