import { useState, useCallback } from 'react';
import { View, Text, TouchableOpacity, FlatList } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { router, useFocusEffect } from 'expo-router';
import { getBuildings } from '@/db/queries';

type Building = {
  name: string;
  location_details: string | null;
};

export default function BuildingsScreen() {
  const [buildingList, setBuildingList] = useState<Building[]>([]);
  useFocusEffect(
    useCallback(() => {
      const loadBuildings = async () => {
        const result = await getBuildings();
        if (result.success) {
          setBuildingList(result.data);
        }
      };
      loadBuildings();
    }, [])
  );

  return (
    <View className="flex-1 bg-background pt-12">
      {/* HEADER */}
      <View className="flex-row justify-between items-center px-4 pb-4 border-b border-border">
        <Text className="text-2xl font-bold text-foreground">Buildings</Text>
        <TouchableOpacity
          onPress={() => router.push('/buildings/add')}
          className="px-4 py-2 rounded-lg flex-row items-center"
        >
          <Ionicons name="add" size={20} color="#0f766e" />
          <Text className="text-primary-700 font-bold ml-1">Add New</Text>
        </TouchableOpacity>
      </View>

      {/* LIST OF BUILDINGS */}
      {buildingList.length === 0 ? (
        <View className="flex-1 items-center justify-center px-4">
          <Ionicons name="business-outline" size={64} color="#a1a1aa" />
          <Text className="text-muted-foreground mt-4 text-center">No buildings added yet. Add your first property to get started.</Text>
        </View>
      ) : (
        <FlatList
          data={buildingList}
          keyExtractor={(item) => item.name}
          contentContainerStyle={{ padding: 16 }}
          renderItem={({ item }) => (
            <View className="bg-white p-4 rounded-xl mb-4 border border-border shadow-sm">
              <View className="flex-row items-center">
                <View className="bg-primary/10 p-3 rounded-full mr-4">
                <Ionicons name="business" size={24} color="#0f766e" />
                </View>
                <View className="flex-1">
                  <Text className="text-lg font-bold text-foreground">{item.name}</Text>
                  {item.location_details ? ( <Text className="text-sm text-muted-foreground mt-1">{item.location_details}</Text> ) : null}
                </View>

              {/* THE EDIT BUTTON */}
              <TouchableOpacity
                className="p-2 bg-muted rounded-full"
                onPress={() => router.push({
                  pathname: '/buildings/edit',
                  params: { oldName: item.name, oldLocation: item.location_details || '' }
                })}
              >
                <Ionicons name="pencil" size={20} color="#737373" />
              </TouchableOpacity>
              </View>
            </View>
          )}
        />
      )}
    </View>
  );
}