import { sqliteTable, text, integer } from 'drizzle-orm/sqlite-core';

export const buildings = sqliteTable('buildings', {
  name: text('name').primaryKey(),
  location_details: text('location_details'),
});

export const tenants = sqliteTable('tenants', {
  cnic_number: text('cnic_number').primaryKey(),
  name: text('name').notNull(),
  contact_no: text('contact_no').notNull(),
  cnic_expiry_date: text('cnic_expiry_date'),
  permanent_address: text('permanent_address'),
  cnic_uri: text('cnic_uri'),
});

export const agreements = sqliteTable('agreements', {
  agreement_id: text('agreement_id').primaryKey(), // Format: BuildingName-CNIC-Year
  tenant_cnic: text('tenant_cnic').references(() => tenants.cnic_number).notNull(),
  building_name: text('building_name').references(() => buildings.name).notNull(),
  start_date: text('start_date').notNull(),
  end_date: text('end_date').notNull(),
  advance_amount: integer('advance_amount').notNull(),
  monthly_rent: integer('monthly_rent').notNull(),
  rent_due_day: integer('rent_due_day').notNull(),
  attachment_uri: text('attachment_uri'),
  is_active: integer('is_active', { mode: 'boolean' }).notNull().default(true),
});

export const ledgers = sqliteTable('ledgers', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  agreement_id: text('agreement_id').references(() => agreements.agreement_id).notNull(),
  entry_type: text('entry_type').notNull(), // 'rent', 'k_electric', 'gas', 'water'
  billing_month: text('billing_month').notNull(), // e.g., '2026-07'
  total_payable_amount: integer('total_payable_amount').notNull(),
  amount_paid: integer('amount_paid').notNull().default(0),
  amount_due: integer('amount_due').notNull().default(0),
  status: text('status').notNull().default('pending'), // 'pending', 'partial', 'paid'
});