// src/middleware/multer.ts
import multer from "multer";

const storage = multer.memoryStorage(); // file.buffer will exist
export const upload = multer({
  storage,
  limits: { fileSize: 100 * 1024 * 1024 }, // e.g. 100MB max - adjust for videos
  fileFilter: (req, file, cb) => {
    // optional: only allow images/videos/files you want
    cb(null, true);
  },
});

// // middleware/upload.ts
// import multer from "multer";
// import path from "path";

// const storage = multer.diskStorage({
//   destination: (req, file, cb) => {
//     cb(null, "uploads/"); // save in uploads folder
//   },
//   filename: (req, file, cb) => {
//     cb(null, Date.now() + path.extname(file.originalname)); // unique name
//   }
// });

// export const upload = multer({ storage });
