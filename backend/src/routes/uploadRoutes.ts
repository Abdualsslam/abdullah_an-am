import { Router, Response } from 'express';
import multer from 'multer';
import path from 'path';
import fs from 'fs';
import { protect, AuthRequest } from '../middleware/auth';

const router = Router();

// Ensure uploads directory exists
const uploadDir = path.join(__dirname, '../../uploads');
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
    cb(null, uniqueSuffix + path.extname(file.originalname));
  }
});

const fileFilter = (req: any, file: any, cb: any) => {
  const allowedTypes = /jpeg|jpg|png|gif|webp|mp4|webm|ogg|mov/i;
  const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
  const mimetype = allowedTypes.test(file.mimetype);

  if (extname && mimetype) {
    cb(null, true);
  } else {
    cb(new Error('Only images and videos are allowed!'));
  }
};

const upload = multer({
  storage,
  fileFilter,
  limits: { fileSize: 50 * 1024 * 1024 } // 50MB limit
});

// Upload single file (e.g. cover image)
router.post('/', protect, upload.single('file'), (req: AuthRequest, res: Response) => {
  if (!req.file) {
    return res.status(400).json({ message: 'Please upload a file' });
  }

  const fileUrl = `/uploads/${req.file.filename}`;
  res.status(201).json({
    url: fileUrl,
    filename: req.file.filename,
    mimetype: req.file.mimetype
  });
});

// Upload multiple files
router.post('/multiple', protect, upload.array('files', 10), (req: AuthRequest, res: Response) => {
  const files = req.files as Express.Multer.File[];
  if (!files || files.length === 0) {
    return res.status(400).json({ message: 'Please upload files' });
  }

  const urls = files.map(file => `/uploads/${file.filename}`);
  res.status(201).json({ urls });
});

// Delete an uploaded file
router.delete('/:filename', protect, (req: AuthRequest, res: Response) => {
  const { filename } = req.params;
  const filePath = path.join(uploadDir, filename);

  // Prevent path traversal
  if (path.dirname(filePath) !== uploadDir) {
    return res.status(400).json({ message: 'Invalid file path' });
  }

  fs.unlink(filePath, (err) => {
    if (err) {
      return res.status(404).json({ message: 'File not found or could not be deleted' });
    }
    res.json({ message: 'File deleted successfully' });
  });
});

export default router;
