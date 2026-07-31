import dayjs, { Dayjs } from "dayjs";
import * as ImagePicker from "expo-image-picker";
import { router, useLocalSearchParams, Stack } from "expo-router";
import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { View, Keyboard, Alert, Text, TouchableOpacity, Modal } from "react-native";
import { KeyboardAwareScrollView } from "react-native-keyboard-controller";
import DateTimePicker, { useDefaultClassNames } from "react-native-ui-datepicker";
import { Ionicons } from "@expo/vector-icons";
import { getBuildings, registerNewTenant } from "@/db/queries";
import  TenantFormData  from "../types/types";
import { TenantDetailsSection } from "@/components/tenants-form/tenants-details-section";
import { IdentificationSection } from "@/components/tenants-form/identification-details-section";
import { FinancialsSection } from "@/components/tenants-form/financials-details-section";


export default function AddTenantScreen() {
  const { buildingName: presetBuildingName } = useLocalSearchParams<{ buildingName?: string }>();

  // Dates & Images
  const [cnicImage, setCnicImage] = useState<string | null>(null);
  const [cnicIssueDate, setCnicIssueDate] = useState(dayjs());
  const [cnicExpiryDate, setCnicExpiryDate] = useState(dayjs().add(10, "year"));
  const [moveInDate, setMoveInDate] = useState(dayjs());

  // Modals
  const [showIssuePicker, setShowIssuePicker] = useState(false);
  const [showExpiryPicker, setShowExpiryPicker] = useState(false);
  const [showMoveInPicker, setShowMoveInPicker] = useState(false);

  // Buildings data
  const [buildingsList, setBuildingsList] = useState<{ name: string }[]>([]);
  const buildingOptions = buildingsList.map((b) => ({ label: b.name, value: b.name }));

  const { control, handleSubmit, formState: { errors }, getValues } = useForm<TenantFormData>({
    // mode: "onChange",
    defaultValues: {
      fullName: "",
      contactNumber: "",
      presentAddress: "",
      cnicNumber: "",
      buildingName: presetBuildingName || "",
      unitNumber: "",
      advanceAmount: "",
      monthlyRent: "",
      firstMonthRentCollected: "",
      rentDueDay: "",
    },
  });

  useEffect(() => {
    const fetchBuildings = async () => {
      const result = await getBuildings();
      if (result.success) setBuildingsList(result.data);
    };
    fetchBuildings();
  }, []);

  const pickImage = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      quality: 1,
    });
    if (!result.canceled) setCnicImage(result.assets[0].uri);
  };

  const onSubmit = async (data: TenantFormData) => {
    Keyboard.dismiss();

    const payload = {
      fullName: data.fullName,
      contactNumber: data.contactNumber,
      presentAddress: data.presentAddress,
      cnicNumber: data.cnicNumber,
      cnicExpiryDate: cnicExpiryDate.format("YYYY-MM-DD"),
      cnic_uri: cnicImage,
      buildingName: data.buildingName,
      advanceAmount: parseInt(data.advanceAmount) || 0,
      monthlyRent: parseInt(data.monthlyRent) || 0,
      firstMonthRentCollected: parseInt(data.firstMonthRentCollected) || 0,
      moveInDate: moveInDate.format("YYYY-MM-DD"),
      rentDueDay: parseInt(data.rentDueDay), // Pass the new data down
    };

    const result = await registerNewTenant(payload);

    if (result.success) {
      router.back();
    } else {
      Alert.alert("Error", "Could not register tenant. Ensure CNIC is unique.");
    }
  };

  const DatePickerModal = ({ visible, date, setDate, onClose }: { visible: boolean, date: Dayjs, setDate: (d: Dayjs) => void, onClose: () => void }) => {
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
            <TouchableOpacity onPress={onClose} className="mt-4 bg-primary-700 p-3 rounded-lg items-center">
              <Text className="text-white font-bold">Confirm</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    );
  };

  return (
    <View className="flex-1 bg-white">
      <Stack.Screen options={{ headerShown: false }} />

      <View className="flex-row items-center px-4 pt-12 pb-4 border-b border-border bg-white z-10 shadow-sm">
        <TouchableOpacity onPress={() => router.back()} className="p-2 mr-2">
          <Text className="text-foreground text-xl font-bold"><Ionicons name="chevron-back" size={24}/></Text>
        </TouchableOpacity>
        <Text className="text-xl font-bold text-foreground">Register new tenant</Text>
      </View>

      <KeyboardAwareScrollView
        bottomOffset={80}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ flexGrow: 1, padding: 16, paddingBottom: 40 }}
        keyboardShouldPersistTaps="handled"
      >

        {/* COMPONENT 1 */}
        <TenantDetailsSection control={control} errors={errors} />

        {/* COMPONENT 2 */}
        <IdentificationSection
          control={control}
          errors={errors}
          cnicIssueDate={cnicIssueDate}
          cnicExpiryDate={cnicExpiryDate}
          setShowIssuePicker={setShowIssuePicker}
          setShowExpiryPicker={setShowExpiryPicker}
          pickImage={pickImage}
          cnicImage={cnicImage}
        />

        {/* COMPONENT 3 */}
        <FinancialsSection
          control={control}
          errors={errors}
          getValues={getValues}
          buildingOptions={buildingOptions}
          presetBuildingName={presetBuildingName}
          moveInDate={moveInDate}
          setShowMoveInPicker={setShowMoveInPicker}
        />

        <View className="mt-auto pt-4">
          <TouchableOpacity onPress={handleSubmit(onSubmit)} className="bg-primary-700 p-4 rounded-xl items-center shadow-sm">
            <Text className="text-white font-bold text-lg">Save tenant</Text>
          </TouchableOpacity>
        </View>
      </KeyboardAwareScrollView>

      {/* MODALS */}
      <DatePickerModal visible={showIssuePicker} date={cnicIssueDate} setDate={setCnicIssueDate} onClose={() => setShowIssuePicker(false)} />
      <DatePickerModal visible={showExpiryPicker} date={cnicExpiryDate} setDate={setCnicExpiryDate} onClose={() => setShowExpiryPicker(false)} />
      <DatePickerModal visible={showMoveInPicker} date={moveInDate} setDate={setMoveInDate} onClose={() => setShowMoveInPicker(false)} />
    </View>
  );
}