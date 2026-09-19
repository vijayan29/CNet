CREATE TABLE `audit_logs` (
	`id` text PRIMARY KEY NOT NULL,
	`user_id` text NOT NULL,
	`action` text NOT NULL,
	`severity` text NOT NULL,
	`created_at` integer NOT NULL
);
--> statement-breakpoint
CREATE TABLE `cases` (
	`id` text PRIMARY KEY NOT NULL,
	`title` text NOT NULL,
	`jurisdiction` text NOT NULL,
	`status` text NOT NULL,
	`classification` text NOT NULL,
	`created_at` integer NOT NULL
);
--> statement-breakpoint
CREATE TABLE `evidence` (
	`id` text PRIMARY KEY NOT NULL,
	`case_id` text NOT NULL,
	`name` text NOT NULL,
	`kind` text NOT NULL,
	`size` text NOT NULL,
	`hash` text NOT NULL,
	`passport_code` text NOT NULL,
	`status` text NOT NULL,
	`risk` text NOT NULL,
	`created_at` integer NOT NULL
);
--> statement-breakpoint
CREATE UNIQUE INDEX `evidence_passport_code_unique` ON `evidence` (`passport_code`);--> statement-breakpoint
CREATE TABLE `ledger_events` (
	`id` text PRIMARY KEY NOT NULL,
	`evidence_id` text NOT NULL,
	`action` text NOT NULL,
	`actor` text NOT NULL,
	`previous_hash` text NOT NULL,
	`block_hash` text NOT NULL,
	`created_at` integer NOT NULL
);
--> statement-breakpoint
CREATE TABLE `users` (
	`id` text PRIMARY KEY NOT NULL,
	`name` text NOT NULL,
	`role` text NOT NULL,
	`mobile` text,
	`created_at` integer NOT NULL
);
