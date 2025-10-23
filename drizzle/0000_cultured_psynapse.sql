CREATE TABLE `genres` (
	`id` text PRIMARY KEY NOT NULL,
	`name` text NOT NULL
);
--> statement-breakpoint
CREATE TABLE `people` (
	`id` text PRIMARY KEY NOT NULL,
	`name` text NOT NULL,
	`telegramAccount` text,
	`createdAt` integer NOT NULL
);
--> statement-breakpoint
CREATE TABLE `programs` (
	`id` text PRIMARY KEY NOT NULL,
	`name` text NOT NULL,
	`description` text,
	`hostId` text,
	`slug` text NOT NULL,
	`createdAt` integer NOT NULL,
	FOREIGN KEY (`hostId`) REFERENCES `people`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE TABLE `recordingGenres` (
	`recordingId` text NOT NULL,
	`genreId` text NOT NULL,
	PRIMARY KEY(`recordingId`, `genreId`),
	FOREIGN KEY (`recordingId`) REFERENCES `recordings`(`id`) ON UPDATE no action ON DELETE cascade,
	FOREIGN KEY (`genreId`) REFERENCES `genres`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE TABLE `recordingPeople` (
	`recordingId` text NOT NULL,
	`personId` text NOT NULL,
	`role` text NOT NULL,
	PRIMARY KEY(`recordingId`, `personId`),
	FOREIGN KEY (`recordingId`) REFERENCES `recordings`(`id`) ON UPDATE no action ON DELETE cascade,
	FOREIGN KEY (`personId`) REFERENCES `people`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE TABLE `recordings` (
	`id` text PRIMARY KEY NOT NULL,
	`programId` text NOT NULL,
	`episodeTitle` text NOT NULL,
	`description` text,
	`type` text NOT NULL,
	`releaseDate` integer NOT NULL,
	`duration` integer NOT NULL,
	`status` text NOT NULL,
	`keywords` text,
	`fileUrl` text NOT NULL,
	`createdAt` integer NOT NULL,
	FOREIGN KEY (`programId`) REFERENCES `programs`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE TABLE `session` (
	`sessionToken` text PRIMARY KEY NOT NULL,
	`userId` text NOT NULL,
	`expires` integer NOT NULL,
	FOREIGN KEY (`userId`) REFERENCES `user`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE TABLE `user` (
	`id` text PRIMARY KEY NOT NULL,
	`username` text NOT NULL,
	`password` text NOT NULL,
	`role` text NOT NULL
);
