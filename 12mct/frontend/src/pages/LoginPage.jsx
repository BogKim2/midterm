import { useState } from 'react';
import { useGoogleLogin } from '@react-oauth/google';
import { useNavigate } from 'react-router-dom';
import { useApp } from '../contexts/AppContext';

const CLIENT_ID = import.meta.env.VITE_GOOGLE_CLIENT_ID;

function GoogleIcon() {
  return (
    <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.1 5.1 0 0 1-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09Z" fill="#4285F4" />
      <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84A11 11 0 0 0 12 23Z" fill="#34A853" />
      <path d="M5.84 14.09A6.6 6.6 0 0 1 5.5 12c0-.73.12-1.43.34-2.09V7.07H2.18A11 11 0 0 0 1 12c0 1.78.43 3.45 1.18 4.93l3.66-2.84Z" fill="#FBBC05" />
      <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.1 14.97 1 12 1A11 11 0 0 0 2.18 7.07l3.66 2.84C6.71 7.31 9.14 5.38 12 5.38Z" fill="#EA4335" />
    </svg>
  );
}

function MockLoginButton({ onSuccess }) {
  const [loading, setLoading] = useState(false);

  async function handleClick() {
    setLoading(true);
    await new Promise((resolve) => setTimeout(resolve, 400));
    onSuccess({
      id: 'mock-user',
      name: '테스트 사용자',
      email: 'mock@example.com',
      picture: null,
      authProvider: 'mock',
    });
    setLoading(false);
  }

  return (
    <button
      onClick={handleClick}
      disabled={loading}
      className="flex w-full items-center justify-center gap-3 rounded-2xl border px-4 py-4 text-sm font-semibold text-slate-700"
      style={{ borderColor: '#FCE4EC', backgroundColor: '#fff' }}
    >
      <GoogleIcon />
      {loading ? '로그인 중...' : 'Google로 로그인 (Mock)'}
    </button>
  );
}

function RealGoogleLoginButton({ onSuccess, onError }) {
  const [loading, setLoading] = useState(false);
  const googleLogin = useGoogleLogin({
    onSuccess: async ({ access_token: accessToken }) => {
      setLoading(true);
      try {
        const res = await fetch('https://www.googleapis.com/oauth2/v3/userinfo', {
          headers: { Authorization: `Bearer ${accessToken}` },
        });
        if (!res.ok) {
          throw new Error('Google 사용자 정보를 가져오지 못했습니다.');
        }
        const profile = await res.json();
        onSuccess({
          id: profile.sub,
          name: profile.name,
          email: profile.email,
          picture: profile.picture,
          authProvider: 'google',
        });
      } catch (error) {
        onError(error.message);
      } finally {
        setLoading(false);
      }
    },
    onError: () => onError('Google 로그인에 실패했습니다. 다시 시도해주세요.'),
  });

  return (
    <button
      onClick={() => googleLogin()}
      disabled={loading}
      className="flex w-full items-center justify-center gap-3 rounded-2xl border px-4 py-4 text-sm font-semibold text-slate-700"
      style={{ borderColor: '#FCE4EC', backgroundColor: '#fff' }}
    >
      <GoogleIcon />
      {loading ? '로그인 중...' : 'Google로 로그인'}
    </button>
  );
}

export default function LoginPage() {
  const { login } = useApp();
  const navigate = useNavigate();
  const [error, setError] = useState('');

  function handleSuccess(profile) {
    login(profile);
    navigate('/profile');
  }

  return (
    <div className="flex min-h-svh flex-col bg-[#fff8f8] px-6 py-10">
      <div className="mx-auto flex w-full max-w-sm flex-1 flex-col justify-center">
        <div className="mb-8">
          <p className="mb-4 text-sm font-medium uppercase tracking-[0.28em] text-[#ff85a1]">
            Meal Calorie Tracker
          </p>
          <h1 className="text-4xl font-black leading-tight text-slate-900">
            사진 한 장으로
            <br />
            식단을 기록합니다.
          </h1>
          <p className="mt-4 text-sm leading-6 text-slate-500">
            기존 Food-101 분류 모델과 LM Studio 로컬 AI를 함께 사용해 음식 이름과 영양 정보를 빠르게
            확인하는 MVP입니다.
          </p>
        </div>

        <div className="mb-6 rounded-3xl border bg-white p-5" style={{ borderColor: '#FCE4EC' }}>
          <div className="grid gap-3 text-sm text-slate-600">
            <div>1. Google 로그인</div>
            <div>2. 프로필 생성</div>
            <div>3. 음식 사진 업로드</div>
            <div>4. 칼로리와 AI 코멘트 확인</div>
          </div>
        </div>

        {CLIENT_ID ? (
          <RealGoogleLoginButton onSuccess={handleSuccess} onError={setError} />
        ) : (
          <MockLoginButton onSuccess={handleSuccess} />
        )}

        {!CLIENT_ID && (
          <p className="mt-3 text-xs leading-5 text-amber-700">
            `VITE_GOOGLE_CLIENT_ID`가 없어 mock 로그인으로 동작합니다.
          </p>
        )}

        {error && (
          <div className="mt-4 rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-600">
            {error}
          </div>
        )}
      </div>
    </div>
  );
}
