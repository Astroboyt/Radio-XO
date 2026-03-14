import React, { useEffect, useState, useCallback } from 'react';
import { View, Text, StyleSheet, FlatList, ActivityIndicator, RefreshControl } from 'react-native';
import { TOKENS } from '../theme/tokens';
import { supabase, handleSupabaseCall } from '../lib/supabase';

interface ActivityItem {
  id: string;
  name: string;
  author: string;
  duration: string;
  createdAt: string;
}

interface SupabaseSoundResponse {
  id: string;
  title: string;
  duration_ms: number;
  created_at: string;
  profiles: {
    username: string;
  } | null;
}

export const ActivityFeed = () => {
  const [activities, setActivities] = useState<ActivityItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const fetchActivities = useCallback(async () => {
    const data = await handleSupabaseCall<SupabaseSoundResponse[]>(async () => {
      return await supabase
        .from('sounds')
        .select(`
          id,
          title,
          duration_ms,
          created_at,
          profiles:user_id (
            username
          )
        `)
        .order('created_at', { ascending: false })
        .limit(3) as any; // Cast builder to any to pass to generic handler
    }, 'Fetch Activity');

    if (data) {
      const formatted: ActivityItem[] = data.map(item => ({
        id: item.id,
        name: item.title,
        author: item.profiles?.username || 'Anonymous',
        duration: `${Math.round(item.duration_ms / 1000)}s`,
        createdAt: item.created_at,
      }));
      setActivities(formatted);
    }
    setLoading(false);
    setRefreshing(false);
  }, []);

  useEffect(() => {
    fetchActivities();

    // Subscribe to new uploads
    const subscription = supabase
      .channel('public:sounds')
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'sounds' }, () => {
        fetchActivities();
      })
      .subscribe();

    return () => {
      supabase.removeChannel(subscription);
    };
  }, [fetchActivities]);

  const onRefresh = () => {
    setRefreshing(true);
    fetchActivities();
  };

  const renderItem = ({ item }: { item: ActivityItem }) => (
    <View style={styles.itemContainer}>
      <View style={styles.textRow}>
        <Text style={styles.nameText} numberOfLines={1}>{item.name}</Text>
        <Text style={styles.uploadedByText}> uploaded </Text>
        <Text style={styles.byText}>by </Text>
        <Text style={styles.authorText} numberOfLines={1}>{item.author}</Text>
      </View>
      <Text style={styles.durationText}>{item.duration}</Text>
    </View>
  );

  if (loading && !refreshing) {
    return (
      <View style={[styles.container, styles.center]}>
        <ActivityIndicator color={TOKENS.colors.interactive.warning} size="large" />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Activity</Text>
      <FlatList
        data={activities}
        keyExtractor={(item) => item.id}
        renderItem={renderItem}
        ItemSeparatorComponent={() => <View style={styles.divider} />}
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={TOKENS.colors.interactive.warning} />
        }
        ListEmptyComponent={
          <Text style={styles.emptyText}>No sounds captured yet. Be the first!</Text>
        }
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingHorizontal: TOKENS.layout.containerPadding,
    backgroundColor: TOKENS.colors.background,
  },
  center: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  title: {
    fontSize: 22,
    color: TOKENS.colors.text.primary,
    fontFamily: TOKENS.fonts.heading, // Schoolbell
    fontWeight: '400', // Schoolbell Regular
    marginBottom: TOKENS.spacing['04'],
    marginTop: TOKENS.spacing['04'],
  },
  listContent: {
    paddingBottom: TOKENS.spacing['07'],
  },
  itemContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 16,
  },
  textRow: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    marginRight: 10,
  },
  nameText: {
    fontSize: 15,
    color: TOKENS.colors.text.primary,
    fontFamily: TOKENS.fonts.body, // Degular
    fontWeight: '700',
    flexShrink: 1,
  },
  uploadedByText: {
    fontSize: 13,
    color: TOKENS.colors.text.secondary,
    fontFamily: TOKENS.fonts.body, // Degular
  },
  byText: {
    fontSize: 13,
    color: TOKENS.colors.text.secondary,
    fontFamily: TOKENS.fonts.body, // Degular
  },
  authorText: {
    fontSize: 15,
    color: TOKENS.colors.text.primary,
    fontFamily: TOKENS.fonts.body, // Degular
    fontWeight: '700',
    flexShrink: 1,
  },
  durationText: {
    fontSize: 14,
    color: TOKENS.colors.text.secondary,
    fontFamily: TOKENS.fonts.body,
    minWidth: 40,
    textAlign: 'right',
  },
  divider: {
    height: 1,
    backgroundColor: TOKENS.colors.layer['01'],
    width: '100%',
    opacity: 1,
  },
  emptyText: {
    color: TOKENS.colors.text.placeholder,
    textAlign: 'center',
    marginTop: 40,
    fontFamily: TOKENS.fonts.body,
    fontSize: 16,
  },
});
