-- AlterTable
ALTER TABLE `booking_chat_messages` ADD COLUMN `receiverId` INTEGER NULL;

-- CreateIndex
CREATE INDEX `booking_chat_messages_receiverId_idx` ON `booking_chat_messages`(`receiverId`);

-- AddForeignKey
ALTER TABLE `booking_chat_messages` ADD CONSTRAINT `booking_chat_messages_receiverId_fkey` FOREIGN KEY (`receiverId`) REFERENCES `User`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;
