import { eq } from "drizzle-orm";
import { db } from "..";
import { activity_logs, agreements } from "../schema";

export const uploadAgreementDetails = async ( agreementId: string, tenantId: string, fileUri: string, startDate: string ) => {
  try {
    await db.transaction(async (tx) => {
      await tx.update(agreements)
        .set({
          attachment_uri: fileUri,
          start_date: startDate,
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