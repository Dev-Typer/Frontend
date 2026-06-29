import { BrowserRouter, Routes, Route, Navigate, useNavigate } from 'react-router-dom';
import { useEffect } from 'react';
import { useAppStore } from '@/stores/appStore';
import { useUserStore } from '@/stores/userStore';
import { getMe, logout, refreshToken, exchangeCode } from '@/apis/authApi';
import { getUserMe } from '@/apis/userApi';
import { LangContext } from '@/i18n';
import ContemporaryShell from '@/pages/ContemporaryShell';
import HomeContemporary from '@/pages/Home/HomeContemporary';
import Solo from '@/pages/Solo';
import Battle from '@/pages/Battle';
import Daily from '@/pages/Daily';
import Ranking from '@/pages/Ranking';
import MyPage from '@/pages/MyPage';
import Login from '@/pages/Login';
import Snippets from '@/pages/Snippets';
import SnippetRankingPage from '@/pages/ranking/SnippetRankingPage';
import AdminSnippets from '@/pages/admin/AdminSnippets';

const AuthGuard = ({ children }: { children: React.ReactNode }) => {
  const isLoggedIn = useUserStore((s) => s.isLoggedIn);
  const navigate = useNavigate();
  if (!isLoggedIn) {
    return (
      <div style={{ padding: '80px 28px', textAlign: 'center', maxWidth: 520, margin: '0 auto' }}>
        <img src="/assets/logo.png" alt="" style={{ width: 64, height: 64, display: 'inline-block', margin: '-16px 0 0' }} />
        <h2 style={{ margin: '20px 0 10px', fontFamily: 'var(--dt-font-mono)', fontSize: 24, fontWeight: 500 }}>Sign in to view your profile</h2>
        <p style={{ color: 'var(--dt-text-2)', fontSize: 14, marginBottom: 24 }}>Your records, streak, and rating live behind GitHub auth.</p>
        <button onClick={() => navigate('/login')} style={{ display: 'inline-flex', alignItems: 'center', gap: 10, background: '#24292F', color: '#fff', padding: '12px 20px', border: 0, borderRadius: 6, cursor: 'pointer', fontFamily: 'var(--dt-font-mono)', fontSize: 14, fontWeight: 500 }}>
          Continue with GitHub
        </button>
      </div>
    );
  }
  return <>{children}</>;
};

const AppRoutes = () => {
  const theme = useAppStore((s) => s.theme);
  const toggleTheme = useAppStore((s) => s.toggleTheme);
  const navigate = useNavigate();
  const { isLoggedIn, setUser, setUserMe, clearUser, role, setAccessToken, setInitializing } = useUserStore();

  useEffect(() => {
    const init = async () => {
      let accessToken: string | null = null;

      const params = new URLSearchParams(window.location.search);
      const oauthCode = params.get('code');

      if (oauthCode) {
        window.history.replaceState(null, '', window.location.pathname);
        try {
          const res = await exchangeCode(oauthCode);
          accessToken = res.accessToken;
        } catch {
          // code 교환 실패 (만료 30초 초과 or 이미 사용) → refresh fallback
        }
      }

      if (!accessToken) {
        try {
          const res = await refreshToken();
          accessToken = res.accessToken;
        } catch {
          setInitializing(false);
          return;
        }
      }

      setAccessToken(accessToken);

      try {
        const [me, userMe] = await Promise.all([getMe(), getUserMe()]);
        setUser(me);
        setUserMe(userMe);
      } catch (err) {
        console.error('[App] init failed:', err);
      } finally {
        setInitializing(false);
      }
    };
    init();
  }, []);

  const handleLogout = async () => {
    await logout().catch(() => {});
    clearUser();
    navigate('/login');
  };

  const routes = (
    <Routes>
      <Route path="/" element={<HomeContemporary />} />
      <Route path="/solo" element={<Solo />} />
      <Route path="/battle" element={<Battle />} />
      <Route path="/daily" element={<Daily />} />
      <Route path="/ranking" element={<Ranking />} />
      <Route path="/snippets" element={<Snippets />} />
      <Route path="/mypage" element={<AuthGuard><MyPage /></AuthGuard>} />
      <Route path="/login" element={<Login />} />
      <Route path="/admin/snippets" element={
        role === 'ADMIN' ? <AdminSnippets /> : <Navigate to="/" replace />
      } />
      <Route path="/snippets/:id/ranking" element={<SnippetRankingPage />} />
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );

  return (
    <ContemporaryShell isLoggedIn={isLoggedIn} isAdmin={role === 'ADMIN'} onLogin={() => navigate('/login')} onLogout={handleLogout} theme={theme} onTheme={toggleTheme}>
      {routes}
    </ContemporaryShell>
  );
};

const App = () => {
  const design = useAppStore((s) => s.design);
  const theme = useAppStore((s) => s.theme);
  const lang = useAppStore((s) => s.lang);

  return (
    <LangContext.Provider value={lang}>
      <BrowserRouter>
        <div className={`dt-design-${design} dt-theme-${theme} dt-skin-revised`} style={{ minHeight: '100vh' }}>
          <AppRoutes />
        </div>
      </BrowserRouter>
    </LangContext.Provider>
  );
};

export default App;
