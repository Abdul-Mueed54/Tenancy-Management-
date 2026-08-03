import { desc, eq } from "drizzle-orm";
import { db } from "..";
import { ledgers, misc_charges } from "../schema";

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
