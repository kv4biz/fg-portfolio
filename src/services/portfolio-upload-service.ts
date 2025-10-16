// src/services/portfolio-upload-service.ts
import { MediaService } from "./media-service";
import { ReferenceType, PortfolioType } from "@prisma/client";
import { TempStorageService } from "./temp-storage-service";

export class PortfolioUploadService {
  /**
   * Upload multiple images for a portfolio item
   */
  static async uploadPortfolioImages(
    files: File[],
    portfolioId: string,
    portfolioType: PortfolioType,
    userId: string
  ): Promise<{ success: boolean; images?: { id: string; url: string }[]; error?: string }> {
    try {
      const uploadedImages: { id: string; url: string }[] = [];

      for (const file of files) {
        const result = await MediaService.uploadWithoutCleanup({
          file,
          referenceType: ReferenceType.PORTFOLIO,
          referenceId: portfolioId,
          folder: `elvora/portfolio/${portfolioType.toLowerCase()}`,
          maxSize: 10 * 1024 * 1024,
          userId,
        });

        if (!result.success) {
          return { success: false, error: result.error };
        }

        uploadedImages.push({ id: result.mediaId, url: result.url });
      }

      return { success: true, images: uploadedImages };
    } catch (error) {
      console.error("Portfolio batch upload error:", error);
      return { success: false, error: "Failed to upload portfolio images" };
    }
  }

  /**
   * Store files temporarily before portfolio creation
   */
  static storeTempFiles(tempId: string, files: File[]) {
    TempStorageService.addFiles(tempId, files);
  }

  /**
   * Get stored temporary files
   */
  static getTempFiles(tempId: string): File[] {
    return TempStorageService.getFiles(tempId);
  }

  /**
   * Clear temporary files
   */
  static clearTempFiles(tempId: string) {
    TempStorageService.clearFiles(tempId);
  }

  /**
   * Remove specific temporary file
   */
  static removeTempFile(tempId: string, fileIndex: number) {
    TempStorageService.removeFile(tempId, fileIndex);
  }
}
