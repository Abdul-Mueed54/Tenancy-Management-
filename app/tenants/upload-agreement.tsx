import { View, Text, TouchableOpacity, ScrollView, ActivityIndicator } from 'react-native';
import { useLocalSearchParams, router, Stack } from 'expo-router';
import { useState } from 'react';
import { Ionicons } from '@expo/vector-icons';
import * as DocumentPicker from 'expo-document-picker';
import dayjs from 'dayjs';

import { uploadAgreementDetails } from '@/db/queries/agreements.queries';
import { CustomToast } from '@/components/ui/toast';
import { DatePickerModal } from '@/components/ui/date-picker';

export default function UploadAgreementScreen() {
  const { agreementId, tenantId, tenantName } = useLocalSearchParams<{ agreementId: string; tenantId: string; tenantName: string }>();

  const [fileUri, setFileUri] = useState<string | null>(null);
  const [fileName, setFileName] = useState<string | null>(null);

  // Using dayjs to match your new component
  const [startDate, setStartDate] = useState(dayjs());
  const [showDatePicker, setShowDatePicker] = useState(false);

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [toast, setToast] = useState({ visible: false, message: '', type: 'success' as 'success' | 'error' });

  const showToast = (message: string, type: 'success' | 'error') => {
    setToast({ visible: true, message, type });
  };

  const handlePickDocument = async () => {
    try {
      const result = await DocumentPicker.getDocumentAsync({
        type: ['application/pdf', 'image/*'],
        copyToCacheDirectory: true,
      });

      if (!result.canceled && result.assets.length > 0) {
        setFileUri(result.assets[0].uri);
        setFileName(result.assets[0].name);
      }
    } catch (error) {
      showToast("An error occurred while picking the document.", "error");
    }
  };

  const handleSave = async () => {
    if (!fileUri) {
      showToast("Please attach an agreement document first.", "error");
      return;
    }

    setIsSubmitting(true);
    const formattedDate = startDate.format('YYYY-MM-DD');
    const result = await uploadAgreementDetails(agreementId, tenantId, fileUri, formattedDate);
    setIsSubmitting(false);

    if (result.success) {
      router.back();
    } else {
      showToast("Failed to save the agreement.", "error");
    }
  };

  return (
    <View className="flex-1 ">
      <Stack.Screen options={{ headerShown: false }} />
      <CustomToast visible={toast.visible} message={toast.message} type={toast.type} onHide={() => setToast({ ...toast, visible: false })} />
      <View className="flex-row items-center px-4 pt-12 pb-4 border-b border-border shadow-sm">
        <TouchableOpacity onPress={() => router.back()} className="p-2 mr-1 -ml-2">
          <Ionicons name="chevron-back" size={24} color="#000" />
        </TouchableOpacity>
        <View>
          <Text className="text-xl font-bold text-foreground">Upload Agreement</Text>
          <Text className="text-xs text-muted-foreground">{tenantName}</Text>
        </View>
      </View>

      <ScrollView showsVerticalScrollIndicator={false} className="flex-1 bg-muted/10 p-4">
       <Text className="text-xs text-red-500 mb-2">NOTE: If you have already uploaded the agreement, uploading it again will override the previous.</Text>
        {/* DOCUMENT UPLOAD SECTION */}
        <View className="rounded-2xl p-5 mb-6 shadow-sm border border-border mt-2">
          <Text className="text-sm font-bold text-foreground mb-1">Contract Document</Text>
          <Text className="text-xs text-muted-foreground mb-4">Attach the signed PDF or scanned images of the lease.</Text>

          <TouchableOpacity
            onPress={handlePickDocument}
            className={`border border-dashed rounded-xl p-8 items-center justify-center ${fileUri ? 'border-teal-500 bg-teal-50' : 'border-border bg-muted/20'}`}
          >
            <Ionicons name={fileUri ? "document-text" : "cloud-upload-outline"} size={32} color={fileUri ? "#0f766e" : "#a1a1aa"} />
            <Text className={`mt-2 font-medium text-center ${fileUri ? 'text-teal-700' : 'text-muted-foreground'}`}>
              {fileName || "Tap to select document"}
            </Text>
          </TouchableOpacity>
        </View>

        {/* DATE SELECTION SECTION */}
        <View className="rounded-2xl p-5 mb-6 shadow-sm border border-border">
          <Text className="text-sm font-bold text-foreground mb-1">Official Start Date</Text>
          <Text className="text-xs text-muted-foreground mb-4">The exact date the legal contract goes into effect.</Text>

          <TouchableOpacity
            onPress={() => setShowDatePicker(true)}
            className="flex-row justify-between items-center bg-muted/10 border border-border rounded-xl p-4"
          >
            <View className="flex-row items-center">
              <Ionicons name="calendar-outline" size={20} color="#0f766e" className="mr-3" />
              <Text className="text-foreground font-medium ml-2">{startDate.format('MMMM D, YYYY')}</Text>
            </View>
            <Ionicons name="pencil" size={16} color="#a1a1aa" />
          </TouchableOpacity>
        </View>

        <Text className="text-xs text-muted-foreground mb-4">The Expiry Date (11 Months from the start date) of this agreement will be calculated automatically, also the app will notify you 20 days before the actual expiry.</Text>

        <TouchableOpacity
          onPress={handleSave}
          disabled={isSubmitting}
          className={`rounded-xl p-4 items-center mb-10 ${isSubmitting ? 'bg-primary-700/70' : 'bg-primary-700'}`}
        >
          {isSubmitting ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <Text className="text-white font-bold text-base">Save Agreement</Text>
          )}
        </TouchableOpacity>
      </ScrollView>

      <DatePickerModal
        visible={showDatePicker}
        date={startDate}
        setDate={setStartDate}
        onClose={() => setShowDatePicker(false)}
      />
    </View>
  );
}