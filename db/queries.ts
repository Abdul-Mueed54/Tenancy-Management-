import { eq, sql } from 'drizzle-orm';
import { db } from './index';
import { tenants, agreements, buildings, ledgers } from './schema';

// --- DASHBOARD QUERIES ---

export async function getDashboardStats() {
  // Get total active agreements (Occupied Units)
  const activeAgreements = await db
    .select({ count: sql<number>`count(*)` })
    .from(agreements)
    .where(eq(agreements.is_active, true));

  // Get total rent collected for the current month
  // Note: We will expand this logic as we build the ledger system

  return {
    occupiedUnits: activeAgreements[0].count,
    // We will add the other stats here as we build the UI
  };
}

export async function getRecentTenants() {
  // Fetches the list for the bottom of the Dashboard
  return await db
    .select({
      name: tenants.name,
      building: agreements.building_name,
      rent: agreements.monthly_rent,
      cnic: tenants.cnic_number,
    })
    .from(tenants)
    .innerJoin(agreements, eq(tenants.cnic_number, agreements.tenant_cnic))
    .where(eq(agreements.is_active, true))
    .limit(10);
}

// --- ADD TENANT QUERIES ---

export type NewTenantParams = typeof tenants.$inferInsert;
export type NewAgreementParams = typeof agreements.$inferInsert;

export async function insertFullTenantProfile(tenantData: NewTenantParams, agreementData: NewAgreementParams) {
  // 1. Check if building exists, if not, create a quick placeholder
  // (Assuming buildings are dynamically added based on your UI dropdown)
  const existingBuilding = await db.select().from(buildings).where(eq(buildings.name, agreementData.building_name));
  if (existingBuilding.length === 0) {
    await db.insert(buildings).values({ name: agreementData.building_name });
  }

  // 2. Insert the Tenant
  await db.insert(tenants).values(tenantData).onConflictDoNothing(); // Prevents crash if CNIC already exists

  // 3. Insert the Agreement
  await db.insert(agreements).values(agreementData);
}

// _____________________________________Buildings Logic__________________________________________

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