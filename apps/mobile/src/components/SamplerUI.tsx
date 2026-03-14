import React, { useState } from 'react';
import { 
  View, 
  Text, 
  TouchableOpacity, 
  StyleSheet, 
  Dimensions, 
  StatusBar,
  Alert 
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { 
  Mic, 
  Menu, 
} from 'lucide-react-native';
import { useSampler } from '../engines/SamplerEngine';
import { useAuthStore } from '../store/useAuthStore';
import { TOKENS } from '../theme/tokens';

import { RecordingView } from './RecordingView';
import { NamingView } from './NamingView';
import { TaggingView } from './TaggingView';
import { SuccessView } from './SuccessView';
import { RadioView } from './RadioView';
import { ActivityFeed } from './ActivityFeed';
import { MenuView } from './MenuView';
import { SplitText } from './SplitText';

const PROMPTS = [
  "Take a sound picture of your world.",
  "What does this moment sound like?",
  "Leave a sound from where you are",
  "What does your world sound like?"
];
const MenuIcon = Menu as any;
const MicIcon = Mic as any;

const { width } = Dimensions.get('window');

type UIState = 'RECORDING' | 'NAMING' | 'TAGGING' | 'SUCCESS' | 'MENU' | 'RADIO';

export const SamplerUI = () => {
  const { 
    isRecording, 
    rmsLevel,
    startRecording, 
    requestPermissions,
    deleteRecording,
  } = useSampler();
  
  // State for the screen mode
  const [uiState, setUiState] = useState<UIState>('RECORDING');
  const [isProcessingLocal, setIsProcessingLocal] = useState(false);
  const [randomPrompt, setRandomPrompt] = useState(() => PROMPTS[Math.floor(Math.random() * PROMPTS.length)]);
  const insets = useSafeAreaInsets();

  // Refresh prompt whenever we return to the home screen
  React.useEffect(() => {
    if (uiState === 'RECORDING' && !isRecording) {
      setRandomPrompt(PROMPTS[Math.floor(Math.random() * PROMPTS.length)]);
    }
  }, [uiState, isRecording]);


  const handleToggleRecording = async () => {
    if (isProcessingLocal || isRecording) return;
    setIsProcessingLocal(true);
    
    try {
      if (!isRecording) {
        const hasPermission = await requestPermissions();
        if (hasPermission) {
          await startRecording();
        } else {
          Alert.alert("Permissions Required", "Microphone access is needed for high-res capture.");
        }
      }
    } catch (error: any) {
      console.error('Recording error:', error);
      Alert.alert("Capture Error", "Something went wrong initializing the audio engine. Please try again.");
    } finally {
      setIsProcessingLocal(false);
    }
  };

  const renderContent = () => {
    if (isRecording) return <RecordingView onStop={() => setUiState('NAMING')} />;
    
    switch (uiState) {
      case 'NAMING':
        return (
          <NamingView 
            onNext={() => setUiState('TAGGING')} 
            onAbandon={async () => {
              await deleteRecording();
              setUiState('RECORDING');
            }}
          />
        );
      case 'TAGGING':
        return (
          <TaggingView 
            onUpload={() => setUiState('SUCCESS')}
            onAbandon={async () => {
              await deleteRecording();
              setUiState('RECORDING');
            }}
          />
        );
      case 'SUCCESS':
        return <SuccessView onClose={() => setUiState('RECORDING')} />;
      case 'RADIO':
        return <RadioView onClose={() => setUiState('RECORDING')} />;
      case 'MENU':
        return (
          <MenuView 
            onClose={() => setUiState('RECORDING')} 
            onNavigate={(screen) => setUiState(screen)} 
          />
        );
      default:
        return (
          <View style={styles.homeContent}>
            <View style={styles.greetingContainer}>
              <SplitText 
                text={randomPrompt}
                style={styles.greetingText}
                stagger={100}
              />
            </View>

            <TouchableOpacity 
              style={[styles.micButton, isProcessingLocal && { opacity: 0.5 }]} 
              onPress={handleToggleRecording}
              disabled={isProcessingLocal}
            >
              <View style={styles.micCircle}>
                <MicIcon size={48} stroke={TOKENS.colors.text.onColor} />
              </View>
            </TouchableOpacity>

            <View style={styles.activityWrapper}>
              <ActivityFeed />
            </View>

            <View style={[styles.statsFooter, { paddingBottom: Math.max(TOKENS.spacing['06'], insets.bottom) }]}>
              <Text style={styles.statsText}>
                2,300 Sounds from 120 Countries  •  12 Added today
              </Text>
            </View>
          </View>
        );
    }
  };

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" />
      
      {/* Header - Always Fixed at top (Hidden in Menu Mode to avoid dual navbar) */}
      {uiState !== 'MENU' && (
        <View style={styles.headerWrapper}>
          <View style={[styles.header, { paddingTop: insets.top }]}>
            <View style={styles.headerInner}>
              <TouchableOpacity 
                style={styles.headerBrand}
                onPress={() => setUiState(uiState === 'RADIO' ? 'RECORDING' : 'RADIO')}
              >
                <Text style={styles.headerTitle}>RADIO-XO</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.menuButton} onPress={() => setUiState('MENU')}>
                <MenuIcon stroke={TOKENS.colors.text.primary} size={32} />
              </TouchableOpacity>
            </View>
          </View>
          <View style={styles.headerDivider} />
        </View>
      )}

      <View style={styles.contentContainer}>
        {renderContent()}
      </View>

      {isRecording && rmsLevel > 0.1 && (
        <View 
          pointerEvents="none"
          style={[
            styles.pulseOverlay, 
            { transform: [{ scale: 1 + rmsLevel * 2 }], opacity: Math.min(0.2, rmsLevel) }
          ]} 
        />
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: TOKENS.colors.background, 
  },
  header: {
    backgroundColor: TOKENS.colors.background,
    zIndex: 100,
    minHeight: 100,
    justifyContent: 'flex-end',
    paddingBottom: 12,
  },
  headerInner: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: TOKENS.layout.containerPadding,
  },
  headerBrand: {
    flex: 1,
  },
  headerTitle: {
    fontSize: 36, // Boosted for high-res presence
    color: TOKENS.colors.text.primary,
    fontFamily: TOKENS.fonts.logo,
    fontWeight: '700',
    letterSpacing: -1.5,
  },
  headerDivider: {
    height: 1,
    backgroundColor: TOKENS.colors.layer['01'],
    width: '100%',
  },
  headerWrapper: {
    zIndex: 100,
  },
  menuButton: {
    padding: TOKENS.spacing['02'],
  },
  contentContainer: {
    flex: 1,
    zIndex: 1,
  },
  homeContent: {
    flex: 1,
    alignItems: 'center',
  },
  greetingContainer: {
    paddingTop: 50,
    paddingHorizontal: TOKENS.layout.containerPadding,
    marginBottom: 60,
  },
  greetingText: {
    fontSize: 40,
    color: TOKENS.colors.text.primary,
    fontFamily: TOKENS.fonts.heading, // Heading is Schoolbell
    textAlign: 'center',
    fontWeight: '400', // Schoolbell Regular
    lineHeight: 50, // Slightly more space
  },
  micButton: {
    marginBottom: 40,
    alignSelf: 'center',
  },
  micCircle: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: TOKENS.colors.interactive['03'],
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: TOKENS.colors.interactive['03'],
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.5,
    shadowRadius: 20,
    elevation: 10,
  },
  activityWrapper: {
    flex: 1,
    width: '100%',
    marginTop: 60, // Boosted breathing space for design
  },
  statsFooter: {
    width: '100%',
    alignItems: 'center',
    paddingTop: TOKENS.spacing['05'],
    backgroundColor: TOKENS.colors.background,
  },
  statsText: {
    fontSize: 14,
    color: TOKENS.colors.text.secondary,
    fontFamily: TOKENS.fonts.body,
    fontWeight: '500',
  },
  pulseOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: TOKENS.colors.white,
    zIndex: -1,
  },
});
