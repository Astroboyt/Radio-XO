import React, { useMemo } from 'react';
import { 
  View, 
  Text, 
  TouchableOpacity, 
  StyleSheet, 
  Dimensions 
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { 
  Square, 
  RotateCcw, 
  Trash2 
} from 'lucide-react-native';
import { WaveformVisualizer } from './WaveformVisualizer';
import { useSampler } from '../engines/SamplerEngine';
import { TOKENS } from '../theme/tokens';

const SquareIcon = Square as any;
const RotateCcwIcon = RotateCcw as any;
const Trash2Icon = Trash2 as any;

const { width } = Dimensions.get('window');

interface RecordingViewProps {
  onStop: () => void;
}

/**
 * RecordingView
 * The dedicated screen for active recording state.
 * Features real-time waveform, duration, and industrial controls.
 */
export const RecordingView: React.FC<RecordingViewProps> = ({ onStop }) => {
  const { 
    recordingDuration, 
    rmsLevel, 
    stopRecording, 
    deleteRecording, 
    restartRecording 
  } = useSampler();
  const insets = useSafeAreaInsets();

  const formatDuration = (ms: number) => {
    const totalSeconds = Math.floor(ms / 1000);
    const minutes = Math.floor(totalSeconds / 60);
    const seconds = totalSeconds % 60;
    return `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}s`;
  };

  const progress = useMemo(() => {
    // 60s max recording for this UI style
    return Math.min(100, (recordingDuration / 60000) * 100);
  }, [recordingDuration]);

  const handleStop = async () => {
    await stopRecording();
    onStop();
  };

  return (
    <View style={[styles.container, { paddingTop: insets.top + TOKENS.spacing['05'] }]}>
      {/* Recording Status */}
      <View style={styles.statusRow}>
        <View style={styles.recordingDot} />
        <Text style={styles.statusText}>Recording</Text>
      </View>

      {/* Waveform Visualization */}
      <View style={styles.visualizerContainer}>
        <WaveformVisualizer rmsLevel={rmsLevel} />
      </View>

      {/* Progress & Time */}
      <View style={styles.timeRow}>
        <Text style={styles.timeText}>{formatDuration(recordingDuration)}</Text>
      </View>
      <View style={styles.progressBarContainer}>
        <View style={[styles.progressBar, { width: `${progress}%` }]} />
      </View>

      <View style={styles.controlsRow}>
        <TouchableOpacity 
          style={styles.secondaryButton} 
          onPress={restartRecording}
        >
          <RotateCcwIcon size={32} stroke={TOKENS.colors.text.primary} />
        </TouchableOpacity>

        <TouchableOpacity 
          style={styles.stopButton} 
          onPress={handleStop}
        >
          <View style={styles.stopCircle}>
            <SquareIcon size={36} fill={TOKENS.colors.text.onColor} stroke={TOKENS.colors.text.onColor} />
          </View>
        </TouchableOpacity>

        <TouchableOpacity 
          style={styles.secondaryButton} 
          onPress={deleteRecording}
        >
          <Trash2Icon size={32} stroke={TOKENS.colors.text.primary} />
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    backgroundColor: TOKENS.colors.background,
  },
  statusRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: TOKENS.spacing['07'],
    alignSelf: 'flex-start',
    paddingHorizontal: TOKENS.spacing['07'],
  },
  recordingDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: TOKENS.colors.interactive.success,
    marginRight: TOKENS.spacing['04'],
  },
  statusText: {
    fontSize: 24,
    color: TOKENS.colors.text.primary,
    fontFamily: TOKENS.fonts.body,
    fontWeight: '600',
  },
  visualizerContainer: {
    marginBottom: TOKENS.spacing['05'],
  },
  timeRow: {
    width: width * 0.85,
    alignItems: 'flex-end',
    marginBottom: TOKENS.spacing['03'],
  },
  timeText: {
    fontSize: 18,
    color: TOKENS.colors.text.primary,
    fontFamily: TOKENS.fonts.body,
    opacity: 0.9,
  },
  progressBarContainer: {
    width: width * 0.85,
    height: 4,
    backgroundColor: TOKENS.colors.layer['02'],
    borderRadius: 2,
    marginBottom: 100,
  },
  progressBar: {
    height: '100%',
    backgroundColor: TOKENS.colors.text.primary,
    borderRadius: 2,
  },
  controlsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    width: width * 0.7,
  },
  stopButton: {
    padding: TOKENS.spacing['03'],
  },
  stopCircle: {
    width: 88,
    height: 88,
    borderRadius: 44,
    backgroundColor: TOKENS.colors.interactive['03'],
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: TOKENS.colors.interactive['03'],
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 10,
    elevation: 8,
  },
  secondaryButton: {
    padding: TOKENS.spacing['04'],
  },
});
