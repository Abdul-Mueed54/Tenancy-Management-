import { View, Text, TextInput, TouchableOpacity, KeyboardAvoidingView, Platform, TouchableWithoutFeedback, Keyboard, Alert } from 'react-native';
import { router } from 'expo-router';
import { useForm, Controller } from 'react-hook-form';
import { insertBuilding } from '@/db/queries';

type BuildingFormData = {
  name: string;
  location: string;
};

export default function AddBuildingDrawer() {
  const { control, handleSubmit, formState: { errors }, setError } = useForm<BuildingFormData>({
    defaultValues: { name: '', location: '' }
  });

  const onSubmit = async (data: BuildingFormData) => {
    const result = await insertBuilding(data.name, data.location);
    if (result.success) {
      router.back();
    } else {
      setError('name', { type: 'manual', message: 'Building already exists.' });
    }
  };

  return (
    <View className="flex-1">
      <View className="absolute inset-0 bg-foreground">
        <TouchableOpacity className="flex-1" activeOpacity={1} onPress={() => router.back()} />
      </View>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'padding'}
        className="flex-1 justify-end"
        pointerEvents="box-none"
      >
        <TouchableWithoutFeedback onPress={Keyboard.dismiss}>

          <View className="bg-white rounded-t-3xl shadow-lg w-full px-6 pt-6 pb-12">
            <View className="pb-6 flex-row justify-between items-center">
              <Text className="text-xl font-bold text-foreground">Add New Building</Text>
              <TouchableOpacity onPress={() => router.back()}>
                <Text className="text-xl text-muted-foreground font-bold">✕</Text>
              </TouchableOpacity>
            </View>

            {/* Form Inputs */}
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
                    onBlur={onBlur}
                    onChangeText={onChange}
                    value={value}
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
                    onBlur={onBlur}
                    onChangeText={onChange}
                    value={value}
                  />
                )}
              />
            </View>

            {/* Save Button */}
            <TouchableOpacity onPress={handleSubmit(onSubmit)} className="bg-teal-700 p-4 rounded-xl items-center">
              <Text className="text-white font-bold text-lg">Save Building</Text>
            </TouchableOpacity>

          </View>
        </TouchableWithoutFeedback>
      </KeyboardAvoidingView>

    </View>
  );
}