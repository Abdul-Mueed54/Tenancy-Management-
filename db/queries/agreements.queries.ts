import { eq } from "drizzle-orm";
import { db } from "..";
import { agreements } from "../schema";

export const uploadAgreementDocument = async (agreementId: string, fileUri: string) => {
  try {
    await db.update(agreements)
      .set({ attachment_uri: fileUri })
      .where(eq(agreements.id, agreementId));
    return { success: true };
  } catch (error) {
    console.error("Failed to upload agreement:", error);
    return { success: false };
  }
};