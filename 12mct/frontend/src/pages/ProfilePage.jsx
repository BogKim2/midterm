import { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useApp } from '../contexts/AppContext';
import { ACTIVITY_LABELS } from '../utils/calculations';

const EMPTY_FORM = {
  name: '',
  gender: 'male',
  age: '',
  height_cm: '',
  weight_kg: '',
  activity: 'medium',
};

function ProfileForm({ onSubmit, onCancel }) {
  const [form, setForm] = useState(EMPTY_FORM);

  function setField(field, value) {
    setForm((current) => ({ ...current, [field]: value }));
  }

  function handleSubmit(event) {
    event.preventDefault();
    onSubmit({
      ...form,
      age: Number(form.age),
      height_cm: Number(form.height_cm),
      weight_kg: Number(form.weight_kg),
    });
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      <div>
        <label className="mb-2 block text-sm font-semibold text-slate-700">이름</label>
        <input
          required
          value={form.name}
          onChange={(event) => setField('name', event.target.value)}
          className="w-full rounded-2xl border bg-white px-4 py-3 outline-none"
          style={{ borderColor: '#FCE4EC' }}
          placeholder="예: 민지"
        />
      </div>

      <div className="grid grid-cols-2 gap-3">
        {[
          { value: 'male', label: '남성' },
          { value: 'female', label: '여성' },
        ].map((option) => (
          <button
            key={option.value}
            type="button"
            onClick={() => setField('gender', option.value)}
            className="rounded-2xl border px-4 py-3 text-sm font-semibold"
            style={{
              borderColor: form.gender === option.value ? '#FF85A1' : '#FCE4EC',
              backgroundColor: form.gender === option.value ? '#fff1f4' : '#fff',
              color: form.gender === option.value ? '#FF85A1' : '#334155',
            }}
          >
            {option.label}
          </button>
        ))}
      </div>

      <div className="grid grid-cols-3 gap-3">
        {[
          { field: 'age', label: '나이', unit: '세' },
          { field: 'height_cm', label: '키', unit: 'cm' },
          { field: 'weight_kg', label: '몸무게', unit: 'kg' },
        ].map((item) => (
          <label key={item.field} className="block">
            <span className="mb-2 block text-sm font-semibold text-slate-700">{item.label}</span>
            <div className="relative">
              <input
                required
                type="number"
                value={form[item.field]}
                onChange={(event) => setField(item.field, event.target.value)}
                className="w-full rounded-2xl border bg-white px-4 py-3 pr-10 outline-none"
                style={{ borderColor: '#FCE4EC' }}
              />
              <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-slate-400">
                {item.unit}
              </span>
            </div>
          </label>
        ))}
      </div>

      <div>
        <label className="mb-2 block text-sm font-semibold text-slate-700">활동량</label>
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
                color: '#334155',
              }}
            >
              {label}
            </button>
          ))}
        </div>
      </div>

      <div className="flex gap-3">
        {onCancel && (
          <button
            type="button"
            onClick={onCancel}
            className="w-full rounded-2xl border px-4 py-3 text-sm font-semibold text-slate-500"
            style={{ borderColor: '#FCE4EC' }}
          >
            취소
          </button>
        )}
        <button className="w-full rounded-2xl bg-[#FF85A1] px-4 py-3 text-sm font-semibold text-white">
          프로필 저장
        </button>
      </div>
    </form>
  );
}

export default function ProfilePage() {
  const { profiles, createProfile, setActiveProfile, user } = useApp();
  const navigate = useNavigate();
  const [creating, setCreating] = useState(profiles.length === 0);

  const profileCards = useMemo(
    () =>
      profiles.map((profile) => (
        <button
          key={profile.id}
          onClick={() => {
            setActiveProfile(profile.id);
            navigate('/');
          }}
          className="w-full rounded-3xl border bg-white p-5 text-left"
          style={{ borderColor: '#FCE4EC' }}
        >
          <p className="text-lg font-bold text-slate-900">{profile.name}</p>
          <p className="mt-1 text-sm text-slate-500">
            {profile.age}세 · {profile.height_cm}cm · {profile.weight_kg}kg · {ACTIVITY_LABELS[profile.activity]}
          </p>
          <div className="mt-4 grid grid-cols-3 gap-3 text-center text-sm">
            <div className="rounded-2xl bg-[#fff5f7] px-3 py-3">
              <div className="font-bold text-[#FF85A1]">{profile.bmr}</div>
              <div className="text-xs text-slate-500">BMR</div>
            </div>
            <div className="rounded-2xl bg-[#fff5f7] px-3 py-3">
              <div className="font-bold text-[#FF85A1]">{profile.tdee}</div>
              <div className="text-xs text-slate-500">TDEE</div>
            </div>
            <div className="rounded-2xl bg-[#fff5f7] px-3 py-3">
              <div className="font-bold text-[#FF85A1]">{profile.target_calories}</div>
              <div className="text-xs text-slate-500">목표 kcal</div>
            </div>
          </div>
        </button>
      )),
    [navigate, profiles, setActiveProfile],
  );

  return (
    <div className="min-h-svh bg-[#fff8f8] px-5 py-6">
      <div className="mb-6 flex items-center justify-between">
        <div>
          <p className="text-xs uppercase tracking-[0.22em] text-[#FF85A1]">Profile</p>
          <h1 className="mt-2 text-2xl font-black text-slate-900">사용자 프로필</h1>
          <p className="mt-1 text-sm text-slate-500">{user?.email}</p>
        </div>
        {!creating && (
          <button
            onClick={() => setCreating(true)}
            className="rounded-2xl bg-[#FF85A1] px-4 py-3 text-sm font-semibold text-white"
          >
            새 프로필
          </button>
        )}
      </div>

      {creating ? (
        <div className="rounded-3xl border bg-white p-5" style={{ borderColor: '#FCE4EC' }}>
          <ProfileForm
            onSubmit={(data) => {
              const profile = createProfile(data);
              setActiveProfile(profile.id);
              navigate('/');
            }}
            onCancel={profiles.length > 0 ? () => setCreating(false) : null}
          />
        </div>
      ) : (
        <div className="space-y-4">{profileCards}</div>
      )}
    </div>
  );
}
