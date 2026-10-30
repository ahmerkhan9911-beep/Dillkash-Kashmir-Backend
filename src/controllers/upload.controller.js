import multer from "multer";
import { v2 as cloudinary } from "cloudinary";
import { CloudinaryStorage } from "multer-storage-cloudinary";

/* ------------------------------------------------------------------ *
 * Cloudinary Configuration                                             *
 *                                                                      *
 * Reads credentials from environment variables:                        *
 *   CLOUDINARY_CLOUD_NAME, CLOUDINARY_API_KEY, CLOUDINARY_API_SECRET  *
 * ------------------------------------------------------------------ */

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

/* ------------------------------------------------------------------ *
 * Allowed MIME types                                                   *
 *                                                                      *
 * Images : JPEG, PNG, WebP, HEIC/HEIF (iPhone native format)          *
 * Videos : MP4, QuickTime (.mov), WebM — short clips only             *
 *                                                                      *
 * Note: We do NOT block by MIME type in the fileFilter because:        *
 *   1. HEIC files often arrive with mimetype 'application/octet-stream'*
 *      on some OS/browser combos — Cloudinary handles conversion.      *
 *   2. Cloudinary's resource_type:"auto" correctly identifies both.    *
 *   Instead, we only block by extension to give a sensible error.      *
 * ------------------------------------------------------------------ */

const ALLOWED_EXTENSIONS = new Set([
  // Images
  "jpg", "jpeg", "png", "webp", "gif",
  // iPhone native
  "heic", "heif",
  // Videos (short clips)
  "mp4", "mov", "webm",
]);

const MAX_IMAGE_BYTES = 15 * 1024 * 1024;  // 15 MB for images/HEIC
const MAX_VIDEO_BYTES = 20 * 1024 * 1024;  // 20 MB for short video clips (~1 min)

function getExtension(filename) {
  return filename.split(".").pop()?.toLowerCase() ?? "";
}

function isVideoExtension(ext) {
  return ["mp4", "mov", "webm"].includes(ext);
}

/* ------------------------------------------------------------------ *
 * Multer Storage — Cloudinary                                          *
 *                                                                      *
 * resource_type: "auto"  → Cloudinary auto-detects image vs. video    *
 * format: ""             → Keep original format; Cloudinary will serve *
 *                          HEIC images as JPEG/WebP via transformations*
 * ------------------------------------------------------------------ */

const storage = new CloudinaryStorage({
  cloudinary,
  params: async (_req, file) => {
    const ext = getExtension(file.originalname);
    const isVideo = isVideoExtension(ext);

    return {
      folder: isVideo ? "dillkash/videos" : "dillkash/images",
      resource_type: "auto",  // critical: lets Cloudinary handle images & videos natively
      // Cloudinary auto-converts HEIC to a web-friendly format on delivery
      allowed_formats: ["jpg", "jpeg", "png", "webp", "heic", "heif", "gif", "mp4", "mov", "webm"],
    };
  },
});

/* ------------------------------------------------------------------ *
 * File filter — only block completely unsupported file extensions      *
 * ------------------------------------------------------------------ */

function fileFilter(_req, file, cb) {
  const ext = getExtension(file.originalname);
  if (!ALLOWED_EXTENSIONS.has(ext)) {
    return cb(
      new Error(
        `Unsupported file type ".${ext}". Allowed: JPG, PNG, WebP, HEIC/HEIF, MP4, MOV, WebM.`
      ),
      false
    );
  }
  cb(null, true);
}

/* ------------------------------------------------------------------ *
 * Dynamic file-size limit per file type                               *
 * ------------------------------------------------------------------ */

export const upload = multer({
  storage,
  fileFilter,
  limits: { fileSize: MAX_VIDEO_BYTES }, // use the larger cap; images are validated below
});

/* ------------------------------------------------------------------ *
 * POST /api/upload                                                     *
 *                                                                      *
 * Returns: { url: "https://res.cloudinary.com/…", resourceType: "image"|"video" }
 * ------------------------------------------------------------------ */

export async function uploadMedia(req, res) {
  if (!req.file) {
    return res.status(400).json({ error: "No file was uploaded." });
  }

  const ext = getExtension(req.file.originalname);
  const isVideo = isVideoExtension(ext);

  // Secondary size check for images (videos already constrained by multer limit)
  if (!isVideo && req.file.size > MAX_IMAGE_BYTES) {
    // Clean up the already-uploaded file from Cloudinary
    const publicId = req.file.filename; // CloudinaryStorage sets filename to public_id
    try {
      await cloudinary.uploader.destroy(publicId, { resource_type: "image" });
    } catch (_) { /* ignore */ }
    return res.status(400).json({ error: "Image must be smaller than 15 MB." });
  }

  // Cloudinary provides the secure URL via req.file.path
  const url = req.file.path;
  const resourceType = isVideo ? "video" : "image";

  return res.status(201).json({ url, resourceType });
}
