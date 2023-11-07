/*
  Warnings:

  - You are about to drop the column `permanentlyClosed` on the `venues` table. All the data in the column will be lost.

*/

-- AlterTable
ALTER TABLE "profiles"."venues" DROP COLUMN "permanentlyClosed",
ADD COLUMN     "permanently_closed" BOOLEAN NOT NULL DEFAULT false;
