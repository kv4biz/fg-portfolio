/*
  Warnings:

  - You are about to drop the column `tagline` on the `SiteSettings` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "SiteSettings" DROP COLUMN "tagline",
ADD COLUMN     "logoText" TEXT,
ADD COLUMN     "logoType" TEXT NOT NULL DEFAULT 'text';
