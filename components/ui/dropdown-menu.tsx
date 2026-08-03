import { View, Text, TouchableOpacity, Modal } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

export type DropdownMenuItem = {
  label: string;
  icon: keyof typeof Ionicons.glyphMap;
  onPress: () => void;
  isDestructive?: boolean;
};

type CustomDropdownMenuProps = {
  visible: boolean;
  onOpenChange: (visible: boolean) => void;
  items: DropdownMenuItem[];
};

export function CustomDropdownMenu({ visible, onOpenChange, items }: CustomDropdownMenuProps) {
  return (
    <Modal
      visible={visible}
      transparent={true}
      animationType="fade"
      onRequestClose={() => onOpenChange(false)}
    >
      {/* Invisible backdrop to catch outside taps */}
      <TouchableOpacity
        style={{ flex: 1 }}
        activeOpacity={1}
        onPress={() => onOpenChange(false)}
      >
        {/* Dropdown Container */}
        <View className="absolute top-20 right-4 w-52 bg-white rounded-xl shadow-lg border border-border overflow-hidden">

          {items.map((item, index) => {
            const isLast = index === items.length - 1;

            return (
              <TouchableOpacity
                key={item.label}
                className={`flex-row items-center p-4 ${!isLast ? 'border-b border-border/50' : ''}`}
                onPress={() => {
                  onOpenChange(false); // Automatically close menu on click
                  item.onPress();      // Execute the passed function
                }}
              >
                <Ionicons
                  name={item.icon}
                  size={18}
                  color={item.isDestructive ? "#dc2626" : "#0f766e"}
                  className="mr-3"
                />
                <Text className={`font-medium ml-2 ${item.isDestructive ? 'text-red-600' : 'text-foreground'}`}>
                  {item.label}
                </Text>
              </TouchableOpacity>
            );
          })}

        </View>
      </TouchableOpacity>
    </Modal>
  );
}