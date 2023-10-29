-- DropForeignKey
ALTER TABLE "events"."dance_style_images" DROP CONSTRAINT "dance_style_images_dance_style_id_fkey";

-- DropForeignKey
ALTER TABLE "events"."event_images" DROP CONSTRAINT "event_images_event_id_fkey";

-- DropForeignKey
ALTER TABLE "events"."event_slot_images" DROP CONSTRAINT "event_slot_images_slot_id_fkey";

-- DropForeignKey
ALTER TABLE "profiles"."profile_images" DROP CONSTRAINT "profile_images_profile_id_fkey";

-- AddForeignKey
ALTER TABLE "events"."event_images" ADD CONSTRAINT "event_images_event_id_fkey" FOREIGN KEY ("event_id") REFERENCES "events"."events"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "events"."event_slot_images" ADD CONSTRAINT "event_slot_images_slot_id_fkey" FOREIGN KEY ("slot_id") REFERENCES "events"."event_slots"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "events"."dance_style_images" ADD CONSTRAINT "dance_style_images_dance_style_id_fkey" FOREIGN KEY ("dance_style_id") REFERENCES "events"."dance_styles"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "profiles"."profile_images" ADD CONSTRAINT "profile_images_profile_id_fkey" FOREIGN KEY ("profile_id") REFERENCES "profiles"."profiles"("id") ON DELETE CASCADE ON UPDATE CASCADE;
