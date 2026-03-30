const express = require('express');
const multer  = require('multer');
const path    = require('path');
const { protect, adminOnly } = require('../middleware/auth');
const router  = express.Router();

const storage = multer.diskStorage({
  destination: path.join(__dirname, '../../assets/uploads'),
  filename: (req, file, cb) => {
    const ext  = path.extname(file.originalname);
    const name = Date.now() + '-' + Math.round(Math.random() * 1e6) + ext;
    cb(null, name);
  }
});

const upload = multer({
  storage,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB
  fileFilter: (req, file, cb) => {
    if (file.mimetype.startsWith('image/')) cb(null, true);
    else cb(new Error('Only image files allowed'));
  }
});

// POST /api/upload
router.post('/', protect, adminOnly, upload.single('image'), (req, res) => {
  if (!req.file) return res.status(400).json({ message: 'No file uploaded' });
  res.json({ url: `assets/uploads/${req.file.filename}` });
});

module.exports = router;
