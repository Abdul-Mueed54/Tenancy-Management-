import { eq } from "drizzle-orm";
import { db } from "..";
import { activity_logs, ledgers, misc_charges } from "../schema";

export const getTenantSummaryTimeline = async (cnic: string, agreementId: string) => {
  try {
    const logs = await db.select().from(activity_logs).where(eq(activity_logs.tenant_cnic, cnic));
    const rent = await db.select().from(ledgers).where(eq(ledgers.agreement_id, agreementId));
    const misc = await db.select().from(misc_charges).where(eq(misc_charges.agreement_id, agreementId));
    const timeline = [
      ...logs.map(l => ({ id: `log_${l.id}`, date: l.created_at, title: l.action_type, desc: l.description, type: 'log' })),
      ...rent.map(r => ({ id: `rent_${r.id}`, date: r.created_at, title: 'RENT GENERATED', desc: `Rent bill generated for ${r.billing_month} (Rs ${r.total_payable_amount})`, type: 'finance' })),
      ...misc.map(m => ({ id: `misc_${m.id}`, date: m.created_at, title: 'MISC CHARGE', desc: `${m.charge_type}: Rs ${m.amount}`, type: 'finance' }))
    ];

    timeline.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

    return { success: true, data: timeline };
  } catch (error) {
    return { success: false, data: [] };
  }
};