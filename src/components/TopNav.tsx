import { useNavigate, useLocation } from 'react-router-dom';
import { useT } from '@/i18n';
import Logo from './Logo';
import Avatar from './Avatar';
import { IconSun, IconMoon } from './icons/Icons';
import type { User } from '@/types';

interface Props {
  theme: string;
  onTheme: () => void;
  isLoggedIn: boolean;
  onLogin: () => void;
  onLogout: () => void;
  me: User;
}

const TopNav = ({ theme, onTheme, isLoggedIn, onLogin, onLogout, me }: Props) => {
  const t = useT();
  const navigate = useNavigate();
  const location = useLocation();
  const route = location.pathname.slice(1) || 'home';

  const items = [
    { id: 'home',    label: t('Home')            },
    { id: 'solo',    label: t('Solo Practice')   },
    { id: 'battle',  label: t('Battle')          },
    { id: 'daily',   label: t('Daily Challenge') },
    { id: 'ranking',  label: t('Ranking')         },
    { id: 'snippets', label: t('Snippets')        },
  ];

  return (
    <nav className="dt-nav">
      <button onClick={() => navigate('/')} className="bg-transparent border-0 p-0 cursor-default">
        <Logo />
      </button>
      <div className="dt-nav-links">
        {items.map((it) => (
          <button
            key={it.id}
            className={`dt-nav-link${route === it.id ? ' active' : ''}`}
            onClick={() => navigate(it.id === 'home' ? '/' : `/${it.id}`)}
          >
            {it.label}
          </button>
        ))}
      </div>
      <button
        className="dt-nav-link w-9 h-9 inline-flex items-center justify-center p-0"
        onClick={onTheme}
        title={t('Toggle theme')}
      >
        {theme === 'dark' ? <IconSun size={18} /> : <IconMoon size={18} />}
      </button>
      {isLoggedIn ? (
        <div className="flex items-center gap-1">
          <button
            className="dt-nav-link flex items-center gap-2 py-1 pr-1 pl-2.5"
            onClick={() => navigate('/mypage')}
          >
            <span className="dt-mono text-[13px]">{me.handle}</span>
            <Avatar handle={me.handle} hue={me.avatarHue} size={28} />
          </button>
          <button
            className="dt-nav-link text-[13px] py-1 px-2"
            onClick={onLogout}
            title={t('Sign out')}
          >↩</button>
        </div>
      ) : (
        <button className="dt-btn dt-btn-primary dt-btn-sm" onClick={onLogin}>{t('Sign in')}</button>
      )}
    </nav>
  );
};

export default TopNav;
