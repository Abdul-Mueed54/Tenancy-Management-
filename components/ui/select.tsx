import { Ionicons } from "@expo/vector-icons";
import { useRef, useState } from "react";
import { FlatList, Modal, Pressable, Text, TouchableOpacity, View, useWindowDimensions, } from "react-native";

type Option = { label: string; value: string };

type CustomSelectProps = {
  value?: string;
  onValueChange: (value: string) => void;
  options: Option[];
  placeholder?: string;
  disabled?: boolean;
  error?: boolean;
};

const MAX_DROPDOWN_HEIGHT = 220;

export function CustomSelect({
  value,
  onValueChange,
  options,
  placeholder = "Select an option",
  disabled = false,
  error = false,
}: CustomSelectProps) {
  const triggerRef = useRef<View>(null);
  const [open, setOpen] = useState(false);
  const [layout, setLayout] = useState({ x: 0, y: 0, width: 0, height: 0 });
  const { height: screenHeight } = useWindowDimensions();

  const selectedLabel = options.find((o) => o.value === value)?.label;

  const openDropdown = () => {
    triggerRef.current?.measureInWindow((x, y, width, height) => {
      setLayout({ x, y, width, height });
      setOpen(true);
    });
  };

  // Flip above the trigger if there isn't enough room below
  const spaceBelow = screenHeight - (layout.y + layout.height);
  const dropdownHeight = Math.min(MAX_DROPDOWN_HEIGHT, options.length * 48);
  const openUpward = spaceBelow < dropdownHeight + 16;

  return (
    <>
      <TouchableOpacity
        ref={triggerRef}
        disabled={disabled}
        activeOpacity={0.7}
        onPress={openDropdown}
        className={`flex-row items-center justify-between border rounded-lg p-3 ${
          error ? "border-red-500" : "border-border"
        } ${disabled ? "bg-muted/20" : "bg-white"}`}
      >
        <Text numberOfLines={1} className={selectedLabel ? "text-foreground" : "text-muted-foreground"} >
          {selectedLabel ?? placeholder}
        </Text>
        {!disabled && <Text className="text-muted-foreground"> <Ionicons name="chevron-down" size={15}/></Text>}
      </TouchableOpacity>

      <Modal visible={open} transparent animationType="fade" onRequestClose={() => setOpen(false)}>
        <Pressable className="flex-1" onPress={() => setOpen(false)}>
          <View
            style={{
              position: "absolute",
              left: layout.x,
              top: openUpward ? layout.y - dropdownHeight - 4 : layout.y + layout.height + 4,
              width: layout.width,
              maxHeight: MAX_DROPDOWN_HEIGHT,
            }}
            className="bg-white rounded-lg border border-border shadow-lg overflow-hidden"
          >
            <FlatList
              data={options}
              keyExtractor={(item) => item.value}
              ItemSeparatorComponent={() => <View className="h-px bg-border" />}
              renderItem={({ item }) => {
                const selected = item.value === value;
                return (
                  <TouchableOpacity
                    onPress={() => {
                      onValueChange(item.value);
                      setOpen(false);
                    }}
                    className={`flex-row items-center justify-between px-4 py-3 ${
                      selected ? "bg-primary-50" : ""
                    }`}
                  >
                    <Text className={`text-sm ${ selected ? "text-primary-700 font-semibold" : "text-foreground"
                      }`} > {item.label} </Text>
                    {selected && <Text className="text-primary-700 "> <Ionicons name="checkmark" className="onPress:rotate-180" size={18}/></Text>}
                  </TouchableOpacity>
                );
              }}
            />
          </View>
        </Pressable>
      </Modal>
    </>
  );
}