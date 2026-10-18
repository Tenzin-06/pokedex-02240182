import { useCallback, useEffect, useState } from 'react';
import { ActivityIndicator, Image, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { fetchPokemonPage } from '../api';
import { colors } from '../theme';

function shuffled(items) {
  const copy = [...items];
  for (let i = copy.length - 1; i > 0; i -= 1) {
    const j = Math.floor(Math.random() * (i + 1));
    [copy[i], copy[j]] = [copy[j], copy[i]];
  }
  return copy;
}

export default function GameScreen() {
  const [pokemon, setPokemon] = useState([]);
  const [round, setRound] = useState(null);
  const [selected, setSelected] = useState(null);
  const [hintVisible, setHintVisible] = useState(false);
  const [score, setScore] = useState(0);
  const [streak, setStreak] = useState(0);
  const [bestStreak, setBestStreak] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  const loadPokemon = useCallback(async () => {
    setLoading(true);
    setError(false);
    try {
      const list = await fetchPokemonPage(0, 151);
      setPokemon(list);
      setRound(makeRound(list));
    } catch (err) {
      setError(true);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { loadPokemon(); }, [loadPokemon]);

  const nextRound = () => {
    setSelected(null);
    setHintVisible(false);
    setRound(makeRound(pokemon));
  };
  const answer = (option) => {
    if (selected) return;
    setSelected(option.id);
    if (option.id === round.answer.id) {
      setScore((value) => value + 1);
      setStreak((value) => {
        const next = value + 1;
        setBestStreak((best) => Math.max(best, next));
        return next;
      });
    } else {
      setStreak(0);
    }
  };

  if (loading) return <View style={styles.center}><ActivityIndicator size="large" /></View>;
  if (error) return <View style={styles.center}><Text style={styles.message}>Could not load game Pokémon. Check your connection.</Text><Pressable style={styles.nextButton} onPress={loadPokemon}><Text style={styles.nextText}>Retry</Text></Pressable></View>;
  if (!round) return null;

  return (
    <ScrollView style={styles.screen} contentContainerStyle={styles.content}>
      <Text style={styles.eyebrow}>GUESSING GAME  ·  FIRST 151</Text>
      <Text style={styles.heading}>Who's that Pokémon?</Text>
      <View style={styles.scoreCard}>
        <View style={styles.scoreItem}><Text style={styles.scoreLabel}>SCORE</Text><Text style={styles.scoreValue}>{score}</Text></View>
        <View style={styles.scoreDivider} />
        <View style={styles.scoreItem}><Text style={styles.scoreLabel}>STREAK</Text><Text style={styles.scoreValue}>{streak}</Text></View>
        <View style={styles.scoreDivider} />
        <View style={styles.scoreItem}><Text style={styles.scoreLabel}>BEST</Text><Text style={styles.scoreValue}>{bestStreak}</Text></View>
      </View>
      <View style={styles.pictureWrap}>
        <Image source={{ uri: round.answer.image }} style={[styles.picture, !selected && styles.silhouette]} />
      </View>
      <Text style={styles.prompt}>{selected ? round.answer.name : 'Who is this Pokémon?'}</Text>
      {!selected && <Pressable onPress={() => setHintVisible(true)} style={styles.hintButton}><Text style={styles.hintText}>{hintVisible ? `Hint: starts with “${round.answer.name[0].toUpperCase()}”` : 'Show hint'}</Text></Pressable>}
      <View style={styles.options}>
        {round.options.map((option) => {
          let answerStyle;
          if (selected && option.id === round.answer.id) answerStyle = styles.correct;
          else if (selected === option.id) answerStyle = styles.wrong;
          return <Pressable key={option.id} disabled={Boolean(selected)} onPress={() => answer(option)} style={[styles.option, answerStyle]}>
            <Text style={styles.optionText}>{option.name}</Text>
          </Pressable>;
        })}
      </View>
      {selected && <Pressable style={styles.nextButton} onPress={nextRound}><Text style={styles.nextText}>Next Pokémon</Text></Pressable>}
    </ScrollView>
  );
}

function makeRound(list) {
  if (list.length < 4) return null;
  const answer = list[Math.floor(Math.random() * list.length)];
  const distractors = shuffled(list.filter((item) => item.id !== answer.id)).slice(0, 3);
  return { answer, options: shuffled([answer, ...distractors]) };
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.paper },
  content: { flexGrow: 1, alignItems: 'center', padding: 18, paddingBottom: 30 },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 24, backgroundColor: colors.paper },
  eyebrow: { color: colors.terracotta, fontSize: 10, fontWeight: '800', letterSpacing: 1.3, marginTop: 8 },
  heading: { fontSize: 25, fontWeight: '800', marginTop: 5, color: colors.ink, textAlign: 'center' },
  scoreCard: { width: '100%', flexDirection: 'row', alignItems: 'center', justifyContent: 'space-around', backgroundColor: colors.surface, borderRadius: 15, borderWidth: 1, borderColor: colors.border, paddingVertical: 10, marginTop: 16, marginBottom: 16 },
  scoreItem: { alignItems: 'center', flex: 1 }, scoreLabel: { color: colors.muted, fontSize: 9, fontWeight: '800', letterSpacing: 1 }, scoreValue: { color: colors.green, fontSize: 18, fontWeight: '800', marginTop: 2 },
  scoreDivider: { width: 1, height: 28, backgroundColor: colors.border },
  pictureWrap: { width: 250, height: 250, justifyContent: 'center', alignItems: 'center', backgroundColor: colors.greenSoft, borderRadius: 28, borderWidth: 1, borderColor: '#D8E3DA' },
  picture: { width: 230, height: 230 }, silhouette: { tintColor: colors.ink },
  prompt: { fontSize: 20, fontWeight: '800', textTransform: 'capitalize', marginVertical: 12, color: colors.ink },
  options: { width: '100%', gap: 10 },
  option: { backgroundColor: colors.surface, borderRadius: 13, padding: 15, alignItems: 'center', borderWidth: 1, borderColor: colors.border },
  optionText: { fontSize: 16, fontWeight: '700', textTransform: 'capitalize', color: colors.ink },
  hintButton: { paddingVertical: 8, paddingHorizontal: 15, marginBottom: 8, backgroundColor: colors.terracottaSoft, borderRadius: 20 }, hintText: { color: colors.terracotta, fontWeight: '700', fontSize: 13 },
  correct: { backgroundColor: '#E2EDE2', borderColor: colors.green }, wrong: { backgroundColor: '#F5E4DF', borderColor: colors.danger },
  nextButton: { marginTop: 18, backgroundColor: colors.green, borderRadius: 13, paddingVertical: 14, paddingHorizontal: 26 },
  nextText: { color: colors.white, fontWeight: '700', fontSize: 15 }, message: { textAlign: 'center', marginBottom: 10, color: colors.muted },
});
