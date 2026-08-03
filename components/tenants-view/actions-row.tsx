
import { View, Text, TouchableOpacity, ScrollView, ActivityIndicator, Image, Modal } from 'react-native';
import { useLocalSearchParams, router, Stack } from 'expo-router';
import { useState, useCallback } from 'react';
import { useFocusEffect } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import * as Sharing from 'expo-sharing';
import { Platform } from 'react-native';
import * as FileSystem from 'expo-file-system/legacy';
import * as IntentLauncher from 'expo-intent-launcher';
import { getFullTenantDetails } from '@/db/queries/tenants.queries';



export function ActionsRow(){
  const [toast, setToast] = useState<{ visible: boolean; message: string; type: 'success' | 'error' | 'info' }>({ visible: false, message: '', type: 'success' });
  const [data, setData] = useState<any>(null);

  const [isLoading, setIsLoading] = useState(true);
  const { cnic } = useLocalSearchParams<{ cnic: string }>();
  const [imageToView, setImageToView] = useState<string | null>(null);
  const [showImageModal, setShowImageModal] = useState(false);
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
  const handleGenerateHistoryPDF = () => {
    router.push({
      pathname: '/tenants/summary',
        params: {
          cnic: tenant.cnic_number,
          agreementId: agreement.agreement_id,
          name: tenant.name
        }
      });
    };

  const openDocument = async (uri: string | null) => {
      if (!uri) {
        showToast("No document is attached.", "error");
        return;
      }

      if (uri.toLowerCase().endsWith('.pdf')) {
        try {
          // for android
          if (Platform.OS === 'android') {
            const contentUri = await FileSystem.getContentUriAsync(uri);
            await IntentLauncher.startActivityAsync('android.intent.action.VIEW', {
              data: contentUri,
              flags: 1,
              type: 'application/pdf',
            });
          } else {
            // for IOS
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
        setImageToView(uri);
        setShowImageModal(true);
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

  return(
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
            </View>
  )
}