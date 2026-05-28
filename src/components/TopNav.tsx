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
  me: User;
}

const TopNav = ({ theme, onTheme, isLoggedIn, onLogin, me }: Props) => {
  const t = useT();
  const navigate = useNavigate();
  const location = useLocation();
  const route = location.pathname.slice(1) || 'home';

  const items = [
    { id: 'home',    label: t('Home')            },
    { id: 'solo',    label: t('Solo Practice')   },
    { id: 'battle',  label: t('Battle')          },
    { id: 'daily',   label: t('Daily Challenge') },
    { id: 'ranking', label: t('Ranking')         },
  ];

  return (
    <nav className="dt-nav">
      <button onClick={() => navigate('/')} style={{ background: 'transparent', border: 0, padding: 0, cursor: 'default' }}>
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
        className="dt-nav-link"
        onClick={onTheme}
        title={t('Toggle theme')}
        style={{ width: 36, height: 36, display: 'inline-flex', alignItems: 'center', justifyContent: 'center', padding: 0 }}
      >
        {theme === 'dark' ? <IconSun size={18} /> : <IconMoon size={18} />}
      </button>
      {isLoggedIn ? (
        <button
          className="dt-nav-link"
          onClick={() => navigate('/mypage')}
          style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '4px 4px 4px 10px' }}
        >
          <span className="dt-mono" style={{ fontSize: 13 }}>{me.handle}</span>
          <Avatar handle={me.handle} hue={me.avatarHue} size={28} />
        </button>
      ) : (
        <button className="dt-btn dt-btn-primary dt-btn-sm" onClick={onLogin}>{t('Sign in')}</button>
      )}
    </nav>
  );
};

export default TopNav;
