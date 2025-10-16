/*
  Warnings:

  - You are about to drop the column `aboutId` on the `AboutListItem` table. All the data in the column will be lost.
  - You are about to drop the column `title` on the `AboutListItem` table. All the data in the column will be lost.
  - Added the required column `aboutListId` to the `AboutListItem` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "public"."AboutListItem" DROP CONSTRAINT "AboutListItem_aboutId_fkey";

-- AlterTable
ALTER TABLE "About" ALTER COLUMN "aboutImage" DROP NOT NULL;

-- AlterTable
ALTER TABLE "AboutListItem" DROP COLUMN "aboutId",
DROP COLUMN "title",
ADD COLUMN     "aboutListId" TEXT NOT NULL;

-- CreateTable
CREATE TABLE "AboutList" (
    "id" TEXT NOT NULL,
    "aboutId" TEXT NOT NULL,
    "title" TEXT NOT NULL,

    CONSTRAINT "AboutList_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "AboutList" ADD CONSTRAINT "AboutList_aboutId_fkey" FOREIGN KEY ("aboutId") REFERENCES "About"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AboutListItem" ADD CONSTRAINT "AboutListItem_aboutListId_fkey" FOREIGN KEY ("aboutListId") REFERENCES "AboutList"("id") ON DELETE CASCADE ON UPDATE CASCADE;
