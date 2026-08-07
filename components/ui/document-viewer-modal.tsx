import { Modal, View, TouchableOpacity, Image } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

type Props = {
  visible: boolean;
  imageUri: string | null;
  onClose: () => void;
};

export function DocumentViewerModal({ visible, imageUri, onClose }: Props) {
  return (
    <Modal
      visible={visible}
      transparent={true}
      animationType="fade"
      onRequestClose={onClose}
    >
      <View className="flex-1 bg-black justify-center items-center">
        <TouchableOpacity
          onPress={onClose}
          className="absolute top-12 right-6 z-10 p-2 bg-black/50 rounded-full"
        >
          <Ionicons name="close" size={28} color="#fff" />
        </TouchableOpacity>

        {imageUri && (
          <Image
            source={{ uri: imageUri }}
            className="w-full h-[70%]"
            resizeMode="contain"
          />
        )}
      </View>
    </Modal>
  );
}