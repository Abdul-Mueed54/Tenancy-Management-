import { View, Text, TouchableOpacity, ScrollView, ActivityIndicator, Image, Modal } from 'react-native';
import { useLocalSearchParams, router, Stack } from 'expo-router';
import { useState, useCallback } from 'react';
import { useFocusEffect } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import { getFullTenantDetails, toggleTenantStatus } from '@/db/queries';
import dayjs from 'dayjs';
import { CustomAlertDialog } from '@/components/ui/alert-dialog'; // Adjust path if needed
// import * as Print from 'expo-print';

export default function TenantDetailsScreen() {
  const { cnic } = useLocalSearchParams<{ cnic: string }>();
  const [data, setData] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [showImageModal, setShowImageModal] = useState(false);
  const [imageToView, setImageToView] = useState<string | null>(null);

  // New state for the Custom Alert Dialog
  const [showStatusAlert, setShowStatusAlert] = useState(false);

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

  const confirmToggleStatus = async () => {
    setShowStatusAlert(false); // Close the modal
    const res = await toggleTenantStatus(data.agreement.agreement_id, data.agreement.is_active);
    if (res.success) fetchDetails(); // Refresh data
  };

  const handleGenerateHistoryPDF = async () => {
    // We will use CustomAlertDialog here later, for now just a placeholder
    console.log("Generate PDF triggered");
  };

  const openDocument = (uri: string | null) => {
    if (!uri) {
      // You might want to use a CustomAlertDialog here too eventually!
      return;
    }
    setImageToView(uri);
    setShowImageModal(true);
  };

  if (isLoading) {
    return (
      <View className="flex-1 justify-center items-center bg-background">
        <ActivityIndicator size="large" color="#0f766e" />
      </View>
    );
  }

  if (!data) {
    return (
      <View className="flex-1 justify-center items-center bg-background">
        <Text className="text-xl font-bold">Tenant not found</Text>
      </View>
    );
  }

  const { tenant, agreement } = data;

  return (
    <View className="flex-1 ">
      <Stack.Screen options={{ headerShown: false }} />

      {/* HEADER WITH EDIT BUTTON */}
      <View className="flex-row justify-between items-center px-4 pt-12 pb-4 border-b border-border shadow-sm">
        <View className="flex-row items-center">
          <TouchableOpacity onPress={() => router.back()} className="p-2 mr-1 -ml-2">
            <Ionicons name="chevron-back" size={24} color="#000" />
          </TouchableOpacity>
          <View>
            <Text className="text-xl font-bold text-foreground">{tenant.name}</Text>
            <Text className="text-xs text-muted-foreground">{agreement.building_name} - {agreement.unit_number}</Text>
          </View>
        </View>

        <View className="flex-row items-center">
          <View className={`px-2 py-1 rounded-md mr-3 ${agreement.is_active ? 'bg-green-100' : 'bg-red-100'}`}>
            <Text className={`text-xs font-bold uppercase ${agreement.is_active ? 'text-green-700' : 'text-red-700'}`}>
              {agreement.is_active ? 'Active' : 'Inactive'}
            </Text>
          </View>

          {/* EDIT BUTTON */}
          <TouchableOpacity
            onPress={() => router.push(`/tenants/edit?cnic=${tenant.cnic_number}`)}
            className="p-2 -mr-2"
          >
            <Ionicons name="pencil" size={20} color="#0f766e" />
          </TouchableOpacity>
        </View>
      </View>

      <ScrollView showsVerticalScrollIndicator={false} className="flex-1 bg-muted/10 p-4">

        {/* QUICK ACTIONS ROW */}
        <View className="flex-row justify-between mb-6">
          <TouchableOpacity onPress={handleGenerateHistoryPDF} className="flex-1 bg-white p-3 rounded-xl border border-border items-center mr-2 shadow-sm">
            <Ionicons name="document-text" size={20} color="#0f766e" />
            <Text className="text-primary-700 text-xs font-bold mt-1">Summary PDF</Text>
          </TouchableOpacity>
          <TouchableOpacity onPress={() => openDocument(tenant.cnic_uri)} className="flex-1 bg-white border border-border p-3 rounded-xl items-center mr-2 shadow-sm">
            <Ionicons name="id-card" size={20} color="#0f766e" />
            <Text className="text-primary-700 text-xs font-bold mt-1">View CNIC</Text>
          </TouchableOpacity>
          <TouchableOpacity onPress={() => openDocument(agreement.attachment_uri)} className="flex-1 bg-white border border-border p-3 rounded-xl items-center shadow-sm">
            <Ionicons name="contract" size={20} color="#0f766e" />
            <Text className="text-primary-700 text-xs font-bold mt-1">Agreement</Text>
          </TouchableOpacity>
        </View>

        {/* SECTION: TENANT DETAILS */}
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

        {/* SECTION: AGREEMENT DETAILS */}
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

        {/* SECTION: LEDGERS & FINANCES ROUTING */}
        <TouchableOpacity
          onPress={() => router.push(`/ledgers/${agreement.agreement_id}`)}
          className="bg-white rounded-2xl p-5 mb-6 shadow-sm border border-border flex-row justify-between items-center"
        >
          <View className="flex-row items-center">
            <View className="bg-teal-100 p-2 rounded-lg mr-3">
              <Ionicons name="wallet" size={24} color="#0f766e" />
            </View>
            <View>
              <Text className="font-bold text-foreground text-lg">Manage Finances</Text>
              <Text className="text-muted-foreground text-xs">View ledgers, payments & misc charges</Text>
            </View>
          </View>
          <Ionicons name="chevron-forward" size={20} color="#a1a1aa" />
        </TouchableOpacity>

       {/* SECTION: DANGER ZONE */}
        <View className="bg-red-50 rounded-2xl p-4 mb-12 border border-red-200">
          <Text className="text-xs font-bold text-red-700 mb-2 uppercase tracking-wider">Danger Zone</Text>
          <Text className="text-xs text-red-800/70 mb-4">
            Marking a tenant as inactive stops all automated billing and flags them as moved out. You can reactivate them later if needed.
          </Text>
          <TouchableOpacity
            onPress={() => setShowStatusAlert(true)} // Trigger the custom modal
            className={`p-3 rounded-xl items-center ${agreement.is_active ? 'bg-red-600' : 'bg-red-200'}`}
          >
            <Text className={`font-bold ${agreement.is_active ? 'text-white' : 'text-red-800'}`}>
              {agreement.is_active ? "Mark as Moved Out (Inactive)" : "Reactivate Tenant"}
            </Text>
          </TouchableOpacity>
        </View>

      </ScrollView>

      {/* FULLSCREEN IMAGE MODAL FOR CNIC / AGREEMENT */}
      <Modal visible={showImageModal} transparent={true} animationType="fade" onRequestClose={() => setShowImageModal(false)}>
        <View className="flex-1 bg-black justify-center items-center">
          <TouchableOpacity onPress={() => setShowImageModal(false)} className="absolute top-12 right-6 z-10 p-2 bg-black/50 rounded-full">
            <Ionicons name="close" size={28} color="#fff" />
          </TouchableOpacity>
          {imageToView && (
            <Image
              source={{ uri: imageToView }}
              className="w-full h-[70%]"
              resizeMode="contain"
            />
          )}
        </View>
      </Modal>

      {/* CUSTOM STATUS ALERT DIALOG */}
      <CustomAlertDialog
        visible={showStatusAlert}
        onOpenChange={setShowStatusAlert}
        title={agreement.is_active ? "Deactivate Tenant" : "Activate Tenant"}
        description={`Are you sure you want to mark this tenant as ${agreement.is_active ? "inactive" : "active"}?`}
        actionText="Confirm"
        onAction={confirmToggleStatus}
        isDestructive={agreement.is_active} // Red button if deactivating, Teal if activating!
      />

    </View>
  );
}