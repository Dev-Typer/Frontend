import { useState } from 'react';
import { useAppStore } from '@/stores/appStore';
import type { Theme, Lang, RaceViz, CaretStyle, Density } from '@/types';

const TweaksPanel = () => {
  const [open, setOpen] = useState(false);
  const store = useAppStore();

  if (!open) {
    return (
      <button
        onClick={() => setOpen(true)}
        className="fixed right-4 bottom-4 z-[9999] bg-[rgba(20,22,29,0.9)] text-dt-text-2 border-[0.5px] border-dt-border rounded-lg px-3.5 py-2 text-xs font-dt-mono cursor-default backdrop-blur-md"
      >
        ⚙ Tweaks
      </button>
    );
  }

  return (
    <div className="fixed right-4 bottom-4 z-[9999] w-[280px] max-h-[calc(100vh-32px)] bg-[rgba(20,22,29,0.92)] text-dt-text border-[0.5px] border-dt-border rounded-xl backdrop-blur-2xl overflow-hidden flex flex-col font-dt-mono text-xs">
      <div className="flex items-center justify-between px-4 py-3 border-b-[0.5px] border-dt-border">
        <span className="font-semibold text-xs">Tweaks</span>
        <button onClick={() => setOpen(false)} className="bg-transparent border-0 text-dt-text-2 cursor-default text-sm py-0.5 px-1.5 rounded">✕</button>
      </div>
      <div className="px-4 pt-2 pb-4 flex flex-col gap-2.5 overflow-y-auto">
        <TwkSection label="Theme" />
        <TwkRadio
          label="Theme"
          value={store.theme}
          options={[{ value: 'dark', label: 'Dark' }, { value: 'light', label: 'Light' }]}
          onChange={(v) => store.setTheme(v as Theme)}
        />

        <TwkSection label="Auth state" />
        <TwkRadio
          label="Session"
          value={store.loggedIn ? 'in' : 'out'}
          options={[{ value: 'in', label: 'Logged in' }, { value: 'out', label: 'Logged out' }]}
          onChange={(v) => store.setLoggedIn(v === 'in')}
        />

        <TwkSection label="Language" />
        <TwkRadio
          label="UI"
          value={store.lang}
          options={[{ value: 'en', label: 'EN' }, { value: 'ko', label: '한국어' }]}
          onChange={(v) => store.setLang(v as Lang)}
        />

        <TwkSection label="Battle race" />
        <TwkSelect
          label="Visual"
          value={store.raceViz}
          options={[
            { value: 'avatars', label: 'Avatar runners on a track' },
            { value: 'bars', label: 'Horizontal progress bars' },
            { value: 'lanes', label: 'Vertical lanes' },
          ]}
          onChange={(v) => store.setRaceViz(v as RaceViz)}
        />

        <TwkSection label="Typing" />
        <TwkRadio
          label="Caret"
          value={store.caret}
          options={[{ value: 'line', label: 'Line' }, { value: 'under', label: 'Under' }, { value: 'block', label: 'Block' }]}
          onChange={(v) => store.setCaret(v as CaretStyle)}
        />
        <TwkRadio
          label="Density"
          value={store.density}
          options={[{ value: 'compact', label: 'Compact' }, { value: 'comfortable', label: 'Comfortable' }]}
          onChange={(v) => store.setDensity(v as Density)}
        />
      </div>
    </div>
  );
};

const TwkSection = ({ label }: { label: string }) => (
  <div className="text-[10px] font-semibold tracking-[0.06em] uppercase text-dt-text-3 pt-2">{label}</div>
);

const TwkSelect = ({ label, value, options, onChange }: { label: string; value: string; options: { value: string; label: string }[]; onChange: (v: string) => void }) => (
  <div className="flex flex-col gap-1">
    <span className="text-dt-text-2 text-[11px]">{label}</span>
    <select
      value={value}
      onChange={(e) => onChange(e.target.value)}
      className="bg-dt-card text-dt-text border-[0.5px] border-dt-border rounded-md py-1 px-2 text-[11px] font-[inherit] outline-none"
    >
      {options.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
    </select>
  </div>
);

const TwkRadio = ({ label, value, options, onChange }: { label: string; value: string; options: { value: string; label: string }[]; onChange: (v: string) => void }) => (
  <div className="flex flex-col gap-1">
    <span className="text-dt-text-2 text-[11px]">{label}</span>
    <div className="flex gap-1">
      {options.map((o) => (
        <button
          key={o.value}
          onClick={() => onChange(o.value)}
          className={`flex-1 py-1.5 text-[11px] border-0 rounded font-[inherit] cursor-default ${value === o.value ? 'bg-dt-primary text-[#0D0E12]' : 'bg-dt-hover text-dt-text-2'}`}
        >
          {o.label}
        </button>
      ))}
    </div>
  </div>
);

export default TweaksPanel;
