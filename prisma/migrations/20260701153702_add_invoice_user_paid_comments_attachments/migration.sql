-- AlterTable
ALTER TABLE `invoices` ADD COLUMN `attachments` TEXT NULL,
    ADD COLUMN `comments` TEXT NULL,
    ADD COLUMN `user_paid` DECIMAL(10, 2) NOT NULL DEFAULT 0.00;
