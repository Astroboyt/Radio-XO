import React, { useState } from 'react';
import { 
  View, 
  Text, 
  TouchableOpacity, 
  StyleSheet, 
  Dimensions, 
  TextInput,
  KeyboardAvoidingView,
  Platform,
  ScrollView
} from 'react-native';
import { Play, Pause, Trash2 } from 'lucide-react-native';
import { useSampler } from '../engines/SamplerEngine';
import { WaveformVisualizer } from './WaveformVisualizer';
import { TOKENS } from '../theme/tokens';

const PlayIcon = Play as any;
const PauseIcon = Pause as any;
const Trash2Icon = Trash2 as any;

const { width } = Dimensions.get('window');

interface NamingViewProps {
  onNext: () => void;
  onAbandon: () => void;
}

export const NamingView: React.FC<NamingViewProps> = ({ onNext, onAbandon }) => {
  const { 
    pendingSound, 
    isPlaying, 
    playbackProgress,
    togglePlayback, 
    updatePendingMetadata 
  } = useSampler();
  
  const [name, setName] = useState(pendingSound?.name || '');

  if (!pendingSound) return null;

  const handleNext = () => {
    updatePendingMetadata({ name });
    onNext();
  };

  return (
    <KeyboardAvoidingView 
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={styles.keyboardContainer}
    >
      <ScrollView 
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.statusRow}>
          <View style={styles.recordingDot} />
          <Text style={styles.statusText}>Sound captured</Text>
        </View>

        <View style={styles.visualizerContainer}>
          <WaveformVisualizer rmsLevel={isPlaying ? 0.5 : 0} />
        </View>

        <View style={styles.previewRow}>
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
          <View style={styles.miniProgressContainer}>
            <View 
              style={[
                styles.miniProgressBar, 
                { width: `${playbackProgress * 100}%` }
              ]} 
            />
          </View>
          <Text style={styles.durationText}>
            {(pendingSound.duration / 1000).toFixed(2)}s
          </Text>
        </View>

        <View style={styles.inputSection}>
          <Text style={styles.label}>Name your sound</Text>
          <TextInput
            style={styles.input}
            placeholder="Descriptive sound name"
            placeholderTextColor={TOKENS.colors.text.placeholder}
            value={name}
            onChangeText={setName}
            autoFocus
          />
          <Text style={styles.locationText}>
            Captured at {pendingSound.location.lat.toFixed(4)}, {pendingSound.location.lng.toFixed(4)}
          </Text>
        </View>

        <View style={styles.actionsRow}>
          <TouchableOpacity style={styles.abandonButton} onPress={onAbandon}>
            <Trash2Icon size={32} stroke={TOKENS.colors.text.primary} />
          </TouchableOpacity>

          <TouchableOpacity 
            style={styles.nextButton} 
            onPress={handleNext}
            disabled={!name.trim()}
          >
            <Text style={styles.nextText}>Next</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  keyboardContainer: {
    flex: 1,
  },
  scrollContent: {
    alignItems: 'center',
    paddingTop: TOKENS.spacing['07'],
    paddingHorizontal: TOKENS.layout.containerPadding,
    paddingBottom: TOKENS.spacing['10'],
  },
  statusRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: TOKENS.spacing['06'],
    alignSelf: 'flex-start',
  },
  recordingDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: TOKENS.colors.text.primary,
    marginRight: TOKENS.spacing['03'],
    opacity: 0.6,
  },
  statusText: {
    fontSize: 24,
    color: TOKENS.colors.text.primary,
    fontFamily: TOKENS.fonts.body,
    fontWeight: '600',
  },
  visualizerContainer: {
    width: '100%',
    height: 120,
    backgroundColor: TOKENS.colors.layer['01'],
    borderRadius: TOKENS.layout.borderRadius,
    marginBottom: TOKENS.spacing['06'],
    justifyContent: 'center',
    alignItems: 'center',
    overflow: 'hidden',
  },
  previewRow: {
    flexDirection: 'row',
    alignItems: 'center',
    width: '100%',
    marginBottom: TOKENS.spacing['07'],
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
  miniProgressContainer: {
    flex: 1,
    height: 6,
    backgroundColor: TOKENS.colors.layer['02'],
    borderRadius: 3,
    marginRight: TOKENS.spacing['03'],
  },
  miniProgressBar: {
    height: '100%',
    backgroundColor: TOKENS.colors.interactive.warning,
    borderRadius: 2,
  },
  durationText: {
    color: TOKENS.colors.text.primary,
    fontSize: 16,
    fontFamily: TOKENS.fonts.body,
  },
  inputSection: {
    width: '100%',
    marginBottom: TOKENS.spacing['07'],
  },
  label: {
    fontSize: 18,
    color: TOKENS.colors.text.primary,
    fontFamily: TOKENS.fonts.body,
    marginBottom: TOKENS.spacing['05'],
  },
  input: {
    borderBottomWidth: 1,
    borderBottomColor: TOKENS.colors.text.placeholder,
    color: TOKENS.colors.text.primary,
    fontSize: 20,
    fontFamily: TOKENS.fonts.body,
    paddingVertical: TOKENS.spacing['03'],
    marginBottom: TOKENS.spacing['03'],
  },
  locationText: {
    fontSize: 14,
    color: TOKENS.colors.text.placeholder,
    fontFamily: TOKENS.fonts.body,
  },
  actionsRow: {
    width: '100%',
    flexDirection: 'column',
    alignItems: 'center',
    marginTop: TOKENS.spacing['06'],
  },
  abandonButton: {
    marginBottom: TOKENS.spacing['06'],
  },
  nextButton: {
    width: '100%',
    height: 60,
    backgroundColor: TOKENS.colors.text.primary,
    borderRadius: TOKENS.layout.borderRadius,
    justifyContent: 'center',
    alignItems: 'center',
  },
  nextText: {
    color: TOKENS.colors.background,
    fontSize: 22,
    fontWeight: '600',
    fontFamily: TOKENS.fonts.body,
  },
});
