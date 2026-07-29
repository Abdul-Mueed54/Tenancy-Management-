import { View, Text, TouchableOpacity, Modal } from 'react-native';

type CustomAlertDialogProps = {
  visible: boolean;
  onOpenChange: (visible: boolean) => void;
  title: string;
  description: string;
  cancelText?: string;
  actionText?: string;
  onAction: () => void;
  isDestructive?: boolean;
};

export function CustomAlertDialog({
  visible,
  onOpenChange,
  title,
  description,
  cancelText = "Cancel",
  actionText = "Continue",
  onAction,
  isDestructive = false,
}: CustomAlertDialogProps) {
  return (
    <Modal
      visible={visible}
      transparent={true}
      animationType="fade"
      onRequestClose={() => onOpenChange(false)}
    >
      <View className="flex-1 justify-center items-center bg-black/60 px-6">
        <View className="bg-white w-full rounded-2xl p-6 shadow-xl">

          <Text className="text-xl font-bold text-foreground mb-2">{title}</Text>
          <Text className="text-muted-foreground mb-6">{description}</Text>

          <View className="flex-row justify-end space-x-4">
            <TouchableOpacity
              onPress={() => onOpenChange(false)}
              className="px-4 py-2 rounded-lg"
            >
              <Text className="text-foreground font-semibold text-base">{cancelText}</Text>
            </TouchableOpacity>

            <TouchableOpacity
              onPress={onAction}
              className={`px-4 py-2 rounded-lg ${isDestructive ? 'bg-red-600' : 'bg-teal-700'}`}
            >
              <Text className="text-white font-semibold text-base">{actionText}</Text>
            </TouchableOpacity>
          </View>

        </View>
      </View>
    </Modal>
  );
}