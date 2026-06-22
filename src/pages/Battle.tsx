import { useState, useEffect } from 'react';
import { useT } from '@/i18n';
import { useAppStore } from '@/stores/appStore';
import { CODE_SNIPPETS, OPPONENTS, RECENT_BATTLES, ME } from '@/data';
import SectionHead from '@/components/SectionHead';
import Avatar from '@/components/Avatar';
import TierBadge from '@/components/TierBadge';
import PlayEditor from '@/components/PlayEditor';
import Stat from '@/components/Stat';
import { IconBolt, IconSwords, IconUsers, IconRefresh, IconCheck, IconMedal, IconArrowRight } from '@/components/icons/Icons';
import type { Opponent, TypingProgress, TypingResult, BotState, FinalRanking, Racer } from '@/types';

type Phase = 'lobby' | 'matching' | 'countdown' | 'race' | 'result';

function ratingDelta(rank: number, totalPlayers: number): number {
  if (totalPlayers === 4) return [24, 8, -8, -24][rank - 1] ?? 0;
  if (totalPlayers === 3) return [20, 0, -20][rank - 1] ?? 0;
  if (totalPlayers === 2) return [16, -16][rank - 1] ?? 0;
  return 0;
}

const CheckeredFlag = ({ size = 16 }: { size?: number }) => (
  <svg width={size} height={size} viewBox="0 0 16 16" className="block">
    <rect x="2" y="1" width="1.2" height="14" fill="currentColor" />
    <g transform="translate(3.4,1.5)">
      {[0, 1, 2].map((r) => [0, 1, 2, 3].map((c) => (
        (r + c) % 2 === 0 && <rect key={`${r}-${c}`} x={c * 2.6} y={r * 2.6} width="2.6" height="2.6" fill="currentColor" />
      )))}
      <rect x="0" y="0" width="10.4" height="7.8" fill="none" stroke="currentColor" strokeWidth="0.6" opacity="0.5" />
    </g>
  </svg>
);

