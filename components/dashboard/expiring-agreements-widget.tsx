import { View, Text, TouchableOpacity, ActivityIndicator } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import * as Clipboard from 'expo-clipboard';
import dayjs from 'dayjs';
import { useState } from 'react';

import { CustomToast } from '@/components/ui/toast';

export type ExpiringAgreement = {
  agreementId: string;
  tenantId: string;
  tenantName: string;
  contactNumber: string;
  buildingName: string;
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
  title = "Upcoming Renewals"
}: ExpiringAgreementsWidgetProps) => {

  const [toast, setToast] = useState<{ visible: boolean; message: string; type: 'success' | 'info' | 'error' }>({ visible: false, message: '', type: 'success' });

  if (isLoading) {
    return (
      <View className="w-full bg-white rounded-2xl p-5 mb-4 shadow-sm border border-border justify-center items-center h-24">
        <ActivityIndicator color="#0f766e" />
      </View>
    );
  }

  if (agreements.length === 0) {
    return null;
  }

  const copyPhone = async (phone: string) => {
    await Clipboard.setStringAsync(phone);
    setToast({ visible: true, message: 'Phone number copied!', type: 'success' });
  };

  return (
    <View className="bg-white rounded-2xl m-5 shadow-sm border border-border overflow-hidden">

      {/* LOCAL TOAST */}
      <CustomToast
        visible={toast.visible}
        message={toast.message}
        type={toast.type}
        onHide={() => setToast({ ...toast, visible: false })}
      />

      {/* HEADER - Soft teal background for a polished look */}
      <View className="px-4 py-3 bg-amber-50/50 border-b border-border flex-row items-center justify-between">
        <View className="flex-row items-center">
          <Ionicons name="notifications-outline" size={18} color="#765b0f" className="mr-2" />
          <Text className="text-amber-900 font-bold text-sm">{title}</Text>
        </View>
        <View className="bg-amber-100 px-2 py-0.5 rounded-full">
          <Text className="text-amber-800 text-xs font-bold">{agreements.length}</Text>
        </View>
      </View>

      {/* LIST ITEMS */}
      <View>
        {agreements.map((item, index) => {
          const daysLeft = dayjs(item.endDate).diff(dayjs(), 'day');
          const isUrgent = daysLeft <= 7;
          const pillBg = isUrgent ? 'bg-red-50' : 'bg-amber-50';
          const pillText = isUrgent ? 'text-red-700' : 'text-amber-700';

          return (
            <TouchableOpacity
              key={item.agreementId}
              onPress={() => router.push({
                pathname: '/agreements/renew',
                params: { agreementId: item.agreementId }
              })}
              className={`flex-row items-center justify-between p-4  ${
                index !== agreements.length - 1 ? 'border-b border-border' : ''
              }`}
            >
              {/* LEFT SIDE: Info */}
              <View className="flex-1">
                <Text className="text-foreground font-bold text-base">{item.tenantName}</Text>
                <Text className="text-muted-foreground text-xs mt-0.5">
                  {item.buildingName} • Unit {item.unitNumber}
                </Text>

                {/* COPYABLE PHONE NUMBER */}
                <TouchableOpacity
                  onLongPress={() => copyPhone(item.contactNumber)}
                  className="flex-row items-center mt-1.5"
                >
                  <Ionicons name="call" size={12} color="#0f766e" className="mr-1" />
                  <Text className="text-muted-foreground text-xs font-medium">{item.contactNumber}</Text>
                </TouchableOpacity>
              </View>

              {/* RIGHT SIDE: Expiry & Chevron */}
              <View className="flex-row items-center">
                <View className="items-end mr-3">
                  <View className={`${pillBg} px-2 py-1 rounded-md mb-1 border ${isUrgent ? 'border-red-100' : 'border-amber-100'}`}>
                    <Text className={`text-xs font-bold ${pillText}`}>
                      {daysLeft < 0 ? 'Expired' : `${daysLeft} Days Left`}
                    </Text>
                  </View>
                  <Text className="text-muted-foreground text-xs font-medium">
                    {dayjs(item.endDate).format('MMM D, YYYY')}
                  </Text>
                </View>
                <View className="bg-muted/30 p-1.5 rounded-full">
                  <Ionicons name="chevron-forward" size={18} color="#0f766e" />
                </View>
              </View>
            </TouchableOpacity>
          );
        })}
      </View>
    </View>
  );
};