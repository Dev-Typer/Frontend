import { useNavigate } from 'react-router-dom';
import { useT } from '@/i18n';
import { GithubMark } from '@/components/icons/Icons';

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
          <h1 className="dt-mono text-2xl font-medium tracking-tight text-[var(--dt-text)] text-center m-0 mb-7">
            {t('Sign in to devtyper')}
          </h1>

          <button className="dt-btn-github" onClick={handleSignIn}>
            <GithubMark size={18} fill="#fff" />
            <span>{t('Continue with GitHub')}</span>
          </button>

          <div className="mt-[22px]">
            <button className="dt-btn-back" onClick={() => navigate(-1)}>
              ← {t('Back')}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;
