import { and, eq, gte, lte } from "drizzle-orm";
import { db } from "..";
import { activity_logs, agreements, buildings, tenants } from "../schema";
import dayjs from "dayjs";

export const uploadAgreementDetails = async ( agreementId: string, tenantId: string, fileUri: string, startDate: string ) => {
  try {
    await db.transaction(async (tx) => {

      const endDate = dayjs(startDate).add(11, 'month').format('YYYY-MM-DD');
      await tx.update(agreements)
        .set({
          attachment_uri: fileUri,
          start_date: startDate,
          end_date: endDate
        })
        .where(eq(agreements.id, agreementId));

      await tx.insert(activity_logs).values({
        tenant_id: tenantId,
        action_type: 'DOCUMENT',
        description: `Official agreement document uploaded (Contract Start: ${startDate}).`,
      });
    });
    return { success: true };
  } catch (error) {
    console.error("Failed to upload agreement:", error);
    return { success: false };
  }
};

// Fetch active agreements expiring within a specific number of days (default 30)
export const getExpiringAgreements = async (daysLimit = 30) => {
  try {
    const today = dayjs().format('YYYY-MM-DD');
    const targetDate = dayjs().add(daysLimit, 'day').format('YYYY-MM-DD');

    const result = await db
      .select({
        agreementId: agreements.id,
        tenantId: tenants.id,
        tenantName: tenants.name,
        contactNumber: tenants.contact_no, 
        buildingName: buildings.name,
        unitNumber: agreements.unit_number,
        endDate: agreements.end_date,
      })
      .from(agreements)
      .innerJoin(tenants, eq(agreements.tenant_id, tenants.id))
      .innerJoin(buildings, eq(agreements.building_id, buildings.id))
      .where(
        and(
          eq(agreements.is_active, true),
          gte(agreements.end_date, today),       // Expiration is today or later
          lte(agreements.end_date, targetDate)   // Expiration is before our target date
        )
      );

    // Sort so the ones expiring soonest are at the top
    result.sort((a, b) => new Date(a.endDate).getTime() - new Date(b.endDate).getTime());

    return { success: true, data: result };
  } catch (error) {
    console.error("Error fetching expiring agreements:", error);
    return { success: false, data: [] };
  }
};