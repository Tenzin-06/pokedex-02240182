import { useEffect, useState, useCallback, useMemo } from 'react';
import { View, Text, Pressable, FlatList, ActivityIndicator, TextInput, StyleSheet } from 'react-native';
import { fetchPokemonPage, fetchAllPokemon } from '../api';
import PokemonCard from '../components/PokemonCard';
import { Ionicons } from '@expo/vector-icons';
import { colors } from '../theme';

const PAGE_SIZE = 20;
const START_OFFSET = 182;
const MAX_POKEMON = 1025;

export default function PokedexScreen({ navigation }) {
  const [pokemon, setPokemon] = useState([]);
  const [offset, setOffset] = useState(START_OFFSET);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  const [error, setError] = useState(null);
  const [query, setQuery] = useState('');
  const [allPokemon, setAllPokemon] = useState(null);
  const [searching, setSearching] = useState(false);
  const [debouncedQuery, setDebouncedQuery] = useState('');
  const [searchError, setSearchError] = useState(null);

  const loadFirstPage = async () => {
    setLoading(true);
    setError(null);

    try {
      const list = await fetchPokemonPage(START_OFFSET, PAGE_SIZE);

      setPokemon(list);
      setOffset(START_OFFSET + PAGE_SIZE);
      setHasMore(START_OFFSET + PAGE_SIZE < MAX_POKEMON);
    } catch (err) {
      setError('Could not load Pokémon. Check your internet connection.');
    } finally {
      setLoading(false);
    }
  };

  const loadMore = async () => {
    if (loadingMore || !hasMore) return;
    setLoadingMore(true);

    try {
      const limit = Math.min(PAGE_SIZE, MAX_POKEMON - offset);

      if (limit <= 0) {
        setHasMore(false);
        return;
      }

      const list = await fetchPokemonPage(offset, limit);
      setPokemon((prev) => {
        const seen = new Set(prev.map((p) => p.id));
        const fresh = list.filter((p) => !seen.has(p.id));
        return [...prev, ...fresh];
      });

      setOffset((prev) => prev + limit);
      setHasMore(offset + limit < MAX_POKEMON);
    } catch (err) {
      // keep the list we already have; the user can scroll again to retry
    } finally {
      setLoadingMore(false);
    }
  };

  const ensureAllLoaded = async () => {
    if (allPokemon) return allPokemon;
    setSearching(true);

    try {
        const all = await fetchAllPokemon();
        setAllPokemon(all);
        return all;
    } finally {
        setSearching(false);
    }
  };

  const openDetail = useCallback(
    (id) => navigation.navigate('Detail', { id }),
    [navigation]
  );

  const renderItem = useCallback(
    ({ item }) => (
      <PokemonCard
        id={item.id}
        name={item.name}
        image={item.image}
        onPress={openDetail}
      />
    ),
    [openDetail]
  );

  useEffect(() => {
    loadFirstPage();
  }, []);

  useEffect(() => {
    const timer = setTimeout(async () => {
        const text = query.trim().toLowerCase();
        setDebouncedQuery(text);
        
        if (text !== ''){
            setSearchError(null);

            try {
                await ensureAllLoaded();
            } catch (err) {
                setSearchError('Search failed. Check your internet connection.');
            }
        }
    }, 400);

    return () => clearTimeout(timer);
  }, [query]);

  const results = useMemo(
    () => debouncedQuery && allPokemon
      ? allPokemon.filter((p) => p.name.includes(debouncedQuery))
      : null,
    [allPokemon, debouncedQuery]
  );

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" />
      </View>
    );
  }

  if (error) {
    return (
      <View style={styles.center}>
        <Text style={styles.errorText}>{error}</Text>
        <Pressable style={styles.retry} onPress={loadFirstPage}><Text style={styles.retryText}>Try again</Text></Pressable>
      </View>
    );
  }

  return (
    <View style={styles.screen}>
        <View style={styles.intro}>
          <Text style={styles.eyebrow}>NATIONAL DEX  ·  SPECIES LIST</Text>
          <Text style={styles.introTitle}>Browse Pokémon</Text>
        </View>
        <View style={styles.searchWrap}>
            <Ionicons name="search" size={19} color={colors.muted} />
            <TextInput
            style={styles.search}
            placeholder="Search all Pokemon"
            value={query}
            onChangeText={setQuery}
            autoCorrect={false}
            autoCapitalize='none'
        />
        </View>
        {searching && <ActivityIndicator style={{ margin: 12 }} />}
        {searchError && <Text style={styles.empty}>{searchError}</Text>}
        <View style={styles.listHeader}>
          <Text style={styles.sectionTitle}>{results ? 'Search results' : 'The collection'}</Text>
          <Text style={styles.resultCount}>{results ? results.length : pokemon.length} listed</Text>
        </View>

        <FlatList
            data={results ?? pokemon}
            contentContainerStyle={styles.listContent}
            keyExtractor={(item) => String(item.id)}
            renderItem={renderItem}
            onEndReached={results ? null : loadMore}
            onEndReachedThreshold={0.5}
            initialNumToRender={10}
            windowSize={7}
            ListEmptyComponent={
                results ? <Text style={styles.empty}>No Pokemon found for "{debouncedQuery}"</Text> : null
            }
            ListFooterComponent={
                !results && loadingMore ? <ActivityIndicator style={{ margin: 16 }} /> : null
            }
        />

    </View>
  );
}

const styles = StyleSheet.create({
  center: { 
    flex: 1,
     alignItems: 'center',
      justifyContent: 'center',
       padding: 20,
       backgroundColor: colors.paper,
  },

  errorText: { 
    fontSize: 16, 
    textAlign: 'center', 
    marginBottom: 14,
    color: colors.ink,
  },

  screen: { flex: 1, backgroundColor: colors.paper },
  intro: { paddingHorizontal: 19, paddingTop: 14, paddingBottom: 13 },
  eyebrow: { color: colors.terracotta, fontSize: 10, fontWeight: '800', letterSpacing: 1.35 },
  introTitle: { color: colors.ink, fontSize: 21, fontWeight: '700', marginTop: 6 },
  searchWrap: { height: 50, flexDirection: 'row', alignItems: 'center', gap: 10, marginHorizontal: 16, paddingHorizontal: 14, backgroundColor: colors.surface, borderRadius: 14, borderWidth: 1, borderColor: colors.border },
  search: { flex: 1, padding: 0, color: colors.ink, fontSize: 15, height: '100%' },
  listHeader: { flexDirection: 'row', alignItems: 'baseline', justifyContent: 'space-between', marginHorizontal: 19, marginTop: 20, marginBottom: 4 },
  sectionTitle: { fontSize: 16, fontWeight: '700', color: colors.ink },
  resultCount: { fontSize: 12, color: colors.muted },
  listContent: { paddingBottom: 18 },
  retry: { backgroundColor: colors.green, borderRadius: 12, paddingHorizontal: 19, paddingVertical: 12 },
  retryText: { color: colors.surface, fontWeight: '700' },

  empty: {
    textAlign: 'center',
    marginTop: 30,
    color: colors.muted,
  }
});
