-- Google Calendar connection per host, and the Meet link per meeting.

-- AlterTable
ALTER TABLE `meetings`
    ADD COLUMN `meet_url` VARCHAR(255) NULL,
    ADD COLUMN `google_event_id` VARCHAR(255) NULL;

-- CreateTable
CREATE TABLE `google_calendar_connections` (
    `id` VARCHAR(191) NOT NULL,
    `user_id` VARCHAR(191) NOT NULL,
    `google_email` VARCHAR(255) NOT NULL,
    `refresh_token` TEXT NOT NULL,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updated_at` DATETIME(3) NOT NULL,

    UNIQUE INDEX `google_calendar_connections_user_id_key`(`user_id`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `google_calendar_connections` ADD CONSTRAINT `google_calendar_connections_user_id_fkey` FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;
