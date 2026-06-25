const fs = require("fs");
const path = require("path");
const multer = require("multer");
const cloudinary = require("../config/cloudinary");

const useCloudinary = () =>
  Boolean(
    process.env.CLOUDINARY_CLOUD_NAME &&
      process.env.CLOUDINARY_API_KEY &&
      process.env.CLOUDINARY_API_SECRET
  );

const fileFilter = (_req, file, cb) => {
  const allowedTypes = ["image/png", "image/jpeg", "image/jpg", "image/webp"];

  if (!allowedTypes.includes(file.mimetype)) {
    return cb(new Error("Only PNG, JPG, JPEG, and WEBP images are allowed"));
  }

  cb(null, true);
};

function getDiskStorage(folder) {
  const uploadDir = path.join(__dirname, "..", "uploads", folder);

  if (!fs.existsSync(uploadDir)) {
    fs.mkdirSync(uploadDir, { recursive: true });
  }

  return multer.diskStorage({
    destination: (_req, _file, cb) => {
      cb(null, uploadDir);
    },
    filename: (_req, file, cb) => {
      const ext = path.extname(file.originalname).toLowerCase();
      cb(null, `${Date.now()}-${Math.round(Math.random() * 1e9)}${ext}`);
    },
  });
}

function uploadBufferToCloudinary(buffer, folder) {
  return new Promise((resolve, reject) => {
    const stream = cloudinary.uploader.upload_stream(
      { folder: `onespot/${folder}`, resource_type: "image" },
      (error, result) => {
        if (error) reject(error);
        else resolve(result);
      }
    );

    stream.end(buffer);
  });
}

function getPublicIdFromUrl(url) {
  const afterUpload = url.split("/upload/")[1];
  if (!afterUpload) return null;

  const withoutVersion = afterUpload.replace(/^v\d+\//, "");
  return withoutVersion.replace(/\.[^.]+$/, "");
}

function createUploadHandler(folder, maxSize = 10 * 1024 * 1024) {
  const storage = useCloudinary()
    ? multer.memoryStorage()
    : getDiskStorage(folder);

  const upload = multer({
    storage,
    fileFilter,
    limits: { fileSize: maxSize },
  });

  return (req, res, next) => {
    upload.single("image")(req, res, async (error) => {
      if (error) {
        return res.status(400).json({
          success: false,
          message: error.message,
        });
      }

      if (!req.file) return next();

      try {
        if (useCloudinary()) {
          const result = await uploadBufferToCloudinary(req.file.buffer, folder);
          req.file.storedPath = result.secure_url;
          req.file.public_id = result.public_id;
        } else {
          req.file.storedPath = `/uploads/${folder}/${req.file.filename}`;
        }

        next();
      } catch (uploadError) {
        res.status(500).json({
          success: false,
          message: uploadError.message || "Image upload failed",
        });
      }
    });
  };
}

function getStoredImagePath(req) {
  return req.file?.storedPath || null;
}

function removeStoredImage(imagePath) {
  if (!imagePath) return;

  if (imagePath.includes("cloudinary.com")) {
    const publicId = getPublicIdFromUrl(imagePath);
    if (publicId) {
      cloudinary.uploader.destroy(publicId).catch(() => {});
    }
    return;
  }

  const normalizedPath = imagePath.replace(/^\/+/, "");
  const fullPath = path.join(__dirname, "..", normalizedPath);
  fs.unlink(fullPath, () => {});
}

module.exports = {
  createUploadHandler,
  getStoredImagePath,
  removeStoredImage,
  useCloudinary,
};
