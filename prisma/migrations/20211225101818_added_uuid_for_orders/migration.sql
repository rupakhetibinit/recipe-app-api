/*
  Warnings:

  - The primary key for the `Orders` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - A unique constraint covering the columns `[id]` on the table `Orders` will be added. If there are existing duplicate values, this will fail.

*/
-- DropForeignKey
ALTER TABLE "_IngredientToOrders" DROP CONSTRAINT "_IngredientToOrders_B_fkey";

-- AlterTable
ALTER TABLE "Orders" DROP CONSTRAINT "Orders_pkey",
ALTER COLUMN "id" DROP DEFAULT,
ALTER COLUMN "id" SET DATA TYPE TEXT,
ADD CONSTRAINT "Orders_pkey" PRIMARY KEY ("id");
DROP SEQUENCE "Orders_id_seq";

-- AlterTable
ALTER TABLE "_IngredientToOrders" ALTER COLUMN "B" SET DATA TYPE TEXT;

-- CreateIndex
CREATE UNIQUE INDEX "Orders_id_key" ON "Orders"("id");

-- AddForeignKey
ALTER TABLE "_IngredientToOrders" ADD FOREIGN KEY ("B") REFERENCES "Orders"("id") ON DELETE CASCADE ON UPDATE CASCADE;
