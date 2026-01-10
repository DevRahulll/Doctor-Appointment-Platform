/*
  Warnings:

  - You are about to drop the column `creagedAt` on the `CreditTransaction` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "CreditTransaction" DROP COLUMN "creagedAt",
ADD COLUMN     "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP;
