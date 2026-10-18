import { useMemo } from 'react';
import { ActivityIndicator, FlatList, Image, Pressable, StyleSheet, Text, View } from 'react-native';
import { useTeam } from '../context/TeamContext';
import { colors } from '../theme';

export default function TeamScreen({ navigation }) {
  const { team, ready, removePokemon } = useTeam();
  const totals = useMemo(() => (team[0]?.stats ?? []).map((stat) => ({
    name: stat.name,
    value: team.reduce((sum, member) => sum + (member.stats?.find((item) => item.name === stat.name)?.value ?? 0), 0),
  })), [team]);

  if (!ready) return <View style={styles.center}><ActivityIndicator size="large" /></View>;
  return (
    <View style={styles.screen}>
      <View style={styles.titleBlock}>
        <View><Text style={styles.eyebrow}>YOUR ROSTER</Text><Text style={styles.heading}>My Team</Text></View>
        <View style={styles.countBadge}><Text style={styles.count}>{team.length}/6</Text></View>
      </View>
      {team.length > 0 && <View style={styles.totals}>
        <Text style={styles.subheading}>Combined base stats</Text>
        <View style={styles.totalGrid}>{totals.map((stat) => <View key={stat.name} style={styles.totalChip}>
          <Text style={styles.totalLabel}>{stat.name.replace('-', ' ')}</Text><Text style={styles.totalValue}>{stat.value}</Text>
        </View>)}</View>
      </View>}
      <FlatList data={team} keyExtractor={(item) => String(item.id)} contentContainerStyle={styles.list}
        ListEmptyComponent={<Text style={styles.empty}>Your team is empty. Browse the Pokédex and add up to six Pokémon.</Text>}
        renderItem={({ item }) => <View style={styles.card}>
          <Pressable style={styles.member} onPress={() => navigation.navigate('Detail', { id: item.id })}>
            <View style={styles.artworkFrame}><Image source={{ uri: item.image }} style={styles.image} /></View>
            <View><Text style={styles.number}>#{String(item.id).padStart(4, '0')}</Text><Text style={styles.name}>{item.name}</Text></View>
          </Pressable>
          <Pressable accessibilityRole="button" accessibilityLabel={`Remove ${item.name} from team`} onPress={() => removePokemon(item.id)} style={styles.remove}>
            <Text style={styles.removeText}>Remove</Text>
          </Pressable>
        </View>}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.paper }, center: { flex: 1, alignItems: 'center', justifyContent: 'center', backgroundColor: colors.paper },
  titleBlock: { marginHorizontal: 18, marginTop: 18, marginBottom: 13, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  eyebrow: { fontSize: 10, color: colors.terracotta, letterSpacing: 1.2, fontWeight: '800' }, heading: { fontSize: 27, fontWeight: '800', color: colors.ink, marginTop: 3 },
  countBadge: { backgroundColor: colors.greenSoft, borderRadius: 14, paddingHorizontal: 13, paddingVertical: 8 }, count: { color: colors.green, fontSize: 15, fontWeight: '800' },
  totals: { backgroundColor: colors.surface, marginHorizontal: 14, padding: 15, borderRadius: 17, borderWidth: 1, borderColor: colors.border },
  subheading: { fontSize: 15, fontWeight: '700', marginBottom: 11, color: colors.ink },
  totalGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 7 }, totalChip: { minWidth: '30%', flexGrow: 1, backgroundColor: colors.paper, paddingHorizontal: 10, paddingVertical: 8, borderRadius: 10 },
  totalLabel: { color: colors.muted, textTransform: 'capitalize', fontSize: 10, fontWeight: '600' }, totalValue: { color: colors.green, fontSize: 15, fontWeight: '800', marginTop: 2 },
  list: { paddingVertical: 8, flexGrow: 1 }, card: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', backgroundColor: colors.surface, marginHorizontal: 14, marginVertical: 5, padding: 10, borderRadius: 16, borderWidth: 1, borderColor: colors.border },
  member: { flexDirection: 'row', alignItems: 'center', flex: 1 }, artworkFrame: { width: 64, height: 64, marginRight: 12, borderRadius: 13, backgroundColor: colors.greenSoft, alignItems: 'center', justifyContent: 'center' }, image: { width: 62, height: 62 },
  number: { color: colors.muted, fontSize: 10, letterSpacing: 1, fontWeight: '700' }, name: { fontWeight: '700', fontSize: 17, textTransform: 'capitalize', color: colors.ink, marginTop: 3 },
  remove: { paddingVertical: 8, paddingHorizontal: 11, borderRadius: 10, backgroundColor: colors.terracottaSoft }, removeText: { color: colors.danger, fontWeight: '700', fontSize: 12 },
  empty: { textAlign: 'center', color: colors.muted, margin: 30, lineHeight: 23, backgroundColor: colors.surface, padding: 22, borderRadius: 16, overflow: 'hidden' },
});
