// src/lib/cloudinary.ts
import { v2 as cloudinary } from "cloudinary";

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
  secure: true,
});

/**
 * Upload a file to Cloudinary.
 * Always returns secure URL, public ID, bytes, and resource type.
 */
export async function uploadToCloudinary(filePath: string, folder?: string, resourceType: "image" | "video" | "auto" = "auto") {
  const result = await cloudinary.uploader.upload(filePath, {
    folder,
    resource_type: resourceType,
  });

  return {
    url: result.secure_url,
    publicId: result.public_id,
    bytes: result.bytes,
    type: result.resource_type,
  };
}

/**
 * Delete a file from Cloudinary by its public ID.
 * Automatically detects resource type.
 */
export async function deleteFromCloudinary(publicId: string, resourceType: "image" | "video" | "raw" = "image") {
  try {
    const res = await cloudinary.uploader.destroy(publicId, {
      resource_type: resourceType,
    });
    return res;
  } catch (err) {
    console.error("[Cloudinary delete error]", err);
    throw err;
  }
}
export async function deleteFolderFromCloudinary(folderPath: string): Promise<void> {
  try {
    // Cloudinary API for deleting folders and their contents
    // Note: This might require additional setup based on your Cloudinary plan
    const result = await cloudinary.api.delete_folder(folderPath);
    return result;
  } catch (error) {
    console.error("Error deleting folder from Cloudinary:", error);
    throw error;
  }
}
/**
 * Delete all resources in a folder before deleting the folder
 */
export async function deleteFolderContents(folderPath: string): Promise<void> {
  try {
    // First, list all resources in the folder
    const resources = await cloudinary.api.resources({
      type: "upload",
      prefix: folderPath,
      max_results: 100,
    });

    // Delete each resource individually
    if (resources.resources && resources.resources.length > 0) {
      const publicIds = resources.resources.map((resource: { public_id: string }) => resource.public_id);

      // Delete in batches to avoid rate limits
      for (let i = 0; i < publicIds.length; i += 100) {
        const batch = publicIds.slice(i, i + 100);
        await cloudinary.api.delete_resources(batch);
      }
    }

    // Now try to delete the empty folder
    await cloudinary.api.delete_folder(folderPath);
  } catch (error) {
    console.error("Error deleting folder contents:", error);
    throw error;
  }
}

export default cloudinary;
