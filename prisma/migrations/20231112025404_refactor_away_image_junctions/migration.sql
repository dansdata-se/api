/*
  Warnings:

  - You are about to drop the column `variant` on the `images` table. All the data in the column will be lost.
  - You are about to drop the `dance_style_images` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `event_images` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `event_slot_images` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `profile_images` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "events"."dance_style_images" DROP CONSTRAINT "dance_style_images_dance_style_id_fkey";

-- DropForeignKey
ALTER TABLE "events"."dance_style_images" DROP CONSTRAINT "dance_style_images_image_id_fkey";

-- DropForeignKey
ALTER TABLE "events"."event_images" DROP CONSTRAINT "event_images_event_id_fkey";

-- DropForeignKey
ALTER TABLE "events"."event_images" DROP CONSTRAINT "event_images_image_id_fkey";

-- DropForeignKey
ALTER TABLE "events"."event_slot_images" DROP CONSTRAINT "event_slot_images_image_id_fkey";

-- DropForeignKey
ALTER TABLE "events"."event_slot_images" DROP CONSTRAINT "event_slot_images_slot_id_fkey";

-- DropForeignKey
ALTER TABLE "profiles"."profile_images" DROP CONSTRAINT "profile_images_image_id_fkey";

-- DropForeignKey
ALTER TABLE "profiles"."profile_images" DROP CONSTRAINT "profile_images_profile_id_fkey";

-- AlterTable
ALTER TABLE "events"."dance_styles" ADD COLUMN     "cover_image_id" TEXT,
ADD COLUMN     "poster_image_id" TEXT,
ADD COLUMN     "square_image_id" TEXT;

-- AlterTable
ALTER TABLE "events"."event_slots" ADD COLUMN     "cover_image_id" TEXT,
ADD COLUMN     "poster_image_id" TEXT,
ADD COLUMN     "square_image_id" TEXT;

-- AlterTable
ALTER TABLE "events"."events" ADD COLUMN     "cover_image_id" TEXT,
ADD COLUMN     "poster_image_id" TEXT,
ADD COLUMN     "square_image_id" TEXT;

-- AlterTable
ALTER TABLE "profiles"."profiles" ADD COLUMN     "cover_image_id" TEXT,
ADD COLUMN     "poster_image_id" TEXT,
ADD COLUMN     "square_image_id" TEXT;

-- AlterTable
ALTER TABLE "storage"."images" DROP COLUMN "variant";

-- DropTable
DROP TABLE "events"."dance_style_images";

-- DropTable
DROP TABLE "events"."event_images";

-- DropTable
DROP TABLE "events"."event_slot_images";

-- DropTable
DROP TABLE "profiles"."profile_images";

-- DropEnum
DROP TYPE "storage"."image_variant";

-- CreateIndex
CREATE INDEX "dance_styles_cover_image_id_idx" ON "events"."dance_styles"("cover_image_id");

-- CreateIndex
CREATE INDEX "dance_styles_poster_image_id_idx" ON "events"."dance_styles"("poster_image_id");

-- CreateIndex
CREATE INDEX "dance_styles_square_image_id_idx" ON "events"."dance_styles"("square_image_id");

-- CreateIndex
CREATE INDEX "event_slots_cover_image_id_idx" ON "events"."event_slots"("cover_image_id");

-- CreateIndex
CREATE INDEX "event_slots_poster_image_id_idx" ON "events"."event_slots"("poster_image_id");

-- CreateIndex
CREATE INDEX "event_slots_square_image_id_idx" ON "events"."event_slots"("square_image_id");

-- CreateIndex
CREATE INDEX "events_cover_image_id_idx" ON "events"."events"("cover_image_id");

-- CreateIndex
CREATE INDEX "events_poster_image_id_idx" ON "events"."events"("poster_image_id");

-- CreateIndex
CREATE INDEX "events_square_image_id_idx" ON "events"."events"("square_image_id");

-- CreateIndex
CREATE INDEX "profiles_cover_image_id_idx" ON "profiles"."profiles"("cover_image_id");

-- CreateIndex
CREATE INDEX "profiles_poster_image_id_idx" ON "profiles"."profiles"("poster_image_id");

-- CreateIndex
CREATE INDEX "profiles_square_image_id_idx" ON "profiles"."profiles"("square_image_id");

-- AddForeignKey
ALTER TABLE "profiles"."profiles" ADD CONSTRAINT "profiles_cover_image_id_fkey" FOREIGN KEY ("cover_image_id") REFERENCES "storage"."images"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "profiles"."profiles" ADD CONSTRAINT "profiles_poster_image_id_fkey" FOREIGN KEY ("poster_image_id") REFERENCES "storage"."images"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "profiles"."profiles" ADD CONSTRAINT "profiles_square_image_id_fkey" FOREIGN KEY ("square_image_id") REFERENCES "storage"."images"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "events"."events" ADD CONSTRAINT "events_cover_image_id_fkey" FOREIGN KEY ("cover_image_id") REFERENCES "storage"."images"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "events"."events" ADD CONSTRAINT "events_poster_image_id_fkey" FOREIGN KEY ("poster_image_id") REFERENCES "storage"."images"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "events"."events" ADD CONSTRAINT "events_square_image_id_fkey" FOREIGN KEY ("square_image_id") REFERENCES "storage"."images"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "events"."event_slots" ADD CONSTRAINT "event_slots_cover_image_id_fkey" FOREIGN KEY ("cover_image_id") REFERENCES "storage"."images"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "events"."event_slots" ADD CONSTRAINT "event_slots_poster_image_id_fkey" FOREIGN KEY ("poster_image_id") REFERENCES "storage"."images"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "events"."event_slots" ADD CONSTRAINT "event_slots_square_image_id_fkey" FOREIGN KEY ("square_image_id") REFERENCES "storage"."images"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "events"."dance_styles" ADD CONSTRAINT "dance_styles_cover_image_id_fkey" FOREIGN KEY ("cover_image_id") REFERENCES "storage"."images"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "events"."dance_styles" ADD CONSTRAINT "dance_styles_poster_image_id_fkey" FOREIGN KEY ("poster_image_id") REFERENCES "storage"."images"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "events"."dance_styles" ADD CONSTRAINT "dance_styles_square_image_id_fkey" FOREIGN KEY ("square_image_id") REFERENCES "storage"."images"("id") ON DELETE SET NULL ON UPDATE CASCADE;
