CREATE TABLE `announcement` (
	`id` text PRIMARY KEY NOT NULL,
	`tournamentId` text NOT NULL,
	`body` text NOT NULL,
	`emailedCount` integer DEFAULT 0 NOT NULL,
	`createdAt` integer NOT NULL,
	FOREIGN KEY (`tournamentId`) REFERENCES `tournament`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE TABLE `membership` (
	`id` text PRIMARY KEY NOT NULL,
	`userId` text NOT NULL,
	`tournamentId` text NOT NULL,
	`joinedAt` integer NOT NULL,
	FOREIGN KEY (`userId`) REFERENCES `user`(`id`) ON UPDATE no action ON DELETE cascade,
	FOREIGN KEY (`tournamentId`) REFERENCES `tournament`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE UNIQUE INDEX `membership_userId_tournamentId_unique` ON `membership` (`userId`,`tournamentId`);--> statement-breakpoint
ALTER TABLE `tournament` ADD `bracketSize` integer DEFAULT 16 NOT NULL;--> statement-breakpoint
ALTER TABLE `tournament` ADD `visible` integer DEFAULT true NOT NULL;--> statement-breakpoint
ALTER TABLE `tournament` ADD `featured` integer DEFAULT false NOT NULL;--> statement-breakpoint
ALTER TABLE `tournament` ADD `joinPolicy` text DEFAULT 'open' NOT NULL;--> statement-breakpoint
ALTER TABLE `tournament` ADD `joinCode` text;--> statement-breakpoint
ALTER TABLE `tournament` ADD `isGeneralPool` integer DEFAULT false NOT NULL;--> statement-breakpoint
CREATE UNIQUE INDEX `tournament_joinCode_unique` ON `tournament` (`joinCode`);