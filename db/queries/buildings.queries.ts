import { eq } from "drizzle-orm";
import { db } from "..";
import { buildings } from "../schema";

// Add a new building
export const insertBuilding = async (name: string, locationDetails: string) => {
  try {
    await db.insert(buildings).values({
      name,
      location_details: locationDetails,
    });
    return { success: true };
  } catch (error) {
    console.error("Error inserting building: ", error);
    return { success: false, error };
  }
};

// Get all buildings
export const getBuildings = async () => {
  try {
    const allBuildings = await db.select().from(buildings);
    return { success: true, data: allBuildings };
  } catch (error) {
    console.error("Error fetching buildings: ", error);
    return { success: false, error, data: [] };
  }
};

// Update existing Building
export const updateBuilding = async (oldName: string, newName: string, newLocation: string) => {
  try {
    await db.update(buildings)
      .set({ name: newName, location_details: newLocation })
      .where(eq(buildings.name, oldName));
    return { success: true };
  } catch (error) {
    console.error("Error updating building:", error);
    return { success: false, error };
  }
};

// delete existing Building
export const deleteBuilding = async (name: string) => {
  try {
    await db.delete(buildings).where(eq(buildings.name, name));
    return { success: true };
  } catch (error) {
    console.error("Error deleting building:", error);
    return { success: false, error };
  }
};