CREATE TABLE `agreements` (
	`agreement_id` text PRIMARY KEY NOT NULL,
	`tenant_cnic` text NOT NULL,
	`building_name` text NOT NULL,
	`start_date` text NOT NULL,
	`end_date` text NOT NULL,
	`advance_amount` integer NOT NULL,
	`monthly_rent` integer NOT NULL,
	`attachment_uri` text,
	`is_active` integer DEFAULT true NOT NULL,
	FOREIGN KEY (`tenant_cnic`) REFERENCES `tenants`(`cnic_number`) ON UPDATE no action ON DELETE no action,
	FOREIGN KEY (`building_name`) REFERENCES `buildings`(`name`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE TABLE `buildings` (
	`name` text PRIMARY KEY NOT NULL,
	`location_details` text
);
--> statement-breakpoint
CREATE TABLE `ledgers` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`agreement_id` text NOT NULL,
	`entry_type` text NOT NULL,
	`billing_month` text NOT NULL,
	`total_payable_amount` integer NOT NULL,
	`amount_paid` integer DEFAULT 0 NOT NULL,
	`amount_due` integer DEFAULT 0 NOT NULL,
	`status` text DEFAULT 'pending' NOT NULL,
	FOREIGN KEY (`agreement_id`) REFERENCES `agreements`(`agreement_id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE TABLE `tenants` (
	`cnic_number` text PRIMARY KEY NOT NULL,
	`name` text NOT NULL,
	`contact_no` text NOT NULL,
	`cnic_expiry_date` text,
	`permanent_address` text,
	`cnic_uri` text
);
