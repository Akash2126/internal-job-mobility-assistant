import multer from "multer";
import { Request, Response, NextFunction } from "express";

// Store files in memory buffer for binary parser handling
const storage = multer.memoryStorage();

// Acceptable extensions checklist
const ALLOWED_EXTENSIONS = [".pdf", ".docx", ".txt"];
const ALLOWED_MIME_TYPES = [
  "application/pdf",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
  "text/plain",
];

export const upload = multer({
  storage,
  limits: {
    fileSize: 5 * 1024 * 1024, // Strict 5MB limit
  },
  fileFilter: (req, file, cb) => {
    const mimeMatch = ALLOWED_MIME_TYPES.includes(file.mimetype);
    const lowerFilename = file.originalname.toLowerCase();
    const extMatch = ALLOWED_EXTENSIONS.some((ext) => lowerFilename.endsWith(ext));

    if (mimeMatch || extMatch) {
      cb(null, true);
    } else {
      cb(new Error("Invalid resume format. Only PDF, DOCX, or TXT documents are allowed."));
    }
  },
});

// Middleware for parsing errors and status integration
export function handleUploadErrors(
  error: any,
  req: Request,
  res: Response,
  next: NextFunction
): void {
  if (error instanceof multer.MulterError) {
    if (error.code === "LIMIT_FILE_SIZE") {
      res.status(400).json({
        success: false,
        message: "File is too large. Maximum size allowed is 5MB.",
      });
      return;
    }
    res.status(400).json({ success: false, message: error.message });
    return;
  } else if (error) {
    res.status(400).json({ success: false, message: error.message });
    return;
  }
  next();
}
