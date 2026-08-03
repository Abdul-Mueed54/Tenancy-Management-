import { View, Text, TouchableOpacity, ScrollView, ActivityIndicator, } from 'react-native';
import { useLocalSearchParams, router, Stack, useFocusEffect } from 'expo-router';
import { useState, useCallback } from 'react';
import { Ionicons } from '@expo/vector-icons';
import * as DocumentPicker from 'expo-document-picker';
import { getFullTenantDetails, toggleTenantStatus, } from '@/db/queries/tenants.queries';
import { CustomAlertDialog } from '@/components/ui/alert-dialog';
import { CustomDropdownMenu, DropdownMenuItem } from '@/components/ui/dropdown-menu';
import { CustomToast } from '@/components/ui/toast';
import { ActionsRow } from '@/components/tenants-view/actions-row';
import DisplayPersonalInfoOfTenant from '@/components/tenants-view/personal-info-section';
import DisplayAgreementDetailsOfTenant from '@/components/tenants-view/agreement-details-section';
import { uploadAgreementDocument } from '@/db/queries/agreements.queries';

export default function TenantDetailsScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const [data, setData] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Modals & Toast state
  const [showStatusAlert, setShowStatusAlert] = useState(false);
  const [showMenu, setShowMenu] = useState(false);
  const [toast, setToast] = useState<{ visible: boolean; message: string; type: 'success' | 'error' | 'info' }>({ visible: false, message: '', type: 'success' });

  const showToast = (message: string, type: 'success' | 'error' | 'info' = 'success') => {
    setToast({ visible: true, message, type });
  };

  const fetchDetails = async () => {
    setIsLoading(true);
    if (id) {
      const result = await getFullTenantDetails(id);
      if (result.success) setData(result.data);
    }
    setIsLoading(false);
  };

  useFocusEffect(
    useCallback(() => {
      fetchDetails();
    }, [id])
  );

  const confirmToggleStatus = async () => {
    setShowStatusAlert(false);
    const res = await toggleTenantStatus(data.agreement.agreement_id, data.agreement.is_active, id);
    if (res.success) {
      showToast(`Tenant ${data.agreement.is_active ? 'deactivated' : 'activated'} successfully!`, 'success');
      fetchDetails();
    } else {
      showToast('Failed to update tenant status.', 'error');
    }
  };

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
      // 5. Use the dedicated upload screen we talked about!
      onPress: () => {
        setShowMenu(false);
        router.push({
          pathname: '/tenants/upload-agreement',
          params: {
            agreementId: agreement.id,
            tenantId: tenant.id,
            tenantName: tenant.name
          }
        });
      },
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
      <CustomToast visible={toast.visible} message={toast.message} type={toast.type} onHide={() => setToast({ ...toast, visible: false })} />

      <View className="flex-row justify-between items-center px-4 pt-12 pb-4 border-b border-border shadow-sm z-10 bg-white">
        <View className="flex-row items-center">
          <TouchableOpacity onPress={() => router.back()} className="p-2 mr-1 -ml-2">
            <Ionicons name="chevron-back" size={24} color="#000" />
          </TouchableOpacity>
          <View>
            <Text className="text-xl font-bold text-foreground">{tenant.name}</Text>
            <Text className="text-xs text-muted-foreground">Unit {agreement.unit_number}</Text>
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
        <ActionsRow tenant={tenant} agreement={agreement}/>

        {/* SECTION: TENANT DETAILS */}
        <DisplayPersonalInfoOfTenant tenant={tenant} />

        {/* SECTION: AGREEMENT DETAILS */}
        <DisplayAgreementDetailsOfTenant tenant={tenant} agreement={agreement} />

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