/*
  Warnings:

  - You are about to drop the column `aboutListId` on the `AboutListItem` table. All the data in the column will be lost.
  - A unique constraint covering the columns `[userId]` on the table `About` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[userId]` on the table `ContactInfo` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[userId]` on the table `Hero` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[userId]` on the table `MediaUsage` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[userId]` on the table `SiteSettings` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `userId` to the `About` table without a default value. This is not possible if the table is not empty.
  - Added the required column `listId` to the `AboutListItem` table without a default value. This is not possible if the table is not empty.
  - Added the required column `userId` to the `Blog` table without a default value. This is not possible if the table is not empty.
  - Added the required column `userId` to the `ContactInfo` table without a default value. This is not possible if the table is not empty.
  - Added the required column `userId` to the `Hero` table without a default value. This is not possible if the table is not empty.
  - Added the required column `userId` to the `MediaUsage` table without a default value. This is not possible if the table is not empty.
  - Added the required column `userId` to the `Message` table without a default value. This is not possible if the table is not empty.
  - Added the required column `updatedAt` to the `Portfolio` table without a default value. This is not possible if the table is not empty.
  - Added the required column `userId` to the `Portfolio` table without a default value. This is not possible if the table is not empty.
  - Added the required column `userId` to the `Service` table without a default value. This is not possible if the table is not empty.
  - Added the required column `userId` to the `SiteSettings` table without a default value. This is not possible if the table is not empty.
  - Added the required column `userId` to the `SocialLink` table without a default value. This is not possible if the table is not empty.
  - Added the required column `updatedAt` to the `Testimonial` table without a default value. This is not possible if the table is not empty.
  - Added the required column `userId` to the `Testimonial` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "public"."AboutListItem" DROP CONSTRAINT "AboutListItem_aboutListId_fkey";

-- AlterTable
ALTER TABLE "About" ADD COLUMN     "userId" TEXT NOT NULL;

-- AlterTable
ALTER TABLE "AboutList" ALTER COLUMN "title" DROP NOT NULL;

-- AlterTable
ALTER TABLE "AboutListItem" DROP COLUMN "aboutListId",
ADD COLUMN     "listId" TEXT NOT NULL;

-- AlterTable
ALTER TABLE "Blog" ADD COLUMN     "userId" TEXT NOT NULL;

-- AlterTable
ALTER TABLE "ContactInfo" ADD COLUMN     "userId" TEXT NOT NULL;

-- AlterTable
ALTER TABLE "Hero" ADD COLUMN     "userId" TEXT NOT NULL;

-- AlterTable
ALTER TABLE "MediaUsage" ADD COLUMN     "userId" TEXT NOT NULL;

-- AlterTable
ALTER TABLE "Message" ADD COLUMN     "userId" TEXT NOT NULL;

-- AlterTable
ALTER TABLE "Portfolio" ADD COLUMN     "updatedAt" TIMESTAMP(3) NOT NULL,
ADD COLUMN     "userId" TEXT NOT NULL;

-- AlterTable
ALTER TABLE "Service" ADD COLUMN     "userId" TEXT NOT NULL;

-- AlterTable
ALTER TABLE "SiteSettings" ADD COLUMN     "userId" TEXT NOT NULL;

-- AlterTable
ALTER TABLE "SocialLink" ADD COLUMN     "userId" TEXT NOT NULL;

-- AlterTable
ALTER TABLE "Testimonial" ADD COLUMN     "updatedAt" TIMESTAMP(3) NOT NULL,
ADD COLUMN     "userId" TEXT NOT NULL;

-- CreateIndex
CREATE UNIQUE INDEX "About_userId_key" ON "About"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "ContactInfo_userId_key" ON "ContactInfo"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "Hero_userId_key" ON "Hero"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "MediaUsage_userId_key" ON "MediaUsage"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "SiteSettings_userId_key" ON "SiteSettings"("userId");

-- AddForeignKey
ALTER TABLE "SiteSettings" ADD CONSTRAINT "SiteSettings_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SocialLink" ADD CONSTRAINT "SocialLink_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ContactInfo" ADD CONSTRAINT "ContactInfo_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Hero" ADD CONSTRAINT "Hero_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "About" ADD CONSTRAINT "About_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AboutListItem" ADD CONSTRAINT "AboutListItem_listId_fkey" FOREIGN KEY ("listId") REFERENCES "AboutList"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Portfolio" ADD CONSTRAINT "Portfolio_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Service" ADD CONSTRAINT "Service_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Testimonial" ADD CONSTRAINT "Testimonial_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Blog" ADD CONSTRAINT "Blog_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Message" ADD CONSTRAINT "Message_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "MediaUsage" ADD CONSTRAINT "MediaUsage_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
