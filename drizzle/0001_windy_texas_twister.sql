CREATE TABLE `misc_charges` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`agreement_id` text NOT NULL,
	`charge_type` text NOT NULL,
	`amount` integer NOT NULL,
	`description` text,
	`date_incurred` text NOT NULL,
	`status` text DEFAULT 'pending' NOT NULL,
	`created_at` text DEFAULT CURRENT_TIMESTAMP NOT NULL,
	`updated_at` text DEFAULT CURRENT_TIMESTAMP NOT NULL,
	FOREIGN KEY (`agreement_id`) REFERENCES `agreements`(`agreement_id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
ALTER TABLE `agreements` ADD `created_at` text DEFAULT CURRENT_TIMESTAMP NOT NULL;--> statement-breakpoint
ALTER TABLE `agreements` ADD `updated_at` text DEFAULT CURRENT_TIMESTAMP NOT NULL;--> statement-breakpoint
ALTER TABLE `buildings` ADD `created_at` text DEFAULT CURRENT_TIMESTAMP NOT NULL;--> statement-breakpoint
ALTER TABLE `buildings` ADD `updated_at` text DEFAULT CURRENT_TIMESTAMP NOT NULL;--> statement-breakpoint
ALTER TABLE `ledgers` ADD `tenant_cnic` text NOT NULL REFERENCES tenants(cnic_number);--> statement-breakpoint
ALTER TABLE `ledgers` ADD `created_at` text DEFAULT CURRENT_TIMESTAMP NOT NULL;--> statement-breakpoint
ALTER TABLE `ledgers` ADD `updated_at` text DEFAULT CURRENT_TIMESTAMP NOT NULL;--> statement-breakpoint
ALTER TABLE `tenants` ADD `created_at` text DEFAULT CURRENT_TIMESTAMP NOT NULL;--> statement-breakpoint
ALTER TABLE `tenants` ADD `updated_at` text DEFAULT CURRENT_TIMESTAMP NOT NULL;