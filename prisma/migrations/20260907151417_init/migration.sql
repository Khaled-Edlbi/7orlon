-- CreateEnum
CREATE TYPE "Locale" AS ENUM ('en', 'ar');

-- CreateEnum
CREATE TYPE "Plate" AS ENUM ('mint', 'blush', 'butter', 'leaf', 'jade');

-- CreateTable
CREATE TABLE "Painting" (
    "id" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "position" INTEGER NOT NULL,
    "plate" "Plate" NOT NULL,
    "priceCents" BIGINT NOT NULL,
    "inStock" BOOLEAN NOT NULL DEFAULT true,
    "imageUrl" TEXT,
    "imageWidth" INTEGER,
    "imageHeight" INTEGER,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Painting_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "PaintingTranslation" (
    "id" TEXT NOT NULL,
    "paintingId" TEXT NOT NULL,
    "locale" "Locale" NOT NULL,
    "title" TEXT NOT NULL,
    "meta" TEXT NOT NULL,
    "description" TEXT NOT NULL,

    CONSTRAINT "PaintingTranslation_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Enquiry" (
    "id" TEXT NOT NULL,
    "paintingId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "message" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Enquiry_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "HeroSlide" (
    "id" TEXT NOT NULL,
    "position" INTEGER NOT NULL,
    "imageUrl" TEXT NOT NULL,
    "imageWidth" INTEGER NOT NULL,
    "imageHeight" INTEGER NOT NULL,
    "altEn" TEXT NOT NULL,
    "altAr" TEXT NOT NULL,

    CONSTRAINT "HeroSlide_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ArtistProfile" (
    "id" TEXT NOT NULL DEFAULT 'default',
    "portraitUrl" TEXT,
    "portraitWidth" INTEGER,
    "portraitHeight" INTEGER,
    "email" TEXT NOT NULL,
    "instagramUrl" TEXT NOT NULL,
    "pinterestUrl" TEXT NOT NULL,
    "behanceUrl" TEXT NOT NULL,

    CONSTRAINT "ArtistProfile_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "StudioPhoto" (
    "id" TEXT NOT NULL,
    "profileId" TEXT NOT NULL,
    "position" INTEGER NOT NULL,
    "imageUrl" TEXT NOT NULL,
    "imageWidth" INTEGER NOT NULL,
    "imageHeight" INTEGER NOT NULL,
    "captionEn" TEXT NOT NULL,
    "captionAr" TEXT NOT NULL,

    CONSTRAINT "StudioPhoto_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Milestone" (
    "id" TEXT NOT NULL,
    "profileId" TEXT NOT NULL,
    "year" INTEGER NOT NULL,
    "textEn" TEXT NOT NULL,
    "textAr" TEXT NOT NULL,

    CONSTRAINT "Milestone_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Painting_slug_key" ON "Painting"("slug");

-- CreateIndex
CREATE UNIQUE INDEX "Painting_position_key" ON "Painting"("position");

-- CreateIndex
CREATE INDEX "Painting_position_idx" ON "Painting"("position");

-- CreateIndex
CREATE UNIQUE INDEX "PaintingTranslation_paintingId_locale_key" ON "PaintingTranslation"("paintingId", "locale");

-- CreateIndex
CREATE INDEX "Enquiry_createdAt_idx" ON "Enquiry"("createdAt");

-- CreateIndex
CREATE UNIQUE INDEX "Enquiry_paintingId_email_key" ON "Enquiry"("paintingId", "email");

-- CreateIndex
CREATE UNIQUE INDEX "HeroSlide_position_key" ON "HeroSlide"("position");

-- CreateIndex
CREATE UNIQUE INDEX "StudioPhoto_profileId_position_key" ON "StudioPhoto"("profileId", "position");

-- CreateIndex
CREATE INDEX "Milestone_year_idx" ON "Milestone"("year");

-- AddForeignKey
ALTER TABLE "PaintingTranslation" ADD CONSTRAINT "PaintingTranslation_paintingId_fkey" FOREIGN KEY ("paintingId") REFERENCES "Painting"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Enquiry" ADD CONSTRAINT "Enquiry_paintingId_fkey" FOREIGN KEY ("paintingId") REFERENCES "Painting"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "StudioPhoto" ADD CONSTRAINT "StudioPhoto_profileId_fkey" FOREIGN KEY ("profileId") REFERENCES "ArtistProfile"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Milestone" ADD CONSTRAINT "Milestone_profileId_fkey" FOREIGN KEY ("profileId") REFERENCES "ArtistProfile"("id") ON DELETE CASCADE ON UPDATE CASCADE;
