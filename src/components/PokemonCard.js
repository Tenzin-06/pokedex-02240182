import { memo } from 'react';
import { View, Text, Image, Pressable, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors } from '../theme';

function PokemonCard({ id, name, image, onPress }) {
    return (
        <Pressable style={({ pressed }) => [styles.card, pressed && styles.pressed]} onPress={() => onPress(id)}>
            <View style={styles.artworkFrame}><Image source={{ uri: image }} style={styles.image} /></View>
            <View style={styles.copy}>
                <Text style={styles.number}>#{String(id).padStart(4, '0')}</Text>
                <Text style={styles.name}>{name}</Text>
            </View>
            <Ionicons name="chevron-forward" size={19} color={colors.muted} />
        </Pressable>
    );
}

export default memo(PokemonCard);

const styles = StyleSheet.create({
    card: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: colors.surface,
        marginHorizontal: 16,
        marginVertical: 5,
        padding: 10,
        borderRadius: 16,
        borderWidth: 1,
        borderColor: colors.border,
        minHeight: 94,
    },
    pressed: { backgroundColor: colors.greenSoft, transform: [{ scale: 0.99 }] },
    artworkFrame: { width: 72, height: 72, borderRadius: 13, backgroundColor: colors.greenSoft, alignItems: 'center', justifyContent: 'center' },

    image: {
        width: 68,
        height: 68,
    },
    copy: { flex: 1, marginLeft: 14 },

    number: {
        color: colors.muted,
        fontSize: 12,
    },

    name: {
        fontSize: 18,
        fontWeight: '700',
        textTransform: 'capitalize',
        color: colors.ink,
    },
});
