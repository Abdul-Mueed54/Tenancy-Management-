import { useState } from 'react';
import { Platform } from 'react-native';
import * as Sharing from 'expo-sharing';
import * as FileSystem from 'expo-file-system/legacy';
import * as IntentLauncher from 'expo-intent-launcher';

export function useDocumentViewer(showToast: (msg: string, type: 'error' | 'success') => void) {
  const [imageToView, setImageToView] = useState<string | null>(null);
  const [showImageModal, setShowImageModal] = useState(false);

  const openDocument = async (uri: string | null) => {
    if (!uri) {
      showToast("No document is attached.", "error");
      return;
    }

    if (uri.toLowerCase().endsWith('.pdf')) {
      try {
        if (Platform.OS === 'android') {
          const contentUri = await FileSystem.getContentUriAsync(uri);
          await IntentLauncher.startActivityAsync('android.intent.action.VIEW', {
            data: contentUri,
            flags: 1,
            type: 'application/pdf',
          });
        } else {
          // iOS fallback
          const isAvailable = await Sharing.isAvailableAsync();
          if (isAvailable) {
            await Sharing.shareAsync(uri, { UTI: 'com.adobe.pdf' });
          } else {
            showToast("PDF viewer not available on this device.", "error");
          }
        }
      } catch (error) {
        showToast("Could not open the PDF. No viewer installed.", "error");
      }
    } else {
      // Treat as image
      setImageToView(uri);
      setShowImageModal(true);
    }
  };

  const closeViewer = () => {
    setShowImageModal(false);
    setImageToView(null);
  };

  return {
    openDocument,
    imageToView,
    showImageModal,
    closeViewer,
  };
}