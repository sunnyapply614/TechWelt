const path = require('path');
module.exports = () => {
  const uploadFile = (req, res) => {
    if (!req.file) {

    }
  
    const filePath = req.file.path;
  
    res.send({ filePath });
  }
  return { uploadFile }
}

