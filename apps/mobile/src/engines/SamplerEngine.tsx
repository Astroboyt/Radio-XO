import React, { createContext, useContext, useState, useCallback, useRef } from 'react';
import { Audio } from 'expo-av';
import * as Location from 'expo-location';
import { supabase, handleSupabaseCall } from '../lib/supabase';
import { StorageService } from '../lib/StorageService';
import { useAuthStore } from '../store/useAuthStore';
import { Alert } from 'react-native';

interface CaptureMetadata {
  capturedAt: string;
  lat: number;
  lng: number;
  label?: string;
}

interface RecordingResult {
  uri: string;
  duration: number;
  capturedAt: string;
  location: {
    lat: number;
    lng: number;
    label?: string;
  };
  rmsData: number[];
  name: string;
  tags?: string[];
  locationName?: string;
  author?: string;
  date?: string;
  rmsHistory: number[];
}

interface SamplerContextType {
  isRecording: boolean;
  recordingDuration: number;
  rmsLevel: number;
  isPlaying: boolean;
  playbackProgress: number; // 0 to 1
  pendingSound: RecordingResult | null;
  lastUploadedSound: RecordingResult | null;
  activeListeningSound: RecordingResult | null;
  favoriteSounds: RecordingResult[];
  contributedSounds: RecordingResult[];
  setActiveListeningSound: (sound: RecordingResult | null) => void;
  toggleFavorite: (sound: RecordingResult) => void;
  startRecording: () => Promise<void>;
  stopRecording: () => Promise<RecordingResult | null>;
  requestPermissions: () => Promise<boolean>;
  togglePlayback: (uri: string) => Promise<void>;
  stopPlayback: () => Promise<void>;
  deleteRecording: () => Promise<void>;
  restartRecording: () => Promise<void>;
  updatePendingMetadata: (metadata: Partial<RecordingResult>) => void;
  uploadPendingSound: () => Promise<void>;
  recentSounds: RecordingResult[];
  categories: string[];
  selectedCategory: string | null;
  radioSounds: RecordingResult[];
  setCategory: (category: string | null) => void;
}

const SamplerContext = createContext<SamplerContextType | null>(null);

const RAW_RECORDING_OPTIONS: Audio.RecordingOptions = {
  android: {
    extension: '.m4a',
    outputFormat: 2, // MPEG_4
    audioEncoder: 3, // AAC
    sampleRate: 44100,
    numberOfChannels: 2,
    bitRate: 256000,
  },
  ios: {
    extension: '.m4a',
    outputFormat: 'aac ', // MPEG4AAC
    audioQuality: 127, // MAX
    sampleRate: 44100,
    numberOfChannels: 2,
    bitRate: 256000,
    linearPCMBitDepth: 16,
    linearPCMIsBigEndian: false,
    linearPCMIsFloat: false,
  },
  web: {
    mimeType: 'audio/webm',
    bitsPerSecond: 128000,
  },
  isMeteringEnabled: true,
};

