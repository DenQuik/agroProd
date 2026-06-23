import multer, { FileFilterCallback } from 'multer';
import { Request } from 'express';
import { AppError } from '../errors/app.error.js';
import { HTTP_STATUS } from '../constants/http-status.constants.js';

const ALLOWED_MIME_TYPES = new Set(['image/jpeg', 'image/png', 'image/webp']);

const fileFilter = (
  _req: Request,
  file: Express.Multer.File,
  cb: FileFilterCallback,
): void => {
  if (ALLOWED_MIME_TYPES.has(file.mimetype)) {
    cb(null, true);
  } else {
    cb(
      new AppError(
        HTTP_STATUS.BAD_REQUEST,
        `Tipo de archivo no permitido: ${file.mimetype}. Se aceptan: JPEG, PNG, WebP`,
      ),
    );
  }
};

const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 5 * 1024 * 1024 },
  fileFilter,
});

export const uploadSingle = upload.single('imagen');
