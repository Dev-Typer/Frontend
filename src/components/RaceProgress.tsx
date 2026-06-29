import Avatar from '@/components/Avatar';

interface Racer {
  handle: string;
  hue: number;
  pct: number;
}

interface Props {
  pct: number;
  me?: { handle: string; avatarHue?: number; src?: string };
  racers?: Racer[];
}

const RaceProgress = ({ pct, me, racers }: Props) => {
  const m = me ?? { handle: 'you', avatarHue: 170 };
  const p = Math.max(0, Math.min(100, pct));
  return (
    <div className="dt-racetrack">
      <div className="dt-racetrack-bar">
        <div className="dt-racetrack-fill" style={{ width: `${p}%` }} />
        {(racers ?? []).map((r, i) => (
          <div key={i} className="dt-racetrack-ghost" style={{ left: `${Math.max(0, Math.min(100, r.pct))}%` }}>
            <Avatar handle={r.handle} hue={r.hue} size={24} />
          </div>
        ))}
        <div className="dt-racetrack-runner" style={{ left: `${p}%` }}>
          <Avatar handle={m.handle} hue={m.avatarHue ?? 170} src={m.src} size={36} ring="var(--dt-primary)" />
        </div>
      </div>
      <span className="dt-racetrack-flag" aria-hidden="true" />
    </div>
  );
};

export default RaceProgress;
