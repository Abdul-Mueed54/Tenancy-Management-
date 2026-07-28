import '../global.css';

import { useEffect } from 'react';
import { View, Text } from 'react-native';
import { Stack } from 'expo-router';
import { openDatabaseSync } from 'expo-sqlite';
import { useDrizzleStudio } from 'expo-drizzle-studio-plugin';
import { useMigrations } from 'drizzle-orm/expo-sqlite/migrator';

import { db } from '@/db';
import migrations from '@/drizzle/migrations';

const expoDb = openDatabaseSync('tenancy.db');

export default function RootLayout() {
  useDrizzleStudio(expoDb);

  const { success, error } = useMigrations(db, migrations);

  if (error) {
    return (
      <View className="flex-1 items-center justify-center bg-background">
        <Text className="text-red-500 font-bold">Migration error: {error.message}</Text>
      </View>
    );
  }

  if (!success) {
    return (
      <View className="flex-1 items-center justify-center bg-background">
        <Text className="text-foreground">Building database...</Text>
      </View>
    );
  }

  // The Root Layout MUST return a Stack so non-tab screens (like Add Tenant) can render
  return <Stack screenOptions={{ headerShown: false }} />;
}