-- DropForeignKey
ALTER TABLE "events"."event_slot_participants" DROP CONSTRAINT "event_slot_participants_profile_id_fkey";

-- AddForeignKey
ALTER TABLE "events"."event_slot_participants" ADD CONSTRAINT "event_slot_participants_profile_id_fkey" FOREIGN KEY ("profile_id") REFERENCES "profiles"."profiles"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
