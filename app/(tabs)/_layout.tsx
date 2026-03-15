import { Tabs } from 'expo-router';
import { BlurView } from 'expo-blur';
import { Ionicons } from '@expo/vector-icons';
import { StyleSheet, View, Platform } from 'react-native';
import { FONTS } from '../../constants/theme';
import { useTheme } from '../../hooks/useTheme';

export default function TabLayout() {
  const { colors, isDark } = useTheme();

  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarStyle: [
          styles.tabBar,
          { 
            borderColor: isDark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.05)',
            bottom: 0,
          }
        ],
        tabBarBackground: () => (
          <View style={[
            styles.blurContainer, 
            { backgroundColor: isDark ? 'rgba(0,0,0,0.4)' : 'rgba(255,255,255,0.6)' }
          ]}>
            <BlurView intensity={80} tint={isDark ? "dark" : "light"} style={styles.blurView} />
          </View>
        ),
        tabBarActiveTintColor: colors.primary,
        tabBarInactiveTintColor: isDark ? 'rgba(255,255,255,0.4)' : 'rgba(0,0,0,0.4)',
        tabBarShowLabel: true,
        tabBarLabelStyle: {
          fontFamily: FONTS.primary.semiBold,
          fontSize: 10,
          marginTop: -2,
        },
        tabBarIconStyle: {
          marginTop: 6,
        }
      }}>
      <Tabs.Screen
        name="active"
        options={{
          tabBarLabel: 'Ana Sayfa',
          tabBarIcon: ({ color, focused }) => (
            <View style={[
              styles.iconWrapper, 
              focused && { backgroundColor: isDark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.05)' }
            ]}>
              <Ionicons name={focused ? "home" : "home-outline"} size={22} color={color} />
            </View>
          ),
        }}
      />
      <Tabs.Screen
        name="library"
        options={{
          tabBarLabel: 'Kitaplığım',
          tabBarIcon: ({ color, focused }) => (
            <View style={[
              styles.iconWrapper, 
              focused && { backgroundColor: isDark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.05)' }
            ]}>
              <Ionicons name={focused ? "library" : "library-outline"} size={22} color={color} />
            </View>
          ),
        }}
      />
      <Tabs.Screen
        name="clubs"
        options={{
          tabBarLabel: 'Kulüpler',
          tabBarIcon: ({ color, focused }) => (
            <View style={[
              styles.iconWrapper, 
              focused && { backgroundColor: isDark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.05)' }
            ]}>
              <Ionicons name={focused ? "people" : "people-outline"} size={22} color={color} />
            </View>
          ),
        }}
      />
      <Tabs.Screen
        name="profile"
        options={{
          tabBarLabel: 'Profil',
          tabBarIcon: ({ color, focused }) => (
            <View style={[
              styles.iconWrapper, 
              focused && { backgroundColor: isDark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.05)' }
            ]}>
              <Ionicons name={focused ? "person" : "person-outline"} size={22} color={color} />
            </View>
          ),
        }}
      />
    </Tabs>
  );
}

const styles = StyleSheet.create({
  tabBar: {
    position: 'absolute',
    left: 20,
    right: 20,
    elevation: 0,
    borderTopWidth: 0,
    backgroundColor: 'transparent',
    height: Platform.OS === 'ios' ? 88 : 75,
    borderRadius: 35,
    borderWidth: 1,
    overflow: 'hidden',
  },
  blurContainer: {
    ...StyleSheet.absoluteFillObject,
    borderRadius: 35,
    overflow: 'hidden',
  },
  blurView: {
    ...StyleSheet.absoluteFillObject,
  },
  iconWrapper: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
