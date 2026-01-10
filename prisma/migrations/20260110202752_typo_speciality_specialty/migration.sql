/*
  Warnings:

  - You are about to drop the column `speciality` on the `User` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "User" DROP COLUMN "speciality",
ADD COLUMN     "specialty" TEXT;
