-- CreateTable
CREATE TABLE `users` (
    `id` VARCHAR(191) NOT NULL,
    `name` VARCHAR(120) NOT NULL,
    `email` VARCHAR(255) NOT NULL,
    `username` VARCHAR(60) NOT NULL,
    `timezone` VARCHAR(64) NOT NULL DEFAULT 'UTC',
    `avatar_url` VARCHAR(500) NULL,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updated_at` DATETIME(3) NOT NULL,
    `deleted_at` DATETIME(3) NULL,

    UNIQUE INDEX `users_email_key`(`email`),
    UNIQUE INDEX `users_username_key`(`username`),
    INDEX `users_deleted_at_idx`(`deleted_at`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `event_types` (
    `id` VARCHAR(191) NOT NULL,
    `user_id` VARCHAR(191) NOT NULL,
    `title` VARCHAR(120) NOT NULL,
    `slug` VARCHAR(60) NOT NULL,
    `description` TEXT NULL,
    `duration_minutes` INTEGER NOT NULL,
    `color` VARCHAR(9) NOT NULL DEFAULT '#0069ff',
    `location_type` ENUM('google_meet', 'zoom', 'phone', 'in_person', 'custom') NOT NULL DEFAULT 'google_meet',
    `location_value` VARCHAR(255) NULL,
    `is_active` BOOLEAN NOT NULL DEFAULT true,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updated_at` DATETIME(3) NOT NULL,
    `deleted_at` DATETIME(3) NULL,

    INDEX `event_types_user_id_idx`(`user_id`),
    INDEX `event_types_user_id_is_active_idx`(`user_id`, `is_active`),
    INDEX `event_types_deleted_at_idx`(`deleted_at`),
    UNIQUE INDEX `event_types_user_id_slug_key`(`user_id`, `slug`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `availability` (
    `id` VARCHAR(191) NOT NULL,
    `user_id` VARCHAR(191) NOT NULL,
    `weekday` TINYINT NOT NULL,
    `start_time` VARCHAR(5) NOT NULL,
    `end_time` VARCHAR(5) NOT NULL,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updated_at` DATETIME(3) NOT NULL,

    INDEX `availability_user_id_idx`(`user_id`),
    INDEX `availability_user_id_weekday_idx`(`user_id`, `weekday`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `meetings` (
    `id` VARCHAR(191) NOT NULL,
    `event_type_id` VARCHAR(191) NOT NULL,
    `host_id` VARCHAR(191) NOT NULL,
    `invitee_name` VARCHAR(120) NOT NULL,
    `invitee_email` VARCHAR(255) NOT NULL,
    `invitee_notes` TEXT NULL,
    `invitee_timezone` VARCHAR(64) NOT NULL,
    `start_time` DATETIME(3) NOT NULL,
    `end_time` DATETIME(3) NOT NULL,
    `status` ENUM('confirmed', 'cancelled') NOT NULL DEFAULT 'confirmed',
    `cancelled_at` DATETIME(3) NULL,
    `cancellation_reason` VARCHAR(500) NULL,
    `booking_slot_key` VARCHAR(120) NULL,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updated_at` DATETIME(3) NOT NULL,

    INDEX `meetings_host_id_start_time_idx`(`host_id`, `start_time`),
    INDEX `meetings_event_type_id_start_time_idx`(`event_type_id`, `start_time`),
    INDEX `meetings_host_id_status_start_time_idx`(`host_id`, `status`, `start_time`),
    INDEX `meetings_invitee_email_idx`(`invitee_email`),
    UNIQUE INDEX `meetings_booking_slot_key_key`(`booking_slot_key`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `event_types` ADD CONSTRAINT `event_types_user_id_fkey` FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `availability` ADD CONSTRAINT `availability_user_id_fkey` FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `meetings` ADD CONSTRAINT `meetings_event_type_id_fkey` FOREIGN KEY (`event_type_id`) REFERENCES `event_types`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `meetings` ADD CONSTRAINT `meetings_host_id_fkey` FOREIGN KEY (`host_id`) REFERENCES `users`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;
