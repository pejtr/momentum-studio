CREATE TABLE `hermes_memory` (
	`id` int AUTO_INCREMENT NOT NULL,
	`user_id` int NOT NULL,
	`key` varchar(128) NOT NULL,
	`value` text NOT NULL,
	`category` enum('preference','fact','skill','context','goal') NOT NULL DEFAULT 'fact',
	`confidence` int NOT NULL DEFAULT 80,
	`updated_at` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	`created_at` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `hermes_memory_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `hermes_messages` (
	`id` int AUTO_INCREMENT NOT NULL,
	`user_id` int NOT NULL,
	`session_id` varchar(64) NOT NULL,
	`role` enum('system','user','assistant','tool') NOT NULL,
	`content` text NOT NULL,
	`tool_name` varchar(64),
	`tool_input` json,
	`tool_output` text,
	`tokens` int,
	`created_at` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `hermes_messages_id` PRIMARY KEY(`id`)
);
