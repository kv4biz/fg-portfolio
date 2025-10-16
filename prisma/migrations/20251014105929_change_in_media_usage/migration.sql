/*
  Warnings:

  - You are about to drop the column `imageCount` on the `MediaUsage` table. All the data in the column will be lost.
  - You are about to drop the column `usedBytes` on the `MediaUsage` table. All the data in the column will be lost.
  - You are about to drop the column `videoCount` on the `MediaUsage` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "MediaUsage" DROP COLUMN "imageCount",
DROP COLUMN "usedBytes",
DROP COLUMN "videoCount";
