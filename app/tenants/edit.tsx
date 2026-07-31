import dayjs, { Dayjs } from "dayjs";
import * as ImagePicker from "expo-image-picker";
import { router, useLocalSearchParams, Stack } from "expo-router";
import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { View, Keyboard, Alert, Text, TouchableOpacity, Modal, ActivityIndicator } from "react-native";
import { KeyboardAwareScrollView } from "react-native-keyboard-controller";
import DateTimePicker, { useDefaultClassNames } from "react-native-ui-datepicker";
import { Ionicons } from "@expo/vector-icons";
import { getBuildings, getFullTenantDetails, updateExistingTenant } from "@/db/queries";
import TenantFormData from "../types/types";

// Reusing your components!
import { TenantDetailsSection } from "@/components/tenants-form/tenants-details-section";
import { IdentificationSection } from "@/components/tenants-form/identification-details-section";
import { FinancialsSection } from "@/components/tenants-form/financials-details-section";

export default function EditTenantScreen() {
  const { cnic } = useLocalSearchParams<{ cnic: string }>();

  const [isLoading, setIsLoading] = useState(true);
  const [cnicImage, setCnicImage] = useState<string | null>(null);
  const [cnicIssueDate, setCnicIssueDate] = useState(dayjs());
  const [cnicExpiryDate, setCnicExpiryDate] = useState(dayjs().add(10, "year"));
  const [moveInDate, setMoveInDate] = useState(dayjs());

  const [showIssuePicker, setShowIssuePicker] = useState(false);
  const [showExpiryPicker, setShowExpiryPicker] = useState(false);
  const [showMoveInPicker, setShowMoveInPicker] = useState(false);

  const [buildingsList, setBuildingsList] = useState<{ name: string }[]>([]);
  const buildingOptions = buildingsList.map((b) => ({ label: b.name, value: b.name }));

  const { control, handleSubmit, formState: { errors }, getValues, reset } = useForm<TenantFormData>();

  useEffect(() => {
    const initializeData = async () => {
      setIsLoading(true);

      // 1. Fetch Buildings for the dropdown
      const buildRes = await getBuildings();
      if (buildRes.success) setBuildingsList(buildRes.data);

      // 2. Fetch the Tenant's current data
      if (cnic) {
        const tenantRes = await getFullTenantDetails(cnic);
        if (tenantRes.success && tenantRes.data) {
          const { tenant, agreement } = tenantRes.data;

          reset({
            fullName: tenant.name,
            contactNumber: tenant.contact_no,
            presentAddress: tenant.permanent_address || "",
            cnicNumber: tenant.cnic_number,
            buildingName: agreement.building_name,
            unitNumber: agreement.unit_number,
            advanceAmount: agreement.advance_amount.toString(),
            monthlyRent: agreement.monthly_rent.toString(),
            rentDueDay: agreement.rent_due_day.toString(),
          });

          if (tenant.cnic_uri) setCnicImage(tenant.cnic_uri);
          if (tenant.cnic_expiry_date) setCnicExpiryDate(dayjs(tenant.cnic_expiry_date));
          if (agreement.start_date) setMoveInDate(dayjs(agreement.start_date));
        }
      }
      setIsLoading(false);
    };

    initializeData();
  }, [cnic, reset]);

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
      cnicExpiryDate: cnicExpiryDate.format("YYYY-MM-DD"),
      cnic_uri: cnicImage,
      buildingName: data.buildingName,
      unitNumber: data.unitNumber,
      advanceAmount: parseInt(data.advanceAmount) || 0,
      monthlyRent: parseInt(data.monthlyRent) || 0,
      rentDueDay: parseInt(data.rentDueDay),
    };

    const result = await updateExistingTenant(cnic, payload);

    if (result.success) {
      router.back();
    } else {
      Alert.alert("Error", "Could not update tenant details.");
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

  if (isLoading) {
    return (
      <View className="flex-1 justify-center items-center bg-white">
        <ActivityIndicator size="large" color="#0f766e" />
      </View>
    );
  }

  return (
    <View className="flex-1 bg-white">
      <Stack.Screen options={{ headerShown: false }} />

      <View className="flex-row items-center px-4 pt-12 pb-4 border-b border-border bg-white z-10 shadow-sm">
        <TouchableOpacity onPress={() => router.back()} className="p-2 mr-2">
          <Ionicons name="chevron-back" size={24} />
        </TouchableOpacity>
        <Text className="text-xl font-bold text-foreground">Edit Tenant</Text>
      </View>

      <KeyboardAwareScrollView
        bottomOffset={80}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ flexGrow: 1, padding: 16, paddingBottom: 40 }}
        keyboardShouldPersistTaps="handled"
      >
        <TenantDetailsSection control={control} errors={errors} />

        {/* We disable the CNIC field inside the IdentificationSection so they can't change the primary key */}
        <IdentificationSection
          control={control}
          errors={errors}
          // cnic={}
          cnicIssueDate={cnicIssueDate}
          cnicExpiryDate={cnicExpiryDate}
          setShowIssuePicker={setShowIssuePicker}
          setShowExpiryPicker={setShowExpiryPicker}
          pickImage={pickImage}
          cnicImage={cnicImage}
        />

        <FinancialsSection
          control={control}
          errors={errors}
          getValues={getValues}
          buildingOptions={buildingOptions}
          moveInDate={moveInDate}
          setShowMoveInPicker={setShowMoveInPicker}
          isEdit={true} 
        />

        <View className="mt-auto pt-4">
          <TouchableOpacity onPress={handleSubmit(onSubmit)} className="bg-primary-700 p-4 rounded-xl items-center shadow-sm">
            <Text className="text-white font-bold text-lg">Save Changes</Text>
          </TouchableOpacity>
        </View>
      </KeyboardAwareScrollView>

      <DatePickerModal visible={showIssuePicker} date={cnicIssueDate} setDate={setCnicIssueDate} onClose={() => setShowIssuePicker(false)} />
      <DatePickerModal visible={showExpiryPicker} date={cnicExpiryDate} setDate={setCnicExpiryDate} onClose={() => setShowExpiryPicker(false)} />
      <DatePickerModal visible={showMoveInPicker} date={moveInDate} setDate={setMoveInDate} onClose={() => setShowMoveInPicker(false)} />
    </View>
  );
}