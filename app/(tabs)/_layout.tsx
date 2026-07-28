import { Tabs } from 'expo-router';
import { Ionicons,  } from '@expo/vector-icons';

export default function TabLayout() {
  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: '#0f766e', // React Native requires the exact hex code here
        tabBarInactiveTintColor: '#737373',
        tabBarStyle: {
          backgroundColor: '#ffffff',
          borderTopWidth: 1,
          borderTopColor: '#e5e5e5',
          height: 65,
          paddingBottom: 10,
          paddingTop: 10,
        },
        tabBarLabelStyle: {
          fontSize: 12,
          fontWeight: '600',
          marginTop: 4,
        },
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: 'Home',
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="home" color={color} size={24} />
          ),
        }}
      />

      <Tabs.Screen
        name="tenants"
        options={{
          title: 'Tenants',
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="people" color={color} size={24} />
          ),
        }}
      />

      <Tabs.Screen
        name="buildings"
        options={{
          title: 'Buildings',
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="business" color={color} size={26} />
          ),
        }}
      />
    </Tabs>
  );
}