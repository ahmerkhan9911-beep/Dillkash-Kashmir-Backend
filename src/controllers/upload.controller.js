import multer from "multer";
import path from "path";
import { fileURLToPath } from "url";
import { v4 as uuidv4 } from "uuid";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

/* ------------------------------------------------------------------ *
 * Storage configuration                                                *
 *                                                                      *
 * Images are stored in  server/public/uploads/  and served as static  *
 * files via Express.  The returned URL is  /uploads/<filename> .       *
 *                                                                      *
 * To switch to Cloudinary later:                                       *
 *   1. npm install multer-storage-cloudinary cloudinary               *
 *   2. Configure CloudinaryStorage here                               *
 *   3. Remove the `diskStorage` block and the `express.static` call   *
 *      in index.js                                                     *
 * ------------------------------------------------------------------ */

const ALLOWED_MIME_TYPES = ["image/jpeg", "image/jpg", "image/png", "image/webp"];
const MAX_SIZE_BYTES = 5 * 1024 * 1024; // 5 MB

const storage = multer.diskStorage({
  destination(_req, _file, cb) {
    const uploadsDir = path.join(__dirname, "../../public/uploads");
    cb(null, uploadsDir);
  },
  filename(_req, file, cb) {
    const ext = path.extname(file.originalname).toLowerCase();
    cb(null, `${uuidv4()}${ext}`);
  },
});

function fileFilter(_req, file, cb) {
  if (ALLOWED_MIME_TYPES.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error("Only JPG, PNG, and WebP images are allowed"), false);
  }
}

export const upload = multer({
  storage,
  fileFilter,
  limits: { fileSize: MAX_SIZE_BYTES },
});

/** POST /api/upload */
export async function uploadImage(req, res) {
  // multer has already written the file to disk at this point
  if (!req.file) {
    return res.status(400).json({ error: "No file was uploaded" });
  }

  const url = `/uploads/${req.file.filename}`;
  return res.status(201).json({ url });
}
