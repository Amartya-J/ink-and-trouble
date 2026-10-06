CREATE TABLE `relay_players` (
	`token` text PRIMARY KEY NOT NULL,
	`room_code` text NOT NULL,
	`name` text NOT NULL,
	`joined_at` integer NOT NULL,
	`damage` real DEFAULT 0 NOT NULL,
	FOREIGN KEY (`room_code`) REFERENCES `relay_rooms`(`code`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE INDEX `idx_relay_players_room` ON `relay_players` (`room_code`);--> statement-breakpoint
CREATE TABLE `relay_rooms` (
	`code` text PRIMARY KEY NOT NULL,
	`host_token` text NOT NULL,
	`phase` text DEFAULT 'lobby' NOT NULL,
	`boss` integer DEFAULT 0 NOT NULL,
	`boss_hp` real DEFAULT 0 NOT NULL,
	`boss_max` real DEFAULT 0 NOT NULL,
	`turn` integer DEFAULT 0 NOT NULL,
	`actor_index` integer DEFAULT 0 NOT NULL,
	`max_turns` integer DEFAULT 0 NOT NULL,
	`deadline` integer DEFAULT 0 NOT NULL,
	`snapshot` text,
	`created_at` integer NOT NULL
);
--> statement-breakpoint
CREATE TABLE `relay_supports` (
	`room_code` text NOT NULL,
	`player_token` text NOT NULL,
	`turn` integer NOT NULL,
	`kind` text NOT NULL,
	PRIMARY KEY(`player_token`, `turn`),
	FOREIGN KEY (`room_code`) REFERENCES `relay_rooms`(`code`) ON UPDATE no action ON DELETE no action,
	FOREIGN KEY (`player_token`) REFERENCES `relay_players`(`token`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE INDEX `idx_relay_supports_room_turn` ON `relay_supports` (`room_code`,`turn`);