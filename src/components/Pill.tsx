import type { CSSProperties, ReactNode } from 'react';

interface Props {
  active?: boolean;
  onClick?: () => void;
  children: ReactNode;
  style?: CSSProperties;
}

const Pill = ({ active, onClick, children, style }: Props) => (
  <button
    onClick={onClick}
    className={`dt-chip${active ? ' active' : ''}`}
    style={{ cursor: 'default', border: 0, fontFamily: 'inherit', ...style }}
  >
    {children}
  </button>
);

export default Pill;
