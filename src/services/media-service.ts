// src/services/media-service.ts
import { prisma } from "@/lib/prisma";
import { uploadToCloudinary, deleteFromCloudinary, deleteFolderFromCloudinary } from "@/lib/cloudinary";
import { MediaType, ReferenceType } from "@prisma/client";
import fs from "fs/promises";
import path from "path";
import os from "os";
import { randomUUID } from "crypto";

export interface UploadOptions {
  file: File;
  referenceType: ReferenceType;
  referenceId?: string;
  folder?: string;
  maxSize?: number; // in bytes
}

export interface DeleteOptions {
  referenceType: ReferenceType;
  referenceId?: string;
  url?: string;
}

export class MediaService {
  /**
   * Upload a file and create media record, with automatic cleanup of existing media
   * Use this for single-use images like avatar, hero background, etc.
   */
  static async uploadWithCleanup(
    options: UploadOptions & { userId: string }
  ): Promise<{ success: true; url: string; mediaId: string } | { success: false; error: string }> {
    try {
      const { file, referenceType, referenceId, folder, maxSize = 10 * 1024 * 1024, userId } = options;

      // Validate file
      if (!file.type.startsWith("image/") && !file.type.startsWith("video/")) {
        return { success: false, error: "Please upload an image or video file" };
      }

      if (file.size > maxSize) {
        return { success: false, error: `File size must be less than ${maxSize / 1024 / 1024}MB` };
      }

      // Get user with media usage
      const user = await prisma.user.findFirst({
        include: {
          mediaUsage: {
            include: {
              media: true,
            },
          },
        },
        where: { id: userId },
      });

      if (!user) {
        return { success: false, error: "User not found" };
      }

      // Check storage limit
      if (user.mediaUsage) {
        const currentUsedBytes = user.mediaUsage.media.reduce((sum, media) => sum + media.bytes, BigInt(0));
        const totalAfterUpload = currentUsedBytes + BigInt(file.size);

        if (totalAfterUpload > user.mediaUsage.allocatedBytes) {
          return {
            success: false,
            error: "Upload blocked: storage limit exceeded",
          };
        }
      }

      // Convert file to buffer
      const arrayBuffer = await file.arrayBuffer();
      const buffer = Buffer.from(arrayBuffer);
      const tempDir = await fs.mkdtemp(path.join(os.tmpdir(), "upload-"));
      const tempFilePath = path.join(tempDir, file.name);
      await fs.writeFile(tempFilePath, buffer);

      // Delete existing media for this reference
      await this.deleteExistingMedia({
        referenceType,
        referenceId,
        userId,
      });

      // Determine folder and resource type
      const mediaType: MediaType = file.type.startsWith("video") ? MediaType.VIDEO : MediaType.IMAGE;
      const resourceType = mediaType === MediaType.VIDEO ? "video" : "image";
      const uploadFolder = folder || `elvora/${referenceType.toLowerCase()}/${resourceType}`;

      // Upload to Cloudinary
      const result = await uploadToCloudinary(tempFilePath, uploadFolder, resourceType);
      await fs.unlink(tempFilePath);

      const bytes = BigInt(result.bytes || buffer.byteLength);

      // Create media record
      const media = await prisma.media.create({
        data: {
          url: result.url,
          publicId: result.publicId,
          bytes,
          mediaType,
          referenceType,
          referenceId,
          usageId: user.mediaUsage?.id,
        },
      });

      return {
        success: true,
        url: result.url,
        mediaId: media.id,
      };
    } catch (error) {
      console.error("Media upload error:", error);
      return { success: false, error: "Failed to upload media" };
    }
  }

