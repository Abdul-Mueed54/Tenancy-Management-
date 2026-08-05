import dayjs, { Dayjs } from "dayjs";
import { Modal, TouchableOpacity, View } from "react-native";
import DateTimePicker, { useDefaultClassNames } from "react-native-ui-datepicker";
import { Text } from "./text";

interface DatePickerModalProps {
  visible: boolean;
  date: Dayjs;
  setDate: (d: Dayjs) => void;
  onClose: () => void;
}

export const DatePickerModal = ({
  visible,
  date,
  setDate,
  onClose,
  }: DatePickerModalProps) => {
    const defaultClassNames = useDefaultClassNames();
    return (
      <Modal visible={visible} transparent={true} animationType="fade">
        <View className="flex-1 justify-center items-center bg-black/50 px-4">
          <View className="bg-white rounded-xl border-border p-4 w-full shadow-xl">
            <DateTimePicker
              mode="single"
              date={date.toDate()}
              onChange={(params) => setDate(dayjs(params.date))}
              classNames={{
                ...defaultClassNames,
                selected: "bg-primary-500 border-primary-700",
                selected_label: "text-white",
                today: "border-primary-700",
              }}
            />
            <TouchableOpacity
              onPress={onClose}
              className="mt-4 bg-primary-700 p-3 rounded-lg items-center"
            >
              <Text className="text-white font-bold">Confirm</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    );
  };