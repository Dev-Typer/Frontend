import { useNavigate } from 'react-router-dom';
import { useT } from '@/i18n';
import { GithubMark } from '@/components/icons/Icons';

interface PermRowProps {
  label: string;
  granted?: boolean;
}

const PermRow = ({ label, granted = true }: PermRowProps) => (
  <div className={`flex items-center gap-2 text-[12.5px] ${granted ? 'text-[var(--dt-text-2)]' : 'text-[var(--dt-text-3)]'}`}>
    <span className={`dt-perm-badge ${granted ? 'dt-perm-badge--grant' : 'dt-perm-badge--deny'}`}>
      {granted ? '✓' : '×'}
    </span>
    <span>{label}</span>
  </div>
);

const Login = () => {
  const t = useT();
  const navigate = useNavigate();

  const handleSignIn = () => {
    window.location.href = `${import.meta.env.VITE_API_BASE_URL}/api/auth/github`;
  };

  return (
    <div className="dt-login-bg">
      <div className="dt-login-grid" aria-hidden="true" />

      <div className="w-full max-w-[480px] relative">
        <div className="flex items-center justify-center gap-3.5 mb-8">
          <img src="/assets/logo.png" alt="DevTyper" className="block w-14 h-14 -my-3" />
          <span className="dt-mono text-[22px] font-medium tracking-tight text-[var(--dt-text)]">
            devtyper
          </span>
        </div>

        <div className="dt-login-card">
          <div className="text-center mb-7">
            <h1 className="dt-mono text-2xl font-medium tracking-tight text-[var(--dt-text)] m-0">
              {t('Sign in to devtyper')}
            </h1>
            <p className="text-[13.5px] leading-relaxed text-[var(--dt-text-2)] mt-2.5 mb-0">
              {t('Sign in with GitHub to save records and enter rated battles.')}
            </p>
          </div>

          <button className="dt-btn-github" onClick={handleSignIn}>
            <GithubMark size={18} fill="#fff" />
            <span>{t('Continue with GitHub')}</span>
          </button>

          <div className="dt-perm-list">
            <p className="text-[10.5px] tracking-widest uppercase text-[var(--dt-text-3)] mb-2.5 mt-0">
              {t('Requested permissions')}
            </p>
            <div className="flex flex-col gap-2">
              <PermRow label={t('Read your public profile')} granted />
              <PermRow label={t('Read your email address')} granted />
              <PermRow label={t('No write access to your repos')} granted={false} />
            </div>
          </div>

          <div className="flex justify-between items-center mt-[22px]">
            <button className="dt-btn-back" onClick={() => navigate(-1)}>
              ← {t('Back')}
            </button>
            <span className="text-xs text-[var(--dt-text-3)]">
              {t('No password. No email signup.')}
            </span>
          </div>
        </div>

        <p className="mt-6 text-center text-[11.5px] text-[var(--dt-text-3)]">
          devtyper v0.1 ·{' '}
          <span className="text-[var(--dt-text-2)]">OAuth via github.com</span>
        </p>
      </div>
    </div>
  );
};

export default Login;
