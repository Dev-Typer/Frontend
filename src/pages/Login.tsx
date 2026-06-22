import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useT } from '@/i18n';
import { GithubMark } from '@/components/icons/Icons';

type AuthPhase = 'intro' | 'redirecting' | 'authorizing';

const Spinner = () => (
  <div className="w-7 h-7 mx-auto rounded-full border-2 border-dt-border"
    style={{ borderTopColor: 'var(--dt-primary)', animation: 'dt-spin 0.9s linear infinite' }} />
);

const PermRow = ({ label, muted }: { label: string; muted?: boolean }) => (
  <div className="flex items-center gap-2 text-[12.5px]"
    style={{ color: muted ? 'var(--dt-text-3)' : 'var(--dt-text-2)' }}>
    <span className="w-[14px] h-[14px] rounded-[3px] inline-flex items-center justify-center text-[9px] font-bold shrink-0"
      style={{
        background: muted ? 'transparent' : 'rgba(80,250,123,0.18)',
        boxShadow: muted ? 'inset 0 0 0 1px var(--dt-border)' : 'inset 0 0 0 1px rgba(80,250,123,0.4)',
        color: muted ? 'var(--dt-text-3)' : 'var(--dt-primary)',
      }}>
      {muted ? '×' : '✓'}
    </span>
    <span>{label}</span>
  </div>
);

function LoginIntro({ onStart, onBack }: { onStart: () => void; onBack: () => void }) {
  const t = useT();
  return (
    <>
      <div className="text-center mb-7">
        <h1 className="m-0 dt-mono text-[24px] font-medium tracking-[-0.01em] text-dt-text">
          {t('Sign in to devtyper')}
        </h1>
        <p className="m-0 mt-[10px] text-[13.5px] leading-[1.6] text-dt-text-2">
          {t('Sign in with GitHub to save records and enter rated battles.')}
        </p>
      </div>

      {/* GitHub CTA */}
      <button
        onClick={onStart}
        className="flex items-center justify-center gap-[10px] w-full text-white font-medium font-dt-mono text-[14px] px-[18px] py-[14px] rounded-[6px] border-0 cursor-default transition-[transform,filter] duration-[120ms] ease-out"
        style={{
          background: '#24292F',
          boxShadow: 'inset 0 1px 0 rgba(255,255,255,0.10), 0 1px 0 rgba(0,0,0,0.5), 0 8px 20px -8px rgba(0,0,0,0.6)',
        }}
        onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-1px)'; e.currentTarget.style.filter = 'brightness(1.12)'; }}
        onMouseLeave={e => { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.filter = 'brightness(1)'; }}
      >
        <GithubMark size={18} fill="#fff" />
        <span>{t('Continue with GitHub')}</span>
      </button>

      {/* Permissions list */}
      <div className="mt-6 px-4 py-[14px] rounded-[6px] flex flex-col gap-2"
        style={{ background: 'rgba(255,255,255,0.02)', boxShadow: 'inset 0 0 0 1px var(--dt-border)' }}>
        <div className="text-[10.5px] tracking-[0.1em] uppercase text-dt-text-3 mb-[10px]">
          {t('Requested permissions')}
        </div>
        <PermRow label={t('Read your public profile')} />
        <PermRow label={t('Read your email address')} />
        <PermRow label={t('No write access to your repos')} muted />
      </div>

      <div className="flex justify-between mt-[22px]">
        <button
          onClick={onBack}
          className="bg-transparent border-0 px-[10px] py-[6px] text-dt-text-3 cursor-default text-[12.5px] font-dt-mono"
        >
          ← {t('Back')}
        </button>
        <span className="text-[12px] text-dt-text-3">{t('No password. No email signup.')}</span>
      </div>
    </>
  );
}

function LoginRedirect() {
  const t = useT();
  return (
    <div className="text-center py-6">
      <Spinner />
      <div className="mt-5 text-[14px] text-dt-text">{t('Redirecting to GitHub…')}</div>
      <div className="mt-[6px] text-[12px] text-dt-text-3">github.com/login/oauth/authorize</div>
    </div>
  );
}

function LoginAuthorizing() {
  const t = useT();
  return (
    <div className="text-center py-6">
      <div className="inline-flex items-center justify-center gap-[14px] mb-4">
        <GithubMark size={32} fill="var(--dt-text)" />
        <span className="text-dt-text-3 text-[18px]">→</span>
        <img src="/assets/logo.png" alt="" className="w-10 h-10 block -my-2" />
      </div>
      <Spinner />
      <div className="mt-5 text-[14px] text-dt-text">{t('Authorizing…')}</div>
      <div className="mt-[6px] text-[12px] text-dt-text-3">{t('Setting up your profile')}</div>
    </div>
  );
}

const Login = () => {
  const navigate = useNavigate();
  const [phase, setPhase] = useState<AuthPhase>('intro');

  const startAuth = () => {
    setPhase('redirecting');
    setTimeout(() => setPhase('authorizing'), 700);
    // Real redirect
    setTimeout(() => {
      window.location.href = `${import.meta.env.VITE_API_BASE_URL}/api/auth/github`;
    }, 1800);
  };

  return (
    <div className="min-h-screen bg-dt-bg text-dt-text font-dt-mono grid place-items-center p-8 relative overflow-hidden">
      {/* Background dot grid */}
      <div className="absolute inset-0 pointer-events-none"
        style={{
          backgroundImage: 'radial-gradient(circle, rgba(80,250,123,0.04) 1px, transparent 1px)',
          backgroundSize: '24px 24px',
          maskImage: 'radial-gradient(ellipse at center, black 0%, transparent 75%)',
          WebkitMaskImage: 'radial-gradient(ellipse at center, black 0%, transparent 75%)',
        }} />

      <div className="w-full max-w-[480px] relative">
        {/* Logo */}
        <div className="flex items-center gap-[14px] justify-center mb-8">
          <img src="/assets/logo.png" alt="" className="block w-14 h-14 -my-3" />
          <div className="font-dt-mono text-[22px] font-medium tracking-[-0.02em] text-dt-text">devtyper</div>
        </div>

        {/* Card */}
        <div className="bg-dt-card rounded-[8px] px-9 pt-10 pb-8"
          style={{ boxShadow: 'inset 0 1px 0 rgba(255,255,255,0.04), 0 0 0 1px var(--dt-border), 0 1px 0 rgba(0,0,0,0.4), 0 24px 64px -32px rgba(0,0,0,0.8)' }}>
          {phase === 'intro'       && <LoginIntro onStart={startAuth} onBack={() => navigate(-1)} />}
          {phase === 'redirecting' && <LoginRedirect />}
          {phase === 'authorizing' && <LoginAuthorizing />}
        </div>

        {/* Footer */}
        <div className="mt-6 text-center text-[11.5px] text-dt-text-3">
          <span>devtyper v0.1 · </span>
          <span className="text-dt-text-2">OAuth via github.com</span>
        </div>
      </div>
    </div>
  );
};

export default Login;
