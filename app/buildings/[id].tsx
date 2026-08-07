import { View, Text, TouchableOpacity, ActivityIndicator, ScrollView } from 'react-native';
import { useLocalSearchParams, router, Stack } from 'expo-router';
import { useState, useCallback } from 'react';
import { useFocusEffect } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import { getTenantsByBuilding } from '@/db/queries/tenants.queries';
import { buildings } from '@/db/schema';

type BuildingTenant = {
  id: string;
  cnic: string;
  name: string;
  contact: string;
  rentAmount: number;
  isActive: boolean;
};

export default function BuildingDetailsScreen() {
  const {id, name } = useLocalSearchParams<{id:string; name: string }>();
  const [tenants, setTenants] = useState<BuildingTenant[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useFocusEffect(
    useCallback(() => {
      const fetchData = async () => {
        setIsLoading(true);
        if (id) {
          const result = await getTenantsByBuilding(id);
          if (result.success && result.data) {
            setTenants(result.data);
          }
        }
        setIsLoading(false);
      };
      fetchData();
    }, [id])
  );

  return (
    <View className="flex-1 ">
      <Stack.Screen options={{ headerShown: false }} />
      <View className="flex-row  justify-between px-4 pt-12 pb-4 border-b border-border shadow-sm">
      <View className='flex-row items-center'>
        <TouchableOpacity onPress={() => router.back()} className="p-2 mr-2">
          <Ionicons name="chevron-back" size={24} color="#000" />
        </TouchableOpacity>
        <Text className="text-xl font-bold text-foreground">{name}</Text>
        </View>
        <TouchableOpacity onPress={() => router.push({ pathname: "/tenants/add", params: {buildingId: id, buildingName: name } })}
            className="bg-primary-50 px-3 py-1 rounded-lg flex-row items-center"
            >
          <Ionicons name="add" size={16} color="#0f766e" />
          <Text className="text-primary-700 font-bold ml-1">Add New</Text>
        </TouchableOpacity>
      </View>

      {/* Body */}
      {isLoading ? (
        <View className="flex-1 justify-center items-center">
          <ActivityIndicator size="large" color="#0f766e" />
        </View>
      ) : tenants.length === 0 ? (
        <View className="flex-1 justify-center items-center px-6">
          <Ionicons name="people-outline" size={64} color="#a1a1aa" className="mb-4" />
          <Text className="text-xl font-bold text-foreground mb-2 text-center">No tenants yet</Text>
          <Text className="text-muted-foreground text-center mb-8">
            There are currently no active tenants registered in {name}.
          </Text>

          <TouchableOpacity onPress={() => router.push({ pathname: "/tenants/add", params: {buildingId: id, buildingName: name } })}
            className="bg-primary-700 px-3 py-3 rounded-xl flex-row items-center shadow-sm"
          >
            <Ionicons name="add" size={20} color="#fff" className="mr-2" />
            <Text className="text-white font-bold text-md">Add First Tenant</Text>
          </TouchableOpacity>
        </View>

      ) : ( <ScrollView className="flex-1 p-4">
          {tenants.map((tenant) => (
            <View key={tenant.cnic}>
            <TouchableOpacity onPress={() => router.push({ pathname: '/tenants/[id]', params: { id: tenant.id } })}>
             <View className="border border-border rounded-xl p-4 mb-3 flex-row bg-white items-center justify-between">
              <View >
                <Text className="text-lg font-bold text-foreground">{tenant.name}</Text>
                <Text className="text-muted-foreground mt-1">{tenant.contact}</Text>
              </View>
              <View className="items-end">
                <Text className="text-foreground font-medium">Rs {tenant.rentAmount}</Text>
                  {tenant.isActive ? (
                <View className="bg-green-100 px-2 py-1 rounded mt-1">
                    <Text className="text-green-700 text-xs font-bold uppercase">Active</Text>
                </View>
                  ): (
                    <View className="bg-red-100 px-2 py-1 rounded mt-1">
                    <Text className="text-red-700 text-xs font-bold uppercase">in Active</Text>
                      </View>
                    )}
              </View>
              </View>
            </TouchableOpacity>
            </View>
          ))}
        </ScrollView>
      )}
    </View>
  );
}