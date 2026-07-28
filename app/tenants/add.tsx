import dayjs from "dayjs";
import * as ImagePicker from "expo-image-picker";
import { router } from "expo-router";
import { useState } from "react";
import { Controller, useForm } from "react-hook-form";
import { Image, KeyboardAvoidingView, Modal, Platform, ScrollView, Text, TextInput, TouchableOpacity, View, } from "react-native";
import DateTimePicker from "react-native-ui-datepicker";

type TenantFormData = {
  fullName: string;
  contactNumber: string;
  presentAddress: string;
  cnicNumber: string;
  buildingName: string;
  unitNumber: string;
  advanceAmount: string;
  monthlyRent: string;
  rentDueDay: string;
};

export default function AddTenantScreen() {
  const [cnicImage, setCnicImage] = useState<string | null>(null);

  // Date states managed outside react-hook-form for UI simplicity
  const [cnicIssueDate, setCnicIssueDate] = useState(dayjs());
  const [cnicExpiryDate, setCnicExpiryDate] = useState(dayjs().add(10, "year"));
  const [moveInDate, setMoveInDate] = useState(dayjs());

  // Modal visibility states
  const [showIssuePicker, setShowIssuePicker] = useState(false);
  const [showExpiryPicker, setShowExpiryPicker] = useState(false);
  const [showMoveInPicker, setShowMoveInPicker] = useState(false);

  const { control, handleSubmit, formState: { errors }, } = useForm<TenantFormData>({
    defaultValues: {
      fullName: "",
      contactNumber: "",
      presentAddress: "",
      cnicNumber: "",
      buildingName: "",
      unitNumber: "",
      advanceAmount: "",
      monthlyRent: "",
      rentDueDay: "",
    },
  });

  const pickImage = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [16, 9],
      quality: 0.8,
    });

    if (!result.canceled) {
      setCnicImage(result.assets[0].uri);
    }
  };

  const onSubmit = (data: TenantFormData) => {
    const fullData = {
      ...data,
      cnic_uri: cnicImage,
      cnicIssueDate: cnicIssueDate.format("YYYY-MM-DD"),
      cnicExpiryDate: cnicExpiryDate.format("YYYY-MM-DD"),
      moveInDate: moveInDate.format("YYYY-MM-DD"),
    };
    console.log("Full Registration Data Ready: ", fullData);
  };

  // Reusable Date Picker Modal Component
  const DatePickerModal = ({ visible, date, setDate, onClose }) => (
    <Modal visible={visible} transparent={true} animationType="fade">
      <View className="flex-1 justify-center items-center bg-black/50 px-4">
        <View className="bg-white rounded-xl p-4 w-full">
          <DateTimePicker
            mode="single"
            date={date.toDate()}
            onChange={(params) => setDate(dayjs(params.date))}
            selectedItemColor="#0f766e" // Teal-700
          />
          <TouchableOpacity
            onPress={onClose}
            className="mt-4 bg-teal-700 p-3 rounded-lg items-center"
          >
            <Text className="text-white font-bold">Confirm</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      className="flex-1 bg-background"
    >
      <View className="flex-row items-center px-4 pt-12 pb-4 border-b border-border bg-white z-10">
        <TouchableOpacity onPress={() => router.back()} className="p-2 mr-2">
          <Text className="text-foreground text-xl font-bold">{"<"}</Text>
        </TouchableOpacity>
        <Text className="text-xl font-bold text-foreground">
          Register new tenant
        </Text>
      </View>

      <ScrollView
        className="flex-1 px-4 pt-4 bg-white"
        showsVerticalScrollIndicator={false}
      >
        {/* --- SECTION 1: TENANT DETAILS --- */}
        <View className="mb-8">
          <Text className="text-xs font-bold text-muted-foreground mb-4 uppercase tracking-wider">
            Tenant Details
          </Text>
          <View className="mb-4">
            <Text className="text-sm mb-1 text-foreground font-medium">
              Full name
            </Text>
            <Controller
              control={control}
              name="fullName"
              rules={{ required: "Required" }}
              render={({ field: { onChange, onBlur, value } }) => (
                <TextInput
                  className={`border rounded-lg p-3 text-foreground ${errors.fullName ? "border-red-500" : "border-border"}`}
                  placeholder="e.g. Ali Raza"
                  onBlur={onBlur}
                  onChangeText={onChange}
                  value={value}
                />
              )}
            />
          </View>

          <View className="mb-4">
            <Text className="text-sm mb-1 text-foreground font-medium">
              Contact number
            </Text>
            <Controller
              control={control}
              name="contactNumber"
              rules={{ required: "Required" }}
              render={({ field: { onChange, onBlur, value } }) => (
                <TextInput
                  className={`border rounded-lg p-3 text-foreground ${errors.contactNumber ? "border-red-500" : "border-border"}`}
                  placeholder="03XX-XXXXXXX"
                  keyboardType="phone-pad"
                  onBlur={onBlur}
                  onChangeText={onChange}
                  value={value}
                />
              )}
            />
          </View>

          <View className="mb-4">
            <Text className="text-sm mb-1 text-foreground font-medium">
              Present address
            </Text>
            <Controller
              control={control}
              name="presentAddress"
              render={({ field: { onChange, onBlur, value } }) => (
                <TextInput
                  className="border border-border rounded-lg p-3 text-foreground"
                  placeholder="Street, area, city"
                  onBlur={onBlur}
                  onChangeText={onChange}
                  value={value}
                />
              )}
            />
          </View>
        </View>

        {/* --- SECTION 2: IDENTIFICATION --- */}
        <View className="mb-8">
          <Text className="text-xs font-bold text-muted-foreground mb-4 uppercase tracking-wider">
            Identification
          </Text>

          <View className="mb-4">
            <Text className="text-sm mb-1 text-foreground font-medium">
              CNIC number
            </Text>
            <Controller
              control={control}
              name="cnicNumber"
              rules={{ required: "Required" }}
              render={({ field: { onChange, onBlur, value } }) => (
                <TextInput
                  className={`border rounded-lg p-3 text-foreground ${errors.cnicNumber ? "border-red-500" : "border-border"}`}
                  placeholder="XXXXX-XXXXXXX-X"
                  keyboardType="number-pad"
                  onBlur={onBlur}
                  onChangeText={onChange}
                  value={value}
                />
              )}
            />
          </View>

          <View className="flex-row justify-between mb-4">
            <View className="flex-1 mr-2">
              <Text className="text-sm mb-1 text-foreground font-medium">
                CNIC issue date
              </Text>
              <TouchableOpacity
                onPress={() => setShowIssuePicker(true)}
                className="border border-border rounded-lg p-3"
              >
                <Text className="text-foreground">
                  {cnicIssueDate.format("DD MMM YYYY")}
                </Text>
              </TouchableOpacity>
            </View>
            <View className="flex-1 ml-2">
              <Text className="text-sm mb-1 text-foreground font-medium">
                CNIC expiry date
              </Text>
              <TouchableOpacity
                onPress={() => setShowExpiryPicker(true)}
                className="border border-border rounded-lg p-3"
              >
                <Text className="text-foreground">
                  {cnicExpiryDate.format("DD MMM YYYY")}
                </Text>
              </TouchableOpacity>
            </View>
          </View>
          <View className="flex-row justify-between mb-4">
            <View className="flex-1 mr-2">
              <TouchableOpacity
                onPress={pickImage}
                className="border border-dashed border-border rounded-lg p-6 items-center justify-center mt-2 bg-muted/10"
              >
                {cnicImage ? (
                  <Image
                    source={{ uri: cnicImage }}
                    className="w-full h-40 rounded-md"
                    resizeMode="cover"
                  />
                ) : (
                  <Text className="text-muted-foreground text-center font-medium">
                    📷 Capture or upload CNIC photo
                  </Text>
                )}
              </TouchableOpacity>
            </View>
            {/* <View className="flex-1 ml-2">
              <TouchableOpacity
                onPress={pickImage}
                className="border border-dashed border-border rounded-lg p-6 items-center justify-center mt-2 bg-muted/10"
              >
                {cnicImage ? (
                  <Image
                    source={{ uri: cnicImage }}
                    className="w-full h-40 rounded-md"
                    resizeMode="cover"
                  />
                ) : (
                  <Text className="text-muted-foreground text-center font-medium">
                    📷 Capture or upload CNIC photo
                  </Text>
                )}
              </TouchableOpacity>
            </View> */}
          </View>
        </View>

        {/* --- SECTION 3: INITIAL MOVE-IN DETAILS --- */}
        <View className="mb-12">
          <Text className="text-xs font-bold text-muted-foreground mb-4 uppercase tracking-wider">
            Move-In Details
          </Text>

          <View className="flex-row justify-between mb-4">
            <View className="flex-1 mr-2">
              <Text className="text-sm mb-1 text-foreground font-medium">
                Building
              </Text>
              <Controller
                control={control}
                name="buildingName"
                rules={{ required: "Required" }}
                render={({ field: { onChange, onBlur, value } }) => (
                  <TextInput
                    className="border border-border rounded-lg p-3 text-foreground"
                    placeholder="e.g. Al-Noor Heights"
                    onBlur={onBlur}
                    onChangeText={onChange}
                    value={value}
                  />
                )}
              />
            </View>
            <View className="flex-1 ml-2">
              <Text className="text-sm mb-1 text-foreground font-medium">
                Unit / Floor
              </Text>
              <Controller
                control={control}
                name="unitNumber"
                rules={{ required: "Required" }}
                render={({ field: { onChange, onBlur, value } }) => (
                  <TextInput
                    className="border border-border rounded-lg p-3 text-foreground"
                    placeholder="e.g. Flat 3B"
                    onBlur={onBlur}
                    onChangeText={onChange}
                    value={value}
                  />
                )}
              />
            </View>
          </View>

          <View className="flex-row justify-between mb-4">
            <View className="flex-1 mr-2">
              <Text className="text-sm mb-1 text-foreground font-medium">
                Advance amount
              </Text>
              <Controller
                control={control}
                name="advanceAmount"
                rules={{ required: "Required" }}
                render={({ field: { onChange, onBlur, value } }) => (
                  <View className="flex-row items-center border border-border rounded-lg px-3">
                    <Text className="text-muted-foreground mr-2">Rs</Text>
                    <TextInput
                      className="flex-1 py-3 text-foreground"
                      placeholder="0"
                      keyboardType="numeric"
                      onBlur={onBlur}
                      onChangeText={onChange}
                      value={value}
                    />
                  </View>
                )}
              />
            </View>
            <View className="flex-1 ml-2">
              <Text className="text-sm mb-1 text-foreground font-medium">
                Monthly rent
              </Text>
              <Controller
                control={control}
                name="monthlyRent"
                rules={{ required: "Required" }}
                render={({ field: { onChange, onBlur, value } }) => (
                  <View className="flex-row items-center border border-border rounded-lg px-3">
                    <Text className="text-muted-foreground mr-2">Rs</Text>
                    <TextInput
                      className="flex-1 py-3 text-foreground"
                      placeholder="0"
                      keyboardType="numeric"
                      onBlur={onBlur}
                      onChangeText={onChange}
                      value={value}
                    />
                  </View>
                )}
              />
            </View>
          </View>

          <View className="flex-row justify-between mb-4">
            <View className="flex-1 mr-2">
              <Text className="text-sm mb-1 text-foreground font-medium">
                Move-in date
              </Text>
              <TouchableOpacity
                onPress={() => setShowMoveInPicker(true)}
                className="border border-border rounded-lg p-3"
              >
                <Text className="text-foreground">
                  {moveInDate.format("DD MMM YYYY")}
                </Text>
              </TouchableOpacity>
            </View>
            <View className="flex-1 ml-2">
              <Text className="text-sm mb-1 text-foreground font-medium">
                Rent due day (1-31)
              </Text>
              <Controller
                control={control}
                name="rentDueDay"
                rules={{ required: "Required" }}
                render={({ field: { onChange, onBlur, value } }) => (
                  <TextInput
                    className="border border-border rounded-lg p-3 text-foreground"
                    placeholder="e.g. 5"
                    keyboardType="numeric"
                    maxLength={2}
                    onBlur={onBlur}
                    onChangeText={onChange}
                    value={value}
                  />
                )}
              />
            </View>
          </View>
        </View>

        <View className="h-28" />
      </ScrollView>

      {/* MODALS */}
      <DatePickerModal
        visible={showIssuePicker}
        date={cnicIssueDate}
        setDate={setCnicIssueDate}
        onClose={() => setShowIssuePicker(false)}
      />
      <DatePickerModal
        visible={showExpiryPicker}
        date={cnicExpiryDate}
        setDate={setCnicExpiryDate}
        onClose={() => setShowExpiryPicker(false)}
      />
      <DatePickerModal
        visible={showMoveInPicker}
        date={moveInDate}
        setDate={setMoveInDate}
        onClose={() => setShowMoveInPicker(false)}
      />

      <View className="absolute bottom-0 left-0 right-0 p-4 bg-white border-t border-border shadow-lg">
        <TouchableOpacity
          onPress={handleSubmit(onSubmit)}
          className="bg-teal-700 p-4 rounded-xl items-center"
        >
          <Text className="text-white font-bold text-lg">Save tenant</Text>
        </TouchableOpacity>
      </View>
    </KeyboardAvoidingView>
  );
}
