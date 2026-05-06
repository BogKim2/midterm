import { createContext, useContext, useState } from 'react';
import * as storage from '../utils/storage';
import { calcBMR, calcTargets, calcTDEE } from '../utils/calculations';

const AppContext = createContext(null);

function buildProfileData(data) {
  const bmr = calcBMR(data.gender, data.weight_kg, data.height_cm, data.age);
  const tdee = calcTDEE(bmr, data.activity);

  return {
    ...data,
    bmr: Math.round(bmr),
    tdee: Math.round(tdee),
    ...calcTargets(tdee, data.weight_kg),
  };
}

export function AppProvider({ children }) {
  const [user, setUser] = useState(() => storage.getUser());
  const [profiles, setProfiles] = useState(() => storage.getProfiles());
  const [activeId, setActiveId] = useState(() => storage.getActiveProfileId());
  const [pendingItems, setPendingItems] = useState([]);
  const [pendingMeta, setPendingMeta] = useState(null);

  const activeProfile = profiles.find((profile) => profile.id === activeId) ?? null;

  function login(nextUser) {
    storage.saveUser(nextUser);
    setUser(nextUser);
  }

  function logout() {
    storage.removeUser();
    storage.setActiveProfileId(null);
    setUser(null);
    setActiveId(null);
    setPendingItems([]);
    setPendingMeta(null);
  }

  function createProfile(data) {
    const nextProfile = {
      id: crypto.randomUUID(),
      ...buildProfileData(data),
    };
    const nextProfiles = [...profiles, nextProfile];
    storage.saveProfiles(nextProfiles);
    setProfiles(nextProfiles);
    return nextProfile;
  }

  function updateProfile(id, data) {
    const nextProfiles = profiles.map((profile) =>
      profile.id === id ? { ...profile, ...buildProfileData(data) } : profile,
    );
    storage.saveProfiles(nextProfiles);
    setProfiles(nextProfiles);
  }

  function setActiveProfile(id) {
    storage.setActiveProfileId(id);
    setActiveId(id);
  }

  function getMealsForDate(date) {
    return activeId ? storage.getMeals(activeId).filter((meal) => meal.date === date) : [];
  }

  function getAllMeals() {
    return activeId ? storage.getMeals(activeId) : [];
  }

  function saveMealEntry(meal) {
    if (activeId) {
      storage.addMeal(activeId, meal);
    }
  }

  function deleteMealEntry(mealId) {
    if (activeId) {
      storage.deleteMeal(activeId, mealId);
    }
  }

  function clearPending() {
    setPendingItems([]);
    setPendingMeta(null);
  }

  return (
    <AppContext.Provider
      value={{
        user,
        login,
        logout,
        profiles,
        activeProfile,
        activeId,
        createProfile,
        updateProfile,
        setActiveProfile,
        pendingItems,
        setPendingItems,
        pendingMeta,
        setPendingMeta,
        clearPending,
        getMealsForDate,
        getAllMeals,
        saveMealEntry,
        deleteMealEntry,
      }}
    >
      {children}
    </AppContext.Provider>
  );
}

export function useApp() {
  return useContext(AppContext);
}
