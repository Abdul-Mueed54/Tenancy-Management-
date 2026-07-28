import { View, Text } from 'react-native';
import { Link } from 'expo-router';

export default function DashboardScreen() {
  return (
    <View className="flex-1 items-center justify-center bg-background">
      <Text className="text-xl font-bold text-foreground mb-6">Dashboard (Coming Soon)</Text>

      {/* Temporary button to jump to the UI we are building */}
      <Link href="/tenants/add" className="bg-teal-700 p-4 rounded-xl overflow-hidden">
        <Text className="text-white font-bold">Go to Add Tenant Screen</Text>
      </Link>
    </View>
  );
}