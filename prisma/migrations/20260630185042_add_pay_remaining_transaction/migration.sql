-- AlterTable
ALTER TABLE `user` ADD COLUMN `pay_transaction` DECIMAL(10, 2) NOT NULL DEFAULT 0.00,
    ADD COLUMN `remaining_transaction` DECIMAL(10, 2) NOT NULL DEFAULT 0.00;
