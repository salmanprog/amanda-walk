-- AlterTable
ALTER TABLE `invoices` ADD COLUMN `invoice_amount` DECIMAL(10, 2) NOT NULL DEFAULT 0.00 AFTER `user_id`;