  /**
   * Upload a file without deleting existing media
   * Use this for multiple images like portfolio, blog images, etc.
   */
  static async uploadWithoutCleanup(
    options: UploadOptions & { userId: string }
  ): Promise<{ success: true; url: string; mediaId: string } | { success: false; error: string }> {
    try {
      const { file, referenceType, referenceId, folder, maxSize = 10 * 1024 * 1024, userId } = options;

      // Validate file
      if (!file.type.startsWith("image/") && !file.type.startsWith("video/")) {
        return { success: false, error: "Please upload an image or video file" };
      }

      if (file.size > maxSize) {
        return { success: false, error: `File size must be less than ${maxSize / 1024 / 1024}MB` };
      }

      // Get user with media usage
      const user = await prisma.user.findFirst({
        include: {
          mediaUsage: {
            include: {
              media: true,
            },
          },
        },
        where: { id: userId },
      });

      if (!user) {
        return { success: false, error: "User not found" };
      }

      // Check storage limit
      if (user.mediaUsage) {
        const currentUsedBytes = user.mediaUsage.media.reduce((sum, media) => sum + media.bytes, BigInt(0));
        const totalAfterUpload = currentUsedBytes + BigInt(file.size);

        if (totalAfterUpload > user.mediaUsage.allocatedBytes) {
          return {
            success: false,
            error: "Upload blocked: storage limit exceeded",
          };
        }
      }

      // Convert file to buffer
      const arrayBuffer = await file.arrayBuffer();
      const buffer = Buffer.from(arrayBuffer);
      const tempDir = await fs.mkdtemp(path.join(os.tmpdir(), "upload-"));
      const tempFilePath = path.join(tempDir, file.name);
      await fs.writeFile(tempFilePath, buffer);

      // Determine folder and resource type
      const mediaType: MediaType = file.type.startsWith("video") ? MediaType.VIDEO : MediaType.IMAGE;
      const resourceType = mediaType === MediaType.VIDEO ? "video" : "image";
      const uploadFolder = folder || `elvora/${referenceType.toLowerCase()}/${resourceType}`;

      // Upload to Cloudinary
      const result = await uploadToCloudinary(tempFilePath, uploadFolder, resourceType);
      await fs.unlink(tempFilePath);

      const bytes = BigInt(result.bytes || buffer.byteLength);

      // Create media record
      const media = await prisma.media.create({
        data: {
          url: result.url,
          publicId: result.publicId,
          bytes,
          mediaType,
          referenceType,
          referenceId,
          usageId: user.mediaUsage?.id,
        },
      });

      return {
        success: true,
        url: result.url,
        mediaId: media.id,
      };
    } catch (error) {
      console.error("Media upload error:", error);
      return { success: false, error: "Failed to upload media" };
    }
  }

  /**
   * Delete existing media for a reference
   */
  static async deleteExistingMedia(options: DeleteOptions & { userId: string }): Promise<void> {
    try {
      const { referenceType, referenceId, url, userId } = options;

      // Find existing media records
      const whereClause: { referenceType: ReferenceType; referenceId?: string; url?: string } = { referenceType };

      if (referenceId) {
        whereClause.referenceId = referenceId;
      }

      if (url) {
        whereClause.url = url;
      }

      // Also include media that might be associated with the user's mediaUsage
      const existingMedia = await prisma.media.findMany({
        where: {
          ...whereClause,
          usage: {
            userId: userId,
          },
        },
      });

      // Delete each media record and its Cloudinary file
      for (const media of existingMedia) {
        if (media.publicId) {
          try {
            const resourceType = media.mediaType === MediaType.VIDEO ? "video" : "image";
            await deleteFromCloudinary(media.publicId, resourceType);
          } catch (deleteError) {
            console.warn("Failed to delete from Cloudinary:", deleteError);
          }
        }

        await prisma.media.delete({
          where: { id: media.id },
        });
      }
    } catch (error) {
      console.error("Media deletion error:", error);
      throw error;
    }
  }

  /**
   * Delete specific media by ID
   */
  static async deleteMediaById(mediaId: string, userId: string): Promise<{ success: boolean; error?: string }> {
    try {
      const media = await prisma.media.findFirst({
        where: {
          id: mediaId,
          usage: {
            userId: userId,
          },
        },
      });

      if (!media) {
        return { success: false, error: "Media not found" };
      }

      // Delete from Cloudinary if publicId exists
      if (media.publicId) {
        try {
          const resourceType = media.mediaType === MediaType.VIDEO ? "video" : "image";
          await deleteFromCloudinary(media.publicId, resourceType);
        } catch (deleteError) {
          console.warn("Failed to delete from Cloudinary:", deleteError);
        }
      }

      // Delete from database
      await prisma.media.delete({
        where: { id: mediaId },
      });

      return { success: true };
    } catch (error) {
      console.error("Media deletion error:", error);
      return { success: false, error: "Failed to delete media" };
    }
  }

