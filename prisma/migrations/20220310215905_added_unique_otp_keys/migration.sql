/*
  Warnings:

  - A unique constraint covering the columns `[verificationCode]` on the table `Otp` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateIndex
CREATE UNIQUE INDEX "Otp_verificationCode_key" ON "Otp"("verificationCode");
