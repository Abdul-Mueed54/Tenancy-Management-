import { View, Text, TouchableOpacity, ActivityIndicator } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import dayjs from 'dayjs';

export type ExpiringAgreement = {
  agreementId: string;
  tenantId: string;
  tenantName: string;
  unitNumber: string;
  endDate: string;
};

interface ExpiringAgreementsWidgetProps {
  agreements: ExpiringAgreement[];
  isLoading: boolean;
  title?: string;
}

export const ExpiringAgreementsWidget = ({
  agreements,
  isLoading,
  title = "Expiring Soon"
}: ExpiringAgreementsWidgetProps) => {

  if (isLoading) {
    return (
      <View className="bg-white rounded-2xl p-5 mb-4 m-5 shadow-sm border border-border justify-center items-center h-32">
        <ActivityIndicator color="#0f766e" />
      </View>
    );
  }

  if (agreements.length === 0) {
    return (
      <View className="bg-white rounded-2xl p-4 mb-4 m-5 shadow-sm border border-border flex-row items-center">
        <View className="bg-green-100 p-2 rounded-full mr-3">
          <Ionicons name="checkmark-circle" size={24} color="#15803d" />
        </View>
        <View className="flex-1">
          <Text className="text-foreground font-bold">{title}</Text>
          <Text className="text-muted-foreground text-xs">No agreements expiring in the next 30 days.</Text>
        </View>
      </View>
    );
  }

  return (
    <View className="bg-white rounded-2xl mb-4 shadow-sm border border-border overflow-hidden">
      {/* HEADER */}
      <View className="bg-amber-50 px-4 py-3 border-b border-amber-100 flex-row items-center justify-between">
        <View className="flex-row items-center">
          <Ionicons name="warning" size={18} color="#d97706" className="mr-2" />
          <Text className="text-amber-900 font-bold text-sm ml-1">{title}</Text>
        </View>
        <View className="bg-amber-200 px-2 py-0.5 rounded-full">
          <Text className="text-amber-900 text-xs font-bold">{agreements.length}</Text>
        </View>
      </View>

      {/* LIST OF EXPIRING AGREEMENTS */}
      <View className="px-4 py-2">
        {agreements.map((item, index) => {
          const daysLeft = dayjs(item.endDate).diff(dayjs(), 'day');
          const isUrgent = daysLeft <= 7;

          return (
            <TouchableOpacity
              key={item.agreementId}
              onPress={() => router.push(`/tenants/${item.tenantId}`)}
              className={`flex-row justify-between items-center py-3 ${
                index !== agreements.length - 1 ? 'border-b border-border' : ''
              }`}
            >
              <View className="flex-1">
                <Text className="text-foreground font-bold text-base">{item.tenantName}</Text>
                <Text className="text-muted-foreground text-xs">Unit {item.unitNumber}</Text>
              </View>

              <View className="items-end">
                <View className={`px-2 py-1 rounded-md mb-1 ${isUrgent ? 'bg-red-100' : 'bg-amber-100'}`}>
                  <Text className={`text-xs font-bold ${isUrgent ? 'text-red-700' : 'text-amber-700'}`}>
                    {daysLeft < 0 ? 'Expired' : `${daysLeft} Days Left`}
                  </Text>
                </View>
                <Text className="text-muted-foreground text-xs">{dayjs(item.endDate).format('MMM D, YYYY')}</Text>
              </View>
            </TouchableOpacity>
          );
        })}
      </View>
    </View>
  );
};