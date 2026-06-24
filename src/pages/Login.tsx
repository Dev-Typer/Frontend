import { useNavigate } from 'react-router-dom';
import { useT } from '@/i18n';
import { GithubMark } from '@/components/icons/Icons';

const Login = () => {
  const navigate = useNavigate();
  const t = useT();

  const handleGithubLogin = () => {
    window.location.href = `${import.meta.env.VITE_API_BASE_URL}/api/auth/github`;
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

          <div className="text-center mb-7">
            <h1 className="m-0 dt-mono text-[24px] font-medium tracking-[-0.01em] text-dt-text">
              {t('Sign in to devtyper')}
            </h1>
            <p className="m-0 mt-[10px] text-[13.5px] leading-[1.6] text-dt-text-2">
              {t('Sign in with GitHub to save records and enter rated battles.')}
            </p>
          </div>

          <button
            onClick={handleGithubLogin}
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

          <div className="flex justify-between mt-[22px]">
            <button
              onClick={() => navigate(-1)}
              className="bg-transparent border-0 px-[10px] py-[6px] text-dt-text-3 cursor-default text-[12.5px] font-dt-mono"
            >
              ← {t('Back')}
            </button>
            <span className="text-[12px] text-dt-text-3">{t('No password. No email signup.')}</span>
          </div>
        </div>

        <div className="mt-6 text-center text-[11.5px] text-dt-text-3">
          <span>devtyper v0.1 · </span>
          <span className="text-dt-text-2">OAuth via github.com</span>
        </div>
      </div>
    </div>
  );
};

export default Login;
