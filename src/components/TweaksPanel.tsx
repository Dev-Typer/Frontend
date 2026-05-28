import { useState } from 'react';
import { useAppStore } from '@/stores/appStore';
import type { Design, Theme, Lang, RaceViz, CaretStyle, Density } from '@/types';

const TweaksPanel = () => {
  const [open, setOpen] = useState(false);
  const store = useAppStore();

  if (!open) {
    return (
      <button
        onClick={() => setOpen(true)}
        style={{
          position: 'fixed', right: 16, bottom: 16, zIndex: 9999,
          background: 'rgba(20,22,29,0.9)', color: 'var(--dt-text-2)',
          border: '0.5px solid var(--dt-border)', borderRadius: 8,
          padding: '8px 14px', fontSize: 12, fontFamily: 'var(--dt-font-mono)',
          cursor: 'default', backdropFilter: 'blur(12px)',
        }}
      >
        ⚙ Tweaks
      </button>
    );
  }

  return (
    <div style={{
      position: 'fixed', right: 16, bottom: 16, zIndex: 9999,
      width: 280, maxHeight: 'calc(100vh - 32px)',
      background: 'rgba(20,22,29,0.92)', color: 'var(--dt-text)',
      border: '0.5px solid var(--dt-border)', borderRadius: 12,
      backdropFilter: 'blur(24px)', overflow: 'hidden',
      display: 'flex', flexDirection: 'column',
      fontFamily: 'var(--dt-font-mono)', fontSize: 12,
    }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '12px 16px', borderBottom: '0.5px solid var(--dt-border)' }}>
        <span style={{ fontWeight: 600, fontSize: 12 }}>Tweaks</span>
        <button onClick={() => setOpen(false)} style={{ background: 'transparent', border: 0, color: 'var(--dt-text-2)', cursor: 'default', fontSize: 14, padding: '2px 6px', borderRadius: 4 }}>✕</button>
      </div>
      <div style={{ padding: '8px 16px 16px', display: 'flex', flexDirection: 'column', gap: 10, overflowY: 'auto' }}>
        <TwkSection label="Design system" />
        <TwkSelect
          label="Style"
          value={store.design}
          options={[
            { value: 'editor', label: 'Editor (custom)' },
            { value: 'bold', label: 'Bold' },
            { value: 'corporate', label: 'Corporate' },
            { value: 'contemporary', label: 'Contemporary' },
          ]}
          onChange={(v) => store.setDesign(v as Design)}
        />
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
  <div style={{ fontSize: 10, fontWeight: 600, letterSpacing: '0.06em', textTransform: 'uppercase', color: 'var(--dt-text-3)', paddingTop: 8 }}>{label}</div>
);

const TwkSelect = ({ label, value, options, onChange }: { label: string; value: string; options: { value: string; label: string }[]; onChange: (v: string) => void }) => (
  <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
    <span style={{ color: 'var(--dt-text-2)', fontSize: 11 }}>{label}</span>
    <select
      value={value}
      onChange={(e) => onChange(e.target.value)}
      style={{ background: 'var(--dt-card)', color: 'var(--dt-text)', border: '0.5px solid var(--dt-border)', borderRadius: 6, padding: '5px 8px', fontSize: 11, fontFamily: 'inherit', outline: 'none' }}
    >
      {options.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
    </select>
  </div>
);

const TwkRadio = ({ label, value, options, onChange }: { label: string; value: string; options: { value: string; label: string }[]; onChange: (v: string) => void }) => (
  <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
    <span style={{ color: 'var(--dt-text-2)', fontSize: 11 }}>{label}</span>
    <div style={{ display: 'flex', gap: 4 }}>
      {options.map((o) => (
        <button
          key={o.value}
          onClick={() => onChange(o.value)}
          style={{
            flex: 1, padding: '5px 0', fontSize: 11,
            background: value === o.value ? 'var(--dt-primary)' : 'var(--dt-hover)',
            color: value === o.value ? '#0D0E12' : 'var(--dt-text-2)',
            border: 0, borderRadius: 5, cursor: 'default', fontFamily: 'inherit',
          }}
        >
          {o.label}
        </button>
      ))}
    </div>
  </div>
);

export default TweaksPanel;
