import { View, Text, TouchableOpacity, ScrollView, ActivityIndicator, Image, Modal } from 'react-native';
import { useLocalSearchParams, router, Stack } from 'expo-router';
import { useState, useCallback } from 'react';
import { useFocusEffect } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import * as DocumentPicker from 'expo-document-picker';
import * as Sharing from 'expo-sharing';
import { Platform } from 'react-native'; // Import Platform
import * as FileSystem from 'expo-file-system/legacy';
import * as IntentLauncher from 'expo-intent-launcher';
import { getFullTenantDetails, toggleTenantStatus, uploadAgreementDocument } from '@/db/queries';
import dayjs from 'dayjs';

import { CustomAlertDialog } from '@/components/ui/alert-dialog';
import { CustomDropdownMenu, DropdownMenuItem } from '@/components/ui/dropdown-menu';
import { CustomToast } from '@/components/ui/toast';

export default function TenantDetailsScreen() {
  const { cnic } = useLocalSearchParams<{ cnic: string }>();
  const [data, setData] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [showImageModal, setShowImageModal] = useState(false);
  const [imageToView, setImageToView] = useState<string | null>(null);

  // Modals & Toast state
  const [showStatusAlert, setShowStatusAlert] = useState(false);
  const [showMenu, setShowMenu] = useState(false);
  const [toast, setToast] = useState<{ visible: boolean; message: string; type: 'success' | 'error' | 'info' }>({ visible: false, message: '', type: 'success' });

  const showToast = (message: string, type: 'success' | 'error' | 'info' = 'success') => {
    setToast({ visible: true, message, type });
  };

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
    setShowStatusAlert(false);
    const res = await toggleTenantStatus(data.agreement.agreement_id, data.agreement.is_active);
    if (res.success) {
      showToast(`Tenant ${data.agreement.is_active ? 'deactivated' : 'activated'} successfully!`, 'success');
      fetchDetails();
    } else {
      showToast('Failed to update tenant status.', 'error');
    }
  };

  // NEW: Handles both PDFs and Images
  const handleUploadAgreement = async () => {
    setShowMenu(false);

    try {
      const result = await DocumentPicker.getDocumentAsync({
        type: ['application/pdf', 'image/*'], // Allow PDFs and Images
        copyToCacheDirectory: true,
      });

      if (!result.canceled && result.assets && result.assets.length > 0) {
        const uri = result.assets[0].uri;
        const res = await uploadAgreementDocument(data.agreement.agreement_id, uri);

        if (res.success) {
          showToast("Agreement uploaded successfully!", "success");
          fetchDetails();
        } else {
          showToast("Could not save the document.", "error");
        }
      }
    } catch (error) {
      showToast("An error occurred while picking the document.", "error");
    }
  };

  const openDocument = async (uri: string | null) => {
    if (!uri) {
      showToast("No document is attached.", "error");
      return;
    }

    if (uri.toLowerCase().endsWith('.pdf')) {
      try {
        if (Platform.OS === 'android') {
          // 1. Android: Convert file:// URI to content:// URI so other apps can read it safely
          const contentUri = await FileSystem.getContentUriAsync(uri);

          // 2. Force open the default PDF viewer app directl
          await IntentLauncher.startActivityAsync('android.intent.action.VIEW', {
            data: contentUri,
            flags: 1,
            type: 'application/pdf',
          });
        } else {
          // 3. iOS: Use UTI to trigger Apple's native full-screen Quick Look preview
          const isAvailable = await Sharing.isAvailableAsync();
          if (isAvailable) {
            await Sharing.shareAsync(uri, { UTI: 'com.adobe.pdf' });
          } else {
            showToast("PDF viewer not available on this device.", "error");
          }
        }
      } catch (error) {
        showToast("No PDF viewer app installed on your phone.", "error");
      }
    } else {
      // It's an image, use our custom fullscreen modal
      setImageToView(uri);
      setShowImageModal(true);
    }
  };

  const handleGenerateHistoryPDF = async () => {
    showToast("PDF Generation coming soon!", "info");
  };

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

  const menuItems: DropdownMenuItem[] = [
    {
      label: "Edit Tenant",
      icon: "pencil",
      onPress: () => router.push(`/tenants/edit?cnic=${tenant.cnic_number}`),
    },
    {
      label: agreement.attachment_uri ? "Update Agreement" : "Upload Agreement",
      icon: "document-attach",
      onPress: handleUploadAgreement,
    },
    {
      label: agreement.is_active ? 'Deactivate' : 'Reactivate',
      icon: "power",
      isDestructive: agreement.is_active,
      onPress: () => setShowStatusAlert(true),
    }
  ];

  return (
    <View className="flex-1">
      <Stack.Screen options={{ headerShown: false }} />

      {/* OUR NEW CUSTOM TOAST */}
      <CustomToast
        visible={toast.visible}
        message={toast.message}
        type={toast.type}
        onHide={() => setToast({ ...toast, visible: false })}
      />

      {/* HEADER WITH THREE DOTS */}
      <View className="flex-row justify-between items-center px-4 pt-12 pb-4 border-b border-border shadow-sm z-10 bg-white">
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
          <View className={`px-2 py-1 rounded-md mr-1 ${agreement.is_active ? 'bg-green-100' : 'bg-red-100'}`}>
            <Text className={`text-xs font-bold uppercase ${agreement.is_active ? 'text-green-700' : 'text-red-700'}`}>
              {agreement.is_active ? 'Active' : 'Inactive'}
            </Text>
          </View>
          <TouchableOpacity onPress={() => setShowMenu(true)} className="p-2 -mr-2">
            <Ionicons name="ellipsis-vertical" size={22} color="#000" />
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

          {/* AGREEMENT BUTTON */}
          <TouchableOpacity onPress={() => openDocument(agreement.attachment_uri)} className="flex-1 bg-white border border-border p-3 rounded-xl items-center shadow-sm">
            <Ionicons name="contract" size={20} color="#0f766e" />
            <Text className="text-primary-700 text-xs font-bold mt-1">Agreement</Text>
          </TouchableOpacity>
        </View>

        {/* ... (Personal Information & Contract Info sections remain exactly the same) ... */}

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

        <TouchableOpacity
          onPress={() => router.push(`/ledgers/${agreement.agreement_id}`)}
          className="bg-white rounded-2xl p-5 mb-12 shadow-sm border border-border flex-row justify-between items-center"
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

      </ScrollView>

      <CustomDropdownMenu
        visible={showMenu}
        onOpenChange={setShowMenu}
        items={menuItems}
      />

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

      <CustomAlertDialog
        visible={showStatusAlert}
        onOpenChange={setShowStatusAlert}
        title={agreement.is_active ? "Deactivate Tenant" : "Activate Tenant"}
        description={`Are you sure you want to mark this tenant as ${agreement.is_active ? "inactive" : "active"}?`}
        actionText="Confirm"
        onAction={confirmToggleStatus}
        isDestructive={agreement.is_active}
      />
    </View>
  );
}