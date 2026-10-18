import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

const STORAGE_KEY = '@pokedex/team-v1';
const TeamContext = createContext(null);

export function TeamProvider({ children }) {
  const [team, setTeam] = useState([]);
  const [ready, setReady] = useState(false);
  useEffect(() => {
    let active = true;
    AsyncStorage.getItem(STORAGE_KEY).then((saved) => {
      if (saved && active) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed)) setTeam(parsed.slice(0, 6));
      }
    }).catch(() => {}).finally(() => { if (active) setReady(true); });
    return () => { active = false; };
  }, []);
  useEffect(() => {
    if (ready) AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(team)).catch(() => {});
  }, [team, ready]);
  const addPokemon = useCallback((pokemon) => setTeam((current) => (
    current.length >= 6 || current.some((item) => item.id === pokemon.id) ? current : [...current, pokemon]
  )), []);
  const removePokemon = useCallback((id) => setTeam((current) => current.filter((item) => item.id !== id)), []);
  const value = useMemo(() => ({ team, ready, addPokemon, removePokemon }), [team, ready, addPokemon, removePokemon]);
  return <TeamContext.Provider value={value}>{children}</TeamContext.Provider>;
}

export function useTeam() {
  const context = useContext(TeamContext);
  if (!context) throw new Error('useTeam must be used within TeamProvider');
  return context;
}
