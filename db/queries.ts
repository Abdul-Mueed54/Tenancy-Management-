import { desc, eq, sql } from 'drizzle-orm';
import { db } from './index';
import { tenants, agreements, buildings, ledgers, misc_charges } from './schema';
import dayjs from 'dayjs';

type RegisterTenantPayload = {
  fullName: string;
  contactNumber: string;
  presentAddress: string;
  cnicNumber: string;
  cnicExpiryDate: string;
  cnic_uri: string | null;
  buildingName: string;
  advanceAmount: number;
  monthlyRent: number;
  unitNumber: string;
  firstMonthRentCollected: number;
  moveInDate: string;
  rentDueDay: number;
};

// ------------------------------- Tenants Logic -------------------------------------------------------

// add new tenant
export const registerNewTenant = async (data: RegisterTenantPayload) => {
  try {
    await db.transaction(async (tx) => {
      await tx.insert(tenants).values({
        cnic_number: data.cnicNumber,
        name: data.fullName,
        contact_no: data.contactNumber,
        permanent_address: data.presentAddress,
        cnic_expiry_date: data.cnicExpiryDate,
        cnic_uri: data.cnic_uri,
      });

      const currentYear = dayjs(data.moveInDate).format('YYYY');
      const agreementId = `${data.buildingName}-${data.cnicNumber}-${currentYear}`;
      const endDate = dayjs(data.moveInDate).add(11, 'month').format('YYYY-MM-DD');

      await tx.insert(agreements).values({
        agreement_id: agreementId,
        tenant_cnic: data.cnicNumber,
        building_name: data.buildingName,
        unit_number: data.unitNumber,
        start_date: data.moveInDate,
        end_date: endDate,
        advance_amount: data.advanceAmount,
        monthly_rent: data.monthlyRent,
        rent_due_day: data.rentDueDay,
        is_active: true,
      });

      const amountDue = data.monthlyRent - data.firstMonthRentCollected;
      let status = 'pending';
      if (amountDue <= 0) status = 'paid';
      else if (data.firstMonthRentCollected > 0) status = 'partial';

      const billingMonth = dayjs(data.moveInDate).format('YYYY-MM');

      await tx.insert(ledgers).values({
        tenant_cnic: data.cnicNumber,
        agreement_id: agreementId,
        entry_type: 'rent',
        billing_month: billingMonth,
        total_payable_amount: data.monthlyRent,
        amount_paid: data.firstMonthRentCollected,
        amount_due: amountDue > 0 ? amountDue : 0,
        status: status,
      });
    });

    return { success: true };
  } catch (error) {
    console.error("Transaction failed:", error);
    return { success: false, error };
  }
};

// get tenants of specific building
export const getTenantsByBuilding = async (buildingName: string) => {
  try {
    const result = await db
      .select({
        cnic: tenants.cnic_number,
        name: tenants.name,
        contact: tenants.contact_no,
        rentAmount: agreements.monthly_rent,
        isActive: agreements.is_active,
      })
      .from(agreements)
      .innerJoin(tenants, eq(agreements.tenant_cnic, tenants.cnic_number))
      .where(eq(agreements.building_name, buildingName));

    return { success: true, data: result };
  } catch (error) {
    console.error("Failed to fetch building tenants:", error);
    return { success: false, data: [] };
  }
};


export const getFullTenantDetails = async (cnic: string) => {
  try {
    const result = await db
      .select({
        tenant: tenants,
        agreement: agreements,
      })
      .from(tenants)
      .innerJoin(agreements, eq(tenants.cnic_number, agreements.tenant_cnic))
      .where(eq(tenants.cnic_number, cnic))
      .limit(1);

    return { success: true, data: result[0] };
  } catch (error) {
    console.error("Error fetching full tenant details:", error);
    return { success: false, data: null };
  }
};

export const toggleTenantStatus = async (agreementId: string, currentStatus: boolean) => {
  try {
    await db.update(agreements)
      .set({ is_active: !currentStatus })
      .where(eq(agreements.agreement_id, agreementId));
    return { success: true };
  } catch (error) {
    console.error("Error toggling status:", error);
    return { success: false };
  }
};

// Update the Tenant and Agreement
export const updateExistingTenant = async (cnic: string, data: any) => {
  try {
    await db.transaction(async (tx) => {
      // 1. Update Tenant Details
      await tx.update(tenants)
        .set({
          name: data.fullName,
          contact_no: data.contactNumber,
          permanent_address: data.presentAddress,
          cnic_expiry_date: data.cnicExpiryDate,
          cnic_uri: data.cnic_uri,
        })
        .where(eq(tenants.cnic_number, cnic));

      // 2. Update Agreement Details
      await tx.update(agreements)
        .set({
          building_name: data.buildingName,
          unit_number: data.unitNumber,
          advance_amount: data.advanceAmount,
          monthly_rent: data.monthlyRent,
          rent_due_day: data.rentDueDay,
        })
        .where(eq(agreements.tenant_cnic, cnic));
    });

    return { success: true };
  } catch (error) {
    console.error("Update failed:", error);
    return { success: false, error };
  }
};

// ----------------------------------------- Buildings Logic ---------------------------------------------

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

// ------------------------------------------------- Ledgers Logic -----------------------------------------------------------------

export const getFinancialHistory = async (agreementId: string) => {
  try {
    // Fetch Rent Ledgers
    const rentLedgers = await db
      .select()
      .from(ledgers)
      .where(eq(ledgers.agreement_id, agreementId))
      .orderBy(desc(ledgers.created_at));

    // Fetch Misc Charges
    const miscCharges = await db
      .select()
      .from(misc_charges)
      .where(eq(misc_charges.agreement_id, agreementId))
      .orderBy(desc(misc_charges.created_at));

    return {
      success: true,
      data: {
        rentLedgers,
        miscCharges
      }
    };
  } catch (error) {
    console.error("Error fetching finances:", error);
    return { success: false, data: null };
  }
};