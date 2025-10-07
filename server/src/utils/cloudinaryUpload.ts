// src/utils/cloudinaryUpload.ts
import cloudinary from "../config/cloudinary";
import streamifier from "streamifier";

export const uploadBufferToCloudinary = (
  buffer: Buffer,
  folder = "Quiz/questions"
) =>
  new Promise<any>((resolve, reject) => {
    const uploadStream = cloudinary.uploader.upload_stream(
      { folder, resource_type: "auto" }, // resource_type: "auto" handles images/videos/raw
      (error, result) => {
        if (error) return reject(error);
        resolve(result);
      }
    );
    streamifier.createReadStream(buffer).pipe(uploadStream);
  });
