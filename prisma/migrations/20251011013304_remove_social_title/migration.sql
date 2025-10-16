/*
  Warnings:

  - You are about to drop the `MetaTag` table. If the table is not empty, all the data it contains will be lost.

*/
-- AlterTable
ALTER TABLE "SiteSettings" ADD COLUMN     "keywords" TEXT,
ADD COLUMN     "ogDescription" TEXT,
ADD COLUMN     "ogTitle" TEXT,
ADD COLUMN     "socialImage" TEXT;

-- DropTable
DROP TABLE "public"."MetaTag";
