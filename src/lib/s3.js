require("dotenv").config()

const uuid = require("uuid")
const aws = require("aws-sdk")
const multer = require("multer")
const multerS3 = require("multer-s3")

const { S3_BUCKET, S3_SECRET_ACCESS_KEY, S3_ACCESS_KEY_ID, S3_REGION } = process.env
aws.config.update({
  secretAccessKey: S3_SECRET_ACCESS_KEY,
  accessKeyId: S3_ACCESS_KEY_ID,
  region: S3_REGION,
})

const s3 = new aws.S3()

const upload = multer({
  storage: multerS3({
    s3: s3,
    bucket: S3_BUCKET,
    key: function (req, file, cb) {
      const fileExt = file.originalname.split(".").pop()
      cb(null, [uuid.v4(), fileExt].join("."))
    },
  }),
})

module.exports = upload;
