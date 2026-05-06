import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom';
import { GoogleOAuthProvider } from '@react-oauth/google';
import { AppProvider, useApp } from './contexts/AppContext';
import LoginPage from './pages/LoginPage';
import ProfilePage from './pages/ProfilePage';
import HomePage from './pages/HomePage';
import UploadPage from './pages/UploadPage';
import ResultPage from './pages/ResultPage';
import HistoryPage from './pages/HistoryPage';
import SettingsPage from './pages/SettingsPage';

const GOOGLE_CLIENT_ID = import.meta.env.VITE_GOOGLE_CLIENT_ID;

function Guard({ children, requireProfile = false }) {
  const { user, activeProfile } = useApp();

  if (!user) {
    return <Navigate to="/login" replace />;
  }
  if (requireProfile && !activeProfile) {
    return <Navigate to="/profile" replace />;
  }
  return children;
}

function AppRoutes() {
  const { user, activeProfile } = useApp();

  return (
    <Routes>
      <Route
        path="/login"
        element={
          !user ? (
            <LoginPage />
          ) : !activeProfile ? (
            <Navigate to="/profile" replace />
          ) : (
            <Navigate to="/" replace />
          )
        }
      />
      <Route path="/profile" element={<Guard><ProfilePage /></Guard>} />
      <Route path="/" element={<Guard requireProfile><HomePage /></Guard>} />
      <Route path="/upload" element={<Guard requireProfile><UploadPage /></Guard>} />
      <Route path="/result" element={<Guard requireProfile><ResultPage /></Guard>} />
      <Route path="/history" element={<Guard requireProfile><HistoryPage /></Guard>} />
      <Route path="/settings" element={<Guard requireProfile><SettingsPage /></Guard>} />
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

export default function App() {
  const app = (
    <BrowserRouter>
      <AppProvider>
        <AppRoutes />
      </AppProvider>
    </BrowserRouter>
  );

  return GOOGLE_CLIENT_ID ? (
    <GoogleOAuthProvider clientId={GOOGLE_CLIENT_ID}>{app}</GoogleOAuthProvider>
  ) : (
    app
  );
}
