CREATE TABLE `account` (
	`userId` text NOT NULL,
	`type` text NOT NULL,
	`provider` text NOT NULL,
	`providerAccountId` text NOT NULL,
	`refresh_token` text,
	`access_token` text,
	`expires_at` integer,
	`token_type` text,
	`scope` text,
	`id_token` text,
	`session_state` text,
	PRIMARY KEY(`provider`, `providerAccountId`),
	FOREIGN KEY (`userId`) REFERENCES `user`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE TABLE `match` (
	`id` text PRIMARY KEY NOT NULL,
	`tournamentId` text NOT NULL,
	`round` text NOT NULL,
	`slot` integer NOT NULL,
	`homeTeamId` text,
	`awayTeamId` text,
	`homeScore` integer,
	`awayScore` integer,
	`wentToPenalties` integer DEFAULT false NOT NULL,
	`penaltyWinnerTeamId` text,
	`status` text DEFAULT 'scheduled' NOT NULL,
	`kickoffAt` integer,
	`feedsIntoMatchId` text,
	`feedsIntoSide` text,
	FOREIGN KEY (`tournamentId`) REFERENCES `tournament`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE TABLE `prediction` (
	`id` text PRIMARY KEY NOT NULL,
	`userId` text NOT NULL,
	`matchId` text NOT NULL,
	`homeScore` integer NOT NULL,
	`awayScore` integer NOT NULL,
	`wentToPenalties` integer DEFAULT false NOT NULL,
	`penaltyWinnerTeamId` text,
	`updatedAt` integer NOT NULL,
	FOREIGN KEY (`userId`) REFERENCES `user`(`id`) ON UPDATE no action ON DELETE cascade,
	FOREIGN KEY (`matchId`) REFERENCES `match`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE UNIQUE INDEX `prediction_userId_matchId_unique` ON `prediction` (`userId`,`matchId`);--> statement-breakpoint
CREATE TABLE `profile` (
	`userId` text PRIMARY KEY NOT NULL,
	`username` text NOT NULL,
	`mascotVariant` text DEFAULT 'red' NOT NULL,
	`createdAt` integer NOT NULL,
	FOREIGN KEY (`userId`) REFERENCES `user`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE UNIQUE INDEX `profile_username_unique` ON `profile` (`username`);--> statement-breakpoint
CREATE TABLE `punishment` (
	`id` text PRIMARY KEY NOT NULL,
	`tournamentId` text NOT NULL,
	`fromBottom` integer,
	`absoluteRank` integer,
	`youtubeUrl` text NOT NULL,
	`label` text,
	`createdAt` integer NOT NULL,
	FOREIGN KEY (`tournamentId`) REFERENCES `tournament`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE TABLE `session` (
	`sessionToken` text PRIMARY KEY NOT NULL,
	`userId` text NOT NULL,
	`expires` integer NOT NULL,
	FOREIGN KEY (`userId`) REFERENCES `user`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE TABLE `team` (
	`id` text PRIMARY KEY NOT NULL,
	`tournamentId` text NOT NULL,
	`name` text NOT NULL,
	`seed` integer NOT NULL,
	`colorHint` text,
	`eliminated` integer DEFAULT false NOT NULL,
	FOREIGN KEY (`tournamentId`) REFERENCES `tournament`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE TABLE `tournament` (
	`id` text PRIMARY KEY NOT NULL,
	`name` text NOT NULL,
	`status` text DEFAULT 'setup' NOT NULL,
	`currentRound` text DEFAULT 'R16' NOT NULL,
	`picksDeadline` integer,
	`championTeamId` text,
	`createdAt` integer NOT NULL
);
--> statement-breakpoint
CREATE TABLE `user` (
	`id` text PRIMARY KEY NOT NULL,
	`name` text,
	`email` text,
	`emailVerified` integer,
	`image` text
);
--> statement-breakpoint
CREATE UNIQUE INDEX `user_email_unique` ON `user` (`email`);--> statement-breakpoint
CREATE TABLE `verificationToken` (
	`identifier` text NOT NULL,
	`token` text NOT NULL,
	`expires` integer NOT NULL,
	PRIMARY KEY(`identifier`, `token`)
);