  /**
   * Find media by URL
   */
  static async findMediaByUrl(url: string, userId: string) {
    return prisma.media.findFirst({
      where: {
        url,
        usage: {
          userId: userId,
        },
      },
    });
  }

  /**
   * Get all media for a specific reference
   */
  static async getMediaByReference(referenceType: ReferenceType, referenceId: string, userId: string) {
    return prisma.media.findMany({
      where: {
        referenceType,
        referenceId,
        usage: {
          userId: userId,
        },
      },
      orderBy: {
        createdAt: "desc",
      },
    });
  }

  /**
   * Upload multiple files temporarily.
   * Folder: elvora/temp/{referenceType}/{userId}/{timestamp}
   * Saves media with referenceId = "temp-{uuid}"
   */
  static async uploadTemporaryMedia({
    files,
    referenceType,
    userId,
    maxSize = 10 * 1024 * 1024,
  }: {
    files: File[];
    referenceType: ReferenceType;
    userId: string;
    maxSize?: number;
  }) {
    try {
      const timestamp = Date.now();
      const tempFolder = `elvora/temp/${referenceType.toLowerCase()}/${userId}/${timestamp}`;
      const uploadedMedia = [];

      for (const file of files) {
        if (!file.type.startsWith("image/")) {
          continue; // Only images allowed for temp upload
        }

        if (file.size > maxSize) {
          throw new Error(`File ${file.name} exceeds ${maxSize / 1024 / 1024}MB limit`);
        }

        const arrayBuffer = await file.arrayBuffer();
        const buffer = Buffer.from(arrayBuffer);
        const tempDir = await fs.mkdtemp(path.join(os.tmpdir(), "upload-"));
        const tempFilePath = path.join(tempDir, file.name);
        await fs.writeFile(tempFilePath, buffer);

        const result = await uploadToCloudinary(tempFilePath, tempFolder, "image");
        await fs.unlink(tempFilePath);

        const media = await prisma.media.create({
          data: {
            url: result.url,
            publicId: result.publicId,
            bytes: BigInt(result.bytes || buffer.byteLength),
            mediaType: MediaType.IMAGE,
            referenceType,
            referenceId: `temp-${randomUUID()}`, // Now using the imported randomUUID
            usage: {
              connect: { userId },
            },
          },
        });

        uploadedMedia.push(media);
      }

      return { success: true, uploadedMedia };
    } catch (error) {
      console.error("Temporary upload error:", error);
      return { success: false, error: "Failed to upload temporary media" };
    }
  }

  /**
   * Move temporary images to permanent folder and create portfolio image records
   */
  static async moveTempImagesToPermanent({
    userId,
    referenceType,
    portfolioType,
    title,
    portfolioId,
  }: {
    userId: string;
    referenceType: ReferenceType;
    portfolioType: string;
    title: string;
    portfolioId: string;
  }) {
    try {
      const tempMedia = await prisma.media.findMany({
        where: {
          referenceType,
          referenceId: { startsWith: "temp-" },
          usage: { userId },
        },
      });

      if (!tempMedia.length) return { success: false, error: "No temporary images found" };

      const permanentFolder = `elvora/${referenceType.toLowerCase()}/${portfolioType.toLowerCase()}/${title}`;
      const portfolioImages = [];

      for (let i = 0; i < tempMedia.length; i++) {
        const media = tempMedia[i];

        // Upload to permanent folder (Cloudinary will handle the file)
        const result = await uploadToCloudinary(media.url, permanentFolder, "image");

        // Delete old temporary version from Cloudinary
        if (media.publicId) {
          try {
            await deleteFromCloudinary(media.publicId, "image");
          } catch (deleteError) {
            console.warn("Failed to delete temp image from Cloudinary:", deleteError);
          }
        }

        // Create formatted reference ID: portfolio-{title}-{number}
        const formattedReferenceId = `portfolio-${title.replace(/\s+/g, "-")}-${i + 1}`;

        // Update database record with new permanent reference
        await prisma.media.update({
          where: { id: media.id },
          data: {
            url: result.url,
            publicId: result.publicId,
            referenceId: formattedReferenceId, // Use formatted reference ID
          },
        });

        // Create portfolio image record
        const portfolioImage = await prisma.portfolioImage.create({
          data: {
            url: result.url,
            portfolioId: portfolioId,
          },
        });

        portfolioImages.push(portfolioImage);
      }

      return { success: true, portfolioImages };
    } catch (error) {
      console.error("Move temp images error:", error);
      return { success: false, error: "Failed to move temporary images" };
    }
  }
  /**
   * Delete all media belonging to a specific folder and user.
   * Automatically clears from DB.
   */
  static async deleteFolderMedia({ userId, referenceType, folderPath }: { userId: string; referenceType: ReferenceType; folderPath: string }) {
    try {
      // Delete folder from Cloudinary
      await deleteFolderFromCloudinary(folderPath);

      // Delete from DB
      await prisma.media.deleteMany({
        where: {
          referenceType,
          url: { contains: folderPath },
          usage: { userId },
        },
      });

      return { success: true };
    } catch (error) {
      console.error("Delete folder media error:", error);
      return { success: false, error: "Failed to delete folder media" };
    }
  }

