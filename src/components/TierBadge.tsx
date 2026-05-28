import { TIER_DEF } from '@/data';
import type { Tier } from '@/types';

interface TierGlyphProps {
  tier: Tier;
  size?: number;
}

const TierGlyph = ({ tier, size = 10 }: TierGlyphProps) => {
  const shapes: Record<Tier, React.ReactNode> = {
    bronze:   <circle cx="6" cy="6" r="4" fill="currentColor"/>,
    silver:   <circle cx="6" cy="6" r="4" fill="currentColor"/>,
    gold:     <path d="M6 1.5l1.5 3 3.3.5-2.4 2.3.6 3.3L6 9 3 10.6l.6-3.3L1.2 5l3.3-.5z" fill="currentColor"/>,
    platinum: <path d="M6 1.5L10.5 6 6 10.5 1.5 6z" fill="currentColor"/>,
    diamond:  <path d="M6 1.5L10.5 6 6 10.5 1.5 6z" fill="currentColor"/>,
    master:   <path d="M2 4l2 2.5L6 2l2 4.5L10 4l-1 6.5H3z" fill="currentColor"/>,
  };
  return <svg width={size} height={size} viewBox="0 0 12 12">{shapes[tier]}</svg>;
};

interface Props {
  tier: Tier | 'unranked';
  size?: 'md' | 'lg';
  showRange?: boolean;
}

const TierBadge = ({ tier, size = 'md', showRange }: Props) => {
  if (!tier || tier === 'unranked') {
    return <span className="dt-tier dt-tier-unranked">Unranked</span>;
  }
  const def = TIER_DEF[tier as Tier];
  return (
    <span
      className={`dt-tier dt-tier-${def.color}`}
      style={{
        fontSize: size === 'lg' ? 13 : 11,
        padding: size === 'lg' ? '5px 14px' : '3px 10px',
      }}
    >
      <TierGlyph tier={tier as Tier} />
      {def.label}
      {showRange && <span style={{ opacity: 0.6, marginLeft: 6 }}>· {def.range}</span>}
    </span>
  );
};

export default TierBadge;
