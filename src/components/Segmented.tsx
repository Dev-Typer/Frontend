interface Option {
  value: string;
  label: string;
}

interface Props {
  value: string;
  onChange: (v: string) => void;
  options: Option[] | string[];
}

const Segmented = ({ value, onChange, options }: Props) => (
  <div style={{ display: 'inline-flex', padding: 2, gap: 2, background: 'var(--dt-hover)', borderRadius: 'var(--dt-radius)' }}>
    {options.map((opt) => {
      const v = typeof opt === 'string' ? opt : opt.value;
      const l = typeof opt === 'string' ? opt : opt.label;
      const active = v === value;
      return (
        <button
          key={v}
          onClick={() => onChange(v)}
          className="dt-mono"
          style={{
            border: 0,
            background: active ? 'var(--dt-card)' : 'transparent',
            color: active ? 'var(--dt-text)' : 'var(--dt-text-2)',
            padding: '7px 14px', fontSize: 13, fontWeight: 500,
            borderRadius: 6, cursor: 'default',
            boxShadow: active ? '0 0 0 0.5px var(--dt-border)' : 'none',
            transition: 'background var(--dt-trans), color var(--dt-trans)',
            fontFamily: 'inherit',
          }}
        >
          {l}
        </button>
      );
    })}
  </div>
);

export default Segmented;
