const { S3Client } = require("@aws-sdk/client-s3");
const { Upload } = require("@aws-sdk/lib-storage");
const multer = require("multer");
const multerS3 = require("multer-s3");

// AWS S3 Configuration
const s3 = new S3Client({
  region: "ap-south-1",
  credentials: {
    accessKeyId: 'AKIAUGO4KNQULGJQFZIA',
    secretAccessKey: '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'
  }
});

// Multer S3 Storage Configuration
const upload = multer({
  storage: multerS3({
    s3: s3,
    bucket: "xpertnowbucket",
    acl: "public-read",
    contentType: multerS3.AUTO_CONTENT_TYPE,
    key: function (req, file, cb) {
      cb(null,`uploads/${Date.now()}-${file.originalname}`);
    },
  }),
  limits: { fileSize: 100 * 1024 * 1024 },
  fileFilter: function (req, file, cb) {
    const filetypes = /jpeg|jpg|png|webp/;
    const extname = filetypes.test(file.originalname.toLowerCase());
    const mimetype = filetypes.test(file.mimetype);

    if (mimetype && extname) {
      return cb(null, true);
    } else {
      cb(new Error("Only images (jpeg, jpg, png, webp) are allowed!"));
    }
  },
});

module.exports = upload;
