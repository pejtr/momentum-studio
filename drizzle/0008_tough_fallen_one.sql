CREATE TABLE `ai_credit_accounts` (
	`id` int AUTO_INCREMENT NOT NULL,
	`user_id` int NOT NULL,
	`monthly_allowance` int NOT NULL DEFAULT 30,
	`used_credits` int NOT NULL DEFAULT 0,
	`period_start` timestamp NOT NULL,
	`created_at` timestamp NOT NULL DEFAULT (now()),
	`updated_at` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `ai_credit_accounts_id` PRIMARY KEY(`id`),
	CONSTRAINT `ai_credit_accounts_user_id_unique` UNIQUE(`user_id`)
);
--> statement-breakpoint
CREATE TABLE `ai_credit_usage` (
	`id` int AUTO_INCREMENT NOT NULL,
	`user_id` int NOT NULL,
	`account_id` int NOT NULL,
	`tool` enum('hermes','pdf_summary','test_case_generation','xml_validation') NOT NULL,
	`credits` int NOT NULL DEFAULT 1,
	`period_start` timestamp NOT NULL,
	`created_at` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `ai_credit_usage_id` PRIMARY KEY(`id`)
);
