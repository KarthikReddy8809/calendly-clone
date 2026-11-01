-- Host auth: restore the public username and timezone that booking links and
-- slot generation depend on, and drop the accidental unique index on lastname
-- (two hosts may share a surname).

-- DropIndex
DROP INDEX `users_lastname_key` ON `users`;

-- AlterTable: add username as nullable first so existing rows can be backfilled.
ALTER TABLE `users`
    ADD COLUMN `username` VARCHAR(60) NULL,
    ADD COLUMN `timezone` VARCHAR(64) NOT NULL DEFAULT 'UTC';

-- Backfill: existing hosts get their id as a unique placeholder username.
UPDATE `users` SET `username` = `id` WHERE `username` IS NULL;

ALTER TABLE `users` MODIFY `username` VARCHAR(60) NOT NULL;

-- CreateIndex
CREATE UNIQUE INDEX `users_username_key` ON `users`(`username`);
