import { View, Text, ActivityIndicator, } from 'react-native';
import { useLocalSearchParams, } from 'expo-router';
import { useState, useCallback } from 'react';
import { useFocusEffect } from '@react-navigation/native';
import { getFullTenantDetails } from '@/db/queries/tenants.queries';
import dayjs from 'dayjs';


export default function DisplayAgreementDetailsOfTenant(){
  const { cnic } = useLocalSearchParams<{ cnic: string }>();
  const [data, setData] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);

  const fetchDetails = async () => {
    setIsLoading(true);
    if (cnic) {
      const result = await getFullTenantDetails(cnic);
      if (result.success) setData(result.data);
    }
    setIsLoading(false);
  };

  useFocusEffect(
    useCallback(() => {
      fetchDetails();
    }, [cnic])
  );

   if (isLoading) {
      return (
        <View className="flex-1 justify-center items-center bg-background">
          <ActivityIndicator size="large" color="#0f766e" />
        </View>
      );
    }

    if (!data) return (
      <View className="flex-1 justify-center items-center bg-background">
        <Text className="text-xl font-bold">Tenant not found</Text>
      </View>
    );

  const { tenant, agreement } = data;
  return(
    <View className="bg-white rounded-2xl p-4 mb-4 shadow-sm border border-border">
          <Text className="text-xs font-bold text-muted-foreground mb-4 uppercase tracking-wider">Financial & Contract Info</Text>
          <View className="flex-row justify-between mb-3 border-b border-border/50 pb-3">
            <Text className="text-muted-foreground">Monthly Rent</Text>
            <Text className="font-bold text-teal-700">Rs {agreement.monthly_rent}</Text>
          </View>
          <View className="flex-row justify-between mb-3 border-b border-border/50 pb-3">
            <Text className="text-muted-foreground">Advance Deposit</Text>
            <Text className="font-medium text-foreground">Rs {agreement.advance_amount}</Text>
          </View>
          <View className="flex-row justify-between mb-3 border-b border-border/50 pb-3">
            <Text className="text-muted-foreground">Move-in Date</Text>
            <Text className="font-medium text-foreground">{dayjs(agreement.start_date).format('DD MMM YYYY')}</Text>
          </View>
          <View className="flex-row justify-between mb-3 border-b border-border/50 pb-3">
            <Text className="text-muted-foreground">Rent Due Date</Text>
            <Text className="font-medium text-foreground">{agreement.rent_due_day} of every month</Text>
          </View>
          <View className="flex-row justify-between">
            <Text className="text-muted-foreground">Profile Created</Text>
            <Text className="text-xs text-muted-foreground mt-0.5">{dayjs(tenant.created_at).format('DD MMM YYYY, h:mm A')}</Text>
          </View>
        </View>
  )
}