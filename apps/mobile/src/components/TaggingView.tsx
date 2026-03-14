import React, { useState } from 'react';
import { 
  View, 
  Text, 
  TouchableOpacity, 
  StyleSheet, 
  Dimensions, 
  ScrollView 
} from 'react-native';
import { Play, Pause, Trash2, Check } from 'lucide-react-native';
import { useSampler } from '../engines/SamplerEngine';
import { TOKENS } from '../theme/tokens';

const PlayIcon = Play as any;
const PauseIcon = Pause as any;
const Trash2Icon = Trash2 as any;
const CheckIcon = Check as any;

const { width } = Dimensions.get('window');

const TAG_CATEGORIES = [
  'Ambient', 'Nature', 'City sound',
  'Bird song', 'Street', 'Waves',
  'Murmurs', 'Rain', 'Trees',
  'Vehicles', 'Machines', 'Kids',
  'Animals', 'Singing', 'Playing guitar',
  'Poem', 'Spoken word',
  'Musical instruments', 'Laughing'
];

interface TaggingViewProps {
  onUpload: () => void;
  onAbandon: () => void;
}

export const TaggingView: React.FC<TaggingViewProps> = ({ onUpload, onAbandon }) => {
  const { 
    pendingSound, 
    isPlaying, 
    playbackProgress,
    togglePlayback, 
    updatePendingMetadata,
    uploadPendingSound
  } = useSampler();
  
  const [selectedTags, setSelectedTags] = useState<string[]>(pendingSound?.tags || []);
  const [isUploading, setIsUploading] = useState(false);

  if (!pendingSound) return null;

  const toggleTag = (tag: string) => {
    const nextTags = selectedTags.includes(tag)
      ? selectedTags.filter(t => t !== tag)
      : [...selectedTags, tag];
    setSelectedTags(nextTags);
    updatePendingMetadata({ tags: nextTags });
  };

  const handleUpload = async () => {
    if (isUploading) return;
    setIsUploading(true);
    try {
      await uploadPendingSound();
      onUpload();
    } catch (error) {
      console.error('Upload failed:', error);
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.headerRow}>
        <View style={styles.progressBar} />
      </View>

      <View style={styles.soundInfo}>
        <View style={styles.soundHeader}>
          <Text style={styles.soundName}>{pendingSound.name}</Text>
          <Text style={styles.durationText}>
            {(pendingSound.duration / 1000).toFixed(2)}s
          </Text>
        </View>
        <Text style={styles.locationText}>
          {pendingSound.location.lat.toFixed(4)}, {pendingSound.location.lng.toFixed(4)}
        </Text>
      </View>

      <View style={styles.previewSection}>
        <TouchableOpacity 
          style={styles.playButton} 
          onPress={() => togglePlayback(pendingSound.uri)}
        >
          {isPlaying ? (
            <PauseIcon size={32} fill={TOKENS.colors.text.onColor} stroke={TOKENS.colors.text.onColor} />
          ) : (
            <PlayIcon size={32} fill={TOKENS.colors.text.onColor} stroke={TOKENS.colors.text.onColor} />
          )}
        </TouchableOpacity>
        <View style={styles.previewProgressContainer}>
          <View 
            style={[
              styles.previewProgressBar, 
              { width: `${playbackProgress * 100}%` }
            ]} 
          />
        </View>
      </View>

      <View style={styles.tagSection}>
        <Text style={styles.label}>Describe the Sound</Text>
        <ScrollView 
          contentContainerStyle={styles.tagGrid}
          showsVerticalScrollIndicator={false}
        >
          {TAG_CATEGORIES.map(tag => (
            <TouchableOpacity
              key={tag}
              style={[
                styles.tagButton,
                selectedTags.includes(tag) && styles.tagButtonActive
              ]}
              onPress={() => toggleTag(tag)}
            >
              <Text style={[
                styles.tagText,
                selectedTags.includes(tag) && styles.tagTextActive
              ]}>
                {tag}
              </Text>
              {selectedTags.includes(tag) && (
                <CheckIcon size={14} stroke={TOKENS.colors.interactive['03']} style={styles.checkIcon} />
              )}
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>

      <View style={styles.actionsRow}>
        <TouchableOpacity style={styles.abandonButton} onPress={onAbandon}>
          <Trash2Icon size={32} stroke={TOKENS.colors.text.primary} />
        </TouchableOpacity>

        <TouchableOpacity 
          style={[styles.uploadButton, (selectedTags.length === 0 || isUploading) && { opacity: 0.5 }]} 
          onPress={handleUpload}
          disabled={selectedTags.length === 0 || isUploading}
        >
          <Text style={styles.uploadText}>{isUploading ? 'Uploading...' : 'Upload Sound'}</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    paddingTop: TOKENS.spacing['05'],
    paddingHorizontal: TOKENS.layout.containerPadding,
    width: '100%',
    backgroundColor: TOKENS.colors.background,
  },
  headerRow: {
    width: '100%',
    height: 6,
    backgroundColor: TOKENS.colors.layer['02'],
    borderRadius: 3,
    marginBottom: TOKENS.spacing['07'],
  },
  progressBar: {
    width: '100%', 
    height: '100%',
    backgroundColor: TOKENS.colors.interactive.warning,
    borderRadius: 2,
  },
  soundInfo: {
    width: '100%',
    borderBottomWidth: 1,
    borderBottomColor: TOKENS.colors.layer['01'],
    paddingBottom: TOKENS.spacing['05'],
    marginBottom: TOKENS.spacing['06'],
  },
  soundHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: TOKENS.spacing['02'],
  },
  soundName: {
    fontSize: 22,
    color: TOKENS.colors.text.primary,
    fontFamily: TOKENS.fonts.heading,
    fontWeight: '600',
  },
  durationText: {
    fontSize: 16,
    color: TOKENS.colors.text.primary,
    fontFamily: TOKENS.fonts.body,
    opacity: 0.8,
  },
  locationText: {
    fontSize: 14,
    color: TOKENS.colors.text.placeholder,
    fontFamily: TOKENS.fonts.body,
  },
  previewSection: {
    flexDirection: 'row',
    alignItems: 'center',
    width: '100%',
    marginBottom: TOKENS.spacing['07'],
  },
  previewProgressContainer: {
    flex: 1,
    height: 6,
    backgroundColor: TOKENS.colors.layer['02'],
    borderRadius: 3,
  },
  previewProgressBar: {
    height: '100%',
    backgroundColor: TOKENS.colors.interactive.warning,
    borderRadius: 2,
  },
  playButton: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: TOKENS.colors.interactive['03'],
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: TOKENS.spacing['05'],
  },
  tagSection: {
    flex: 1,
    width: '100%',
  },
  label: {
    fontSize: 20,
    color: TOKENS.colors.text.primary,
    fontFamily: TOKENS.fonts.heading,
    marginBottom: TOKENS.spacing['05'],
  },
  tagGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'flex-start',
    paddingBottom: TOKENS.spacing['07'],
  },
  tagButton: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: TOKENS.layout.borderRadius,
    borderWidth: 1,
    borderColor: TOKENS.colors.text.placeholder,
    marginRight: TOKENS.spacing['03'],
    marginBottom: TOKENS.spacing['03'],
    flexDirection: 'row',
    alignItems: 'center',
  },
  tagButtonActive: {
    backgroundColor: TOKENS.colors.text.primary,
    borderColor: TOKENS.colors.text.primary,
  },
  tagText: {
    color: TOKENS.colors.text.primary,
    fontSize: 16,
    fontFamily: TOKENS.fonts.body,
  },
  tagTextActive: {
    color: TOKENS.colors.interactive['03'],
    fontWeight: '700',
  },
  checkIcon: {
    marginLeft: 6,
  },
  actionsRow: {
    width: '100%',
    flexDirection: 'column',
    alignItems: 'center',
    paddingVertical: TOKENS.spacing['06'],
  },
  abandonButton: {
    marginBottom: TOKENS.spacing['06'],
  },
  uploadButton: {
    width: '100%',
    height: 60,
    backgroundColor: TOKENS.colors.text.primary,
    borderRadius: TOKENS.layout.borderRadius,
    justifyContent: 'center',
    alignItems: 'center',
  },
  uploadText: {
    color: TOKENS.colors.background,
    fontSize: 22,
    fontWeight: '700',
    fontFamily: TOKENS.fonts.body,
  },
});
