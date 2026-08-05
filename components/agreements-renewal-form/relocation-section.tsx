import { View, Text, Switch, TextInput, TouchableOpacity } from 'react-native';
import { Controller, Control, FieldErrors } from 'react-hook-form';
import { Ionicons } from '@expo/vector-icons';
import dayjs, { Dayjs } from 'dayjs';

import { CustomSelect } from '@/components/ui/select'; 

type FormData = {
  newMonthlyRent: string;
  buildingId: string;
  unitNumber: string;
  advanceAmount: string;
  rentDueDay: string;
};

interface RelocationSectionProps {
  control: Control<FormData>;
  errors: FieldErrors<FormData>;
  isRelocating: boolean;
  setIsRelocating: (val: boolean) => void;
  newMoveInDate: Dayjs;
  setShowMoveInPicker: (show: boolean) => void;
  buildings: { id: string, name: string }[];
}

export const RelocationSection = ({
  control,
  errors,
  isRelocating,
  setIsRelocating,
  newMoveInDate,
  setShowMoveInPicker,
  buildings
}: RelocationSectionProps) => {

  // Format buildings for your CustomSelect
  const buildingOptions = buildings.map(b => ({ label: b.name, value: b.id }));

  return (
    <>
      {/* RELOCATION TOGGLE */}
      <View className="bg-white rounded-2xl p-5 mb-6 shadow-sm border border-border flex-row justify-between items-center">
        <View className="flex-1 pr-4">
          <Text className="font-bold text-foreground">Relocating?</Text>
          <Text className="text-xs text-muted-foreground mt-1">Turn this on if the tenant is moving to a different unit or building.</Text>
        </View>
        <Switch
          value={isRelocating}
          onValueChange={setIsRelocating}
          trackColor={{ false: '#e4e4e7', true: '#0f766e' }}
          thumbColor={'#ffffff'}
        />
      </View>

      {/* RELOCATION DETAILS */}
      {isRelocating && (
        <View className="bg-white rounded-2xl p-5 mb-6 shadow-sm border border-border">
          <Text className="text-sm font-bold text-foreground mb-4">New Unit Details</Text>

          {/* ROW 1: Building & Unit */}
          <View className="flex-row justify-between mb-4">

            {/* BUILDING SELECT */}
            <View className="flex-1 mr-2">
              <Text className="text-xs font-bold text-muted-foreground mb-1 ml-1">New Building</Text>
              <Controller
                control={control}
                name="buildingId"
                rules={{ required: isRelocating ? "Required" : false }}
                render={({ field: { onChange, value } }) => (
                  <View>
                    <CustomSelect
                      value={value}
                      onValueChange={onChange}
                      options={buildingOptions}
                      placeholder="Select Building"
                      error={!!errors.buildingId}
                    />
                    {errors.buildingId && <Text className="text-red-500 text-xs mt-1 ml-1">{errors.buildingId.message}</Text>}
                  </View>
                )}
              />
            </View>

            {/* UNIT INPUT */}
            <View className="flex-1 ml-2">
              <Text className="text-xs font-bold text-muted-foreground mb-1 ml-1">New Unit / Floor</Text>
              <Controller
                control={control}
                name="unitNumber"
                rules={{ required: isRelocating ? "Required" : false }}
                render={({ field: { onChange, value } }) => (
                  <View>
                    <View className={`bg-muted/20 border rounded-xl px-2 py-1 ${errors.unitNumber ? 'border-red-500' : 'border-border'}`}>
                      <TextInput className="text-foreground py-2" placeholder="e.g. 5C" value={value} onChangeText={onChange} />
                    </View>
                    {errors.unitNumber && <Text className="text-red-500 text-xs mt-1 ml-1">{errors.unitNumber.message}</Text>}
                  </View>
                )}
              />
            </View>
          </View>

          {/* ROW 2: Advance & Due Day */}
          <View className="flex-row justify-between mb-4">

            {/* ADVANCE AMOUNT */}
            <View className="flex-1 mr-2">
              <Text className="text-xs font-bold text-muted-foreground mb-1 ml-1">New Advance (Rs)</Text>
              <Controller
                control={control}
                name="advanceAmount"
                rules={{
                  required: isRelocating ? "Required" : false,
                  pattern: { value: /^[0-9]+$/, message: "Positive numbers only" }
                }}
                render={({ field: { onChange, value } }) => (
                  <View>
                    <View className={`bg-muted/20 border rounded-xl px-2 py-1 ${errors.advanceAmount ? 'border-red-500' : 'border-border'}`}>
                      <TextInput className="text-foreground py-2" keyboardType="numeric" value={value} onChangeText={onChange} />
                    </View>
                    {errors.advanceAmount && <Text className="text-red-500 text-xs mt-1 ml-1">{errors.advanceAmount.message}</Text>}
                  </View>
                )}
              />
            </View>

            {/* DUE DAY */}
            <View className="flex-1 ml-2">
              <Text className="text-xs font-bold text-muted-foreground mb-1 ml-1">Rent Due Day (1-28)</Text>
              <Controller
                control={control}
                name="rentDueDay"
                rules={{
                  required: isRelocating ? "Required" : false,
                  pattern: { value: /^[0-9]+$/, message: "Numbers only" },
                  min: { value: 1, message: "1-28" },
                  max: { value: 28, message: "1-28" }
                }}
                render={({ field: { onChange, value } }) => (
                  <View>
                    <View className={`bg-muted/20 border rounded-xl px-2 py-1 ${errors.rentDueDay ? 'border-red-500' : 'border-border'}`}>
                      <TextInput className="text-foreground py-2" keyboardType="numeric" maxLength={2} value={value} onChangeText={onChange} />
                    </View>
                    {errors.rentDueDay && <Text className="text-red-500 text-xs mt-1 ml-1">{errors.rentDueDay.message}</Text>}
                  </View>
                )}
              />
            </View>
          </View>

          {/* ROW 3: Move-In Date */}
          <View>
            <Text className="text-xs font-bold text-muted-foreground mb-1 ml-1">New Move-in Date</Text>
            <TouchableOpacity
              onPress={() => setShowMoveInPicker(true)}
              className="flex-row items-center bg-muted/20 border border-border rounded-xl px-4 py-3"
            >
              <Ionicons name="log-in-outline" size={20} color="#0f766e" className="mr-2" />
              <Text className="text-foreground font-medium">{newMoveInDate.format('MMM D, YYYY')}</Text>
            </TouchableOpacity>
          </View>
        </View>
      )}
    </>
  );
};