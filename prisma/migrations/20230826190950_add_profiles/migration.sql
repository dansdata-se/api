-- CreateEnum
CREATE TYPE "profiles"."profile_type" AS ENUM ('organization', 'individual', 'venue');
-- CreateEnum
CREATE TYPE "storage"."image_variant" AS ENUM ('cover', 'poster', 'square');
-- CreateTable
CREATE TABLE "profiles"."profiles" (
    "id" TEXT NOT NULL,
    "type" "profiles"."profile_type" NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "created_at" TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    CONSTRAINT "profiles_pkey" PRIMARY KEY ("id")
);
-- CreateTable
CREATE TABLE "profiles"."profile_images" (
    "profile_id" TEXT NOT NULL,
    "image_id" TEXT NOT NULL,
    CONSTRAINT "profile_images_pkey" PRIMARY KEY ("profile_id", "image_id")
);
-- CreateTable
CREATE TABLE "profiles"."profile_links" (
    "id" SERIAL NOT NULL,
    "profile_id" TEXT NOT NULL,
    "url" TEXT NOT NULL,
    CONSTRAINT "profile_links_pkey" PRIMARY KEY ("id")
);
-- CreateTable
CREATE TABLE "profiles"."organizations" (
    "profile_id" TEXT NOT NULL,
    "tags" "profiles"."organization_tag" [],
    CONSTRAINT "organizations_pkey" PRIMARY KEY ("profile_id")
);
-- CreateTable
CREATE TABLE "profiles"."individuals" (
    "profile_id" TEXT NOT NULL,
    "tags" "profiles"."individual_tag" [],
    CONSTRAINT "individuals_pkey" PRIMARY KEY ("profile_id")
);
-- CreateTable
CREATE TABLE "profiles"."venues" (
    "profile_id" TEXT NOT NULL,
    "parent_id" TEXT,
    "coords" geography(Point, 4326) NOT NULL,
    "permanentlyClosed" BOOLEAN NOT NULL DEFAULT false,
    CONSTRAINT "venues_pkey" PRIMARY KEY ("profile_id")
);
-- CreateTable
CREATE TABLE "profiles"."organization_members" (
    "id" SERIAL NOT NULL,
    "organization_id" TEXT NOT NULL,
    "individual_id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    CONSTRAINT "organization_members_pkey" PRIMARY KEY ("id")
);
-- CreateTable
CREATE TABLE "storage"."images" (
    "id" TEXT NOT NULL,
    "cloudflare_id" TEXT NOT NULL,
    "variant" "storage"."image_variant" NOT NULL,
    CONSTRAINT "images_pkey" PRIMARY KEY ("id")
);
-- CreateIndex
CREATE INDEX "profiles_name_idx" ON "profiles"."profiles" USING GIN ("name" gin_trgm_ops);
-- CreateIndex
CREATE INDEX "profile_images_profile_id_idx" ON "profiles"."profile_images"("profile_id");
-- CreateIndex
CREATE INDEX "profile_images_image_id_idx" ON "profiles"."profile_images"("image_id");
-- CreateIndex
CREATE INDEX "profile_links_profile_id_idx" ON "profiles"."profile_links"("profile_id");
-- CreateIndex
CREATE UNIQUE INDEX "profile_links_profile_id_url_key" ON "profiles"."profile_links"("profile_id", "url");
-- CreateIndex
CREATE INDEX "organizations_tags_idx" ON "profiles"."organizations" USING GIN ("tags");
-- CreateIndex
CREATE INDEX "individuals_tags_idx" ON "profiles"."individuals" USING GIN ("tags");
-- CreateIndex
CREATE INDEX "venues_coords_idx" ON "profiles"."venues" USING GIST ("coords");
-- CreateIndex
CREATE UNIQUE INDEX "images_cloudflare_id_key" ON "storage"."images"("cloudflare_id");
-- CreateIndex
CREATE INDEX "images_cloudflare_id_idx" ON "storage"."images"("cloudflare_id");
-- AddForeignKey
ALTER TABLE "profiles"."profile_images"
ADD CONSTRAINT "profile_images_profile_id_fkey" FOREIGN KEY ("profile_id") REFERENCES "profiles"."profiles"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
-- AddForeignKey
ALTER TABLE "profiles"."profile_images"
ADD CONSTRAINT "profile_images_image_id_fkey" FOREIGN KEY ("image_id") REFERENCES "storage"."images"("id") ON DELETE CASCADE ON UPDATE CASCADE;
-- AddForeignKey
ALTER TABLE "profiles"."profile_links"
ADD CONSTRAINT "profile_links_profile_id_fkey" FOREIGN KEY ("profile_id") REFERENCES "profiles"."profiles"("id") ON DELETE CASCADE ON UPDATE CASCADE;
-- AddForeignKey
ALTER TABLE "profiles"."organizations"
ADD CONSTRAINT "organizations_profile_id_fkey" FOREIGN KEY ("profile_id") REFERENCES "profiles"."profiles"("id") ON DELETE CASCADE ON UPDATE CASCADE;
-- AddForeignKey
ALTER TABLE "profiles"."individuals"
ADD CONSTRAINT "individuals_profile_id_fkey" FOREIGN KEY ("profile_id") REFERENCES "profiles"."profiles"("id") ON DELETE CASCADE ON UPDATE CASCADE;
-- AddForeignKey
ALTER TABLE "profiles"."venues"
ADD CONSTRAINT "venues_profile_id_fkey" FOREIGN KEY ("profile_id") REFERENCES "profiles"."profiles"("id") ON DELETE CASCADE ON UPDATE CASCADE;
-- AddForeignKey
ALTER TABLE "profiles"."venues"
ADD CONSTRAINT "venues_parent_id_fkey" FOREIGN KEY ("parent_id") REFERENCES "profiles"."venues"("profile_id") ON DELETE
SET NULL ON UPDATE CASCADE;
-- AddForeignKey
ALTER TABLE "profiles"."organization_members"
ADD CONSTRAINT "organization_members_organization_id_fkey" FOREIGN KEY ("organization_id") REFERENCES "profiles"."organizations"("profile_id") ON DELETE CASCADE ON UPDATE CASCADE;
-- AddForeignKey
ALTER TABLE "profiles"."organization_members"
ADD CONSTRAINT "organization_members_individual_id_fkey" FOREIGN KEY ("individual_id") REFERENCES "profiles"."individuals"("profile_id") ON DELETE CASCADE ON UPDATE CASCADE;
