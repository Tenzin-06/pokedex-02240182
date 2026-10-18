import { useEffect, useState } from 'react';
import { View, Text, Image, Pressable, ScrollView, ActivityIndicator, StyleSheet } from 'react-native';
import { fetchPokemonDetails } from '../api';
import { useTeam } from '../context/TeamContext';
import { colors } from '../theme';

export default function DetailScreen({ route, navigation }) {
  const { id } = route.params;
  const [pokemon, setPokemon] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const { team, ready, addPokemon, removePokemon } = useTeam();
  const inTeam = team.some((member) => member.id === Number(id));

  const loadDetails = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await fetchPokemonDetails(id);
      setPokemon(data);
      navigation.setOptions({ title: data.name.charAt(0).toUpperCase() + data.name.slice(1) });
    } catch (err) {
      setError('Could not load this Pokémon. Check your internet connection.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { loadDetails(); }, [id]);

  if (loading) return <View style={styles.center}><ActivityIndicator size="large" /></View>;
  if (error) return <View style={styles.center}><Text style={styles.errorText}>{error}</Text><Pressable style={styles.retry} onPress={loadDetails}><Text style={styles.retryText}>Try again</Text></Pressable></View>;

  return (
    <ScrollView style={styles.scroll} contentContainerStyle={styles.container}>
      <View style={styles.hero}>
        <Text style={styles.dexNumber}>NO. {String(pokemon.id).padStart(4, '0')}</Text>
        <View style={styles.artworkFrame}><Image source={{ uri: pokemon.image }} style={styles.image} /></View>
      </View>
      <Text style={styles.name}>{pokemon.name}</Text>
      <View style={styles.typeList}>{pokemon.types.map((type) => <View key={type} style={styles.typeTag}><Text style={styles.typeText}>{type}</Text></View>)}</View>
      <View style={styles.infoCard}>
        <View style={styles.infoItem}><Text style={styles.infoLabel}>HEIGHT</Text><Text style={styles.infoValue}>{pokemon.height} m</Text></View>
        <View style={styles.infoDivider} />
        <View style={styles.infoItem}><Text style={styles.infoLabel}>WEIGHT</Text><Text style={styles.infoValue}>{pokemon.weight} kg</Text></View>
      </View>
      <View style={styles.teamAction}>
        <Pressable style={({ pressed }) => [styles.teamButton, inTeam && styles.removeButton, pressed && styles.pressed]}
          accessibilityRole="button"
          disabled={!ready || (!inTeam && team.length >= 6)}
          onPress={() => inTeam ? removePokemon(pokemon.id) : addPokemon(pokemon)}>
          <Text style={[styles.teamButtonText, inTeam && styles.removeButtonText]}>{!ready ? 'Loading team…' : inTeam ? 'Remove from My Team' : team.length >= 6 ? 'Team is full (6/6)' : 'Add to My Team'}</Text>
        </Pressable>
      </View>
      <View style={styles.stats}>
        <Text style={styles.statsEyebrow}>BATTLE PROFILE</Text>
        <Text style={styles.statsTitle}>Base stats</Text>
        {pokemon.stats.map((stat) => <View key={stat.name} style={styles.statRow}>
          <Text style={styles.statName}>{stat.name.replace('-', ' ')}</Text>
          <Text style={styles.statValue}>{stat.value}</Text>
          <View style={styles.track}><View style={[styles.bar, { width: `${Math.min(stat.value / 255 * 100, 100)}%` }]} /></View>
        </View>)}
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  center: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: 20, backgroundColor: colors.paper },
  errorText: { fontSize: 16, textAlign: 'center', marginBottom: 12, color: colors.ink },
  retry: { backgroundColor: colors.green, borderRadius: 12, paddingHorizontal: 18, paddingVertical: 11 }, retryText: { color: colors.surface, fontWeight: '700' },
  scroll: { flex: 1, backgroundColor: colors.paper }, container: { alignItems: 'center', padding: 18, paddingBottom: 34, flexGrow: 1 },
  hero: { width: '100%', height: 244, borderRadius: 22, backgroundColor: colors.greenSoft, justifyContent: 'center', alignItems: 'center', overflow: 'hidden' },
  dexNumber: { position: 'absolute', top: 16, left: 17, zIndex: 1, color: colors.green, letterSpacing: 1.1, fontSize: 11, fontWeight: '800' },
  artworkFrame: { width: 220, height: 220, alignItems: 'center', justifyContent: 'center' }, image: { width: 210, height: 210 },
  name: { fontSize: 30, fontWeight: '800', textTransform: 'capitalize', marginTop: 15, color: colors.ink, letterSpacing: 0.2 },
  typeList: { flexDirection: 'row', gap: 8, marginTop: 9 }, typeTag: { backgroundColor: colors.terracottaSoft, borderRadius: 20, paddingHorizontal: 13, paddingVertical: 6 },
  typeText: { color: colors.terracotta, fontWeight: '700', fontSize: 12, textTransform: 'capitalize' },
  infoCard: { width: '100%', flexDirection: 'row', backgroundColor: colors.surface, borderColor: colors.border, borderWidth: 1, borderRadius: 16, marginTop: 20, padding: 15 },
  infoItem: { flex: 1, alignItems: 'center', gap: 5 }, infoDivider: { width: 1, backgroundColor: colors.border },
  infoLabel: { color: colors.muted, fontWeight: '800', fontSize: 10, letterSpacing: 1.1 }, infoValue: { color: colors.ink, fontSize: 16, fontWeight: '700' },
  teamAction: { width: '100%', marginTop: 12 }, teamButton: { backgroundColor: colors.green, borderRadius: 14, minHeight: 50, alignItems: 'center', justifyContent: 'center', paddingHorizontal: 16 },
  teamButtonText: { color: colors.white, fontWeight: '700', fontSize: 15 }, removeButton: { backgroundColor: colors.surface, borderWidth: 1, borderColor: colors.border },
  removeButtonText: { color: colors.ink }, pressed: { opacity: 0.8 },
  stats: { width: '100%', marginTop: 25, backgroundColor: colors.surface, padding: 16, borderRadius: 18, borderWidth: 1, borderColor: colors.border },
  statsEyebrow: { fontSize: 10, letterSpacing: 1.25, color: colors.terracotta, fontWeight: '800' },
  statsTitle: { fontSize: 21, fontWeight: '800', marginTop: 4, marginBottom: 11, color: colors.ink },
  statRow: { minHeight: 39, flexDirection: 'row', alignItems: 'center', gap: 8 },
  statName: { width: 104, textTransform: 'capitalize', color: colors.muted, fontSize: 12, fontWeight: '600' }, statValue: { width: 30, fontWeight: '700', color: colors.ink, fontSize: 12 },
  track: { flex: 1, height: 8, borderRadius: 5, backgroundColor: colors.greenSoft, overflow: 'hidden' },
  bar: { height: '100%', backgroundColor: colors.terracotta, borderRadius: 5 },
});
