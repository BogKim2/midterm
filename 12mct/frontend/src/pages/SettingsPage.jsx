import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import BottomNav from '../components/BottomNav';
import { useApp } from '../contexts/AppContext';
import { ACTIVITY_LABELS } from '../utils/calculations';
import { exportAllData, importMeals } from '../utils/storage';

export default function SettingsPage() {
  const { activeId, activeProfile, logout, updateProfile } = useApp();
  const navigate = useNavigate();
  const [savedMessage, setSavedMessage] = useState('');
  const [form, setForm] = useState({
    name: activeProfile.name,
    gender: activeProfile.gender,
    age: String(activeProfile.age),
    height_cm: String(activeProfile.height_cm),
    weight_kg: String(activeProfile.weight_kg),
    activity: activeProfile.activity,
  });

  function setField(field, value) {
    setForm((current) => ({ ...current, [field]: value }));
  }

  function handleSave(event) {
    event.preventDefault();
    updateProfile(activeProfile.id, {
      ...form,
      age: Number(form.age),
      height_cm: Number(form.height_cm),
      weight_kg: Number(form.weight_kg),
    });
    setSavedMessage('프로필을 저장했습니다.');
    setTimeout(() => setSavedMessage(''), 1800);
  }

  function handleExport() {
    const data = exportAllData(activeId);
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `mct-${new Date().toISOString().slice(0, 10)}.json`;
    link.click();
    URL.revokeObjectURL(url);
  }

  function handleImport(event) {
    const file = event.target.files?.[0];
    if (!file) {
      return;
    }
    const reader = new FileReader();
    reader.onload = () => {
      try {
        const data = JSON.parse(reader.result);
        const importedCount = importMeals(activeId, data.meals || []);
        setSavedMessage(`${importedCount}개의 식사 기록을 가져왔습니다.`);
      } catch {
        setSavedMessage('가져오기에 실패했습니다.');
      }
    };
    reader.readAsText(file);
    event.target.value = '';
  }

  return (
    <div className="min-h-svh bg-[#fff8f8] px-5 pb-28 pt-6">
      <p className="text-xs uppercase tracking-[0.22em] text-[#FF85A1]">Settings</p>
      <h1 className="mt-2 text-2xl font-black text-slate-900">설정</h1>

      <form onSubmit={handleSave} className="mt-6 rounded-3xl border bg-white p-5" style={{ borderColor: '#FCE4EC' }}>
        <h2 className="text-lg font-bold text-slate-900">프로필 수정</h2>
        <div className="mt-4 space-y-4">
          <input
            value={form.name}
            onChange={(event) => setField('name', event.target.value)}
            className="w-full rounded-2xl border bg-white px-4 py-3 outline-none"
            style={{ borderColor: '#FCE4EC' }}
          />
          <div className="grid grid-cols-3 gap-3">
            <input
              type="number"
              value={form.age}
              onChange={(event) => setField('age', event.target.value)}
              className="rounded-2xl border bg-white px-4 py-3 outline-none"
              style={{ borderColor: '#FCE4EC' }}
            />
            <input
              type="number"
              value={form.height_cm}
              onChange={(event) => setField('height_cm', event.target.value)}
              className="rounded-2xl border bg-white px-4 py-3 outline-none"
              style={{ borderColor: '#FCE4EC' }}
            />
            <input
              type="number"
              value={form.weight_kg}
              onChange={(event) => setField('weight_kg', event.target.value)}
              className="rounded-2xl border bg-white px-4 py-3 outline-none"
              style={{ borderColor: '#FCE4EC' }}
            />
          </div>
          <div className="grid gap-2">
            {Object.entries(ACTIVITY_LABELS).map(([value, label]) => (
              <button
                key={value}
                type="button"
                onClick={() => setField('activity', value)}
                className="rounded-2xl border px-4 py-3 text-left text-sm font-medium"
                style={{
                  borderColor: form.activity === value ? '#FF85A1' : '#FCE4EC',
                  backgroundColor: form.activity === value ? '#fff1f4' : '#fff',
                }}
              >
                {label}
              </button>
            ))}
          </div>
        </div>
        <button className="mt-5 w-full rounded-2xl bg-[#FF85A1] px-4 py-3 text-sm font-semibold text-white">
          저장
        </button>
      </form>

      <section className="mt-4 rounded-3xl border bg-white p-5" style={{ borderColor: '#FCE4EC' }}>
        <h2 className="text-lg font-bold text-slate-900">데이터 관리</h2>
        <div className="mt-4 flex gap-3">
          <button
            onClick={handleExport}
            className="w-full rounded-2xl border px-4 py-3 text-sm font-semibold text-slate-700"
            style={{ borderColor: '#FCE4EC' }}
          >
            JSON 내보내기
          </button>
          <label
            className="w-full cursor-pointer rounded-2xl border px-4 py-3 text-center text-sm font-semibold text-slate-700"
            style={{ borderColor: '#FCE4EC' }}
          >
            JSON 가져오기
            <input hidden type="file" accept=".json" onChange={handleImport} />
          </label>
        </div>
      </section>

      {savedMessage && (
        <div className="mt-4 rounded-2xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-700">
          {savedMessage}
        </div>
      )}

      <button
        onClick={() => {
          logout();
          navigate('/login');
        }}
        className="mt-4 w-full rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-semibold text-red-600"
      >
        로그아웃
      </button>

      <BottomNav />
    </div>
  );
}
