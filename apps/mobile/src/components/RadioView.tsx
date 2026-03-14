import React, { useState } from 'react';
import { 
  View, 
  Text, 
  TouchableOpacity, 
  StyleSheet, 
  Dimensions, 
  ScrollView,
  SafeAreaView
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Play, Pause, Heart } from 'lucide-react-native';
import { useSampler } from '../engines/SamplerEngine';
import { TOKENS } from '../theme/tokens';

const { width } = Dimensions.get('window');
const PlayIcon = Play as any;
const PauseIcon = Pause as any;
const HeartIcon = Heart as any;

interface RadioViewProps {
  onClose: () => void;
}

export const RadioView: React.FC<RadioViewProps> = ({ onClose }) => {
  const { 
    categories, 
    selectedCategory, 
    setCategory, 
    radioSounds,
    isPlaying,
    togglePlayback,
    playbackProgress,
    toggleFavorite,
    favoriteSounds
  } = useSampler();

  const [showCategories, setShowCategories] = useState(true);

  // Active sound in the radio stream
  const activeSound = radioSounds[0] || null;
  const isFavorited = activeSound ? favoriteSounds.some(s => s.uri === activeSound.uri) : false;

  const handleCategorySelect = (category: string) => {
    setCategory(category);
  };

  const insets = useSafeAreaInsets();

  return (
    <View style={styles.container}>
      <View style={[styles.flex, { paddingTop: insets.top }]}>
        <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
          
          {/* Album Art Placeholder */}
          <View style={styles.albumArtContainer}>
            <View style={styles.albumArtPlaceholder} />
          </View>

          {/* Player Info */}
          <View style={styles.playerSection}>
            <Text style={styles.categoryLabel}>{selectedCategory || 'Select a Category'}</Text>
            
            <View style={styles.controlsRow}>
              <TouchableOpacity 
                style={styles.playButton} 
                onPress={() => activeSound && togglePlayback(activeSound.uri)}
              >
                {isPlaying ? (
                  <PauseIcon size={32} fill={TOKENS.colors.text.onColor} stroke={TOKENS.colors.text.onColor} />
                ) : (
                  <PlayIcon size={32} fill={TOKENS.colors.text.onColor} stroke={TOKENS.colors.text.onColor} />
                )}
              </TouchableOpacity>

              <View style={styles.soundInfo}>
                <View style={styles.titleRow}>
                  <Text style={styles.soundName} numberOfLines={1}>
                    {activeSound?.name || 'Radio Stream Offline'}
                  </Text>
                  <Text style={styles.duration}>23s</Text>
                </View>
                
                <View style={styles.progressBarContainer}>
                  <View style={[styles.progressBar, { width: `${playbackProgress * 100}%` }]} />
                </View>

                <View style={styles.metadataRow}>
                  <Text style={styles.metadataText}>
                    {activeSound?.author || 'Unknown Artist'}, {activeSound?.locationName || 'Global Tapestry'}
                  </Text>
                  <Text style={styles.dateText}>{activeSound?.date || '12.03.2026'}</Text>
                </View>
              </View>

              <TouchableOpacity 
                style={styles.favoriteButton}
                onPress={() => activeSound && toggleFavorite(activeSound)}
              >
                <HeartIcon 
                  size={28} 
                  fill={isFavorited ? TOKENS.colors.interactive.warning : "transparent"} 
                  stroke={isFavorited ? TOKENS.colors.interactive.warning : TOKENS.colors.text.onColor} 
                />
              </TouchableOpacity>
            </View>
          </View>

          {/* Category Browser */}
          <View style={styles.browserHeader}>
            <Text style={styles.browserTitle}>Browse Categories</Text>
            <TouchableOpacity onPress={() => setShowCategories(!showCategories)}>
              <Text style={styles.toggleText}>{showCategories ? 'Hide' : 'Show'}</Text>
            </TouchableOpacity>
          </View>

          {showCategories && (
            <View style={styles.categoriesGrid}>
              {categories.map((cat, index) => (
                <TouchableOpacity 
                  key={index} 
                  style={[
                    styles.categoryItem,
                    selectedCategory === cat && styles.activeCategoryItem
                  ]}
                  onPress={() => handleCategorySelect(cat)}
                >
                  <Text style={[
                    styles.categoryItemText,
                    selectedCategory === cat && styles.activeCategoryItemText
                  ]}>
                    {cat}
                  </Text>
                  <View style={styles.underline} />
                </TouchableOpacity>
              ))}
            </View>
          )}
        </ScrollView>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: TOKENS.colors.background,
  },
  safeArea: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: TOKENS.layout.containerPadding,
    paddingTop: TOKENS.spacing['05'],
    paddingBottom: TOKENS.spacing['09'],
  },
  albumArtContainer: {
    alignItems: 'center',
    marginBottom: TOKENS.spacing['09'],
  },
  albumArtPlaceholder: {
    width: width - 80,
    height: width - 80,
    backgroundColor: TOKENS.colors.layer['01'],
  },
  playerSection: {
    marginBottom: 80,
  },
  categoryLabel: {
    fontSize: 18,
    color: TOKENS.colors.text.primary,
    fontFamily: TOKENS.fonts.body,
    marginBottom: TOKENS.spacing['06'],
  },
  controlsRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  playButton: {
    width: 64,
    height: 64,
    borderRadius: 32,
    borderWidth: 2,
    borderColor: TOKENS.colors.text.primary,
    backgroundColor: TOKENS.colors.interactive['03'],
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: TOKENS.spacing['05'],
  },
  soundInfo: {
    flex: 1,
    marginRight: TOKENS.spacing['04'],
  },
  titleRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'baseline',
    marginBottom: TOKENS.spacing['03'],
  },
  soundName: {
    flex: 1,
    fontSize: 20,
    color: TOKENS.colors.text.primary,
    fontFamily: TOKENS.fonts.heading,
    fontWeight: '600',
    marginRight: TOKENS.spacing['03'],
  },
  duration: {
    fontSize: 18,
    color: TOKENS.colors.text.primary,
    fontFamily: TOKENS.fonts.body,
  },
  progressBarContainer: {
    height: 4,
    backgroundColor: TOKENS.colors.layer['02'],
    borderRadius: 2,
    marginBottom: TOKENS.spacing['04'],
    overflow: 'hidden',
  },
  progressBar: {
    height: '100%',
    backgroundColor: TOKENS.colors.interactive.warning,
  },
  metadataRow: {
    gap: 2,
  },
  metadataText: {
    fontSize: 12,
    color: TOKENS.colors.text.secondary,
    fontFamily: TOKENS.fonts.body,
  },
  dateText: {
    fontSize: 12,
    color: TOKENS.colors.text.placeholder,
    fontFamily: TOKENS.fonts.body,
  },
  favoriteButton: {
    padding: TOKENS.spacing['02'],
  },
  browserHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingBottom: TOKENS.spacing['04'],
    borderBottomWidth: 1,
    borderBottomColor: TOKENS.colors.layer['02'],
    marginBottom: TOKENS.spacing['07'],
    marginTop: TOKENS.spacing['05'],
  },
  browserTitle: {
    fontSize: 24,
    color: TOKENS.colors.text.primary,
    fontFamily: TOKENS.fonts.heading,
    fontWeight: '600',
  },
  toggleText: {
    fontSize: 18,
    color: TOKENS.colors.text.primary,
    fontFamily: TOKENS.fonts.body,
  },
  categoriesGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  categoryItem: {
    width: '30%',
    marginBottom: TOKENS.spacing['06'],
  },
  activeCategoryItem: {
    // Styling for active state
  },
  categoryItemText: {
    fontSize: 18,
    color: TOKENS.colors.text.primary,
    fontFamily: TOKENS.fonts.body,
    marginBottom: TOKENS.spacing['02'],
  },
  activeCategoryItemText: {
    fontWeight: 'bold',
    color: TOKENS.colors.interactive['03'],
  },
  underline: {
    height: 1,
    backgroundColor: TOKENS.colors.layer['02'],
    width: '100%',
  },
  flex: {
    flex: 1,
  },
});
