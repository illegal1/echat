const multer = require('multer');
const path = require('path');

// 1. Configure the file filter for security
const fileFilter = (req, file, cb) => {
  // Regular expression to test for allowed image mimetypes
  const allowedTypes = /jpeg|jpg|png|gif/;
  const isMimetypeAllowed = allowedTypes.test(file.mimetype);
  const isExtensionAllowed = allowedTypes.test(
    path.extname(file.originalname).toLowerCase(),
  );

  if (isMimetypeAllowed && isExtensionAllowed) {
    return cb(null, true);
  } else {
    cb(
      new Error(
        'Error: Only image files (.jpeg, .jpg, .png, .gif) are allowed!',
      ),
      false,
    );
  }
};

// 2. Configure multer storage
const storage = multer.diskStorage({
  destination: './public/uploads/',
  filename: function (req, file, cb) {
    cb(
      null,
      file.fieldname + '-' + Date.now() + path.extname(file.originalname),
    );
  },
});

// 3. Create the final multer middleware instance
const upload = multer({
  storage: storage,
  limits: { fileSize: 10000000 }, // 10MB
  fileFilter: fileFilter,
}).single('chatFile'); // This field name must match your client-side FormData key

// 4. Create the controller function (to be used after the middleware)
const uploadFileController = (req, res) => {
  // The 'upload' middleware already ran. If there was a multer error, this code won't even run.
  // We just need to check if a file exists.
  if (!req.file) {
    return res
      .status(400)
      .json({ message: 'No file was uploaded or the file type was rejected.' });
  }

  // The file has been successfully uploaded. Send back the public URL.
  res.status(200).json({
    message: 'File uploaded successfully!',
    fileUrl: `/uploads/${req.file.filename}`, // The corrected URL
  });
};

// 5. Export both the middleware and the controller
module.exports = {
  upload,
  uploadFileController,
};
