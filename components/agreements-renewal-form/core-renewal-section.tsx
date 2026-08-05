import { View, Text, TextInput, TouchableOpacity } from 'react-native';
import { Controller, Control, FieldErrors } from 'react-hook-form';
import { Ionicons } from '@expo/vector-icons';
import dayjs, { Dayjs } from 'dayjs';

type FormData = {
  newMonthlyRent: string;
  buildingId: string;
  unitNumber: string;
  advanceAmount: string;
  rentDueDay: string;
};

interface CoreRenewalSectionProps {
  control: Control<FormData>;
  errors: FieldErrors<FormData>;
  renewalDate: Dayjs;
  setShowRenewalPicker: (show: boolean) => void;
  fileUri: string | null;
  fileName: string | null;
  handlePickDocument: () => void;
}

export const CoreRenewalSection = ({
  control,
  errors,
  renewalDate,
  setShowRenewalPicker,
  fileUri,
  fileName,
  handlePickDocument
}: CoreRenewalSectionProps) => {
  return (
    <View className="bg-white rounded-2xl p-5 mb-6 shadow-sm border border-border">
      <Text className="text-sm font-bold text-foreground mb-4">Renewal Details</Text>

      <View className="flex-row justify-between">
        {/* NEW MONTHLY RENT */}
        <View className="flex-1 mr-2">
          <Text className="text-xs font-bold text-muted-foreground mb-1 ml-1">
            New Monthly Rent <Text className="text-red-500">*</Text>
          </Text>
          <Controller
            control={control}
            name="newMonthlyRent"
            rules={{
              required: "Rent is required",
              pattern: { value: /^[0-9]+$/, message: "Positive numbers only" }
            }}
            render={({ field: { onChange, value } }) => (
              <View>
                <View className={`flex-row items-center bg-muted/20 border rounded-xl px-2 py-1 ${errors.newMonthlyRent ? 'border-red-500' : 'border-border'}`}>
                  <TextInput
                    className="text-foreground py-2 flex-1"
                    keyboardType="numeric"
                    placeholder="e.g. 25000"
                    value={value}
                    onChangeText={onChange}
                  />
                </View>
                {errors.newMonthlyRent && <Text className="text-red-500 text-xs mt-1 ml-1">{errors.newMonthlyRent.message}</Text>}
              </View>
            )}
          />
        </View>

        {/* RENEWAL START DATE */}
        <View className="flex-1 ml-2">
          <Text className="text-xs font-bold text-muted-foreground mb-1 ml-1">
            Renewal Start Date <Text className="text-red-500">*</Text>
          </Text>
          {/* Removed the broken Controller here. It always has a value via dayjs()! */}
          <TouchableOpacity
            onPress={() => setShowRenewalPicker(true)}
            className="flex-row items-center justify-between bg-muted/20 border border-border rounded-xl px-4 py-3"
          >
            <Text className="text-foreground">{renewalDate.format('MMM D, YYYY')}</Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* DOCUMENT UPLOAD */}
      <Text className="text-xs font-bold text-muted-foreground mb-1 ml-1 mt-5">
        New Rental Agreement <Text className="text-red-500">*</Text>
      </Text>
      <View className="bg-white rounded-xl p-4 mt-1 border border-border">
        <Text className="text-xs text-muted-foreground mb-3">Attach the newly signed lease.</Text>
        <TouchableOpacity
          onPress={handlePickDocument}
          className={`border border-dashed rounded-xl p-4 items-center justify-center ${fileUri ? 'border-teal-500 bg-teal-50' : 'border-border bg-muted/10'}`}
        >
          <Ionicons name={fileUri ? "document-text" : "cloud-upload-outline"} size={24} color={fileUri ? "#0f766e" : "#a1a1aa"} />
          <Text className={`mt-2 font-medium text-center text-xs ${fileUri ? 'text-teal-700' : 'text-muted-foreground'}`}>
            {fileName || "Tap to select document"}
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};