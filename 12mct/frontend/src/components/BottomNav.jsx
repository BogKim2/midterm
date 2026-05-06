import { useLocation, useNavigate } from 'react-router-dom';

const NAV = [
  { path: '/', icon: '⌂', label: '홈' },
  { path: '/upload', icon: '+', label: '업로드' },
  { path: '/history', icon: '◫', label: '히스토리' },
  { path: '/settings', icon: '⚙', label: '설정' },
];

export default function BottomNav() {
  const navigate = useNavigate();
  const { pathname } = useLocation();

  return (
    <nav
      className="fixed bottom-0 left-1/2 z-50 flex w-full -translate-x-1/2 justify-around border-t bg-white py-2"
      style={{
        maxWidth: 480,
        borderColor: '#FCE4EC',
        paddingBottom: 'max(8px, env(safe-area-inset-bottom))',
      }}
    >
      {NAV.map(({ path, icon, label }) => {
        const active = pathname === path;
        return (
          <button
            key={path}
            onClick={() => navigate(path)}
            className="flex flex-col items-center gap-1 px-5 py-1"
            style={{ color: active ? '#FF85A1' : '#9CA3AF' }}
          >
            <span className="text-xl leading-none">{icon}</span>
            <span className="text-xs font-medium">{label}</span>
          </button>
        );
      })}
    </nav>
  );
}
