/*
  Warnings:

  - Added the required column `total` to the `Orders` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Orders" ADD COLUMN     "total" INTEGER NOT NULL;
