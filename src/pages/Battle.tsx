import { useState, useEffect } from 'react';
import { useT } from '@/i18n';
import { useAppStore } from '@/stores/appStore';
import { CODE_SNIPPETS, OPPONENTS, RECENT_BATTLES, ME } from '@/data';
import SectionHead from '@/components/SectionHead';
import Avatar from '@/components/Avatar';
import TierBadge from '@/components/TierBadge';
import TypingEngine from '@/components/TypingEngine';
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

const BattleLobby = ({ onQuickMatch }: { onQuickMatch: () => void }) => {
  const t = useT();
  const [roomCode, setRoomCode] = useState('');
  return (
    <div>
      <SectionHead kicker="Battle" title="Race developers at your level." />
      <div style={{ display: 'grid', gridTemplateColumns: '1.4fr 1fr', gap: 20 }}>
        <div className="dt-card" style={{ padding: 32 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 20 }}>
            <IconBolt size={22} style={{ color: 'var(--dt-primary)' }} />
            <h3 className="dt-h2" style={{ margin: 0 }}>{t('Quick match')}</h3>
            <span className="dt-chip" style={{ marginLeft: 'auto' }}>{t('~8s queue')}</span>
          </div>
          <p className="dt-body-sm" style={{ color: 'var(--dt-text-2)', margin: '0 0 24px 0' }}>
            {t("We'll pair you with 1–3 developers within ±150 rating of you. Same snippet, same start, first to finish wins.")}
          </p>
          <button className="dt-btn dt-btn-primary dt-btn-lg" onClick={onQuickMatch} style={{ width: '100%' }}>
            <IconSwords size={18} /> {t('Find a match')}
          </button>
          <div className="dt-divider" style={{ margin: '24px 0' }} />
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <div className="dt-body-sm" style={{ color: 'var(--dt-text-2)' }}>{t('Matching pool')}</div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
              <span className="dt-live-dot" />
              <span className="dt-mono" style={{ fontSize: 13 }}>37 {t('in queue')}</span>
            </div>
          </div>
        </div>
        <div className="dt-card" style={{ padding: 28 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 16 }}>
            <IconUsers size={20} style={{ color: 'var(--dt-text-2)' }} />
            <h3 className="dt-h3" style={{ margin: 0 }}>{t('Play with friends')}</h3>
          </div>
          <p className="dt-body-sm" style={{ color: 'var(--dt-text-2)', margin: '0 0 20px 0' }}>{t('Create a room and share the code, or join one.')}</p>
          <button className="dt-btn dt-btn-secondary" style={{ width: '100%', marginBottom: 8 }}>{t('Create a room')}</button>
          <div style={{ display: 'flex', gap: 8 }}>
            <input className="dt-input dt-mono" placeholder="DT-XXXXXX" value={roomCode} onChange={(e) => setRoomCode(e.target.value.toUpperCase())} style={{ flex: 1 }} />
            <button className="dt-btn dt-btn-secondary">{t('Join')}</button>
          </div>
        </div>
      </div>
      <div style={{ marginTop: 32 }}>
        <SectionHead title="Your recent battles" />
        <div className="dt-card" style={{ padding: 0, overflow: 'hidden' }}>
          {RECENT_BATTLES.slice(0, 5).map((b, i, arr) => (
            <div key={b.id} style={{ display: 'grid', gridTemplateColumns: '64px 1.6fr 1fr 100px 80px 80px', padding: '14px 24px', alignItems: 'center', gap: 16, borderBottom: i < arr.length - 1 ? '0.5px solid var(--dt-border)' : '0' }}>
              <span className="dt-caption">{b.when}</span>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                {b.opponents.map((o, oi) => (
                  <div key={o} style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                    <Avatar handle={o} hue={(o.charCodeAt(0) * 7) % 360} size={22} />
                    <span className="dt-mono dt-body-sm">{o}</span>
                    {oi < b.opponents.length - 1 && <span style={{ color: 'var(--dt-text-3)' }}>·</span>}
                  </div>
                ))}
              </div>
              <span className="dt-chip">{b.lang}</span>
              <span className="dt-mono dt-body-sm" style={{ color: 'var(--dt-text-2)' }}>{b.myWpm} wpm</span>
              <span className="dt-mono" style={{ color: b.myRank === 1 ? 'var(--dt-warning)' : 'var(--dt-text)', fontWeight: 500, fontSize: 14 }}>#{b.myRank}</span>
              <span className="dt-mono dt-tabular" style={{ fontSize: 14, color: b.delta >= 0 ? 'var(--dt-success)' : 'var(--dt-error)' }}>{b.delta >= 0 ? '+' : ''}{b.delta}</span>
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
    <div style={{ minHeight: 'calc(100vh - 200px)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexDirection: 'column' }}>
      <div style={{ position: 'relative', width: 120, height: 120, marginBottom: 32 }}>
        <div style={{ position: 'absolute', inset: 0, borderRadius: '50%', border: '2px solid var(--dt-border)', borderTopColor: 'var(--dt-primary)', animation: 'dt-spin 1.2s linear infinite' }} />
        <div style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <IconSwords size={40} style={{ color: 'var(--dt-primary)' }} />
        </div>
      </div>
      <h2 className="dt-h1" style={{ margin: 0, marginBottom: 8 }}>{t('Finding opponents…')}</h2>
      <p className="dt-body" style={{ color: 'var(--dt-text-2)', margin: 0 }}>{t('Looking for developers within ±150 rating')}</p>
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
      <div className="dt-card" style={{ padding: 0, overflow: 'hidden' }}>
        <div style={{ display: 'flex' }}>
          {all.map((p, i) => (
            <div key={i} style={{ flex: 1, padding: '24px 20px', borderRight: i < all.length - 1 ? '0.5px solid var(--dt-border)' : '0', display: 'flex', alignItems: 'center', gap: 14, background: 'you' in p && p.you ? 'color-mix(in oklab, var(--dt-primary) 6%, transparent)' : 'transparent' }}>
              <Avatar handle={p.handle} hue={'you' in p && p.you ? me.avatarHue : (p as Opponent).hue} size={44} ring={'you' in p && p.you ? 'var(--dt-primary)' : undefined} />
              <div className="dt-stack" style={{ gap: 2, minWidth: 0 }}>
                <span className="dt-mono" style={{ fontSize: 14, fontWeight: 500 }}>{p.handle}{'you' in p && p.you && <span style={{ color: 'var(--dt-primary)', marginLeft: 6 }}>(you)</span>}</span>
                <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                  <TierBadge tier={p.tier} />
                  <span className="dt-caption dt-mono">{p.rating}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
        <div style={{ padding: 64, textAlign: 'center', background: 'var(--dt-type-bg)', borderTop: '0.5px solid var(--dt-border)' }}>
          <div key={count} className="dt-mono" style={{ fontSize: 140, lineHeight: 1, fontWeight: 500, color: count === 0 ? 'var(--dt-primary)' : 'var(--dt-text)', animation: 'dt-pop 600ms ease-out' }}>
            {count === 0 ? t('GO') : count}
          </div>
        </div>
      </div>
    </div>
  );
};

const RaceAvatars = ({ racers }: { racers: Racer[] }) => (
  <div className="dt-card" style={{ padding: 0, overflow: 'hidden' }}>
    <div style={{ display: 'flex', justifyContent: 'space-between', padding: '10px 24px 10px 100px', borderBottom: '0.5px solid var(--dt-border)', color: 'var(--dt-text-3)', fontSize: 11, fontFamily: 'var(--dt-font-mono)', letterSpacing: '0.08em' }}>
      <span>START</span><span>25%</span><span>50%</span><span>75%</span>
      <span style={{ color: 'var(--dt-primary)' }}>FINISH</span>
    </div>
    <div style={{ position: 'relative', padding: '12px 24px' }}>
      {[0.25, 0.5, 0.75].map((t) => (
        <div key={t} style={{ position: 'absolute', top: 0, bottom: 0, left: `calc(100px + (100% - 124px) * ${t})`, width: 1, background: 'var(--dt-border)', opacity: 0.5 }} />
      ))}
      <div style={{ position: 'absolute', top: 0, bottom: 0, right: 'calc(80px + 24px)', width: 2, background: 'repeating-linear-gradient(180deg, var(--dt-primary) 0, var(--dt-primary) 6px, transparent 6px, transparent 12px)' }} />
      {racers.map((r) => {
        const pct = r.progress * 100;
        return (
          <div key={r.handle} style={{ display: 'grid', gridTemplateColumns: '92px 1fr 80px', alignItems: 'center', gap: 0, padding: '8px 0', position: 'relative' }}>
            <div className="dt-stack" style={{ gap: 2, minWidth: 0, paddingRight: 8 }}>
              <span className="dt-mono" style={{ fontSize: 12, fontWeight: r.you ? 500 : 400, color: r.you ? 'var(--dt-primary)' : 'var(--dt-text)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                {r.handle}{r.you ? ' ★' : ''}
              </span>
              <span className="dt-caption dt-mono" style={{ fontSize: 10 }}>{r.wpm} wpm</span>
            </div>
            <div style={{ position: 'relative', height: 36 }}>
              <div style={{ position: 'absolute', top: '50%', transform: 'translateY(-50%)', left: 14, height: 2, width: `calc(${pct}% - 14px)`, background: r.you ? 'var(--dt-primary)' : `oklch(78% 0.14 ${r.hue})`, opacity: 0.4, borderRadius: 999, transition: 'width 200ms linear' }} />
              <div style={{ position: 'absolute', top: '50%', transform: 'translateY(-50%)', left: 14, right: 0, height: 1, background: 'repeating-linear-gradient(90deg, var(--dt-border) 0, var(--dt-border) 3px, transparent 3px, transparent 8px)', opacity: 0.5 }} />
              <div style={{ position: 'absolute', top: '50%', left: `calc(${pct}% * 0.93)`, transform: 'translate(0, -50%)', transition: 'left 200ms linear', zIndex: 2 }}>
                <Avatar handle={r.handle} hue={r.you ? 170 : r.hue} size={32} ring={r.you ? 'var(--dt-primary)' : undefined} />
                {r.done && <div style={{ position: 'absolute', top: -4, right: -4, width: 14, height: 14, borderRadius: '50%', background: 'var(--dt-success)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#001A14' }}><IconCheck size={10} strokeWidth={3} /></div>}
              </div>
            </div>
            <div style={{ textAlign: 'right' }}>
              <span className="dt-mono dt-tabular" style={{ fontSize: 13, color: r.done ? 'var(--dt-success)' : 'var(--dt-text-2)' }}>{Math.round(pct)}%</span>
            </div>
          </div>
        );
      })}
    </div>
  </div>
);

const RaceBars = ({ racers }: { racers: Racer[] }) => (
  <div className="dt-card" style={{ padding: 24 }}>
    <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
      {racers.map((r) => (
        <div key={r.handle}>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <Avatar handle={r.handle} hue={r.you ? 170 : r.hue} size={22} />
              <span className="dt-mono" style={{ fontSize: 13, color: r.you ? 'var(--dt-primary)' : 'var(--dt-text)' }}>{r.handle}{r.you && ' ★'}</span>
            </div>
            <span className="dt-mono dt-tabular" style={{ fontSize: 13 }}>{r.wpm} wpm · {Math.round(r.progress * 100)}%</span>
          </div>
          <div style={{ height: 8, background: 'var(--dt-hover)', borderRadius: 999, overflow: 'hidden' }}>
            <div style={{ width: `${r.progress * 100}%`, height: '100%', background: r.you ? 'var(--dt-primary)' : `oklch(78% 0.14 ${r.hue})`, borderRadius: 999, transition: 'width 200ms linear' }} />
          </div>
        </div>
      ))}
    </div>
  </div>
);

const RaceLanes = ({ racers }: { racers: Racer[] }) => (
  <div className="dt-card" style={{ padding: 0, overflow: 'hidden' }}>
    <div style={{ display: 'grid', gridTemplateColumns: `repeat(${racers.length}, 1fr)`, height: 220 }}>
      {racers.map((r, i) => (
        <div key={r.handle} style={{ borderRight: i < racers.length - 1 ? '0.5px solid var(--dt-border)' : '0', position: 'relative', padding: 16, display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
          <div style={{ marginBottom: 12 }}><Avatar handle={r.handle} hue={r.you ? 170 : r.hue} size={36} ring={r.you ? 'var(--dt-primary)' : undefined} /></div>
          <span className="dt-mono" style={{ fontSize: 12, color: r.you ? 'var(--dt-primary)' : 'var(--dt-text)' }}>{r.handle}</span>
          <span className="dt-caption dt-mono" style={{ marginBottom: 12 }}>{r.wpm} wpm</span>
          <div style={{ flex: 1, width: 12, background: 'var(--dt-hover)', borderRadius: 999, overflow: 'hidden', position: 'relative' }}>
            <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, height: `${r.progress * 100}%`, background: r.you ? 'var(--dt-primary)' : `oklch(78% 0.14 ${r.hue})`, transition: 'height 200ms linear' }} />
          </div>
          <span className="dt-mono dt-tabular" style={{ marginTop: 8, fontSize: 13 }}>{Math.round(r.progress * 100)}%</span>
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
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <span className="dt-live-dot" />
          <span className="dt-label" style={{ color: 'var(--dt-error)' }}>LIVE BATTLE</span>
          <span className="dt-caption">·</span>
          <span className="dt-mono dt-body-sm" style={{ color: 'var(--dt-text-2)' }}>{startedAt ? ((Date.now() - startedAt) / 1000).toFixed(1) : '0.0'}s</span>
        </div>
        <div style={{ display: 'flex', alignItems: 'baseline', gap: 24, fontFamily: 'var(--dt-font-mono)' }}>
          <span><span style={{ color: 'var(--dt-primary)', fontSize: 22, fontWeight: 500 }} className="dt-tabular">{progress.wpm}</span> <span style={{ color: 'var(--dt-text-2)', fontSize: 12 }}>WPM</span></span>
          <span><span style={{ fontSize: 16 }} className="dt-tabular">{progress.acc.toFixed(0)}</span><span style={{ color: 'var(--dt-text-2)', fontSize: 12 }}>%</span></span>
        </div>
      </div>
      <RaceTrack racers={racers} vizStyle={raceViz} />
      <div style={{ marginTop: 24 }}>
        <TypingEngine code={snippet} resetKey={resetKey} caretStyle={caret} fontSize={density === 'compact' ? 16 : 18} onProgress={handleProgress} onFinish={handleMyFinish} />
      </div>
      {myFinish && !allDone && (
        <div style={{ marginTop: 20, padding: 16, background: 'var(--dt-card)', borderRadius: 'var(--dt-radius-md)', border: '0.5px solid var(--dt-primary)', textAlign: 'center', color: 'var(--dt-primary)' }}>
          <IconCheck size={20} style={{ verticalAlign: 'middle', marginRight: 8 }} />
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
        <div style={{ display: 'flex', gap: 8 }}>
          <button className="dt-btn dt-btn-secondary" onClick={onLobby}>Back to lobby</button>
          <button className="dt-btn dt-btn-primary" onClick={onRematch}><IconRefresh size={16} /> Rematch</button>
        </div>
      } />
      <div className="dt-card" style={{ padding: 32, marginBottom: 20, textAlign: 'center', background: ranking.myRank === 1 ? 'color-mix(in oklab, var(--dt-primary) 14%, var(--dt-card))' : 'var(--dt-card)' }}>
        <div className="dt-label" style={{ color: ranking.myRank === 1 ? 'var(--dt-primary)' : 'var(--dt-text-2)', marginBottom: 8 }}>You finished</div>
        <div className="dt-mono" style={{ fontSize: 80, fontWeight: 500, lineHeight: 1, color: ranking.myRank === 1 ? 'var(--dt-primary)' : 'var(--dt-text)' }}>{rankLabel}</div>
        <div style={{ display: 'flex', justifyContent: 'center', gap: 32, marginTop: 24, fontFamily: 'var(--dt-font-mono)' }}>
          <Stat label="Your WPM" value={ranking.wpm} accent />
          <Stat label="Accuracy" value={ranking.acc.toFixed(1)} unit="%" />
          <Stat label="Time" value={(ranking.elapsed / 1000).toFixed(1)} unit="s" />
        </div>
      </div>
      <div className="dt-card" style={{ padding: 20, marginBottom: 20, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div>
          <div className="dt-label">Rating change</div>
          <div style={{ display: 'flex', alignItems: 'baseline', gap: 12, marginTop: 4 }}>
            <span className="dt-mono dt-tabular" style={{ fontSize: 24, color: 'var(--dt-text-2)' }}>{me.rating}</span>
            <IconArrowRight size={18} style={{ color: 'var(--dt-text-3)' }} />
            <span className="dt-mono dt-tabular" style={{ fontSize: 32, fontWeight: 500, color: ranking.delta >= 0 ? 'var(--dt-success)' : 'var(--dt-error)' }}>{me.rating + ranking.delta}</span>
            <span className="dt-mono dt-tabular" style={{ fontSize: 16, color: ranking.delta >= 0 ? 'var(--dt-success)' : 'var(--dt-error)' }}>({ranking.delta >= 0 ? '+' : ''}{ranking.delta})</span>
          </div>
        </div>
        <TierBadge tier={me.tier} size="lg" />
      </div>
      <div className="dt-card" style={{ padding: 0, overflow: 'hidden' }}>
        <div style={{ padding: '16px 24px', borderBottom: '0.5px solid var(--dt-border)' }}><span className="dt-h3" style={{ margin: 0 }}>Final standings</span></div>
        {podium.map((p, i) => {
          const rank = i + 1;
          const medalColor = ['var(--dt-warning)', 'var(--dt-silver-fg)', 'var(--dt-bronze-fg)'][i] ?? 'var(--dt-text-2)';
          return (
            <div key={p.handle} style={{ display: 'grid', gridTemplateColumns: '48px 1fr auto auto auto', gap: 16, padding: '16px 24px', alignItems: 'center', background: p.you ? 'color-mix(in oklab, var(--dt-primary) 6%, transparent)' : 'transparent', borderBottom: i < podium.length - 1 ? '0.5px solid var(--dt-border)' : '0' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                {rank <= 3 && <IconMedal size={18} style={{ color: medalColor }} />}
                <span className="dt-mono" style={{ fontSize: 16, fontWeight: 500 }}>#{rank}</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                <Avatar handle={p.handle} hue={p.you ? 170 : p.hue ?? 0} size={32} ring={p.you ? 'var(--dt-primary)' : undefined} />
                <span className="dt-mono" style={{ fontSize: 14 }}>{p.handle}{p.you && <span style={{ color: 'var(--dt-primary)', marginLeft: 6 }}>(you)</span>}</span>
              </div>
              <TierBadge tier={p.tier} />
              <div style={{ display: 'flex', alignItems: 'baseline', gap: 4 }}>
                <span className="dt-mono dt-tabular" style={{ fontSize: 18, fontWeight: 500, color: rank === 1 ? 'var(--dt-primary)' : 'var(--dt-text)' }}>{p.wpm}</span>
                <span className="dt-caption">wpm</span>
              </div>
              <span className="dt-mono dt-tabular" style={{ fontSize: 13, color: 'var(--dt-text-2)' }}>{p.acc.toFixed(1)}%</span>
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
