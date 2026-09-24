import multer from 'multer';

import { AppError } from '../domain/errors.js';

const allowedMimeTypes = new Set([
  'application/pdf',
  'application/msword',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  'image/jpeg',
  'image/png',
  'text/plain',
]);

export const requirementUpload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 10 * 1024 * 1024, files: 1 },
  fileFilter: (_request, file, callback) => {
    if (!allowedMimeTypes.has(file.mimetype)) {
      callback(
        new AppError(
          400,
          'ATTACHMENT_TYPE_INVALID',
          'Attachments must be PDF, Word, text, PNG, or JPEG files.',
        ),
      );
      return;
    }
    callback(null, true);
  },
});
