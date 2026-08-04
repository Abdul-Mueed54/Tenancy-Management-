import { View, Text } from 'react-native';
import { Link, useFocusEffect } from 'expo-router';
import { useCallback, useState } from 'react';
import { ExpiringAgreement, ExpiringAgreementsWidget } from '@/components/dashboard/expiring-agreements-widget';
import { getExpiringAgreements } from '@/db/queries/agreements.queries';

export default function DashboardScreen() {

  const [expiring, setExpiring] = useState<ExpiringAgreement[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useFocusEffect(
    useCallback(() => {
      const fetchExpiring = async () => {
        setIsLoading(true);
        const result = await getExpiringAgreements(30); // 30 days
        if (result.success && result.data) {
          setExpiring(result.data);
        }
        setIsLoading(false);
      };
      fetchExpiring();
    }, [])
  );
  return (
    <View className="flex-1 items-center justify-center bg-background">
      
    <ExpiringAgreementsWidget
      agreements={expiring}
      isLoading={isLoading}
      title="Upcoming Renewals"
    />

    </View>
  );
}