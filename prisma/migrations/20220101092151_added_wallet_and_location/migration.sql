-- AlterTable
ALTER TABLE "User" ADD COLUMN     "location" TEXT,
ADD COLUMN     "wallet" INTEGER NOT NULL DEFAULT 0;
