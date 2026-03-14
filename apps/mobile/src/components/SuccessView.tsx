import React, { useEffect, useRef } from 'react';
import { 
  View, 
  Text, 
  TouchableOpacity, 
  StyleSheet, 
  Dimensions, 
  Image,
  Animated,
  Easing
} from 'react-native';
import { Play, Pause, X } from 'lucide-react-native';
import { useSampler } from '../engines/SamplerEngine';
import { TOKENS } from '../theme/tokens';

const PlayIcon = Play as any;
const PauseIcon = Pause as any;
const XIcon = X as any;

const { width, height } = Dimensions.get('window');

interface SuccessViewProps {
  onClose: () => void;
}

/**
 * SuccessView
 * Displays the globe with a glowing hotspot at the newly uploaded sound location.
 */
export const SuccessView: React.FC<SuccessViewProps> = ({ onClose }) => {
  const { 
    lastUploadedSound, 
    isPlaying, 
    playbackProgress,
    togglePlayback 
  } = useSampler();
  
  const glowAnim = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(glowAnim, {
          toValue: 2.5,
          duration: 1500,
          easing: Easing.out(Easing.ease),
          useNativeDriver: true,
        }),
        Animated.timing(glowAnim, {
          toValue: 1,
          duration: 1500,
          easing: Easing.in(Easing.ease),
          useNativeDriver: true,
        }),
      ])
    ).start();
  }, []);

  if (!lastUploadedSound) return null;

  return (
    <View style={styles.container}>
      {/* Globe Section with Hotspot */}
      <View style={styles.globeSection}>
        <View style={styles.globeContainer}>
          <Image 
            source={require('../../assets/dot-globe.png')} 
            style={styles.globeImage}
            resizeMode="contain"
          />
          
          {/* Glowing Hotspot */}
          <View style={[styles.hotspotContainer, { top: '45%', left: '55%' }]}>
            <Animated.View 
              style={[
                styles.glow, 
                { 
                  transform: [{ scale: glowAnim }],
                  opacity: glowAnim.interpolate({
                    inputRange: [1, 2.5],
                    outputRange: [0.6, 0]
                  })
                }
              ]} 
            />
            <View style={styles.hotspotCore} />
          </View>
        </View>
      </View>

      <View style={styles.successMessageRow}>
        <Text style={styles.successText}>Sound successfully uploaded!</Text>
      </View>

      <View style={styles.metadataSection}>
        <View style={styles.metadataHeader}>
          <Text style={styles.soundName}>{lastUploadedSound.name}</Text>
          <Text style={styles.durationText}>
            {(lastUploadedSound.duration / 1000).toFixed(2)}s
          </Text>
        </View>
        <View style={styles.divider} />
        <Text style={styles.idText}>
          {Math.random().toString().slice(2, 11)}.{Math.random().toString().slice(2, 4)}
        </Text>
      </View>

      <View style={styles.playbackSection}>
        <TouchableOpacity 
          style={styles.playButton} 
          onPress={() => togglePlayback(lastUploadedSound.uri)}
        >
          {isPlaying ? (
            <PauseIcon size={32} fill={TOKENS.colors.interactive['03']} stroke={TOKENS.colors.interactive['03']} />
          ) : (
            <PlayIcon size={32} fill={TOKENS.colors.interactive['03']} stroke={TOKENS.colors.interactive['03']} />
          )}
        </TouchableOpacity>
        <View style={styles.playbackBarContainer}>
          <View 
            style={[
              styles.playbackBar, 
              { width: `${playbackProgress * 100}%` }
            ]} 
          />
        </View>
      </View>

      <TouchableOpacity style={styles.closeButton} onPress={onClose}>
        <XIcon size={32} stroke={TOKENS.colors.text.primary} />
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: 'transparent',
    paddingTop: 60,
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    zIndex: 100,
  },
  closeButton: {
    position: 'absolute',
    top: TOKENS.spacing['05'],
    right: TOKENS.spacing['07'],
    zIndex: 110,
  },
  globeSection: {
    height: height * 0.40,
    justifyContent: 'center',
    alignItems: 'center',
    width: '100%',
    marginTop: TOKENS.spacing['05'],
  },
  globeContainer: {
    width: width * 0.8,
    height: width * 0.8,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'transparent', 
  },
  overlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: TOKENS.colors.background, 
    zIndex: 1000,
  },
  globeImage: {
    width: '100%',
    height: '100%',
  },
  hotspotContainer: {
    position: 'absolute',
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },
  hotspotCore: {
    width: 14,
    height: 14,
    borderRadius: 7,
    backgroundColor: TOKENS.colors.text.onColor,
    borderWidth: 2,
    borderColor: TOKENS.colors.interactive['03'],
  },
  glow: {
    position: 'absolute',
    width: 30,
    height: 30,
    borderRadius: 15,
    backgroundColor: TOKENS.colors.text.onColor,
  },
  successMessageRow: {
    marginTop: TOKENS.spacing['07'],
    marginBottom: TOKENS.spacing['08'],
    width: width * 0.9,
    alignSelf: 'center',
  },
  successText: {
    fontSize: 22,
    color: TOKENS.colors.text.primary,
    fontFamily: TOKENS.fonts.heading,
    fontWeight: '500',
    opacity: 0.9,
  },
  metadataSection: {
    width: width * 0.9,
    marginTop: 'auto',
    marginBottom: TOKENS.spacing['05'],
  },
  metadataHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: TOKENS.spacing['03'],
  },
  soundName: {
    fontSize: 22,
    color: TOKENS.colors.text.primary,
    fontFamily: TOKENS.fonts.heading,
    fontWeight: '400',
  },
  durationText: {
    fontSize: 20,
    color: TOKENS.colors.text.primary,
    fontFamily: TOKENS.fonts.body,
    fontWeight: '400',
  },
  divider: {
    height: 1.5,
    backgroundColor: TOKENS.colors.layer['01'],
    width: '100%',
    marginBottom: TOKENS.spacing['03'],
  },
  idText: {
    fontSize: 20,
    color: TOKENS.colors.text.secondary,
    fontFamily: TOKENS.fonts.body,
    opacity: 0.7,
  },
  playbackSection: {
    flexDirection: 'row',
    alignItems: 'center',
    width: width * 0.9,
    marginBottom: 60,
  },
  playButton: {
    width: 84,
    height: 84,
    borderRadius: 42,
    backgroundColor: TOKENS.colors.text.onColor,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: TOKENS.spacing['06'],
    marginLeft: -10, 
    shadowColor: TOKENS.colors.black,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 5,
    elevation: 5,
  },
  playbackBarContainer: {
    flex: 1,
    height: 4,
    backgroundColor: TOKENS.colors.layer['02'],
    borderRadius: 2,
  },
  playbackBar: {
    width: '0%',
    height: '100%',
    backgroundColor: TOKENS.colors.interactive.warning,
    borderRadius: 2,
  },
});
