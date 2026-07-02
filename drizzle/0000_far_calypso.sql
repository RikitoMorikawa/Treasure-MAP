CREATE TABLE `climbs` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`mountain_name` text NOT NULL,
	`elevation` integer,
	`climbed_on` text NOT NULL,
	`memo` text,
	`created_at` text DEFAULT (datetime('now')) NOT NULL
);
--> statement-breakpoint
CREATE TABLE `travels` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`title` text NOT NULL,
	`destination` text NOT NULL,
	`visited_on` text NOT NULL,
	`memo` text,
	`created_at` text DEFAULT (datetime('now')) NOT NULL
);
