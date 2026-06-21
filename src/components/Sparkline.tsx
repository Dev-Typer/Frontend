interface Props {
  data: number[];
  width?: number;
  height?: number;
  color?: string;
}

const Sparkline = ({ data, width = 120, height = 32, color }: Props) => {
  const min = Math.min(...data);
  const max = Math.max(...data);
  const range = max - min || 1;
  const pts = data.map((v, i) => {
    const x = (i / (data.length - 1)) * width;
    const y = height - ((v - min) / range) * (height - 4) - 2;
    return `${x},${y}`;
  }).join(' ');
  return (
    <svg width={width} height={height} className="block">
      <polyline points={pts} fill="none" stroke={color || 'var(--dt-primary)'} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
    </svg>
  );
};

export default Sparkline;