const BattleLobby = ({ onQuickMatch }: { onQuickMatch: () => void }) => {
  const t = useT();
  const [roomCode, setRoomCode] = useState('');
  return (
    <div>
      <SectionHead kicker="Battle" title="Race developers at your level." />
      <div className="grid grid-cols-[1.4fr_1fr] gap-5">
        <div className="dt-card p-8">
          <div className="flex items-center gap-3 mb-5">
            <IconBolt size={22} className="text-dt-primary" />
            <h3 className="dt-h2 m-0">{t('Quick match')}</h3>
            <span className="dt-chip ml-auto">{t('~8s queue')}</span>
          </div>
          <p className="dt-body-sm text-dt-text-2 mb-6">
            {t("We'll pair you with 1–3 developers within ±150 rating of you. Same snippet, same start, first to finish wins.")}
          </p>
          <button className="dt-btn dt-btn-primary dt-btn-lg w-full" onClick={onQuickMatch}>
            <IconSwords size={18} /> {t('Find a match')}
          </button>
          <div className="dt-divider my-6" />
          <div className="flex items-center justify-between">
            <div className="dt-body-sm text-dt-text-2">{t('Matching pool')}</div>
            <div className="flex items-center gap-1.5">
              <span className="dt-live-dot" />
              <span className="dt-mono text-[13px]">37 {t('in queue')}</span>
            </div>
          </div>
        </div>
        <div className="dt-card p-7">
          <div className="flex items-center gap-3 mb-4">
            <IconUsers size={20} className="text-dt-text-2" />
            <h3 className="dt-h3 m-0">{t('Play with friends')}</h3>
          </div>
          <p className="dt-body-sm text-dt-text-2 mb-5">{t('Create a room and share the code, or join one.')}</p>
          <button className="dt-btn dt-btn-secondary w-full mb-2">{t('Create a room')}</button>
          <div className="flex gap-2">
            <input className="dt-input dt-mono flex-1" placeholder="DT-XXXXXX" value={roomCode} onChange={(e) => setRoomCode(e.target.value.toUpperCase())} />
            <button className="dt-btn dt-btn-secondary">{t('Join')}</button>
          </div>
        </div>
      </div>
      <div className="mt-8">
        <SectionHead title="Your recent battles" />
        <div className="dt-card p-0 overflow-hidden">
          {RECENT_BATTLES.slice(0, 5).map((b, i, arr) => (
            <div key={b.id} className={`grid grid-cols-[64px_1.6fr_1fr_100px_80px_80px] py-3.5 px-6 items-center gap-4 ${i < arr.length - 1 ? 'border-b-[0.5px] border-dt-border' : ''}`}>
              <span className="dt-caption">{b.when}</span>
              <div className="flex items-center gap-2">
                {b.opponents.map((o, oi) => (
                  <div key={o} className="flex items-center gap-1.5">
                    <Avatar handle={o} hue={(o.charCodeAt(0) * 7) % 360} size={22} />
                    <span className="dt-mono dt-body-sm">{o}</span>
                    {oi < b.opponents.length - 1 && <span className="text-dt-text-3">·</span>}
                  </div>
                ))}
              </div>
              <span className="dt-chip">{b.lang}</span>
              <span className="dt-mono dt-body-sm text-dt-text-2">{b.myWpm} wpm</span>
              <span className={`dt-mono text-sm font-medium ${b.myRank === 1 ? 'text-dt-warning' : 'text-dt-text'}`}>#{b.myRank}</span>
              <span className={`dt-mono dt-tabular text-sm ${b.delta >= 0 ? 'text-dt-success' : 'text-dt-error'}`}>{b.delta >= 0 ? '+' : ''}{b.delta}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

const Matching = () => {
  const t = useT();
  return (
    <div className="min-h-[calc(100vh-200px)] flex items-center justify-center flex-col">
      <div className="relative w-[120px] h-[120px] mb-8">
        <div className="absolute inset-0 rounded-full border-2 border-dt-border [border-top-color:var(--dt-primary)] animate-[dt-spin_1.2s_linear_infinite]" />
        <div className="absolute inset-0 flex items-center justify-center">
          <IconSwords size={40} className="text-dt-primary" />
        </div>
      </div>
      <h2 className="dt-h1 m-0 mb-2">{t('Finding opponents…')}</h2>
      <p className="dt-body text-dt-text-2 m-0">{t('Looking for developers within ±150 rating')}</p>
    </div>
  );
};

const Countdown = ({ count, opponents }: { count: number; opponents: Opponent[] }) => {
  const t = useT();
  const me = ME;
  const all = [{ ...me, you: true }, ...opponents];
  return (
    <div>
      <SectionHead title="Match found · starting in…" />
      <div className="dt-card p-0 overflow-hidden">
        <div className="flex">
          {all.map((p, i) => (
            <div key={i} className={`flex-1 py-6 px-5 flex items-center gap-3.5 ${i < all.length - 1 ? 'border-r-[0.5px] border-dt-border' : ''} ${'you' in p && p.you ? 'bg-[color-mix(in_oklab,var(--dt-primary)_6%,transparent)]' : 'bg-transparent'}`}>
              <Avatar handle={p.handle} hue={'you' in p && p.you ? me.avatarHue : (p as Opponent).hue} size={44} ring={'you' in p && p.you ? 'var(--dt-primary)' : undefined} />
              <div className="dt-stack gap-0.5 min-w-0">
                <span className="dt-mono text-sm font-medium">{p.handle}{'you' in p && p.you && <span className="text-dt-primary ml-1.5">(you)</span>}</span>
                <div className="flex items-center gap-1.5">
                  <TierBadge tier={p.tier} />
                  <span className="dt-caption dt-mono">{p.rating}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
        <div className="py-16 text-center bg-dt-type-bg border-t-[0.5px] border-dt-border">
          <div key={count} className={`dt-mono text-[140px] leading-none font-medium animate-[dt-pop_600ms_ease-out] ${count === 0 ? 'text-dt-primary' : 'text-dt-text'}`}>
            {count === 0 ? t('GO') : count}
          </div>
        </div>
      </div>
    </div>
  );
};

const RaceAvatars = ({ racers }: { racers: Racer[] }) => (
  <div className="dt-card p-0 overflow-hidden">
    <div className="flex justify-between pt-2.5 pr-6 pb-2.5 pl-[100px] border-b-[0.5px] border-dt-border text-dt-text-3 text-[11px] font-dt-mono tracking-[0.08em]">
      <span>START</span><span>25%</span><span>50%</span><span>75%</span>
      <span className="flex items-center gap-1.5 text-dt-primary">
        <CheckeredFlag size={15} /> FINISH
      </span>
    </div>
    <div className="relative py-3 px-6">
      {[0.25, 0.5, 0.75].map((t) => (
        <div key={t} className="absolute top-0 bottom-0 w-px bg-dt-border opacity-50" style={{ left: `calc(100px + (100% - 124px) * ${t})` }} />
      ))}
      <div
        className="absolute top-0 bottom-0 opacity-90 rounded-[1px] shadow-[0_0_12px_color-mix(in_oklab,var(--dt-primary)_40%,transparent)]"
        style={{
          right: 'calc(80px + 24px)', width: 8,
          backgroundImage: 'repeating-conic-gradient(var(--dt-primary) 0% 25%, #0B0E16 0% 50%)',
          backgroundSize: '8px 8px',
        }}
      />
      {racers.map((r) => {
        const pct = r.progress * 100;
        return (
          <div key={r.handle} className="grid grid-cols-[92px_1fr_80px] items-center gap-0 py-2 relative">
            <div className="dt-stack gap-0.5 min-w-0 pr-2">
              <span className={`dt-mono text-xs whitespace-nowrap overflow-hidden text-ellipsis ${r.you ? 'font-medium text-dt-primary' : 'font-normal text-dt-text'}`}>
                {r.handle}{r.you ? ' ★' : ''}
              </span>
              <span className="dt-caption dt-mono text-[10px]">{r.wpm} wpm</span>
            </div>
            <div className="relative h-9">
              <div
                className={`absolute top-1/2 -translate-y-1/2 left-3.5 h-0.5 opacity-40 rounded-full transition-[width] duration-200 ease-linear ${r.you ? 'bg-dt-primary' : ''}`}
                style={{ width: `calc(${pct}% - 14px)`, background: r.you ? undefined : `oklch(78% 0.14 ${r.hue})` }}
              />
              <div className="absolute top-1/2 -translate-y-1/2 left-3.5 right-0 h-px opacity-50 [background:repeating-linear-gradient(90deg,var(--dt-border)_0,var(--dt-border)_3px,transparent_3px,transparent_8px)]" />
              <div className="absolute top-1/2 -translate-y-1/2 z-[2] transition-[left] duration-200 ease-linear" style={{ left: `calc(${pct}% * 0.93)` }}>
                <Avatar handle={r.handle} hue={r.you ? 170 : r.hue} size={32} ring={r.you ? 'var(--dt-primary)' : undefined} />
                {r.done && (
                  <div className="absolute -top-2 -right-2.5 text-dt-success drop-shadow-[0_0_4px_color-mix(in_oklab,var(--dt-success)_60%,transparent)]">
                    <CheckeredFlag size={16} />
                  </div>
                )}
              </div>
            </div>
            <div className="text-right">
              <span className={`dt-mono dt-tabular text-[13px] ${r.done ? 'text-dt-success' : 'text-dt-text-2'}`}>{Math.round(pct)}%</span>
            </div>
          </div>
        );
      })}
    </div>
  </div>
);

const RaceBars = ({ racers }: { racers: Racer[] }) => (
  <div className="dt-card p-6">
    <div className="flex flex-col gap-3.5">
      {racers.map((r) => (
        <div key={r.handle}>
          <div className="flex justify-between mb-1.5">
            <div className="flex items-center gap-2">
              <Avatar handle={r.handle} hue={r.you ? 170 : r.hue} size={22} />
              <span className={`dt-mono text-[13px] ${r.you ? 'text-dt-primary' : 'text-dt-text'}`}>{r.handle}{r.you && ' ★'}</span>
            </div>
            <span className="dt-mono dt-tabular text-[13px]">{r.wpm} wpm · {Math.round(r.progress * 100)}%</span>
          </div>
          <div className="h-2 bg-dt-hover rounded-full overflow-hidden">
            <div
              className={`h-full rounded-full transition-[width] duration-200 ease-linear ${r.you ? 'bg-dt-primary' : ''}`}
              style={{ width: `${r.progress * 100}%`, background: r.you ? undefined : `oklch(78% 0.14 ${r.hue})` }}
            />
          </div>
        </div>
      ))}
    </div>
  </div>
);

const RaceLanes = ({ racers }: { racers: Racer[] }) => (
  <div className="dt-card p-0 overflow-hidden">
    <div className="grid h-[220px]" style={{ gridTemplateColumns: `repeat(${racers.length}, 1fr)` }}>
      {racers.map((r, i) => (
        <div key={r.handle} className={`relative p-4 flex flex-col items-center ${i < racers.length - 1 ? 'border-r-[0.5px] border-dt-border' : ''}`}>
          <div className="mb-3"><Avatar handle={r.handle} hue={r.you ? 170 : r.hue} size={36} ring={r.you ? 'var(--dt-primary)' : undefined} /></div>
          <span className={`dt-mono text-xs ${r.you ? 'text-dt-primary' : 'text-dt-text'}`}>{r.handle}</span>
          <span className="dt-caption dt-mono mb-3">{r.wpm} wpm</span>
          <div className="flex-1 w-3 bg-dt-hover rounded-full overflow-hidden relative">
            <div
              className={`absolute bottom-0 left-0 right-0 transition-[height] duration-200 ease-linear ${r.you ? 'bg-dt-primary' : ''}`}
              style={{ height: `${r.progress * 100}%`, background: r.you ? undefined : `oklch(78% 0.14 ${r.hue})` }}
            />
          </div>
          <span className="dt-mono dt-tabular mt-2 text-[13px]">{Math.round(r.progress * 100)}%</span>
        </div>
      ))}
    </div>
  </div>
);

const RaceTrack = ({ racers, vizStyle }: { racers: Racer[]; vizStyle: string }) => {
  if (vizStyle === 'bars') return <RaceBars racers={racers} />;
  if (vizStyle === 'lanes') return <RaceLanes racers={racers} />;
  return <RaceAvatars racers={racers} />;
};

interface BattleRaceProps {
  snippet: string;
  opponents: Opponent[];
  progress: TypingProgress;
  setProgress: (p: TypingProgress) => void;
  onFinish: (r: FinalRanking) => void;
  resetKey: number;
}

const BattleRace = ({ snippet, opponents, progress, setProgress, onFinish, resetKey }: BattleRaceProps) => {
  const caret = useAppStore((s) => s.caret);
  const density = useAppStore((s) => s.density);
  const raceViz = useAppStore((s) => s.raceViz);
  const me = ME;
  const total = snippet.length;

  const [bots, setBots] = useState<BotState[]>(() => opponents.map((o) => {
    const tierWpm: Record<string, number> = { master: 145, diamond: 130, platinum: 105, gold: 75, silver: 55, bronze: 40 };
    const base = tierWpm[o.tier] ?? 80;
    const jitter = (Math.random() - 0.5) * 20;
    return { ...o, targetWpm: base + jitter, progress: 0, done: false, finishMs: null };
  }));
  const [startedAt, setStartedAt] = useState<number | null>(null);
  const [myFinish, setMyFinish] = useState<TypingResult | null>(null);
  const [finishOrder, setFinishOrder] = useState<string[]>([]);

  useEffect(() => { setStartedAt(Date.now()); }, [resetKey]);

  useEffect(() => {
    if (!startedAt) return;
    const id = setInterval(() => {
      const elapsed = Date.now() - startedAt;
      setBots((prev) => prev.map((b) => {
        if (b.done) return b;
        const wpmFluc = b.targetWpm * (0.92 + 0.16 * Math.sin(elapsed / 1500 + b.hue));
        const chars = (wpmFluc * 5 / 60000) * elapsed;
        const prog = Math.min(1, chars / total);
        if (prog >= 1 && !b.done) {
          setFinishOrder((o) => o.includes(b.handle) ? o : [...o, b.handle]);
          return { ...b, progress: 1, done: true, finishMs: elapsed };
        }
        return { ...b, progress: prog };
      }));
    }, 100);
    return () => clearInterval(id);
  }, [startedAt, total]);

  const handleProgress = (p: TypingProgress) => {
    setProgress(p);
    if (p.finished && !myFinish) {
      setMyFinish(p as unknown as TypingResult);
      setFinishOrder((o) => o.includes(me.handle) ? o : [...o, me.handle]);
    }
  };

  const handleMyFinish = (r: TypingResult) => {
    setMyFinish(r);
    setFinishOrder((o) => o.includes(me.handle) ? o : [...o, me.handle]);
  };

  const allDone = bots.every((b) => b.done) && myFinish;
  useEffect(() => {
    if (allDone && myFinish) {
      const orderHandles = [...finishOrder];
      const myRankVal = (orderHandles.indexOf(me.handle) + 1) || 1;
      const delta = ratingDelta(myRankVal, bots.length + 1);
      setTimeout(() => {
        onFinish({
          myRank: myRankVal, totalPlayers: bots.length + 1, delta,
          wpm: myFinish.wpm, acc: myFinish.acc, elapsed: myFinish.elapsed,
          players: [
            { handle: me.handle, hue: me.avatarHue, tier: me.tier, you: true, wpm: myFinish.wpm, acc: myFinish.acc, finishMs: myFinish.elapsed, progress: 1 },
            ...bots.map((b) => ({ handle: b.handle, hue: b.hue, tier: b.tier, you: false, wpm: Math.round(b.targetWpm), acc: 95 + Math.random() * 4, finishMs: b.finishMs, progress: b.progress })),
          ].sort((a, b_) => { const ai = orderHandles.indexOf(a.handle); const bi = orderHandles.indexOf(b_.handle); return ai - bi; }),
        });
      }, 800);
    }
  }, [allDone]);

  const myProgress = progress.index / Math.max(1, progress.total);
  const racers: Racer[] = [
    { handle: me.handle, hue: me.avatarHue, tier: me.tier, you: true, progress: myProgress, wpm: progress.wpm, done: !!myFinish },
    ...bots.map((b) => ({ handle: b.handle, hue: b.hue, tier: b.tier, you: false, progress: b.progress, wpm: Math.round(b.targetWpm), done: b.done })),
  ];

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3">
          <span className="dt-live-dot" />
          <span className="dt-label text-dt-error">LIVE BATTLE</span>
          <span className="dt-caption">·</span>
          <span className="dt-mono dt-body-sm text-dt-text-2">{startedAt ? ((Date.now() - startedAt) / 1000).toFixed(1) : '0.0'}s</span>
        </div>
        <div className="flex items-baseline gap-6 font-dt-mono">
          <span><span className="dt-tabular text-dt-primary text-[22px] font-medium">{progress.wpm}</span> <span className="text-dt-text-2 text-xs">WPM</span></span>
          <span><span className="dt-tabular text-base">{progress.acc.toFixed(0)}</span><span className="text-dt-text-2 text-xs">%</span></span>
        </div>
      </div>
      <RaceTrack racers={racers} vizStyle={raceViz} />
      <div className="mt-6">
        <PlayEditor
          code={snippet}
          resetKey={resetKey}
          caretStyle={caret}
          fontSize={density === 'compact' ? 16 : 18}
          onProgress={handleProgress}
          onFinish={handleMyFinish}
          fileName="battle.js"
          index={progress.index}
          total={progress.total}
        />
      </div>
      {myFinish && !allDone && (
        <div className="mt-5 p-4 bg-dt-card rounded-dt-md border-[0.5px] border-dt-primary text-center text-dt-primary">
          <IconCheck size={20} className="align-middle mr-2" />
          You finished! Waiting for others to complete…
        </div>
      )}
    </div>
  );
};

const BattleResult = ({ ranking, onRematch, onLobby }: { ranking: FinalRanking; onRematch: () => void; onLobby: () => void }) => {
  const me = ME;
  if (!ranking) return null;
  const podium = ranking.players;
  const rankLabel = ['1st', '2nd', '3rd', '4th'][ranking.myRank - 1] ?? `${ranking.myRank}th`;
  return (
    <div>
      <SectionHead title="Race complete." kicker="Result" action={
        <div className="flex gap-2">
          <button className="dt-btn dt-btn-secondary" onClick={onLobby}>Back to lobby</button>
          <button className="dt-btn dt-btn-primary" onClick={onRematch}><IconRefresh size={16} /> Rematch</button>
        </div>
      } />
      <div className={`dt-card p-8 mb-5 text-center ${ranking.myRank === 1 ? 'bg-[color-mix(in_oklab,var(--dt-primary)_14%,var(--dt-card))]' : ''}`}>
        <div className={`dt-label mb-2 ${ranking.myRank === 1 ? 'text-dt-primary' : 'text-dt-text-2'}`}>You finished</div>
        <div className={`dt-mono text-[80px] font-medium leading-none ${ranking.myRank === 1 ? 'text-dt-primary' : 'text-dt-text'}`}>{rankLabel}</div>
        <div className="flex justify-center gap-8 mt-6 font-dt-mono">
          <Stat label="Your WPM" value={ranking.wpm} accent />
          <Stat label="Accuracy" value={ranking.acc.toFixed(1)} unit="%" />
          <Stat label="Time" value={(ranking.elapsed / 1000).toFixed(1)} unit="s" />
        </div>
      </div>
      <div className="dt-card p-5 mb-5 flex items-center justify-between">
        <div>
          <div className="dt-label">Rating change</div>
          <div className="flex items-baseline gap-3 mt-1">
            <span className="dt-mono dt-tabular text-2xl text-dt-text-2">{me.rating}</span>
            <IconArrowRight size={18} className="text-dt-text-3" />
            <span className={`dt-mono dt-tabular text-[32px] font-medium ${ranking.delta >= 0 ? 'text-dt-success' : 'text-dt-error'}`}>{me.rating + ranking.delta}</span>
            <span className={`dt-mono dt-tabular text-base ${ranking.delta >= 0 ? 'text-dt-success' : 'text-dt-error'}`}>({ranking.delta >= 0 ? '+' : ''}{ranking.delta})</span>
          </div>
        </div>
        <TierBadge tier={me.tier} size="lg" />
      </div>
      <div className="dt-card p-0 overflow-hidden">
        <div className="py-4 px-6 border-b-[0.5px] border-dt-border"><span className="dt-h3 m-0">Final standings</span></div>
        {podium.map((p, i) => {
          const rank = i + 1;
          const medalColor = ['text-dt-warning', 'text-dt-silver-fg', 'text-dt-bronze-fg'][i] ?? 'text-dt-text-2';
          return (
            <div key={p.handle} className={`grid grid-cols-[48px_1fr_auto_auto_auto] gap-4 py-4 px-6 items-center ${p.you ? 'bg-[color-mix(in_oklab,var(--dt-primary)_6%,transparent)]' : ''} ${i < podium.length - 1 ? 'border-b-[0.5px] border-dt-border' : ''}`}>
              <div className="flex items-center gap-1.5">
                {rank <= 3 && <IconMedal size={18} className={medalColor} />}
                <span className="dt-mono text-base font-medium">#{rank}</span>
              </div>
              <div className="flex items-center gap-3">
                <Avatar handle={p.handle} hue={p.you ? 170 : p.hue ?? 0} size={32} ring={p.you ? 'var(--dt-primary)' : undefined} />
                <span className="dt-mono text-sm">{p.handle}{p.you && <span className="text-dt-primary ml-1.5">(you)</span>}</span>
              </div>
              <TierBadge tier={p.tier} />
              <div className="flex items-baseline gap-1">
                <span className={`dt-mono dt-tabular text-lg font-medium ${rank === 1 ? 'text-dt-primary' : 'text-dt-text'}`}>{p.wpm}</span>
                <span className="dt-caption">wpm</span>
              </div>
              <span className="dt-mono dt-tabular text-[13px] text-dt-text-2">{p.acc.toFixed(1)}%</span>
            </div>
          );
        })}
      </div>
    </div>
  );
};

const Battle = () => {
  const [phase, setPhase] = useState<Phase>('lobby');
  const [opponents, setOpponents] = useState<Opponent[]>([]);
  const [snippet] = useState(CODE_SNIPPETS.javascript.medium[0]);
  const [progress, setProgress] = useState<TypingProgress>({ index: 0, wpm: 0, acc: 100, elapsed: 0, total: 1, errors: 0, finished: false });
  const [finalRanking, setFinalRanking] = useState<FinalRanking | null>(null);
  const [resetKey, setResetKey] = useState(0);
  const [countdown, setCountdown] = useState(3);

  const quickMatch = () => {
    setPhase('matching');
    setTimeout(() => {
      const picks = [...OPPONENTS].sort(() => Math.random() - 0.5).slice(0, 3);
      setOpponents(picks);
      setPhase('countdown');
      setCountdown(3);
    }, 1600);
  };

  useEffect(() => {
    if (phase !== 'countdown') return;
    if (countdown === 0) { setPhase('race'); setResetKey((k) => k + 1); return; }
    const id = setTimeout(() => setCountdown((c) => c - 1), 1000);
    return () => clearTimeout(id);
  }, [phase, countdown]);

  const onRaceFinish = (r: FinalRanking) => { setFinalRanking(r); setPhase('result'); };
  const rematch = () => { setPhase('countdown'); setCountdown(3); setFinalRanking(null); };

  return (
    <div className="dt-page">
      {phase === 'lobby'     && <BattleLobby onQuickMatch={quickMatch} />}
      {phase === 'matching'  && <Matching />}
      {phase === 'countdown' && <Countdown count={countdown} opponents={opponents} />}
      {phase === 'race'      && <BattleRace snippet={snippet} opponents={opponents} progress={progress} setProgress={setProgress} onFinish={onRaceFinish} resetKey={resetKey} />}
      {phase === 'result' && finalRanking && <BattleResult ranking={finalRanking} onRematch={rematch} onLobby={() => setPhase('lobby')} />}
    </div>
  );
};

export default Battle;
