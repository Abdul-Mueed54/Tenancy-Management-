CREATE TABLE `activity_logs` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`tenant_cnic` text NOT NULL,
	`action_type` text NOT NULL,
	`description` text NOT NULL,
	`created_at` text DEFAULT CURRENT_TIMESTAMP NOT NULL,
	FOREIGN KEY (`tenant_cnic`) REFERENCES `tenants`(`cnic_number`) ON UPDATE no action ON DELETE no action
);
