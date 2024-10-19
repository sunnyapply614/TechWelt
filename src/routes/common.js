const path = require('path');
const multer = require('multer');

module.exports = (router) => {
  const common = require("../controllers/common");
  const { uploadFile } = common();

  const storage = multer.diskStorage({
    destination: (req, file, cb) => {
      cb(null, 'uploads/avatars');
    },
    filename: (req, file, cb) => {
      console.log("*************************");
      cb(null, file.fieldname + '-' + Date.now() + path.extname(file.originalname));
    },
  });
  
  const fileFilter = (req, file, cb) => {
    if (!file.mimetype.startsWith('image/')) {
      return cb(new Error('Only image files are allowed.'));
    }
    cb(null, true);
  };



  return router
}
