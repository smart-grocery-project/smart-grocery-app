import multer from "multer";
import path from "path";
import fs from "fs";

const UPLOAD_DIR = "uploads/";

// Storage config
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    // Ensure the upload directory exists. It is excluded from the Docker image
    // (.dockerignore), so on the deployed server it must be created at runtime;
    // otherwise multer fails with ENOENT and the AI label scan returns 500.
    fs.mkdirSync(UPLOAD_DIR, { recursive: true });
    cb(null, UPLOAD_DIR);
  },
  filename: (req, file, cb) => {
    const uniqueName = Date.now() + path.extname(file.originalname);
    cb(null, uniqueName);
  },
});

// File filter (only images)
const fileFilter = (req, file, cb) => {
  if (file.mimetype.startsWith("image/")) {
    cb(null, true);
  } else {
    cb(new Error("Only image files are allowed"), false);
  }
};

const upload = multer({
  storage,
  fileFilter,
});

export default upload;