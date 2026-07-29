import { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, KeyboardAvoidingView, Platform, TouchableWithoutFeedback, Keyboard } from 'react-native';
import { router, useLocalSearchParams } from 'expo-router';
import { useForm, Controller } from 'react-hook-form';
import { Ionicons } from '@expo/vector-icons';
import { updateBuilding, deleteBuilding } from '@/db/queries';
import { CustomAlertDialog } from '@/components/ui/alert-dialog';

type BuildingFormData = {
  name: string;
  location: string;
};

export default function EditBuildingDrawer() {
  const { oldName, oldLocation } = useLocalSearchParams<{ oldName: string, oldLocation: string }>();
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);

  const { control, handleSubmit, formState: { errors }, setError } = useForm<BuildingFormData>({
    defaultValues: { name: oldName, location: oldLocation }
  });

  const onSubmit = async (data: BuildingFormData) => {
    const result = await updateBuilding(oldName, data.name, data.location);
    if (result.success) {
      router.back();
    } else {
      setError('name', { type: 'manual', message: 'Error updating building. Name might be taken.' });
    }
  };

  const executeDelete = async () => {
    const result = await deleteBuilding(oldName);
    if (result.success) {
      setIsDeleteDialogOpen(false);
      router.back();
    } else {
      setIsDeleteDialogOpen(false);
      setError('name', { type: 'manual', message: 'Could not delete the building.' });
    }
  };

  return (
    <View className="flex-1">
      <View className="absolute inset-0 bg-black/50">
        <TouchableOpacity className="flex-1" activeOpacity={1} onPress={() => router.back()} />
      </View>

      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'padding'} className="flex-1 justify-end" pointerEvents="box-none">
        <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
          <View className="bg-white rounded-t-3xl shadow-lg w-full px-6 pt-6 pb-12">

            <View className="pb-10 flex-row justify-between items-center">
              <Text className="text-xl font-bold text-foreground">Edit Building</Text>

              <View className="flex-row items-center">
                <TouchableOpacity onPress={() => setIsDeleteDialogOpen(true)} className="mr-6">
                  <Ionicons name="trash-outline" size={24} color="#e7000b" />
                </TouchableOpacity>

                <TouchableOpacity onPress={() => router.back()}>
                  <Text className="text-xl text-muted-foreground font-bold">✕</Text>
                </TouchableOpacity>
              </View>
            </View>

            <View className="mb-6">
              <Text className="text-sm font-bold mb-1 text-foreground">Building Name <Text className="text-red-500">*</Text></Text>
              <Controller
                control={control}
                name="name"
                rules={{ required: 'Building name is required' }}
                render={({ field: { onChange, onBlur, value } }) => (
                  <TextInput
                    className={`border rounded-lg p-3 text-foreground ${errors.name ? 'border-red-500' : 'border-border'}`}
                    placeholder="e.g. Al-Noor Heights"
                    onBlur={onBlur} onChangeText={onChange} value={value}
                  />
                )}
              />
              {errors.name && <Text className="text-red-500 text-xs mt-1">{errors.name.message}</Text>}
            </View>

            <View className="mb-8">
              <Text className="text-sm font-bold mb-1 text-foreground">Location Details (Optional)</Text>
              <Controller
                control={control}
                name="location"
                render={({ field: { onChange, onBlur, value } }) => (
                  <TextInput
                    className="border border-border rounded-lg p-3 text-foreground"
                    placeholder="e.g. Block 13, Gulshan-e-Iqbal"
                    onBlur={onBlur} onChangeText={onChange} value={value}
                  />
                )}
              />
            </View>

            <TouchableOpacity onPress={handleSubmit(onSubmit)} className="bg-teal-700 p-4 mb-8 rounded-xl items-center">
              <Text className="text-white font-bold text-lg">Save Changes</Text>
            </TouchableOpacity>

          </View>
        </TouchableWithoutFeedback>
      </KeyboardAvoidingView>

      <CustomAlertDialog
        visible={isDeleteDialogOpen}
        onOpenChange={setIsDeleteDialogOpen}
        title="Delete Building"
        description={`Are you sure you want to delete ${oldName}? This action cannot be undone.`}
        cancelText="Cancel"
        actionText="Delete"
        onAction={executeDelete}
        isDestructive={true}
      />

    </View>
  );
}