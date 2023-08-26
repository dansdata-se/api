-- CreateEnum
CREATE TYPE "events"."currency_code" AS ENUM ('SEK', 'NOK', 'DKK', 'EUR', 'GBP', 'USD');
-- CreateEnum
CREATE TYPE "events"."event_slot_participation_type" AS ENUM (
    'other',
    'performer',
    'instructor',
    'organizer',
    'photographer'
);
-- CreateTable
CREATE TABLE "events"."events" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "cancelled" BOOLEAN NOT NULL DEFAULT false,
    "must_attend_full_event" BOOLEAN NOT NULL DEFAULT false,
    "created_at" TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    CONSTRAINT "events_pkey" PRIMARY KEY ("id")
);
-- CreateTable
CREATE TABLE "events"."event_images" (
    "event_id" TEXT NOT NULL,
    "image_id" TEXT NOT NULL,
    CONSTRAINT "event_images_pkey" PRIMARY KEY ("event_id", "image_id")
);
-- CreateTable
CREATE TABLE "events"."event_links" (
    "id" SERIAL NOT NULL,
    "event_id" TEXT NOT NULL,
    "url" TEXT NOT NULL,
    CONSTRAINT "event_links_pkey" PRIMARY KEY ("id")
);
-- CreateTable
CREATE TABLE "events"."event_tags" (
    "event_id" TEXT NOT NULL,
    "tag" TEXT NOT NULL,
    CONSTRAINT "event_tags_pkey" PRIMARY KEY ("event_id", "tag")
);
-- CreateTable
CREATE TABLE "events"."event_tag_details" (
    "tag" TEXT NOT NULL,
    "label" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    CONSTRAINT "event_tag_details_pkey" PRIMARY KEY ("tag")
);
-- CreateTable
CREATE TABLE "events"."event_slots" (
    "id" TEXT NOT NULL,
    "event_id" TEXT NOT NULL,
    "start" TIMESTAMPTZ NOT NULL,
    "end" TIMESTAMPTZ NOT NULL,
    "cancelled" BOOLEAN NOT NULL DEFAULT false,
    "live_music" BOOLEAN NOT NULL,
    "venue_id" TEXT NOT NULL,
    CONSTRAINT "event_slots_pkey" PRIMARY KEY ("id")
);
-- CreateTable
CREATE TABLE "events"."event_slot_images" (
    "slot_id" TEXT NOT NULL,
    "image_id" TEXT NOT NULL,
    CONSTRAINT "event_slot_images_pkey" PRIMARY KEY ("slot_id", "image_id")
);
-- CreateTable
CREATE TABLE "events"."event_slot_links" (
    "id" SERIAL NOT NULL,
    "slot_id" TEXT NOT NULL,
    "url" TEXT NOT NULL,
    CONSTRAINT "event_slot_links_pkey" PRIMARY KEY ("id")
);
-- CreateTable
CREATE TABLE "events"."payment_options" (
    "id" SERIAL NOT NULL,
    "slot_id" TEXT NOT NULL,
    "price" INTEGER NOT NULL,
    "currency" "events"."currency_code" NOT NULL,
    "description" TEXT NOT NULL,
    "cash" BOOLEAN NOT NULL,
    "card" BOOLEAN NOT NULL,
    "swish" BOOLEAN NOT NULL,
    "online" TEXT,
    CONSTRAINT "payment_options_pkey" PRIMARY KEY ("id")
);
-- CreateTable
CREATE TABLE "events"."event_slot_participants" (
    "slot_id" TEXT NOT NULL,
    "profile_id" TEXT NOT NULL,
    "type" "events"."event_slot_participation_type" NOT NULL,
    CONSTRAINT "event_slot_participants_pkey" PRIMARY KEY ("slot_id", "profile_id", "type")
);
-- CreateTable
CREATE TABLE "events"."event_slot_dance_styles" (
    "event_slot_id" TEXT NOT NULL,
    "dance_style_id" TEXT NOT NULL,
    CONSTRAINT "event_slot_dance_styles_pkey" PRIMARY KEY ("event_slot_id", "dance_style_id")
);
-- CreateTable
CREATE TABLE "events"."dance_styles" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    CONSTRAINT "dance_styles_pkey" PRIMARY KEY ("id")
);
-- CreateTable
CREATE TABLE "events"."dance_style_images" (
    "dance_style_id" TEXT NOT NULL,
    "image_id" TEXT NOT NULL,
    CONSTRAINT "dance_style_images_pkey" PRIMARY KEY ("dance_style_id", "image_id")
);
-- CreateIndex
CREATE INDEX "events_name_idx" ON "events"."events" USING GIN ("name" gin_trgm_ops);
-- CreateIndex
CREATE INDEX "event_images_event_id_idx" ON "events"."event_images"("event_id");
-- CreateIndex
CREATE INDEX "event_images_image_id_idx" ON "events"."event_images"("image_id");
-- CreateIndex
CREATE INDEX "event_links_event_id_idx" ON "events"."event_links"("event_id");
-- CreateIndex
CREATE UNIQUE INDEX "event_links_event_id_url_key" ON "events"."event_links"("event_id", "url");
-- CreateIndex
CREATE INDEX "event_tags_event_id_idx" ON "events"."event_tags"("event_id");
-- CreateIndex
CREATE INDEX "event_tags_tag_idx" ON "events"."event_tags"("tag");
-- CreateIndex
CREATE INDEX "event_slots_event_id_idx" ON "events"."event_slots"("event_id");
-- CreateIndex
CREATE INDEX "event_slots_venue_id_idx" ON "events"."event_slots"("venue_id");
-- CreateIndex
CREATE INDEX "event_slots_start_idx" ON "events"."event_slots"("start");
-- CreateIndex
CREATE INDEX "event_slots_end_idx" ON "events"."event_slots"("end");
-- CreateIndex
CREATE INDEX "event_slot_images_slot_id_idx" ON "events"."event_slot_images"("slot_id");
-- CreateIndex
CREATE INDEX "event_slot_images_image_id_idx" ON "events"."event_slot_images"("image_id");
-- CreateIndex
CREATE INDEX "event_slot_links_slot_id_idx" ON "events"."event_slot_links"("slot_id");
-- CreateIndex
CREATE UNIQUE INDEX "event_slot_links_slot_id_url_key" ON "events"."event_slot_links"("slot_id", "url");
-- CreateIndex
CREATE INDEX "payment_options_slot_id_idx" ON "events"."payment_options"("slot_id");
-- CreateIndex
CREATE INDEX "event_slot_participants_slot_id_idx" ON "events"."event_slot_participants"("slot_id");
-- CreateIndex
CREATE INDEX "event_slot_participants_profile_id_idx" ON "events"."event_slot_participants"("profile_id");
-- CreateIndex
CREATE INDEX "event_slot_participants_type_idx" ON "events"."event_slot_participants"("type");
-- CreateIndex
CREATE INDEX "dance_styles_name_idx" ON "events"."dance_styles" USING GIN ("name" gin_trgm_ops);
-- CreateIndex
CREATE INDEX "dance_style_images_dance_style_id_idx" ON "events"."dance_style_images"("dance_style_id");
-- CreateIndex
CREATE INDEX "dance_style_images_image_id_idx" ON "events"."dance_style_images"("image_id");
-- AddForeignKey
ALTER TABLE "events"."event_images"
ADD CONSTRAINT "event_images_event_id_fkey" FOREIGN KEY ("event_id") REFERENCES "events"."events"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
-- AddForeignKey
ALTER TABLE "events"."event_images"
ADD CONSTRAINT "event_images_image_id_fkey" FOREIGN KEY ("image_id") REFERENCES "storage"."images"("id") ON DELETE CASCADE ON UPDATE CASCADE;
-- AddForeignKey
ALTER TABLE "events"."event_links"
ADD CONSTRAINT "event_links_event_id_fkey" FOREIGN KEY ("event_id") REFERENCES "events"."events"("id") ON DELETE CASCADE ON UPDATE CASCADE;
-- AddForeignKey
ALTER TABLE "events"."event_tags"
ADD CONSTRAINT "event_tags_event_id_fkey" FOREIGN KEY ("event_id") REFERENCES "events"."events"("id") ON DELETE CASCADE ON UPDATE CASCADE;
-- AddForeignKey
ALTER TABLE "events"."event_tags"
ADD CONSTRAINT "event_tags_tag_fkey" FOREIGN KEY ("tag") REFERENCES "events"."event_tag_details"("tag") ON DELETE CASCADE ON UPDATE CASCADE;
-- AddForeignKey
ALTER TABLE "events"."event_slots"
ADD CONSTRAINT "event_slots_event_id_fkey" FOREIGN KEY ("event_id") REFERENCES "events"."events"("id") ON DELETE CASCADE ON UPDATE CASCADE;
-- AddForeignKey
ALTER TABLE "events"."event_slots"
ADD CONSTRAINT "event_slots_venue_id_fkey" FOREIGN KEY ("venue_id") REFERENCES "profiles"."venues"("profile_id") ON DELETE RESTRICT ON UPDATE CASCADE;
-- AddForeignKey
ALTER TABLE "events"."event_slot_images"
ADD CONSTRAINT "event_slot_images_slot_id_fkey" FOREIGN KEY ("slot_id") REFERENCES "events"."event_slots"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
-- AddForeignKey
ALTER TABLE "events"."event_slot_images"
ADD CONSTRAINT "event_slot_images_image_id_fkey" FOREIGN KEY ("image_id") REFERENCES "storage"."images"("id") ON DELETE CASCADE ON UPDATE CASCADE;
-- AddForeignKey
ALTER TABLE "events"."event_slot_links"
ADD CONSTRAINT "event_slot_links_slot_id_fkey" FOREIGN KEY ("slot_id") REFERENCES "events"."event_slots"("id") ON DELETE CASCADE ON UPDATE CASCADE;
-- AddForeignKey
ALTER TABLE "events"."payment_options"
ADD CONSTRAINT "payment_options_slot_id_fkey" FOREIGN KEY ("slot_id") REFERENCES "events"."event_slots"("id") ON DELETE CASCADE ON UPDATE CASCADE;
-- AddForeignKey
ALTER TABLE "events"."event_slot_participants"
ADD CONSTRAINT "event_slot_participants_slot_id_fkey" FOREIGN KEY ("slot_id") REFERENCES "events"."event_slots"("id") ON DELETE CASCADE ON UPDATE CASCADE;
-- AddForeignKey
ALTER TABLE "events"."event_slot_participants"
ADD CONSTRAINT "event_slot_participants_profile_id_fkey" FOREIGN KEY ("profile_id") REFERENCES "profiles"."profiles"("id") ON DELETE CASCADE ON UPDATE CASCADE;
-- AddForeignKey
ALTER TABLE "events"."event_slot_dance_styles"
ADD CONSTRAINT "event_slot_dance_styles_event_slot_id_fkey" FOREIGN KEY ("event_slot_id") REFERENCES "events"."event_slots"("id") ON DELETE CASCADE ON UPDATE CASCADE;
-- AddForeignKey
ALTER TABLE "events"."event_slot_dance_styles"
ADD CONSTRAINT "event_slot_dance_styles_dance_style_id_fkey" FOREIGN KEY ("dance_style_id") REFERENCES "events"."dance_styles"("id") ON DELETE CASCADE ON UPDATE CASCADE;
-- AddForeignKey
ALTER TABLE "events"."dance_style_images"
ADD CONSTRAINT "dance_style_images_dance_style_id_fkey" FOREIGN KEY ("dance_style_id") REFERENCES "events"."dance_styles"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
-- AddForeignKey
ALTER TABLE "events"."dance_style_images"
ADD CONSTRAINT "dance_style_images_image_id_fkey" FOREIGN KEY ("image_id") REFERENCES "storage"."images"("id") ON DELETE CASCADE ON UPDATE CASCADE;
