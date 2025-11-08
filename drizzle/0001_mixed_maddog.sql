CREATE UNIQUE INDEX `genres_name_unique` ON `genres` (`name`);--> statement-breakpoint
CREATE UNIQUE INDEX `people_name_unique` ON `people` (`name`);--> statement-breakpoint
CREATE UNIQUE INDEX `people_telegramAccount_unique` ON `people` (`telegramAccount`);--> statement-breakpoint
CREATE UNIQUE INDEX `programs_name_unique` ON `programs` (`name`);--> statement-breakpoint
CREATE UNIQUE INDEX `programs_slug_unique` ON `programs` (`slug`);--> statement-breakpoint
CREATE UNIQUE INDEX `recordings_fileUrl_unique` ON `recordings` (`fileUrl`);