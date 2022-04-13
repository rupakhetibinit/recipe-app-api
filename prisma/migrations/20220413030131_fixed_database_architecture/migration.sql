/*
  Warnings:

  - You are about to drop the column `amount` on the `Ingredient` table. All the data in the column will be lost.
  - You are about to drop the column `measurement` on the `Ingredient` table. All the data in the column will be lost.
  - You are about to drop the column `pushNotificationToken` on the `User` table. All the data in the column will be lost.
  - You are about to drop the `Otp` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "Otp" DROP CONSTRAINT "Otp_userId_fkey";

-- AlterTable
ALTER TABLE "Ingredient" DROP COLUMN "amount",
DROP COLUMN "measurement";

-- AlterTable
ALTER TABLE "User" DROP COLUMN "pushNotificationToken",
ADD COLUMN     "Otp" INTEGER NOT NULL DEFAULT 0;

-- DropTable
DROP TABLE "Otp";
