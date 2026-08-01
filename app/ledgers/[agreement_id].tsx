import { View, Text, TouchableOpacity, ScrollView, ActivityIndicator } from 'react-native';
import { useLocalSearchParams, router, Stack } from 'expo-router';
import { useState, useCallback } from 'react';
import { useFocusEffect } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import { getFinancialHistory } from '@/db/queries';
import dayjs from 'dayjs';

export default function ManageFinancesScreen() {
  const { agreement_id } = useLocalSearchParams<{ agreement_id: string }>();
  const [isLoading, setIsLoading] = useState(true);
  const [finances, setFinances] = useState<{ rentLedgers: any[], miscCharges: any[] }>({ rentLedgers: [], miscCharges: [] });

  // Tab state: 'rent' or 'misc'
  const [activeTab, setActiveTab] = useState<'rent' | 'misc'>('rent');

  const fetchFinances = async () => {
    setIsLoading(true);
    if (agreement_id) {
      const result = await getFinancialHistory(agreement_id);
      if (result.success && result.data) {
        setFinances(result.data);
      }
    }
    setIsLoading(false);
  };

  useFocusEffect(
    useCallback(() => {
      fetchFinances();
    }, [agreement_id])
  );

  // Calculate totals
  const totalRentDue = finances.rentLedgers.reduce((acc, curr) => acc + curr.amount_due, 0);
  const totalMiscDue = finances.miscCharges.filter(m => m.status === 'pending').reduce((acc, curr) => acc + curr.amount, 0);
  const totalOutstanding = totalRentDue + totalMiscDue;

  if (isLoading) {
    return (
      <View className="flex-1 justify-center items-center bg-white">
        <ActivityIndicator size="large" color="#0f766e" />
      </View>
    );
  }

  return (
    <View className="flex-1 bg-white">
      <Stack.Screen options={{ headerShown: false }} />

      {/* HEADER */}
      <View className="flex-row items-center px-4 pt-12 pb-4 border-b border-border bg-white shadow-sm">
        <TouchableOpacity onPress={() => router.back()} className="p-2 mr-1 -ml-2">
          <Ionicons name="chevron-back" size={24} color="#000" />
        </TouchableOpacity>
        <Text className="text-xl font-bold text-foreground">Manage Finances</Text>
      </View>

      <ScrollView showsVerticalScrollIndicator={false} className="flex-1 bg-muted/10 p-4">

        {/* OUTSTANDING BALANCE CARD */}
        <View className="bg-teal-700 rounded-2xl p-6 mb-6 shadow-sm">
          <Text className="text-teal-100 text-sm font-medium mb-1 uppercase tracking-wider">Total Outstanding Due</Text>
          <Text className="text-white text-4xl font-bold mb-4">Rs {totalOutstanding}</Text>

          <View className="flex-row justify-between border-t border-teal-600/50 pt-4 mt-2">
            <View>
              <Text className="text-teal-100 text-xs">Rent Arrears</Text>
              <Text className="text-white font-bold text-base mt-1">Rs {totalRentDue}</Text>
            </View>
            <View className="items-end">
              <Text className="text-teal-100 text-xs">Misc Arrears</Text>
              <Text className="text-white font-bold text-base mt-1">Rs {totalMiscDue}</Text>
            </View>
          </View>
        </View>

        {/* CUSTOM TABS */}
        <View className="flex-row bg-white rounded-lg p-1 mb-6 border border-border shadow-sm">
          <TouchableOpacity
            onPress={() => setActiveTab('rent')}
            className={`flex-1 py-2 items-center rounded-md ${activeTab === 'rent' ? 'bg-teal-50 border border-teal-200' : ''}`}
          >
            <Text className={`font-bold ${activeTab === 'rent' ? 'text-teal-800' : 'text-muted-foreground'}`}>Monthly Rent</Text>
          </TouchableOpacity>
          <TouchableOpacity
            onPress={() => setActiveTab('misc')}
            className={`flex-1 py-2 items-center rounded-md ${activeTab === 'misc' ? 'bg-teal-50 border border-teal-200' : ''}`}
          >
            <Text className={`font-bold ${activeTab === 'misc' ? 'text-teal-800' : 'text-muted-foreground'}`}>Misc Charges</Text>
          </TouchableOpacity>
        </View>

        {/* RENT LIST */}
        {activeTab === 'rent' && (
          <View>
            <View className="flex-row justify-between items-center mb-4">
              <Text className="text-sm font-bold text-muted-foreground uppercase tracking-wider">Rent Ledgers</Text>
              <TouchableOpacity className="bg-primary-50 px-3 py-1.5 rounded-lg flex-row items-center">
                <Ionicons name="add" size={16} color="#0f766e" />
                <Text className="text-primary-700 font-bold ml-1 text-xs">Generate Bill</Text>
              </TouchableOpacity>
            </View>

            {finances.rentLedgers.length === 0 ? (
              <Text className="text-center text-muted-foreground mt-4">No rent ledgers found.</Text>
            ) : (
              finances.rentLedgers.map((ledger) => (
                <View key={ledger.id} className="bg-white rounded-xl p-4 mb-3 border border-border flex-row justify-between items-center shadow-sm">
                  <View>
                    <Text className="font-bold text-foreground text-base">
                      {dayjs(ledger.billing_month).format('MMMM YYYY')}
                    </Text>
                    <Text className="text-muted-foreground text-xs mt-1">
                      Due: Rs {ledger.amount_due} / Total: Rs {ledger.total_payable_amount}
                    </Text>
                  </View>
                  <View className={`px-2 py-1 rounded-md ${ledger.status === 'paid' ? 'bg-green-100' : ledger.status === 'partial' ? 'bg-orange-100' : 'bg-red-100'}`}>
                    <Text className={`text-xs font-bold uppercase ${ledger.status === 'paid' ? 'text-green-700' : ledger.status === 'partial' ? 'text-orange-700' : 'text-red-700'}`}>
                      {ledger.status}
                    </Text>
                  </View>
                </View>
              ))
            )}
          </View>
        )}

        {/* MISC CHARGES LIST */}
        {activeTab === 'misc' && (
          <View>
            <View className="flex-row justify-between items-center mb-4">
              <Text className="text-sm font-bold text-muted-foreground uppercase tracking-wider">Other Charges</Text>
              <TouchableOpacity className="bg-primary-50 px-3 py-1.5 rounded-lg flex-row items-center">
                <Ionicons name="add" size={16} color="#0f766e" />
                <Text className="text-primary-700 font-bold ml-1 text-xs">Add Charge</Text>
              </TouchableOpacity>
            </View>

            {finances.miscCharges.length === 0 ? (
              <Text className="text-center text-muted-foreground mt-4">No miscellaneous charges found.</Text>
            ) : (
              finances.miscCharges.map((charge) => (
                <View key={charge.id} className="bg-white rounded-xl p-4 mb-3 border border-border flex-row justify-between items-center shadow-sm">
                  <View>
                    <Text className="font-bold text-foreground text-base">{charge.charge_type}</Text>
                    <Text className="text-muted-foreground text-xs mt-1">{dayjs(charge.date_incurred).format('DD MMM YYYY')}</Text>
                  </View>
                  <View className="items-end">
                    <Text className="font-bold text-foreground mb-1">Rs {charge.amount}</Text>
                    <View className={`px-2 py-1 rounded-md ${charge.status === 'paid' ? 'bg-green-100' : 'bg-red-100'}`}>
                      <Text className={`text-[10px] font-bold uppercase ${charge.status === 'paid' ? 'text-green-700' : 'text-red-700'}`}>
                        {charge.status}
                      </Text>
                    </View>
                  </View>
                </View>
              ))
            )}
          </View>
        )}

        <View className="h-12" />
      </ScrollView>
    </View>
  );
}