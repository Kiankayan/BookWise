import { Router } from "express";
import multer, { MulterError } from "multer";
import cloudinary from "../config/cloudinary.js";

const router = Router();

const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 5 * 1024 * 1024,
  },
  fileFilter: (_req, file, callback) => {
    const allowedTypes = ["image/jpeg", "image/png", "image/webp"];

    if (allowedTypes.includes(file.mimetype)) {
      callback(null, true);
    } else {
      callback(new Error("Only JPG, PNG and WebP images are allowed."));
    }
  },
});

router.post(
  "/",
  (req, res, next) => {
    upload.single("image")(req, res, (error) => {
      if (error instanceof MulterError) {
        if (error.code === "LIMIT_FILE_SIZE") {
          res.status(413).json({
            message: "Bilden får vara högst 5 MB.",
          });
          return;
        }

        res.status(400).json({
          message: "Det gick inte att läsa den uppladdade bilden.",
        });
        return;
      }

      if (error) {
        res.status(400).json({
          message: "Ogiltigt bildformat. Välj en JPG-, PNG- eller WebP-bild.",
        });
        return;
      }

      next();
    });
  },
  async (req, res) => {
    try {
      if (!req.file) {
        res.status(400).json({
          message: "Ingen bild valdes för uppladdning.",
        });
        return;
      }

      const imageData = `data:${req.file.mimetype};base64,${req.file.buffer.toString("base64")}`;

      const result = await cloudinary.uploader.unsigned_upload(
        imageData,
        "bookwise_unsigned",
        {
          folder: "bookwise",
          resource_type: "image",
        },
      );

      res.status(201).json({
        imageUrl: result.secure_url,
      });
    } catch (error: any) {
      console.error("Cloudinary error details:", error);

      res.status(500).json({
        message: "Bilden kunde inte laddas upp. Försök igen.",
      });
    }
  },
);

export default router;
