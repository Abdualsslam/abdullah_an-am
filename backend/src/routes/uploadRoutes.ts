import { Router, Response } from 'express';
import multer from 'multer';
import multerS3 from 'multer-s3';
import { S3Client, DeleteObjectCommand } from '@aws-sdk/client-s3';
import path from 'path';
import { protect, AuthRequest } from '../middleware/auth';

const router = Router();

const s3 = new S3Client({
  region: process.env.R2_REGION || 'auto',
  endpoint: process.env.R2_ENDPOINT,
  credentials: {
    accessKeyId: process.env.R2_ACCESS_KEY_ID || '',
    secretAccessKey: process.env.R2_SECRET_ACCESS_KEY || '',
  },
});

const bucketName = process.env.R2_BUCKET_NAME || '';

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
  storage: multerS3({
    s3: s3,
    bucket: bucketName,
    contentType: multerS3.AUTO_CONTENT_TYPE,
    key: function (req, file, cb) {
      const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
      cb(null, 'uploads/' + uniqueSuffix + path.extname(file.originalname));
    }
  }),
  fileFilter,
  limits: { fileSize: 50 * 1024 * 1024 } // 50MB limit
});

const getPublicUrl = (key: string) => {
  const publicUrl = process.env.R2_PUBLIC_URL;
  if (publicUrl) {
    // If public URL is provided, format it
    return `${publicUrl.replace(/\/$/, '')}/${key}`;
  }
  // Fallback to constructing it (R2 might require custom domain for public access)
  return `${process.env.R2_ENDPOINT}/${bucketName}/${key}`;
}

// Upload single file (e.g. cover image)
router.post('/', protect, upload.single('file'), (req: AuthRequest, res: Response) => {
  if (!req.file) {
    return res.status(400).json({ message: 'Please upload a file' });
  }

  const file = req.file as any; // Cast for multer-s3 file type
  
  res.status(201).json({
    url: getPublicUrl(file.key),
    filename: file.key,
    mimetype: file.mimetype
  });
});

// Upload multiple files
router.post('/multiple', protect, upload.array('files', 10), (req: AuthRequest, res: Response) => {
  const files = req.files as any[]; // Cast for multer-s3 files
  if (!files || files.length === 0) {
    return res.status(400).json({ message: 'Please upload files' });
  }

  const urls = files.map(file => getPublicUrl(file.key));
  res.status(201).json({ urls });
});

// Delete an uploaded file
router.delete('/:filename', protect, async (req: AuthRequest, res: Response) => {
  let { filename } = req.params;
  
  // filename might be passed as url-encoded uploads/filename or just filename.
  // We prefixed keys with 'uploads/' during upload.
  const key = filename.startsWith('uploads/') ? filename : `uploads/${filename}`;

  try {
    const command = new DeleteObjectCommand({
      Bucket: bucketName,
      Key: key,
    });
    
    await s3.send(command);
    res.json({ message: 'File deleted successfully' });
  } catch (error) {
    console.error('Error deleting file:', error);
    res.status(500).json({ message: 'Error deleting file from storage' });
  }
});

export default router;
