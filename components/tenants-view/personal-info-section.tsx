import { View, Text, ActivityIndicator, } from 'react-native';
import { useLocalSearchParams, } from 'expo-router';
import { useState, useCallback } from 'react';
import { useFocusEffect } from '@react-navigation/native';
import { getFullTenantDetails } from '@/db/queries/tenants.queries';
import dayjs from 'dayjs';


export function DisplayPersonalInfoOfTenant(){

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

  const { tenant, } = data;
  return(
    <View className="bg-white rounded-2xl p-4 mb-4 shadow-sm border border-border">
              <Text className="text-xs font-bold text-muted-foreground mb-4 uppercase tracking-wider">Personal Information</Text>
              <View className="flex-row justify-between mb-3 border-b border-border/50 pb-3">
                <Text className="text-muted-foreground">CNIC Number</Text>
                <Text className="font-medium text-foreground">{tenant.cnic_number}</Text>
              </View>
              <View className="flex-row justify-between mb-3 border-b border-border/50 pb-3">
                <Text className="text-muted-foreground">Contact</Text>
                <Text className="font-medium text-foreground">{tenant.contact_no}</Text>
              </View>
              <View className="flex-row justify-between mb-3 border-b border-border/50 pb-3">
                <Text className="text-muted-foreground">CNIC Expiry</Text>
                <Text className="font-medium text-foreground">{dayjs(tenant.cnic_expiry_date).format('DD MMM YYYY')}</Text>
              </View>
              <View className="flex-col">
                <Text className="text-muted-foreground mb-1">Permanent Address</Text>
                <Text className="font-medium text-foreground leading-5">{tenant.permanent_address}</Text>
              </View>
            </View>
  )
}