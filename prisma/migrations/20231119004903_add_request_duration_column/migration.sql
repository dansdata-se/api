/*
  Warnings:

  - Added the required column `duration` to the `requests` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "logs"."requests" ADD COLUMN     "duration" INTEGER NOT NULL;
