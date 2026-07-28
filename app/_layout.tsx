import '../global.css';
import { useEffect } from 'react';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { useDrizzleStudio } from 'expo-drizzle-studio-plugin';
import { openDatabaseSync } from 'expo-sqlite';
import { useMigrations } from 'drizzle-orm/expo-sqlite/migrator';
import { Text, View } from 'react-native';

import { db } from '@/db';
import migrations from '@/drizzle/migrations';

const expoDb = openDatabaseSync('tenencyManagement.db');

export default function RootLayout() {
  useDrizzleStudio(expoDb);

  const { success, error } = useMigrations(db, migrations);

  useEffect(() => {
    if (error) {
      console.error('Migration failed:', error);
    }
  }, [error]);

  if (!success) {
    return (
      <View className="flex-1 items-center justify-center bg-background">
        <Text className="text-foreground">Preparing database...</Text>
      </View>
    );
  }

  return (
    <>
      <StatusBar style="dark" />
      <Stack screenOptions={{ headerShown: false, animation: 'fade' }}>
        <Stack.Screen name="index" />
      </Stack>
    </>
  );
}