export const SamplerProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [isRecording, setIsRecording] = useState(false);
  const [recordingDuration, setRecordingDuration] = useState(0);
  const [rmsLevel, setRmsLevel] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [playbackProgress, setPlaybackProgress] = useState(0);
  const [recentSounds, setRecentSounds] = useState<RecordingResult[]>([]);
  const [pendingSound, setPendingSound] = useState<RecordingResult | null>(null);
  const [lastUploadedSound, setLastUploadedSound] = useState<RecordingResult | null>(null);
  const [activeListeningSound, setActiveListeningSound] = useState<RecordingResult | null>(null);
  const [favoriteSounds, setFavoriteSounds] = useState<RecordingResult[]>([]);
  const [contributedSounds, setContributedSounds] = useState<RecordingResult[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [radioSounds, setRadioSounds] = useState<RecordingResult[]>([]);
  const rmsHistoryRef = useRef<number[]>([]);
  
  const recordingRef = useRef<Audio.Recording | null>(null);
  const soundRef = useRef<Audio.Sound | null>(null);
  const captureMetadata = useRef<CaptureMetadata | null>(null);
  const isBusy = useRef(false);
  const lastActionTime = useRef(0);

  const requestPermissions = useCallback(async () => {
    const { status: audioStatus } = await Audio.requestPermissionsAsync();
    const { status: locationStatus } = await Location.requestForegroundPermissionsAsync();
    return audioStatus === 'granted' && locationStatus === 'granted';
  }, []);

  const sleep = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

  const onRecordingStatusUpdate = useCallback((status: Audio.RecordingStatus) => {
    setRecordingDuration(status.durationMillis);
    if (status.metering !== undefined) {
      const normalized = Math.pow(10, status.metering / 20);
      setRmsLevel(normalized);
      rmsHistoryRef.current.push(normalized);
    }
  }, []);

  const stopPlayback = useCallback(async () => {
    if (soundRef.current) {
      await soundRef.current.unloadAsync();
      soundRef.current = null;
    }
    setIsPlaying(false);
    setPlaybackProgress(0);
  }, []);

  const togglePlayback = useCallback(async (uri: string) => {
    try {
      // IMPORTANT: Ensure audio is routed to the main speaker, not the earpiece
      await Audio.setAudioModeAsync({
        allowsRecordingIOS: false,
        playsInSilentModeIOS: true,
        staysActiveInBackground: true,
        shouldDuckAndroid: true,
      });

      if (soundRef.current) {
        const status = await soundRef.current.getStatusAsync();
        if (status.isLoaded && status.uri === uri) {
          if (status.isPlaying) {
            await soundRef.current.pauseAsync();
          } else {
            // Restart if finished
            if (status.didJustFinish || (status.positionMillis >= (status.durationMillis || 0))) {
              await soundRef.current.setPositionAsync(0);
            }
            await soundRef.current.playAsync();
          }
          return;
        }
        await soundRef.current.unloadAsync();
      }

      const { sound } = await Audio.Sound.createAsync(
        { uri },
        { shouldPlay: true },
        (status) => {
          if (status.isLoaded) {
            setIsPlaying(status.isPlaying);
            if (status.durationMillis && status.durationMillis > 0) {
              setPlaybackProgress(status.positionMillis / status.durationMillis);
            }
            if (status.didJustFinish) {
              setIsPlaying(false);
              setPlaybackProgress(1);
              soundRef.current?.unloadAsync().then(() => {
                soundRef.current = null;
              });
            }
          }
        }
      );
      soundRef.current = sound;
    } catch (err) {
      console.error('Playback failed', err);
      setIsPlaying(false);
      setPlaybackProgress(0);
    }
  }, []);

  const startRecording = useCallback(async () => {
    // Strict Mutex using Ref
    const now = Date.now();
    if (isBusy.current || isRecording || (now - lastActionTime.current < 500)) {
      console.warn('SamplerEngine: StartRecording ignored (Busy or Debounced)');
      return;
    }
    
    isBusy.current = true;
    lastActionTime.current = now;
    
    try {
      await stopPlayback();
      setPendingSound(null);
      rmsHistoryRef.current = [];
      
      // Forced cleanup of any orphaned recording objects
      if (recordingRef.current) {
        try {
          await recordingRef.current.stopAndUnloadAsync();
          await sleep(150); // HW release buffer
        } catch (e) {
          // ignore
        }
        recordingRef.current = null;
      }
      const startTime = new Date().toISOString();
      captureMetadata.current = {
        capturedAt: startTime,
        lat: 0,
        lng: 0,
      };

      Location.getCurrentPositionAsync({ accuracy: Location.Accuracy.Balanced })
        .then(async (location) => {
          if (captureMetadata.current && captureMetadata.current.capturedAt === startTime) {
            const [address] = await Location.reverseGeocodeAsync(location.coords);
            const label = address ? `${address.city}, ${address.country}` : undefined;
            
            captureMetadata.current = {
              ...captureMetadata.current,
              lat: location.coords.latitude,
              lng: location.coords.longitude,
              label,
            };
          }
        })
        .catch(err => console.warn('Background location fetch failed', err));

      // Reset audio mode for recording
      await Audio.setAudioModeAsync({
        allowsRecordingIOS: true,
        playsInSilentModeIOS: true,
        staysActiveInBackground: true,
        shouldDuckAndroid: true,
      });

      const { recording } = await Audio.Recording.createAsync(
        RAW_RECORDING_OPTIONS,
        onRecordingStatusUpdate,
        50 // Smoother visualization (50ms interval)
      );

      recordingRef.current = recording;
      setIsRecording(true);
    } catch (err) {
      console.error('SamplerEngine: Failed to start recording', err);
      recordingRef.current = null;
      setIsRecording(false);
      throw err;
    } finally {
      isBusy.current = false;
    }
  }, [onRecordingStatusUpdate, stopPlayback, isRecording]);

  const stopRecording = useCallback(async () => {
    if (!recordingRef.current || !captureMetadata.current || isBusy.current) return null;
    isBusy.current = true;
    lastActionTime.current = Date.now();

    try {
      await recordingRef.current.stopAndUnloadAsync();
      await sleep(150); // HW release buffer
      
      const uri = recordingRef.current.getURI() || '';
      const result: RecordingResult = {
        uri: uri,
        duration: recordingDuration,
        capturedAt: captureMetadata.current.capturedAt,
        location: {
          lat: captureMetadata.current.lat,
          lng: captureMetadata.current.lng,
          label: captureMetadata.current.label,
        },
        rmsHistory: [...rmsHistoryRef.current],
        rmsData: [...rmsHistoryRef.current], // Initializing with history for now
        name: `Capture_${Date.now()}`, // Default name
      };
      
      recordingRef.current = null;
      captureMetadata.current = null;
      rmsHistoryRef.current = [];
      setIsRecording(false);
      setRecordingDuration(0);
      setRmsLevel(0);

      // Staging for Naming/Tagging instead of direct history
      setPendingSound(result);

      return result;
    } catch (err) {
      console.error('SamplerEngine: Failed to stop recording', err);
      return null;
    } finally {
      isBusy.current = false;
    }
  }, [recordingDuration]);

  const deleteRecording = useCallback(async () => {
    if (isBusy.current) return;
    isBusy.current = true;
    
    try {
      if (recordingRef.current) {
        try {
          await recordingRef.current.stopAndUnloadAsync();
          await sleep(150);
        } catch (err) {
          console.warn('SamplerEngine: Failed to stop recording during delete', err);
        }
      }
      recordingRef.current = null;
      captureMetadata.current = null;
      setIsRecording(false);
      setRecordingDuration(0);
      setRmsLevel(0);
    } finally {
      isBusy.current = false;
    }
  }, []);

  const restartRecording = useCallback(async () => {
    await deleteRecording();
    await sleep(200); // Extra buffer for hardware cycle
    await startRecording();
  }, [deleteRecording, startRecording]);

  const updatePendingMetadata = useCallback((metadata: Partial<RecordingResult>) => {
    setPendingSound(prev => prev ? { ...prev, ...metadata } : null);
  }, []);

  const uploadPendingSound = useCallback(async () => {
    if (!pendingSound) return;
    
    const user = useAuthStore.getState().user;
    if (!user) {
      Alert.alert('Authentication Required', 'Please log in to upload sounds.');
      return;
    }

    try {
      // 1. Upload file to Storage
      const storagePath = await StorageService.uploadSound(pendingSound.uri, user.id);
      if (!storagePath) throw new Error('Failed to upload audio file to storage.');

      // 2. Insert record into database
      const soundData = {
        user_id: user.id,
        title: pendingSound.name,
        duration_ms: pendingSound.duration,
        storage_path: storagePath,
        lat: pendingSound.location.lat,
        lng: pendingSound.location.lng,
        location_label: pendingSound.location.label,
        captured_at: pendingSound.capturedAt,
        status: 'ready',
        is_public: true
      };

      const result = await handleSupabaseCall(
        async () => {
          const { data, error } = await supabase.from('sounds').insert(soundData).select().single();
          return { data, error };
        },
        'Sound Upload'
      );

      if (!result) throw new Error('Failed to save sound metadata.');

      // 3. Update local state
      const uploadedSound: RecordingResult = {
        ...pendingSound,
        author: user.email || 'Anonymous',
      };

      setRecentSounds(prev => [uploadedSound, ...prev]);
      setContributedSounds(prev => [uploadedSound, ...prev]);
      setLastUploadedSound(uploadedSound);
      setPendingSound(null);
      
      Alert.alert('Success', 'Your sound has been uploaded to the global tapestry.');
    } catch (err: any) {
      console.error('SamplerEngine: Upload failed', err);
      Alert.alert('Upload Failed', err.message || 'Something went wrong while connecting to the server.');
    }
  }, [pendingSound]);

  // Radio Mode Logic
  const categories = ['Nature', 'Cities', 'Spoken word', 'Rain sounds', 'Industrial', 'Waves'];

  const setCategory = useCallback((category: string | null) => {
    setSelectedCategory(category);
    if (category) {
      // Simulate fetching sounds for this category
      // In a real app, this would be a Supabase query based on tags
      const filtered = recentSounds.filter(s => s.tags?.includes(category) || !s.tags?.length);
      setRadioSounds(filtered.length > 0 ? filtered : recentSounds);
    } else {
      setRadioSounds([]);
    }
  }, [recentSounds]);

  const toggleFavorite = useCallback((sound: RecordingResult) => {
    setFavoriteSounds(prev => {
      const isFavorited = prev.some(s => s.uri === sound.uri);
      if (isFavorited) {
        return prev.filter(s => s.uri !== sound.uri);
      }
      return [sound, ...prev];
    });
  }, []);

  return (
    <SamplerContext.Provider value={{
      isRecording,
      recordingDuration,
      rmsLevel, 
      isPlaying,
      playbackProgress,
      pendingSound,
      lastUploadedSound,
      activeListeningSound,
      setActiveListeningSound,
      startRecording, 
      stopRecording,
      requestPermissions,
      togglePlayback,
      stopPlayback,
      deleteRecording,
      restartRecording,
      updatePendingMetadata,
      uploadPendingSound,
      recentSounds,
      favoriteSounds,
      contributedSounds,
      categories,
      selectedCategory,
      radioSounds,
      setCategory,
      toggleFavorite
    }}>
      {children}
    </SamplerContext.Provider>
  );
};

export const useSampler = () => {
  const context = useContext(SamplerContext);
  if (!context) {
    throw new Error('useSampler must be used within a SamplerProvider');
  }
  return context;
};
