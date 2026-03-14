import React, { useEffect, useState, useCallback } from 'react';
import { StyleSheet, View, ActivityIndicator } from 'react-native';
import { SafeAreaProvider, useSafeAreaInsets } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import * as Font from 'expo-font';
import { useFonts, Schoolbell_400Regular } from '@expo-google-fonts/schoolbell';
import * as SplashScreen from 'expo-splash-screen';
import { SamplerProvider } from './src/engines/SamplerEngine';
import { SamplerUI } from './src/components/SamplerUI';
import { AuthScreen } from './src/screens/AuthScreen';
import { useAuthStore } from './src/store/useAuthStore';
import { supabase } from './src/lib/supabase';

// Keep the splash screen visible while we fetch resources
SplashScreen.preventAutoHideAsync().catch(() => {
  /* reloading the app might cause some errors here */
});

const AppContent = () => {
  const { user, isLoading: authLoading, setSession, setLoading: setAuthLoading } = useAuthStore();
  const [fontsLoaded, setFontsLoaded] = useState(false);
  const insets = useSafeAreaInsets();

  useEffect(() => {
    async function prepare() {
      try {
        // Load fonts
        await Font.loadAsync({
          'DXRigraf-SemiBold': require('./assets/fonts/DXRigraf-SemiBold.otf'),
          'Degular': require('./assets/fonts/Degular.otf'),
          'Schoolbell': Schoolbell_400Regular,
        });
      } catch (e) {
        console.warn('Font loading failed', e);
      } finally {
        setFontsLoaded(true);
      }
    }

    prepare();

    // Check active session on mount
    supabase.auth.getSession().then(({ data: { session } }: { data: { session: any } }) => {
      setSession(session);
      setAuthLoading(false);
    });

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event: string, session: any) => {
      setSession(session);
    });

    return () => subscription.unsubscribe();
  }, []);

  const onLayoutRootView = useCallback(async () => {
    if (fontsLoaded && !authLoading) {
      // This tells the splash screen to hide immediately!
      await SplashScreen.hideAsync();
    }
  }, [fontsLoaded, authLoading]);

  if (authLoading || !fontsLoaded) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#FFE249" />
      </View>
    );
  }

  return (
    <View 
      style={styles.container}
      onLayout={onLayoutRootView}
    >
      {user ? <SamplerUI /> : <AuthScreen />}
      <StatusBar style="light" />
    </View>
  );
};

export default function App() {
  return (
    <SafeAreaProvider>
      <SamplerProvider>
        <AppContent />
      </SamplerProvider>
    </SafeAreaProvider>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#000',
  },
});
