PRAGMA foreign_keys=OFF;--> statement-breakpoint
CREATE TABLE `__new_agreements` (
	`id` text PRIMARY KEY NOT NULL,
	`tenant_id` text NOT NULL,
	`building_id` text NOT NULL,
	`move_in_date` text NOT NULL,
	`start_date` text NOT NULL,
	`end_date` text NOT NULL,
	`unit_number` text NOT NULL,
	`advance_amount` integer NOT NULL,
	`monthly_rent` integer NOT NULL,
	`rent_due_day` integer NOT NULL,
	`attachment_uri` text,
	`is_active` integer DEFAULT true NOT NULL,
	`created_at` text DEFAULT CURRENT_TIMESTAMP NOT NULL,
	`updated_at` text DEFAULT CURRENT_TIMESTAMP NOT NULL,
	FOREIGN KEY (`tenant_id`) REFERENCES `tenants`(`id`) ON UPDATE no action ON DELETE no action,
	FOREIGN KEY (`building_id`) REFERENCES `buildings`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
INSERT INTO `__new_agreements`("id", "tenant_id", "building_id", "move_in_date", "start_date", "end_date", "unit_number", "advance_amount", "monthly_rent", "rent_due_day", "attachment_uri", "is_active", "created_at", "updated_at") SELECT "id", "tenant_id", "building_id", "move_in_date", "start_date", "end_date", "unit_number", "advance_amount", "monthly_rent", "rent_due_day", "attachment_uri", "is_active", "created_at", "updated_at" FROM `agreements`;--> statement-breakpoint
DROP TABLE `agreements`;--> statement-breakpoint
ALTER TABLE `__new_agreements` RENAME TO `agreements`;--> statement-breakpoint
PRAGMA foreign_keys=ON;--> statement-breakpoint
CREATE TABLE `__new_ledgers` (
	`id` text PRIMARY KEY NOT NULL,
	`agreement_id` text NOT NULL,
	`tenant_id` text NOT NULL,
	`entry_type` text NOT NULL,
	`billing_month` text NOT NULL,
	`total_payable_amount` integer NOT NULL,
	`amount_paid` integer DEFAULT 0 NOT NULL,
	`amount_due` integer DEFAULT 0 NOT NULL,
	`status` text DEFAULT 'pending' NOT NULL,
	`created_at` text DEFAULT CURRENT_TIMESTAMP NOT NULL,
	`updated_at` text DEFAULT CURRENT_TIMESTAMP NOT NULL,
	FOREIGN KEY (`agreement_id`) REFERENCES `agreements`(`id`) ON UPDATE no action ON DELETE no action,
	FOREIGN KEY (`tenant_id`) REFERENCES `tenants`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
INSERT INTO `__new_ledgers`("id", "agreement_id", "tenant_id", "entry_type", "billing_month", "total_payable_amount", "amount_paid", "amount_due", "status", "created_at", "updated_at") SELECT "id", "agreement_id", "tenant_id", "entry_type", "billing_month", "total_payable_amount", "amount_paid", "amount_due", "status", "created_at", "updated_at" FROM `ledgers`;--> statement-breakpoint
DROP TABLE `ledgers`;--> statement-breakpoint
ALTER TABLE `__new_ledgers` RENAME TO `ledgers`;--> statement-breakpoint
CREATE TABLE `__new_activity_logs` (
	`id` text PRIMARY KEY NOT NULL,
	`tenant_id` text NOT NULL,
	`action_type` text NOT NULL,
	`description` text NOT NULL,
	`created_at` text DEFAULT CURRENT_TIMESTAMP NOT NULL,
	FOREIGN KEY (`tenant_id`) REFERENCES `tenants`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
INSERT INTO `__new_activity_logs`("id", "tenant_id", "action_type", "description", "created_at") SELECT "id", "tenant_id", "action_type", "description", "created_at" FROM `activity_logs`;--> statement-breakpoint
DROP TABLE `activity_logs`;--> statement-breakpoint
ALTER TABLE `__new_activity_logs` RENAME TO `activity_logs`;--> statement-breakpoint
CREATE TABLE `__new_misc_charges` (
	`id` text PRIMARY KEY NOT NULL,
	`agreement_id` text NOT NULL,
	`charge_type` text NOT NULL,
	`amount` integer NOT NULL,
	`description` text,
	`date_incurred` text NOT NULL,
	`status` text DEFAULT 'pending' NOT NULL,
	`created_at` text DEFAULT CURRENT_TIMESTAMP NOT NULL,
	`updated_at` text DEFAULT CURRENT_TIMESTAMP NOT NULL,
	FOREIGN KEY (`agreement_id`) REFERENCES `agreements`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
INSERT INTO `__new_misc_charges`("id", "agreement_id", "charge_type", "amount", "description", "date_incurred", "status", "created_at", "updated_at") SELECT "id", "agreement_id", "charge_type", "amount", "description", "date_incurred", "status", "created_at", "updated_at" FROM `misc_charges`;--> statement-breakpoint
DROP TABLE `misc_charges`;--> statement-breakpoint
ALTER TABLE `__new_misc_charges` RENAME TO `misc_charges`;--> statement-breakpoint
CREATE TABLE `__new_buildings` (
	`id` text PRIMARY KEY NOT NULL,
	`name` text NOT NULL,
	`location_details` text,
	`created_at` text DEFAULT CURRENT_TIMESTAMP NOT NULL,
	`updated_at` text DEFAULT CURRENT_TIMESTAMP NOT NULL
);
--> statement-breakpoint
INSERT INTO `__new_buildings`("id", "name", "location_details", "created_at", "updated_at") SELECT "id", "name", "location_details", "created_at", "updated_at" FROM `buildings`;--> statement-breakpoint
DROP TABLE `buildings`;--> statement-breakpoint
ALTER TABLE `__new_buildings` RENAME TO `buildings`;--> statement-breakpoint
CREATE UNIQUE INDEX `buildings_name_unique` ON `buildings` (`name`);--> statement-breakpoint
CREATE TABLE `__new_tenants` (
	`id` text PRIMARY KEY NOT NULL,
	`cnic_number` text NOT NULL,
	`name` text NOT NULL,
	`contact_no` text NOT NULL,
	`cnic_expiry_date` text,
	`permanent_address` text,
	`cnic_uri` text,
	`created_at` text DEFAULT CURRENT_TIMESTAMP NOT NULL,
	`updated_at` text DEFAULT CURRENT_TIMESTAMP NOT NULL
);
--> statement-breakpoint
INSERT INTO `__new_tenants`("id", "cnic_number", "name", "contact_no", "cnic_expiry_date", "permanent_address", "cnic_uri", "created_at", "updated_at") SELECT "id", "cnic_number", "name", "contact_no", "cnic_expiry_date", "permanent_address", "cnic_uri", "created_at", "updated_at" FROM `tenants`;--> statement-breakpoint
DROP TABLE `tenants`;--> statement-breakpoint
ALTER TABLE `__new_tenants` RENAME TO `tenants`;--> statement-breakpoint
CREATE UNIQUE INDEX `tenants_cnic_number_unique` ON `tenants` (`cnic_number`);