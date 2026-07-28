import React from 'react';
import { ScrollView, View, SafeAreaView } from 'react-native';
import { Text } from '@/components/ui/text';

export default function Dashboard() {
  return (
    <SafeAreaView className="flex-1 bg-background">
      <ScrollView className="px-5 pt-8 pb-10 space-y-6">

        {/* Header Section */}
        <View className="mb-6 mt-4">
          <Text className="text-3xl font-extrabold text-foreground tracking-tight">
            Tenancy Manager
          </Text>
          <Text className="text-base text-muted-foreground mt-1">
            Welcome back, Maalik.
          </Text>
        </View>

      </ScrollView>
    </SafeAreaView>
  );
}