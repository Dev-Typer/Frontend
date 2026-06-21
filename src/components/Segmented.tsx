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
  <div className="inline-flex p-0.5 gap-0.5 bg-dt-hover rounded-dt">
    {options.map((opt) => {
      const v = typeof opt === 'string' ? opt : opt.value;
      const l = typeof opt === 'string' ? opt : opt.label;
      const active = v === value;
      return (
        <button
          key={v}
          onClick={() => onChange(v)}
          className={`dt-mono border-0 px-3.5 py-[7px] text-[13px] font-medium rounded-md cursor-default transition-colors font-[inherit] ${active ? 'bg-dt-card text-dt-text shadow-[0_0_0_0.5px_var(--dt-border)]' : 'bg-transparent text-dt-text-2 shadow-none'}`}
        >
          {l}
        </button>
      );
    })}
  </div>
);

export default Segmented;
