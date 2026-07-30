import { Text } from '@/components/ui/text';
import { router, useLocalSearchParams } from 'expo-router';
import { TouchableOpacity, View } from 'react-native';

export default function BuildingDetailsScreen() {
  // Grab the name of the building we clicked on
  const { name } = useLocalSearchParams<{ name: string }>();

  // ... fetch tenants for this building ...

  return (
    <View>
      <Text>Tenants in {name}</Text>

      {/* If empty, show this button */}
      <TouchableOpacity
        onPress={() => router.push({
          pathname: '/tenants/add',
          params: { buildingName: name } // This passes it to the form!
        })}
      >
        <Text>Add Tenant to this Building</Text>
      </TouchableOpacity>
    </View>
  );
}