  /**
   * Clean up orphaned temporary images (temp images that weren't attached to any portfolio)
   * @param userId - User ID
   * @param referenceType - Type of reference (PORTFOLIO, BLOG, etc.)
   * @param immediate - If true, delete all temp images regardless of age. If false, only delete images older than 1 hour.
   */
  static async cleanupOrphanedTempImages(userId: string, referenceType: ReferenceType, immediate: boolean = false) {
    try {
      // Build where clause
      const whereClause: {
        referenceType: ReferenceType;
        referenceId: { startsWith: string };
        usage: { userId: string };
        createdAt?: { lt: Date };
      } = {
        referenceType,
        referenceId: { startsWith: "temp-" },
        usage: { userId },
      };

      // Only add time filter if not immediate cleanup
      if (!immediate) {
        const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000);
        whereClause.createdAt = { lt: oneHourAgo };
      }

      const orphanedTempMedia = await prisma.media.findMany({
        where: whereClause,
      });

      for (const media of orphanedTempMedia) {
        if (media.publicId) {
          try {
            await deleteFromCloudinary(media.publicId, "image");
          } catch (deleteError) {
            console.warn("Failed to delete orphaned temp image from Cloudinary:", deleteError);
          }
        }
        await prisma.media.delete({
          where: { id: media.id },
        });
      }

      return { success: true, deletedCount: orphanedTempMedia.length };
    } catch (error) {
      console.error("Cleanup orphaned temp images error:", error);
      return { success: false, error: "Failed to cleanup orphaned temporary images" };
    }
  }
  /**
   * Move temporary images to permanent folder and create blog image records
   */
  static async moveTempImagesToBlog({
    userId,
    referenceType,
    title,
    blogId,
  }: {
    userId: string;
    referenceType: ReferenceType;
    title: string;
    blogId: string;
  }) {
    try {
      const tempMedia = await prisma.media.findMany({
        where: {
          referenceType,
          referenceId: { startsWith: "temp-" },
          usage: { userId },
        },
      });

      if (!tempMedia.length) return { success: false, error: "No temporary images found" };

      const permanentFolder = `elvora/${referenceType.toLowerCase()}/${title}`;
      const blogImages = [];

      for (let i = 0; i < tempMedia.length; i++) {
        const media = tempMedia[i];

        // Upload to permanent folder (Cloudinary will handle the file)
        const result = await uploadToCloudinary(media.url, permanentFolder, "image");

        // Delete old temporary version from Cloudinary
        if (media.publicId) {
          try {
            await deleteFromCloudinary(media.publicId, "image");
          } catch (deleteError) {
            console.warn("Failed to delete temp image from Cloudinary:", deleteError);
          }
        }

        // Create formatted reference ID: blog-{title}-{number}
        const formattedReferenceId = `blog-${title.replace(/\s+/g, "-")}-${i + 1}`;

        // Update database record with new permanent reference
        await prisma.media.update({
          where: { id: media.id },
          data: {
            url: result.url,
            publicId: result.publicId,
            referenceId: formattedReferenceId,
          },
        });

        // Create blog image record
        const blogImage = await prisma.blogImage.create({
          data: {
            url: result.url,
            blogId: blogId,
          },
        });

        blogImages.push(blogImage);
      }

      return { success: true, blogImages };
    } catch (error) {
      console.error("Move temp images to blog error:", error);
      return { success: false, error: "Failed to move temporary images to blog" };
    }
  }
}
