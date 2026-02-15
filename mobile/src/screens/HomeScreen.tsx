import { useState } from 'react';
import { ScrollView, Text, View } from 'react-native';
import { fetchStores, type Store } from '../api/client';
import { ThemedButton } from '../components/ThemedButton';
import { theme } from '../theme/theme';

export function HomeScreen() {
  const [stores, setStores] = useState<Store[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const loadStores = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await fetchStores();
      setStores(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Something went wrong');
    } finally {
      setLoading(false);
    }
  };

  return (
    <ScrollView
      contentContainerStyle={{
        padding: theme.spacing.xl,
        gap: theme.spacing.lg
      }}
    >
      <Text style={{ fontSize: theme.text.title, color: theme.colors.foreground, fontWeight: '700' }}>
        StoreVille Mobile
      </Text>
      <Text style={{ fontSize: theme.text.subtitle, color: theme.colors.mutedText }}>
        Powered by Django + Django REST API endpoints from your StoreVille backend.
      </Text>

      <ThemedButton label={loading ? 'Loading…' : 'Load stores from Django API'} onPress={loadStores} />

      {error ? <Text style={{ color: theme.colors.danger }}>{error}</Text> : null}

      {stores.map((store) => (
        <View
          key={store.id}
          style={{
            backgroundColor: theme.colors.card,
            borderRadius: theme.radius.xl,
            borderColor: theme.colors.border,
            borderWidth: 1,
            padding: theme.spacing.lg
          }}
        >
          <Text style={{ color: theme.colors.foreground, fontWeight: '700', fontSize: theme.text.subtitle }}>
            {store.name}
          </Text>
          <Text style={{ color: theme.colors.mutedText }}>{store.category}</Text>
          <Text style={{ color: theme.colors.mutedText }}>/{store.slug}</Text>
        </View>
      ))}
    </ScrollView>
  );
}
