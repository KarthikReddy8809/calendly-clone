/*
  Warnings:

  - You are about to drop the column `name` on the `users` table. All the data in the column will be lost.
  - You are about to drop the column `username` on the `users` table. All the data in the column will be lost.
  - A unique constraint covering the columns `[lastname]` on the table `users` will be added. If there are existing duplicate values, this will fail.

*/
-- DropIndex
DROP INDEX `users_username_key` ON `users`;

-- AlterTable
ALTER TABLE `users` DROP COLUMN `name`,
    DROP COLUMN `username`,
    ADD COLUMN `firstname` VARCHAR(120) NULL,
    ADD COLUMN `lastname` VARCHAR(60) NULL,
    ADD COLUMN `password` VARCHAR(50) NULL;

-- CreateIndex
CREATE UNIQUE INDEX `users_lastname_key` ON `users`(`lastname`);
