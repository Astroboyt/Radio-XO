import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
  Dimensions,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { supabase, handleSupabaseCall } from '../lib/supabase';
import { useAuthStore } from '../store/useAuthStore';
import { SplitText } from '../components/SplitText';
import { TOKENS } from '../theme/tokens';

const AUTH_PROMPTS = [
  "Rain sounds in Mexico",
  "Market in Istanbul",
  "Night sounds in Tokyo"
];

const { width } = Dimensions.get('window');

export const AuthScreen = () => {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const { setSession } = useAuthStore();
  const insets = useSafeAreaInsets();
  const [promptIndex, setPromptIndex] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setPromptIndex((prev) => (prev + 1) % AUTH_PROMPTS.length);
    }, 3000);
    return () => clearInterval(interval);
  }, []);

  const handleAuth = async () => {
    if (!email || !password) return;
    setLoading(true);

    const trimmedEmail = email.trim();
    const action = isLogin 
      ? () => supabase.auth.signInWithPassword({ email: trimmedEmail, password })
      : () => supabase.auth.signUp({ email: trimmedEmail, password });

    const authData = await handleSupabaseCall<{ user: any; session: any }>(
      action, 
      isLogin ? 'Login' : 'Sign Up'
    );
    
    if (authData?.session) {
      setSession(authData.session);
    } else if (!isLogin && authData?.user) {
      Alert.alert('Inquiry', 'Check your email to confirm your account.');
    }
    
    setLoading(false);
  };

  const currentThemeColor = '#9D3DFF'; // Signature Purple

  return (
    <View style={styles.container}>
      <View style={[styles.flex, { paddingTop: insets.top, paddingBottom: insets.bottom }]}>
        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
          style={styles.flex}
        >
            <View style={styles.content}>
              {/* Branding Section */}
              <View style={styles.header}>
                <Text style={styles.brandingText}>RADIO-XO</Text>

                <View style={styles.promptContainer}>
                  <SplitText
                    text={AUTH_PROMPTS[promptIndex]}
                    style={styles.animatedPrompt}
                    stagger={60}
                  />
                  <Text style={styles.inviteText}>
                    Listen and contribute to a global archive of sound
                  </Text>
                </View>
              </View>

              {/* Form Section */}
              <View style={styles.formContainer}>
                <Text style={styles.sectionTitle}>{isLogin ? 'Login' : 'Sign Up'}</Text>
                
                <View style={styles.inputGroup}>
                  <TextInput
                    style={styles.input}
                    placeholder="Enter email"
                    placeholderTextColor="rgba(255,255,255,0.7)"
                    value={email}
                    onChangeText={setEmail}
                    autoCapitalize="none"
                    keyboardType="email-address"
                  />
                  <View style={styles.inputUnderline} />
                </View>

                <View style={styles.inputGroup}>
                  <TextInput
                    style={styles.input}
                    placeholder="Password"
                    placeholderTextColor="rgba(255,255,255,0.7)"
                    value={password}
                    onChangeText={setPassword}
                    secureTextEntry
                  />
                  <View style={styles.inputUnderline} />
                </View>

                <TouchableOpacity style={styles.forgotBtn}>
                  <Text style={styles.forgotText}>Forgot password</Text>
                </TouchableOpacity>

                <TouchableOpacity 
                  style={styles.primaryButton} 
                  onPress={handleAuth}
                  disabled={loading}
                >
                  {loading ? (
                    <ActivityIndicator color={currentThemeColor} />
                  ) : (
                    <Text style={[styles.buttonText, { color: currentThemeColor }]}>{isLogin ? 'Log in' : 'Sign up'}</Text>
                  )}
                </TouchableOpacity>
              </View>

              {/* Toggle Section */}
              <View style={styles.footer}>
                <Text style={styles.footerText}>
                  {isLogin ? "Don't have an account?" : "Already have an account?"}
                </Text>
                <TouchableOpacity onPress={() => setIsLogin(!isLogin)}>
                  <Text style={styles.toggleLink}>{isLogin ? 'Sign up here' : 'Log in here'}</Text>
                </TouchableOpacity>
              </View>
            </View>

          {/* Stats Footer */}
          <View style={styles.statsFooter}>
            <Text style={styles.statsText}>2,300 Sounds from 120 Countries</Text>
            <View style={styles.statsDot} />
            <Text style={styles.statsText}>12 Added today</Text>
          </View>
        </KeyboardAvoidingView>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000000',
  },
  flex: {
    flex: 1,
  },
  content: {
    flex: 1,
    paddingHorizontal: 40,
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 20,
  },
  header: {
    alignItems: 'center',
    marginTop: 80,
    marginBottom: 0,
  },
  brandingText: {
    fontSize: 56,
    color: '#FFFFFF',
    fontFamily: TOKENS.fonts.logo, // Degular
    letterSpacing: -1,
    fontWeight: '700',
    marginBottom: 0,
  },
  promptContainer: {
    alignItems: 'center',
    paddingHorizontal: 20,
    marginTop: 40,
  },
  animatedPrompt: {
    fontSize: 24,
    color: '#FFFFFF',
    fontFamily: TOKENS.fonts.heading, // Schoolbell
    textAlign: 'center',
    marginBottom: 12,
  },
  inviteText: {
    fontSize: 14,
    color: 'rgba(255,255,255,0.6)', // Slightly softer
    fontFamily: TOKENS.fonts.body,
    textAlign: 'center',
    lineHeight: 20,
    maxWidth: width * 0.75,
  },
  formContainer: {
    width: '100%',
    marginTop: 40, // Reduced for single-viewport fit
    marginBottom: 20,
  },
  sectionTitle: {
    color: '#FFFFFF',
    fontSize: 20,
    fontFamily: TOKENS.fonts.body,
    marginBottom: 30,
    fontWeight: '500',
  },
  inputGroup: {
    marginBottom: 25,
  },
  input: {
    color: '#FFFFFF',
    fontSize: 22,
    fontFamily: TOKENS.fonts.body,
    paddingVertical: 10,
    fontWeight: '400',
  },
  inputUnderline: {
    height: 1.5,
    backgroundColor: '#FFFFFF',
    width: '100%',
  },
  forgotBtn: {
    marginTop: -10,
    marginBottom: 30,
  },
  forgotText: {
    color: 'rgba(255,255,255,0.7)',
    fontSize: 14,
    fontFamily: TOKENS.fonts.body,
  },
  primaryButton: {
    backgroundColor: '#FFFFFF',
    height: 52,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 10,
  },
  buttonText: {
    color: '#0052FF',
    fontSize: 18,
    fontFamily: TOKENS.fonts.body,
    fontWeight: '400',
  },
  footer: {
    alignItems: 'center',
    marginBottom: 40,
  },
  footerText: {
    color: '#FFFFFF',
    fontSize: 18,
    fontFamily: TOKENS.fonts.body,
    marginBottom: 8,
  },
  toggleLink: {
    color: '#FFFFFF',
    fontSize: 18,
    fontFamily: TOKENS.fonts.body,
    textDecorationLine: 'underline',
  },
  statsFooter: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 30,
    borderTopWidth: 0,
    width: '100%',
  },
  statsText: {
    color: 'rgba(255,255,255,0.8)',
    fontSize: 14,
    fontFamily: TOKENS.fonts.body,
  },
  statsDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#FFFFFF',
    marginHorizontal: 15,
  },
});
