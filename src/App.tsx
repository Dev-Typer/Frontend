import { BrowserRouter, Routes, Route, Navigate, useNavigate } from 'react-router-dom';
import { useAppStore } from '@/stores/appStore';
import { LangContext } from '@/i18n';
import { ME } from '@/data';
import TopNav from '@/components/TopNav';
import EditorShell from '@/pages/EditorShell';
import HomeEditor from '@/pages/Home/HomeEditor';
import Solo from '@/pages/Solo';
import Battle from '@/pages/Battle';
import Daily from '@/pages/Daily';
import Ranking from '@/pages/Ranking';
import MyPage from '@/pages/MyPage';
import Login from '@/pages/Login';

const AuthGuard = ({ children }: { children: React.ReactNode }) => {
  const isLoggedIn = useAppStore((s) => s.loggedIn);
  const navigate = useNavigate();
  if (!isLoggedIn) {
    return (
      <div style={{ padding: '80px 28px', textAlign: 'center', maxWidth: 520, margin: '0 auto' }}>
        <img src="/assets/logo.png" alt="" style={{ width: 64, height: 64, display: 'inline-block', margin: '-16px 0 0' }} />
        <h2 style={{ margin: '20px 0 10px', fontFamily: 'var(--dt-font-mono)', fontSize: 24, fontWeight: 500 }}>Sign in to view your profile</h2>
        <p style={{ color: 'var(--dt-text-2)', fontSize: 14, marginBottom: 24 }}>Your records, streak, and rating live behind GitHub auth.</p>
        <button onClick={() => navigate('/login')} style={{ display: 'inline-flex', alignItems: 'center', gap: 10, background: '#24292F', color: '#fff', padding: '12px 20px', border: 0, borderRadius: 6, cursor: 'default', fontFamily: 'var(--dt-font-mono)', fontSize: 14, fontWeight: 500 }}>
          Continue with GitHub
        </button>
      </div>
    );
  }
  return <>{children}</>;
};

const AppRoutes = () => {
  const design = useAppStore((s) => s.design);
  const theme = useAppStore((s) => s.theme);
  const isLoggedIn = useAppStore((s) => s.loggedIn);
  const toggleTheme = useAppStore((s) => s.toggleTheme);
  const navigate = useNavigate();
  const me = ME;

  const routes = (
    <Routes>
      <Route path="/" element={<HomeEditor />} />
      <Route path="/solo" element={<Solo />} />
      <Route path="/battle" element={<Battle />} />
      <Route path="/daily" element={<Daily />} />
      <Route path="/ranking" element={<Ranking />} />
      <Route path="/mypage" element={<AuthGuard><MyPage /></AuthGuard>} />
      <Route path="/login" element={<Login />} />
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );

  if (design === 'editor') {
    return (
      <EditorShell me={me} isLoggedIn={isLoggedIn} onLogin={() => navigate('/login')} theme={theme} onTheme={toggleTheme}>
        {routes}
      </EditorShell>
    );
  }

  return (
    <>
      <TopNav theme={theme} onTheme={toggleTheme} isLoggedIn={isLoggedIn} onLogin={() => navigate('/login')} me={me} />
      {routes}
    </>
  );
};

const App = () => {
  const design = useAppStore((s) => s.design);
  const theme = useAppStore((s) => s.theme);
  const lang = useAppStore((s) => s.lang);

  return (
    <LangContext.Provider value={lang}>
      <BrowserRouter>
        <div className={`dt-design-${design} dt-theme-${theme}`} style={{ minHeight: '100vh' }}>
          <AppRoutes />
        </div>
      </BrowserRouter>
    </LangContext.Provider>
  );
};

export default App;
