interface Props {
  label: string;
  value: string | number;
  unit?: string;
  accent?: boolean;
  hint?: string;
  big?: boolean;
}

const Stat = ({ label, value, unit, accent, hint, big }: Props) => (
  <div className="dt-stack gap-1">
    <span className="dt-label">{label}</span>
    <span className={`${big ? 'dt-display' : 'dt-h1'} font-dt-mono ${accent ? 'text-dt-primary' : 'text-dt-text'}`}>
      <span className="dt-tabular">{value}</span>
      {unit && <span className="text-[0.5em] text-dt-text-2 ml-1">{unit}</span>}
    </span>
    {hint && <span className="dt-caption">{hint}</span>}
  </div>
);

export default Stat;
