import React from 'react';
import { 
  View, 
  Text, 
  TouchableOpacity, 
  StyleSheet, 
  Dimensions, 
  ScrollView
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { X, ChevronRight } from 'lucide-react-native';
import { useAuthStore } from '../store/useAuthStore';
import { TOKENS } from '../theme/tokens';

const { width, height } = Dimensions.get('window');
const XIcon = X as any;
const ChevronIcon = ChevronRight as any;

interface MenuViewProps {
  onClose: () => void;
  onNavigate: (screen: 'RADIO') => void;
}

export const MenuView: React.FC<MenuViewProps> = ({ onClose, onNavigate }) => {
  const { user, signOut } = useAuthStore();
  const insets = useSafeAreaInsets();
  
  // Extract first name from email or user metadata
  const firstName = user?.email?.split('@')[0] || 'Explorer';
  const capitalizedName = firstName.charAt(0).toUpperCase() + firstName.slice(1);

  const MENU_ITEMS = [
    { label: 'Sound Contributions', action: () => onClose() }, 
    { label: 'Favorites', action: () => onNavigate('RADIO') }, // Placeholder until navigation is refined
    { label: 'Downloads', action: () => {} },
    { label: 'Preferences', action: () => {} },
    { label: 'Logout', action: () => signOut() },
    { label: 'Share with a friend', action: () => {} },
  ];

  const FOOTER_LINKS = [
    'About Radio-XO',
    'Data Privacy & Policy',
    'Readme',
    'Guidelines'
  ];

  return (
    <View style={styles.overlay}>
      <View style={[styles.container, { paddingTop: insets.top }]}>
        {/* Header */}
        <View style={styles.headerWrapper}>
          <View style={styles.header}>
            <View style={styles.headerInner}>
              <Text style={styles.logo}>RADIO-XO</Text>
              <TouchableOpacity onPress={onClose} style={styles.closeButton}>
                <View style={styles.hamburger}>
                  <View style={[styles.hamburgerLine, styles.topLine]} />
                  <View style={[styles.hamburgerLine, styles.midLine]} />
                  <View style={[styles.hamburgerLine, styles.botLine]} />
                </View>
              </TouchableOpacity>
            </View>
          </View>
          <View style={styles.headerDivider} />
        </View>

        <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
          <Text style={styles.greeting}>Hey {capitalizedName} !</Text>

          <View style={styles.menuList}>
            {MENU_ITEMS.map((item, index) => (
              <TouchableOpacity 
                key={index} 
                style={styles.menuItem}
                onPress={item.action}
              >
                <Text style={styles.menuItemText}>{item.label}</Text>
              </TouchableOpacity>
            ))}
          </View>

          <View style={styles.footer}>
            {FOOTER_LINKS.map((link, index) => (
              <TouchableOpacity key={index} style={styles.footerLink}>
                <Text style={styles.footerLinkText}>{link}</Text>
              </TouchableOpacity>
            ))}
          </View>
        </ScrollView>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  overlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: TOKENS.colors.background, 
    zIndex: 1000,
  },
  container: {
    flex: 1,
    paddingHorizontal: TOKENS.layout.containerPadding,
  },
  header: {
    minHeight: 110, // Taller for the menu moment
    justifyContent: 'flex-end',
    paddingBottom: 16,
  },
  headerInner: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    width: '100%',
  },
  headerDivider: {
    height: 1,
    backgroundColor: TOKENS.colors.layer['01'],
    width: '100%',
  },
  headerWrapper: {
    zIndex: 100,
  },
  logo: {
    fontSize: 48,
    color: TOKENS.colors.text.primary,
    fontFamily: TOKENS.fonts.logo, // Logo stays Degular
    fontWeight: '700',
    letterSpacing: -1.5,
  },
  closeButton: {
    padding: TOKENS.spacing['02'],
  },
  hamburger: {
    width: 32,
    height: 24,
    justifyContent: 'space-between',
    alignItems: 'flex-end',
  },
  hamburgerLine: {
    height: 3,
    backgroundColor: TOKENS.colors.text.primary,
    borderRadius: 0,
  },
  topLine: { width: 32 },
  midLine: { width: 24, backgroundColor: TOKENS.colors.interactive['03'] },
  botLine: { width: 32 },
  scrollContent: {
    paddingTop: 60,
    paddingBottom: 40,
  },
  greeting: {
    fontSize: 18,
    color: TOKENS.colors.text.secondary,
    fontFamily: TOKENS.fonts.heading,
    fontWeight: '400',
    marginBottom: TOKENS.spacing['08'],
  },
  menuList: {
    marginBottom: TOKENS.spacing['10'],
  },
  menuItem: {
    paddingVertical: TOKENS.spacing['06'],
    borderBottomWidth: 1,
    borderBottomColor: TOKENS.colors.layer['02'],
  },
  menuItemText: {
    fontSize: 18,
    color: TOKENS.colors.text.primary,
    fontFamily: TOKENS.fonts.heading,
    fontWeight: '400',
    letterSpacing: -0.5,
  },
  footer: {
    marginTop: 20,
  },
  footerLink: {
    marginBottom: TOKENS.spacing['04'],
  },
  footerLinkText: {
    fontSize: 14,
    color: TOKENS.colors.text.placeholder,
    fontFamily: TOKENS.fonts.body,
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
});
